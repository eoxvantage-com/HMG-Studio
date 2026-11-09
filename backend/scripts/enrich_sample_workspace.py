"""Bounded demonstration-data enrichment; no transaction execution or policy edits.

Default generates an offline review plan. --apply requires the exact saved plan,
fresh full-row/schema/policy guards and no event subscribers. No write retries.
Read-before-write is NOT atomic CAS; physical database triggers remain unverified.
"""
import argparse
import asyncio
import copy
from datetime import datetime, timedelta, timezone
import hashlib
import json
import logging
from uuid import NAMESPACE_URL, uuid5

from provision_erp import ROOT, environment
from restrict_synthetic import scoped_calls, SCOPE
from seed_erp import ORG, QA_USER, fixtures
from apply_historical_60 import comparable_policy

SNAPSHOT = ROOT / 'backend/schema/sample-enrichment-preflight.json'
HISTORY = ROOT / 'backend/schema/historical-60-plan.json'
PLAN = ROOT / 'backend/schema/sample-enrichment-plan.json'
NOTE = 'Demonstration data—not a live transaction.'
OLD_NOTES = (
    'SYNTHETIC HMG TEST DATA - not a real transaction or contact.',
    'SYNTHETIC HISTORICAL FIXTURE - not a real transaction or executed workflow.',
)
REPORTS = (
    ('sales', 'Sales Register', 'orders',
     ['order_number','order_date','customer_name','status','currency','total','amount_paid','payment_status'], 'order_date'),
    ('purchases', 'Purchase Register', 'purchase_orders',
     ['po_number','order_date','expected_date','received_date','supplier_id','status','currency','total'], 'order_date'),
    ('receipts', 'Customer Receipts', 'order_payments',
     ['paid_at','order_id','type','amount','method','reference'], 'paid_at'),
    ('adjustments', 'Stock Adjustment Register', 'stock_adjustments',
     ['created_at','product_id','location_id','type','quantity_before','adjustment_quantity','quantity_after','reason'], 'created_at'),
)
PATCH_FIELDS = {
    'products': {'name','description','notes','barcode','barcode_type','thumbnail'},
    'customers': {'name','company_name','contact_name','billing_address','billing_city','billing_state','billing_zip_code',
                  'billing_country','shipping_address','shipping_city','shipping_state','shipping_zip_code','shipping_country','payment_terms','notes'},
    'suppliers': {'name','contact_name','address','city','state','zip_code','country','payment_terms','notes'},
    'product_supplier': {'supplier_sku','lead_time_days','minimum_order_quantity'},
    'product_components': {'notes'}, 'orders': {'customer_name','customer_address','notes'},
    'order_items': {'product_name'}, 'purchase_orders': {'notes'},
    'purchase_order_items': {'product_name','notes'}, 'return_orders': {'reason','notes'},
    'stock_adjustments': {'reason','notes'}, 'stock_transfers': {'notes'},
    'stock_transfer_items': {'notes'}, 'work_orders': {'notes'}, 'order_payments': {'notes'},
    'saved_reports': {'name','description','columns_json','filters_json','sort_json'},
}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False, allow_nan=False)


def digest(value):
    return hashlib.sha256(canonical(value).encode('utf-8')).hexdigest()


def report_id(key):
    return str(uuid5(NAMESPACE_URL, 'hmg-studio/sample-enrichment/v1/report/'+key))


def field_map(snapshot, table):
    return {f['name']:f for f in snapshot['schemas'][table]['json_schema']['fields']}


