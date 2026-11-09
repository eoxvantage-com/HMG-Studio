"""Pure, offline Admin master-policy *planner*, not a deployment script.

No network, credentials, apply mode or frontend enablement. The legacy staged
planner below retains its original constraints. The separate full-Admin planner
implements later explicit role-only CRUD authorization on five master resources.

Legacy staged scope: Customers/suppliers
are the only create candidates; organizations is lookup-read only. Other masters
need FK/default/hierarchy review. The existing category function already allows
execute, so it needs no policy change.

A caller must provide a freshly verified app-local organization UUID snapshot.
This is an existence bound, NOT a new membership mapping: Admin is authorized
for all business organizations in this app. New organizations require replanning.
UUID syntax alone is not proof of existence; native FK enforcement remains needed.
These draft CEL guards do not prove wire-type/coercion, unknown-field rejection,
or native proposed-row enforcement. Do not apply before those live gates pass.
"""
import copy
import json
from uuid import UUID

SCOPE = 'insurance_hmg-studio'
GATE = '"Admin" in P.roles'
SUPPORTED = frozenset({'customers', 'suppliers', 'organizations'})
PREFIX = 'admin_master_'


def _validate(name, before, supported=SUPPORTED):
    if name not in supported:
        raise ValueError('Resource requires separate integrity review')
    allowed = {'api_version', 'disabled', 'description', 'metadata', 'resource_policy', 'variables', 'json_schema'}
    if not isinstance(before, dict) or set(before) - allowed:
        raise ValueError('Unknown policy envelope')
    if before.get('api_version', 'api.cerbos.dev/v1') != 'api.cerbos.dev/v1' or before.get('disabled', False) is not False:
        raise ValueError('Disabled or unknown API version')
    if before.get('description') or before.get('variables') or before.get('json_schema'):
        raise ValueError('Policy features require preservation review')
    native = before.get('resource_policy')
    keys = {'resource', 'version', 'scope', 'rules', 'import_derived_roles', 'scope_permissions'}
    if not isinstance(native, dict) or set(native) - keys:
        raise ValueError('Unknown resource policy features')
    if native.get('resource') != 'datatable:' + name or native.get('version') != 'default' or native.get('scope') != SCOPE:
        raise ValueError('Unexpected resource identity/scope')
    if native.get('import_derived_roles') or native.get('scope_permissions') not in (None, 'SCOPE_PERMISSIONS_UNSPECIFIED'):
        raise ValueError('Derived roles or scope permissions require review')
    if not isinstance(native.get('rules'), list) or not native['rules']:
        raise ValueError('Missing rules')
    for rule in native['rules']:
        keys = {'actions', 'roles', 'effect', 'derived_roles', 'name', 'condition'}
        if not isinstance(rule, dict) or set(rule) - keys or rule.get('derived_roles'):
            raise ValueError('Unknown rule authoring shape')
        for field in ('actions', 'roles'):
            values = rule.get(field)
            if not isinstance(values, list) or not values or any(not isinstance(v, str) or not v for v in values) or len(set(values)) != len(values):
                raise ValueError('Invalid rule ' + field)
        if set(rule['actions']) - {'read', 'create', 'update', 'delete'}:
            raise ValueError('Wildcard or unknown actions require manual review')
        if rule.get('effect') not in {'EFFECT_ALLOW', 'EFFECT_DENY'} or not isinstance(rule.get('name', ''), str):
            raise ValueError('Invalid rule effect/name')
        if 'condition' in rule:
            condition = rule['condition']
            if (not isinstance(condition, dict) or set(condition) != {'match'}
                    or not isinstance(condition['match'], dict) or set(condition['match']) != {'expr'}
                    or not isinstance(condition['match']['expr'], str) or not condition['match']['expr'].strip()):
                raise ValueError('Exotic condition requires manual review')
    return native


def _rule(actions, effect, name, expr=None, roles=None):
    rule = {'actions': actions, 'roles': roles or ['*'], 'effect': effect, 'derived_roles': [], 'name': name}
    if expr is not None:
        rule['condition'] = {'match': {'expr': expr}}
    return rule


