"""Deterministic synthetic HMG fixtures. Never overwrites an existing different row."""
import argparse
import asyncio
import copy
from decimal import Decimal
from datetime import datetime, timezone
import json
import logging
from pathlib import Path
from uuid import NAMESPACE_URL, uuid5

ROOT = Path(__file__).resolve().parents[2]
STAMP = "2026-11-06T09:00:00Z"
NOTE = "SYNTHETIC HMG TEST DATA - not a real transaction or contact."
def uid(key):
    return str(uuid5(NAMESPACE_URL, "hmg-studio/synthetic/2026-11-06/"+key))
ORG = uid("organization")
QA_USER = "bb17fd27-1f5e-4691-b2c7-e9745883e54f"

def fixtures():
    data={}
    def add(table,key,**values):
        row={"id":uid(key),"organization_id":ORG,"created_at":STAMP,"updated_at":STAMP,**values}
        data.setdefault(table,[]).append(row); return row["id"]
    add("organizations","organization",name="HMG Stones - Synthetic Workspace",slug="hmg-synthetic-20261106",description=NOTE,timezone="Asia/Kolkata",default_currency="INR",currency="INR",country="IN",is_active=True)
    del data["organizations"][0]["organization_id"]
    cats={}
    for name in ["Marble","Granite","Onyx","Travertine","Quartzite"]:
        cats[name]=add("product_categories","category/"+name,name=name,slug="synthetic-"+name.lower(),description=NOTE,is_active=True)
    wh=[];loc=[]
    for i,(name,code) in enumerate([("Factory Stone Yard","FACTORY"),("Experience Centre","SHOWROOM"),("Project Dispatch","DISPATCH")]):
        wh.append(add("warehouses","warehouse/"+code,name=name+" - Test",code="SYN-"+code,description=NOTE,city="Bengaluru",province="Karnataka",country="IN",currency="INR",timezone="Asia/Kolkata",is_default=i==0,is_active=True,priority=i))
        loc.append(add("product_locations","location/"+code,name=name+" Rack A",code="SYN-"+code+"-A",warehouse_id=wh[-1],description=NOTE,aisle="A",shelf="01",is_active=True))
    people=[]
    for i,name in enumerate(["Sample Architecture Studio","Sample Villa Project","Sample Hospitality Interiors"]):
        people.append(add("customers","customer/"+str(i),name=name,code="SYN-CUST-"+str(i+1),company_name=name,contact_name="Synthetic Project Contact",email="project"+str(i+1)+"@example.invalid",billing_city="Bengaluru",billing_country="IN",currency="INR",notes=NOTE,is_active=True))
    suppliers=[]
    for i,name in enumerate(["Sample Marble Quarry","Sample Granite Supply","Sample Imported Stone Partner"]):
        suppliers.append(add("suppliers","supplier/"+str(i),name=name,code="SYN-SUP-"+str(i+1),contact_name="Synthetic Supply Contact",email="supply"+str(i+1)+"@example.invalid",city="Bengaluru",country="IN",currency="INR",notes=NOTE,is_active=True))
    stones=[
        ("Carrara White","Marble",48,"12500","8500",12),
        ("Calacatta Gold","Marble",18,"28500","21000",8),
        ("Absolute Black","Granite",85,"6800","4200",20),
        ("Steel Grey","Granite",62,"5400","3600",15),
        ("Honey Onyx","Onyx",7,"32000","24000",10),
        ("Ivory Travertine","Travertine",24,"11800","7900",12),
        ("Taj Mahal Quartzite","Quartzite",9,"24500","18000",10),
        ("Rainforest Green","Marble",36,"9800","6500",10),
    ]
    products=[]
    for i,(name,family,stock,price,cost,minimum) in enumerate(stones):
        p=add("products","product/"+str(i),sku="HMG-SYN-"+str(i+1).zfill(3),name=name+" Slab",description="Synthetic polished 20 mm stone slab. "+NOTE,category_id=cats[family],location_id=loc[0],price=price,selling_price=price,purchase_price=cost,stock=stock,min_stock=minimum,max_stock=100,currency="INR",notes=NOTE,is_active=True,tracking_type="none",type="standard",has_variants=False,reorder_point=minimum,reorder_quantity=20)
        products.append(p)
        add("product_location_stocks","balance/"+str(i),product_id=p,location_id=loc[0],quantity=stock)
        add("stock_adjustments","opening/"+str(i),product_id=p,user_id=QA_USER,type="set",quantity_before=0,quantity_after=stock,adjustment_quantity=stock,reason="Synthetic opening fixture",notes=NOTE,location_id=loc[0])
        add("product_supplier","source/"+str(i),product_id=p,supplier_id=suppliers[i%3],cost_price=cost,is_primary=True)
        del data["product_supplier"][-1]["organization_id"]
    for i,(quantity,status) in enumerate([(6,"pending"),(4,"processing"),(3,"pending")]):
        price=Decimal(stones[i][3]);total=str(price*quantity)
        order=add("orders","order/"+str(i),order_number="SYN-ORD-20261106-"+str(i+1).zfill(3),customer_id=people[i],customer_name=data["customers"][i]["name"],customer_email=data["customers"][i]["email"],status=status,subtotal=total,total=total,tax="0",shipping="0",currency="INR",order_date=STAMP,warehouse_id=wh[0],notes=NOTE,stock_committed=False,amount_paid="0",payment_status="unpaid")
        add("order_items","order-line/"+str(i),order_id=order,product_id=products[i],product_name=stones[i][0]+" Slab",sku="HMG-SYN-"+str(i+1).zfill(3),quantity=quantity,unit_price=str(price),subtotal=total,total=total,tax="0")
        del data["order_items"][-1]["organization_id"]
    for i in range(2):
        total=str(Decimal(stones[4+i][4])*20)
        po=add("purchase_orders","purchase/"+str(i),supplier_id=suppliers[i],po_number="SYN-PO-20261106-"+str(i+1).zfill(3),status="draft",order_date="2026-11-06",expected_date="2026-11-20",subtotal=total,tax="0",shipping="0",total=total,currency="INR",notes=NOTE)
        add("purchase_order_items","purchase-line/"+str(i),purchase_order_id=po,product_id=products[4+i],product_name=stones[4+i][0]+" Slab",quantity_ordered=20,quantity_received=0,unit_cost=stones[4+i][4],subtotal=total,total=total,tax="0")
        del data["purchase_order_items"][-1]["organization_id"]
    add("stock_transfers","transfer/1",transfer_number="SYN-TRF-001",from_location_id=loc[0],to_location_id=loc[1],from_warehouse_id=wh[0],to_warehouse_id=wh[1],transferred_by=QA_USER,status="pending",is_inter_warehouse=True,notes=NOTE)
    add("stock_audits","audit/1",audit_number="SYN-AUD-001",name="Synthetic factory cycle count",description=NOTE,status="draft",audit_type="full",created_by=QA_USER,warehouse_id=wh[0],notes=NOTE)
    add("notifications","notification/1",user_id=QA_USER,type="info",title="Synthetic workspace ready",message=NOTE,priority="normal")

    # Additional examples are inert drafts/configuration, never posted stock,
    # payments, carrier purchases, scheduled deliveries, or identity records.
    # Keep valid existing fixture IDs/values unchanged for safe reruns.
    def child(table, key, **values):
        result = add(table, key, **values)
        del data[table][-1]["organization_id"]
        return result

    child("stock_transfer_items", "transfer-line/1", stock_transfer_id=uid("transfer/1"),
          product_id=products[0], quantity=2, notes=NOTE)
    child("stock_audit_items", "audit-line/1", stock_audit_id=uid("audit/1"),
          product_id=products[0], location_id=loc[0], system_quantity=stones[0][2],
          counted_quantity=None, discrepancy=0, status="pending", count_sequence=0,
          review_status="not_required", recount_generation=0, notes=NOTE)

    # The source only manufactures assembly products. Add a separate zero-stock
    # output/BOM/draft; the unapplied standard-product work/1 example was invalid.
    assembly = add("products", "product/assembly", sku="HMG-SYN-ASSEMBLY-001",
                   name="Synthetic Carrara Vanity Assembly", description=NOTE,
                   category_id=cats["Marble"], location_id=loc[0], type="assembly",
                   tracking_type="none", has_variants=False, stock=0, currency="INR",
                   price="0", selling_price="0", purchase_price="0", is_active=True, notes=NOTE)
    child("product_components", "component/assembly/1", parent_product_id=assembly,
          component_product_id=products[0], quantity=1, sort_order=0, notes=NOTE)
    work = add("work_orders", "work/2", work_order_number="SYN-WO-002",
               product_id=assembly, created_by=QA_USER, warehouse_id=wh[0], quantity=2,
               quantity_produced=0, status="draft", notes=NOTE)
    child("work_order_items", "work-line/2", work_order_id=work,
          product_id=products[0], quantity_required=2, quantity_consumed=0)

    for i in (4, 6):
        add("warehouse_reorder_points", "reorder/"+str(i), product_id=products[i],
            warehouse_id=wh[0], reorder_point=stones[i][5], reorder_quantity=20,
            min_stock=stones[i][5], max_stock=100)
    add("saved_reports", "report/1", created_by=QA_USER,
        name="Synthetic stone inventory register", description=NOTE, data_source="products",
        columns=["name", "sku", "stock", "type"], filters=[],
        sort={"field": "name", "direction": "asc"}, is_shared=False)
    # This explicitly describes a fixture, not a fabricated user action/audit proof.
    add("activity_logs", "activity/fixture", subject_type="products", subject_id=assembly,
        action="synthetic_fixture", category="audit", description=NOTE,
        properties={"synthetic": True, "purpose": "Read-only sample activity; not a business event."})

    # Manual pending shipment: lines are planned only, no label/tracking/send.
    shipment = add("shipments", "shipment/1", order_id=uid("order/1"),
                   warehouse_id=wh[0], created_by=QA_USER, carrier="manual",
                   carrier_name="Synthetic manual dispatch", status="pending",
                   notify_customer=False, currency="INR")
    child("shipment_items", "shipment-line/1", shipment_id=shipment,
          order_item_id=uid("order-line/1"), quantity=1)
    # Returns deliberately absent: there is no draft enum and these orders have
    # no shipped coverage. Do not fabricate shipment/stock history for eligibility.
    return data


