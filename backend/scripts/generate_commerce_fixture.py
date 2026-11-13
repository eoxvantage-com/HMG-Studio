"""Generate an offline cross-language contract fixture; never calls Taruvi."""
import importlib.util
import json
from pathlib import Path
from uuid import UUID

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('domain', ROOT / 'backend/functions/stock_ledger_domain.py')
d = importlib.util.module_from_spec(spec)
spec.loader.exec_module(d)

def ident(n):
    return str(UUID(int=n))

org, product, location, other, actor, customer, supplier, line = map(ident, range(1, 9))
context = {'recorded_at': '2026-11-11T12:00:00+00:00', 'reference_snapshots': {
    'products': {product: {'id': product, 'name': 'Fixture Stone', 'sku': 'FIXTURE-001'}},
    'locations': {location: {'id': location, 'name': 'Fixture Yard'}, other: {'id': other, 'name': 'Fixture Returns'}},
    'customers': {customer: {'id': customer, 'name': 'Fixture Buyer', 'email': 'buyer@example.test', 'currency': 'INR', 'company_name': 'Fixture Company'}},
    'suppliers': {supplier: {'id': supplier, 'name': 'Fixture Supplier'}},
}}
events = [d.opening_event(org, ident(90), [
    {'product_id': product, 'location_id': loc, 'quantity': 0, 'reserved': 0}
    for loc in (location, other)], [], actor)]

def append(n, action, **fields):
    command = {'request_id': ident(n), 'action': action, 'reason': 'Offline fixture', **fields}
    result = d.prepare_command(events, command, actor, org, context=context)
    assert not result['replay']
    events.append(result['event'])
    return d.project(events, org)

sales = {'customer_id': customer, 'customer_name': 'Fixture Buyer', 'customer_email': 'buyer@example.test',
         'customer_address': 'Fixture address', 'order_date': '2026-11-11', 'currency': 'INR',
         'notes': '', 'tax': '1.00', 'shipping': '2.00', 'items': [
             {'line_id': line, 'product_id': product, 'product_variant_id': None, 'quantity': 2, 'unit_price': '10.25'}]}
purchase = {'supplier_id': supplier, 'order_date': '2026-11-11', 'expected_date': None,
            'currency': 'INR', 'notes': '', 'tax': '1.00', 'shipping': '2.00', 'items': [
                {'line_id': line, 'product_id': product, 'product_variant_id': None, 'quantity': 10, 'unit_cost': '5.00', 'supplier_sku': None}]}
allocation = {'line_id': line, 'location_id': location, 'quantity': 2}
append(100, 'create_purchase_order', document=purchase)
append(101, 'approve_document', document_id=ident(100), expected_revision=1, allocations=[])
append(102, 'receive_purchase_order', document_id=ident(100), expected_revision=2, lines=[dict(allocation, quantity=10)])
append(110, 'create_order', document=sales)
append(111, 'approve_document', document_id=ident(110), expected_revision=1, allocations=[allocation])
state = append(112, 'fulfill_order', document_id=ident(110), expected_revision=2, lines=[allocation])
entitlement = next(iter(state['entitlements']))
append(113, 'submit_return', document_id=ident(110), lines=[{
    'entitlement_id': entitlement, 'location_id': other, 'quantity': 1, 'condition': 'new', 'restock': True}])
append(120, 'create_order', document=sales)
state = {key: value for key, value in append(130, 'create_purchase_order', document=purchase).items() if key != 'events'}
output = ROOT / 'src/services/__fixtures__/commerce-ledger.json'
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps({'ok': True, 'code': 'STATE', 'state': state, 'capabilities': ['commerce_v2']}, indent=2) + '\n', encoding='utf-8')
print('Generated offline commerce fixture with', len(events), 'events')
