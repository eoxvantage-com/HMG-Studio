"""Add four nullable typed fields, preserving legacy TEXT and all policies.

--inspect produces a full reviewable plan. --apply uses only that plan after
fresh comparisons; writes are never retried. Only two deterministic synthetic
fixtures may be touched. No SQL casts, drops, policy changes, or broad backfill.
"""
import argparse
import asyncio
import copy
from datetime import datetime, timezone
import json
import logging
from pathlib import Path

from provision_erp import ROOT, environment
from restrict_synthetic import scoped_calls, SCOPE
from seed_erp import ORG, fixtures, can_skip, fixture_wire, can_skip_fixture

FIELDS = {
    "saved_reports": [
        {"name": "columns_json", "type": "array", "arrayItem": {"type": "string"}},
        {"name": "filters_json", "type": "object"},
        {"name": "sort_json", "type": "object"}],
    "activity_logs": [{"name": "properties_json", "type": "object"}],
}
LEGACY = {"saved_reports": ("columns", "filters", "sort"), "activity_logs": ("properties",)}
PLAN = ROOT / "backend/schema/structured-json-additive-proposal.json"


def additive_json_schema(name, schema):
    if name not in FIELDS:
        raise ValueError("Only reviewed structured-data tables are allowed")
    result = copy.deepcopy(schema)
    fields = result.get("fields", [])
    names = [field["name"] for field in fields]
    if len(names) != len(set(names)):
        raise ValueError("Duplicate fields")
    indexed = {field["name"]: field for field in fields}
    for key in ("id", "organization_id"):
        if indexed.get(key, {}).get("type") != "string" or indexed[key].get("format") != "uuid":
            raise ValueError("UUID identity schema drift")
    for key in LEGACY[name]:
        if indexed.get(key, {}).get("type") != "any":
            raise ValueError("Legacy field type drift")
    for field in FIELDS[name]:
        if field["name"] in indexed:
            if indexed[field["name"]] != field:
                raise ValueError("Typed field conflicts with reviewed descriptor")
        else:
            fields.append(copy.deepcopy(field))
    return result


def saved_report_patch(row):
    expected = fixtures()["saved_reports"][0]
    scalar = {k: v for k, v in expected.items() if k not in LEGACY["saved_reports"]}
    if row.get("organization_id") != ORG or not can_skip(scalar, row):
        raise ValueError("Only the exact approved synthetic saved report may be backfilled")
    values = {}
    for key in LEGACY["saved_reports"]:
        raw = row.get(key)
        try:
            parsed = json.loads(raw) if isinstance(raw, str) else raw
            json.dumps(parsed, allow_nan=False)
        except (ValueError, TypeError) as exc:
            raise ValueError("Invalid legacy JSON") from exc
        if parsed != expected[key]:
            raise ValueError("Synthetic JSON fixture differs; review required")
        values[key] = parsed
    wire = fixture_wire("saved_reports", expected)
    patch = {field["name"]: wire[field["name"]] for field in FIELDS["saved_reports"]}
    for key, value in patch.items():
        if row.get(key) is not None and row[key] != value:
            raise ValueError("Existing typed value differs")
    return patch


def activity_fixture():
    return fixture_wire("activity_logs", fixtures()["activity_logs"][0])


def verify_preserved(before, after, patch):
    if any(after.get(k) != v for k, v in patch.items()):
        raise ValueError("Typed values did not roundtrip")
    if any(k not in patch and after.get(k) != v for k, v in before.items()):
        raise ValueError("An original field changed")


def schema_record(result, name):
    data = result["data"]
    if (not isinstance(data, dict) or data.get("name") != name
            or data.get("physical_table_name") != "hmg_studio_" + name
            or data.get("provider_type") != "flat_table" or data.get("schema_format") != "frictionless"
            or data.get("is_materialized") is not True):
        raise ValueError("Unexpected table identity or scope")
    return data


async def get_row(http, name, identity):
    response = await http.get(f"/api/apps/hmg-studio/datatables/{name}/data/{identity}/")
    if response.status_code == 404:
        return None
    response.raise_for_status()
    body = response.json()
    row = body.get("data")
    if not isinstance(row, dict) or row.get("id") != identity:
        raise ValueError("Unexpected record response")
    return row


async def mutate_once(http, method, path, payload, entry, save, reconcile):
    """Record intent before sending; reconcile failures once, never replay writes."""
    entry.update(attempted=True, outcome="pending")
    save()
    try:
        response = await getattr(http, method)(path, json=payload)
        entry["response"] = {"http": response.status_code, "body": response.json()}
        save()
    except Exception as exc:
        entry.update(outcome="uncertain", error_type=type(exc).__name__)
    else:
        if 200 <= response.status_code < 300:
            entry["outcome"] = "accepted"
            save()
            return
        entry["outcome"] = "rejected"
    save()
    try:
        entry["reconciliation"] = await reconcile()
    except Exception as exc:
        entry["reconciliation_error_type"] = type(exc).__name__
    save()
    raise RuntimeError("Mutation not confirmed; reconciled once, no write retry")


