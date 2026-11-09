import asyncio
import copy
import importlib.util
import sys
from pathlib import Path

import pytest

SCRIPTS=Path(__file__).parents[1]/"scripts"
sys.path.insert(0,str(SCRIPTS))


def module():
    spec=importlib.util.spec_from_file_location("apply_history",SCRIPTS/"apply_historical_60.py")
    m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m


def harness(m):
    from generate_historical_60 import build_plan
    plan=build_plan();database={};writes=[];guards=[];reports=[]
    async def guard(): guards.append(True)
    async def read(table,ids): return [copy.deepcopy(database[(table,i)]) for i in ids if (table,i) in database]
    async def create(table,row):
        writes.append(("create",table,row["id"]));database[(table,row["id"])]=copy.deepcopy(row);return 201
    async def publish(row):
        writes.append(("publish","products",row["id"]));database[("products",row["id"])]["is_active"]=True;return 200
    return plan,database,writes,guards,reports,guard,read,create,publish


def test_all_preflight_before_writes_then_publish_after_all_verified():
    m=module();p,db,w,g,reports,guard,read,create,publish=harness(m)
    result=asyncio.run(m.apply_plan(p,guard,read,create,publish,lambda x:reports.append(copy.deepcopy(x))))
    assert not result["aborted"] and result["complete"]
    assert len(result["verified"])==135 and len(result["published"])==6
    assert len(w)==141 and all(x[0]=="create" for x in w[:135]) and all(x[0]=="publish" for x in w[135:])
    assert g
    second=asyncio.run(m.apply_plan(p,guard,read,create,publish))
    assert second["complete"] and len(w)==141


def test_last_table_collision_or_guard_failure_sends_zero_writes():
    m=module();p,db,w,g,r,guard,read,create,publish=harness(m)
    table=list(m.INSERT_ORDER)[-1];row=copy.deepcopy(p["rows"][table][0]);row["quantity"]+=1;db[(table,row["id"])]=row
    result=asyncio.run(m.apply_plan(p,guard,read,create,publish))
    assert result["aborted"] and not w
    async def bad_guard(): raise ValueError("schema changed")
    result=asyncio.run(m.apply_plan(p,bad_guard,read,create,publish))
    assert result["aborted"] and not w


def test_timeout_after_committed_create_reconciles_once_and_never_replays_or_publishes():
    m=module();p,db,w,g,r,guard,read,create,publish=harness(m);reads=[]
    async def counted_read(table,ids): reads.append((table,list(ids)));return await read(table,ids)
    async def timeout(table,row): await create(table,row);raise TimeoutError("uncertain")
    result=asyncio.run(m.apply_plan(p,guard,counted_read,timeout,publish))
    assert result["aborted"] and len(w)==1 and len(result["verified"])==1
    assert result["attempts"][0]["uncertain"] is True
    assert len(reads)==len(m.INSERT_ORDER)+1


def test_failed_final_verification_prevents_publication():
    m=module();p,db,w,g,r,guard,read,create,publish=harness(m)
    async def corrupt_read(table,ids):
        result=await read(table,ids)
        if len(w)==135 and table=="customers": result[0]["name"]="Changed"
        return result
    result=asyncio.run(m.apply_plan(p,guard,corrupt_read,create,publish))
    assert result["aborted"] and not any(x[0]=="publish" for x in w)


def test_child_policy_diff_only_extends_exact_ids_and_preserves_deny():
    m=module();from generate_historical_60 import build_plan
    plan=build_plan();proposals=m.child_policy_plan(plan)
    assert len(proposals)==7
    for table,p in proposals.items():
        before=p["before"];after=p["after"]
        assert before["disabled"]==after["disabled"] is False
        assert before["resource_policy"]["resource"]==after["resource_policy"]["resource"]=="datatable:"+table
        oldrules=before["resource_policy"]["rules"];newrules=after["resource_policy"]["rules"]
        if table=="return_order_items":
            assert len(oldrules)==1 and oldrules[0]["actions"]==["*"]
            assert newrules[0]=={**oldrules[0],"actions":["create","update","delete"]}
        else:
            assert newrules[:-1]==oldrules
        added=newrules[-1]
        assert added["actions"]==["read"] and added["roles"]==["HMG Synthetic Operator"] and added["effect"]=="EFFECT_ALLOW"
        for row in plan["rows"][table]: assert row["id"] in added["condition"]["match"]["expr"]