def validate_snapshot(snapshot):
    require(snapshot.get('app')=='hmg-studio' and snapshot.get('site')=='https://insurance.taruvi.cloud'
            and snapshot.get('organization_id')==ORG and snapshot.get('read_only') is True, 'Wrong snapshot scope')
    history=json.loads(HISTORY.read_text(encoding='utf-8'))
    require(history['business_count']==60 and history['organization_id']==ORG, 'Unexpected historical plan')
    owned={}
    for dataset in (history['rows'],fixtures()):
        for table,records in dataset.items():
            owned.setdefault(table,{}).update({row['id']:row for row in records})
    for table,records in snapshot['rows'].items():
        require(table in owned and len({r['id'] for r in records})==len(records), 'Unknown table or duplicate row')
        fields=field_map(snapshot,table)
        for row in records:
            require(row['id'] in owned[table], 'Unowned identifier')
            require('organization_id' not in fields or row.get('organization_id')==ORG, 'Wrong organization')
            require(not (row.get('sku') or '').startswith('HMG-WEB-'), 'Catalogue reference excluded')
            expected=owned[table][row['id']]
            for foreign_key in snapshot['schemas'][table]['json_schema'].get('foreignKeys',[]):
                require(all(row.get(key)==expected.get(key) for key in foreign_key['fields']), 'Owned relation changed')
    for table,records in history['rows'].items():
        require({r['id'] for r in records}<={r['id'] for r in snapshot['rows'][table]}, 'Historical row missing')
    for field,kind in (('columns_json','array'),('filters_json','object'),('sort_json','object')):
        descriptor=field_map(snapshot,'saved_reports')[field]
        require(descriptor['type']==kind, 'Typed report schema changed')
        if kind=='array':require(descriptor.get('arrayItem')=={'type':'string'}, 'Typed columns changed')
    return history


def professional_note(value):
    if not isinstance(value,str):return value
    for old in OLD_NOTES:value=value.replace(old,NOTE)
    return value


