"""Offline contacts command tests; the validator is a separate SDK boundary."""
import importlib.util
from datetime import datetime
from pathlib import Path
from types import SimpleNamespace

import pytest

ORG = "616d839b-e107-4511-b12f-fd6ed301d999"
ID = "1597fb11-31a3-4858-861e-e804b6191538"
ACTOR = {"id": "standard-admin"}


class Query:
    def __init__(self, db, table):
        self.db, self.table, self.filters, self.row = db, table, {}, None

    def filter(self, key, operator, value):
        assert operator == "eq"
        self.filters[key] = value
        return self

    def page_size(self, size):
        assert size == 1
        return self

    def create(self, row):
        self.row = row
        return self

    def execute(self):
        if self.row is not None:
            self.db.writes.append((self.table, dict(self.row)))
            if self.db.fail_before:
                raise RuntimeError("private write error")
            self.db.rows.setdefault(self.table, []).append(dict(self.row))
            if self.db.fail_after:
                raise RuntimeError("private timeout")
        if self.table in self.db.denied:
            raise PermissionError("private denial")
        return {"data": [dict(r) for r in self.db.rows.get(self.table, [])
                         if all(r.get(k) == v for k, v in self.filters.items())][:1]}


@pytest.fixture(params=["customers", "suppliers"])
def resource(request):
    return request.param


@pytest.fixture
def sdk():
    db = SimpleNamespace(rows={"organizations": [{"id": ORG}]}, writes=[], denied=set(),
                         fail_before=False, fail_after=False)
    db.from_ = lambda table: Query(db, table)
    def update(table, record_id, data):
        db.writes.append((table, dict(data)))
        if db.fail_before:
            raise RuntimeError("private write error")
        for row in db.rows.get(table, []):
            if row["id"] == record_id:
                row.update(data)
        if db.fail_after:
            raise RuntimeError("private timeout")
    db.update = update
    policy = SimpleNamespace(calls=[], deny_action=None, malformed=False)
    def check_resources(resources, principal):
        assert principal is None
        policy.calls.append(resources[0])
        action = resources[0]["actions"][0]
        return {} if policy.malformed else {"results": [{"actions": {action:
            "EFFECT_DENY" if policy.deny_action == action else "EFFECT_ALLOW"}}]}
    policy.check_resources = check_resources
    functions = SimpleNamespace(calls=[], fail=False)
    def execute(name, params, is_async):
        assert name == "validate-contacts-profile-v1" and is_async is False
        functions.calls.append(params)
        if functions.fail:
            raise RuntimeError("private validator failure")
        # Native API function execution injects all three opaque metadata keys.
        return {"data": validator({**params, "__function__": {"slug": name},
                                   "request": {"method": "POST"}, "__method__": "POST"})}
    functions.execute = execute
    return SimpleNamespace(database=db, policy=policy, functions=functions)


def payload(resource, action="create", values=None):
    result = {"resource": resource, "action": action, "organization_id": ORG, "request_id": ID}
    if action in ("create", "update"):
        result["values"] = values if values is not None else {"name": "  Contact  ", "currency": "inr", "is_active": True}
    return result


