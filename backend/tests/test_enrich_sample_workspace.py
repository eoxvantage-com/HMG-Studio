"""Review-gated tests for exact-owned-row demonstration enrichment."""
import asyncio
import copy
from datetime import datetime, timedelta, timezone
import importlib.util
import json
from pathlib import Path
import sys

import pytest

ROOT=Path(__file__).parents[2]
sys.path.insert(0,str(ROOT/'backend/scripts'))


def module():
    spec=importlib.util.spec_from_file_location('enrich_samples',ROOT/'backend/scripts/enrich_sample_workspace.py')
    result=importlib.util.module_from_spec(spec);spec.loader.exec_module(result);return result


def setup():
    m=module();snapshot=json.loads(m.SNAPSHOT.read_text(encoding='utf-8'));plan=m.build_plan(snapshot)
    return m,snapshot,plan


def test_plan_is_deterministic_four_reports_and_no_transaction_creates():
    m,s,p=setup();assert p==m.build_plan(copy.deepcopy(s));m.validate_plan(p,s)
    assert len(p['creates'])==4 and {e['table'] for e in p['creates']}=={'saved_reports'}
    assert p['historical_business_count']==60 and p['business_rows_created']==0
    assert all(not (e['before'].get('sku') or '').startswith('HMG-WEB-') for e in p['patches'])
    assert all(m.NOTE in e['row']['description'] for e in p['creates'])
    for entry in p['creates']:
        row=entry['row'];assert row['columns']=='[]' and isinstance(row['columns_json'],list)
        assert set(row['filters_json'])=={'items'} and 'filters' not in row and 'sort' not in row
        assert row['filters_json']['items'][0]['value']==m.ORG


def test_patch_preserves_quantities_financials_business_dates_statuses_and_actors():
    m,s,p=setup()
    forbidden={'stock','price','selling_price','purchase_price','min_stock','max_stock','reorder_point','reorder_quantity',
               'total','subtotal','amount','amount_paid','quantity','quantity_produced','status','approval_status',
               'approved_by','approved_at','stock_committed','created_at','updated_at','product_variant_id'}
    assert all(not forbidden.intersection(e['patch']) for e in p['patches'])
    for e in p['patches']:
        after={**e['before'],**e['patch'],'updated_at':datetime.now(timezone.utc).isoformat()}
        assert m.verify_patch(e,after)
        for key in set(e['before'])-set(e['patch'])-{'updated_at'}:
            changed=copy.deepcopy(after);changed[key]='unexpected-mutation'
            assert not m.verify_patch(e,changed),(e['table'],key)
        changed=copy.deepcopy(after);changed['unexpected_extra']=None
        assert not m.verify_patch(e,changed)


@pytest.mark.parametrize('attack',['wrong_org','unknown_id','catalogue','edit_plan','legacy_json','threshold'])
def test_wrong_scope_or_tampered_plan_rejected(attack):
    m,s,p=setup()
    if attack=='wrong_org':s['rows']['products'][0]['organization_id']='00000000-0000-4000-8000-000000000001'
    elif attack=='unknown_id':s['rows']['products'][0]['id']='00000000-0000-4000-8000-000000000001'
    elif attack=='catalogue':s['rows']['products'][0]['sku']='HMG-WEB-TEST'
    elif attack=='edit_plan':p['patches'][0]['patch']['notes']='Real payment approved'
    elif attack=='legacy_json':p['creates'][0]['row']['columns']={'unsafe':'object'}
    else:p['patches'][0]['patch']['min_stock']=999
    with pytest.raises(ValueError):m.validate_plan(p,s)


def harness():
    m,s,p=setup();db={(t,r['id']):copy.deepcopy(r) for t,rs in s['rows'].items() for r in rs};writes=[];reads=[]
    async def guard():return None
    async def read(t,i):reads.append((t,i));return copy.deepcopy(db.get((t,i)))
    async def patch(t,i,payload):writes.append(('patch',t,i));db[t,i]={**db[t,i],**copy.deepcopy(payload),'updated_at':datetime.now(timezone.utc).isoformat()};return 200
    async def create(t,row):writes.append(('create',t,row['id']));db[t,row['id']]=copy.deepcopy(row);return 201
    return m,s,p,db,writes,reads,guard,read,patch,create


def test_preflight_all_before_first_write_and_exact_readback():
    m,s,p,db,w,r,g,read,patch,create=harness()
    result=asyncio.run(m.apply_plan(p,s,g,read,patch,create))
    assert result['complete'] and not result['aborted']
    assert len(w)==len(p['patches'])+4 and len(result['verified'])==len(w)
    assert result['write_replays']==0