def build_plan(snapshot):
    history=validate_snapshot(snapshot)
    seed=fixtures()
    product_names={r['id']:r['name'].removeprefix('SYNTHETIC ').removeprefix('Synthetic ')
                   for r in snapshot['rows']['products']}
    for row in history['rows']['products']:
        if row['name'].endswith('Vanity Assembly 1'):product_names[row['id']]='Silver Grey Vanity Assembly'
        if row['name'].endswith('Vanity Assembly 2'):product_names[row['id']]='Golden Eagle Vanity Assembly'
    customer_names=['Meridian Architecture Studio','Courtyard Villa Project','Atrium Hospitality Interiors',
                    'Northlight Design Studio','Garden Court Residences','Crescent Hospitality Design',
                    'Terrace House Interiors','Pavilion Commercial Spaces','Vista Residential Projects']
    supplier_names=['Alpine Marble Supply','Peninsula Granite Works','Continental Stone Trading',
                    'Crest Stone Materials','Granite Valley Supply','Marble Avenue Trading']
    customers={r['id']:name for r,name in zip(seed['customers']+history['rows']['customers'],customer_names)}
    suppliers={r['id']:name for r,name in zip(seed['suppliers']+history['rows']['suppliers'],supplier_names)}
    customer_number={identity:i+1 for i,identity in enumerate(customers)}
    supplier_number={identity:i+1 for i,identity in enumerate(suppliers)}
    patches=[]
    for table,records in sorted(snapshot['rows'].items()):
        for row in sorted(records,key=lambda r:r['id']):
            patch={}
            if table not in PATCH_FIELDS:continue
            for key in ('notes','description'):
                if key in PATCH_FIELDS[table] and row.get(key) is not None:
                    patch[key]=professional_note(row[key])
            if table=='products':
                patch['name']=product_names[row['id']]
                description=professional_note(row.get('description') or NOTE).removeprefix('Synthetic ')
                patch['description']=description if NOTE in description else description+' '+NOTE
                if row.get('barcode') is None:patch['barcode']=row['sku']
                if row.get('barcode_type') is None:patch['barcode_type']='CODE128'
                # Only reuse the exact existing private image; never substitute a
                # different stone photograph for an unidentified product.
                if row.get('image') and row['image'].startswith('storage://products/hmg-catalogue/') and row.get('thumbnail') is None:
                    patch['thumbnail']=row['image']
            elif table=='customers':
                n=customer_number[row['id']]
                patch.update(name=customers[row['id']],company_name=customers[row['id']],contact_name='Project Coordination Desk')
                values={'billing_address':f'Design Office {n:02}, Demonstration Business Park',
                        'shipping_address':f'Project Site {n:02}, Demonstration Layout',
                        'billing_city':'Bengaluru','billing_state':'Karnataka','billing_zip_code':'560001','billing_country':'IN',
                        'shipping_city':'Bengaluru','shipping_state':'Karnataka','shipping_zip_code':'560001','shipping_country':'IN',
                        'payment_terms':'Advance payment before dispatch'}
                patch.update({k:v for k,v in values.items() if row.get(k) is None})
                patch['notes']=NOTE+' Fictional organization and address; contact email is non-deliverable.'
            elif table=='suppliers':
                n=supplier_number[row['id']]
                patch.update(name=suppliers[row['id']],contact_name='Materials Supply Desk')
                values={'address':f'Material Yard {n:02}, Demonstration Industrial Layout','city':'Bengaluru',
                        'state':'Karnataka','zip_code':'560001','country':'IN','payment_terms':'Advance against purchase order'}
                patch.update({k:v for k,v in values.items() if row.get(k) is None})
                patch['notes']=NOTE+' Fictional supplier and address; contact email is non-deliverable.'
            elif table=='product_supplier':
                require(row['product_id'] in product_names and row['supplier_id'] in suppliers, 'Unscoped supplier relation')
                values={'supplier_sku':'MAT-'+row['product_id'][:8].upper(),'lead_time_days':14,'minimum_order_quantity':5}
                patch.update({k:v for k,v in values.items() if row.get(k) is None})
            elif table=='orders':
                require(row['customer_id'] in customers,'Unscoped customer relation')
                patch['customer_name']=customers[row['customer_id']]
                if row.get('customer_address') is None:
                    patch['customer_address']=f"Project Site {customer_number[row['customer_id']]:02}, Demonstration Layout, Bengaluru, Karnataka 560001, IN"
            elif table in ('order_items','purchase_order_items'):
                require(row['product_id'] in product_names,'Unscoped product relation')
                patch['product_name']=product_names[row['product_id']]
            elif table in ('return_orders','stock_adjustments') and isinstance(row.get('reason'),str):
                patch['reason']=row['reason'].removeprefix('Synthetic ').capitalize()
            elif table=='saved_reports':
                patch.update(name='Stone Inventory Register',description=NOTE+' Active demonstration products; excludes inactive website references.',
                             columns_json=['sku','name','category_id','location_id','stock','min_stock','currency','selling_price'],
                             filters_json={'items':[{'field':'organization_id','operator':'eq','value':ORG},
                                                    {'field':'id','operator':'in','value':sorted(product_names)}]},
                             sort_json={'field':'name','direction':'asc'})
            patch={k:v for k,v in patch.items() if canonical(row.get(k))!=canonical(v)}
            if patch:
                require(set(patch)<=PATCH_FIELDS[table] and set(patch)<=set(field_map(snapshot,table)), 'Invalid patch fields')
                patches.append({'table':table,'id':row['id'],'before':copy.deepcopy(row),
                                'before_sha256':digest(row),'patch':patch})
    creates=[]
    for key,name,source,columns,sort in REPORTS:
        description=NOTE+' Historical May–October 2026 demonstration snapshots; no workflow execution is implied.'
        if source=='order_payments':description+=' Currency must be resolved through the authorized parent order; no bank movement occurred.'
        row={'id':report_id(key),'organization_id':ORG,'created_by':QA_USER,'name':name,'description':description,
             'data_source':source,'columns':'[]','columns_json':columns,
             'filters_json':{'items':[{'field':'organization_id','operator':'eq','value':ORG},
                                      {'field':'id','operator':'in','value':sorted(r['id'] for r in history['rows'][source])}]},
             'sort_json':{'field':sort,'direction':'desc'},'is_shared':True}
        require(set(columns)<={f['name'] for f in snapshot['schemas'][source]['json_schema']['fields']}, 'Unknown report field')
        creates.append({'table':'saved_reports','row':row})
    return {'app':'hmg-studio','site':'https://insurance.taruvi.cloud','organization_id':ORG,
            'snapshot_sha256':digest(snapshot),'historical_plan_sha256':digest(history),
            'historical_business_count':60,'business_rows_created':0,'report_rows_created':4,
            'patches':patches,'creates':creates,'policies_changed':False,'catalogue_rows_changed':0,
            'legacy_report_columns':'New records use TEXT [] compatibility placeholder; typed fields are authoritative.',
            'limitations':['Read-before-write guard is not atomic CAS; quiet-workspace operation only.',
                           'No native workflow, payment, approval, stock posting or external delivery is executed.',
                           'Physical database triggers remain unverified; application subscribers must remain empty.',
                           'Unknown photos, phone numbers, tax IDs and inapplicable tracking/approval fields remain unset.']}


def validate_plan(plan,snapshot):
    require(canonical(plan)==canonical(build_plan(snapshot)), 'Plan or source snapshot differs from reviewed deterministic proposal')


