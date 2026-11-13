"""Adapter contracts with deterministic native-service and caller SDK fakes."""
import copy
import importlib.util
import json
from pathlib import Path
from types import SimpleNamespace
from uuid import uuid4

import pytest

ROOT = Path(__file__).parents[1]
TEST_ORG = '616d839b-e107-4511-b12f-fd6ed301d999'
LEGACY_QA_ORG = '5d61a85e-d8e4-5a2a-a861-0c1dabe2a352'


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_adapter_exists():
    assert (ROOT / 'functions' / 'stock_ledger.py').exists()


@pytest.fixture
def adapter(monkeypatch):
    import sys
    domain = load('stock_ledger_domain', ROOT / 'functions' / 'stock_ledger_domain.py')
    monkeypatch.setitem(sys.modules, 'stock_ledger_domain', domain)
    return load('stock_ledger', ROOT / 'functions' / 'stock_ledger.py')


class Query:
    def __init__(self, sdk, table):
        self.sdk, self.table, self.filters = sdk, table, {}

    def filter(self, field, op, value):
        assert op == 'eq'
        self.filters[field] = value
        return self

    def page_size(self, size):
        return self

    def execute(self):
        self.sdk.reads.append((self.table, self.filters))
        if self.sdk.deny_org:
            return {'data': [], 'total': 0}
        return {'data': [dict(self.filters, is_active=True, deleted_at=None,
                             has_variants=False, tracking_type='none', type='standard',
                             settings={'stock_authority': 'ledger_v2'})], 'total': 1}


class SDK:
    def __init__(self):
        self.allowed, self.deny_org, self.secret_reads = True, False, 0
        self.reads = []
        self.secret = {'value': {'username': 'svc_hmg_ledger_20261111', 'password': 'test-only-password'}}
        self.policy = SimpleNamespace(check_resources=self.policy_check)
        self.database = SimpleNamespace(from_=lambda table: Query(self, table))
        self.secrets = SimpleNamespace(get=self.secret_get)

    def policy_check(self, resources, principal):
        assert principal is None
        assert resources[0]['resource']['kind'] == 'function:hmg-stock-ledger-v1'
        return {'results': [{'actions': {'execute': 'EFFECT_ALLOW' if self.allowed else 'EFFECT_DENY'}}]}

    def secret_get(self, name):
        self.secret_reads += 1
        assert name == 'hmg_ledger_writer_qa'
        return self.secret


class Response:
    def __init__(self, body, status=200):
        self.status_code, self.content = status, json.dumps(body).encode()

    def json(self):
        return json.loads(self.content)


class Native:
    def __init__(self, adapter):
        self.adapter, self.rows, self.calls = adapter, [], []
        self.lose_response, self.deny_write, self.conflict = False, False, None
        self.conflict_status = 409
        self.me = {'data': {'username': adapter.SERVICE_USER}}
        self.redirect = False
        genesis = adapter.opening_event(TEST_ORG, str(uuid4()), [
            {'product_id': 'p', 'location_id': 'a', 'quantity': 10, 'reserved': 2},
            {'product_id': 'p', 'location_id': 'b', 'quantity': 0, 'reserved': 0}], [], 'admin')
        self.rows.append(adapter.event_row(genesis))

    def __enter__(self):
        return self

    def __exit__(self, *args):
        pass

    def request(self, method, url, **kwargs):
        self.calls.append((method, url, kwargs))
        assert url.startswith(self.adapter.ORIGIN + '/')
        if self.redirect:
            return Response({}, 302)
        if url.endswith('/jwt/token/'):
            return Response({'access': 'test-token'})
        if url.endswith('/users/me/'):
            return Response(self.me)
        assert url == self.adapter.DATA_URL
        if method == 'GET':
            params = kwargs['params']
            assert params['organization_id__eq'] == TEST_ORG
            rows = copy.deepcopy(self.rows)
            if 'sequence__lte' in params:
                rows = [r for r in rows if r['sequence'] <= params['sequence__lte']]
            rows.sort(key=lambda r: r['sequence'], reverse=params['ordering'].startswith('-'))
            total = len(rows)
            start = (params['page'] - 1) * params['page_size']
            return Response({'data': rows[start:start + params['page_size']], 'total': total})
        if self.deny_write:
            return Response({}, 403)
        if self.conflict:
            self.rows.append(self.conflict)
            self.conflict = None
            return Response({}, self.conflict_status)
        row = kwargs['json']
        if any(r['request_key'] == row['request_key'] or r['predecessor_key'] == row['predecessor_key'] for r in self.rows):
            return Response({}, 409)
        self.rows.append(copy.deepcopy(row))
        if self.lose_response:
            self.lose_response = False
            raise TimeoutError('secret must not escape')
        return Response({'data': [row], 'total': 1}, 201)


