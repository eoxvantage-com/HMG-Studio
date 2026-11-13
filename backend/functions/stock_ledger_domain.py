"""Pure append-only stock authority, NOT a deployed function or authorization gate.

All names here describe an internal JSON envelope, not physical table columns.
The adapter must prove complete history, authorize actors/references and enforce
native unique organization/predecessor and organization/request keys. Hashes are
integrity checks, not signatures. Baseline reservations remain conservative;
only chain-owned reservations can be released. Baseline entitlement condition
and destination are explicitly approved constraints, not inferred defaults.
No refund, payment or legacy balance side effects exist.
"""
import copy
import hashlib
import json
import re
from datetime import datetime, date
from decimal import Decimal
from uuid import UUID, uuid5

MAX_INT = 2147483647
MAX_LINES = 1000
MAX_MONEY = 9007199254740991
COMMERCE_ACTIONS = {'create_order', 'create_purchase_order', 'amend_document',
                    'approve_document', 'reject_document', 'cancel_document',
                    'fulfill_order', 'receive_purchase_order', 'submit_return',
                    'approve_return', 'reject_return', 'register_bins'}


def ledger_fields(value, fields):
    if not isinstance(value, dict) or set(value) != set(fields.split()):
        raise ValueError('Unexpected or missing fields')


def ledger_id(value):
    if not isinstance(value, str) or not value or len(value) > 200 or value.strip() != value:
        raise ValueError('Invalid identifier')
    return value


def ledger_qty(value, signed=False):
    if type(value) is not int or not (-MAX_INT if signed else 0) <= value <= MAX_INT:
        raise ValueError('Invalid quantity')
    return value


def ledger_list(value):
    if not isinstance(value, list) or len(value) > MAX_LINES:
        raise ValueError('Invalid lines')


def canonical_hash(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':'),
                                    ensure_ascii=True, allow_nan=False).encode('utf-8')).hexdigest()


def ledger_seal(event):
    return dict(event, event_hash=canonical_hash(event))


def ledger_command(command):
    if not isinstance(command, dict):
        raise ValueError('Invalid command')
    action = command.get('action')
    if not isinstance(action, str):
        raise ValueError('Invalid action')
    if action in COMMERCE_ACTIONS:
        return commerce_command(command)
    if action == 'opening':
        ledger_fields(command, 'request_id action balances entitlements')
    elif action in ('submit', 'direct'):
        ledger_fields(command, 'request_id action kind lines reason')
        if command['kind'] not in ('movement', 'adjustment', 'return'):
            raise ValueError('Invalid operation')
        if command['kind'] == 'return' and action != 'submit':
            raise ValueError('Return requires approval')
        ledger_list(command['lines'])
        if not command['lines']:
            raise ValueError('Empty lines')
    elif action in ('approve', 'reject', 'reverse'):
        ledger_fields(command, 'request_id action target_request_id reason')
        ledger_id(command['target_request_id'])
    elif action in ('reserve', 'release'):
        ledger_fields(command, 'request_id action owner_id lines reason')
        ledger_id(command['owner_id'])
        ledger_list(command['lines'])
        if not command['lines']:
            raise ValueError('Empty reservation')
    else:
        raise ValueError('Invalid action')
    ledger_id(command['request_id'])
    if action != 'opening':
        reason = command['reason']
        if not isinstance(reason, str) or not reason.strip() or len(reason) > 2000:
            raise ValueError('Reason required')
    return copy.deepcopy(command)


def opening_event(org_id, request_id, balances, entitlements, actor_id):
    event = ledger_seal({'version': 1, 'organization_id': ledger_id(org_id), 'sequence': 0,
                   'predecessor': None, 'actor_id': ledger_id(actor_id), 'command': {
                       'action': 'opening', 'request_id': request_id,
                       'balances': copy.deepcopy(balances), 'entitlements': copy.deepcopy(entitlements)}})
    project([event], org_id)
    return event


