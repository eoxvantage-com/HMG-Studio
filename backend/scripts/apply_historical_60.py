"""Reviewed create-only synthetic snapshot provisioner, never an ERP workflow.

Default writes only local proposals. Live modes require exact plan hashes.
No upsert/delete, no function/external calls, no write replay. Products stage
inactive; only six exact products may publish after all 135 rows verify.
Provisioning is NOT atomic: partial progress is recorded and reconciled on resume.
"""
import argparse
import asyncio
import copy
from datetime import datetime, timedelta, timezone
from functools import lru_cache
import hashlib
import json
import logging

from generate_historical_60 import (ROOT, SCHEMA, PREFLIGHT, OUTPUT, EVIDENCE, ORG,
                                   build_plan, validate_plan, number, require)
from restrict_synthetic import ROLE, SCOPE

POLICIES = ROOT / "backend/schema/historical-60-policies-before.json"
POLICY_PLAN = ROOT / "backend/schema/historical-60-child-policy-plan.json"
CHILDREN = ("product_supplier", "product_components", "order_items", "purchase_order_items",
            "return_order_items", "stock_transfer_items", "work_order_items")
INSERT_ORDER = ("customers", "suppliers", "products", "product_supplier", "product_components",
                "stock_adjustments", "purchase_orders", "purchase_order_items", "work_orders",
                "work_order_items", "work_order_outputs", "stock_transfers", "stock_transfer_items",
                "orders", "order_items", "order_payments", "return_orders", "return_order_items",
                "product_location_stocks")


@lru_cache(maxsize=1)
def schemas():
    return {t:s["json_schema"] for t,s in json.loads(SCHEMA.read_text())["schemas"].items()}


def same_row(table, expected, actual, published=False):
    """Compare native scalar encodings, keeping booleans distinct from numbers."""
    if not isinstance(actual,dict): return False
    fields={f["name"]:f for f in schemas()[table]["fields"]}
    for key,value in expected.items():
        other=actual.get(key)
        if key=="is_active" and table=="products" and published and value is False and other is True:
            continue
        kind=fields[key]["type"]
        try:
            if kind=="boolean":
                if type(other) is not bool or other is not value: return False
            elif kind=="integer":
                if type(other) is not int or other!=value: return False
            elif kind=="number":
                if number(other)!=number(value): return False
            elif kind=="datetime":
                # The observed native API returns UTC timestamps without offset.
                def parsed(v):
                    dt=datetime.fromisoformat(v.replace("Z","+00:00"))
                    return dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt
                if key=="updated_at" and table=="products" and published and actual.get("is_active") is True:
                    # Native PATCH maintains updated_at. Only this one server
                    # timestamp may advance; historical business dates cannot.
                    if not parsed(value)<=parsed(other)<=datetime.now(timezone.utc)+timedelta(minutes=5):return False
                elif parsed(value)!=parsed(other): return False
            elif type(value) is not type(other) or value!=other: return False
        except (ValueError,TypeError,AttributeError): return False
    # Refuse unexpected populated optional values, including metadata/deletion.
    for key,value in actual.items():
        if key in expected or value is None: continue
        if key not in fields or "default" not in fields[key]: return False
        default=fields[key]["default"]
        if type(default) is not type(value) or default!=value: return False
    return True


