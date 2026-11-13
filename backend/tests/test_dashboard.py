import importlib.util
from pathlib import Path
from copy import deepcopy
from types import SimpleNamespace
import pytest
from datetime import datetime, timezone

def product(**fields):
    return {"id":"p","name":"Marble","sku":"SLAB-1","currency":"INR","is_active":True,
            "stock":"3","selling_price":"10.00","min_stock":"1",**fields}

def order(**fields):
    return {"id":"o","order_number":"SO-1","currency":"INR","status":"pending",
            "total":"30.00","amount_paid":"10.00","order_date":"2026-11-01T00:00:00Z",**fields}

def invoke(params,user,tables,now=None,mutations=None,ledger=None,reads=None,require_scoped=False,ignore_filters=False):
    tables=deepcopy(tables)
    # Legacy arithmetic fixtures represent a classified production workspace.
    # Explicit-scope tests supply organizations and retain missing/foreign IDs.
    if 'organizations' not in tables:
        tables['organizations']=[{'id':'production','settings':{'dataset_kind':'production'}}]
        for table in ('products','orders','product_categories','product_locations'):
            if isinstance(tables.get(table),list):
                for row in tables[table]:row.setdefault('organization_id','production')
    path=Path(__file__).parents[1]/"functions"/"dashboard.py"
    spec=importlib.util.spec_from_file_location("dashboard",path);mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
    if now is not None:
        class FrozenDateTime(datetime):
            @classmethod
            def now(cls, tz=None):
                return now.astimezone(tz) if tz else now.replace(tzinfo=None)
        mod.datetime=FrozenDateTime
    class Query:
        def __init__(self,table):self.table=table;self.number=1;self.size=100;self.filters=[]
        def page(self,number):self.number=number;return self
        def page_size(self,size):self.size=size;return self
        def sort(self,*args):return self
        def filter(self,key,op,value):
            assert op=="eq"
            self.filters.append((key,value));return self
        def _mutation(self,*args,**kwargs):
            if mutations is not None:mutations.append(self.table)
            raise AssertionError("Dashboard must remain read-only")
        insert=update=delete=upsert=_mutation
        def execute(self):
            if reads is not None:reads.append((self.table,list(self.filters)))
            if require_scoped and self.table != "organizations" and not self.filters:raise PermissionError("Global read denied")
            rows=tables.get(self.table,[])
            if isinstance(rows,Exception):raise rows
            for key,value in ([] if ignore_filters else self.filters):rows=[r for r in rows if r.get(key)==value]
            return {"data":rows[(self.number-1)*self.size:self.number*self.size]}
    def execute(name, params, is_async):
        assert name == 'hmg-stock-ledger-v1' and is_async is False
        assert params['action'] == 'state'
        if isinstance(ledger, Exception): raise ledger
        return {'data': ledger}
    return mod.main(params,user,SimpleNamespace(database=SimpleNamespace(from_=Query),functions=SimpleNamespace(execute=execute)))

def test_unauthenticated_and_invalid_input_do_not_return_data():
    assert invoke({},None,{})["code"]=="UNAUTHENTICATED"
    assert invoke({"currency":"bad"}, {"id":"test"},{})["code"]=="VALIDATION_ERROR"
    assert invoke({"user_id":"forged"}, {"id":"test"},{})["code"]=="VALIDATION_ERROR"

def test_totals_use_decimal_and_separate_currency():
    rows={"products":[{"id":"p","name":"Marble","stock":3,"selling_price":"0.10","currency":"INR","is_active":True,"category_id":"c","min_stock":4},{"id":"usd","stock":9,"selling_price":"100","currency":"USD","is_active":True}],
          "product_categories":[{"id":"c","name":"Marble"}],
          "orders":[{"id":"o","order_number":"SYN-1","currency":"INR","total":"0.30","amount_paid":"0.10","status":"pending","order_date":"2026-11-01T00:00:00Z"}]}
    result=invoke({"currency":"INR"},{"id":"test"},rows)
    assert result["ok"]
    assert result["inventory_value"]=="0.30"
    assert result["receivables"]=="0.20"
    assert result["pending_orders"]==1
    assert result["product_count"]==1
    assert len(result["low_stock"])==1


