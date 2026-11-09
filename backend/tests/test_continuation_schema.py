import copy
import asyncio
import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from restrict_synthetic import MANIFEST, ROLE, SCOPE, policy_for
from seed_erp import ORG, fixtures


def original_policy():
    return {"disabled": False, "variables": {}, "json_schema": "", "resource_policy": {
        "resource": "datatable:notifications", "version": "default", "scope": SCOPE,
        "import_derived_roles": [], "scope_permissions": "SCOPE_PERMISSIONS_UNSPECIFIED",
        "rules": [
            {"actions": ["read"], "roles": [ROLE], "effect": "EFFECT_ALLOW",
             "condition": {"match": {"expr": "R.attr.organization_id == " + json.dumps(ORG)}},
             "derived_roles": [], "name": ""},
            {"actions": ["create", "update", "delete"], "roles": ["*"], "effect": "EFFECT_DENY",
             "derived_roles": [], "name": ""}]}}


def test_notification_generator_enforces_owner_without_any_write_grants():
    resource = next(r for r in json.loads(MANIFEST.read_text())["resources"] if r["name"] == "notifications")
    rules = policy_for(resource, fixtures())["rules"]
    expression = rules[0]["condition"]["match"]["expr"]
    assert 'P.id == "qa_hmg_inbox_20261106" && R.attr.user_id == "1bbbcad2-46c3-480f-92d6-acdf566b510a"' in expression
    assert 'P.id == "qa_hmg_preferences_20261106" && R.attr.user_id == "bb17fd27-1f5e-4691-b2c7-e9745883e54f"' in expression
    assert "R.attr.user_id == P.id" not in expression
    assert rules[1]["actions"] == ["create", "update", "delete"]
    assert rules[1]["effect"] == "EFFECT_DENY"


def test_notification_proposal_preserves_policy_and_is_idempotent():
    from continuation_schema import notification_owner_proposal
    before = original_policy()
    snapshot = copy.deepcopy(before)
    payload, expected = notification_owner_proposal(before)
    assert before == snapshot
    assert expected["rules"][1] == before["resource_policy"]["rules"][1]
    assert payload["rules"] == expected["rules"]
    reverted = copy.deepcopy(expected)
    reverted["rules"][0]["condition"] = snapshot["resource_policy"]["rules"][0]["condition"]
    assert reverted == snapshot["resource_policy"]
    assert 'P.id == "qa_hmg_inbox_20261106"' in expected["rules"][0]["condition"]["match"]["expr"]
    after = {**before, "resource_policy": expected}
    assert notification_owner_proposal(after) == (payload, expected)


def test_notification_known_uuid_principal_policy_can_be_corrected_to_exact_pairs():
    from continuation_schema import notification_owner_proposal
    before = original_policy()
    before["resource_policy"]["rules"][0]["condition"]["match"]["expr"] += " && R.attr.user_id == P.id"
    _, expected = notification_owner_proposal(before)
    expr = expected["rules"][0]["condition"]["match"]["expr"]
    assert "R.attr.user_id == P.id" not in expr
    assert expr.count("P.id ==") == 2
    assert expr.count("R.attr.user_id ==") == 2
    assert "P.attr" not in expr


def test_notification_swapped_username_uuid_pair_is_rejected():
    from continuation_schema import notification_owner_proposal
    before = original_policy()
    before["resource_policy"] = notification_owner_proposal(before)[1]
    rule = before["resource_policy"]["rules"][0]
    rule["condition"]["match"]["expr"] = rule["condition"]["match"]["expr"].replace(
        "1bbbcad2-46c3-480f-92d6-acdf566b510a", "bb17fd27-1f5e-4691-b2c7-e9745883e54f")
    with pytest.raises(ValueError, match="drifted"):
        notification_owner_proposal(before)


@pytest.mark.parametrize("change", [{"id": "foreign"}, {"is_active": False}, {"is_staff": True}, {"is_superuser": True}])
def test_native_qa_pair_validation_rejects_identity_or_privilege_drift(change):
    from continuation_schema import validate_qa_owner
    username, uid = "qa_hmg_inbox_20261106", "1bbbcad2-46c3-480f-92d6-acdf566b510a"
    user = {"username": username, "id": uid, "is_active": True, "is_staff": False}
    validate_qa_owner(username, uid, [user])
    with pytest.raises(ValueError):
        validate_qa_owner(username, uid, [{**user, **change}])
    with pytest.raises(ValueError):
        validate_qa_owner(username, uid, [])