@pytest.fixture
def setup(adapter, monkeypatch):
    native, sdk = Native(adapter), SDK()
    monkeypatch.setattr(adapter, "ENABLED_BASELINES", {**adapter.ENABLED_BASELINES, TEST_ORG: native.rows[0]["event"]["event_hash"]})

    def factory(**kwargs):
        assert kwargs['follow_redirects'] is False
        assert kwargs['trust_env'] is False
        assert kwargs['verify'] is True
        return native

    monkeypatch.setattr(adapter.httpx, 'Client', factory)
    return adapter, native, sdk


def command():
    return {'request_id': str(uuid4()), 'action': 'direct', 'kind': 'movement',
            'reason': 'test', 'lines': [{'product_id': 'p', 'source': 'a', 'destination': 'b', 'quantity': 3}]}


def invoke(setup, cmd=None):
    a, native, sdk = setup
    params = {'organization_id': TEST_ORG, 'action': 'command' if cmd else 'state'}
    if cmd:
        params['command'] = cmd
    return a.main(params, {'username': 'admin'}, sdk)


def test_native_row_shape_one_create_and_verified_readback(setup):
    a, native, sdk = setup
    result = invoke(setup, command())
    assert result['ok'] and result['committed'] and not result['replay']
    assert result['state']['balances'][0]['quantity'] == 7
    assert 'events' not in result['state']
    assert set(native.rows[-1]) == {'id', 'organization_id', 'sequence', 'predecessor_key', 'request_key', 'event', 'created_at'}
    assert len([c for c in native.calls if c[0] == 'POST' and c[1] == a.DATA_URL]) == 1


def test_lost_response_reconciles_without_second_create(setup):
    a, native, sdk = setup
    native.lose_response = True
    cmd = command()
    assert invoke(setup, cmd)['committed']
    assert invoke(setup, cmd)['replay']
    assert len(native.rows) == 2


@pytest.mark.parametrize('denial', ['role', 'org', 'cross-org'])
def test_denied_before_secret_or_service_access(setup, denial):
    a, native, sdk = setup
    sdk.allowed = denial != 'role'
    sdk.deny_org = denial == 'org'
    params = {'action': 'state', 'organization_id': 'other' if denial == 'cross-org' else TEST_ORG}
    result = a.main(params, {'username': 'admin'}, sdk)
    assert not result['ok']
    assert sdk.secret_reads == 0 and not native.calls


def test_bad_secret_and_redirect_fail_closed(setup):
    a, native, sdk = setup
    sdk.secret = {'value': {'username': 'other', 'password': 'secret'}}
    assert not invoke(setup)['ok']
    assert not native.calls
    sdk.secret['value']['username'] = a.SERVICE_USER
    sdk.secret['value']['password'] = 'test-only-password'
    native.redirect = True
    assert not invoke(setup)['ok']
    assert len(native.calls) == 1


def test_denied_table_write_never_reports_committed(setup):
    a, native, sdk = setup
    native.deny_write = True
    result = invoke(setup, command())
    assert not result['ok'] and result['committed'] is False
    assert len(native.rows) == 1