def plan_policy(name, before, existing_org_ids):
    """Return flat authoring payload and exact expected native body, without I/O.

    Preserve every existing allow and restrict deny exceptions to the Admin
    role's read/create. Reject any conflicting planner-owned rule on rerun.
    Transport metadata is never sent as authoring data; caller must separately
    compare fresh full policy/hash against its snapshot immediately before save.
    """
    native = _validate(name, before)
    if not isinstance(existing_org_ids, (list, tuple)) or not existing_org_ids:
        raise ValueError('Verified existing organization snapshot required')
    if any(not isinstance(value, str) or str(UUID(value)) != value for value in existing_org_ids):
        raise ValueError('Organization IDs must be canonical UUIDs')
    if len(set(existing_org_ids)) != len(existing_org_ids):
        raise ValueError('Duplicate organization IDs')
    ids = json.dumps(sorted(existing_org_ids))
    grants = [_rule(['read'], 'EFFECT_ALLOW', PREFIX + 'read', GATE, ['Admin'])]
    if name != 'organizations':
        expr = (GATE + ' && R.attr.organization_id in ' + ids
                + " && R.attr.name.matches('.*[^[:space:]].*') && size(R.attr.name) <= 255"
                + ' && (!has(R.attr.deleted_at) || R.attr.deleted_at == null)'
                + " && R.attr.currency.matches('^[A-Z]{3}$') && R.attr.is_active == true")
        if name == 'customers':
            expr += ' && (!has(R.attr.credit_limit) || R.attr.credit_limit == null || R.attr.credit_limit >= 0)'
        else:
            expr += ' && (!has(R.attr.rating) || R.attr.rating == null || (type(R.attr.rating) == int && R.attr.rating >= 0 && R.attr.rating <= 5))'
        grants.append(_rule(['create'], 'EFFECT_ALLOW', PREFIX + 'create', expr, ['Admin']))
    eligible = {'read'} if name == 'organizations' else {'read', 'create'}
    preserved = []
    guard_actions = ['create', 'update', 'delete'] if name == 'organizations' else ['update', 'delete']
    owned = {rule['name']: rule for rule in grants}
    seen = set()
    for rule in native['rules']:
        rule_name = rule.get('name', '')
        if rule_name.startswith(PREFIX):
            if rule_name in seen or owned.get(rule_name) != rule:
                raise ValueError('Conflicting planner-owned rule')
            seen.add(rule_name)
            continue
        if rule['effect'] != 'EFFECT_DENY' or not eligible.intersection(rule['actions']):
            preserved.append(copy.deepcopy(rule))
            continue
        # Keep original role selectors, including extra roles Admin may
        # hold: preserve non-Admin behavior, excluding only the role gate.
        remaining = [a for a in rule['actions'] if a not in eligible]
        if remaining:
            preserved.append(dict(copy.deepcopy(rule), actions=remaining))
        exception = copy.deepcopy(rule)
        exception['actions'] = [a for a in rule['actions'] if a in eligible]
        old = rule.get('condition', {}).get('match', {}).get('expr')
        suffix = '!(' + GATE + ')'
        expression = suffix if old is None else '(' + old + ') && ' + suffix
        # Already-transformed deny: preserve it verbatim on repeat planning.
        if old == suffix or (old and old.endswith(' && ' + suffix)):
            expression = old
        exception['condition'] = {'match': {'expr': expression}}
        preserved.append(exception)
    # Never revoke unrelated grants by synthesizing new mutation denies.
    denied = set()
    for rule in preserved:
        if rule['effect'] == 'EFFECT_DENY' and rule['roles'] == ['*'] and 'condition' not in rule:
            denied.update(rule['actions'])
    if not set(guard_actions) <= denied:
        raise ValueError('Existing universal protected-write deny required')
    expected = copy.deepcopy(native)
    expected['rules'] = preserved + grants
    payload = {'name': name, 'policy_type': 'resource', 'entity_type': 'datatable', 'version': 'default', 'rules': copy.deepcopy(expected['rules'])}
    return payload, expected


def matches_readback(name, after, expected):
    """Fail closed on disabled/scope/feature drift and compare the FULL native body."""
    try:
        return _validate(name, after) == expected
    except (ValueError, TypeError, KeyError):
        return False





# Explicit later user authorization: role-only full CRUD on these five masters.
# This is separate from the earlier staged read/create planner, which is retained.
FULL_ADMIN_SUPPORTED = frozenset({'products', 'customers', 'suppliers', 'warehouses', 'product_locations', 'organizations'})
FULL_ADMIN_RULE = 'full_admin_master_access'


def plan_full_admin_master_policy(name, before):
    """Pure role-only Admin CRUD proposal; organization management stays excluded.

    No username, business-organization condition or arbitrary-resource wildcard.
    Existing non-Admin ALLOW rules remain byte-for-value; existing DENY predicates
    remain equivalent for every principal without Admin (including mixed roles).
    Only the enumerated action set is excluded from DENY for Admin.
    """
    native = _validate(name, before, FULL_ADMIN_SUPPORTED)
    actions = ['read'] if name == 'organizations' else ['read', 'create', 'update', 'delete']
    grant = _rule(actions, 'EFFECT_ALLOW', FULL_ADMIN_RULE, roles=['Admin'])
    suffix = '!(' + GATE + ')'
    rules = []
    seen = False
    for original in native['rules']:
        if original.get('name') == FULL_ADMIN_RULE:
            if seen or original != grant:
                raise ValueError('Conflicting full Admin rule')
            seen = True
            continue
        if original['effect'] != 'EFFECT_DENY' or not set(actions).intersection(original['actions']):
            rules.append(copy.deepcopy(original))
            continue
        remaining = [action for action in original['actions'] if action not in actions]
        if remaining:
            rules.append(dict(copy.deepcopy(original), actions=remaining))
        exception = copy.deepcopy(original)
        exception['actions'] = [action for action in original['actions'] if action in actions]
        old = original.get('condition', {}).get('match', {}).get('expr')
        expression = suffix if old is None else '(' + old + ') && ' + suffix
        if old == suffix or (old and old.endswith(' && ' + suffix)):
            expression = old
        exception['condition'] = {'match': {'expr': expression}}
        rules.append(exception)
    expected = copy.deepcopy(native)
    expected['rules'] = rules + [grant]
    payload = {'name': name, 'policy_type': 'resource', 'entity_type': 'datatable',
               'version': 'default', 'rules': copy.deepcopy(expected['rules'])}
    return payload, expected


def matches_full_admin_readback(name, after, expected):
    try:
        return _validate(name, after, FULL_ADMIN_SUPPORTED) == expected
    except (ValueError, TypeError, KeyError):
        return False