def ledger_initialize(command, org_id):
    ledger_list(command['balances'])
    ledger_list(command['entitlements'])
    balances, entitlements, seen = [], {}, set()
    for line in command['balances']:
        ledger_fields(line, 'product_id location_id quantity reserved')
        key = (ledger_id(line['product_id']), ledger_id(line['location_id']))
        if key in seen or ledger_qty(line['reserved']) > ledger_qty(line['quantity']):
            raise ValueError('Invalid opening balance')
        seen.add(key)
        balances.append(copy.deepcopy(line))
    for line in command['entitlements']:
        ledger_fields(line, 'order_item_id product_id quantity returned location_id condition')
        for field in ('order_item_id', 'product_id', 'location_id', 'condition'):
            ledger_id(line[field])
        if line['condition'] not in ('new', 'used', 'damaged'):
            raise ValueError('Invalid return condition')
        key = line['order_item_id']
        if (key in entitlements or ledger_qty(line['returned']) > ledger_qty(line['quantity'])
                or (line['product_id'], line['location_id']) not in seen):
            raise ValueError('Invalid return entitlement')
        entitlements[key] = copy.deepcopy(line)
    return {'organization_id': org_id, 'sequence': -1, 'head': None,
            'balances': sorted(balances, key=lambda x: (x['product_id'], x['location_id'])),
            'entitlements': entitlements, 'reservations': {}, 'requests': {}, 'events': {}}


def ledger_post(state, command):
    """Validate and apply all lines only to a private copy of projected state."""
    balances = {(b['product_id'], b['location_id']): b for b in state['balances']}
    changes, seen, returned = {}, set(), {}
    kind = command['kind']
    for line in command['lines']:
        fields = {'movement': 'product_id source destination quantity',
                  'adjustment': 'product_id location_id delta',
                  'return': 'order_item_id product_id location_id condition restock quantity'}[kind]
        ledger_fields(line, fields)
        product = ledger_id(line['product_id'])
        if kind == 'movement':
            source, dest = ledger_id(line['source']), ledger_id(line['destination'])
            quantity = ledger_qty(line['quantity'])
            if source == dest or quantity == 0:
                raise ValueError('Invalid movement')
            effects = [((product, source), -quantity), ((product, dest), quantity)]
        elif kind == 'adjustment':
            delta = ledger_qty(line['delta'], signed=True)
            if delta == 0:
                raise ValueError('Zero adjustment')
            effects = [((product, ledger_id(line['location_id'])), delta)]
        else:
            if (type(line['restock']) is not bool or line['condition'] not in ('new', 'used', 'damaged')
                    or (line['condition'] == 'damaged' and line['restock'])):
                raise ValueError('Invalid restock condition')
            item = ledger_id(line['order_item_id'])
            entitlement = state['entitlements'].get(item)
            quantity = ledger_qty(line['quantity'])
            if not entitlement or quantity == 0 or item in returned:
                raise ValueError('Invalid return item')
            if any(line[f] != entitlement.get(f) for f in ('product_id', 'location_id', 'condition')):
                raise ValueError('Return snapshot mismatch')
            total = ledger_qty(entitlement['returned'] + quantity)
            if total > entitlement['quantity']:
                raise ValueError('Return entitlement exceeded')
            returned[item] = total
            effects = [((product, ledger_id(line['location_id'])), quantity)] if line['restock'] else []
        for key, delta in effects:
            if key not in balances or (key in seen and kind != 'return'):
                raise ValueError('Missing baseline or duplicate product/location')
            seen.add(key)
            changes[key] = ledger_qty(changes.get(key, 0) + delta, signed=True)
    for key, delta in changes.items():
        balance = balances[key]
        value = ledger_qty(balance['quantity'] + delta)
        if value < balance['reserved']:
            raise ValueError('Insufficient available stock')
        balance['quantity'] = value
    for item, total in returned.items():
        state['entitlements'][item]['returned'] = total


def ledger_reservation(state, command):
    if command['owner_id'] in state.get('documents', {}):
        raise ValueError('Commerce reservations require document workflow')
    balances = {(b['product_id'], b['location_id']): b for b in state['balances']}
    owner = state['reservations'].setdefault(command['owner_id'], {})
    seen = set()
    for line in command['lines']:
        ledger_fields(line, 'product_id location_id quantity')
        key = (ledger_id(line['product_id']), ledger_id(line['location_id']))
        quantity = ledger_qty(line['quantity'])
        if key in seen or key not in balances or quantity == 0:
            raise ValueError('Invalid reservation line')
        seen.add(key)
        # JSON tuple encoding avoids ambiguous concatenated identifiers.
        scope = json.dumps(key, separators=(',', ':'))
        held = owner.get(scope, 0)
        balance = balances[key]
        delta = quantity if command['action'] == 'reserve' else -quantity
        owner[scope] = ledger_qty(held + delta)
        balance['reserved'] = ledger_qty(balance['reserved'] + delta)
        if balance['reserved'] > balance['quantity']:
            raise ValueError('Insufficient available stock')