def test_pipeline_and_monthly_sales_are_decimal_and_not_cancelled_orders():
    rows={'orders':[order(id='a',status='pending',total='0.10',amount_paid='0'),
                    order(id='b',status='delivered',total='0.20',amount_paid='0.20'),
                    order(id='c',status='cancelled',total='999',amount_paid='0'),
                    order(id='d',status='shipped',total='5',amount_paid='5',order_date='2026-10-31T23:30:00-02:00')]}
    d=invoke({}, {'id':'test'},rows,now=datetime(2026,11,10,tzinfo=timezone.utc))
    assert d['order_pipeline']==[{'status':'delivered','count':1,'value':'0.20'},
                                 {'status':'pending','count':1,'value':'0.10'},
                                 {'status':'shipped','count':1,'value':'5.00'}]
    assert len(d['monthly_sales'])==6
    assert d['monthly_sales'][-1]=={'month':'2026-11','count':2,'revenue':'5.20'}
    assert d['monthly_sales'][0]=={'month':'2026-06','count':0,'revenue':'0.00'}


def test_catalogue_quality_includes_inactive_reference_records_without_valuing_them():
    d=invoke({}, {'id':'test'}, {'products':[product(id='active',image='storage://products/a.jpg'),
       product(id='reference',is_active=False,selling_price=None,image=None)]})
    assert d['catalogue_quality']=={'total':2,'inactive':1,'missing_selling_price':1,'missing_image':1}
    assert d['product_count']==1
    assert d['inventory_value']=='30.00'


def test_dashboard_avoids_restricted_runtime_subscript_augmented_assignments():
    import ast
    code=(Path(__file__).parents[1]/'functions'/'dashboard.py').read_text(encoding='utf-8-sig')
    assert not any(isinstance(n,ast.AugAssign) and isinstance(n.target,ast.Subscript) for n in ast.walk(ast.parse(code)))

def test_failed_backend_never_becomes_fake_zero():
    result=invoke({},{"id":"test"},{"products":RuntimeError("secret")})
    assert result["ok"] is False
    assert "secret" not in str(result)
    assert "inventory_value" not in result

def test_cancelled_and_deleted_rows_are_excluded():
    rows={"products":[{"id":"p","deleted_at":"2026-01-01","stock":5,"price":"10"}],
          "orders":[{"id":"c","status":"cancelled","currency":"INR","total":"999"}]}
    result=invoke({},{"id":"test"},rows)
    assert result["inventory_value"]=="0.00"
    assert result["receivables"]=="0.00"

def test_recent_products_use_creation_instant_not_uuid_order():
    rows={"products":[
        product(id="first-id",name="Older",created_at="2026-11-05T12:00:00Z"),
        product(id="last-id",name="Newest",created_at="2026-11-06T10:00:00+05:30"),
        product(id="missing-date",name="Legacy"),
    ]}
    result=invoke({}, {"id":"test"}, rows)
    assert result["ok"]
    assert [row["id"] for row in result["recent_products"]]==["last-id","first-id","missing-date"]

def test_revenue_month_and_recent_orders_compare_utc_instants():
    rows={"orders":[
        order(id="utc-october",status="shipped",total="100",order_date="2026-11-01T00:30:00+02:00"),
        order(id="utc-november",status="delivered",total="20",order_date="2026-10-31T23:30:00-02:00"),
        order(id="utc-december",status="shipped",total="300",order_date="2026-11-30T23:30:00-02:00"),
    ]}
    result=invoke({}, {"id":"test"}, rows, now=datetime(2026,11,6,tzinfo=timezone.utc))
    assert result["ok"]
    assert result["revenue_month"]=="20.00"
    assert [row["id"] for row in result["recent_orders"]]==["utc-december","utc-november","utc-october"]

