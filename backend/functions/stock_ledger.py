"""Private, baseline-gated native ledger gateway. Deploy ONLY the generated bundle.

Injected SDK remains caller-scoped. Separate fixed-origin service authentication
cannot confer caller authorization; function policy and organization read precede
secret access. Native unique keys and append-only writer policy are deployment
gates, not properties established by these local tests.
"""
import json
import time
from datetime import datetime, timezone
from uuid import UUID, uuid5

import httpx
from stock_ledger_domain import opening_event, prepare_command, project, canonical_hash, ledger_command

# Native zero-baseline/readback evidence: commerce-release-20261111/provision-receipt.json.
# Both this pinned genesis AND caller-readable stock_authority activation are required.
ENABLED_BASELINES = {
    '55dcee2a-dea1-4dfc-83ee-9474f7b5815b': 'ec598a8fba6df6917948fddc8476643a743f39470b4ff131104099691b079391',
    '616d839b-e107-4511-b12f-fd6ed301d999': '7cd27f2c6d8900116506362d71ead6131af4a656dfe0baded1ecf2f9937dd640',
    '4166493b-ca74-4117-8a42-a3ec669bbfd0': '6e5061a3d8b7e1d1b3558d936f2322148846a6626d707fbe310fecb33ef6ec81',
    # HMG Stones workspace: opening balances from verified product_location_stocks
    # (backend/scripts/build_synthetic_ledger_genesis.py), written 2026-11-12.
    '913d46eb-585d-5a5c-b1d4-b9d22052a8d6': '91c243d6236b1febe8f2c5cf4b2cb94dcaee4e1d9acd993b79861409f318277f',
}
RETAINED_ORGS = ('55dcee2a-dea1-4dfc-83ee-9474f7b5815b',
                 '616d839b-e107-4511-b12f-fd6ed301d999',
                 '4166493b-ca74-4117-8a42-a3ec669bbfd0',
                 '913d46eb-585d-5a5c-b1d4-b9d22052a8d6')
COMMERCE_ACTIONS = ('create_order', 'create_purchase_order', 'amend_document',
                    'approve_document', 'reject_document', 'cancel_document',
                    'fulfill_order', 'receive_purchase_order', 'submit_return',
                    'approve_return', 'reject_return', 'register_bins')
ORIGIN = 'https://hmg-stones.taruvibase.cloud'
DATA_URL = ORIGIN + '/api/apps/hmg-studio/datatables/stock_ledger_events/data/'
SERVICE_USER = 'svc_hmg_ledger_20261111'
ROW_NAMESPACE = UUID('e22d81ca-1ba9-5ce9-a314-77abc7696203')
MAX_HISTORY = 200
PAGE_SIZE = 100
MAX_BYTES = 1048576
MAX_OUTPUT_BYTES = 1048576
MAX_COMMAND_BYTES = 32768
MAX_REFERENCES = 20


def adapter_failure(code, request_id=None, detail=None):
    result = {'ok': False, 'code': code, 'state': None, 'committed': False,
              'replay': False, 'request_id': request_id}
    if detail is not None:
        result['detail'] = detail
    return result


# Static domain rule messages that are safe to show a user. Anything else
# (including Python-internal ValueError text) is never echoed back.
REJECTION_DETAILS = frozenset((
    'Insufficient available stock', 'Insufficient stock', 'Allocate every order line exactly',
    'Invalid or duplicate line allocation', 'Document revision conflict', 'Document is not pending',
    'Missing stock baseline', 'Fulfillment exceeds allocation', 'Document quantity exceeded',
    'Reason required', 'Expected date precedes order', 'Invalid email', 'Invalid date',
    'Positive quantity required', 'Empty lines', 'Empty document', 'Posted document cannot be cancelled',
    'Document cannot be amended', 'Purchase approval does not allocate stock',
    'Unsupported commerce transition', 'Document is not eligible', 'Return entitlement exceeded',
    'Register return destination first', 'Canonical two-decimal money required', 'Invalid currency',
    'Duplicate document line', 'Document identity already used', 'Money overflow', 'Invalid quantity',
))


def rejection_detail(error):
    message = str(error)
    return message if message in REJECTION_DETAILS else None


def adapter_uuid(value):
    if not isinstance(value, str) or str(UUID(value)) != value:
        raise ValueError('Invalid UUID')
    return value


def adapter_actor(user_data):
    if not isinstance(user_data, dict):
        raise ValueError('Missing actor')
    value = user_data.get('username') or user_data.get('id')
    if not isinstance(value, str) or not value or len(value) > 200 or value.strip() != value:
        raise ValueError('Invalid actor')
    return value