def test_semantic_native_comparison_preserves_boolean_numeric_distinction():
    m=module()
    assert m.same_row("products",{"id":"x","stock":0,"is_active":False,"price":"1.00","created_at":"2026-05-01T00:00:00Z"},
                      {"id":"x","stock":0,"is_active":False,"price":"1","created_at":"2026-05-01T00:00:00"})
    assert not m.same_row("products",{"id":"x","stock":0,"is_active":False},{"id":"x","stock":False,"is_active":0})


def test_unexpected_active_product_on_create_aborts_before_publication():
    m=module();p,db,w,g,r,guard,read,create,publish=harness(m)
    async def active_create(table,row):
        result=await create(table,row)
        if table=="products":db[(table,row["id"])]["is_active"]=True
        return result
    result=asyncio.run(m.apply_plan(p,guard,read,active_create,publish))
    assert result["aborted"] and not any(x[0]=="publish" for x in w)


def test_publication_accepts_only_valid_server_updated_at_and_preserves_business_values():
    m=module();p,db,w,g,r,guard,read,create,publish=harness(m)
    from datetime import datetime,timezone
    async def timestamp_publish(row):
        result=await publish(row);db[("products",row["id"])]["updated_at"]=datetime.now(timezone.utc).isoformat();return result
    result=asyncio.run(m.apply_plan(p,guard,read,create,timestamp_publish))
    assert result["complete"]
    assert asyncio.run(m.apply_plan(p,guard,read,create,timestamp_publish))["complete"]
    expected=p["rows"]["products"][0];actual=copy.deepcopy(db[("products",expected["id"])])
    for field,value in [("updated_at","invalid"),("updated_at","2099-01-01T00:00:00Z"),("created_at","2026-11-06T00:00:00Z"),("price","999"),("metadata",{"synthetic":True})]:
        changed={**actual,field:value}
        assert not m.same_row("products",expected,changed,published=True)


def test_publication_preserves_full_fresh_optional_null_and_missing_keys():
    m=module();p,db,w,g,r,guard,read,create,publish=harness(m)
    async def with_null(table,row):
        result=await create(table,row)
        if table=="products":db[(table,row["id"])]["max_stock"]=None
        return result
    async def drop_null(row):
        result=await publish(row);del db[("products",row["id"])]["max_stock"];return result
    result=asyncio.run(m.apply_plan(p,guard,read,with_null,drop_null))
    assert result["aborted"] and not result["complete"]
    assert sum(operation=="publish" for operation,_,_ in w)==1


def test_final_deactivated_product_does_not_report_complete():
    m=module();p,db,w,g,r,guard,read,create,publish=harness(m)
    async def deactivate_final(table,ids):
        if table=="products" and len(ids)==6 and sum(operation=="publish" for operation,_,_ in w)==6:
            db[(table,ids[0])]["is_active"]=False
        return await read(table,ids)
    result=asyncio.run(m.apply_plan(p,guard,deactivate_final,create,publish))
    assert result["aborted"] and not result["complete"]


@pytest.mark.parametrize("mode",["drift","timeout","rejected"])
def test_policy_preflight_drift_uncertain_and_rejected_never_replay(mode):
    m=module();from generate_historical_60 import build_plan
    plan=build_plan();proposals=m.child_policy_plan(plan)
    state={t:copy.deepcopy(p["before"]) for t,p in proposals.items()};writes=[];reads=[]
    if mode=="drift":state[list(proposals)[-1]]["disabled"]=True
    async def call(name,args):
        if args["action"]=="get":
            table=args["policy_id"].split("resource.datatable_",1)[1].split(".vdefault/",1)[0]
            reads.append(table);return {"data":{"policy":copy.deepcopy(state[table])}}
        table=args["policy_data"]["name"];writes.append(table);state[table]=copy.deepcopy(proposals[table]["after"])
        if mode=="timeout":raise TimeoutError("uncertain")
        return {"success":False,"error":"rejected"}
    result=asyncio.run(m.apply_child_policies(plan,proposals,call))
    assert result["aborted"] and not result["complete"]
    assert len(writes)==(0 if mode=="drift" else 1)
    if writes:assert reads[-1]==writes[0]
