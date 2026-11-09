import copy
import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from restrict_synthetic import (CREATABLE, MANIFEST, PROTECTED, ROLE, SCOPE, approved_resources,
    expired_session_error, is_auto_policy, matches_owned_readback, policy_for, read_only_call, validate_live_schema)
from allow_synthetic_lookups import append_lookup_rule
from seed_erp import ORG, fixtures
from restrict_synthetic import decode_rpc_response


def native(name, rules):
    return {"disabled": False, "variables": {}, "json_schema": "", "resource_policy": {
        "resource": "datatable:" + name, "version": "default", "scope": SCOPE,
        "rules": rules, "import_derived_roles": [], "scope_permissions": "SCOPE_PERMISSIONS_UNSPECIFIED"}}


def deny(actions):
    return {"actions": actions, "roles": ["*"], "effect": "EFFECT_DENY", "derived_roles": [], "name": ""}


def test_all_58_new_policies_exclude_existing_and_never_grant_wildcards():
    resources = approved_resources(json.loads(MANIFEST.read_text()))
    assert len(resources) == 58
    assert not PROTECTED.intersection(resources)
    for resource in resources.values():
        validate_live_schema(resource, resource["schema"])
        rules = policy_for(resource, fixtures())["rules"]
        assert not any(rule["effect"] == "EFFECT_ALLOW" and "*" in rule["roles"] for rule in rules)
        assert any(rule["effect"] == "EFFECT_DENY" and ("*" in rule["actions"] or {"update", "delete"} <= set(rule["actions"])) for rule in rules)


def test_product_create_is_zero_stock_and_confined_to_synthetic_lookups():
    resources = approved_resources(json.loads(MANIFEST.read_text()))
    rules = policy_for(resources["products"], fixtures())["rules"]
    expression = next(r for r in rules if r["actions"] == ["create"])["condition"]["match"]["expr"]
    assert ORG in expression
    assert "R.attr.stock == 0" in expression
    assert "R.attr.price >= 0" in expression
    assert fixtures()["product_categories"][0]["id"] in expression


def test_missing_live_scalar_constraint_fails_closed():
    resource = approved_resources(json.loads(MANIFEST.read_text()))["products"]
    bad = copy.deepcopy(resource["schema"])
    next(f for f in bad["fields"] if f["name"] == "name")["constraints"].pop("maxLength")
    with pytest.raises(ValueError, match="constraint differs"):
        validate_live_schema(resource, bad)


@pytest.mark.parametrize("name", sorted(PROTECTED))
def test_existing_policy_not_allowed_in_new_table_restriction(name):
    with pytest.raises(ValueError):
        policy_for({"name": name, "existing": False}, fixtures())


def test_partial_owned_readback_only_accepts_approved_child_exact_deny_all():
    name = "shipment_items"
    before = native(name, [deny(["*"])])
    history = {"app": "hmg-studio", "scope": SCOPE, "apply": True, "assigned": False, "tables": {name: {"after": copy.deepcopy(before)}}}
    assert matches_owned_readback(name, before, [history])
    changed = copy.deepcopy(before)
    changed["resource_policy"]["rules"][0]["effect"] = "EFFECT_ALLOW"
    assert not matches_owned_readback(name, changed, [history])
    changed = copy.deepcopy(before)
    changed["resource_policy"]["scope"] = "insurance_hmg-stones"
    assert not matches_owned_readback(name, changed, [history])
    before["disabled"] = True
    assert not matches_owned_readback(name, before, [history])
    unrelated = native("orders", [deny(["*"])])
    history["tables"]["orders"] = {"after": copy.deepcopy(unrelated)}
    assert not matches_owned_readback("orders", unrelated, [history])
    history["assigned"] = True
    assert matches_owned_readback("orders", unrelated, [history])