def test_stale_head_reload_revalidates_same_request(setup):
    a, native, sdk = setup
    competing = command()
    competing['lines'][0]['quantity'] = 6
    native.conflict = a.event_row(a.prepare_command([r['event'] for r in native.rows], competing, 'other-admin', TEST_ORG)['event'])
    result = invoke(setup, command())
    assert not result['ok']
    assert len(native.rows) == 2


def test_physical_envelope_tampering_and_actor_absence_fail(setup):
    a, native, sdk = setup
    native.rows[0]['request_key'] = 'tampered'
    assert not invoke(setup)['ok']
    result = a.main({'action': 'state', 'organization_id': TEST_ORG}, {}, sdk)
    assert not result['ok']


def test_bundle_compiles_without_local_import(adapter):
    bundler = load('bundle_stock_ledger', ROOT / 'scripts' / 'bundle_stock_ledger.py')
    source = bundler.bundle()
    assert 'from stock_ledger_domain import' not in source
    scope = {}
    exec(compile(source, '<ledger-bundle>', 'exec'), scope)
    assert callable(scope['main'])


def test_bundle_has_no_restricted_private_identifiers(adapter):
    import io
    import tokenize
    bundler = load('bundle_stock_ledger', ROOT / 'scripts' / 'bundle_stock_ledger.py')
    identifiers = [token.string for token in tokenize.generate_tokens(io.StringIO(bundler.bundle()).readline)
                   if token.type == tokenize.NAME]
    assert not [name for name in identifiers if name.startswith('_')]


def test_bundle_has_no_restricted_call_argument_expansion(adapter):
    import ast
    bundler = load('bundle_stock_ledger', ROOT / 'scripts' / 'bundle_stock_ledger.py')
    calls = [node for node in ast.walk(ast.parse(bundler.bundle())) if isinstance(node, ast.Call)]
    assert not [node.lineno for node in calls if any(isinstance(arg, ast.Starred) for arg in node.args)
                or any(keyword.arg is None for keyword in node.keywords)]


def test_bundle_has_no_restricted_augmented_assignment(adapter):
    import ast
    bundler = load('bundle_stock_ledger', ROOT / 'scripts' / 'bundle_stock_ledger.py')
    assert not [node.lineno for node in ast.walk(ast.parse(bundler.bundle()))
                if isinstance(node, ast.AugAssign)]


def test_different_payload_same_request_is_not_replayed(setup):
    a, native, sdk = setup
    cmd = command()
    assert invoke(setup, cmd)['committed']
    cmd['reason'] = 'changed'
    result = invoke(setup, cmd)
    assert not result['ok'] and not result['committed']
    assert len(native.rows) == 2


def test_stale_head_retry_preserves_request_and_revalidates(setup):
    a, native, sdk = setup
    competing = command()
    competing['lines'][0]['quantity'] = 1
    native.conflict = a.event_row(a.prepare_command([r['event'] for r in native.rows], competing, 'other-admin', TEST_ORG)['event'])
    cmd = command()
    result = invoke(setup, cmd)
    assert result['committed'] and result['state']['balances'][0]['quantity'] == 6
    attempts = [c[2]['json'] for c in native.calls if c[0] == 'POST' and c[1] == a.DATA_URL]
    assert len(attempts) == 2
    assert attempts[0]['id'] == attempts[1]['id']
    assert attempts[0]['request_key'] == attempts[1]['request_key']
    assert attempts[0]['predecessor_key'] != attempts[1]['predecessor_key']


def test_unknown_commit_and_failed_readback_never_blindly_retries(setup, monkeypatch):
    a, native, sdk = setup
    real_request = native.request

    def request(method, url, **kwargs):
        if url == a.DATA_URL and method == 'GET' and len(native.rows) > 1:
            raise TimeoutError('private detail')
        return real_request(method, url, **kwargs)

    monkeypatch.setattr(native, 'request', request)
    native.lose_response = True
    result = invoke(setup, command())
    assert result['code'] == 'OUTCOME_UNKNOWN_RETRY_SAME_REQUEST'
    assert not result['committed']
    assert len(native.rows) == 2
    assert 'private detail' not in json.dumps(result)