def adapter_caller_record(sdk, table, filters):
    query = sdk.database.from_(table)
    for field, value in filters.items():
        query = query.filter(field, 'eq', value)
    result = query.page_size(2).execute()
    if (not isinstance(result, dict) or result.get('total') != 1
            or not isinstance(result.get('data'), list) or len(result['data']) != 1):
        raise ValueError('Reference unavailable')
    record = result['data'][0]
    if (not isinstance(record, dict) or any(record.get(k) != v for k, v in filters.items())
            or 'deleted_at' not in record or record['deleted_at'] is not None
            or record.get('is_active') is not True):
        raise ValueError('Invalid reference')
    return record


def adapter_authorize(sdk, org, action):
    # Deployment policy MUST grant execute only to Admin within this exact org.
    # This is the audit-disclosure authority for the entire verified org state;
    # historical snapshots do not require current catalogue rows to remain active.
    response = sdk.policy.check_resources(resources=[{
        'resource': {'kind': 'function:hmg-stock-ledger-v1', 'id': 'hmg-stock-ledger-v1',
                     'attr': {'organization_id': org, 'action': action}}, 'actions': ['execute']}], principal=None)
    if response['results'][0]['actions']['execute'] != 'EFFECT_ALLOW':
        raise ValueError('Denied')
    organization = adapter_caller_record(sdk, 'organizations', {'id': org})
    settings = organization.get('settings')
    if not isinstance(settings, dict) or settings.get('stock_authority') != 'ledger_v2':
        raise ValueError('Ledger authority is not active')


def adapter_credentials(sdk):
    secret = sdk.secrets.get('hmg_ledger_writer_qa')
    value = secret.get('value') if isinstance(secret, dict) else None
    if isinstance(value, str) and len(value) <= 4096:
        value = json.loads(value)
    if (not isinstance(value, dict) or set(value) != {'username', 'password'}
            or value['username'] != SERVICE_USER or not isinstance(value['password'], str)
            or not 12 <= len(value['password']) <= 1024):
        raise ValueError('Invalid service configuration')
    return value


def adapter_http(client, method, url, deadline, headers=None, json=None, params=None):
    remaining = deadline - time.monotonic()
    if remaining <= 0:
        raise TimeoutError('Time limit')
    response = client.request(method, url, timeout=min(3.0, remaining),
                              headers=headers, json=json, params=params)
    if len(response.content) > MAX_BYTES:
        raise ValueError('Response limit')
    return response


def adapter_body(response):
    if not 200 <= response.status_code < 300:
        raise ValueError('Native request failed')
    value = response.json()
    if not isinstance(value, dict):
        raise ValueError('Invalid response')
    return value


def adapter_login(client, credentials, deadline):
    token = adapter_body(adapter_http(client, 'POST', ORIGIN + '/api/cloud/auth/jwt/token/', deadline,
                       json=credentials)).get('access')
    if not isinstance(token, str) or not token or len(token) > 16384:
        raise ValueError('Invalid service token')
    headers = {'Authorization': 'Bearer ' + token}
    me = adapter_body(adapter_http(client, 'GET', ORIGIN + '/api/users/me/', deadline, headers=headers))
    identity = me.get('data')
    if not isinstance(identity, dict) or identity.get('username') != SERVICE_USER:
        raise ValueError('Wrong service identity')
    return headers


def event_row(event):
    """Deterministic physical identity. Controlled genesis seeding may reuse this."""
    org = adapter_uuid(event['organization_id'])
    request_id = adapter_uuid(event['command']['request_id'])
    return {'id': str(uuid5(ROW_NAMESPACE, org + ':' + request_id)), 'organization_id': org,
            'sequence': event['sequence'], 'predecessor_key': org + ':' + (event['predecessor'] or 'GENESIS'),
            'request_key': org + ':' + request_id, 'event': event,
            'created_at': datetime.now(timezone.utc).isoformat()}


def adapter_event(row):
    if not isinstance(row, dict) or not isinstance(row.get('event'), dict):
        raise ValueError('Malformed native row')
    event = row['event']
    expected = event_row(event)
    for field in ('id', 'organization_id', 'sequence', 'predecessor_key', 'request_key'):
        if type(row.get(field)) is not type(expected[field]) or row[field] != expected[field]:
            raise ValueError('Physical envelope mismatch')
    stamp = row.get('created_at')
    if not isinstance(stamp, str) or len(stamp) > 64 or 'T' not in stamp:
        raise ValueError('Invalid event time')
    parsed = datetime.fromisoformat(stamp.replace('Z', '+00:00'))
    if parsed.tzinfo is None:
        # Native readback strips UTC offsets (verified isolated QA seed,
        # 2026-11-11), matching existing dashboard/stock preview contract.
        parsed = parsed.replace(tzinfo=timezone.utc)
    if not isinstance(event.get('actor_id'), str) or not event['actor_id'].strip():
        raise ValueError('Missing event actor')
    return event


