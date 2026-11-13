"""Pure ledger contracts; fake uniqueness is not evidence of native enforcement."""
import copy
import importlib.util
from pathlib import Path

import pytest

PATH = Path(__file__).parents[1] / 'functions' / 'stock_ledger_domain.py'


def test_domain_entrypoint_exists():
    assert PATH.exists(), 'stock ledger domain implementation missing'


@pytest.fixture
def domain():
    assert PATH.exists(), 'stock ledger domain implementation missing'
    spec = importlib.util.spec_from_file_location('ledger_domain', PATH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def opening(d):
    return d.opening_event('org', 'opening', [
        {'product_id': 'p', 'location_id': 'a', 'quantity': 10, 'reserved': 2},
        {'product_id': 'p', 'location_id': 'b', 'quantity': 0, 'reserved': 0},
    ], [{'order_item_id': 'item', 'product_id': 'p', 'quantity': 3,
         'returned': 1, 'location_id': 'b', 'condition': 'new'}], 'admin')


def move(request_id='move', quantity=3, action='direct'):
    return {'request_id': request_id, 'action': action, 'kind': 'movement',
            'reason': 'relocate', 'lines': [{'product_id': 'p', 'source': 'a',
                'destination': 'b', 'quantity': quantity}]}


def prepare(d, events, command):
    return d.prepare_command(events, command, 'actor', 'org')


def review(target, action='approve', request_id='review'):
    return {'request_id': request_id, 'action': action,
            'target_request_id': target, 'reason': 'reviewed'}


def test_opening_and_transfer_are_deterministic_immutable(domain):
    events = [opening(domain)]
    command = move()
    original = copy.deepcopy((events, command))
    result = prepare(domain, events, command)
    assert result == prepare(domain, events, command)
    state = domain.project(events + [result['event']], 'org')
    assert [(b['quantity'], b['reserved']) for b in state['balances']] == [(7, 2), (3, 0)]
    assert (events, command) == original


@pytest.mark.parametrize('quantity', [True, 0, -1, 9, 2147483648, 1.5])
def test_invalid_or_unavailable_quantity_fails_without_mutation(domain, quantity):
    events = [opening(domain)]
    before = copy.deepcopy(events)
    with pytest.raises(ValueError):
        prepare(domain, events, move(quantity=quantity))
    assert events == before


def test_submit_then_approve_posts_once_in_review_event(domain):
    events = [opening(domain)]
    events.append(prepare(domain, events, move(action='submit'))['event'])
    assert domain.project(events, 'org')['balances'][0]['quantity'] == 10
    approval = prepare(domain, events, review('move'))['event']
    state = domain.project(events + [approval], 'org')
    assert state['requests']['move']['status'] == 'posted'
    assert state['balances'][0]['quantity'] == 7
    with pytest.raises(ValueError):
        prepare(domain, events + [approval], review('move', request_id='second'))


def test_rejection_never_changes_stock_and_is_terminal(domain):
    events = [opening(domain)]
    events.append(prepare(domain, events, move(action='submit'))['event'])
    events.append(prepare(domain, events, review('move', 'reject'))['event'])
    assert domain.project(events, 'org')['balances'][0]['quantity'] == 10
    with pytest.raises(ValueError):
        prepare(domain, events, review('move', request_id='later'))


def test_lost_response_replay_and_complete_payload_conflict(domain):
    events = [opening(domain)]
    event = prepare(domain, events, move())['event']
    events.append(event)  # committed, transport response lost
    assert prepare(domain, events, move()) == {'event': event, 'replay': True}
    changed = move()
    changed['reason'] = 'different reason'
    with pytest.raises(ValueError):
        prepare(domain, events, changed)


def test_malformed_or_incomplete_chain_fails_closed(domain):
    genesis = opening(domain)
    event = prepare(domain, [genesis], move())['event']
    for events in [[], [event], [genesis, event, event], [event, genesis]]:
        with pytest.raises(ValueError):
            domain.project(events, 'org')
    corrupt = copy.deepcopy(event)
    corrupt['command']['lines'][0]['quantity'] = 1
    with pytest.raises(ValueError):
        domain.project([genesis, corrupt], 'org')
    with pytest.raises(ValueError):
        domain.project([genesis], 'org', expected_head=event['event_hash'])
    with pytest.raises(ValueError):
        domain.project([genesis], 'other-org')


def test_duplicate_lines_and_missing_baseline_are_rejected(domain):
    command = move()
    command['lines'] *= 2
    with pytest.raises(ValueError):
        prepare(domain, [opening(domain)], command)
    command = move()
    command['lines'][0]['destination'] = 'unknown'
    with pytest.raises(ValueError):
        prepare(domain, [opening(domain)], command)


def test_returns_bound_to_snapshot_and_cumulative_entitlement(domain):
    events = [opening(domain)]
    command = {'request_id': 'return', 'action': 'submit', 'kind': 'return',
               'reason': 'customer return', 'lines': [{'order_item_id': 'item',
               'product_id': 'p', 'location_id': 'b', 'condition': 'new', 'restock': True, 'quantity': 2}]}
    events.append(prepare(domain, events, command)['event'])
    events.append(prepare(domain, events, review('return'))['event'])
    state = domain.project(events, 'org')
    assert state['balances'][1]['quantity'] == 2
    assert state['entitlements']['item']['returned'] == 3
    command['request_id'] = 'excess'
    with pytest.raises(ValueError):
        prepare(domain, events, command)
    for field, value in [('product_id', 'other'), ('location_id', 'a'), ('condition', 'damaged')]:
        altered = copy.deepcopy(command)
        altered['lines'][0][field] = value
        with pytest.raises(ValueError):
            prepare(domain, [opening(domain)], altered)


def test_adjustment_all_lines_atomic_and_overflow_rejected(domain):
    command = {'request_id': 'adjust', 'action': 'direct', 'kind': 'adjustment',
               'reason': 'count', 'lines': [
                   {'product_id': 'p', 'location_id': 'b', 'delta': 2},
                   {'product_id': 'p', 'location_id': 'a', 'delta': -9}]}
    with pytest.raises(ValueError):
        prepare(domain, [opening(domain)], command)
    command['lines'] = [{'product_id': 'p', 'location_id': 'a', 'delta': 2147483647}]
    with pytest.raises(ValueError):
        prepare(domain, [opening(domain)], command)


def test_unique_predecessor_fake_store_serializes_concurrent_spending(domain):
    events = [opening(domain)]
    first = prepare(domain, events, move('one', 6))['event']
    second = prepare(domain, events, move('two', 6))['event']

    def append(event):
        if any(e['predecessor'] == event['predecessor'] or
               e['command']['request_id'] == event['command']['request_id'] for e in events):
            raise ValueError('unique conflict')
        events.append(event)

    append(first)
    with pytest.raises(ValueError, match='unique conflict'):
        append(second)
    with pytest.raises(ValueError):
        prepare(domain, events, move('two', 6))
    assert domain.project(events, 'org')['balances'][0]['quantity'] == 4


def test_pending_returns_revalidate_entitlement_at_approval(domain):
    events = [opening(domain)]
    command = {'request_id': 'first', 'action': 'submit', 'kind': 'return',
               'reason': 'return', 'lines': [{'order_item_id': 'item',
               'product_id': 'p', 'location_id': 'b', 'condition': 'new', 'restock': True, 'quantity': 2}]}
    events.append(prepare(domain, events, command)['event'])
    command['request_id'] = 'second'
    events.append(prepare(domain, events, command)['event'])
    events.append(prepare(domain, events, review('first'))['event'])
    before = copy.deepcopy(events)
    with pytest.raises(ValueError):
        prepare(domain, events, review('second', request_id='second-review'))
    assert events == before
    assert domain.project(events, 'org')['requests']['second']['status'] == 'pending'


def test_baseline_rejects_duplicates_bool_reservations_and_unknown_return_bin(domain):
    genesis = opening(domain)
    balances = genesis['command']['balances']
    entitlements = genesis['command']['entitlements']
    with pytest.raises(ValueError):
        domain.opening_event('org', 'opening', balances + [balances[0]], entitlements, 'admin')
    for reserved in [True, -1, 11, 2147483648]:
        bad = copy.deepcopy(balances)
        bad[0]['reserved'] = reserved
        with pytest.raises(ValueError):
            domain.opening_event('org', 'opening', bad, entitlements, 'admin')
    bad = copy.deepcopy(entitlements)
    bad[0]['location_id'] = 'missing'
    with pytest.raises(ValueError):
        domain.opening_event('org', 'opening', balances, bad, 'admin')


def test_complete_payload_extra_fields_and_forged_trusted_metadata_refused(domain):
    for field in ['actor_id', 'organization_id', 'refund', 'ignored']:
        command = move()
        command[field] = 'forged'
        with pytest.raises(ValueError):
            prepare(domain, [opening(domain)], command)
    command = move()
    command['lines'][0]['ignored'] = 'value'
    with pytest.raises(ValueError):
        prepare(domain, [opening(domain)], command)


def test_apply_event_keeps_prior_projection_immutable(domain):
    events = [opening(domain)]
    state = domain.project(events, 'org')
    original = copy.deepcopy(state)
    event = prepare(domain, events, move())['event']
    after = domain.apply_event(state, event)
    after['balances'][0]['quantity'] = 0
    after['events']['opening']['command']['balances'][0]['quantity'] = 0
    assert state == original


def test_replay_ignores_only_trusted_actor_argument(domain):
    events = [opening(domain)]
    event = prepare(domain, events, move())['event']
    events.append(event)
    assert domain.prepare_command(events, move(), 'different-authorized-actor', 'org') == {
        'event': event, 'replay': True}


def test_return_aggregates_distinct_items_and_nonrestock_consumes_only_entitlement(domain):
    genesis = opening(domain)
    entitlement = copy.deepcopy(genesis['command']['entitlements'][0])
    entitlement['order_item_id'] = 'item2'
    events = [domain.opening_event('org', 'opening', genesis['command']['balances'],
              genesis['command']['entitlements'] + [entitlement], 'admin')]
    command = {'request_id': 'return', 'action': 'submit', 'kind': 'return', 'reason': 'return',
               'lines': [{'order_item_id': item, 'product_id': 'p', 'location_id': 'b',
                          'condition': 'new', 'restock': True, 'quantity': 1}
                         for item in ['item', 'item2']]}
    events.append(prepare(domain, events, command)['event'])
    events.append(prepare(domain, events, review('return'))['event'])
    assert domain.project(events, 'org')['balances'][1]['quantity'] == 2
    command['request_id'] = 'nonrestock'
    for line in command['lines']:
        line['restock'] = False
    events.append(prepare(domain, events, command)['event'])
    events.append(prepare(domain, events, review('nonrestock', request_id='review2'))['event'])
    state = domain.project(events, 'org')
    assert state['balances'][1]['quantity'] == 2
    assert state['entitlements']['item']['returned'] == 3


@pytest.mark.parametrize('restock', [True, 1, 'true'])
def test_damaged_return_cannot_restock_and_restock_is_boolean(domain, restock):
    genesis = opening(domain)
    genesis['command']['entitlements'][0]['condition'] = 'damaged'
    events = [domain.opening_event('org', 'opening', genesis['command']['balances'],
                                  genesis['command']['entitlements'], 'admin')]
    command = {'request_id': 'return', 'action': 'submit', 'kind': 'return', 'reason': 'return',
               'lines': [{'order_item_id': 'item', 'product_id': 'p', 'location_id': 'b',
                          'condition': 'damaged', 'restock': restock, 'quantity': 1}]}
    with pytest.raises(ValueError):
        prepare(domain, events, command)


def test_reservation_ownership_and_release_are_chain_events(domain):
    events = [opening(domain)]
    command = {'request_id': 'reserve', 'action': 'reserve', 'owner_id': 'order1', 'reason': 'hold',
               'lines': [{'product_id': 'p', 'location_id': 'a', 'quantity': 5}]}
    events.append(prepare(domain, events, command)['event'])
    assert domain.project(events, 'org')['balances'][0]['reserved'] == 7
    with pytest.raises(ValueError):
        prepare(domain, events, move(quantity=4))
    release = dict(command, request_id='release', action='release', owner_id='other')
    with pytest.raises(ValueError):
        prepare(domain, events, release)
    release['owner_id'] = 'order1'
    events.append(prepare(domain, events, release)['event'])
    assert domain.project(events, 'org')['balances'][0]['reserved'] == 2
    with pytest.raises(ValueError):
        prepare(domain, events, dict(release, request_id='release2'))


def test_linked_reversal_is_exact_once_and_still_checks_stock(domain):
    events = [opening(domain)]
    events.append(prepare(domain, events, move())['event'])
    reversal = review('move', action='reverse', request_id='reverse')
    events.append(prepare(domain, events, reversal)['event'])
    state = domain.project(events, 'org')
    assert [b['quantity'] for b in state['balances']] == [10, 0]
    assert state['requests']['move']['status'] == 'reversed'
    with pytest.raises(ValueError):
        prepare(domain, events, dict(reversal, request_id='reverse2'))


def test_reversal_cannot_spend_reserved_destination_stock(domain):
    events = [opening(domain)]
    events.append(prepare(domain, events, move())['event'])
    reserve = {'request_id': 'hold', 'action': 'reserve', 'owner_id': 'order', 'reason': 'hold',
               'lines': [{'product_id': 'p', 'location_id': 'b', 'quantity': 1}]}
    events.append(prepare(domain, events, reserve)['event'])
    before = copy.deepcopy(events)
    with pytest.raises(ValueError):
        prepare(domain, events, review('move', action='reverse', request_id='reverse'))
    assert events == before


def test_damaged_nonrestock_return_is_supported_without_stock_or_refund(domain):
    genesis = opening(domain)
    genesis['command']['entitlements'][0]['condition'] = 'damaged'
    events = [domain.opening_event('org', 'opening', genesis['command']['balances'],
                                  genesis['command']['entitlements'], 'admin')]
    command = {'request_id': 'return', 'action': 'submit', 'kind': 'return', 'reason': 'return',
               'lines': [{'order_item_id': 'item', 'product_id': 'p', 'location_id': 'b',
                          'condition': 'damaged', 'restock': False, 'quantity': 2}]}
    events.append(prepare(domain, events, command)['event'])
    events.append(prepare(domain, events, review('return'))['event'])
    state = domain.project(events, 'org')
    assert [b['quantity'] for b in state['balances']] == [10, 0]
    assert state['entitlements']['item']['returned'] == 3
    with pytest.raises(ValueError):
        prepare(domain, events, review('return', action='reverse', request_id='reverse'))


def test_duplicate_return_item_is_not_hidden_by_bin_aggregation(domain):
    command = {'request_id': 'return', 'action': 'submit', 'kind': 'return', 'reason': 'return',
               'lines': [{'order_item_id': 'item', 'product_id': 'p', 'location_id': 'b',
                          'condition': 'new', 'restock': True, 'quantity': 1}] * 2}
    with pytest.raises(ValueError):
        prepare(domain, [opening(domain)], command)


def test_multiline_reservation_failure_has_no_partial_effect(domain):
    events = [opening(domain)]
    before = copy.deepcopy(events)
    command = {'request_id': 'reserve', 'action': 'reserve', 'owner_id': 'order1', 'reason': 'hold',
               'lines': [{'product_id': 'p', 'location_id': 'a', 'quantity': 1},
                         {'product_id': 'p', 'location_id': 'b', 'quantity': 1}]}
    with pytest.raises(ValueError):
        prepare(domain, events, command)
    assert events == before