def migration_acceptance_fixtures(actor_id):
    """Fresh isolated input fixtures, not stock postings or completed workflows.

    Reuse the existing fixture relationships but never opening balances,
    payments, adjustments, schedules or outbound notifications.
    """
    from uuid import UUID
    UUID(actor_id)
    allowed={'organizations','product_categories','warehouses','product_locations',
             'customers','suppliers','products','orders','order_items','purchase_orders',
             'purchase_order_items','stock_transfers','stock_transfer_items','stock_audits','stock_audit_items'}
    data={t:copy.deepcopy(rows) for t,rows in fixtures().items() if t in allowed}
    data['products']=[r for r in data['products'] if r.get('type')=='standard']
    mapping={r['id']:str(uuid5(NAMESPACE_URL,'hmg-studio/migration-acceptance/2026-11-10/'+r['id'])) for rows in data.values() for r in rows}
    mapping[QA_USER]=actor_id
    def remap(value):
        if isinstance(value,dict):return {k:remap(v) for k,v in value.items()}
        if isinstance(value,list):return [remap(v) for v in value]
        if isinstance(value,str):return mapping.get(value,value)
        return value
    data=remap(data)
    for table,rows in data.items():
        for row in rows:
            for key in ('sku','code','slug','order_number','po_number','transfer_number','audit_number'):
                if row.get(key):row[key]='QA-MIG-20261110-'+row[key]
            for key in ('name','title'):
                if row.get(key):row[key]='QA ONLY - '+row[key]
            for key in ('notes','description'):
                if key in row:row[key]='QA MIGRATION ACCEPTANCE: input fixture only; no executed workflow. '+row[key]
            if table=='products':row['stock']=0
            if table=='stock_audit_items':row['system_quantity']=0
            if table=='orders':row.update(status='pending',stock_committed=False,amount_paid='0',payment_status='unpaid')
    data['organizations'][0].update(name='QA ONLY - HMG migration acceptance 20261110',slug='qa-hmg-migration-20261110',settings={'dataset_kind':'test','purpose':'unposted migration acceptance'})
    return data