def approve_plan(plan,approved_hash):
    require(isinstance(approved_hash,str) and approved_hash==digest(plan),'Explicit reviewed canonical plan hash required')


def timestamp(value):
    if not isinstance(value,str) or 'T' not in value:return None
    try:
        parsed=datetime.fromisoformat(value.replace('Z','+00:00'))
        if parsed.tzinfo is None:parsed=parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc)
    except ValueError:return False


def verify_patch(entry,actual):
    if not isinstance(actual,dict) or set(actual)!=set(entry['before']):return False
    expected={**entry['before'],**entry['patch']}
    for key,value in expected.items():
        if key=='updated_at':
            if actual[key]!=value:
                after_time=timestamp(actual[key]);before_time=timestamp(value or entry['before'].get('created_at'))
                if not after_time or not before_time or not before_time<=after_time<=datetime.now(timezone.utc)+timedelta(minutes=5):return False
        elif canonical(value)!=canonical(actual[key]):return False
    return True


def verify_create(entry,actual,snapshot,started_at=None):
    if not isinstance(actual,dict):return False
    row=entry['row'];fields=field_map(snapshot,'saved_reports')
    if not set(actual)<=set(fields):return False
    if any(key not in actual or canonical(actual[key])!=canonical(value) for key,value in row.items()):return False
    lower=started_at or datetime.now(timezone.utc)-timedelta(minutes=5)
    times={}
    for key,value in actual.items():
        if key in row:continue
        if key in ('created_at','updated_at') and value is not None:
            parsed=timestamp(value)
            if not parsed or not lower<=parsed<=datetime.now(timezone.utc)+timedelta(minutes=5):return False
            times[key]=parsed
        elif value is not None and ('default' not in fields[key] or canonical(value)!=canonical(fields[key]['default'])):return False
    return not (times.get('created_at') and times.get('updated_at') and times['updated_at']<times['created_at'])


async def apply_plan(plan,snapshot,guard,read,patch,create,save=lambda report:None):
    """Every attempted mutation receives one readback; never replay uncertain writes."""
    started_at=datetime.now(timezone.utc)
    report={'app':'hmg-studio','plan_sha256':digest(plan),'started_at':started_at.isoformat(),'complete':False,'aborted':False,
            'attempts':[],'verified':[],'write_replays':0,'historical_business_count':60,'business_rows_created':0,'phase':'validate'}
    try:
        validate_plan(plan,snapshot)
        report['phase']='schema_policy_event_preflight';save(report)
        await guard()
        # Check the ENTIRE source snapshot before the first write, including
        # unchanged parent/reference rows and unchanged demonstration balances.
        report['phase']='full_row_preflight';save(report)
        for table,records in snapshot['rows'].items():
            for row in records:
                require(digest(await read(table,row['id']))==digest(row),'Fresh source baseline differs')
        for entry in plan['creates']:
            require(await read(entry['table'],entry['row']['id']) is None,'Report ID already exists; no overwrite')
        for operation,entries in (('patch',plan['patches']),('create',plan['creates'])):
            for entry in entries:
                report['phase']=operation+'_fresh_compare';save(report)
                table=entry['table'];identity=entry['id'] if operation=='patch' else entry['row']['id']
                current=await read(table,identity)
                require(digest(current)==entry['before_sha256'] if operation=='patch' else current is None,'Concurrent row change')
                attempt={'operation':operation,'table':table,'id':identity,'attempted':True,'uncertain':False,'readback_attempted':False}
                report['attempts'].append(attempt);save(report)
                status=None
                try:
                    report['phase']=operation+'_attempt';save(report)
                    status=await patch(table,identity,entry['patch']) if operation=='patch' else await create(table,entry['row'])
                    attempt['http_status']=status
                except Exception:
                    attempt['uncertain']=True
                finally:
                    report['phase']=operation+'_readback'
                    attempt['readback_attempted']=True;save(report)
                    try:
                        actual=await read(table,identity)
                        attempt['readback_matches']=verify_patch(entry,actual) if operation=='patch' else verify_create(entry,actual,snapshot,started_at-timedelta(minutes=5))
                    except Exception:
                        attempt['readback_matches']=False;attempt['readback_failed']=True
                    save(report)
                require(not attempt['uncertain'] and type(status) is int and 200<=status<300
                        and attempt['readback_matches'],'Mutation rejected, uncertain, or mismatched; stop without replay')
                report['verified'].append({'table':table,'id':identity});save(report)
        # A second full read verifies every untouched original field and row.
        report['phase']='final_preservation';save(report)
        changes={(e['table'],e['id']):e for e in plan['patches']}
        for table,records in snapshot['rows'].items():
            for row in records:
                actual=await read(table,row['id']);entry=changes.get((table,row['id']))
                require(verify_patch(entry,actual) if entry else digest(actual)==digest(row),'Final preservation verification failed')
        for entry in plan['creates']:
            require(verify_create(entry,await read(entry['table'],entry['row']['id']),snapshot,started_at-timedelta(minutes=5)),'Final report verification failed')
        report['phase']='final_schema_policy_event_guard';save(report)
        await guard()
        report['complete']=True
        report['phase']='complete'
    except Exception:
        report['aborted']=True;report['error']='Validation, drift, readback, or mutation failure; inspect sanitized phase/attempt evidence. No automatic retry.'
    save(report)
    return report