def test_wrong_service_identity_never_accesses_ledger(setup):
    a, native, sdk = setup
    native.me = {'data': {'username': 'someone-else'}}
    assert not invoke(setup)['ok']
    assert all(call[1] != a.DATA_URL for call in native.calls)


def test_missing_history_and_malformed_total_fail_closed(setup, monkeypatch):
    a, native, sdk = setup
    native.rows = []
    assert not invoke(setup)['ok']
    real_request = native.request

    def request(method, url, **kwargs):
        if url == a.DATA_URL and method == 'GET':
            return Response({'data': [], 'total': True})
        return real_request(method, url, **kwargs)

    monkeypatch.setattr(native, 'request', request)
    assert not invoke(setup)['ok']


def test_opening_and_nonuuid_request_rejected_before_secret(setup):
    a, native, sdk = setup
    cmd = command()
    cmd['request_id'] = 'non-uuid'
    assert not invoke(setup, cmd)['ok']
    cmd['request_id'], cmd['action'] = str(uuid4()), 'opening'
    assert not invoke(setup, cmd)['ok']
    assert sdk.secret_reads == 0


def test_reference_denial_after_history_before_single_create(setup, monkeypatch):
    a, native, sdk = setup
    original = sdk.database.from_

    def from_(table):
        if table == 'products':
            raise ValueError('denied private product')
        return original(table)

    monkeypatch.setattr(sdk.database, 'from_', from_)
    result = invoke(setup, command())
    assert result['code'] == 'REFERENCE_FORBIDDEN'
    assert len(native.rows) == 1


def test_history_capacity_refuses_append_before_unreadable_tail(setup, monkeypatch):
    a, native, sdk = setup
    monkeypatch.setattr(a, 'MAX_HISTORY', 1)
    result = invoke(setup, command())
    assert result['code'] == 'HISTORY_CAPACITY_REACHED'
    assert len(native.rows) == 1


def test_rejection_returns_whitelisted_domain_detail(setup):
    a, native, sdk = setup
    cmd = command()
    cmd['lines'][0]['quantity'] = 9
    result = invoke(setup, cmd)
    assert result['code'] == 'COMMAND_REJECTED' and result['committed'] is False
    assert result['detail'] in ('Insufficient available stock', 'Insufficient stock')
    assert len(native.rows) == 1


def test_rejection_detail_never_echoes_unknown_error_text(adapter):
    assert adapter.rejection_detail(ValueError("invalid literal for int() with base 10: 'secret'")) is None
    assert adapter.rejection_detail(ValueError('Allocate every order line exactly')) == 'Allocate every order line exactly'
    assert 'detail' not in adapter.adapter_failure('COMMAND_REJECTED', 'r')


def test_prospective_history_bytes_rejected_before_create(setup, monkeypatch):
    a, native, sdk = setup
    current = len(json.dumps(native.rows))
    monkeypatch.setattr(a, 'MAX_BYTES', current + 100)
    result = invoke(setup, command())
    assert result['code'] == 'HISTORY_CAPACITY_REACHED'
    assert len(native.rows) == 1


def test_prospective_projected_output_rejected_before_create(setup, monkeypatch):
    a, native, sdk = setup
    current = invoke(setup)
    monkeypatch.setattr(a, 'MAX_OUTPUT_BYTES', len(json.dumps(current)) + 20)
    assert invoke(setup)['ok']
    result = invoke(setup, command())
    assert result['code'] == 'OUTPUT_CAPACITY_REACHED'
    assert len(native.rows) == 1


def test_missing_deleted_at_reference_field_is_not_assumed_active(setup, monkeypatch):
    a, native, sdk = setup
    real_execute = Query.execute

    def execute(query):
        result = real_execute(query)
        for row in result['data']:
            row.pop('deleted_at', None)
        return result

    monkeypatch.setattr(Query, 'execute', execute)
    assert invoke(setup)['code'] == 'FORBIDDEN'
    assert sdk.secret_reads == 0


