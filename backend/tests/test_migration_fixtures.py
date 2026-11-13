import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).parents[1]/'scripts'))
from seed_erp import fixtures, migration_acceptance_fixtures

def test_migration_acceptance_data_is_isolated_deterministic_and_unposted():
    data=migration_acceptance_fixtures('4f7ff492-8af6-4059-ae61-ce13fe3d4b20')
    assert data==migration_acceptance_fixtures('4f7ff492-8af6-4059-ae61-ce13fe3d4b20')
    assert {r['id'] for rs in data.values() for r in rs}.isdisjoint({r['id'] for rs in fixtures().values() for r in rs})
    assert data['organizations'][0]['name'].startswith('QA ONLY')
    assert data['organizations'][0]['settings']['dataset_kind']=='test'
    assert all(r['stock']==0 for r in data['products'])
    assert all(r['type']=='standard' and 'min_stock' in r for r in data['products'])
    assert all(r['system_quantity']==0 and r.get('counted_quantity') is None for r in data['stock_audit_items'])
    assert all(r['stock_committed'] is False and r['amount_paid']=='0' for r in data['orders'])
    assert all(r['status']=='draft' for r in data['purchase_orders'])
    assert all(r['status']=='pending' for r in data['stock_transfers'])
    assert not ({'stock_adjustments','order_payments','product_location_stocks','webhooks','report_schedules','email_logs'} & data.keys())
