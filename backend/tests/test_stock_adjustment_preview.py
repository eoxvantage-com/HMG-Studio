"""Read-only preview contracts. Tests intentionally await independent review."""
import ast
import copy
import importlib.util
from datetime import datetime, timezone
from pathlib import Path
from types import SimpleNamespace

import pytest

PATH=Path(__file__).parents[1]/"functions"/"stock_adjustment_preview.py"
ORG="913d46eb-585d-5a5c-b1d4-b9d22052a8d6"
PRODUCT="10000000-0000-4000-8000-000000000001"
LOCATION="20000000-0000-4000-8000-000000000001"
WAREHOUSE="30000000-0000-4000-8000-000000000001"
FOREIGN="40000000-0000-4000-8000-000000000001"
NOW=datetime(2026,11,6,12,tzinfo=timezone.utc)


def request(**overrides):
    return {"organization_id":ORG,"product_id":PRODUCT,"location_id":LOCATION,
            "product_variant_id":None,"type":"manual","adjustment_quantity":-2,**overrides}


def dataset():
    return {"organizations":[{"id":ORG,"is_active":True,"deleted_at":None}],
            "products":[{"id":PRODUCT,"organization_id":ORG,"is_active":True,"deleted_at":None,
                         "stock":20,"has_variants":False,"tracking_type":"none","type":"standard"}],
            "product_locations":[{"id":LOCATION,"organization_id":ORG,"warehouse_id":WAREHOUSE,"is_active":True,"deleted_at":None}],
            "warehouses":[{"id":WAREHOUSE,"organization_id":ORG,"is_active":True,"deleted_at":None}],
            "product_location_stocks":[{"id":"50000000-0000-4000-8000-000000000001","organization_id":ORG,
                                        "product_id":PRODUCT,"location_id":LOCATION,"quantity":10}],
            "stock_reservations":[]}


def reservation(**overrides):
    return {"id":"60000000-0000-4000-8000-000000000001","organization_id":ORG,"product_id":PRODUCT,
            "location_id":LOCATION,"product_variant_id":None,"product_serial_id":None,"product_batch_id":None,
            "quantity":3,"owner_type":"order","owner_reference":"synthetic-reference","scope_key":"synthetic-scope",
            "consumed_at":None,"released_at":None,"expires_at":None,**overrides}


def invoke(params=None,user=True,tables=None,override=None):
    spec=importlib.util.spec_from_file_location("stock_preview",PATH);module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    class FrozenDateTime(datetime):
        @classmethod
        def now(cls,tz=None):return NOW.astimezone(tz) if tz else NOW.replace(tzinfo=None)
    module.datetime=FrozenDateTime
    data=copy.deepcopy(dataset() if tables is None else tables);calls=[]
    class Query:
        def __init__(self,table):self.table=table;self.filters=[];self.size=0
        def filter(self,field,op,value):
            assert op=="eq";self.filters.append((field,value));return self
        def sort(self,field,direction):assert (field,direction)==("id","asc");return self
        def page_size(self,size):self.size=size;return self
        def execute(self):
            calls.append((self.table,list(self.filters),self.size))
            if override:
                result=override(self.table,self.filters,self.size)
                if result is not None:return result
            records=data[self.table]
            if isinstance(records,Exception):raise records
            filtered=[r for r in records if all(r.get(k)==v for k,v in self.filters)]
            return {"data":filtered[:self.size],"total":len(filtered)}
    sdk=SimpleNamespace(database=SimpleNamespace(from_=Query))
    result=module.main(request() if params is None else params,{"id":"native-username"} if user else None,sdk)
    return result,calls


