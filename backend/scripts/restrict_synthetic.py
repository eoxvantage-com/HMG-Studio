"""Restrict ONLY the newly provisioned ERP policies to the synthetic QA workspace.

Default is offline dry-run. --inspect is read-only; --apply requires the explicit
user-approved new-table policy replacement. Never modifies the four pre-existing
business policies, real users, identity tables, credentials, or business records.
"""
import argparse
import asyncio
from contextlib import asynccontextmanager
from datetime import datetime, timezone
import json
import logging
from pathlib import Path
from provision_erp import MANIFEST, ROOT, environment, unwrap, validate_manifest
from seed_erp import ORG, QA_USER, fixtures

ROLE = "HMG Synthetic Operator"
USERNAME = "qa_hmg_preferences_20261106"
PROTECTED = {"organizations", "product_categories", "product_locations", "warehouses"}
CREATABLE = {"products", "customers", "suppliers"}
CHILD_FIXTURE_REFRESH = {"stock_transfer_items", "stock_audit_items", "product_components", "work_order_items", "shipment_items"}
EVIDENCE = ROOT / "docs/hmg-studio/evidence"
ROLE_FILE = EVIDENCE / "erp-policy-role.json"
SCOPE = "insurance_hmg-studio"
NOTIFICATION_QA_OWNERS = (
    (USERNAME, QA_USER),
    ("qa_hmg_inbox_20261106", "1bbbcad2-46c3-480f-92d6-acdf566b510a"),
)


def notification_owner_expression():
    # Native data-plane read evidence identifies P.id by username, not UUID.
    # Explicit pairs are confined to confirmed synthetic QA identities only.
    pairs = ["(P.id == " + json.dumps(username) + " && R.attr.user_id == " + json.dumps(user_id) + ")"
             for username, user_id in NOTIFICATION_QA_OWNERS]
    return "R.attr.organization_id == " + json.dumps(ORG) + " && (" + " || ".join(pairs) + ")"


def approved_resources(manifest):
    resources = validate_manifest(manifest)
    # The manifest explicitly marks the four pre-existing resources True; new
    # resources omit the key (the provisioning planner treats this as False).
    return {r["name"]: r for r in resources if not r.get("existing", False) and r["name"] not in PROTECTED}


def policy_for(resource, dataset):
    name = resource["name"]
    if name in PROTECTED or resource.get("existing", False):
        raise ValueError("Existing business policies are outside approval")
    fields = {f["name"]: f for f in resource["schema"]["fields"]}
    rules = []
    def allow(action, expr):
        rules.append({"actions": [action], "roles": [ROLE], "effect": "EFFECT_ALLOW", "condition": {"match": {"expr": expr}}})
    if "organization_id" in fields:
        org_check = "R.attr.organization_id == " + json.dumps(ORG)
        allow("read", notification_owner_expression() if name == "notifications" else org_check)
        if name in CREATABLE:
            checks = [org_check, "R.attr.name.matches('.*[^[:space:]].*')", "size(R.attr.name) <= 255", "(!has(R.attr.deleted_at) || R.attr.deleted_at == null)"]
            if name == "customers":
                checks.append("(!has(R.attr.credit_limit) || R.attr.credit_limit == null || R.attr.credit_limit >= 0)")
            if name == "suppliers":
                checks.append("(!has(R.attr.rating) || R.attr.rating == null || (R.attr.rating >= 0 && R.attr.rating <= 5))")
            if name == "products":
                checks += ["R.attr.sku.matches('.*[^[:space:]].*')", "size(R.attr.sku) <= 255", "(!has(R.attr.stock) || R.attr.stock == 0)", "(!has(R.attr.has_variants) || R.attr.has_variants == false)", "(!has(R.attr.type) || R.attr.type == 'standard')", "(!has(R.attr.tracking_type) || R.attr.tracking_type == 'none')"]
                for column in ("price", "purchase_price", "selling_price", "min_stock", "max_stock", "reorder_point", "reorder_quantity"):
                    checks.append(f"(!has(R.attr.{column}) || R.attr.{column} == null || R.attr.{column} >= 0)")
                for column, table in (("category_id", "product_categories"), ("location_id", "product_locations")):
                    ids = [row["id"] for row in dataset.get(table, [])]
                    checks.append(f"(!has(R.attr.{column}) || R.attr.{column} == null || R.attr.{column} in {json.dumps(ids)})")
            allow("create", " && ".join(checks))
    else:
        ids = [row["id"] for row in dataset.get(name, [])]
        if ids:
            allow("read", "R.attr.id in " + json.dumps(ids))
    deny = ["update", "delete"] if name in CREATABLE else ["create", "update", "delete"]
    if not rules:
        deny = ["*"]
    rules.append({"actions": deny, "roles": ["*"], "effect": "EFFECT_DENY"})
    return {"name": name, "policy_type": "resource", "entity_type": "datatable", "version": "default", "rules": rules}