@pytest.mark.parametrize("name", ["warehouses", "product_locations"])
def test_lookup_exception_preserves_write_denial_and_exact_scope(name):
    before = native(name, [deny(["read", "create", "update", "delete"])])
    original = copy.deepcopy(before)
    _, expected = append_lookup_rule(name, before, fixtures())
    assert before == original
    assert expected["rules"][0] == deny(["create", "update", "delete"])
    read_deny, read_allow = expected["rules"][1:]
    expression = read_allow["condition"]["match"]["expr"]
    assert read_deny["condition"]["match"]["expr"] == "!(" + json.dumps(ROLE) + " in P.roles && (" + expression + "))"
    assert ORG in expression and read_allow["roles"] == [ROLE] and read_allow["actions"] == ["read"]
    before["resource_policy"] = expected
    assert append_lookup_rule(name, before, fixtures())[1] == expected


def test_lookup_rejects_foreign_fixture_unknown_deny_and_altered_named_rule():
    before = native("warehouses", [deny(["read", "create", "update", "delete"])])
    bad = fixtures()
    bad["warehouses"][0]["organization_id"] = "foreign"
    with pytest.raises(ValueError, match="escaped"):
        append_lookup_rule("warehouses", before, bad)
    before["resource_policy"]["rules"] = [deny(["*"])]
    with pytest.raises(ValueError, match="deny shape"):
        append_lookup_rule("warehouses", before, fixtures())


@pytest.mark.parametrize("name", ["organizations", "product_categories"])
def test_other_lookup_existing_rules_are_unchanged(name):
    before = native(name, [deny(["create", "update", "delete"])])
    _, expected = append_lookup_rule(name, before, fixtures())
    assert expected["rules"][:-1] == before["resource_policy"]["rules"]
    assert expected["rules"][-1]["actions"] == ["read"]


@pytest.mark.parametrize("name,args", [("manage_policies", {"action": "create_update"}), ("manage_role_assignments", {"action": "assign"}), ("datatable_data", {"action": "upsert"}), ("manage_roles", {"action": "create"})])
def test_mutations_are_never_automatically_retried(name, args):
    assert not read_only_call(name, args)


def test_read_retry_and_error_group_detection_are_narrow():
    assert read_only_call("manage_policies", {"action": "get"})
    assert expired_session_error(ExceptionGroup("transport", [RuntimeError("Session terminated")]))
    assert not expired_session_error(ExceptionGroup("transport", [RuntimeError("Session terminated"), RuntimeError("Policy invalid")]))


def test_404_retry_only_covers_exact_mcp_transport_endpoint():
    import httpx
    for url, expected in [("https://insurance.taruvi.cloud/mcp/", True), ("https://insurance.taruvi.cloud/api/apps/hmg-studio/datatables/missing/data/", False)]:
        response = httpx.Response(404, request=httpx.Request("POST", url))
        error = httpx.HTTPStatusError("Not found", request=response.request, response=response)
        assert expired_session_error(error) is expected


def test_stateless_mcp_decodes_json_and_sse_with_correlated_id():
    reply = {"jsonrpc": "2.0", "id": 7, "result": {"content": [{"type": "text", "text": json.dumps({"success": True, "data": {"safe": True}})}]}}
    assert decode_rpc_response(json.dumps(reply), "application/json", 7)["data"]["safe"]
    assert decode_rpc_response("event: message\r\r\ndata: " + json.dumps(reply) + "\r\r\n\r\r\n", "text/event-stream", 7)["data"]["safe"]
    with pytest.raises(RuntimeError, match="correlation"):
        decode_rpc_response(json.dumps(reply), "application/json", 8)
    reply["result"]["isError"] = True
    with pytest.raises(RuntimeError, match="tool reported"):
        decode_rpc_response(json.dumps(reply), "application/json", 7)
    with pytest.raises(RuntimeError, match="JSON-RPC error"):
        decode_rpc_response(json.dumps({"jsonrpc": "2.0", "id": 7, "error": {"code": -32000, "message": "invalid"}}), "application/json", 7)