def invoke(sdk, params, actor=ACTOR):
    path = Path(__file__).parents[1] / "functions" / "contact_master.py"
    if not path.exists():
        return {"ok": False, "code": "NOT_IMPLEMENTED"}
    spec = importlib.util.spec_from_file_location("contact_master", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.main(params, actor, sdk)


def validator(params):
    path = Path(__file__).parents[1] / "functions" / "contact_validation.py"
    spec = importlib.util.spec_from_file_location("contact_validation", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.main(params, ACTOR, None)


@pytest.mark.parametrize("rating,valid", [(0, True), (5, True), (6, False), (-1, False), (True, False)])
def test_existing_validator_rating_storage_contract(rating, valid):
    assert validator({"resource": "suppliers", "values": {"name": "Contact", "rating": rating}})["valid"] is valid


def test_validator_accepts_native_runtime_metadata_without_trusting_or_echoing_it():
    result = validator({"resource": "customers", "values": {"name": "Contact", "credit_limit": "0.00"},
                        "__function__": {"roles": ["Admin"]}, "request": {"user_id": "untrusted"},
                        "__method__": {"opaque": "ignored"}})
    assert result["valid"] is True
    assert result["values"] == {"name": "Contact", "credit_limit": "0.00"}
    assert not {"request", "__function__", "__method__"}.intersection(result)


@pytest.mark.parametrize("field", ["roles", "user_id", "principal", "organization_id"])
def test_validator_still_rejects_non_runtime_top_level_fields(field):
    assert validator({"resource": "customers", "values": {"name": "Contact"}, field: "untrusted"})["valid"] is False


def test_create_normalizes_and_replay_does_not_duplicate(sdk, resource):
    result = invoke(sdk, payload(resource))
    assert result["ok"] is True and result["verified"] is True
    assert result["record"]["name"] == "Contact"
    assert result["record"]["currency"] == "INR"
    assert invoke(sdk, payload(resource))["replayed"] is True
    assert len(sdk.database.writes) == 1
    assert sdk.functions.calls


def test_update_changes_metadata_only_and_checks_actual_proposed(sdk, resource):
    assert invoke(sdk, payload(resource))["ok"]
    sdk.database.rows[resource][0]["metadata"] = {"history": "retained"}
    sdk.database.writes.clear()
    result = invoke(sdk, payload(resource, "update", {"name": "New"}))
    assert result["record"]["name"] == "New"
    assert set(sdk.database.writes[0][1]) == {"name", "updated_at"}
    assert sdk.database.rows[resource][0]["metadata"] == {"history": "retained"}
    checks = [c for c in sdk.policy.calls if c["actions"] == ["update"]]
    assert [c["resource"]["attr"]["name"] for c in checks] == ["Contact", "New"]


def test_logical_delete_retains_record_and_rejects_readback(sdk, resource):
    assert invoke(sdk, payload(resource))["ok"]
    sdk.database.writes.clear()
    result = invoke(sdk, payload(resource, "delete"))
    assert result == {"ok": True, "verified": True, "deleted": True, "id": ID}
    assert sdk.database.rows[resource][0]["is_active"] is False
    assert sdk.database.rows[resource][0]["deleted_at"]
    assert invoke(sdk, payload(resource, "readback"))["code"] == "NOT_FOUND"
    assert invoke(sdk, payload(resource, "delete"))["deleted"] is True
    assert len(sdk.database.writes) == 1


@pytest.mark.parametrize("field", ["id", "organization_id", "metadata", "deleted_at", "created_at", "roles"])
def test_protected_values_never_write(sdk, resource, field):
    assert invoke(sdk, payload(resource, values={"name": "Contact", field: ORG}))["code"] == "VALIDATION_ERROR"
    assert not sdk.database.writes


@pytest.mark.parametrize("actor", [None, {}, [], "admin"])
def test_requires_injected_authenticated_context(sdk, resource, actor):
    assert invoke(sdk, payload(resource), actor)["code"] == "UNAUTHENTICATED"
    assert not sdk.database.writes


@pytest.mark.parametrize("field,value", [("currency", "US"), ("currency", "123"), ("is_active", None),
    ("credit_limit", "-1"), ("credit_limit", True), ("credit_limit", "1e1000000000")])
def test_customer_storage_validation_fails_closed(sdk, field, value):
    values = {"name": "Contact", field: value}
    assert invoke(sdk, payload("customers", values=values))["code"] == "VALIDATION_ERROR"
    assert not sdk.database.writes


@pytest.mark.parametrize("rating", [0, 1, 5, "0", "5"])
def test_supplier_rating_normalizes_integer(sdk, rating):
    result = invoke(sdk, payload("suppliers", values={"name": "Contact", "rating": rating}))
    assert result["record"]["rating"] == int(rating)


@pytest.mark.parametrize("rating", [-1, 6, True, 1.5, "1.5"])
def test_invalid_supplier_rating_never_writes(sdk, rating):
    assert invoke(sdk, payload("suppliers", values={"name": "Contact", "rating": rating}))["code"] == "VALIDATION_ERROR"
    assert not sdk.database.writes


def test_credit_readback_normalizes_numeric_storage(sdk):
    sdk.database.rows["customers"] = [{"id": ID, "organization_id": ORG, "name": "Saved", "credit_limit": 12.5}]
    assert invoke(sdk, payload("customers", "readback"))["record"]["credit_limit"] == "12.5"


@pytest.mark.parametrize("action", ["create", "update", "delete"])
def test_policy_denial_never_mutates(sdk, resource, action):
    if action != "create":
        assert invoke(sdk, payload(resource))["ok"]
        sdk.database.writes.clear()
    sdk.policy.deny_action = action
    assert invoke(sdk, payload(resource, action))["code"] == "FORBIDDEN"
    assert not sdk.database.writes


def test_validator_unavailable_fails_closed(sdk, resource):
    sdk.functions.fail = True
    assert invoke(sdk, payload(resource))["code"] == "VALIDATION_UNAVAILABLE"
    assert not sdk.database.writes


@pytest.mark.parametrize("action", ["create", "update", "delete"])
@pytest.mark.parametrize("committed", [False, True])
def test_ambiguous_write_reconciles_without_retry(sdk, resource, action, committed):
    if action != "create":
        assert invoke(sdk, payload(resource))["ok"]
        sdk.database.writes.clear()
    sdk.database.fail_before, sdk.database.fail_after = not committed, committed
    result = invoke(sdk, payload(resource, action, {"name": "Changed"}))
    assert len(sdk.database.writes) == 1
    assert result["ok"] is committed
    if not committed:
        assert result["code"] == "WRITE_UNCONFIRMED"


@pytest.mark.parametrize("change", [{"resource": "payments"}, {"roles": ["Admin"]}, {"user_data": ACTOR}, {"principal": ACTOR}])
def test_no_resource_or_identity_injection(sdk, resource, change):
    assert invoke(sdk, {**payload(resource), **change})["code"] == "VALIDATION_ERROR"
    assert not sdk.database.writes


def test_organization_read_denial_never_writes(sdk, resource):
    sdk.database.denied.add("organizations")
    assert invoke(sdk, payload(resource))["code"] == "FORBIDDEN"
    assert not sdk.database.writes


def test_malformed_policy_never_writes(sdk, resource):
    sdk.policy.malformed = True
    assert invoke(sdk, payload(resource))["code"] == "FORBIDDEN"
    assert not sdk.database.writes


def test_duplicate_code_never_writes(sdk, resource):
    sdk.database.rows[resource] = [{"id": "other", "organization_id": ORG, "code": "EXISTING"}]
    assert invoke(sdk, payload(resource, values={"name": "Contact", "code": "EXISTING"}))["code"] == "DUPLICATE_CODE"
    assert not sdk.database.writes


@pytest.mark.parametrize("action", ["update", "delete"])
@pytest.mark.parametrize("hidden", [False, True])
def test_readback_denied_or_hidden_cannot_confirm_mutation(sdk, resource, action, hidden):
    assert invoke(sdk, payload(resource))["ok"]
    sdk.database.writes.clear()
    original = sdk.database.update
    def update_then_hide(*args, **kwargs):
        original(*args, **kwargs)
        if hidden:
            sdk.database.rows[resource] = []
        else:
            sdk.database.denied.add(resource)
    sdk.database.update = update_then_hide
    result = invoke(sdk, payload(resource, action, {"name": "New"}))
    assert result["code"] == "READBACK_FAILED"
    assert not result.get("deleted")
    assert "record" not in result
    assert len(sdk.database.writes) == 1


def test_customer_update_accepts_numeric_storage_without_erasing_other_fields(sdk):
    assert invoke(sdk, payload("customers", values={"name": "Contact", "credit_limit": "12.50"}))["ok"]
    sdk.database.rows["customers"][0]["credit_limit"] = 12.5
    sdk.database.writes.clear()
    result = invoke(sdk, payload("customers", "update", {"phone": "123"}))
    assert result["record"]["credit_limit"] == "12.5"
    assert "credit_limit" not in sdk.database.writes[0][1]


def test_contact_delete_accepts_verified_native_utc_naive_timestamp(sdk, resource):
    assert invoke(sdk, payload(resource))["ok"]
    sdk.database.writes.clear()
    original = sdk.database.update
    def update_native_timestamp(*args, **kwargs):
        original(*args, **kwargs)
        row = sdk.database.rows[resource][0]
        row["deleted_at"] = datetime.fromisoformat(row["deleted_at"]).replace(tzinfo=None).isoformat(timespec="microseconds")
    sdk.database.update = update_native_timestamp
    assert invoke(sdk, payload(resource, "delete"))["deleted"] is True
    assert len(sdk.database.writes) == 1