async def live(plan,snapshot,approved_hash):
    approve_plan(plan,approved_hash)
    validate_plan(plan,snapshot)
    import httpx
    logging.disable(logging.CRITICAL)
    env=environment()
    output=ROOT/'docs/hmg-studio/evidence/sample-enrichment-apply.json'
    require(not output.exists(),'Existing apply evidence: do not replay; reconcile manually')
    def save(report):output.write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    async with scoped_calls(env) as call:
        async def guard():
            for table,expected in snapshot['schemas'].items():
                current=(await call('get_datatable_schema',{'table_name':table}))['data']
                if isinstance(current,list):require(len(current)==1,'Ambiguous schema');current=current[0]
                require(current['name']==table and current['physical_table_name']=='hmg_studio_'+table
                        and current['provider_type']=='flat_table' and current['json_schema']==expected['json_schema'],'Schema drift')
                policy=(await call('manage_policies',{'action':'get','policy_id':'resource.datatable_'+table+'.vdefault/'+SCOPE}))['data']['policy']
                before=snapshot['policies'][table]
                require(canonical(comparable_policy(policy))==canonical(comparable_policy(before)),'Policy drift')
            for event in ('RECORD_CREATE','RECORD_UPDATE','RECORD_DELETE'):
                subscribers=await call('manage_event_subscription',{'action':'list_subscribers','event':event})
                require(subscribers.get('success') is True and subscribers.get('total')==0 and subscribers.get('data')==[],'Event subscribers changed')
        async with httpx.AsyncClient(timeout=45,trust_env=False,headers={'Authorization':'Api-Key '+env['TARUVI_API_KEY'],'X-App-Slug':'hmg-studio'}) as client:
            base=env['TARUVI_SITE_URL']+'/api/apps/hmg-studio/datatables/'
            async def read(table,identity):
                response=await client.get(base+table+'/data/'+identity+'/')
                if response.status_code==404:return None
                response.raise_for_status();row=response.json()['data']
                require(isinstance(row,dict) and row['id']==identity,'Unexpected record readback')
                return row
            async def patch(table,identity,payload):
                return (await client.patch(base+table+'/data/'+identity+'/',json=payload)).status_code
            async def create(table,row):
                return (await client.post(base+table+'/data/',json=row)).status_code
            return await apply_plan(plan,snapshot,guard,read,patch,create,save)


if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--apply',action='store_true')
    parser.add_argument('--approve-plan-sha256');args=parser.parse_args()
    snapshot=json.loads(SNAPSHOT.read_text(encoding='utf-8'))
    if args.apply:
        proposal=json.loads(PLAN.read_text(encoding='utf-8'));validate_plan(proposal,snapshot)
        approve_plan(proposal,args.approve_plan_sha256)
        result=asyncio.run(live(proposal,snapshot,args.approve_plan_sha256));print(json.dumps(result,indent=2))
        raise SystemExit(0 if result['complete'] else 1)
    proposal=build_plan(snapshot);PLAN.write_text(json.dumps(proposal,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    print(json.dumps({'plan':str(PLAN),'sha256':digest(proposal),'patches':len(proposal['patches']),
                      'new_reports':len(proposal['creates']),'business_headers_added':0}))