def test_runtime_metadata_does_not_override_caller_or_business_params(setup):
    a, native, sdk = setup
    params = {'action': 'state', 'organization_id': TEST_ORG,
              '__function__': {'actor_id': 'evil'}, '__method__': 'POST',
              'request': {'organization_id': 'other', 'username': 'evil'}}
    assert a.main(params, {'username': 'admin'}, sdk)['ok']
    sdk.allowed = False
    assert a.main(params, {'username': 'admin'}, sdk)['code'] == 'FORBIDDEN'


def test_native_utc_naive_created_at_is_accepted(setup):
    a, native, sdk = setup
    native.rows[0]['created_at'] = '2026-11-11T08:20:50.851'
    assert invoke(setup)['ok']


def test_native_400_conflict_only_retries_after_head_advanced(setup):
    a, native, sdk = setup
    competing = command()
    competing['lines'][0]['quantity'] = 1
    native.conflict = a.event_row(a.prepare_command([r['event'] for r in native.rows], competing, 'other-admin', TEST_ORG)['event'])
    native.conflict_status = 400
    result = invoke(setup, command())
    assert result['committed']
    assert len(native.rows) == 3


def test_native_400_without_advanced_head_is_not_retried(setup, monkeypatch):
    a, native, sdk = setup
    real_request = native.request
    posts = []

    def request(method, url, **kwargs):
        if method == 'POST' and url == a.DATA_URL:
            posts.append(kwargs)
            return Response({}, 400)
        return real_request(method, url, **kwargs)

    monkeypatch.setattr(native, 'request', request)
    result = invoke(setup, command())
    assert result['code'] == 'WRITE_NOT_VERIFIED'
    assert len(posts) == 1

RETAINED_ORG = '55dcee2a-dea1-4dfc-83ee-9474f7b5815b'
PRODUCT_ID = 'aaaaaaaa-1111-4111-8111-111111111111'
LINE_ID = 'bbbbbbbb-1111-4111-8111-111111111111'


def sales_command():
    return {'request_id': str(uuid4()), 'action': 'create_order', 'reason': 'quoted order',
            'document': {'customer_id': None, 'customer_name': 'Walk-in', 'customer_email': '',
                         'customer_address': '', 'order_date': '2026-11-11', 'currency': 'USD',
                         'notes': '', 'tax': '0.00', 'shipping': '0.00',
                         'items': [{'line_id': LINE_ID, 'product_id': PRODUCT_ID,
                                    'product_variant_id': None, 'quantity': 2, 'unit_price': '3.25'}]}}


def test_replay_reauthorizes_command_but_state_uses_org_admin_policy(setup, monkeypatch):
    a, native, sdk = setup
    cmd = command()
    assert invoke(setup, cmd)['committed']
    original = sdk.database.from_

    def from_(table):
        if table == 'products':
            raise ValueError('permission revoked')
        return original(table)

    monkeypatch.setattr(sdk.database, 'from_', from_)
    # Historical snapshots are org-Admin audit data, not current active catalogue.
    assert invoke(setup)['code'] == 'STATE'
    assert invoke(setup, cmd)['code'] == 'REFERENCE_FORBIDDEN'
    sdk.allowed = False
    assert invoke(setup)['code'] == 'FORBIDDEN'
    assert invoke(setup, cmd)['code'] == 'FORBIDDEN'
    assert len(native.rows) == 2


def test_retained_org_requires_reviewed_baseline(adapter, monkeypatch):
    monkeypatch.setattr(adapter, 'ENABLED_BASELINES', {})
    sdk = SDK()
    result = adapter.main({'action': 'state', 'organization_id': RETAINED_ORG}, {'username': 'admin'}, sdk)
    assert result['code'] == 'ORGANIZATION_NOT_ENABLED'
    assert sdk.secret_reads == 0
    assert adapter.ENABLED_BASELINES == {}


