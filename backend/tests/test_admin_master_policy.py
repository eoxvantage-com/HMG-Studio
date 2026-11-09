"""Offline policy planner tests; no credentials or live service dependency."""
import copy
import importlib.util
from pathlib import Path

import pytest

SCRIPT = Path(__file__).resolve().parents[1] / 'scripts' / 'enable_admin_masters.py'
ORG = '616d839b-e107-4511-b12f-fd6ed301d999'


def planner():
    assert SCRIPT.exists(), 'The offline Admin planner is not implemented'
    spec = importlib.util.spec_from_file_location('admin_plan', SCRIPT)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def rule(actions, effect='EFFECT_DENY', roles=None, expr=None):
    value = dict(actions=actions, roles=roles or ['*'], effect=effect, derived_roles=[], name='')
    if expr:
        value['condition'] = {'match': {'expr': expr}}
    return value


def native(name='customers', rules=None):
    return {'api_version': 'api.cerbos.dev/v1', 'disabled': False, 'description': '',
            'variables': {}, 'json_schema': '', 'resource_policy': {
                'resource': 'datatable:' + name, 'version': 'default', 'scope': 'insurance_hmg-studio',
                'import_derived_roles': [], 'scope_permissions': 'SCOPE_PERMISSIONS_UNSPECIFIED',
                'rules': rules if rules is not None else [rule(['read'], 'EFFECT_ALLOW', ['QA'], 'R.attr.organization_id == "qa"'), rule(['update', 'delete'])]}}


@pytest.mark.parametrize('name', ['customers', 'suppliers', 'organizations'])
def test_preservation_identity_idempotence_and_readback(name):
    m = planner()
    before = native(name)
    if name == 'organizations': before['resource_policy']['rules'][1]['actions'] = ['create', 'update', 'delete']
    original = copy.deepcopy(before)
    payload, expected = m.plan_policy(name, before, [ORG])
    assert before == original
    assert expected['rules'][:2] == before['resource_policy']['rules']
    added = expected['rules'][2:]
    assert [r['actions'] for r in added] == ([['read']] if name == 'organizations' else [['read'], ['create']])
    assert all(r['roles'] == ['Admin'] and m.GATE in r['condition']['match']['expr'] for r in added)
    assert set(payload) == {'name', 'policy_type', 'entity_type', 'version', 'rules'}
    after = dict(before, resource_policy=expected)
    assert m.plan_policy(name, after, [ORG]) == (payload, expected)
    assert m.matches_readback(name, after, expected)
    after['disabled'] = True
    assert not m.matches_readback(name, after, expected)


def test_split_only_read_create_deny_and_preserve_other_principals():
    m = planner()
    before = native(rules=[rule(['read', 'create', 'update', 'delete'], expr='P.id != "qa"'), rule(['update', 'delete'])])
    _, expected = m.plan_policy('customers', before, [ORG])
    assert expected['rules'][0] == rule(['update', 'delete'], expr='P.id != "qa"')
    assert expected['rules'][1]['actions'] == ['read', 'create']
    assert expected['rules'][1]['condition']['match']['expr'] == '(P.id != "qa") && !(' + m.GATE + ')'
    assert any(r['actions'] == ['update', 'delete'] and 'condition' not in r for r in expected['rules'])


@pytest.mark.parametrize('change', ['disabled', 'scope', 'wildcard', 'unknown_action', 'variables', 'schema', 'derived', 'output', 'unknown_native', 'description', 'condition'])
def test_reject_unroundtrippable_or_ambiguous_policy(change):
    m = planner()
    before = native()
    if change == 'disabled': before['disabled'] = True
    elif change == 'scope': before['resource_policy']['scope'] = 'wrong_app'
    elif change == 'wildcard': before['resource_policy']['rules'][1]['actions'] = ['*']
    elif change == 'unknown_action': before['resource_policy']['rules'][1]['actions'] = ['upsert']
    elif change == 'variables': before['variables'] = {'x': 'true'}
    elif change == 'schema': before['json_schema'] = '{}'
    elif change == 'derived': before['resource_policy']['rules'][0]['derived_roles'] = ['owner']
    elif change == 'output': before['resource_policy']['rules'][0]['output'] = {}
    elif change == 'unknown_native': before['resource_policy']['new_feature'] = {}
    elif change == 'description': before['description'] = 'must preserve'
    elif change == 'condition': before['resource_policy']['rules'][0]['condition'] = {'match': {'all': []}}
    with pytest.raises(ValueError): m.plan_policy('customers', before, [ORG])


@pytest.mark.parametrize('name', ['warehouses', 'product_locations', 'product_categories', 'products', 'hmg-categories-v1'])
def test_unreviewed_resources_rejected(name):
    with pytest.raises(ValueError): planner().plan_policy(name, native(name), [ORG])


@pytest.mark.parametrize('ids', [[], ['not-uuid'], [ORG, ORG], ['616D839B-E107-4511-B12F-FD6ED301D999']])
def test_existing_org_snapshot_required(ids):
    with pytest.raises(ValueError): planner().plan_policy('customers', native(), ids)