def test_authenticated_preview_uses_live_quantities_and_never_claims_a_commit():
    result,calls=invoke()
    assert result["ok"] and result["code"]=="PREVIEW_ONLY"
    assert result["stock_posted"] is False and result["request_created"] is False and result["authorizes_commit"] is False
    assert result["preview"]=={"organization_id":ORG,"product_id":PRODUCT,"location_id":LOCATION,"warehouse_id":WAREHOUSE,
                               "type":"manual","adjustment_quantity":-2,"product_before":20,"product_after":18,
                               "location_before":10,"location_after":8,"reserved_quantity_conservative":0,
                               "available_quantity_conservative":10,"active_reservation_count":0}
    assert all(("organization_id",ORG) in filters for table,filters,_ in calls if table!="organizations")
    assert set(table for table,_,_ in calls)==set(dataset())


def test_explicit_zero_balance_is_valid_but_missing_balance_is_not_zero():
    tables=dataset();tables["product_location_stocks"][0]["quantity"]=0
    result,_=invoke(request(adjustment_quantity=2),tables=tables)
    assert result["ok"] and result["preview"]["location_after"]==2
    tables["product_location_stocks"]=[]
    result,_=invoke(request(adjustment_quantity=2),tables=tables)
    assert not result["ok"] and "preview" not in result


@pytest.mark.parametrize("quantity",[0,True,False,1.5,"2",float("nan"),float("inf"),2147483648,-2147483649,None])
def test_invalid_delta_fails_before_reads(quantity):
    result,calls=invoke(request(adjustment_quantity=quantity))
    assert result["code"]=="VALIDATION_ERROR" and not calls


@pytest.mark.parametrize("overrides",[{"organization_id":FOREIGN},{"product_id":"bad"},{"location_id":None},
                                       {"type":"add"},{"product_variant_id":FOREIGN},{"user_id":FOREIGN},
                                       {"stock":999},{"action":"approve"},{"status":"approved"}])
def test_invalid_authority_scope_and_unsupported_inputs_never_read(overrides):
    result,calls=invoke(request(**overrides))
    assert not result["ok"] and not calls


def test_anonymous_never_reads():
    result,calls=invoke(user=False)
    assert result["code"]=="UNAUTHENTICATED" and not calls


@pytest.mark.parametrize("field,value",[("is_active",False),("is_active",None),("deleted_at","2026-11-01"),
                                         ("has_variants",True),("has_variants",None),("tracking_type","serial"),
                                         ("tracking_type","batch"),("type","assembly"),("type","virtual_kit")])
def test_unsupported_or_inactive_products_fail_closed(field,value):
    tables=dataset();tables["products"][0][field]=value
    result,_=invoke(tables=tables)
    assert not result["ok"] and "preview" not in result


@pytest.mark.parametrize("table,field",[("products","organization_id"),("product_locations","organization_id"),
                                        ("warehouses","organization_id"),("product_location_stocks","organization_id"),
                                        ("product_location_stocks","product_id"),("product_location_stocks","location_id")])
def test_even_misfiltered_foreign_native_rows_are_rejected(table,field):
    wrong={**dataset()[table][0],field:FOREIGN}
    def override(name,*_):return {"data":[wrong],"total":1} if name==table else None
    result,_=invoke(override=override)
    assert not result["ok"] and "preview" not in result


@pytest.mark.parametrize("table,field,value",[("products","stock",True),("products","stock","20"),
                                            ("product_location_stocks","quantity",-1),("products","stock",2147483648),
                                            ("product_location_stocks","quantity",21),("warehouses","is_active",False),
                                            ("product_locations","deleted_at","2026-11-01")])
def test_invalid_or_inconsistent_native_stock_scope_fails_closed(table,field,value):
    tables=dataset();tables[table][0][field]=value
    result,_=invoke(tables=tables)
    assert not result["ok"]


def test_positive_overflow_rejected():
    tables=dataset();tables["products"][0]["stock"]=2147483647
    result,_=invoke(request(adjustment_quantity=1),tables=tables)
    assert result["code"]=="QUANTITY_OUT_OF_RANGE"