async def run(apply=False):
    import httpx
    logging.disable(logging.CRITICAL)
    env = environment()  # Strict site/app validation; never silently override.
    headers = {"Authorization": "Api-Key " + env["TARUVI_API_KEY"], "X-App-Slug": "hmg-studio"}
    report = {"at": datetime.now(timezone.utc).isoformat(), "app": "hmg-studio", "apply": apply,
              "policies_changed": False, "tables": {}}
    output = ROOT / "docs/hmg-studio/evidence" / ("structured-json-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ") + ".json") if apply else PLAN
    def save():
        output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    approved = json.loads(PLAN.read_text(encoding="utf-8")) if apply else None
    if apply and (approved.get("app") != "hmg-studio" or approved.get("apply") is not False or set(approved.get("tables", {})) != set(FIELDS)):
        raise ValueError("Unexpected approved plan scope")
    async with scoped_calls(env) as call, httpx.AsyncClient(base_url=env["TARUVI_SITE_URL"], headers=headers, timeout=60, trust_env=False) as http:
        # Capture/compare BOTH tables and fixture rows before any mutation.
        for name in FIELDS:
            record = schema_record(await call("get_datatable_schema", {"table_name": name}), name)
            policy_id = "resource.datatable_" + name + ".vdefault/" + SCOPE
            policy = (await call("manage_policies", {"action": "get", "policy_id": policy_id}))["data"]["policy"]
            if policy.get("disabled") or policy["resource_policy"].get("scope") != SCOPE or policy["resource_policy"].get("resource") != "datatable:" + name:
                raise ValueError("Policy scope differs")
            original = fixtures()[name][0]
            row = await get_row(http, name, original["id"])
            if name == "saved_reports":
                if row is None:
                    raise ValueError("Expected saved-report fixture is missing")
                payload = saved_report_patch(row)
            else:
                payload = activity_fixture()
                if row is not None:
                    raise ValueError("Activity fixture already exists; requires new review")
            table = {"before": record, "after_schema": additive_json_schema(name, record["json_schema"]),
                     "policy": policy, "row_before": row, "payload": payload}
            if apply and table != approved["tables"][name]:
                raise ValueError("Live schema/policy/fixture changed after review")
            report["tables"][name] = table
            save()
        if not apply:
            print(json.dumps({"proposal": str(output), "applied": False}))
            return report
        for name, table in report["tables"].items():
            identity = fixtures()[name][0]["id"]
            async def reconcile():
                return {"schema": schema_record(await call("get_datatable_schema", {"table_name": name}), name),
                        "row": await get_row(http, name, identity)}
            fresh = schema_record(await call("get_datatable_schema", {"table_name": name}), name)
            if fresh != table["before"]:
                raise ValueError("Schema changed during apply; refusing write")
            if table["before"]["json_schema"] != table["after_schema"]:
                table["schema_write"] = {"phase": "add_nullable_fields"}
                await mutate_once(http, "patch", f"/api/apps/hmg-studio/datatables/{name}/",
                                  {"json_schema": table["after_schema"]}, table["schema_write"], save, reconcile)
            table["schema_readback"] = schema_record(await call("get_datatable_schema", {"table_name": name}), name)
            save()
            if table["schema_readback"]["json_schema"] != table["after_schema"]:
                raise ValueError("Full schema readback differs")
            current = await get_row(http, name, identity)
            if current != table["row_before"]:
                # Nullable fields are returned as null after the additive DDL.
                stripped = {k: v for k, v in (current or {}).items() if k not in {f['name'] for f in FIELDS[name]}}
                if current is None or stripped != table["row_before"] or any(current.get(f['name']) is not None for f in FIELDS[name]):
                    raise ValueError("Fixture changed during schema update")
            table["row_write"] = {"phase": "synthetic_fixture_typed_values"}
            method = "patch" if name == "saved_reports" else "post"
            path = f"/api/apps/hmg-studio/datatables/{name}/data/" + (identity + "/" if method == "patch" else "")
            await mutate_once(http, method, path, table["payload"], table["row_write"], save, reconcile)
            after = await get_row(http, name, identity)
            table["row_after"] = after
            save()
            if name == "saved_reports":
                verify_preserved(table["row_before"], after, table["payload"])
            elif not can_skip_fixture("activity_logs", fixtures()["activity_logs"][0], after) or after.get("properties") is not None:
                raise ValueError("Synthetic activity did not roundtrip")
            policy_id = "resource.datatable_" + name + ".vdefault/" + SCOPE
            table["policy_after"] = (await call("manage_policies", {"action": "get", "policy_id": policy_id}))["data"]["policy"]
            save()
            if (table["policy_after"]["resource_policy"] != table["policy"]["resource_policy"]
                    or table["policy_after"].get("disabled") != table["policy"].get("disabled")):
                raise ValueError("Policy changed unexpectedly")
            table["verified"] = True
            save()
    report["verified"] = True
    save()
    print(json.dumps({"evidence": str(output), "verified": True}))
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--inspect", action="store_true")
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    if args.inspect == args.apply:
        parser.error("Choose --inspect or --apply; --apply requires reviewed proposal")
    asyncio.run(run(args.apply))