def normalized_rules(rules):
    return [{k: r[k] for k in ("actions", "roles", "effect", "condition") if k in r} for r in rules]


def is_auto_policy(policy):
    rules = normalized_rules(policy["resource_policy"]["rules"])
    return rules == [{"actions": ["read"], "roles": ["*"], "effect": "EFFECT_ALLOW"}]


def matches_owned_readback(name, policy, histories):
    """Permit a fixture-ID refresh only from an exact successful owned readback.

    Match the ENTIRE resource-policy body, not only its name or its rules. The
    current policy's server metadata can change, but its authorization must not.
    """
    if name in PROTECTED or policy.get("disabled"):
        return False
    native = policy.get("resource_policy", {})
    if native.get("resource") != "datatable:" + name or native.get("scope") != SCOPE or native.get("version") != "default":
        return False
    for history in histories:
        if history.get("app") != "hmg-studio" or history.get("scope") != SCOPE or history.get("apply") is not True:
            continue
        previous = history.get("tables", {}).get(name, {}).get("after", {})
        if previous and not previous.get("disabled") and previous.get("resource_policy") == native:
            # Only the five explicitly approved newly seeded child tables may
            # use partial-run proof, and only from the prior exact deny-all.
            if history.get("assigned") is True:
                return True
            deny_all = [{"actions": ["*"], "roles": ["*"], "effect": "EFFECT_DENY"}]
            return name in CHILD_FIXTURE_REFRESH and normalized_rules(native.get("rules", [])) == deny_all
    return False


def read_only_call(name, args):
    return name in {"get_datatable_schema", "list_users"} or (name == "manage_policies" and args.get("action") == "get") or (name == "manage_roles" and args.get("action") == "list") or (name == "datatable_data" and args.get("action") == "query")


def expired_session_error(error):
    children = getattr(error, "exceptions", None)
    if children:
        return all(expired_session_error(child) for child in children)
    response = getattr(error, "response", None)
    endpoint_missing = getattr(response, "status_code", None) == 404 and str(getattr(response, "url", "")).rstrip("/") == "https://insurance.taruvi.cloud/mcp"
    return "session terminated" in str(error).lower() or type(error).__name__ == "BrokenResourceError" or getattr(response, "status_code", None) == 401 or endpoint_missing


def decode_rpc_response(body, content_type, request_id):
    """Decode the server's JSON or SSE JSON-RPC tool response, fail closed."""
    from mcp.types import CallToolResult
    if "application/json" in content_type:
        messages = [json.loads(body)]
    elif "text/event-stream" in content_type:
        # Taruvi emits one JSON data line per event; join legal multi-line data.
        messages = []
        data = []
        for line in body.replace("\r\r\n", "\n").replace("\r\n", "\n").replace("\r", "\n").split("\n") + [""]:
            if not line:
                if data:
                    messages.append(json.loads("\n".join(data)))
                    data = []
            elif line.startswith("data:"):
                data.append(line[5:].lstrip(" "))
    else:
        raise RuntimeError("Unexpected MCP response content type")
    matching = [m for m in messages if isinstance(m, dict) and m.get("id") == request_id]
    if len(matching) != 1 or matching[0].get("jsonrpc") != "2.0":
        raise RuntimeError("MCP response correlation failed")
    message = matching[0]
    if "error" in message:
        error = message["error"]
        if "session terminated" in str(error.get("message", "")).lower():
            raise RuntimeError("Session terminated")
        raise RuntimeError("MCP JSON-RPC error code: " + str(error.get("code")))
    if "result" not in message:
        raise RuntimeError("MCP response missing result")
    return unwrap(CallToolResult.model_validate(message["result"]))


@asynccontextmanager
async def scoped_calls(env):
    """Use the observed stateless MCP tools/call contract; never retry writes."""
    import httpx
    if env.get("TARUVI_SITE_URL", "").rstrip("/") != "https://insurance.taruvi.cloud" or env.get("TARUVI_APP_SLUG") != "hmg-studio":
        raise ValueError("MCP app/site scope mismatch")
    counter = 0
    async with httpx.AsyncClient(timeout=60, trust_env=False, headers={"Authorization": "Api-Key " + env["TARUVI_API_KEY"], "X-App-Slug": "hmg-studio", "Accept": "application/json, text/event-stream"}) as client:
        async def call(name, args):
            nonlocal counter
            for attempt in range(3):
                counter += 1
                try:
                    response = await client.post(env["TARUVI_SITE_URL"].rstrip("/") + "/mcp/", json={"jsonrpc": "2.0", "id": counter, "method": "tools/call", "params": {"name": name, "arguments": args}})
                    response.raise_for_status()
                    return decode_rpc_response(response.text, response.headers.get("content-type", ""), counter)
                except Exception as error:
                    if not read_only_call(name, args) or not expired_session_error(error) or attempt == 2:
                        raise
                    print("Retrying expired MCP read: " + name, flush=True)
        yield call


