"""Append approved synthetic-only read rules to the four existing lookup policies.

Existing rules are preserved byte-for-JSON-value; no write grants are introduced.
Run only after all 58 new ERP policies and the QA role have verified readback.
"""
import argparse
import asyncio
import copy
from datetime import datetime, timezone
import json
import logging
from uuid import UUID
from provision_erp import MANIFEST, environment
from restrict_synthetic import EVIDENCE, PROTECTED, ROLE, SCOPE, approved_resources, scoped_calls
from seed_erp import ORG, fixtures


def append_lookup_rule(name, before, dataset):
    if name not in PROTECTED:
        raise ValueError("Only the four approved existing lookup policies are in scope")
    native = before.get("resource_policy", {})
    if before.get("disabled") or native.get("resource") != "datatable:" + name or native.get("scope") != SCOPE or native.get("version") != "default":
        raise ValueError("Unexpected lookup policy identity/scope")
    # The flat MCP authoring contract cannot safely round-trip exotic policy
    # features. The observed existing policies use these empty/default values.
    if before.get("variables") or before.get("json_schema") or native.get("import_derived_roles") or native.get("scope_permissions") not in (None, "SCOPE_PERMISSIONS_UNSPECIFIED"):
        raise ValueError("Policy features require manual preservation review")
    records = dataset.get(name, [])
    if not records:
        raise ValueError("No approved synthetic lookup fixtures")
    ids = []
    for row in records:
        UUID(row["id"])
        if (name == "organizations" and row["id"] != ORG) or (name != "organizations" and row.get("organization_id") != ORG):
            raise ValueError("Lookup fixture escaped synthetic organization")
        ids.append(row["id"])
    expression = "R.attr.id in " + json.dumps(sorted(ids))
    if name != "organizations":
        expression += " && R.attr.organization_id == " + json.dumps(ORG)
    rule = {"actions": ["read"], "roles": [ROLE], "condition": {"match": {"expr": expression}}, "effect": "EFFECT_ALLOW", "derived_roles": [], "name": "synthetic_lookup_read"}
    expected = copy.deepcopy(native)
    # User approved only a synthetic-fixture read exception to the exact known
    # global read/write DENY on these two lookups. Other actions stay denied.
    # P aliases request.principal and P.roles is the static role list:
    # https://docs.cerbos.dev/cerbos/latest/policies/conditions.html
    if name in {"product_locations", "warehouses"}:
        known = {"actions": ["read", "create", "update", "delete"], "roles": ["*"], "effect": "EFFECT_DENY", "derived_roles": [], "name": ""}
        original = expected["rules"]
        write_deny = {**known, "actions": ["create", "update", "delete"]}
        read_deny = {**known, "actions": ["read"], "name": "outside_synthetic_lookup", "condition": {"match": {"expr": "!(" + json.dumps(ROLE) + " in P.roles && (" + expression + "))"}}}
        if original == [known]:
            expected["rules"] = [write_deny, read_deny]
        elif original != [write_deny, read_deny, rule]:
            raise ValueError("Unrecognized existing lookup deny shape")
    same_name = [r for r in expected["rules"] if r.get("name") == rule["name"]]
    if same_name and same_name != [rule]:
        raise ValueError("Existing synthetic rule changed; refusing to overwrite")
    if not same_name:
        expected["rules"].append(rule)
    payload = {"name": name, "policy_type": "resource", "entity_type": "datatable", "version": "default", "rules": expected["rules"]}
    return payload, expected


def successful_gate():
    expected = set(approved_resources(json.loads(MANIFEST.read_text(encoding="utf-8"))))
    for path in sorted(EVIDENCE.glob("erp-policy-run-*.json"), reverse=True):
        report = json.loads(path.read_text(encoding="utf-8"))
        if report.get("app") != "hmg-studio" or report.get("scope") != SCOPE or report.get("organization_id") != ORG or report.get("apply") is not True or report.get("assigned") is not True:
            continue
        if set(report.get("tables", {})) != expected:
            continue
        if all(value.get("after") and not value["after"].get("disabled") for value in report["tables"].values()):
            return str(path.name)
    raise RuntimeError("All 58 restricted-policy/QA-role readbacks are required first")


async def apply():
    logging.disable(logging.CRITICAL)
    gate = successful_gate()
    dataset = fixtures()
    report = {"app": "hmg-studio", "scope": SCOPE, "organization_id": ORG, "gate": gate, "tables": {}}
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
    out = EVIDENCE / ("erp-policy-lookups-" + stamp + ".json")
    def save(): out.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    async with scoped_calls(environment()) as call:
        async def get(name):
            result = await call("manage_policies", {"action": "get", "policy_id": "resource.datatable_" + name + ".vdefault/" + SCOPE})
            return result["data"]["policy"]
        for name in sorted(PROTECTED):
            before = await get(name)
            payload, expected = append_lookup_rule(name, before, dataset)
            report["tables"][name] = {"before": before, "expected": expected}
            save()
            if before["resource_policy"] != expected:
                report["tables"][name]["replacement_result"] = await call("manage_policies", {"action": "create_update", "policy_data": payload})
            after = await get(name)
            report["tables"][name]["after"] = after
            save()
            if after.get("disabled") or after["resource_policy"] != expected:
                raise RuntimeError("Existing lookup policy preservation/readback failed: " + name)
            print("Verified synthetic-only lookup read: " + name, flush=True)
    report["verified"] = True
    save()
    print(json.dumps({"verified_lookup_tables": len(PROTECTED), "role": ROLE, "evidence": out.name}))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    if args.apply:
        asyncio.run(apply())
    else:
        data = fixtures()
        print(json.dumps({"dry_run": True, "role": ROLE, "organization_id": ORG, "fixture_counts": {name: len(data[name]) for name in sorted(PROTECTED)}, "writes_granted": False}))
