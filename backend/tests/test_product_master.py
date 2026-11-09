"""Offline product-master command tests; never mutate the live Taruvi app."""
import importlib.util
from datetime import datetime
from pathlib import Path
from types import SimpleNamespace

import pytest

ORG = "616d839b-e107-4511-b12f-fd6ed301d999"
PRODUCT = "1597fb11-31a3-4858-861e-e804b6191538"
CATEGORY = "5157fb11-31a3-4858-861e-e804b6191538"
LOCATION = "6157fb11-31a3-4858-861e-e804b6191538"
ACTOR = {"id": "pradeep", "organization_id": ORG}
NATIVE_ACTORS = [{"id": "standard-admin"}, {"id": "standard-admin", "organization_id": PRODUCT}]


class Query:
    def __init__(self, db, table):
        self.db, self.table, self.filters, self.new = db, table, [], None

    def filter(self, field, op, value):
        assert op == "eq"
        self.filters.append((field, value))
        return self

    def page_size(self, value):
        assert value == 1
        return self

    def create(self, value):
        self.new = value
        return self

    def execute(self):
        if self.new is not None:
            self.db.writes.append((self.table, dict(self.new)))
            if self.db.fail_before_write:
                raise RuntimeError("private database failure")
            self.db.rows.setdefault(self.table, []).append(dict(self.new))
            if self.db.fail_after_write:
                raise RuntimeError("private transport failure")
            return {"data": [self.new]}
        self.db.reads.append((self.table, dict(self.filters)))
        if self.table in self.db.denied_reads:
            raise PermissionError("private read denial")
        rows = self.db.rows.get(self.table, [])
        matched = [dict(row) for row in rows if all(row.get(key) == value for key, value in self.filters)]
        return {"data": matched[:1], "total": len(matched)}


@pytest.fixture
def sdk():
    db = SimpleNamespace(rows={"organizations": [{"id": ORG}],
                               "product_categories": [{"id": CATEGORY, "organization_id": ORG}],
                               "product_locations": [{"id": LOCATION, "organization_id": ORG}]},
                         writes=[], reads=[], denied_reads=set(), fail_before_write=False, fail_after_write=False)
    db.from_ = lambda table: Query(db, table)
    def update(table, record_id, data):
        db.writes.append((table, dict(data)))
        if db.fail_before_write:
            raise RuntimeError("private update failure")
        for row in db.rows.get(table, []):
            if row.get("id") == record_id:
                row.update(data)
        if db.fail_after_write:
            raise RuntimeError("private update timeout")
        return {"data": data}
    db.update = update
    policy = SimpleNamespace(deny=False, calls=[])
    def check_resources(resources, principal):
        policy.calls.append(resources)
        assert principal is None
        assert resources[0]["resource"]["kind"] == "datatable:products"
        return {"results": [{"actions": {resources[0]["actions"][0]: "EFFECT_DENY" if policy.deny else "EFFECT_ALLOW"}}]}
    policy.check_resources = check_resources
    return SimpleNamespace(database=db, policy=policy)