def test_reservations_reduce_available_and_global_reservations_count_fully():
    tables=dataset();tables["stock_reservations"]=[reservation(location_id=None)]
    result,_=invoke(request(adjustment_quantity=-7),tables=tables)
    assert result["ok"] and result["preview"]["available_quantity_conservative"]==7
    assert result["preview"]["reserved_quantity_conservative"]==3
    result,_=invoke(request(adjustment_quantity=-8),tables=tables)
    assert result["code"]=="INSUFFICIENT_AVAILABLE" and "preview" not in result


@pytest.mark.parametrize("changes",[{"expires_at":"2026-11-05T10:00:00Z"},{"consumed_at":"2026-11-05T10:00:00"},
                                     {"released_at":"2026-11-05T10:00:00+00:00"}])
def test_expired_consumed_released_reservations_do_not_count(changes):
    tables=dataset();tables["stock_reservations"]=[reservation(**changes)]
    result,_=invoke(request(adjustment_quantity=-10),tables=tables)
    assert result["ok"] and result["preview"]["reserved_quantity_conservative"]==0


@pytest.mark.parametrize("changes",[{"location_id":FOREIGN},{"product_variant_id":FOREIGN},{"product_serial_id":FOREIGN},
                                     {"product_batch_id":FOREIGN},{"quantity":True},{"quantity":-1},{"scope_key":""},
                                     {"expires_at":"bad"},{"consumed_at":"2099-01-01T00:00:00Z"}])
def test_unknown_reservation_scope_or_malformed_state_never_becomes_available(changes):
    tables=dataset();tables["stock_reservations"]=[reservation(**changes)]
    result,_=invoke(tables=tables)
    assert result["code"]=="AVAILABILITY_UNCONFIRMED" and "preview" not in result


@pytest.mark.parametrize("reply",[{"data":[],"total":1},{"data":[]},{"data":[],"total":True},
                                   {"data":[reservation(),reservation()],"total":2},
                                   {"data":[],"total":201}])
def test_partial_missing_total_duplicate_and_over_limit_reservations_fail_closed(reply):
    def override(table,*_):return reply if table=="stock_reservations" else None
    result,_=invoke(override=override)
    assert result["code"]=="AVAILABILITY_UNCONFIRMED" and "preview" not in result


@pytest.mark.parametrize("field",["organization_id","product_id"])
def test_misfiltered_foreign_reservations_are_rejected(field):
    wrong=reservation(**{field:FOREIGN})
    def override(table,*_):return {"data":[wrong],"total":1} if table=="stock_reservations" else None
    result,_=invoke(override=override)
    assert result["code"]=="AVAILABILITY_UNCONFIRMED" and "preview" not in result


@pytest.mark.parametrize("field",["consumed_at","released_at","expires_at","location_id",
                                  "product_variant_id","product_serial_id","product_batch_id"])
def test_missing_reservation_state_is_not_assumed_null(field):
    row=reservation();del row[field]
    tables=dataset();tables["stock_reservations"]=[row]
    result,_=invoke(tables=tables)
    assert result["code"]=="AVAILABILITY_UNCONFIRMED" and "preview" not in result


def test_duplicate_single_balance_and_database_errors_are_sanitized():
    tables=dataset();tables["product_location_stocks"]*=2
    result,_=invoke(tables=tables);assert not result["ok"]
    tables=dataset();tables["stock_reservations"]=RuntimeError("secret-token-sensitive-error")
    result,_=invoke(tables=tables)
    assert result["code"]=="AVAILABILITY_UNCONFIRMED" and "secret" not in str(result)


def test_no_write_network_identity_or_policy_bypass_paths_exist():
    tree=ast.parse(PATH.read_text())
    attributes={node.attr for node in ast.walk(tree) if isinstance(node,ast.Attribute)}
    assert not attributes & {"create","update","delete","upsert","patch","post","secrets","users","policy","functions","httpClient"}
    imports={node.module for node in ast.walk(tree) if isinstance(node,ast.ImportFrom)}
    assert imports=={"datetime","uuid"}