def test_last_baseline_drift_or_existing_report_blocks_all_writes():
    for collision in (False,True):
        m,s,p,db,w,r,g,read,patch,create=harness()
        if collision:
            e=p['creates'][-1];db[e['table'],e['row']['id']]={'id':e['row']['id']}
        else:
            t=next(reversed(s['rows']));db[t,s['rows'][t][-1]['id']]['unexpected']=True
        result=asyncio.run(m.apply_plan(p,s,g,read,patch,create))
        assert result['aborted'] and not w


def test_concurrent_change_between_preflight_and_patch_blocks_write():
    m,s,p,db,w,r,g,read,patch,create=harness();target=p['patches'][0];count=0
    async def concurrent(t,i):
        nonlocal count
        if (t,i)==(target['table'],target['id']):
            count+=1
            if count==2:db[t,i]['notes']='Concurrent edit'
        return await read(t,i)
    result=asyncio.run(m.apply_plan(p,s,g,concurrent,patch,create))
    assert result['aborted'] and not w


@pytest.mark.parametrize('mode',['timeout','denied','changed_unrelated'])
def test_uncertain_or_rejected_patch_gets_one_readback_and_no_replay(mode):
    m,s,p,db,w,r,g,read,patch,create=harness();target=p['patches'][0]
    async def bad(t,i,payload):
        await patch(t,i,payload)
        if mode=='timeout':raise TimeoutError('SECRET_DO_NOT_LEAK')
        if mode=='denied':return 403
        db[t,i]['created_at']='unexpected';return 200
    result=asyncio.run(m.apply_plan(p,s,g,read,bad,create))
    assert result['aborted'] and not result['complete'] and len(w)==1
    assert result['attempts'][0]['readback_attempted'] is True and result['write_replays']==0
    assert 'SECRET' not in str(result)


def test_full_comparison_distinguishes_missing_null_and_bool_number():
    m,s,p=setup();e=next(e for e in p['patches'] if e['table']=='products');after={**e['before'],**e['patch']}
    after['is_active']=1;assert not m.verify_patch(e,after)
    after={**e['before'],**e['patch']};del after['metadata'];assert not m.verify_patch(e,after)


def test_report_definition_fields_and_currency_contract():
    m,s,p=setup()
    for e in p['creates']:
        row=e['row'];fields={f['name'] for f in s['schemas'][row['data_source']]['json_schema']['fields']}
        assert set(row['columns_json'])<=fields and row['sort_json']['field'] in fields
        assert all(f['field'] in fields for f in row['filters_json']['items'])
        if row['data_source']=='order_payments':assert 'currency' not in row['columns_json']


@pytest.mark.parametrize('approval',[None,'','0'*64])
def test_explicit_reviewed_plan_hash_required(approval):
    m,s,p=setup()
    with pytest.raises(ValueError):m.approve_plan(p,approval)
    m.approve_plan(p,m.digest(p))


@pytest.mark.parametrize('value',['2000-01-01T00:00:00Z','2099-01-01T00:00:00Z','bad',None])
def test_invalid_backward_or_future_updated_at_rejected(value):
    m,s,p=setup();e=p['patches'][0];after={**e['before'],**e['patch'],'updated_at':value}
    assert not m.verify_patch(e,after)


def test_new_report_timestamp_bounds_and_order():
    m,s,p=setup();e=p['creates'][0];now=datetime.now(timezone.utc)
    for value in ('2000-01-01T00:00:00Z','2099-01-01T00:00:00Z','bad'):
        assert not m.verify_create(e,{**e['row'],'created_at':value},s)
    actual={**e['row'],'created_at':now.isoformat(),'updated_at':(now-timedelta(seconds=1)).isoformat()}
    assert not m.verify_create(e,actual,s)
    actual['updated_at']=now.isoformat();assert m.verify_create(e,actual,s)


@pytest.mark.parametrize('key',['variables','json_schema','description','disabled','resource_policy'])
def test_full_policy_comparison_includes_every_authority_field(key):
    m,s,p=setup();before=s['policies']['products'];after=copy.deepcopy(before);after[key]='changed'
    assert m.comparable_policy(before)!=m.comparable_policy(after)
    after=copy.deepcopy(before);after['metadata']={'updated_at':'changed'}
    assert m.comparable_policy(before)==m.comparable_policy(after)