def child_policy_plan(plan):
    validate_plan(plan)
    before=json.loads(POLICIES.read_text())
    require(before["app"]=="hmg-studio","Policy snapshot app mismatch")
    proposals={}
    for table in CHILDREN:
        policy=before["policies"][table];native=policy["resource_policy"]
        require(policy.get("disabled") is False and native["resource"]=="datatable:"+table and native["scope"]==SCOPE and native["version"]=="default","Unexpected child policy identity")
        require(not policy.get("variables") and not policy.get("json_schema") and not policy.get("description") and not native.get("import_derived_roles"),"Unsupported policy features")
        require(set(native)<={"resource","scope","version","rules","import_derived_roles","scope_permissions"} and native.get("scope_permissions")=="SCOPE_PERMISSIONS_UNSPECIFIED","Unknown policy structure")
        updated=copy.deepcopy(policy);rules=updated["resource_policy"]["rules"]
        if table=="return_order_items":
            require(rules==[{"actions":["*"],"roles":["*"],"effect":"EFFECT_DENY","derived_roles":[],"name":""}],"Return policy no longer baseline DENY-all")
            rules[0]["actions"]=["create","update","delete"]
        else:
            require(len(rules)==2 and rules[1]=={"actions":["create","update","delete"],"roles":["*"],"effect":"EFFECT_DENY","derived_roles":[],"name":""},"Child write restriction drift")
            old=rules[0]
            require(old["actions"]==["read"] and old["roles"]==[ROLE] and old["effect"]=="EFFECT_ALLOW" and not old.get("derived_roles"),"Unexpected old read rule")
        rule={"actions":["read"],"roles":[ROLE],"effect":"EFFECT_ALLOW","derived_roles":[],
              "name":"synthetic_history_60_read","condition":{"match":{"expr":"R.attr.id in "+json.dumps([r["id"] for r in plan["rows"][table]])}}}
        rules.append(rule)
        proposals[table]={"before":policy,"after":updated,"payload":{"name":table,"policy_type":"resource","entity_type":"datatable","version":"default","rules":rules}}
    return proposals


def comparable_policy(policy):
    return {k:v for k,v in policy.items() if k!="metadata"}


def publication_preservation_hash(row):
    """Preserve native full-row shape and JSON types, including null vs missing."""
    preserved={k:v for k,v in row.items() if k not in {"is_active","updated_at"}}
    return hashlib.sha256(json.dumps(preserved,sort_keys=True,separators=(",",":"),allow_nan=False).encode()).hexdigest()


async def apply_plan(plan, guard, read, create, publish, save=lambda report:None):
    """Inject I/O for testing; every mutation is create-only or bounded publish."""
    report={"app":"hmg-studio","organization_id":ORG,"business_count":60,"support_count":75,
            "atomic":False,"workflow_execution_verified":False,"attempts":[],"verified":[],
            "skipped":[],"published":[],"failures":[],"aborted":False,"complete":False}
    phase="validate"
    async def checked_read(table,expected,allow_published=False):
        ids=[r["id"] for r in expected];records=await read(table,ids)
        require(isinstance(records,list) and len(records)<=len(ids),"Unexpected bounded read shape")
        by_id={r["id"]:r for r in records}
        require(len(by_id)==len(records) and set(by_id)<=set(ids),"Unexpected exact ID readback")
        for row in expected:
            if row["id"] in by_id:
                require(same_row(table,row,by_id[row["id"]],published=allow_published),"Refusing changed existing fixture")
        return by_id
    try:
        validate_plan(plan)
        phase="metadata_preflight";await guard()
        existing={};phase="all_rows_preflight"
        for table in INSERT_ORDER:
            existing[table]=await checked_read(table,plan["rows"][table],allow_published=True)
        already_active=any(r.get("is_active") is True for r in existing["products"].values())
        require(not already_active or all(len(existing[t])==len(plan["rows"][t]) for t in INSERT_ORDER),"Published products with missing support rows")
        save(report)
        for table in INSERT_ORDER:
            for row in plan["rows"][table]:
                key=table+"/"+row["id"]
                if row["id"] in existing[table]:
                    report["skipped"].append(key);report["verified"].append(key);continue
                phase="create";attempt={"table":table,"id":row["id"],"operation":"create","attempted":True,"uncertain":False,"retry_sent":False}
                report["attempts"].append(attempt);save(report)
                try: attempt["http_status"]=await create(table,copy.deepcopy(row))
                except Exception as error:
                    attempt.update(uncertain=True,error_type=type(error).__name__)
                save(report)
                phase="create_readback";after=await checked_read(table,[row])
                if row["id"] in after: report["verified"].append(key)
                save(report)
                require(not attempt["uncertain"] and 200<=attempt.get("http_status",0)<300 and row["id"] in after,"Create rejected/uncertain/unverified; no replay")
        phase="before_publish_guard";await guard()
        phase="all_rows_readback"
        for table in INSERT_ORDER:
            verified=await checked_read(table,plan["rows"][table],allow_published=already_active)
            require(len(verified)==len(plan["rows"][table]),"Missing row before publish")
        report["all_rows_verified_before_publication"]=True;save(report)
        for row in plan["rows"]["products"]:
            phase="publish_preflight";fresh=await checked_read("products",[row],allow_published=already_active);require(row["id"] in fresh,"Missing product")
            if fresh[row["id"]]["is_active"] is True:
                report["published"].append(row["id"]);continue
            phase="publish";attempt={"table":"products","id":row["id"],"operation":"publish_is_active_only","attempted":True,"uncertain":False,"retry_sent":False}
            attempt["preservation_sha256"]=publication_preservation_hash(fresh[row["id"]])
            report["attempts"].append(attempt);save(report)
            try: attempt["http_status"]=await publish(copy.deepcopy(row))
            except Exception as error: attempt.update(uncertain=True,error_type=type(error).__name__)
            save(report)
            phase="publish_readback";after=await checked_read("products",[row],allow_published=True)
            require(row["id"] in after and publication_preservation_hash(after[row["id"]])==attempt["preservation_sha256"],"Publication changed another native field")
            active=row["id"] in after and after[row["id"]]["is_active"] is True
            if active:report["published"].append(row["id"])
            save(report)
            require(not attempt["uncertain"] and 200<=attempt.get("http_status",0)<300 and active,"Publication rejected/uncertain/unverified; no replay")
        phase="final_all_rows_readback"
        for table in INSERT_ORDER:
            verified=await checked_read(table,plan["rows"][table],allow_published=True)
            require(len(verified)==len(plan["rows"][table]),"Missing row after publication")
            if table=="products":require(all(r.get("is_active") is True for r in verified.values()),"Product deactivated before final verification")
        report["final_all_rows_verified"]=True
        report["complete"]=True
    except Exception as error:
        report["aborted"]=True;report["failures"].append({"phase":phase,"error_type":type(error).__name__,"message":str(error) if isinstance(error,ValueError) else "Operation failed; inspect sanitized attempts"})
    save(report)
    return report