STRUCTURED_FIELDS = {
    "saved_reports": {"columns": "columns_json", "filters": "filters_json", "sort": "sort_json"},
    "activity_logs": {"properties": "properties_json"},
}


def _json_equal(left, right):
    # Canonical encoding ignores object-key order but distinguishes true from 1.
    # Reject non-finite and non-JSON values rather than hiding invalid fixtures.
    return json.dumps(left, sort_keys=True, allow_nan=False) == json.dumps(right, sort_keys=True, allow_nan=False)


def fixture_wire(table, row):
    """Convert logical fixtures to confirmed native fields, never legacy TEXT."""
    result = copy.deepcopy(row)
    mapping = STRUCTURED_FIELDS.get(table, {})
    for legacy, typed in mapping.items():
        value = result.pop(legacy, None)
        valid = (isinstance(value, list) and all(isinstance(x, str) for x in value)) if legacy == "columns" else (
            isinstance(value, list) and all(isinstance(x, dict) for x in value)) if legacy == "filters" else isinstance(value, dict)
        if not valid:
            raise ValueError("Invalid structured fixture shape: " + legacy)
        native = {"items": value} if legacy == "filters" else value
        json.dumps(native, allow_nan=False)
        if typed in result and not _json_equal(result[typed], native):
            raise ValueError("Conflicting typed fixture value")
        result[typed] = native
    return result


