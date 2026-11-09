"""Narrow notification reads; retain a historical, unapplied JSON proposal.

Only --apply-notification-owner writes remotely. JSON schema proposals never
submit migrations or modify rows. No policy grants create/update/delete.
The old type proposal is NOT migration-safe: live any fields are TEXT, arrays
are native PostgreSQL arrays, and TEXT->JSONB automatic conversion failed.
Use migrate_structured_json.py for the reviewed additive compatibility path.
"""
import argparse
import asyncio
import copy
from datetime import datetime, timezone
import json
import logging

from provision_erp import environment
from restrict_synthetic import (EVIDENCE, ROLE, ROLE_FILE, SCOPE, NOTIFICATION_QA_OWNERS,
                                notification_owner_expression, scoped_calls)
from seed_erp import ORG

JSON_TYPES = {"saved_reports": {"columns": "array", "filters": "array", "sort": "object"},
              "activity_logs": {"properties": "object"}}


def notification_owner_proposal(before):
    """Fail closed unless the whole policy is the observed baseline or target."""
    native = before.get("resource_policy", {})
    if before.get("disabled") or native.get("resource") != "datatable:notifications" or native.get("scope") != SCOPE or native.get("version") != "default":
        raise ValueError("Unexpected notification policy identity/scope")
    if before.get("variables") or before.get("json_schema") or before.get("description") or native.get("import_derived_roles") or native.get("scope_permissions") not in (None, "SCOPE_PERMISSIONS_UNSPECIFIED"):
        raise ValueError("Policy features require preservation review")
    allowed_keys = {"resource", "version", "scope", "rules", "import_derived_roles", "scope_permissions"}
    if set(native) - allowed_keys:
        raise ValueError("Unknown policy features require preservation review")
    expr = "R.attr.organization_id == " + json.dumps(ORG)
    read = {"actions": ["read"], "roles": [ROLE], "effect": "EFFECT_ALLOW",
            "condition": {"match": {"expr": expr}}, "derived_roles": [], "name": ""}
    deny = {"actions": ["create", "update", "delete"], "roles": ["*"],
            "effect": "EFFECT_DENY", "derived_roles": [], "name": ""}
    owner = copy.deepcopy(read)
    owner["condition"]["match"]["expr"] += " && R.attr.user_id == P.id"
    paired = copy.deepcopy(read)
    paired["condition"]["match"]["expr"] = notification_owner_expression()
    if native.get("rules") not in ([read, deny], [owner, deny], [paired, deny]):
        raise ValueError("Notification rules drifted; refusing replacement")
    expected = copy.deepcopy(native)
    expected["rules"] = [paired, deny]
    payload = {"name": "notifications", "policy_type": "resource", "entity_type": "datatable",
               "version": "default", "rules": copy.deepcopy(expected["rules"])}
    return payload, expected


def json_schema_proposal(name, schema):
    """Return a full preserved schema; only four field type values may change.

    Historical descriptor only, NOT approved to apply. Live any maps to TEXT,
    object to JSONB, and array/string to TEXT[]. The automatic TEXT->JSONB cast
    failed in the isolated rehearsal. Use the additive migration helper instead.
    """
    if name not in JSON_TYPES:
        raise ValueError("Only the four reviewed JSON fields are in scope")
    proposed = copy.deepcopy(schema)
    fields = proposed.get("fields", [])
    names = [field["name"] for field in fields]
    if len(names) != len(set(names)) or not set(JSON_TYPES[name]) <= set(names):
        raise ValueError("Missing or duplicate JSON fields")
    for field in fields:
        target = JSON_TYPES[name].get(field["name"])
        if target:
            if field.get("type") not in ("any", target) or field.get("x-pg-type"):
                raise ValueError("Unexpected JSON field type requires review")
            field["type"] = target
    return proposed


def validate_qa_owner(username, user_id, users):
    matches = [u for u in users if u.get("username") == username]
    if (username, user_id) not in NOTIFICATION_QA_OWNERS or len(matches) != 1:
        raise ValueError("Unrecognized or ambiguous notification QA owner")
    user = matches[0]
    if user.get("id") != user_id or user.get("is_active") is not True or user.get("is_staff") is not False or user.get("is_superuser", False):
        raise ValueError("Notification QA owner identity/privileges drifted")


async def restrict_notification_reads(call, save):
    """Apply a reviewed restriction once. Re-read after write, never replay it."""
    args = {"action": "get", "policy_id": "resource.datatable_notifications.vdefault/" + SCOPE}
    before = (await call("manage_policies", args))["data"]["policy"]
    payload, expected = notification_owner_proposal(before)
    report = {"app": "hmg-studio", "scope": SCOPE, "before": before, "expected": expected,
              "writes_granted": False, "verified": False}
    save(report)
    if before["resource_policy"] != expected:
        fresh = (await call("manage_policies", args))["data"]["policy"]
        if fresh != before:
            raise RuntimeError("Notification policy changed during review")
        report["replacement_result"] = await call("manage_policies", {"action": "create_update", "policy_data": payload})
        save(report)
    after = (await call("manage_policies", args))["data"]["policy"]
    report["after"] = after
    save(report)
    notification_owner_proposal(after)
    if after["resource_policy"] != expected:
        raise RuntimeError("Notification policy readback mismatch")
    report["verified"] = True
    save(report)
    return report


async def apply_notification_owner():
    logging.disable(logging.CRITICAL)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
    output = EVIDENCE / ("notification-owner-policy-" + stamp + ".json")
    def save(report):
        output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    async with scoped_calls(environment()) as call:
        role = json.loads(ROLE_FILE.read_text(encoding="utf-8"))["data"]
        if role.get("name") != ROLE or not role.get("slug"):
            raise ValueError("Unrecognized synthetic role")
        for username, user_id in NOTIFICATION_QA_OWNERS:
            # Dedicated user API, restricted to the observed native role slug.
            result = await call("list_users", {"search": username, "role_slug": role["slug"]})
            validate_qa_owner(username, user_id, result["data"]["users"])
        await restrict_notification_reads(call, save)
    print(json.dumps({"policy_readback_verified": True, "normal_session_verified": False, "evidence": output.name}))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply-notification-owner", action="store_true")
    args = parser.parse_args()
    if args.apply_notification_owner:
        asyncio.run(apply_notification_owner())
    else:
        print(json.dumps({"dry_run": True, "notification_owner_read_only": True,
                          "json_type_proposal_only": JSON_TYPES, "writes_granted": False}))