def ledger_reverse(state, command):
    target = state['requests'].get(command['target_request_id'])
    if not target or target['status'] != 'posted':
        raise ValueError('Only posted requests can reverse')
    original = target['command']
    if original.get('kind') not in ('movement', 'adjustment'):
        raise ValueError('Return reversals require explicit entitlement policy')
    inverse = copy.deepcopy(original)
    for line in inverse['lines']:
        if original['kind'] == 'movement':
            line['source'], line['destination'] = line['destination'], line['source']
        else:
            line['delta'] = -line['delta']
    ledger_post(state, inverse)
    target['status'] = 'reversed'
    target['reversed_by'] = command['request_id']


def apply_event(state, event):
    """Apply a sealed successor to a previously verified state without mutation.

    State is an internal projection, never accepted from an untrusted caller.
    Use project() on authoritative complete events at external boundaries.
    """
    if not isinstance(event, dict):
        raise ValueError('Invalid event')
    version = event.get('version')
    if type(version) is not int or version not in (1, 2):
        raise ValueError('Unsupported version')
    ledger_fields(event, 'version organization_id sequence predecessor actor_id command event_hash' +
                  (' recorded_at reference_snapshots' if version == 2 else ''))
    ledger_qty(event['sequence'])
    ledger_id(event['organization_id'])
    ledger_id(event['actor_id'])
    raw = {key: value for key, value in event.items() if key != 'event_hash'}
    if canonical_hash(raw) != event['event_hash']:
        raise ValueError('Corrupt event')
    command = ledger_command(event['command'])
    if (command['action'] in COMMERCE_ACTIONS) != (version == 2):
        raise ValueError('Command version mismatch')
    if version == 2:
        commerce_context({'recorded_at': event['recorded_at'], 'reference_snapshots': event['reference_snapshots']})
    if state is None:
        if command['action'] != 'opening' or event['sequence'] != 0 or event['predecessor'] is not None:
            raise ValueError('Missing genesis')
        state = ledger_initialize(command, event['organization_id'])
    else:
        state = copy.deepcopy(state)
        if command['action'] == 'opening':
            raise ValueError('Duplicate genesis')
    if (event['organization_id'] != state['organization_id'] or
            event['sequence'] != state['sequence'] + 1 or event['predecessor'] != state['head']):
        raise ValueError('Broken chain')
    request_id = command['request_id']
    if request_id in state['events']:
        raise ValueError('Duplicate request in chain')
    action = command['action']
    if action in COMMERCE_ACTIONS:
        commerce_apply(state, event, command)
    elif action in ('reserve', 'release'):
        ledger_reservation(state, command)
    elif action == 'reverse':
        ledger_reverse(state, command)
    elif action in ('submit', 'direct'):
        if action == 'submit':
            ledger_post(copy.deepcopy(state), command)  # validate snapshot without posting
        else:
            ledger_post(state, command)
        state['requests'][request_id] = {'status': 'pending' if action == 'submit' else 'posted',
                                         'command': command}
    elif action in ('approve', 'reject'):
        target = state['requests'].get(command['target_request_id'])
        if not target or target['status'] != 'pending' or target['command'].get('action') != 'submit':
            raise ValueError('Request is not pending')
        if action == 'approve':
            ledger_post(state, target['command'])
        target['status'] = 'posted' if action == 'approve' else 'rejected'
    state['events'][request_id] = copy.deepcopy(event)
    state['sequence'], state['head'] = event['sequence'], event['event_hash']
    return state


def project(events, expected_org_id, expected_head=None):
    """Verify a complete ordered chain. Adapter must independently prove no tail omission."""
    ledger_id(expected_org_id)
    if not isinstance(events, list) or not events:
        raise ValueError('Missing history')
    state = None
    for event in events:
        state = apply_event(state, event)
        if state['organization_id'] != expected_org_id:
            raise ValueError('Organization mismatch')
    if expected_head is not None and state['head'] != expected_head:
        raise ValueError('Incomplete history')
    return state