@pytest.mark.parametrize("mutation", [
    lambda p: p.update(disabled=True),
    lambda p: p.update(variables={"unknown": True}),
    lambda p: p["resource_policy"].update(scope="insurance_hmg-stones"),
    lambda p: p["resource_policy"].update(resource="datatable:customers"),
    lambda p: p["resource_policy"]["rules"][0].update(roles=["*"]),
    lambda p: p["resource_policy"]["rules"].pop(),
    lambda p: p["resource_policy"]["rules"][1].update(effect="EFFECT_ALLOW"),
    lambda p: p["resource_policy"]["rules"].append({"actions": ["*"], "effect": "EFFECT_ALLOW"}),
])
def test_notification_proposal_refuses_drift_or_broadening(mutation):
    from continuation_schema import notification_owner_proposal
    before = original_policy()
    mutation(before)
    with pytest.raises(ValueError):
        notification_owner_proposal(before)


@pytest.mark.parametrize("name,changes", [
    ("saved_reports", {"columns": "array", "filters": "array", "sort": "object"}),
    ("activity_logs", {"properties": "object"}),
])
def test_json_proposal_changes_only_four_types_preserving_every_schema_value(name, changes):
    from continuation_schema import json_schema_proposal
    resource = next(r for r in json.loads(MANIFEST.read_text())["resources"] if r["name"] == name)
    before = copy.deepcopy(resource["schema"])
    before["custom_metadata"] = {"must": ["survive"]}
    proposed = json_schema_proposal(name, before)
    assert before == {**resource["schema"], "custom_metadata": {"must": ["survive"]}}
    assert {f["name"]: f["type"] for f in proposed["fields"] if f["name"] in changes} == changes
    for field in proposed["fields"]:
        if field["name"] in changes:
            field["type"] = "any"
    assert proposed == before


def test_json_proposal_refuses_out_of_scope_or_unexpected_type():
    from continuation_schema import json_schema_proposal
    with pytest.raises(ValueError):
        json_schema_proposal("notifications", {"fields": [{"name": "data", "type": "any"}]})
    with pytest.raises(ValueError):
        json_schema_proposal("activity_logs", {"fields": [{"name": "properties", "type": "string"}]})


def test_policy_recheck_drift_aborts_without_any_write():
    from continuation_schema import restrict_notification_reads
    calls = []
    async def call(name, args):
        calls.append(args["action"])
        policy = original_policy()
        if len(calls) == 2:
            policy["metadata"] = {"changed": True}
        return {"data": {"policy": policy}}
    with pytest.raises(RuntimeError, match="changed during review"):
        asyncio.run(restrict_notification_reads(call, lambda _: None))
    assert calls == ["get", "get"]


def test_policy_write_failure_is_not_retried():
    from continuation_schema import restrict_notification_reads
    calls = []
    async def call(name, args):
        calls.append(args["action"])
        if args["action"] == "create_update":
            raise TimeoutError("Unknown outcome; reconcile first")
        return {"data": {"policy": original_policy()}}
    with pytest.raises(TimeoutError):
        asyncio.run(restrict_notification_reads(call, lambda _: None))
    assert calls == ["get", "get", "create_update"]


def test_policy_already_restricted_only_reads_and_requires_exact_readback():
    from continuation_schema import notification_owner_proposal, restrict_notification_reads
    before = original_policy()
    before["resource_policy"] = notification_owner_proposal(before)[1]
    calls = []
    reports = []
    async def call(name, args):
        calls.append(args["action"])
        return {"data": {"policy": before}}
    result = asyncio.run(restrict_notification_reads(call, lambda r: reports.append(copy.deepcopy(r))))
    assert calls == ["get", "get"]
    assert result["verified"] is True
    assert reports[0]["verified"] is False
    assert reports[-1]["writes_granted"] is False