async def apply_child_policies(plan, proposals, call, save=lambda report:None):
    require(proposals==child_policy_plan(plan),"Unreviewed child policy proposal")
    report={"app":"hmg-studio","policy_changes":{},"writes_granted":False,"aborted":False,"complete":False}
    async def get(table):
        return (await call("manage_policies",{"action":"get","policy_id":"resource.datatable_"+table+".vdefault/"+SCOPE}))["data"]["policy"]
    try:
        # ALL policies checked before first replacement; fresh compare again per write.
        for table,p in proposals.items():
            actual=await get(table)
            require(comparable_policy(actual) in (comparable_policy(p["before"]),comparable_policy(p["after"])),"Policy drift before any write")
        for table,p in proposals.items():
            fresh=await get(table);entry={"before":fresh,"expected":p["after"],"retry_sent":False};report["policy_changes"][table]=entry;save(report)
            if comparable_policy(fresh)!=comparable_policy(p["after"]):
                require(comparable_policy(fresh)==comparable_policy(p["before"]),"Concurrent policy change")
                entry["attempted"]=True;save(report)
                try:
                    entry["result"]=await call("manage_policies",{"action":"create_update","policy_data":p["payload"]})
                    entry["rejected"]=entry["result"].get("success") is not True or bool(entry["result"].get("error"))
                except Exception as error: entry["uncertain"]=True;entry["error_type"]=type(error).__name__
                save(report)
            entry["after"]=await get(table);save(report)
            require(comparable_policy(entry["after"])==comparable_policy(p["after"]),"Policy readback mismatch")
            require(not entry.get("uncertain"),"Uncertain policy write; no replay")
            require(not entry.get("rejected"),"Explicit policy rejection; no replay")
        report["complete"]=True
    except Exception as error:
        report["aborted"]=True;report["error_type"]=type(error).__name__
    save(report);return report


