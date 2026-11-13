"""Commerce transitions share the immutable stock chain; no live writes."""
import copy
import importlib.util
from pathlib import Path
from uuid import UUID

import pytest


def ident(n):
    return str(UUID(int=n))


ORG, PRODUCT, LOCATION, OTHER, ACTOR, CUSTOMER, SUPPLIER, LINE = [ident(n) for n in range(1, 9)]
CONTEXT = {'recorded_at': '2026-11-11T12:00:00+00:00', 'reference_snapshots': {}}


@pytest.fixture
def domain():
    spec = importlib.util.spec_from_file_location('commerce_domain', Path(__file__).parents[1] / 'functions' / 'stock_ledger_domain.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def history(d):
    return [d.opening_event(ORG, ident(90), [
        {'product_id': PRODUCT, 'location_id': LOCATION, 'quantity': 10, 'reserved': 2},
        {'product_id': PRODUCT, 'location_id': OTHER, 'quantity': 0, 'reserved': 0},
    ], [], ACTOR)]


def command(n, action, **fields):
    return {'request_id': ident(n), 'action': action, 'reason': 'business workflow', **fields}


def sales(quantity=2):
    return {'customer_id': CUSTOMER, 'customer_name': 'Buyer', 'customer_email': 'buyer@example.test',
            'customer_address': 'Bengaluru', 'order_date': '2026-11-11', 'currency': 'INR',
            'notes': '', 'tax': '1.00', 'shipping': '2.00', 'items': [
                {'line_id': LINE, 'product_id': PRODUCT, 'product_variant_id': None,
                 'quantity': quantity, 'unit_price': '10.25'}]}


def purchase(quantity=2):
    return {'supplier_id': SUPPLIER, 'order_date': '2026-11-11', 'expected_date': None,
            'currency': 'INR', 'notes': '', 'tax': '1.00', 'shipping': '2.00', 'items': [
                {'line_id': LINE, 'product_id': PRODUCT, 'product_variant_id': None,
                 'quantity': quantity, 'unit_cost': '5.00', 'supplier_sku': None}]}


def allocation(quantity=2, location=LOCATION):
    return {'line_id': LINE, 'location_id': location, 'quantity': quantity}


def append(d, events, cmd):
    result = d.prepare_command(events, cmd, ACTOR, ORG, context=CONTEXT)
    assert not result['replay']
    events.append(result['event'])
    return d.project(events, ORG)


def balance(state, location):
    return next(b for b in state['balances'] if b['location_id'] == location and b['product_id'] == PRODUCT)


def approved_sales(d, quantity=2):
    events = history(d)
    append(d, events, command(100, 'create_order', document=sales(quantity)))
    append(d, events, command(101, 'approve_document', document_id=ident(100), expected_revision=1, allocations=[allocation(quantity)]))
    return events


def test_sales_approval_reserves_then_fulfillment_debits_and_issues_entitlement_atomically(domain):
    events = history(domain)
    state = append(domain, events, command(100, 'create_order', document=sales()))
    doc = state['documents'][ident(100)]
    assert doc['status'] == 'pending' and doc['revision'] == 1
    assert doc['subtotal'] == '20.50' and doc['total'] == '23.50'
    assert balance(state, LOCATION)['reserved'] == 2
    state = append(domain, events, command(101, 'approve_document', document_id=ident(100), expected_revision=1, allocations=[allocation()]))
    assert balance(state, LOCATION) == {'product_id': PRODUCT, 'location_id': LOCATION, 'quantity': 10, 'reserved': 4}
    state = append(domain, events, command(102, 'fulfill_order', document_id=ident(100), expected_revision=2, lines=[allocation(1)]))
    assert balance(state, LOCATION)['quantity'] == 9 and balance(state, LOCATION)['reserved'] == 3
    entitlement = next(iter(state['entitlements'].values()))
    assert entitlement['quantity'] == 1 and entitlement['returned'] == 0
    assert entitlement['document_id'] == ident(100) and entitlement['source_fulfillment_request_id'] == ident(102)
    assert state['documents'][ident(100)]['status'] == 'partially_fulfilled'
    state = append(domain, events, command(103, 'fulfill_order', document_id=ident(100), expected_revision=3, lines=[allocation(1)]))
    assert state['documents'][ident(100)]['status'] == 'fulfilled'
    assert balance(state, LOCATION)['reserved'] == 2
    assert len(state['entitlements']) == 2


def test_po_approval_no_stock_receipt_explicit_bin_and_over_receipt_rejected(domain):
    events = history(domain)
    append(domain, events, command(100, 'create_purchase_order', document=purchase()))
    state = append(domain, events, command(101, 'approve_document', document_id=ident(100), expected_revision=1, allocations=[]))
    assert balance(state, OTHER)['quantity'] == 0
    state = append(domain, events, command(102, 'receive_purchase_order', document_id=ident(100), expected_revision=2, lines=[allocation(1, OTHER)]))
    assert balance(state, OTHER)['quantity'] == 1
    assert state['documents'][ident(100)]['status'] == 'partially_received'
    before = copy.deepcopy(events)
    with pytest.raises(ValueError):
        append(domain, events, command(103, 'receive_purchase_order', document_id=ident(100), expected_revision=3, lines=[allocation(2, OTHER)]))
    assert events == before


def test_return_approval_consumes_entitlement_and_restock_in_same_event(domain):
    events = approved_sales(domain)
    state = append(domain, events, command(102, 'fulfill_order', document_id=ident(100), expected_revision=2, lines=[allocation()]))
    entitlement = next(iter(state['entitlements']))
    line = {'entitlement_id': entitlement, 'location_id': OTHER, 'quantity': 1, 'condition': 'new', 'restock': True}
    state = append(domain, events, command(103, 'submit_return', document_id=ident(100), lines=[line]))
    assert balance(state, OTHER)['quantity'] == 0
    state = append(domain, events, command(104, 'approve_return', target_request_id=ident(103)))
    assert balance(state, OTHER)['quantity'] == 1
    assert state['entitlements'][entitlement]['returned'] == 1
    assert state['requests'][ident(103)]['status'] == 'posted'


def test_competing_sales_approvals_cannot_spend_other_order_reservations(domain):
    events = approved_sales(domain, 7)
    append(domain, events, command(110, 'create_order', document=sales(2)))
    before = copy.deepcopy(events)
    with pytest.raises(ValueError):
        append(domain, events, command(111, 'approve_document', document_id=ident(110), expected_revision=1, allocations=[allocation(2)]))
    assert events == before
    assert balance(domain.project(events, ORG), LOCATION)['reserved'] == 9


def test_review_revision_and_cancel_release_own_reservations_only(domain):
    events = approved_sales(domain)
    with pytest.raises(ValueError):
        append(domain, events, command(102, 'cancel_document', document_id=ident(100), expected_revision=1))
    state = append(domain, events, command(103, 'cancel_document', document_id=ident(100), expected_revision=2))
    assert state['documents'][ident(100)]['status'] == 'cancelled'
    assert balance(state, LOCATION)['reserved'] == 2
    assert balance(state, LOCATION)['quantity'] == 10


def test_generic_reservation_cannot_hijack_commerce_owner(domain):
    events = approved_sales(domain)
    with pytest.raises(ValueError):
        append(domain, events, command(103, 'release', owner_id=ident(100), lines=[{'product_id': PRODUCT, 'location_id': LOCATION, 'quantity': 1}]))


@pytest.mark.parametrize('amount', [1.25, True, '-1.00', '1e2', 'NaN', '1.001', '1', '90071992547409.92'])
def test_noncanonical_or_overflow_money_rejected(domain, amount):
    draft = sales()
    draft['items'][0]['unit_price'] = amount
    with pytest.raises(ValueError):
        append(domain, history(domain), command(100, 'create_order', document=draft))


def test_total_multiplication_overflow_rejected(domain):
    draft = sales()
    draft['items'][0]['unit_price'] = '90071992547409.91'
    with pytest.raises(ValueError):
        append(domain, history(domain), command(100, 'create_order', document=draft))


def test_variant_not_silently_mapped_to_parent_stock(domain):
    draft = sales()
    draft['items'][0]['product_variant_id'] = ident(999)
    with pytest.raises(ValueError, match='VARIANT_UNSUPPORTED'):
        append(domain, history(domain), command(100, 'create_order', document=draft))


def test_v2_replay_ignores_new_context_but_rejects_payload_change(domain):
    events = history(domain)
    cmd = command(100, 'create_order', document=sales())
    append(domain, events, cmd)
    replay = domain.prepare_command(events, cmd, ACTOR, ORG, context=None)
    assert replay['replay'] and replay['event'] == events[-1]
    cmd['document']['notes'] = 'changed'
    with pytest.raises(ValueError):
        domain.prepare_command(events, cmd, ACTOR, ORG, context=CONTEXT)


def test_amend_rejected_document_requeues_with_revision(domain):
    events = history(domain)
    append(domain, events, command(100, 'create_order', document=sales()))
    append(domain, events, command(101, 'reject_document', document_id=ident(100), expected_revision=1))
    state = append(domain, events, command(102, 'amend_document', document_id=ident(100), expected_revision=2, document=sales(3)))
    assert state['documents'][ident(100)]['status'] == 'pending'
    assert state['documents'][ident(100)]['revision'] == 3
    assert state['documents'][ident(100)]['subtotal'] == '30.75'


def test_registration_only_adds_zero_bins_never_overwrites_stock(domain):
    events = history(domain)
    new_location = ident(999)
    state = append(domain, events, command(100, 'register_bins', bins=[{'product_id': PRODUCT, 'location_id': LOCATION}, {'product_id': PRODUCT, 'location_id': new_location}]))
    assert balance(state, LOCATION)['quantity'] == 10
    assert balance(state, new_location)['quantity'] == 0
    with pytest.raises(ValueError):
        append(domain, events, command(101, 'register_bins', bins=[{'product_id': PRODUCT, 'location_id': new_location}] * 2))


@pytest.mark.parametrize('kind', ['sales', 'purchase'])
def test_duplicate_fulfillment_or_receipt_is_replay_not_second_stock_effect(domain, kind):
    events = history(domain)
    create = 'create_order' if kind == 'sales' else 'create_purchase_order'
    append(domain, events, command(100, create, document=sales() if kind == 'sales' else purchase()))
    append(domain, events, command(101, 'approve_document', document_id=ident(100), expected_revision=1, allocations=[allocation()] if kind == 'sales' else []))
    action = 'fulfill_order' if kind == 'sales' else 'receive_purchase_order'
    cmd = command(102, action, document_id=ident(100), expected_revision=2, lines=[allocation()])
    state = append(domain, events, cmd)
    before = copy.deepcopy(events)
    assert domain.prepare_command(events, cmd, ACTOR, ORG, context=None)['replay']
    assert events == before
    assert balance(state, LOCATION)['quantity'] == (8 if kind == 'sales' else 12)
    with pytest.raises(ValueError):
        append(domain, events, command(103, action, document_id=ident(100), expected_revision=3, lines=[allocation(1)]))
    assert events == before


def test_multiline_fulfillment_failure_has_no_counter_stock_or_entitlement_effect(domain):
    events = approved_sales(domain)
    before = copy.deepcopy(events)
    with pytest.raises(ValueError):
        append(domain, events, command(102, 'fulfill_order', document_id=ident(100), expected_revision=2,
               lines=[allocation(1), allocation(1, OTHER)]))
    assert events == before
    state = domain.project(events, ORG)
    assert balance(state, LOCATION)['quantity'] == 10
    assert state['entitlements'] == {} and state['documents'][ident(100)]['fulfilled'] == {}


def test_two_lines_same_product_bin_aggregate_reservation_and_fulfillment(domain):
    events = history(domain)
    draft = sales()
    second = dict(draft['items'][0], line_id=ident(99), quantity=3)
    draft['items'].append(second)
    append(domain, events, command(100, 'create_order', document=draft))
    lines = [allocation(), {'line_id': ident(99), 'location_id': LOCATION, 'quantity': 3}]
    state = append(domain, events, command(101, 'approve_document', document_id=ident(100), expected_revision=1, allocations=lines))
    assert balance(state, LOCATION)['reserved'] == 7
    state = append(domain, events, command(102, 'fulfill_order', document_id=ident(100), expected_revision=2, lines=lines))
    assert balance(state, LOCATION)['quantity'] == 5 and balance(state, LOCATION)['reserved'] == 2
    assert sum(item['quantity'] for item in state['entitlements'].values()) == 5


def test_pending_returns_revalidate_entitlement_and_nonrestock_does_not_credit(domain):
    events = approved_sales(domain, 1)
    state = append(domain, events, command(102, 'fulfill_order', document_id=ident(100), expected_revision=2, lines=[allocation(1)]))
    entitlement = next(iter(state['entitlements']))
    line = {'entitlement_id': entitlement, 'location_id': OTHER, 'quantity': 1, 'condition': 'damaged', 'restock': False}
    for n in (103, 104):
        append(domain, events, command(n, 'submit_return', document_id=ident(100), lines=[line]))
    state = append(domain, events, command(105, 'approve_return', target_request_id=ident(103)))
    assert balance(state, OTHER)['quantity'] == 0
    assert state['entitlements'][entitlement]['returned'] == 1
    before = copy.deepcopy(events)
    with pytest.raises(ValueError):
        append(domain, events, command(106, 'approve_return', target_request_id=ident(104)))
    assert events == before
    state = append(domain, events, command(107, 'reject_return', target_request_id=ident(104)))
    assert state['requests'][ident(104)]['status'] == 'rejected'


def test_return_cannot_reference_another_document_or_legacy_review_actions(domain):
    events = approved_sales(domain, 1)
    state = append(domain, events, command(102, 'fulfill_order', document_id=ident(100), expected_revision=2, lines=[allocation(1)]))
    entitlement = next(iter(state['entitlements']))
    line = {'entitlement_id': entitlement, 'location_id': OTHER, 'quantity': 1, 'condition': 'new', 'restock': True}
    with pytest.raises(ValueError):
        append(domain, events, command(103, 'submit_return', document_id=ident(999), lines=[line]))
    append(domain, events, command(104, 'submit_return', document_id=ident(100), lines=[line]))
    for action in ('approve', 'reject'):
        with pytest.raises(ValueError):
            append(domain, events, command(105, action, target_request_id=ident(104)))


def test_partial_shipment_cannot_be_cancelled_or_amended(domain):
    events = approved_sales(domain)
    append(domain, events, command(102, 'fulfill_order', document_id=ident(100), expected_revision=2, lines=[allocation(1)]))
    with pytest.raises(ValueError):
        append(domain, events, command(103, 'cancel_document', document_id=ident(100), expected_revision=3))
    with pytest.raises(ValueError):
        append(domain, events, command(104, 'amend_document', document_id=ident(100), expected_revision=3, document=sales()))


@pytest.mark.parametrize('field', ['actor_id', 'recorded_at', 'reference_snapshots', 'organization_id', 'total'])
def test_client_cannot_forge_event_context_or_totals(domain, field):
    cmd = command(100, 'create_order', document=sales())
    cmd[field] = 'forged'
    with pytest.raises(ValueError):
        append(domain, history(domain), cmd)


@pytest.mark.parametrize('context', [None, {}, {'recorded_at': '2026-11-11', 'reference_snapshots': {}},
                                    {'recorded_at': '2026-11-11T12:00:00', 'reference_snapshots': {}},
                                    {'recorded_at': '2026-11-11T12:00:00+00:00', 'reference_snapshots': []}])
def test_new_commerce_event_requires_server_context(domain, context):
    with pytest.raises(ValueError):
        domain.prepare_command(history(domain), command(100, 'create_order', document=sales()), ACTOR, ORG, context=context)


def test_v1_history_remains_unchanged_and_mixed_chain_replays(domain):
    events = history(domain)
    original = copy.deepcopy(events)
    state = append(domain, events, command(100, 'create_order', document=sales()))
    assert events[0] == original[0] and events[0]['version'] == 1 and events[1]['version'] == 2
    assert state['documents'][ident(100)]['created_at'] == CONTEXT['recorded_at']
    assert domain.project(events, ORG) == state
    corrupted = copy.deepcopy(events)
    corrupted[-1]['reference_snapshots']['forged'] = True
    with pytest.raises(ValueError):
        domain.project(corrupted, ORG)
