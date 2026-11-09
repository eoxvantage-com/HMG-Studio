"""Offline command contracts; actual native row/constraint tests are separate."""
import importlib.util
import ast
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock

import pytest

ORG = "616d839b-e107-4511-b12f-fd6ed301d999"
ID = "1597fb11-31a3-4858-861e-e804b6191538"
ROW = {"id": ID, "organization_id": ORG, "name": "Granite", "description": None,
       "slug": "granite", "is_active": True, "parent_id": None, "deleted_at": None}


def invoke(params, sdk, user=None):
    path = Path(__file__).parents[1] / "functions" / "catalog.py"
    if not path.exists():
        return {}  # Contract assertions fail until implemented.
    spec = importlib.util.spec_from_file_location("catalog", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.main(params, user, sdk)


class Query:
    def __init__(self, database, table):
        self.db, self.table, self.filters, self.new = database, table, [], None

    def filter(self, field, op, value):
        self.filters.append((field, value)); return self

    def page_size(self, value):
        return self

    def create(self, data):
        self.new = data; return self

    def execute(self):
        if self.new is not None:
            self.db.create_calls.append(self.new)
            if self.db.fail_write:
                raise RuntimeError("secret database detail")
            self.db.rows.append(dict(self.new))
            if self.db.commit_then_throw:
                raise RuntimeError("secret response lost after commit")
            return {"data": [dict(self.new)]}
        if self.table == "product_categories" and self.db.create_calls:
            if self.db.readback_mode == "error":
                raise RuntimeError("secret read failure")
            if self.db.readback_mode == "missing":
                return {"data": [], "total": 0}
            if self.db.readback_mode == "mismatch":
                return {"data": [{**self.db.rows[0], "name": "unexpected"}], "total": 1}
        rows = [{"id": ORG}] if self.table == "organizations" else self.db.rows
        data = [dict(r) for r in rows if all(r.get(k) == v for k, v in self.filters)]
        return {"data": data[:1], "total": len(data)}


@pytest.fixture
def sdk():
    db = SimpleNamespace(rows=[], create_calls=[], fail_write=False, commit_then_throw=False, readback_mode=None)
    db.from_ = lambda table: Query(db, table)
    validator = Mock(return_value={"data": {"valid": True, "values": {"name": "Granite", "description": None}}})
    return SimpleNamespace(database=db, functions=SimpleNamespace(execute=validator))


def request(**overrides):
    return {"action": "create", "request_id": ID, "organization_id": ORG,
            "values": {"name": "Granite", "description": ""}, **overrides}


def test_anonymous_never_reaches_validation_or_writes(sdk):
    assert invoke(request(), sdk).get("code") == "UNAUTHENTICATED"
    sdk.functions.execute.assert_not_called()
    assert sdk.database.create_calls == []


@pytest.mark.parametrize("overrides", [{"user_id": "forged"}, {"action": "update"}, {"request_id": "bad"}, {"values": {"name": "X", "organization_id": ORG}}])
def test_rejects_unsupported_authority_actions_and_fields(sdk, overrides):
    assert invoke(request(**overrides), sdk, {"id": "qa"}).get("code") == "VALIDATION_ERROR"
    assert not sdk.database.create_calls


def test_foreign_organization_rejected_before_validator(sdk):
    result = invoke(request(organization_id=ID), sdk, {"id": "qa"})
    assert result.get("code") == "FORBIDDEN"
    sdk.functions.execute.assert_not_called()


def test_reuses_existing_validator_and_returns_fresh_persisted_record(sdk):
    result = invoke(request(request={}, __method__="POST", __function__={}), sdk, {"id": "qa"})
    assert result.get("ok") is True and result.get("verified") is True
    assert result["record"]["slug"] == "granite"
    assert result["record"]["id"] == ID
    assert result["record"]["description"] is None
    sdk.functions.execute.assert_called_once_with("validate-catalog-profile-v1", params={"resource": "product_categories", "values": request()["values"]}, is_async=False)
    assert len(sdk.database.create_calls) == 1


def test_invalid_source_values_never_write(sdk):
    sdk.functions.execute.return_value = {"data": {"valid": False, "errors": {"name": "Required"}}}
    assert invoke(request(), sdk, {"id": "qa"}).get("code") == "VALIDATION_ERROR"
    assert not sdk.database.create_calls


def test_same_request_id_replays_only_same_values(sdk):
    sdk.database.rows = [ROW]
    result = invoke(request(), sdk, {"id": "qa"})
    assert result.get("ok") is True and result.get("replayed") is True
    assert not sdk.database.create_calls
    sdk.database.rows[0] = {**ROW, "name": "Different"}
    assert invoke(request(), sdk, {"id": "qa"}).get("code") == "CONFLICT"


def test_duplicate_name_gets_numeric_slug_suffix(sdk):
    sdk.database.rows = [{**ROW, "id": "other"}]
    result = invoke(request(), sdk, {"id": "qa"})
    assert result.get("record", {}).get("slug") == "granite-1"


def test_uncertain_create_is_not_repeated_or_reported_success(sdk):
    sdk.database.fail_write = True
    result = invoke(request(), sdk, {"id": "qa"})
    assert result.get("code") == "WRITE_UNCONFIRMED"
    assert "secret" not in str(result)
    assert len(sdk.database.create_calls) == 1


def test_readback_does_not_create_missing_record(sdk):
    result = invoke({"action": "readback", "request_id": ID, "organization_id": ORG}, sdk, {"id": "qa"})
    assert result.get("code") == "NOT_FOUND"
    assert not sdk.database.create_calls


def test_catalog_uses_only_documented_sandbox_imports():
    tree = ast.parse((Path(__file__).parents[1] / "functions" / "catalog.py").read_text())
    # Deliberately narrow to the subset needed by this command. Reference:
    # docs.taruvibase.com/docs/products/functions/reference#sandbox-imports
    allowed = {"re", "datetime", "uuid"}
    imports = {node.module.split(".")[0] for node in ast.walk(tree) if isinstance(node, ast.ImportFrom)}
    imports.update(alias.name.split(".")[0] for node in ast.walk(tree) if isinstance(node, ast.Import) for alias in node.names)
    assert imports <= allowed


def test_commit_then_lost_response_reconciles_without_second_create(sdk):
    sdk.database.commit_then_throw = True
    result = invoke(request(), sdk, {"id": "qa"})
    assert result.get("ok") is True and result.get("replayed") is True
    assert len(sdk.database.create_calls) == len(sdk.database.rows) == 1


@pytest.mark.parametrize("mode", ["missing", "mismatch", "error"])
def test_post_create_readback_failure_never_claims_success(sdk, mode):
    sdk.database.readback_mode = mode
    result = invoke(request(), sdk, {"id": "qa"})
    assert result.get("code") == "READBACK_FAILED"
    assert result.get("verified") is False
    assert len(sdk.database.create_calls) == 1


def test_non_ascii_name_is_preserved_with_safe_fallback_slug(sdk):
    name = "\u82b1\u5d17\u5ca9"
    sdk.functions.execute.return_value = {"data": {"valid": True, "values": {"name": name, "description": None}}}
    result = invoke(request(values={"name": name}), sdk, {"id": "qa"})
    assert result.get("record", {}).get("name") == name
    assert result.get("record", {}).get("slug") == "category"

def test_long_name_slug_stays_valid_after_truncation(sdk):
    import re
    name = "a" * 239 + " " + "b" * 15
    sdk.functions.execute.return_value = {"data": {"valid": True, "values": {"name": name, "description": None}}}
    result = invoke(request(values={"name": name}), sdk, {"id": "qa"})
    assert re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", result["record"]["slug"])