@pytest.mark.parametrize("count,expected",[(2000,True),(2001,False)])
def test_projection_accepts_exact_limit_but_never_partial_over_limit(count,expected):
    result=invoke({}, {"id":"test"}, {"products":[product(id=str(index)) for index in range(count)]})
    assert result["ok"] is expected
    if expected:
        assert result["product_count"]==2000
    else:
        assert result["code"]=="DATA_UNAVAILABLE"
        assert "inventory_value" not in result

def test_invalid_nonempty_dates_fail_closed():
    result=invoke({}, {"id":"test"}, {"orders":[order(id="bad",status="shipped",total="50",order_date="2026-11-not-a-date")]})
    assert result=={"ok":False,"code":"DATA_UNAVAILABLE"}


MISSING=object()
UNAVAILABLE={"ok":False,"code":"DATA_UNAVAILABLE"}

def set_or_remove(row,field,value):
    if value is MISSING:row.pop(field,None)
    else:row[field]=value
    return row

@pytest.mark.parametrize("field",["stock","selling_price","min_stock"])
@pytest.mark.parametrize("value",[MISSING,None,True,False,"", "not-a-number", "NaN", "Infinity", [], {}],
                         ids=["missing","null","true","false","blank","text","nan","infinity","array","object"])
def test_selected_active_product_requires_explicit_finite_facts(field,value):
    # Legacy price must not rescue a missing/null selling_price or turn it into0.
    row=set_or_remove(product(price="999.00"),field,value)
    assert invoke({"currency":"INR"},{"id":"test"},{"products":[row]})==UNAVAILABLE

@pytest.mark.parametrize("value",[MISSING,None,True,False,0,1,"","inr","IN"," INR",[],{}],
                         ids=["missing","null","true","false","zero","one","blank","lowercase","short","padded","array","object"])
@pytest.mark.parametrize("table",["products","orders"])
def test_all_visible_row_currencies_must_be_explicit_valid_codes(table,value):
    row=product() if table=="products" else order()
    set_or_remove(row,"currency",value)
    assert invoke({}, {"id":"test"},{table:[row]})==UNAVAILABLE

@pytest.mark.parametrize("value",[MISSING,None,0,1,"true","false","",[],{}],
                         ids=["missing","null","zero","one","true-string","false-string","blank","array","object"])
@pytest.mark.parametrize("currency",["INR","USD"])
def test_product_active_flag_is_an_explicit_boolean_before_currency_selection(value,currency):
    row=set_or_remove(product(currency=currency),"is_active",value)
    assert invoke({}, {"id":"test"},{"products":[row]})==UNAVAILABLE

@pytest.mark.parametrize("field",["total","amount_paid"])
@pytest.mark.parametrize("value",[MISSING,None,True,False,"","NaN","Infinity",[],{}],
                         ids=["missing","null","true","false","blank","nan","infinity","array","object"])
def test_selected_noncancelled_order_requires_explicit_finite_money(field,value):
    row=set_or_remove(order(),field,value)
    assert invoke({}, {"id":"test"},{"orders":[row]})==UNAVAILABLE

@pytest.mark.parametrize("value",[MISSING,None,True,False,0,1,"","   ",[],{}],
                         ids=["missing","null","true","false","zero","one","blank","whitespace","array","object"])
def test_selected_order_status_cannot_be_missing_blank_or_nonstring(value):
    row=set_or_remove(order(),"status",value)
    assert invoke({}, {"id":"test"},{"orders":[row]})==UNAVAILABLE

def test_explicit_zero_facts_are_valid_without_legacy_price_fallback():
    result=invoke({}, {"id":"test"},{
        "products":[product(stock=0,selling_price="0.00",min_stock=0,price="999.00")],
        "orders":[order(total=0,amount_paid="0.00")],
    })
    assert result["ok"] is True
    assert result["inventory_value"]==result["receivables"]==result["revenue_month"]=="0.00"
    assert result["product_count"]==result["order_count"]==1
    assert result["low_stock"]==[{"id":"p","name":"Marble","sku":"SLAB-1","stock":"0","minimum":"0"}]