def prepare_command(events, command, actor_id, expected_org_id, context=None):
    """Prepare exactly one event, or return the original committed event on replay.

    Authorization (including direct movements and adjustments) belongs to adapter.
    Trusted actor metadata is excluded from canonical duplicate-payload comparison.
    """
    ledger_id(actor_id)
    command = ledger_command(command)
    if command['action'] == 'opening':
        raise ValueError('Opening requires controlled initialization')
    state = project(events, expected_org_id)
    previous = state['events'].get(command['request_id'])
    if previous:
        if canonical_hash(previous['command']) != canonical_hash(command):
            raise ValueError('Request payload conflict')
        return {'event': copy.deepcopy(previous), 'replay': True}
    raw_event = {'version': 2 if command['action'] in COMMERCE_ACTIONS else 1, 'organization_id': expected_org_id,
                   'sequence': state['sequence'] + 1, 'predecessor': state['head'],
                   'actor_id': actor_id, 'command': command}
    if raw_event['version'] == 2:
        raw_event.update(commerce_context(context))
    event = ledger_seal(raw_event)
    apply_event(state, event)
    return {'event': event, 'replay': False}


def commerce_uuid(value):
    try:
        if not isinstance(value, str) or str(UUID(value)) != value:
            raise ValueError('Canonical UUID required')
    except (ValueError, TypeError, AttributeError):
        raise ValueError('Canonical UUID required')
    return value


def commerce_text(value, maximum, required=False):
    if not isinstance(value, str) or len(value) > maximum or (required and not value.strip()):
        raise ValueError('Invalid text')


def commerce_money(value):
    if not isinstance(value, str) or not re.fullmatch(r'(?:0|[1-9][0-9]{0,13})\.[0-9]{2}', value):
        raise ValueError('Canonical two-decimal money required')
    minor = int(Decimal(value) * 100)
    if minor > MAX_MONEY:
        raise ValueError('Money overflow')
    return minor