def invoke(sdk, params, user=None):
    path = Path(__file__).parents[1] / "functions" / "product_master.py"
    if not path.exists():
        return {}
    spec = importlib.util.spec_from_file_location("product_master", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.main(params, user, sdk)


def request(**changes):
    return {"action": "create", "organization_id": ORG, "request_id": PRODUCT,
            "values": {"name": "Absolute Black slab", "sku": "HMG-ABS-001",
                       "price": "250.00", "currency": "INR", "stock": 0,
                       "min_stock": 4, "category_id": CATEGORY, "location_id": LOCATION,
                       "type": "standard", "tracking_type": "none"}, **changes}


def test_anonymous_and_forged_authority_are_rejected(sdk):
    assert invoke(sdk, request()).get("code") == "UNAUTHENTICATED"
    assert invoke(sdk, request(user_id="other"), ACTOR).get("code") == "VALIDATION_ERROR"
    assert not sdk.database.writes


@pytest.mark.parametrize("actor", [None, {}, [], "admin"])
def test_missing_or_malformed_authenticated_context_never_writes(sdk, actor):
    assert invoke(sdk, request(), actor).get("code") == "UNAUTHENTICATED"
    assert not sdk.policy.calls
    assert not sdk.database.writes


@pytest.mark.parametrize("field", ["roles", "principal", "user_data", "user_id", "username"])
def test_request_cannot_supply_identity_or_authority(sdk, field):
    assert invoke(sdk, request(**{field: "admin"}), NATIVE_ACTORS[0]).get("code") == "VALIDATION_ERROR"
    assert not sdk.policy.calls
    assert not sdk.database.writes


@pytest.mark.parametrize("change", [
    {"values": {"name": "X", "sku": "X", "price": "1", "stock": 5}},
    {"values": {"name": "X", "sku": "X", "price": "1", "variants": []}},
    {"values": {"name": "X", "sku": "X", "price": "1", "organization_id": ORG}},
    {"values": {"name": "X", "sku": "X", "price": "-1"}},
    {"values": {"name": "X", "sku": "X", "price": "nan"}},
    {"values": {"name": "", "sku": "X", "price": "1"}},
])
def test_unsafe_or_invalid_product_never_writes(sdk, change):
    assert invoke(sdk, request(**change), ACTOR).get("ok") is not True
    assert not sdk.database.writes


def test_foreign_organization_and_foreign_fk_fail_closed(sdk):
    assert invoke(sdk, request(organization_id=PRODUCT), ACTOR).get("code") == "FORBIDDEN"
    bad = request()
    bad["values"]["category_id"] = PRODUCT
    assert invoke(sdk, bad, ACTOR).get("code") == "FORBIDDEN"
    assert not sdk.database.writes


@pytest.mark.parametrize("actor", NATIVE_ACTORS)
def test_native_policy_authorized_actor_can_create_without_matching_legacy_org(sdk, actor):
    result = invoke(sdk, request(), actor)
    assert result["ok"] is True
    assert result["record"]["organization_id"] == ORG
    assert len(sdk.database.writes) == 1
    assert sdk.policy.calls[0][0]["resource"]["attr"]["organization_id"] == ORG
    assert ("organizations", {"id": ORG}) in sdk.database.reads
    assert ("products", {"organization_id": ORG, "id": PRODUCT}) in sdk.database.reads


@pytest.mark.parametrize("actor", NATIVE_ACTORS)
def test_policy_deny_without_legacy_org_binding_never_writes(sdk, actor):
    sdk.policy.deny = True
    assert invoke(sdk, request(), actor).get("code") == "FORBIDDEN"
    assert len(sdk.policy.calls) == 1
    assert not sdk.database.reads
    assert not sdk.database.writes


@pytest.mark.parametrize("actor", NATIVE_ACTORS)
@pytest.mark.parametrize("decision", [None, {}, {"results": []}, {"results": [{}]},
    {"results": [{"actions": {"create": True}}]},
    {"results": [{"actions": {"create": "ALLOW"}}]}])
def test_malformed_policy_decision_never_writes(sdk, actor, decision):
    sdk.policy.check_resources = lambda **kwargs: decision
    assert invoke(sdk, request(), actor).get("code") == "FORBIDDEN"
    assert not sdk.database.writes


@pytest.mark.parametrize("actor", NATIVE_ACTORS)
def test_policy_error_never_writes(sdk, actor):
    def unavailable(**kwargs):
        raise RuntimeError("private policy failure")
    sdk.policy.check_resources = unavailable
    assert invoke(sdk, request(), actor).get("code") == "FORBIDDEN"
    assert not sdk.database.writes


@pytest.mark.parametrize("actor", NATIVE_ACTORS)
@pytest.mark.parametrize("denied", [False, True])
def test_policy_allow_still_requires_target_organization_read(sdk, actor, denied):
    if denied:
        sdk.database.denied_reads.add("organizations")
    else:
        sdk.database.rows["organizations"] = []
    assert invoke(sdk, request(), actor).get("code") == "FORBIDDEN"
    assert len(sdk.policy.calls) == 1
    assert not sdk.database.writes


@pytest.mark.parametrize("actor", NATIVE_ACTORS)
@pytest.mark.parametrize("table", ["product_categories", "product_locations"])
def test_policy_allow_does_not_allow_foreign_organization_fk(sdk, actor, table):
    sdk.database.rows[table][0]["organization_id"] = PRODUCT
    assert invoke(sdk, request(), actor).get("code") == "FORBIDDEN"
    assert len(sdk.policy.calls) == 1
    assert not sdk.database.writes


@pytest.mark.parametrize("actor", NATIVE_ACTORS)
@pytest.mark.parametrize("denial", ["policy", "organizations", "products"])
def test_readback_denial_never_returns_record_or_writes(sdk, actor, denial):
    sdk.database.rows["products"] = [{"id": PRODUCT, "organization_id": ORG, "name": "Private"}]
    if denial == "policy":
        sdk.policy.deny = True
    else:
        sdk.database.denied_reads.add(denial)
    result = invoke(sdk, {"action": "readback", "organization_id": ORG, "request_id": PRODUCT}, actor)
    assert result.get("code") == "FORBIDDEN"
    assert "record" not in result
    assert len(sdk.policy.calls) == 1
    assert not sdk.database.writes


@pytest.mark.parametrize("actor", NATIVE_ACTORS)
def test_readback_allowed_without_matching_legacy_org(sdk, actor):
    sdk.database.rows["products"] = [{"id": PRODUCT, "organization_id": ORG, "name": "Saved"}]
    result = invoke(sdk, {"action": "readback", "organization_id": ORG, "request_id": PRODUCT}, actor)
    assert result["ok"] is True
    assert result["record"]["name"] == "Saved"
    assert sdk.policy.calls[0][0]["actions"] == ["read"]
    assert sdk.database.reads == [("organizations", {"id": ORG}),
                                  ("products", {"organization_id": ORG, "id": PRODUCT})]
    assert not sdk.database.writes


def test_create_reopens_and_replay_does_not_duplicate(sdk):
    created = invoke(sdk, request(), ACTOR)
    assert created["ok"] is True and created["verified"] is True
    assert created["record"]["stock"] == 0
    assert created["record"]["price"] == "250.00"
    assert len(sdk.database.writes) == 1
    replay = invoke(sdk, request(), ACTOR)
    assert replay["ok"] is True and replay["replayed"] is True
    assert len(sdk.database.writes) == 1
    opened = invoke(sdk, {"action": "readback", "organization_id": ORG, "request_id": PRODUCT}, ACTOR)
    assert opened["record"]["sku"] == "HMG-ABS-001"


def test_existing_id_with_different_values_conflicts(sdk):
    assert invoke(sdk, request(), ACTOR)["ok"]
    different = request()
    different["values"]["price"] = "300"
    assert invoke(sdk, different, ACTOR).get("code") == "CONFLICT"
    assert len(sdk.database.writes) == 1


def test_duplicate_sku_conflicts_before_write(sdk):
    sdk.database.rows["products"] = [{"id": "different-id", "organization_id": ORG, "sku": "HMG-ABS-001"}]
    assert invoke(sdk, request(), ACTOR).get("code") == "DUPLICATE_SKU"
    assert not sdk.database.writes


def test_uncertain_write_is_reconciled_without_repeat(sdk):
    sdk.database.fail_after_write = True
    result = invoke(sdk, request(), ACTOR)
    assert result["ok"] is True and result["replayed"] is True
    assert len(sdk.database.writes) == 1


def test_failed_write_does_not_leak_backend_exception(sdk):
    sdk.database.fail_before_write = True
    result = invoke(sdk, request(), ACTOR)
    assert result.get("code") == "WRITE_UNCONFIRMED"
    assert "private" not in str(result)


def test_source_allows_nonnegative_product_price_beyond_cents(sdk):
    finer = request()
    finer["values"]["price"] = "12.345"
    result = invoke(sdk, finer, ACTOR)
    assert result["ok"] is True
    assert result["record"]["price"] == "12.345"
    assert result["record"]["selling_price"] == "12.345"


@pytest.mark.parametrize("amount", ["1e1000000000", "1e-1000000000", "9" * 65])
def test_extreme_numeric_input_is_bounded_before_formatting(sdk, amount):
    payload = request()
    payload["values"]["price"] = amount
    assert invoke(sdk, payload, ACTOR).get("code") == "VALIDATION_ERROR"
    assert not sdk.database.writes


@pytest.mark.parametrize("barcode,kind,allowed", [
    ("4006381333931", "ean13", True),
    ("4006381333930", "ean13", False),
    ("abc", "ean13", False),
    ("ABC-12", "code39", True),
    ("abc-12", "code39", False),
    ("A\nB", "code128", False),
    ("ABC", "unsupported", False),
])
def test_barcode_rules_are_enforced_server_side(sdk, barcode, kind, allowed):
    payload = request()
    payload["values"].update(barcode=barcode, barcode_type=kind)
    result = invoke(sdk, payload, ACTOR)
    assert (result.get("ok") is True) is allowed
    assert len(sdk.database.writes) == (1 if allowed else 0)


def test_create_policy_receives_complete_validated_proposed_attributes(sdk):
    payload = request()
    payload["values"].update(name="  Absolute Black slab  ", currency="inr",
                             purchase_price="120.50", reorder_point="5",
                             reorder_quantity="10")
    assert invoke(sdk, payload, ACTOR)["ok"] is True
    resource = sdk.policy.calls[0][0]["resource"]
    written = sdk.database.writes[0][1]
    expected = {key: value for key, value in written.items()
                if key not in ("id", "created_at", "updated_at", "deleted_at")}
    assert resource["attr"] == expected
    assert resource["id"] == PRODUCT
    assert resource["attr"]["name"] == "Absolute Black slab"
    assert resource["attr"]["currency"] == "INR"


def test_readback_preserves_read_policy_and_caller_scoped_lookup(sdk):
    sdk.database.rows["products"] = [{"id": PRODUCT, "organization_id": ORG,
                                       "name": "Saved product", "stock": 12}]
    opened = invoke(sdk, {"action": "readback", "organization_id": ORG,
                          "request_id": PRODUCT}, ACTOR)
    assert opened["record"]["stock"] == 12
    assert sdk.policy.calls == [[{
        "resource": {"kind": "datatable:products", "id": PRODUCT,
                     "attr": {"organization_id": ORG}}, "actions": ["read"]}]]
    assert not sdk.database.writes


@pytest.mark.parametrize("field", ["min_stock", "reorder_point", "reorder_quantity"])
@pytest.mark.parametrize("value", [2147483648, "2147483648", -1, "-1"])
def test_quantity_outside_nonnegative_postgres_integer_range_never_writes(sdk, field, value):
    payload = request()
    payload["values"][field] = value
    assert invoke(sdk, payload, ACTOR).get("code") == "VALIDATION_ERROR"
    assert not sdk.database.writes
    assert not sdk.policy.calls


@pytest.mark.parametrize("field", ["min_stock", "reorder_point", "reorder_quantity"])
@pytest.mark.parametrize("value", [0, "0", 2147483647, "2147483647"])
def test_quantity_postgres_integer_boundaries_are_accepted(sdk, field, value):
    payload = request()
    payload["values"][field] = value
    result = invoke(sdk, payload, ACTOR)
    assert result["ok"] is True
    assert result["record"][field] == int(value)


@pytest.fixture
def existing_product(sdk):
    assert invoke(sdk, request(), ACTOR)["ok"]
    sdk.database.writes.clear()
    sdk.policy.calls.clear()
    row = sdk.database.rows["products"][0]
    row.update(stock=12, has_variants=True)
    return row


def test_update_preserves_stock_variants_and_organization_and_synchronizes_price(sdk, existing_product):
    result = invoke(sdk, request(action="update", values={"name": "  Renamed  ", "price": "320.25"}), NATIVE_ACTORS[0])
    assert result["ok"] is True
    assert result["record"]["name"] == "Renamed"
    assert result["record"]["stock"] == 12
    assert result["record"]["price"] == result["record"]["selling_price"] == "320.25"
    assert existing_product["has_variants"] is True
    assert existing_product["organization_id"] == ORG
    patch = sdk.database.writes[0][1]
    assert set(patch) == {"name", "price", "selling_price", "updated_at"}
    update_attrs = [c[0]["resource"]["attr"] for c in sdk.policy.calls if c[0]["actions"] == ["update"]]
    assert len(update_attrs) == 2
    assert update_attrs[0]["price"] == "250.00"
    assert update_attrs[1]["price"] == "320.25"
    assert all(a["stock"] == 12 and a["organization_id"] == ORG for a in update_attrs)


@pytest.mark.parametrize("field,value", [("stock", 0), ("organization_id", PRODUCT),
    ("has_variants", False), ("selling_price", "2"), ("id", CATEGORY), ("roles", ["Admin"]),
    ("deleted_at", None), ("currency", "USD"), ("type", "standard"), ("tracking_type", "none")])
def test_update_rejects_protected_attributes(sdk, existing_product, field, value):
    result = invoke(sdk, request(action="update", values={field: value}), ACTOR)
    assert result.get("code") == "VALIDATION_ERROR"
    assert not sdk.database.writes


@pytest.mark.parametrize("field,value", [("type", "kit"), ("tracking_type", "batch")])
def test_update_cannot_change_stock_semantics(sdk, existing_product, field, value):
    assert invoke(sdk, request(action="update", values={field: value}), ACTOR).get("code") == "VALIDATION_ERROR"
    assert not sdk.database.writes


def test_update_policy_deny_never_writes(sdk, existing_product):
    sdk.policy.deny = True
    assert invoke(sdk, request(action="update", values={"name": "Changed"}), ACTOR).get("code") == "FORBIDDEN"
    assert not sdk.database.writes


@pytest.mark.parametrize("field", ["category_id", "location_id"])
def test_update_foreign_fk_never_writes(sdk, existing_product, field):
    assert invoke(sdk, request(action="update", values={field: PRODUCT}), ACTOR).get("code") == "FORBIDDEN"
    assert not sdk.database.writes


def test_update_missing_record_never_creates(sdk):
    assert invoke(sdk, request(action="update", values={"name": "Changed"}), ACTOR).get("code") == "NOT_FOUND"
    assert not sdk.database.writes


def test_update_duplicate_sku_never_writes(sdk, existing_product):
    sdk.database.rows["products"].append({"id": CATEGORY, "organization_id": ORG, "sku": "OTHER"})
    assert invoke(sdk, request(action="update", values={"sku": "OTHER"}), ACTOR).get("code") == "DUPLICATE_SKU"
    assert not sdk.database.writes


@pytest.mark.parametrize("committed", [False, True])
def test_update_timeout_reconciles_without_second_write(sdk, existing_product, committed):
    sdk.database.fail_after_write = committed
    sdk.database.fail_before_write = not committed
    result = invoke(sdk, request(action="update", values={"name": "Changed"}), ACTOR)
    assert len(sdk.database.writes) == 1
    if committed:
        assert result["ok"] is True
        assert result["record"]["name"] == "Changed"
    else:
        assert result.get("code") == "WRITE_UNCONFIRMED"


def delete_request():
    return {"action": "delete", "organization_id": ORG, "request_id": PRODUCT}


def test_delete_tombstones_without_destroying_stock_or_history(sdk, existing_product):
    result = invoke(sdk, delete_request(), NATIVE_ACTORS[0])
    assert result == {"ok": True, "verified": True, "deleted": True, "id": PRODUCT}
    assert existing_product["deleted_at"]
    assert existing_product["is_active"] is False
    assert existing_product["stock"] == 12
    assert existing_product["organization_id"] == ORG
    assert existing_product["has_variants"] is True
    assert set(sdk.database.writes[0][1]) == {"deleted_at", "updated_at", "is_active"}
    assert any(c[0]["actions"] == ["delete"] for c in sdk.policy.calls)


def test_delete_replay_requires_readable_authorized_tombstone(sdk, existing_product):
    existing_product.update(deleted_at="2026-11-09T00:00:00+00:00", is_active=False)
    assert invoke(sdk, delete_request(), ACTOR).get("deleted") is True
    assert not sdk.database.writes
    sdk.policy.deny = True
    assert invoke(sdk, delete_request(), ACTOR).get("code") == "FORBIDDEN"


@pytest.mark.parametrize("action", ["readback", "update"])
def test_tombstone_cannot_be_opened_or_edited(sdk, existing_product, action):
    existing_product["deleted_at"] = "2026-11-09T00:00:00+00:00"
    payload = delete_request()
    payload["action"] = action
    if action == "update":
        payload["values"] = {"name": "Changed"}
    assert invoke(sdk, payload, ACTOR).get("code") == "NOT_FOUND"
    assert not sdk.database.writes


def test_delete_missing_record_is_not_confirmed(sdk):
    assert invoke(sdk, delete_request(), ACTOR).get("code") == "NOT_FOUND"
    assert not sdk.database.writes


def test_delete_policy_deny_never_writes(sdk, existing_product):
    sdk.policy.deny = True
    assert invoke(sdk, delete_request(), ACTOR).get("code") == "FORBIDDEN"
    assert not sdk.database.writes


@pytest.mark.parametrize("committed", [False, True])
def test_delete_timeout_requires_actual_tombstone_readback(sdk, existing_product, committed):
    sdk.database.fail_after_write = committed
    sdk.database.fail_before_write = not committed
    result = invoke(sdk, delete_request(), ACTOR)
    assert len(sdk.database.writes) == 1
    if committed:
        assert result.get("deleted") is True
    else:
        assert result.get("code") == "WRITE_UNCONFIRMED"
        assert not result.get("deleted")


def test_delete_invisible_readback_cannot_confirm_deletion(sdk, existing_product):
    original_update = sdk.database.update
    def update_then_hide(*args, **kwargs):
        original_update(*args, **kwargs)
        sdk.database.rows["products"] = []
    sdk.database.update = update_then_hide
    result = invoke(sdk, delete_request(), ACTOR)
    assert result.get("code") == "READBACK_FAILED"
    assert not result.get("deleted")
    assert len(sdk.database.writes) == 1


def test_update_unchanged_metadata_does_not_write(sdk, existing_product):
    assert invoke(sdk, request(action="update", values={"name": existing_product["name"], "sku": existing_product["sku"]}), ACTOR).get("ok") is True
    assert not sdk.database.writes


@pytest.mark.parametrize("action,denied_check", [("update", 1), ("update", 2), ("delete", 1)])
@pytest.mark.parametrize("failure_mode", ["deny", "malformed", "error"])
def test_mutation_policy_checks_fail_closed_after_read_allow(sdk, existing_product, action, denied_check, failure_mode):
    original = sdk.policy.check_resources
    checks = []
    def policy(resources, principal):
        result = original(resources, principal)
        if resources[0]["actions"] == [action]:
            checks.append(resources)
            if len(checks) == denied_check:
                if failure_mode == "error":
                    raise RuntimeError("private policy error")
                if failure_mode == "malformed":
                    return {}
                return {"results": [{"actions": {action: "EFFECT_DENY"}}]}
        return result
    sdk.policy.check_resources = policy
    payload = delete_request() if action == "delete" else request(action="update", values={"name": "Changed"})
    assert invoke(sdk, payload, ACTOR).get("code") == "FORBIDDEN"
    assert len(checks) == denied_check
    assert not sdk.database.writes


@pytest.mark.parametrize("action", ["update", "delete"])
def test_mutation_readback_denied_is_not_success(sdk, existing_product, action):
    original = sdk.database.update
    def update_then_deny(*args, **kwargs):
        original(*args, **kwargs)
        sdk.database.denied_reads.add("products")
    sdk.database.update = update_then_deny
    payload = delete_request() if action == "delete" else request(action="update", values={"name": "Changed"})
    result = invoke(sdk, payload, ACTOR)
    assert result.get("code") == "READBACK_FAILED"
    assert len(sdk.database.writes) == 1
    assert "record" not in result
    assert not result.get("deleted")


def test_delete_does_not_accept_mutation_values(sdk, existing_product):
    assert invoke(sdk, request(action="delete", values={"stock": 0}), ACTOR).get("code") == "VALIDATION_ERROR"
    assert not sdk.database.writes


def test_update_supplied_unchanged_price_repairs_mismatched_selling_price(sdk, existing_product):
    existing_product["selling_price"] = "99"
    result = invoke(sdk, request(action="update", values={"price": "250.00"}), ACTOR)
    assert result["ok"] is True
    assert result["record"]["price"] == result["record"]["selling_price"] == "250.00"
    assert sdk.database.writes[0][1]["selling_price"] == "250.00"
    assert "stock" not in sdk.database.writes[0][1]


@pytest.mark.parametrize("timespec", ["microseconds", "milliseconds"])
def test_delete_confirms_timestamp_with_native_iso_normalization(sdk, existing_product, timespec):
    original = sdk.database.update
    def normalized_update(*args, **kwargs):
        result = original(*args, **kwargs)
        existing_product["deleted_at"] = datetime.fromisoformat(existing_product["deleted_at"]).isoformat(timespec=timespec).replace("+00:00", "Z")
        return result
    sdk.database.update = normalized_update
    assert invoke(sdk, delete_request(), ACTOR).get("deleted") is True
    assert len(sdk.database.writes) == 1