def test_inactive_catalogue_reference_null_prices_are_excluded_not_invented_stock():
    result=invoke({}, {"id":"test"},{"products":[
        product(id="web",sku="HMG-WEB-reference",is_active=False,stock=0,
                selling_price=None,purchase_price=None,min_stock=None,price=0),
    ]})
    assert result["ok"] is True
    assert result["product_count"]==result["low_stock_count"]==0
    assert result["inventory_value"]=="0.00"
    assert result["recent_products"]==result["low_stock"]==result["stock_by_category"]==[]

def test_other_currency_and_cancelled_rows_do_not_need_selected_financial_facts():
    result=invoke({}, {"id":"test"},{
        "products":[{"id":"usd","currency":"USD","is_active":True}],
        "orders":[{"id":"eur","currency":"EUR","status":"pending"},
                  {"id":"cancelled","currency":"INR","status":"cancelled","total":None,"amount_paid":None}],
    })
    assert result["ok"] is True
    assert result["product_count"]==result["order_count"]==0
    assert result["inventory_value"]==result["receivables"]=="0.00"

@pytest.mark.parametrize("table,row",[
    ("products",product(is_active=False)),
    ("orders",order(status="cancelled")),
])
def test_inactive_or_cancelled_rows_still_require_explicit_currency(table,row):
    row=set_or_remove(dict(row),"currency",MISSING)
    assert invoke({}, {"id":"test"},{table:[row]})==UNAVAILABLE

def test_projection_never_mutates_source_records_or_calls_write_methods():
    tables={"products":[product()],"orders":[order()],"product_categories":[{"id":"c","name":"Stone"}],"product_locations":[{"id":"l","name":"Yard"}]}
    before=deepcopy(tables);mutations=[]
    result=invoke({}, {"id":"test"},tables,mutations=mutations)
    assert result["ok"] is True
    assert tables==before
    assert mutations==[]

def scoped_tables():
    return {'organizations':[{'id':'real','settings':{'dataset_kind':'production'}},
                             {'id':'qa','settings':{'dataset_kind':'test'}},
                             {'id':'unknown','settings':None}],
            'products':[product(id='real-product',organization_id='real'),product(id='qa-product',organization_id='qa',stock=999),product(id='unknown-product',organization_id='unknown')],
            'orders':[order(id='real-order',organization_id='real',status='delivered'),order(id='qa-order',organization_id='qa',total='99999')],
            'product_categories':[{'id':'real-cat','organization_id':'real'},{'id':'qa-cat','organization_id':'qa'}],
            'product_locations':[{'id':'real-loc','organization_id':'real'},{'id':'qa-loc','organization_id':'qa'}]}

def test_all_dataset_combines_active_business_organizations_but_not_test_data():
    tables=scoped_tables()
    tables['organizations'].append({'id':'closed','is_active':False,'settings':{'dataset_kind':'production'}})
    tables['products'].append(product(id='closed-product',organization_id='closed'))
    result=invoke({'dataset':'all'}, {'id':'test'},tables,now=datetime(2026,11,11,tzinfo=timezone.utc))
    assert result['ok'] is True and result['dataset']=='all'
    assert sorted(r['id'] for r in result['recent_products'])==['real-product','unknown-product']
    assert result['order_count']==1 and result['category_count']==1 and result['location_count']==1
    assert 'qa-order' not in [r['id'] for r in result['recent_orders']]
    assert 'test data are excluded' in result['scope']