def commerce_amount(minor):
    if type(minor) is not int or not 0 <= minor <= MAX_MONEY:
        raise ValueError('Money overflow')
    return str(minor // 100) + '.' + str(minor % 100).zfill(2)


def commerce_date(value):
    try:
        if not isinstance(value, str) or not re.fullmatch(r'[0-9]{4}-[0-9]{2}-[0-9]{2}', value):
            raise ValueError('Invalid date')
        date.fromisoformat(value)
    except (TypeError, ValueError):
        raise ValueError('Invalid date')


def commerce_draft(draft, kind=None):
    if not isinstance(draft, dict):
        raise ValueError('Invalid document')
    sales = kind == 'sales_order' if kind else 'customer_id' in draft
    ledger_fields(draft, ('customer_id customer_name customer_email customer_address ' if sales else 'supplier_id expected_date ') +
                  'order_date currency notes tax shipping items')
    commerce_date(draft['order_date'])
    if sales:
        if draft['customer_id'] is not None:
            commerce_uuid(draft['customer_id'])
        commerce_text(draft['customer_name'], 255, True)
        commerce_text(draft['customer_email'], 255)
        if draft['customer_email'] and not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', draft['customer_email']):
            raise ValueError('Invalid email')
        commerce_text(draft['customer_address'], 2000)
    else:
        commerce_uuid(draft['supplier_id'])
        if draft['expected_date'] is not None:
            commerce_date(draft['expected_date'])
            if draft['expected_date'] < draft['order_date']:
                raise ValueError('Expected date precedes order')
    if not isinstance(draft['currency'], str) or not re.fullmatch(r'[A-Z]{3}', draft['currency']):
        raise ValueError('Invalid currency')
    commerce_text(draft['notes'], 10000)
    tax, shipping = commerce_money(draft['tax']), commerce_money(draft['shipping'])
    ledger_list(draft['items'])
    if not draft['items']:
        raise ValueError('Empty document')
    seen, subtotal = set(), 0
    for item in draft['items']:
        ledger_fields(item, 'line_id product_id product_variant_id quantity ' + ('unit_price' if sales else 'unit_cost supplier_sku'))
        commerce_uuid(item['line_id'])
        commerce_uuid(item['product_id'])
        if item['line_id'] in seen:
            raise ValueError('Duplicate document line')
        seen.add(item['line_id'])
        if item['product_variant_id'] is not None:
            raise ValueError('VARIANT_UNSUPPORTED')
        if ledger_qty(item['quantity']) == 0:
            raise ValueError('Positive quantity required')
        if not sales and item['supplier_sku'] is not None:
            commerce_text(item['supplier_sku'], 255)
        subtotal = subtotal + commerce_money(item['unit_price' if sales else 'unit_cost']) * item['quantity']
        commerce_amount(subtotal)
    return commerce_amount(subtotal), commerce_amount(subtotal + tax + shipping)


def commerce_command(command):
    action = command['action']
    fields = {
        'create_order': 'document', 'create_purchase_order': 'document',
        'amend_document': 'document_id expected_revision document',
        'approve_document': 'document_id expected_revision allocations',
        'reject_document': 'document_id expected_revision', 'cancel_document': 'document_id expected_revision',
        'fulfill_order': 'document_id expected_revision lines', 'receive_purchase_order': 'document_id expected_revision lines',
        'submit_return': 'document_id lines', 'approve_return': 'target_request_id',
        'reject_return': 'target_request_id', 'register_bins': 'bins',
    }
    ledger_fields(command, 'request_id action reason ' + fields[action])
    commerce_uuid(command['request_id'])
    commerce_text(command['reason'], 2000, True)
    for key in ('document_id', 'target_request_id'):
        if key in command:
            commerce_uuid(command[key])
    if 'expected_revision' in command and ledger_qty(command['expected_revision']) == 0:
        raise ValueError('Positive revision required')
    if 'document' in command:
        kind = 'sales_order' if action == 'create_order' else 'purchase_order' if action == 'create_purchase_order' else None
        commerce_draft(command['document'], kind)
    for list_key in ('allocations', 'lines', 'bins'):
        if list_key not in command:
            continue
        lines = command[list_key]
        ledger_list(lines)
        if not lines and list_key != 'allocations':
            raise ValueError('Empty lines')
        for line in lines:
            if list_key == 'bins':
                ledger_fields(line, 'product_id location_id')
                commerce_uuid(line['product_id'])
            elif action == 'submit_return':
                ledger_fields(line, 'entitlement_id location_id quantity condition restock')
                commerce_uuid(line['entitlement_id'])
                if line['condition'] not in ('new', 'used', 'damaged') or type(line['restock']) is not bool or (line['condition'] == 'damaged' and line['restock']):
                    raise ValueError('Invalid return disposition')
            else:
                ledger_fields(line, 'line_id location_id quantity')
                commerce_uuid(line['line_id'])
            commerce_uuid(line['location_id'])
            if 'quantity' in line and ledger_qty(line['quantity']) == 0:
                raise ValueError('Positive quantity required')
    return copy.deepcopy(command)


def commerce_context(context):
    ledger_fields(context, 'recorded_at reference_snapshots')
    stamp = context['recorded_at']
    try:
        if not isinstance(stamp, str) or len(stamp) > 40 or 'T' not in stamp:
            raise ValueError('Invalid event timestamp')
        parsed = datetime.fromisoformat(stamp.replace('Z', '+00:00'))
        if parsed.utcoffset() is None or parsed.utcoffset().total_seconds() != 0:
            raise ValueError('UTC timestamp required')
        snapshots = context['reference_snapshots']
        if not isinstance(snapshots, dict) or len(json.dumps(snapshots, allow_nan=False)) > 65536:
            raise ValueError('Invalid reference snapshots')
    except (TypeError, ValueError, OverflowError):
        raise ValueError('Invalid server event context')
    return copy.deepcopy(context)


def commerce_key(line_id, location_id):
    return json.dumps([line_id, location_id], separators=(',', ':'))


def commerce_bins(state):
    return {(b['product_id'], b['location_id']): b for b in state['balances']}


def commerce_doc(state, command, kinds=None, statuses=None):
    document = state['documents'].get(command['document_id'])
    if not document or (kinds and document['kind'] not in kinds) or (statuses and document['status'] not in statuses):
        raise ValueError('Document is not eligible')
    if 'expected_revision' in command and document['revision'] != command['expected_revision']:
        raise ValueError('Document revision conflict')
    return document


def commerce_allocations(document, lines):
    items = {line['line_id']: line for line in document['draft']['items']}
    seen, totals, bins = set(), {}, {}
    for line in lines:
        item = items.get(line['line_id'])
        key = commerce_key(line['line_id'], line['location_id'])
        if not item or key in seen:
            raise ValueError('Invalid or duplicate line allocation')
        seen.add(key)
        totals[line['line_id']] = ledger_qty(totals.get(line['line_id'], 0) + line['quantity'])
        bin_key = (item['product_id'], line['location_id'])
        bins[bin_key] = ledger_qty(bins.get(bin_key, 0) + line['quantity'])
    return items, totals, bins


def commerce_reserve(state, document, allocations, release=False):
    items, totals, changes = commerce_allocations(document, allocations)
    if any(totals.get(key, 0) != item['quantity'] for key, item in items.items()):
        raise ValueError('Allocate every order line exactly')
    bins = commerce_bins(state)
    owner = state['reservations'].setdefault(document['id'], {})
    for key, quantity in changes.items():
        if key not in bins:
            raise ValueError('Missing stock baseline')
        scope = commerce_key(key[0], key[1])
        held = owner.get(scope, 0)
        delta = -quantity if release else quantity
        next_held = ledger_qty(held + delta)
        reserved = ledger_qty(bins[key]['reserved'] + delta)
        if reserved > bins[key]['quantity']:
            raise ValueError('Insufficient available stock')
        owner[scope] = next_held
        bins[key]['reserved'] = reserved


def commerce_progress(state, document, command):
    receipt = command['action'] == 'receive_purchase_order'
    counter_name = 'received' if receipt else 'fulfilled'
    items, totals, changes = commerce_allocations(document, command['lines'])
    counters = document[counter_name]
    allocations = {commerce_key(line['line_id'], line['location_id']): line['quantity'] for line in document['allocations']}
    for line_id, quantity in totals.items():
        old = sum(value for key, value in counters.items() if json.loads(key)[0] == line_id)
        if ledger_qty(old + quantity) > items[line_id]['quantity']:
            raise ValueError('Document quantity exceeded')
    for line in command['lines']:
        key = commerce_key(line['line_id'], line['location_id'])
        value = ledger_qty(counters.get(key, 0) + line['quantity'])
        if not receipt and value > allocations.get(key, 0):
            raise ValueError('Fulfillment exceeds allocation')
        counters[key] = value
    bins = commerce_bins(state)
    owner = state['reservations'].get(document['id'], {})
    for key, quantity in changes.items():
        if receipt and key not in bins:
            bins[key] = {'product_id': key[0], 'location_id': key[1], 'quantity': 0, 'reserved': 0}
            state['balances'].append(bins[key])
        if key not in bins:
            raise ValueError('Missing stock baseline')
        balance = bins[key]
        if receipt:
            balance['quantity'] = ledger_qty(balance['quantity'] + quantity)
        else:
            scope = commerce_key(key[0], key[1])
            owner[scope] = ledger_qty(owner.get(scope, 0) - quantity)
            balance['reserved'] = ledger_qty(balance['reserved'] - quantity)
            balance['quantity'] = ledger_qty(balance['quantity'] - quantity)
            if balance['reserved'] > balance['quantity']:
                raise ValueError('Insufficient stock')
    if not receipt:
        for line in command['lines']:
            key = str(uuid5(UUID('d3372680-beb0-4d1d-b1af-0c7e762d8f28'), json.dumps([
                document['id'], command['request_id'], line['line_id'], line['location_id']], separators=(',', ':'))))
            if key in state['entitlements']:
                raise ValueError('Duplicate fulfillment entitlement')
            state['entitlements'][key] = {'id': key, 'document_id': document['id'], 'line_id': line['line_id'],
                'product_id': items[line['line_id']]['product_id'], 'quantity': line['quantity'], 'returned': 0,
                'source_fulfillment_request_id': command['request_id'], 'source_location_id': line['location_id']}
    completed = sum(counters.values()) == sum(item['quantity'] for item in items.values())
    document['status'] = ('received' if completed else 'partially_received') if receipt else ('fulfilled' if completed else 'partially_fulfilled')
    state['balances'].sort(key=lambda row: (row['product_id'], row['location_id']))


def commerce_return(state, command):
    commerce_doc(state, command, ('sales_order',), ('partially_fulfilled', 'fulfilled'))
    seen, changes, returned = set(), {}, {}
    bins = commerce_bins(state)
    for line in command['lines']:
        key = line['entitlement_id']
        entitlement = state['entitlements'].get(key)
        if key in seen or not entitlement or entitlement.get('document_id') != command['document_id']:
            raise ValueError('Invalid return entitlement')
        seen.add(key)
        total = ledger_qty(entitlement['returned'] + line['quantity'])
        if total > entitlement['quantity']:
            raise ValueError('Return entitlement exceeded')
        returned[key] = total
        if line['restock']:
            bin_key = (entitlement['product_id'], line['location_id'])
            if bin_key not in bins:
                raise ValueError('Register return destination first')
            changes[bin_key] = ledger_qty(changes.get(bin_key, 0) + line['quantity'])
    for key, delta in changes.items():
        bins[key]['quantity'] = ledger_qty(bins[key]['quantity'] + delta)
    for key, total in returned.items():
        state['entitlements'][key]['returned'] = total


def commerce_apply(state, event, command):
    documents = state.setdefault('documents', {})
    action, request_id = command['action'], command['request_id']
    if action == 'register_bins':
        bins, seen = commerce_bins(state), set()
        for line in command['bins']:
            key = (line['product_id'], line['location_id'])
            if key in seen:
                raise ValueError('Duplicate bin registration')
            seen.add(key)
            if key not in bins:
                state['balances'].append(dict(line, quantity=0, reserved=0))
        state['balances'].sort(key=lambda row: (row['product_id'], row['location_id']))
        return
    if action in ('create_order', 'create_purchase_order'):
        if request_id in documents or any(state['reservations'].get(request_id, {}).values()):
            raise ValueError('Document identity already used')
        kind = 'sales_order' if action == 'create_order' else 'purchase_order'
        subtotal, total = commerce_draft(command['document'], kind)
        documents[request_id] = {'id': request_id, 'kind': kind, 'number': ('SO-' if kind == 'sales_order' else 'PO-') + request_id,
            'revision': 1, 'status': 'pending', 'approval_status': 'pending', 'draft': copy.deepcopy(command['document']),
            'snapshots': copy.deepcopy(event['reference_snapshots']), 'subtotal': subtotal, 'total': total,
            'created_by': event['actor_id'], 'created_at': event['recorded_at'], 'updated_at': event['recorded_at'],
            'allocations': [], 'fulfilled': {}, 'received': {}}
        return
    if action == 'submit_return':
        commerce_return(copy.deepcopy(state), command)
        state['requests'][request_id] = {'status': 'pending', 'command': copy.deepcopy(command),
            'created_by': event['actor_id'], 'created_at': event['recorded_at']}
        return
    if action in ('approve_return', 'reject_return'):
        target = state['requests'].get(command['target_request_id'])
        if not target or target['status'] != 'pending' or target['command']['action'] != 'submit_return':
            raise ValueError('Return request is not pending')
        if action == 'approve_return':
            commerce_return(state, target['command'])
        target['status'] = 'posted' if action == 'approve_return' else 'rejected'
        target['reviewed_by'], target['reviewed_at'] = event['actor_id'], event['recorded_at']
        return
    document = commerce_doc(state, command)
    if action == 'amend_document':
        if document['status'] not in ('pending', 'rejected'):
            raise ValueError('Document cannot be amended')
        subtotal, total = commerce_draft(command['document'], document['kind'])
        document.update(draft=copy.deepcopy(command['document']), snapshots=copy.deepcopy(event['reference_snapshots']),
                        subtotal=subtotal, total=total, status='pending', approval_status='pending')
    elif action in ('approve_document', 'reject_document'):
        if document['status'] != 'pending':
            raise ValueError('Document is not pending')
        if action == 'approve_document':
            if document['kind'] == 'sales_order':
                commerce_reserve(state, document, command['allocations'])
                document['allocations'] = copy.deepcopy(command['allocations'])
            elif command['allocations']:
                raise ValueError('Purchase approval does not allocate stock')
        document['status'] = 'approved' if action == 'approve_document' else 'rejected'
        document['approval_status'] = document['status']
    elif action == 'cancel_document':
        if document['status'] not in ('pending', 'rejected', 'approved') or any(document['fulfilled'].values()) or any(document['received'].values()):
            raise ValueError('Posted document cannot be cancelled')
        if document['kind'] == 'sales_order' and document['status'] == 'approved':
            commerce_reserve(state, document, document['allocations'], release=True)
        document['status'] = 'cancelled'
    elif action in ('fulfill_order', 'receive_purchase_order'):
        expected_kind = 'sales_order' if action == 'fulfill_order' else 'purchase_order'
        statuses = ('approved', 'partially_fulfilled') if action == 'fulfill_order' else ('approved', 'partially_received')
        commerce_doc(state, command, (expected_kind,), statuses)
        commerce_progress(state, document, command)
    else:
        raise ValueError('Unsupported commerce transition')
    document['revision'] = ledger_qty(document['revision'] + 1)
    document['updated_at'] = event['recorded_at']
