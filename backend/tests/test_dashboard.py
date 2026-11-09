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

def invoke(params,user,tables,now=None,mutations=None):
    path=Path(__file__).parents[1]/"functions"/"dashboard.py"
    spec=importlib.util.spec_from_file_location("dashboard",path);mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
    if now is not None:
        class FrozenDateTime(datetime):
            @classmethod
            def now(cls, tz=None):
                return now.astimezone(tz) if tz else now.replace(tzinfo=None)
        mod.datetime=FrozenDateTime
    class Query:
        def __init__(self,table):self.table=table;self.number=1;self.size=100
        def page(self,number):self.number=number;return self
        def page_size(self,size):self.size=size;return self
        def sort(self,*args):return self
        def _mutation(self,*args,**kwargs):
            if mutations is not None:mutations.append(self.table)
            raise AssertionError("Dashboard must remain read-only")
        insert=update=delete=upsert=_mutation
        def execute(self):
            rows=tables.get(self.table,[])
            if isinstance(rows,Exception):raise rows
            return {"data":rows[(self.number-1)*self.size:self.number*self.size]}
    return mod.main(params,user,SimpleNamespace(database=SimpleNamespace(from_=Query)))

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