def test_fulfilled_value_is_all_time_and_month_is_reported_separately():
    tables=scoped_tables()
    tables['orders']=[order(id='old',organization_id='real',status='delivered',total='500.00',order_date='2026-09-02T00:00:00Z'),
                      order(id='now',organization_id='real',status='delivered',total='44.00',order_date='2026-11-05T00:00:00Z'),
                      order(id='open',organization_id='real',status='pending',total='70.00',order_date='2026-11-05T00:00:00Z')]
    result=invoke({'dataset':'all'}, {'id':'test'},tables,now=datetime(2026,11,11,tzinfo=timezone.utc))
    assert result['fulfilled_value']=='544.00' and result['fulfilled_count']==2
    assert result['revenue_month']=='44.00' and result['open_orders']==1
    assert all(r['organization_id']=='real' for r in result['recent_orders'])
def test_production_default_excludes_qa_and_unclassified_from_every_panel():
    result=invoke({}, {'id':'test'},scoped_tables(),now=datetime(2026,11,11,tzinfo=timezone.utc))
    assert result['dataset']=='production'
    assert result['product_count']==result['order_count']==result['category_count']==result['location_count']==1
    assert result['catalogue_quality']['total']==1
    assert result['inventory_value']=='30.00' and result['revenue_month']=='30.00'
    assert result['order_pipeline']==[{'status':'delivered','count':1,'value':'30.00'}]
    assert [r['id'] for r in result['recent_products']]==['real-product']
    assert result['unclassified_organizations']==1

def test_qa_mode_is_disjoint_and_never_changes_production_rows():
    tables=scoped_tables();before=deepcopy(tables)
    result=invoke({'dataset':'test'}, {'id':'test'},tables)
    assert result['dataset']=='test' and result['product_count']==1
    assert result['inventory_value']=='9990.00'
    assert [r['id'] for r in result['recent_orders']]==['qa-order']
    assert tables==before

@pytest.mark.parametrize('dataset',['ALL','qa',True,None,{},[]])
def test_invalid_dataset_is_rejected(dataset):
    assert invoke({'dataset':dataset},{'id':'test'}, {})=={'ok':False,'code':'VALIDATION_ERROR'}

def test_classification_denial_fails_closed_and_foreign_rows_stay_out():
    assert invoke({}, {'id':'test'},{'organizations':RuntimeError('denied')})==UNAVAILABLE
    result=invoke({}, {'id':'test'},{'organizations':[], 'products':[product(organization_id='foreign')]})
    assert result['product_count']==0

def test_invalid_qa_money_cannot_poison_production_projection():
    tables=scoped_tables();tables['products'][1]['stock']='bad'
    assert invoke({}, {'id':'test'},tables)['ok']
    assert invoke({'dataset':'test'}, {'id':'test'},tables)==UNAVAILABLE


def ledger_fixture():
    tables={'organizations':[{'id':'production','settings':{'dataset_kind':'production','stock_authority':'ledger_v2'}}],
            'products':[product(organization_id='production',stock=999,has_variants=False,tracking_type='none',type='standard')],
            'orders':[order(organization_id='production',total='999.00')]}
    state={'ok':True,'code':'STATE','capabilities':['commerce_v2'],'state':{
        'organization_id':'production','head':'a'*64,'balances':[{'product_id':'p','location_id':'l','quantity':4,'reserved':1}],
        'documents':{}}}
    return tables,state

def test_ledger_dashboard_replaces_legacy_stock_and_orders_without_adding():
    tables,state=ledger_fixture()
    result=invoke({}, {'id':'u'}, tables,ledger=state)
    assert result['ok'] is True
    assert result['inventory_value']=='40.00'
    assert result['order_count']==0
    assert result['receivables']=='0.00'
    assert result['receivables_reason']

def ledger_document(doc_id,status,total):
    return {'id':doc_id,'kind':'sales_order','number':'SO-'+doc_id,'status':status,'total':total,
            'draft':{'customer_id':None,'customer_name':'Buyer','currency':'INR','order_date':'2026-11-01'},
            'snapshots':{'customers':{}}}