def adapter_history(client, headers, deadline, org):
    params = {'organization_id__eq': org, 'ordering': '-sequence', 'page': 1, 'page_size': 1}
    head = adapter_body(adapter_http(client, 'GET', DATA_URL, deadline, headers=headers, params=params))
    rows, total = head.get('data'), head.get('total')
    if (not isinstance(rows, list) or len(rows) != 1 or type(total) is not int
            or not 1 <= total <= MAX_HISTORY):
        raise ValueError('Missing or oversized history')
    last = adapter_event(rows[0])
    sequence = last['sequence']
    if type(sequence) is not int or sequence + 1 != total:
        raise ValueError('Incomplete head')
    events, byte_count = [], 0
    for page in range(1, (total + PAGE_SIZE - 1) // PAGE_SIZE + 1):
        params = {'organization_id__eq': org, 'sequence__lte': sequence,
                  'ordering': 'sequence', 'page': page, 'page_size': PAGE_SIZE}
        result = adapter_body(adapter_http(client, 'GET', DATA_URL, deadline, headers=headers, params=params))
        data = result.get('data')
        expected_count = min(PAGE_SIZE, total - (page - 1) * PAGE_SIZE)
        if result.get('total') != total or not isinstance(data, list) or len(data) != expected_count:
            raise ValueError('Incomplete history page')
        byte_count = byte_count + len(json.dumps(data))
        if byte_count > MAX_BYTES:
            raise ValueError('History limit')
        events.extend(adapter_event(row) for row in data)
    state = project(events, org, expected_head=last['event_hash'])
    if events[0]['event_hash'] != ENABLED_BASELINES.get(org):
        raise ValueError('Unverified baseline')
    return events, state, byte_count


def adapter_references(sdk, state, command, replay=False):
    """Resolve command references with caller credentials, never service credentials.

    Replay uses stored payload/snapshots for identity first. Catalogue display or
    stock-type edits cannot change that identity; current read authorization still
    applies to the referenced records before disclosing a committed result.
    """
    org = state['organization_id']
    action = command['action']
    target = command
    if action in ('approve', 'reject', 'reverse', 'approve_return', 'reject_return'):
        target = state['requests'][command['target_request_id']]['command']
    refs = {'products': set(), 'customers': set(), 'suppliers': set(), 'locations': set()}
    document = target.get('document')
    if document is None and target.get('document_id'):
        document = state['documents'][target['document_id']]['draft']
    if document is not None:
        if document.get('customer_id'):
            refs['customers'].add(document['customer_id'])
        if document.get('supplier_id'):
            refs['suppliers'].add(document['supplier_id'])
        for line in document['items']:
            refs['products'].add(line['product_id'])
    for line in target.get('lines', []) + target.get('allocations', []) + target.get('bins', []):
        if 'product_id' in line:
            refs['products'].add(line['product_id'])
        if 'entitlement_id' in line:
            entitlement = state['entitlements'][line['entitlement_id']]
            refs['products'].add(entitlement['product_id'])
            if entitlement.get('source_location_id'):
                refs['locations'].add(entitlement['source_location_id'])
        refs['locations'].update(line[k] for k in ('source', 'destination', 'location_id') if k in line)
    if replay:
        # Include original references even if the document was later amended.
        previous = state['events'][command['request_id']]
        for kind, snapshots in previous.get('reference_snapshots', {}).items():
            refs[kind].update(snapshots)
    if sum(len(ids) for ids in refs.values()) > MAX_REFERENCES:
        raise ValueError('Reference limit')
    snapshots = {'products': {}, 'customers': {}, 'suppliers': {}, 'locations': {}}
    fields = {'products': ('name', 'sku'),
              'customers': ('name', 'company_name', 'email', 'billing_address', 'billing_city', 'billing_state',
                            'billing_zip_code', 'billing_country', 'currency'),
              'suppliers': ('name', 'currency'), 'locations': ('name', 'code')}
    for kind, ids in refs.items():
        table = 'product_locations' if kind == 'locations' else kind
        for reference in sorted(ids):
            row = adapter_caller_record(sdk, table, {'id': reference, 'organization_id': org})
            if kind == 'products' and not replay:
                if row.get('has_variants') is not False:
                    raise ValueError('VARIANT_UNSUPPORTED')
                if row.get('tracking_type') != 'none' or row.get('type') != 'standard':
                    raise ValueError('TRACKING_UNSUPPORTED')
            snapshot = {}
            for field in fields[kind]:
                value = row.get(field)
                if value is not None and (not isinstance(value, str) or len(value) > 4000):
                    raise ValueError('Invalid reference display')
                snapshot[field] = value
            if action in COMMERCE_ACTIONS and not replay:
                if not isinstance(snapshot['name'], str) or not snapshot['name'].strip():
                    raise ValueError('Missing reference name')
                if kind == 'customers' and snapshot['currency'] != document['currency']:
                    raise ValueError('Customer currency mismatch')
            snapshots[kind][reference] = snapshot
    return snapshots


def adapter_success(state, request_id=None, committed=False, replay=False):
    visible = {key: value for key, value in state.items() if key != 'events'}
    result = {'ok': True, 'code': 'COMMITTED' if committed else 'STATE', 'state': visible,
              'committed': committed, 'replay': replay, 'request_id': request_id,
              'capabilities': ['commerce_v2']}
    if len(json.dumps(result)) > MAX_OUTPUT_BYTES:
        raise ValueError('Output limit')
    return result


def adapter_document_params(params):
    required = {'action', 'organization_id', 'kind', 'page', 'page_size'}
    optional = {'status', 'search', 'expected_head'}
    if not required.issubset(params) or set(params) - required - optional:
        raise ValueError('Invalid documents query')
    if params['kind'] not in ('sales_order', 'purchase_order'):
        raise ValueError('Invalid document kind')
    if type(params['page']) is not int or not 1 <= params['page'] <= MAX_HISTORY:
        raise ValueError('Invalid page')
    if params['page'] > 1 and 'expected_head' not in params:
        raise ValueError('Later pages require a pinned head')
    if type(params['page_size']) is not int or not 1 <= params['page_size'] <= 50:
        raise ValueError('Invalid page size')
    if 'status' in params and params['status'] not in (
            'pending', 'approved', 'partially_fulfilled', 'fulfilled',
            'partially_received', 'received', 'rejected', 'cancelled'):
        raise ValueError('Invalid status')
    if 'search' in params and (not isinstance(params['search'], str) or len(params['search']) > 200):
        raise ValueError('Invalid search')
    if 'expected_head' in params:
        head = params['expected_head']
        if not isinstance(head, str) or len(head) != 64 or any(c not in '0123456789abcdef' for c in head):
            raise ValueError('Invalid head')


def adapter_documents(state, params):
    if 'expected_head' in params and params['expected_head'] != state['head']:
        return adapter_failure('HEAD_CHANGED')
    search = params.get('search', '').strip().casefold()
    data = []
    for document in state.get('documents', {}).values():
        if document['kind'] != params['kind'] or ('status' in params and document['status'] != params['status']):
            continue
        names = [document['number'], document['draft'].get('customer_name', '')]
        for kind in ('customers', 'suppliers'):
            names.extend(snapshot.get('name') or '' for snapshot in document['snapshots'].get(kind, {}).values())
        if search and not any(search in name.casefold() for name in names):
            continue
        data.append(document)
    data.sort(key=lambda item: (item['created_at'], item['id']), reverse=True)
    start = (params['page'] - 1) * params['page_size']
    result = {'ok': True, 'code': 'DOCUMENTS', 'organization_id': state['organization_id'],
              'data': data[start:start + params['page_size']], 'total': len(data), 'head': state['head'],
              'capacity': {'max_events': MAX_HISTORY, 'max_history_bytes': MAX_BYTES},
              'capabilities': ['commerce_v2']}
    if len(json.dumps(result)) > MAX_OUTPUT_BYTES:
        raise ValueError('Output limit')
    return result


def main(params, user_data, sdk_client):
    request_id = None
    deadline = time.monotonic() + 20.0
    try:
        if not isinstance(params, dict) or len(json.dumps(params, allow_nan=False)) > MAX_COMMAND_BYTES:
            return adapter_failure('VALIDATION_ERROR')
        # Runtime metadata is never an identity or authorization source.
        params = {key: value for key, value in params.items()
                  if key not in ('__function__', '__method__', 'request')}
        action = params.get('action')
        required = {'action', 'organization_id'} | ({'command'} if action == 'command' else set())
        if action == 'documents':
            adapter_document_params(params)
        elif set(params) != required or action not in ('state', 'command'):
            return adapter_failure('VALIDATION_ERROR')
        org = adapter_uuid(params['organization_id'])
        if org not in RETAINED_ORGS or org not in ENABLED_BASELINES:
            return adapter_failure('ORGANIZATION_NOT_ENABLED')
        actor = adapter_actor(user_data)
        command = params.get('command')
        if action == 'command':
            request_id = adapter_uuid(command['request_id'])
            if command.get('action') == 'opening':
                return adapter_failure('VALIDATION_ERROR', request_id)
    except Exception:
        return adapter_failure('VALIDATION_ERROR')
    try:
        adapter_authorize(sdk_client, org, command['action'] if action == 'command' else action)
    except Exception:
        return adapter_failure('FORBIDDEN', request_id)
    try:
        credentials = adapter_credentials(sdk_client)
        with httpx.Client(follow_redirects=False, trust_env=False, verify=True) as client:
            headers = adapter_login(client, credentials, deadline)
            events, state, history_bytes = adapter_history(client, headers, deadline, org)
            if action == 'state':
                return adapter_success(state)
            if action == 'documents':
                return adapter_documents(state, params)
            # Function execute policy is Admin-only. This explicitly gates all
            # actions, including cross-owner reservation changes and reversals.
            for attempt in range(3):
                try:
                    command = ledger_command(command)
                    previous = state['events'].get(request_id)
                    if previous and canonical_hash(previous['command']) != canonical_hash(command):
                        return adapter_failure('REQUEST_CONFLICT', request_id)
                except ValueError as error:
                    if str(error) == 'VARIANT_UNSUPPORTED':
                        return adapter_failure('VARIANT_UNSUPPORTED', request_id)
                    return adapter_failure('COMMAND_REJECTED', request_id, rejection_detail(error))
                try:
                    snapshots = adapter_references(sdk_client, state, command, replay=previous is not None)
                except Exception as error:
                    code = str(error) if str(error) in ('VARIANT_UNSUPPORTED', 'TRACKING_UNSUPPORTED') else 'REFERENCE_FORBIDDEN'
                    return adapter_failure(code, request_id)
                try:
                    if command['action'] in COMMERCE_ACTIONS and previous is None:
                        context = {'recorded_at': datetime.now(timezone.utc).isoformat(),
                                   'reference_snapshots': snapshots}
                        prepared = prepare_command(events, command, actor, org, context=context)
                    else:
                        prepared = prepare_command(events, command, actor, org)
                except ValueError as error:
                    return adapter_failure('COMMAND_REJECTED', request_id, rejection_detail(error))
                if prepared['replay']:
                    return adapter_success(state, request_id, True, True)
                if len(events) >= MAX_HISTORY:
                    return adapter_failure('HISTORY_CAPACITY_REACHED', request_id)
                row = event_row(prepared['event'])
                # Reserve envelope overhead in addition to exact current pages;
                # appending must not make the very next read unverifiable.
                if history_bytes + len(json.dumps(row)) + 256 > MAX_BYTES:
                    return adapter_failure('HISTORY_CAPACITY_REACHED', request_id)
                try:
                    prospective = project(events + [prepared['event']], org)
                    adapter_success(prospective, request_id, True, False)
                except ValueError:
                    return adapter_failure('OUTPUT_CAPACITY_REACHED', request_id)
                if time.monotonic() >= deadline:
                    return adapter_failure('RETRY_SAME_REQUEST', request_id)
                status = None
                attempted_head = state['head']
                try:
                    response = adapter_http(client, 'POST', DATA_URL, deadline, headers=headers,
                                     json=row)
                    status = response.status_code
                except Exception:
                    pass  # Unknown outcome: reconcile from full immutable history.
                try:
                    events, state, history_bytes = adapter_history(client, headers, deadline, org)
                except Exception:
                    return adapter_failure('OUTCOME_UNKNOWN_RETRY_SAME_REQUEST', request_id)
                committed = state['events'].get(request_id)
                if committed is not None:
                    if canonical_hash(committed['command']) != canonical_hash(command):
                        return adapter_failure('REQUEST_CONFLICT', request_id)
                    return adapter_success(state, request_id, True, False)
                if status in (401, 403):
                    return adapter_failure('WRITE_FORBIDDEN', request_id)
                if status == 400 and state['head'] != attempted_head:
                    continue  # Native uniqueness may use400; full chain proves progress.
                if status is not None and status not in (409, 500, 502, 503, 504):
                    return adapter_failure('WRITE_NOT_VERIFIED', request_id)
                # No matching request exists in verified snapshot. Revalidate
                # against new head and reuse same unique physical/request IDs.
            return adapter_failure('RETRY_SAME_REQUEST', request_id)
    except Exception:
        return adapter_failure('LEDGER_UNAVAILABLE', request_id)
