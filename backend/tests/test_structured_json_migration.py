import copy
import asyncio
from contextlib import asynccontextmanager
import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from migrate_structured_json import additive_json_schema, saved_report_patch, activity_fixture, verify_preserved
from seed_erp import ORG, fixtures


def schema(name):
    source = json.loads(Path("backend/schema/json-price-readonly.json").read_text())
    return source["tables"][name]["mcp"]["data"]["json_schema"]


def legacy_row():
    source = json.loads(Path("backend/schema/continuation-readonly.json").read_text())
    return source["rows"]["saved_reports"]["data"][0]


@pytest.mark.parametrize("name,count", [("saved_reports", 3), ("activity_logs", 1)])
def test_schema_only_appends_exact_nullable_fields(name, count):
    before = schema(name)
    snapshot = copy.deepcopy(before)
    after = additive_json_schema(name, before)
    assert before == snapshot
    assert after["fields"][:-count] == before["fields"]
    assert {k: v for k, v in after.items() if k != "fields"} == {k: v for k, v in before.items() if k != "fields"}
    assert additive_json_schema(name, after) == after
    assert all(not f.get("constraints", {}).get("required") for f in after["fields"][-count:])


@pytest.mark.parametrize("mutation", [
    lambda s: s["fields"].append({"name": "columns_json", "type": "any"}),
    lambda s: s["fields"].append(copy.deepcopy(s["fields"][0])),
    lambda s: s["fields"].__setitem__(0, {"name": "id", "type": "integer"}),
    lambda s: s["fields"].append({"name": "columns_json", "type": "array", "arrayItem": {"type": "string"}, "default": []}),
])
def test_schema_drift_is_rejected(mutation):
    before = schema("saved_reports")
    mutation(before)
    with pytest.raises(ValueError):
        additive_json_schema("saved_reports", before)


def test_unknown_table_rejected():
    with pytest.raises(ValueError):
        additive_json_schema("customers", schema("saved_reports"))


def test_saved_report_patch_only_sets_new_fields_and_wraps_filters():
    row = legacy_row()
    snapshot = copy.deepcopy(row)
    patch = saved_report_patch(row)
    assert row == snapshot
    assert patch == {"columns_json": ["name", "sku", "stock", "type"], "filters_json": {"items": []}, "sort_json": {"field": "name", "direction": "asc"}}
    assert saved_report_patch({**row, **patch}) == patch
    verify_preserved(row, {**row, **patch}, patch)


@pytest.mark.parametrize("changes", [
    {"id": "foreign"}, {"organization_id": "foreign"}, {"description": "Real data"},
    {"columns": "not json"}, {"columns": "[1]"}, {"filters": "{}"}, {"sort": "[]"},
    {"sort": '{"field":"price","direction":"asc"}'},
    {"columns_json": ["foreign"]},
])
def test_saved_report_requires_exact_synthetic_fixture(changes):
    with pytest.raises(ValueError):
        saved_report_patch({**legacy_row(), **changes})


def test_verification_rejects_old_field_changes():
    before = legacy_row()
    patch = saved_report_patch(before)
    with pytest.raises(ValueError):
        verify_preserved(before, {**before, **patch, "name": "changed"}, patch)


def test_activity_uses_native_object_without_writing_legacy_any():
    original = fixtures()["activity_logs"][0]
    row = activity_fixture()
    assert row["organization_id"] == ORG
    assert "properties" not in row
    assert row["properties_json"] == original["properties"]
    assert row["action"] == "synthetic_fixture"
    assert {k: v for k, v in row.items() if k != "properties_json"} == {k: v for k, v in original.items() if k != "properties"}


@pytest.mark.parametrize("failure", ["timeout", "non_json", "rejected"])
def test_native_write_failure_reconciles_once_without_replay(failure):
    from migrate_structured_json import mutate_once
    calls = []
    entry = {"phase": "test"}
    snapshots = []
    class Response:
        status_code = 400 if failure == "rejected" else 200
        def json(self):
            if failure == "non_json":
                raise ValueError("not JSON")
            return {"message": "rejected"}
    class HTTP:
        async def patch(self, path, json):
            calls.append("write")
            if failure == "timeout":
                raise TimeoutError("Sensitive details must not be persisted")
            return Response()
    async def reconcile():
        calls.append("readback")
        return {"schema": {}, "row": {"id": "fixture"}}
    with pytest.raises(RuntimeError, match="no write retry"):
        asyncio.run(mutate_once(HTTP(), "patch", "/fixed", {}, entry,
                                lambda: snapshots.append(copy.deepcopy(entry)), reconcile))
    assert calls == ["write", "readback"]
    assert snapshots[0]["attempted"] is True
    assert entry["outcome"] == ("rejected" if failure == "rejected" else "uncertain")
    assert "Sensitive" not in json.dumps(entry)


def test_second_table_preflight_drift_blocks_all_writes(monkeypatch, tmp_path):
    import migrate_structured_json as migration
    import httpx
    approved = json.loads(Path("backend/schema/structured-json-additive-proposal.json").read_text())
    path = tmp_path / "plan.json"
    path.write_text(json.dumps(approved))
    (tmp_path / "docs/hmg-studio/evidence").mkdir(parents=True)
    monkeypatch.setattr(migration, "ROOT", tmp_path)
    monkeypatch.setattr(migration, "PLAN", path)
    monkeypatch.setattr(migration, "environment", lambda: {"TARUVI_SITE_URL": "https://insurance.taruvi.cloud", "TARUVI_APP_SLUG": "hmg-studio", "TARUVI_API_KEY": "test-only"})
    writes = []
    @asynccontextmanager
    async def calls(env):
        async def call(tool, args):
            if tool == "get_datatable_schema":
                record = copy.deepcopy(approved["tables"][args["table_name"]]["before"])
                if args["table_name"] == "activity_logs":
                    record["json_schema"]["review_drift"] = True
                return {"data": record}
            name = "saved_reports" if "saved_reports" in args["policy_id"] else "activity_logs"
            return {"data": {"policy": approved["tables"][name]["policy"]}}
        yield call
    class Response:
        def __init__(self, row):
            self.row = row
            self.status_code = 200 if row is not None else 404
        def raise_for_status(self):
            pass
        def json(self):
            return {"data": self.row}
    class HTTP:
        def __init__(self, **kwargs):
            assert kwargs["trust_env"] is False
        async def __aenter__(self):
            return self
        async def __aexit__(self, *args):
            pass
        async def get(self, path):
            name = "saved_reports" if "saved_reports" in path else "activity_logs"
            return Response(approved["tables"][name]["row_before"])
        async def patch(self, *args, **kwargs):
            writes.append("patch")
        async def post(self, *args, **kwargs):
            writes.append("post")
    monkeypatch.setattr(migration, "scoped_calls", calls)
    monkeypatch.setattr(httpx, "AsyncClient", HTTP)
    with pytest.raises(ValueError, match="changed after review"):
        asyncio.run(migration.run(True))
    assert writes == []