def test_ledger_receivables_count_confirmed_orders_only():
    tables,state=ledger_fixture()
    state['state']['documents']={d['id']:d for d in (
        ledger_document('a','approved','100.00'),ledger_document('b','fulfilled','50.50'),
        ledger_document('c','partially_fulfilled','10.00'),ledger_document('d','pending','999.00'),
        ledger_document('e','rejected','999.00'),ledger_document('f','cancelled','999.00'))}
    result=invoke({}, {'id':'u'}, tables,ledger=state)
    assert result['ok'] is True
    assert result['receivables']=='160.50'
    assert 'no customer payments' in result['receivables_reason']

@pytest.mark.parametrize('bad',[None,{'ok':False,'code':'FORBIDDEN'}, {'ok':True,'code':'STATE','capabilities':[],'state':{}}])
def test_ledger_dashboard_never_falls_back_to_legacy_when_projection_unavailable(bad):
    tables,_=ledger_fixture()
    assert invoke({}, {'id':'u'}, tables,ledger=bad)['code']=='DATA_UNAVAILABLE'

def test_ledger_dashboard_rejects_foreign_scope_and_duplicate_bins():
    tables,state=ledger_fixture()
    state['state']['organization_id']='other'
    assert invoke({}, {'id':'u'}, tables,ledger=state)['code']=='DATA_UNAVAILABLE'
    state['state']['organization_id']='production'
    state['state']['balances']*=2
    assert invoke({}, {'id':'u'}, tables,ledger=state)['code']=='DATA_UNAVAILABLE'

def test_unknown_stock_authority_is_not_legacy():
    tables,state=ledger_fixture()
    tables['organizations'][0]['settings']['stock_authority']='migrating'
    assert invoke({}, {'id':'u'},tables,ledger=state)['code']=='DATA_UNAVAILABLE'


def test_ledger_dashboard_uses_saved_customer_snapshot_and_fulfilled_value_not_payments():
    tables,state=ledger_fixture()
    tables['orders']=PermissionError('Legacy table deliberately unavailable')
    state['state']['documents']={'doc':{'id':'doc','kind':'sales_order','number':'SO-L1',
      'status':'fulfilled','total':'45.00','draft':{'currency':'INR','order_date':'2026-11-01','customer_id':'c','customer_name':'Stale name'},
      'snapshots':{'customers':{'c':{'name':'Verified customer'}}}}}
    result=invoke({}, {'id':'u'},tables,ledger=state,now=datetime(2026,11,11,tzinfo=timezone.utc))
    assert result['ok'] is True
    assert result['recent_orders'][0]['customer_name']=='Verified customer'
    assert result['revenue_month']=='45.00'
    assert result['sales_basis']=='fulfilled_order_value'
    # No ledger payments exist, so the fulfilled value is fully outstanding.
    assert result['receivables']=='45.00'


@pytest.mark.parametrize('fields',[{'has_variants':True},{'tracking_type':'batch'},{'tracking_type':'serial'},{'type':'assembly'}])
def test_ledger_unsupported_active_stock_is_unknown_not_zero(fields):
    tables,state=ledger_fixture()
    tables['products'][0].update(fields)
    assert invoke({}, {'id':'u'},tables,ledger=state)['code']=='UNSUPPORTED_STOCK'


def test_all_catalogue_reads_are_scoped_only_to_selected_production_org():
    reads=[]
    result=invoke({}, {'id':'ordinary-admin'}, scoped_tables(), reads=reads, require_scoped=True)
    assert result['ok']
    for table in ('products','product_categories','product_locations','orders'):
        queries=[filters for name,filters in reads if name==table]
        assert queries and all(filters==[('organization_id','real')] for filters in queries)
    assert result['product_count']==result['category_count']==result['location_count']==1


def test_scope_leaking_catalogue_query_fails_closed():
    assert invoke({}, {'id':'ordinary-admin'}, scoped_tables(), ignore_filters=True)==UNAVAILABLE


def test_selected_scoped_categories_denial_is_not_swallowed():
    tables=scoped_tables();tables['product_categories']=PermissionError('denied')
    assert invoke({}, {'id':'ordinary-admin'}, tables, require_scoped=True)==UNAVAILABLE