async def live(plan, proposals, policies_only):
    from provision_erp import environment
    from restrict_synthetic import scoped_calls
    import httpx
    logging.disable(logging.CRITICAL)
    env=environment()  # validates insurance host + hmg-studio, secrets in memory only
    report_path=EVIDENCE/("historical-60-policies.json" if policies_only else "historical-60-import.json")
    def save(report):report_path.write_text(json.dumps(report,indent=2)+"\n",encoding="utf-8")
    baseline=json.loads(POLICIES.read_text())["policies"]
    async with scoped_calls(env) as call:
        if policies_only:return await apply_child_policies(plan,proposals,call,save)
        async with httpx.AsyncClient(timeout=45,trust_env=False,headers={"Authorization":"Api-Key "+env["TARUVI_API_KEY"],"X-App-Slug":"hmg-studio"}) as client:
            base=env["TARUVI_SITE_URL"].rstrip("/")+"/api/apps/hmg-studio/datatables/"
            async def read(table,ids):
                require(table in INSERT_ORDER,"Unexpected data read table")
                response=await client.get(base+table+"/data/",params={"id__in":",".join(ids),"page_size":len(ids)+1})
                response.raise_for_status();body=response.json();records=body.get("data")
                require(isinstance(records,list) and body.get("total")==len(records),"Incomplete native read")
                return records
            async def guard():
                for table in INSERT_ORDER:
                    result=(await call("get_datatable_schema",{"table_name":table}))["data"]
                    if isinstance(result,list):require(len(result)==1,"Ambiguous schema");result=result[0]
                    require(result["name"]==table and result["physical_table_name"]=="hmg_studio_"+table and result["provider_type"]=="flat_table" and result["json_schema"]==schemas()[table],"Live schema drift")
                    policy=(await call("manage_policies",{"action":"get","policy_id":"resource.datatable_"+table+".vdefault/"+SCOPE}))["data"]["policy"]
                    expected=proposals[table]["after"] if table in proposals else baseline[table]
                    require(comparable_policy(policy)==comparable_policy(expected),"Policy drift or child policy not installed")
                for event in ("RECORD_CREATE","RECORD_UPDATE","RECORD_DELETE"):
                    result=await call("manage_event_subscription",{"action":"list_subscribers","event":event})
                    require(result.get("success") is True and result.get("total")==0 and result.get("data")==[],"Event subscriptions changed")
                external=json.loads(PREFLIGHT.read_text())["external_rows"]
                for table,records in external.items():
                    for expected in records:
                        response=await client.get(base+table+"/data/"+expected["id"]+"/");response.raise_for_status();actual=response.json()["data"]
                        require(actual["id"]==expected["id"] and not actual.get("deleted_at"),"External master identity drift")
                        require(actual["id"]==ORG if table=="organizations" else actual.get("organization_id")==ORG,"External master scope drift")
                        if table=="product_locations":require(actual["warehouse_id"]==expected["warehouse_id"],"External location changed warehouse")
            async def create(table,row):return (await client.post(base+table+"/data/",json=row)).status_code
            async def publish(row):return (await client.patch(base+"products/data/"+row["id"]+"/",json={"is_active":True})).status_code
            return await apply_plan(plan,guard,read,create,publish,save)


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    modes=parser.add_mutually_exclusive_group();modes.add_argument("--apply-policies",action="store_true");modes.add_argument("--apply-data",action="store_true")
    parser.add_argument("--approve-plan-sha256");parser.add_argument("--approve-policy-sha256")
    args=parser.parse_args()
    if not args.apply_policies and not args.apply_data:
        plan=build_plan();OUTPUT.write_text(json.dumps(plan,indent=2)+"\n",encoding="utf-8")
        proposals=child_policy_plan(plan);POLICY_PLAN.write_text(json.dumps(proposals,indent=2)+"\n",encoding="utf-8")
        print(json.dumps({"business_count":60,"support_count":75,"plan_sha256":hashlib.sha256(OUTPUT.read_bytes()).hexdigest(),"policy_sha256":hashlib.sha256(POLICY_PLAN.read_bytes()).hexdigest(),"child_policy_count":7,"live_writes":0}));return
    require(args.approve_plan_sha256==hashlib.sha256(OUTPUT.read_bytes()).hexdigest(),"Exact approved data plan hash required")
    require(args.approve_policy_sha256==hashlib.sha256(POLICY_PLAN.read_bytes()).hexdigest(),"Exact approved policy plan hash required")
    plan=json.loads(OUTPUT.read_text());validate_plan(plan)
    proposals=json.loads(POLICY_PLAN.read_text());require(proposals==child_policy_plan(plan),"Policy plan differs")
    result=asyncio.run(live(plan,proposals,args.apply_policies))
    print(json.dumps({"complete":result["complete"],"aborted":result["aborted"],"verified":len(result.get("verified",[])),"published":len(result.get("published",[]))}))
    if result["aborted"]:raise SystemExit(1)


if __name__=="__main__":main()