def test_org_history_filter_and_verified_baseline(setup, monkeypatch):
    a, native, sdk = setup
    genesis = a.opening_event(RETAINED_ORG, str(uuid4()), [
        {'product_id': 'p', 'location_id': 'a', 'quantity': 10, 'reserved': 0}], [], 'admin')
    native.rows = [a.event_row(genesis)]
    monkeypatch.setattr(a, 'ENABLED_BASELINES', {RETAINED_ORG: genesis['event_hash']}, raising=False)
    original = native.request

    def request(method, url, **kwargs):
        if method == 'GET' and url == a.DATA_URL:
            assert kwargs['params']['organization_id__eq'] == RETAINED_ORG
            return Response({'data': native.rows, 'total': 1})
        return original(method, url, **kwargs)

    monkeypatch.setattr(native, 'request', request)
    result = a.main({'action': 'state', 'organization_id': RETAINED_ORG}, {'username': 'admin'}, sdk)
    assert result['ok'] and result['state']['organization_id'] == RETAINED_ORG
    assert all(filters.get('organization_id', RETAINED_ORG) == RETAINED_ORG for _, filters in sdk.reads)
    monkeypatch.setattr(a, 'ENABLED_BASELINES', {RETAINED_ORG: '0' * 64}, raising=False)
    assert not a.main({'action': 'state', 'organization_id': RETAINED_ORG}, {'username': 'admin'}, sdk)['ok']


def test_v2_order_seals_caller_catalogue_snapshot_and_replays_changes(setup, monkeypatch):
    a, native, sdk = setup
    original = Query.execute
    catalogue_name = ['Original name']

    def execute(query):
        result = original(query)
        result['data'][0].update(name=catalogue_name[0], sku='SKU-1')
        return result

    monkeypatch.setattr(Query, 'execute', execute)
    cmd = sales_command()
    result = invoke(setup, cmd)
    assert result['committed'], result
    event = native.rows[-1]['event']
    assert event['version'] == 2
    assert event['reference_snapshots']['products'][PRODUCT_ID]['name'] == 'Original name'
    assert event['recorded_at'].endswith('+00:00')
    assert result['state']['documents'][cmd['request_id']]['total'] == '6.50'
    catalogue_name[0] = 'Edited catalogue name'
    replay = invoke(setup, cmd)
    assert replay['replay'] and len(native.rows) == 2
    assert native.rows[-1]['event'] == event


def test_v2_foreign_product_denied_before_create(setup, monkeypatch):
    a, native, sdk = setup
    original = Query.execute

    def execute(query):
        result = original(query)
        if query.table == 'products' and query.filters['id'] == PRODUCT_ID:
            result['data'][0]['organization_id'] = RETAINED_ORG
        return result

    monkeypatch.setattr(Query, 'execute', execute)
    assert invoke(setup, sales_command())['code'] == 'REFERENCE_FORBIDDEN'
    assert len(native.rows) == 1


def test_documents_endpoint_validates_and_pins_head(setup):
    a, native, sdk = setup
    params = {'action': 'documents', 'organization_id': TEST_ORG,
              'kind': 'sales_order', 'page': 1, 'page_size': 10}
    result = a.main(params, {'username': 'admin'}, sdk)
    assert result['ok'] and result['code'] == 'DOCUMENTS'
    assert result['data'] == [] and result['total'] == 0
    assert result['head'] == native.rows[-1]['event']['event_hash']
    assert result['capabilities'] == ['commerce_v2']
    assert result['capacity']['max_events'] == a.MAX_HISTORY
    params['expected_head'] = '0' * 64
    assert a.main(params, {'username': 'admin'}, sdk)['code'] == 'HEAD_CHANGED'
    params.pop('expected_head')
    params['page_size'] = 51
    before = sdk.secret_reads
    assert a.main(params, {'username': 'admin'}, sdk)['code'] == 'VALIDATION_ERROR'
    assert sdk.secret_reads == before


def test_document_later_pages_require_head_before_credentials(setup):
    a, native, sdk = setup
    params = {'action': 'documents', 'organization_id': TEST_ORG,
              'kind': 'sales_order', 'page': 2, 'page_size': 10}
    before = sdk.secret_reads
    assert a.main(params, {'username': 'admin'}, sdk)['code'] == 'VALIDATION_ERROR'
    assert sdk.secret_reads == before