def test_conflicting_named_rule_rejected_and_existence_bounded():
    m = planner()
    _, expected = m.plan_policy('customers', native(), [ORG])
    create = expected['rules'][-1]
    assert 'R.attr.organization_id in ["' + ORG + '"]' in create['condition']['match']['expr']
    assert 'deleted_at' in create['condition']['match']['expr']
    assert 'credit_limit >= 0' in create['condition']['match']['expr']
    create['roles'] = ['*']
    with pytest.raises(ValueError): m.plan_policy('customers', dict(native(), resource_policy=expected), [ORG])


def test_readback_rejects_rule_drift_and_preserves_payload_isolation():
    m = planner()
    payload, expected = m.plan_policy('suppliers', native('suppliers'), [ORG])
    payload['rules'][-1]['roles'] = ['*']
    assert expected['rules'][-1]['roles'] == ['Admin']
    after = dict(native('suppliers'), resource_policy=copy.deepcopy(expected))
    after['resource_policy']['rules'][-1]['actions'] = ['update']
    assert not m.matches_readback('suppliers', after, expected)


def test_existing_universal_deny_is_idempotent():
    m = planner()
    before = native(rules=[rule(['read', 'create', 'update', 'delete'], expr='P.id != "qa"'), rule(['update', 'delete'])])
    payload, expected = m.plan_policy('customers', before, [ORG])
    assert m.plan_policy('customers', dict(before, resource_policy=expected), [ORG]) == (payload, expected)

def test_missing_universal_deny_rejects_instead_of_revoking_other_users():
    m = planner()
    before = native(rules=[rule(['update'], 'EFFECT_ALLOW', ['Other Editor'])])
    with pytest.raises(ValueError, match='universal'):
        m.plan_policy('customers', before, [ORG])



def test_admin_grants_are_role_based_without_username_special_cases():
    m = planner()
    assert m.GATE == '"Admin" in P.roles'
    _, expected = m.plan_policy('customers', native(), [ORG])
    for grant in expected['rules'][-2:]:
        assert grant['roles'] == ['Admin']
        assert 'P.id' not in grant['condition']['match']['expr']
        assert 'pradeep' not in grant['condition']['match']['expr'].lower()

@pytest.mark.parametrize('name', ['products', 'customers', 'suppliers', 'warehouses', 'product_locations', 'organizations'])
def test_full_admin_plan_is_unconditional_and_idempotent(name):
    m = planner()
    assert hasattr(m, 'plan_full_admin_master_policy'), 'Full Admin planner missing'
    before = native(name, [rule(['read'], 'EFFECT_ALLOW', ['QA'], 'R.attr.organization_id == "qa"'), rule(['read', 'create', 'update', 'delete'])])
    untouched = copy.deepcopy(before)
    payload, expected = m.plan_full_admin_master_policy(name, before)
    assert before == untouched
    assert expected['rules'][0] == before['resource_policy']['rules'][0]
    grant = expected['rules'][-1]
    assert grant['roles'] == ['Admin'] and 'condition' not in grant
    assert grant['actions'] == (['read'] if name == 'organizations' else ['read', 'create', 'update', 'delete'])
    assert m.plan_full_admin_master_policy(name, dict(before, resource_policy=expected)) == (payload, expected)
    for deny in expected['rules'][1:-1]:
        assert deny['effect'] == 'EFFECT_DENY'
        if 'condition' in deny:
            assert deny['condition']['match']['expr'] == '!("Admin" in P.roles)'
        else:
            assert name == 'organizations' and deny['actions'] == ['create', 'update', 'delete']


def test_full_admin_preserves_conditional_denial_for_nonadmins_and_rejects_drift():
    m = planner()
    assert hasattr(m, 'plan_full_admin_master_policy'), 'Full Admin planner missing'
    before = native(rules=[rule(['update', 'delete'], expr='R.attr.organization_id != "qa"')])
    _, expected = m.plan_full_admin_master_policy('customers', before)
    assert expected['rules'][0]['condition']['match']['expr'] == '(R.attr.organization_id != "qa") && !("Admin" in P.roles)'
    expected['rules'][-1]['roles'] = ['*']
    with pytest.raises(ValueError):
        m.plan_full_admin_master_policy('customers', dict(before, resource_policy=expected))


@pytest.mark.parametrize('name', ['product_categories', 'orders', 'stock_movements', 'payments'])
def test_full_admin_excludes_unapproved_resources(name):
    m = planner()
    assert hasattr(m, 'plan_full_admin_master_policy'), 'Full Admin planner missing'
    with pytest.raises(ValueError): m.plan_full_admin_master_policy(name, native(name))


def test_full_admin_readback_and_legacy_planner_boundaries():
    m = planner()
    before = native('products')
    payload, expected = m.plan_full_admin_master_policy('products', before)
    after = dict(before, resource_policy=expected)
    assert m.matches_full_admin_readback('products', after, expected)
    assert not m.matches_readback('products', after, expected)
    with pytest.raises(ValueError): m.plan_policy('products', before, [ORG])
    payload['rules'][-1]['actions'] = ['*']
    assert expected['rules'][-1]['actions'] == ['read', 'create', 'update', 'delete']
    after['disabled'] = True
    assert not m.matches_full_admin_readback('products', after, expected)


@pytest.mark.parametrize('actions', [['*'], ['upsert']])
def test_full_admin_rejects_unknown_deny_actions(actions):
    with pytest.raises(ValueError):
        planner().plan_full_admin_master_policy('customers', native(rules=[rule(actions)]))