def can_skip_fixture(table, expected, actual):
    """Accept equal legacy or typed rows, but never hide a changed audit value."""
    mapping = STRUCTURED_FIELDS.get(table)
    if not mapping:
        return can_skip(expected, actual)
    try:
        wire = fixture_wire(table, expected)
        normalized = copy.deepcopy(actual)
        for legacy, typed in mapping.items():
            raw = actual.get(legacy)
            parsed = json.loads(raw) if isinstance(raw, str) else raw
            if raw is not None and not _json_equal(parsed, expected[legacy]):
                return False
            if actual.get(typed) is not None:
                if not _json_equal(actual[typed], wire[typed]):
                    return False
                normalized[legacy] = expected[legacy]
            else:
                normalized[legacy] = parsed
        return can_skip(expected, normalized)
    except (ValueError, TypeError):
        return False


def can_skip(expected,actual):
    def equal(value,saved):
        if isinstance(value,(dict,list)):return value==saved
        # Native Taruvi datetime columns return naive ISO text; this fixture
        # contract (and the dashboard) interprets those native values as UTC.
        if isinstance(value,str) and isinstance(saved,str) and "T" in value and "T" in saved:
            try:
                def instant(text):
                    result=datetime.fromisoformat(text.replace("Z","+00:00"))
                    return result.replace(tzinfo=timezone.utc) if result.tzinfo is None else result
                return instant(value)==instant(saved)
            except ValueError:pass
        return str(saved)==str(value) or (isinstance(value,(int,str)) and _decimal_equal(value,saved))
    return all(equal(v,actual.get(k)) for k,v in expected.items() if k not in ("created_at","updated_at"))
def _decimal_equal(a,b):
    try: return Decimal(str(a))==Decimal(str(b))
    except Exception: return False

async def apply():
    from provision_erp import environment
    from restrict_synthetic import scoped_calls
    logging.disable(logging.CRITICAL)
    env=environment(); dataset=fixtures(); report={"organization_id":ORG,"synthetic":True,"created":{},"skipped":{}}
    out=ROOT/"docs/hmg-studio/evidence/synthetic-fixtures.json"
    async with scoped_calls(env) as call:
        def rows(result):
            value=result.get("data",[])
            return value.get("data",value.get("records",[])) if isinstance(value,dict) else value
        # New ERP table read policies must no longer be globally readable.
        existing={"organizations","warehouses","product_locations","product_categories"}
        for table in dataset:
            if table in existing:continue
            result=await call("manage_policies",{"action":"get","policy_id":"resource.datatable_"+table+".vdefault/insurance_hmg-studio"})
            policy=result["data"]["policy"]["resource_policy"]
            for rule in policy["rules"]:
                if rule.get("effect")=="EFFECT_ALLOW" and "*" in rule.get("roles",[]):raise RuntimeError("Unrestricted new-table policy: "+table)
        for table,records in dataset.items():
            old=rows(await call("datatable_data",{"action":"query","table_name":table,"filters":{"id__in":[r["id"] for r in records]},"limit":1000}))
            by_id={r["id"]:r for r in old}
            for row in records:
                if row["id"] in by_id and not can_skip_fixture(table,row,by_id[row["id"]]):raise RuntimeError("Refusing to overwrite changed fixture in "+table)
            missing=[r for r in records if r["id"] not in by_id]
            if missing:await call("datatable_data",{"action":"upsert","table_name":table,"data":[fixture_wire(table,r) for r in missing],"unique_fields":"id","validate":True})
            saved=rows(await call("datatable_data",{"action":"query","table_name":table,"filters":{"id__in":[r["id"] for r in records]},"limit":1000}))
            by_id={r["id"]:r for r in saved}
            if any(r["id"] not in by_id or not can_skip_fixture(table,r,by_id[r["id"]]) for r in records):raise RuntimeError("Readback mismatch: "+table)
            report["created"][table]=[r["id"] for r in missing];report["skipped"][table]=len(records)-len(missing)
            out.write_text(json.dumps(report,indent=2),encoding="utf-8");print("Verified "+table+": "+str(len(records)),flush=True)
    print(json.dumps({"organization_id":ORG,"tables":len(dataset),"rows":sum(map(len,dataset.values()))}))

if __name__=="__main__":
    parser=argparse.ArgumentParser();parser.add_argument("--apply",action="store_true");args=parser.parse_args()
    if args.apply:asyncio.run(apply())
    else:print(json.dumps({"dry_run":True,"organization_id":ORG,"tables":{k:len(v) for k,v in fixtures().items()}}))