def validate_live_schema(resource, schema):
    actual = {f["name"]: f for f in schema["fields"]}
    wanted = {f["name"]: f for f in resource["schema"]["fields"]}
    for name in ("id", "organization_id"):
        if name in wanted and (name not in actual or actual[name].get("format") != "uuid"):
            raise ValueError("Live UUID schema differs: " + resource["name"] + "." + name)
    if resource["name"] in CREATABLE:
        # Creates stay closed if the native validator lacks the expected scalar constraints.
        for name, field in wanted.items():
            if name not in actual or actual[name].get("type") != field["type"]:
                raise ValueError("Live create field differs: " + resource["name"] + "." + name)
            for key, value in field.get("constraints", {}).items():
                if actual[name].get("constraints", {}).get(key) != value:
                    raise ValueError("Live create constraint differs: " + resource["name"] + "." + name)


async def run_live(apply=False):
    from mcp import ClientSession
    from mcp.client.streamable_http import streamablehttp_client
    logging.disable(logging.CRITICAL)
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    resources = approved_resources(manifest)
    dataset = fixtures()
    env = environment()
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
    report = {"app": "hmg-studio", "scope": SCOPE, "organization_id": ORG, "apply": apply, "role_name": ROLE, "tables": {}, "assigned": False}
    output = EVIDENCE / ("erp-policy-run-" + stamp + ".json")
    histories = [json.loads(p.read_text(encoding="utf-8")) for p in EVIDENCE.glob("erp-policy-run-*.json")]
    def save():
        output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    async with scoped_calls(env) as call:
        async def get_policy(name):
            result = await call("manage_policies", {"action": "get", "policy_id": "resource.datatable_" + name + ".vdefault/" + SCOPE})
            return result["data"]["policy"]
        async def policy_snapshot():
            result = await call("manage_policies", {"action": "get", "scope_regexp": "^" + SCOPE + "$", "include_disabled": True})
            policies = result["data"]["policies"]
            selected = {}
            for policy in policies:
                native = policy.get("resource_policy", {})
                if native.get("scope") == SCOPE and native.get("version") == "default" and native.get("resource", "").startswith("datatable:"):
                    name = native["resource"].split(":", 1)[1]
                    if name in selected: raise RuntimeError("Ambiguous scoped resource policy")
                    selected[name] = policy
            return selected
        initial_policies = await policy_snapshot()
        protected_before = {name: initial_policies[name] for name in sorted(PROTECTED)}
        report["protected_before"] = protected_before
        schemas = {r["name"]: r for r in (await call("get_datatable_schema", {}))["data"]}
        discovered = set(schemas)
        targets = sorted(set(resources) & discovered)
        report["not_yet_created"] = sorted(set(resources) - discovered)
        role_rows = (await call("manage_roles", {"action": "list"}))["data"]["roles"]
        existing = [r for r in role_rows if r["name"] == ROLE]
        if len(existing) > 1: raise RuntimeError("Ambiguous role identity")
        role = None
        if apply:
            if existing:
                if not ROLE_FILE.exists(): raise RuntimeError("Existing role slug needs discovery; refusing to guess")
                role = json.loads(ROLE_FILE.read_text())["data"]
                if role["id"] != existing[0]["id"] or role["name"] != ROLE: raise RuntimeError("Role identity mismatch")
            else:
                created = await call("manage_roles", {"action": "create", "name": ROLE, "description": "Dedicated synthetic HMG ERP operator; no production/business data grants."})
                ROLE_FILE.write_text(json.dumps(created, indent=2), encoding="utf-8")
                role = created["data"]
            if not role.get("slug"): raise RuntimeError("Native role did not return a slug")
            report["role_slug"] = role["slug"]
            policies = (await call("manage_policies", {"action": "get", "name_regexp": ROLE, "include_disabled": True}))["data"]["policies"]
            role_policies = [p for p in policies if p.get("role_policy", {}).get("role") == ROLE]
            if len(role_policies) != 1: raise RuntimeError("Expected exactly one native role policy")
            rp = role_policies[0]
            if rp["role_policy"].get("scope") != SCOPE or rp["role_policy"].get("parent_roles"): raise RuntimeError("Unexpected role policy scope/inheritance")
            report["role_policy_before"] = rp; save()
            policy_id = rp["metadata"]["store_identifier"]
            if not rp.get("disabled", False):
                report["role_disable_result"] = await call("manage_policies", {"action": "disable", "policy_id": policy_id})
            after = (await call("manage_policies", {"action": "get", "policy_id": policy_id}))["data"]["policy"]
            if after.get("disabled") is not True: raise RuntimeError("Role wildcard policy remains enabled")
            report["role_policy_after"] = after; save()
        for name in targets:
            # One fresh scoped discovery supplies all schemas. Every actual
            # replacement additionally gets a fresh individual policy below.
            detail = schemas[name]
            schema = detail.get("json_schema", detail.get("schema", detail))
            validate_live_schema(resources[name], schema)
            before = initial_policies[name]
            desired = policy_for(resources[name], dataset)
            native = before["resource_policy"]
            if native["resource"] != "datatable:" + name or native["scope"] != SCOPE: raise RuntimeError("Policy scope mismatch")
            already = normalized_rules(native["rules"]) == desired["rules"]
            if apply and not already:
                fresh = await get_policy(name)
                if fresh != before: raise RuntimeError("Policy changed since discovery: " + name)
                before = fresh
            owned = matches_owned_readback(name, before, histories)
            if before.get("disabled") or not (already or is_auto_policy(before) or owned): raise RuntimeError("Refusing to replace unrecognized policy: " + name)
            report["tables"][name] = {"before": before, "desired": desired, "already_restricted": already, "prior_owned_readback_match": owned}
            save()
            if apply:
                if not already:
                    report["tables"][name]["replacement_result"] = await call("manage_policies", {"action": "create_update", "policy_data": desired})
                after = before if already else await get_policy(name)
                if after.get("disabled") or normalized_rules(after["resource_policy"]["rules"]) != desired["rules"]: raise RuntimeError("Policy readback mismatch: " + name)
                report["tables"][name]["after"] = after
                print("Restricted " + name, flush=True)
            save()
        # Do not assign while concurrently created tables remain unrestricted.
        now = {r["name"] for r in (await call("get_datatable_schema", {}))["data"]}
        final_policies = await policy_snapshot()
        for name in targets:
            actual = final_policies[name]
            if apply and (actual.get("disabled") or normalized_rules(actual["resource_policy"]["rules"]) != policy_for(resources[name], dataset)["rules"]):
                raise RuntimeError("Final current policy readback mismatch: " + name)
            report["tables"][name]["after"] = actual
        protected_after = {name: final_policies[name] for name in sorted(PROTECTED)}
        report["protected_after"] = protected_after
        if protected_before != protected_after: raise RuntimeError("Existing policy changed concurrently; refusing assignment")
        report["newly_appeared"] = sorted((set(resources) & now) - set(targets))
        report["not_yet_created"] = sorted(set(resources) - now)
        save()
        if apply and (report["newly_appeared"] or report["not_yet_created"]):
            print(json.dumps({"status": "assignment_deferred", "restricted_tables": len(targets), "newly_appeared": report["newly_appeared"], "not_yet_created": report["not_yet_created"], "role_slug": role["slug"], "assigned": False}))
            return
        if apply and set(resources) <= now:
            users = (await call("list_users", {"search": USERNAME}))["data"]["users"]
            exact = [u for u in users if u["username"] == USERNAME and u["id"] == QA_USER]
            if len(exact) != 1 or exact[0].get("is_staff") or exact[0].get("is_superuser", False) or not exact[0].get("is_active"): raise RuntimeError("QA user identity/normal privilege mismatch")
            report["assignment_result"] = await call("manage_role_assignments", {"action": "assign", "roles": [role["slug"]], "usernames": [USERNAME]})
            assigned = (await call("list_users", {"role_slug": role["slug"], "search": USERNAME}))["data"]["users"]
            if not any(u["id"] == QA_USER and u["username"] == USERNAME for u in assigned): raise RuntimeError("Role assignment readback failed")
            report["assigned"] = True
        save()
        print(json.dumps({"apply": apply, "restricted_tables": len(targets), "role_slug": report.get("role_slug"), "assigned": report["assigned"], "evidence": str(output.relative_to(ROOT))}))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--apply", action="store_true")
    group.add_argument("--inspect", action="store_true")
    args = parser.parse_args()
    if args.apply or args.inspect:
        asyncio.run(run_live(args.apply))
    else:
        resources = approved_resources(json.loads(MANIFEST.read_text(encoding="utf-8")))
        print(json.dumps({"dry_run": True, "role": ROLE, "organization_id": ORG, "tables": sorted(resources), "create_only": sorted(CREATABLE), "protected": sorted(PROTECTED)}))