@pytest.mark.parametrize('settings', [{}, {'stock_authority': 'legacy'}])
def test_retained_authority_freeze_precedes_credentials(setup, monkeypatch, settings):
    a, native, sdk = setup
    monkeypatch.setattr(a, 'ENABLED_BASELINES', {RETAINED_ORG: '0' * 64})
    original = Query.execute
    def execute(query):
        result = original(query)
        if query.table == 'organizations':
            result['data'][0]['settings'] = settings
        return result
    monkeypatch.setattr(Query, 'execute', execute)
    result = a.main({'action': 'state', 'organization_id': RETAINED_ORG}, {'username': 'admin'}, sdk)
    assert result['code'] == 'FORBIDDEN'
    assert sdk.secret_reads == 0


def test_customer_snapshot_preserves_company_name(setup, monkeypatch):
    a, native, sdk = setup
    original = Query.execute
    def execute(query):
        result = original(query)
        result['data'][0].update(name='Buyer', company_name='Buyer company', currency='INR')
        return result
    monkeypatch.setattr(Query, 'execute', execute)
    command = sales_command()
    customer_id = str(uuid4())
    command['document']['customer_id'] = customer_id
    command['document']['currency'] = 'INR'
    state = {'organization_id': TEST_ORG, 'documents': {}, 'requests': {}}
    snapshots = a.adapter_references(sdk, state, command)
    assert snapshots['customers'][customer_id]['company_name'] == 'Buyer company'


def test_documents_endpoint_search_status_pagination_real_projection(setup, monkeypatch):
    a, native, sdk = setup
    original = Query.execute

    def execute(query):
        result = original(query)
        result['data'][0].update(name='Catalogue name', sku='SKU')
        return result

    monkeypatch.setattr(Query, 'execute', execute)
    first, second = sales_command(), sales_command()
    second['document']['customer_name'] = 'Different customer'
    assert invoke(setup, first)['committed']
    assert invoke(setup, second)['committed']
    params = {'action': 'documents', 'organization_id': TEST_ORG,
              'kind': 'sales_order', 'page': 1, 'page_size': 1, 'status': 'pending'}
    result = a.main(params, {'username': 'admin'}, sdk)
    assert result['total'] == 2 and len(result['data']) == 1
    params.update(page=2, expected_head=result['head'])
    next_page = a.main(params, {'username': 'admin'}, sdk)
    assert next_page['data'][0]['id'] != result['data'][0]['id']
    params.update(page=1, search='different')
    filtered = a.main(params, {'username': 'admin'}, sdk)
    assert filtered['total'] == 1 and filtered['data'][0]['id'] == second['request_id']


@pytest.mark.parametrize("action",["state","command","documents"])
def test_legacy_qa_organization_rejected_before_secret(setup,action):
    a,native,sdk=setup
    params={"action":action,"organization_id":LEGACY_QA_ORG}
    if action=="command":params["command"]=command()
    if action=="documents":params.update(kind="sales_order",page=1,page_size=10)
    result=a.main(params,{"username":"admin"},sdk)
    assert result["code"]=="ORGANIZATION_NOT_ENABLED"
    assert sdk.secret_reads==0 and not native.calls


def test_retained_test_fixture_requires_activation_before_secret(setup,monkeypatch):
    a,native,sdk=setup
    original=Query.execute
    def execute(query):
        result=original(query)
        if query.table=="organizations":result["data"][0]["settings"]={}
        return result
    monkeypatch.setattr(Query,"execute",execute)
    assert invoke(setup)["code"]=="FORBIDDEN"
    assert sdk.secret_reads==0 and not native.calls


def test_retained_test_fixture_requires_exact_baseline(setup,monkeypatch):
    a,native,sdk=setup
    monkeypatch.setattr(a,"ENABLED_BASELINES",{TEST_ORG:"0"*64})
    assert not invoke(setup)["ok"]
    assert not [call for call in native.calls if call[0]=="POST" and call[1]==a.DATA_URL]
