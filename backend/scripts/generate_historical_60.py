"""Offline proposal: 60 fictional historical transaction headers, not workflows.

No credentials, network, writes to business data, or live apply mode. Supporting
master/child rows are counted separately. Existing product balances are never
reused. Historical dates, quantities and prices are illustrative synthetic data;
catalogue photographs do not establish the existence of these fictional slabs.
"""
from collections import defaultdict
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal, InvalidOperation
import hashlib
import json
from pathlib import Path
import re
from uuid import NAMESPACE_URL, UUID, uuid5

from seed_erp import ORG, QA_USER, fixtures

ROOT = Path(__file__).resolve().parents[2]
SCHEMA = ROOT / "backend/schema/historical-60-live-schema.json"
PREFLIGHT = ROOT / "backend/schema/historical-60-preflight-readonly.json"
EVIDENCE = ROOT / "docs/hmg-studio/evidence"
OUTPUT = ROOT / "backend/schema/historical-60-plan.json"
NOTE = "SYNTHETIC HISTORICAL FIXTURE - not a real transaction or executed workflow."
START = "2026-05-01T00:00:00Z"
END = "2026-10-31T23:59:59Z"
COUNTS = {"orders": 16, "purchase_orders": 10, "return_orders": 4,
          "stock_adjustments": 8, "stock_transfers": 4, "work_orders": 4,
          "order_payments": 14}
SUPPORT = {"customers": 6, "suppliers": 3, "products": 6,
           "product_components": 2, "product_supplier": 4,
           "order_items": 16, "purchase_order_items": 10,
           "return_order_items": 4, "stock_transfer_items": 4,
           "work_order_items": 4, "work_order_outputs": 4,
           "product_location_stocks": 12}
SOURCES = (
    "106e6587-5cf8-5210-a6d1-f5e76666552b",  # Silver Grey, granite
    "20139035-1687-5c77-8498-c8649c31df6f",  # Golden Eagle, granite
    "140263bc-8967-5fca-a7d9-e9fcbca2560d",  # Calacatta Galena, marble
    "1c2c5882-1b4e-58ba-ac16-cbc2068b9057",  # Bianco Carrara, marble
)


def require(condition, message):
    if not condition:
        raise ValueError(message)


def uid(table, key):
    return str(uuid5(NAMESPACE_URL, f"hmg-studio/historical-60/v1/{table}/{key}"))


def stamp(month, day, hour=9):
    return f"2026-{month:02}-{day:02}T{hour:02}:00:00Z"


def later(value, days=1):
    return (datetime.fromisoformat(value.replace("Z", "+00:00")) + timedelta(days=days)).isoformat().replace("+00:00", "Z")


def number(value):
    require(not isinstance(value, bool), "Boolean is not a monetary/quantity number")
    try:
        result = Decimal(str(value))
    except (InvalidOperation, ValueError):
        raise ValueError("Invalid numeric value") from None
    require(result.is_finite(), "Nonfinite number")
    return result


def money(value):
    return format(number(value).quantize(Decimal("0.01")), "f")


def load_inputs():
    schema = json.loads(SCHEMA.read_text())
    preflight = json.loads(PREFLIGHT.read_text())
    require(schema["app"] == preflight["app"] == "hmg-studio", "Wrong app evidence")
    require(schema["site"] == "insurance.taruvi.cloud" and schema["read_only"] is True, "Wrong site evidence")
    require(not schema.get("errors"), "Schema snapshot incomplete")
    for event in ("RECORD_CREATE", "RECORD_UPDATE", "RECORD_DELETE"):
        result = preflight["subscriptions"][event]
        require(result.get("success") is True and result.get("total") == 0 and result.get("data") == [], "Event subscribers require review")
    for table, rows in preflight["external_rows"].items():
        expected = fixtures()[table][:len(rows)]
        require([r["id"] for r in rows] == [r["id"] for r in expected], "External master IDs changed")
        require(all(r.get("organization_id", ORG) == ORG and not r.get("deleted_at") for r in rows), "External master scope changed")
    for table in COUNTS.keys() | SUPPORT.keys():
        table_schema = schema["schemas"][table]
        require(table_schema["physical_table_name"] == "hmg_studio_" + table, "Physical schema scope mismatch")
        require(table_schema["provider_type"] == "flat_table", "Unexpected table provider")
    return schema, preflight


def verified_images():
    copied = json.loads((EVIDENCE / "hmg-catalogue-media-copy.json").read_text())
    linked = json.loads((EVIDENCE / "hmg-catalogue-media-links.json").read_text())
    plan = json.loads((EVIDENCE / "hmg-catalogue-media-links-plan.json").read_text())
    require(all(d["app_slug"] == "hmg-studio" for d in (copied, linked, plan)), "Media app mismatch")
    require(linked["organization_id"] == plan["organization_id"] == ORG, "Media organization mismatch")
    require(not copied["aborted"] and not linked["aborted"] and not copied["failures"] and not linked["failures"], "Incomplete media evidence")
    require(copied["bucket"] == "products", "Unexpected media bucket")
    mappings = {r["product_id"]: r for r in copied["verified_mappings"]}
    links = {r["id"]: r for r in plan["links"]}
    result = []
    for source_id in SOURCES:
        require(source_id in linked["verified"] and source_id in mappings and source_id in links, "Missing verified media mapping")
        mapping, link = mappings[source_id], links[source_id]
        uri = mapping["storage_uri"]
        require(re.fullmatch(r"storage://products/hmg-catalogue/[0-9a-f]{64}\.(jpg|png|webp)", uri), "Unsafe private URI")
        require(mapping["path"] in copied["verified_paths"] and uri == "storage://products/" + mapping["path"], "Unverified private path")
        require(link["patch"] == {"image": uri} and link["expected"]["image"] == mapping["source_url"], "Media link disagreement")
        result.append({"source_product_id": source_id, "source_name": link["expected"]["name"],
                       "storage_uri": uri, "source_url": mapping["source_url"],
                       "usage": "Illustrative catalogue photograph; not an actual fictional slab photograph."})
    return result


def build_plan():
    snapshot, preflight = load_inputs()
    schemas = {t: s["json_schema"] for t, s in snapshot["schemas"].items()}
    media = verified_images()
    external = preflight["external_rows"]
    locations = [r["id"] for r in external["product_locations"]]
    warehouses = [r["id"] for r in external["warehouses"]]
    categories = {r["name"]: r["id"] for r in external["product_categories"]}
    rows = {}

    def add(table, key, at=START, **values):
        fields = {f["name"]: f for f in schemas[table]["fields"]}
        row = {"id": uid(table, key), **values}
        if "organization_id" in fields:
            row["organization_id"] = ORG
        if "created_at" in fields:
            row["created_at"] = at
        if "updated_at" in fields:
            row["updated_at"] = values.get("updated_at", at)
        for name, field in fields.items():
            if name not in row and field.get("constraints", {}).get("required") and "default" in field:
                row[name] = field["default"]
        rows.setdefault(table, []).append(row)
        return row

    customers = [add("customers", i, name=f"SYNTHETIC Project Client {i+1}", code=f"H60-SYN-C{i+1}",
                     email=f"historical-client-{i+1}@example.invalid", currency="INR", is_active=True,
                     notes=NOTE, credit_limit="0") for i in range(6)]
    suppliers = [add("suppliers", i, name=f"SYNTHETIC Stone Supplier {i+1}", code=f"H60-SYN-S{i+1}",
                     email=f"historical-supplier-{i+1}@example.invalid", currency="INR", is_active=True,
                     notes=NOTE) for i in range(3)]
    products = []
    for i in range(6):
        raw = i < 4
        source = media[i] if raw else None
        p = add("products", i, name=f"SYNTHETIC {source['source_name'] + ' Slab' if raw else 'Vanity Assembly ' + str(i-3)}",
                sku=f"H60-SYN-P{i+1:03}", description=NOTE + " Illustrative catalogue photograph, not physical inventory evidence." if raw else NOTE,
                price=money(1000 + i*250), selling_price=money(1000 + i*250), purchase_price=money(600+i*150 if raw else 2*(600+(i-4)*150)),
                stock=0, min_stock=5, currency="INR", is_active=False, has_variants=False,
                tracking_type="none", type="standard" if raw else "assembly", location_id=locations[0],
                category_id=categories["Granite" if i < 2 else "Marble"], notes=NOTE + " Illustrative INR values; no commercial quotation.",
                barcode=f"H60-SYN-P{i+1:03}", barcode_type="CODE128")
        if raw:
            p["image"] = source["storage_uri"]
            add("product_supplier", i, product_id=p["id"], supplier_id=suppliers[i%3]["id"], cost_price=p["purchase_price"], is_primary=True)
        products.append(p)
    for i in range(2):
        add("product_components", i, parent_product_id=products[4+i]["id"], component_product_id=products[i]["id"], quantity="2", sort_order=0, notes=NOTE)
    for i in range(8):
        delta = 40 if i < 4 else (-1, 2, -1, 2)[i-4]
        at = stamp(5, 1, 8) if i < 4 else stamp((6,7,8,10)[i-4], 10)
        add("stock_adjustments", i, at, product_id=products[i%4]["id"], user_id=QA_USER,
            type="set" if i < 4 else "add" if delta > 0 else "remove", quantity_before=0,
            quantity_after=0, adjustment_quantity=delta, location_id=locations[0],
            reason="Synthetic opening balance" if i < 4 else "Synthetic count correction", notes=NOTE)
    for i, month in enumerate((5,5,6,6,7,7,8,9,10,10)):
        at = stamp(month, 3 if i%2 == 0 else 8)
        p = products[i%4]; quantity = 10 + 2*(i%2); total = money(number(p["purchase_price"])*quantity)
        po = add("purchase_orders", i, at, supplier_id=suppliers[i%3]["id"], created_by=QA_USER,
                 po_number=f"H60-SYN-PO-{i+1:03}", status="received", order_date=at[:10],
                 expected_date=later(at,2)[:10], received_date=later(at,2)[:10], subtotal=total, tax="0.00",
                 shipping="0.00", total=total, currency="INR", approval_status="not_required", notes=NOTE, updated_at=later(at,2))
        add("purchase_order_items", i, at, purchase_order_id=po["id"], product_id=p["id"], product_name=p["name"],
            sku=p["sku"], quantity_ordered=quantity, quantity_received=quantity, unit_cost=p["purchase_price"],
            subtotal=total, tax="0.00", total=total, receiving_location_id=locations[0], notes=NOTE, updated_at=later(at,2))
    for i, month in enumerate((5,6,8,10)):
        at=stamp(month,9); p=products[4+i%2]; component=products[i%2]
        work=add("work_orders", i, at, product_id=p["id"], created_by=QA_USER, warehouse_id=warehouses[0],
                 work_order_number=f"H60-SYN-WO-{i+1:03}", quantity=3, quantity_produced=3, status="completed",
                 started_at=at, completed_at=stamp(month,9,16), updated_at=stamp(month,9,16), notes=NOTE)
        add("work_order_items", i, at, work_order_id=work["id"], product_id=component["id"], quantity_required="6", quantity_consumed="6")
        add("work_order_outputs", i, stamp(month,9,16), work_order_id=work["id"], product_id=p["id"], quantity=3)
        transfer=add("stock_transfers", i, stamp(month,11), transfer_number=f"H60-SYN-TR-{i+1:03}",
                     from_location_id=locations[0], to_location_id=locations[1], from_warehouse_id=warehouses[0],
                     to_warehouse_id=warehouses[1], transferred_by=QA_USER, completed_by=QA_USER,
                     status="completed", is_inter_warehouse=True, prepared_at=stamp(month,11),
                     shipped_at=stamp(month,11,12), stock_dispatched_at=stamp(month,11,12),
                     completed_at=stamp(month,12), updated_at=stamp(month,12), approval_status="not_required", notes=NOTE)
        add("stock_transfer_items", i, stamp(month,11), stock_transfer_id=transfer["id"], product_id=products[i]["id"], quantity=3, notes=NOTE)
    months=(5,5,5,6,6,6,7,7,7,8,8,8,9,9,10,10)
    within_month=defaultdict(int)
    for i, month in enumerate(months):
        day=(14,20,24)[within_month[month]]; within_month[month]+=1
        at=stamp(month,day); p=products[4+i%2] if i in (5,8,11,15) else products[i%4]
        quantity=1 if p["type"]=="assembly" else 2+i%2
        total=money(number(p["price"])*quantity); customer=customers[i%6]
        paid=total if i<12 else money(number(total)/2) if i<14 else "0.00"
        order=add("orders", i, at, order_number=f"H60-SYN-ORD-{i+1:03}", source="manual", customer_id=customer["id"],
                  customer_name=customer["name"], customer_email=customer["email"], status="delivered", subtotal=total,
                  tax="0.00", shipping="0.00", discount_amount="0.00", total=total, currency="INR", order_date=at,
                  shipped_at=later(at), delivered_at=later(at,3), updated_at=later(at,4), warehouse_id=warehouses[0],
                  created_by=QA_USER, approval_status="not_required", stock_committed=True, amount_paid=paid,
                  payment_status="paid" if i<12 else "partial" if i<14 else "unpaid", notes=NOTE + " No shipment/carrier workflow executed.")
        line=add("order_items", i, at, order_id=order["id"], product_id=p["id"], product_name=p["name"], sku=p["sku"],
                 quantity=quantity, unit_price=p["price"], unit_cost=p["purchase_price"], subtotal=total, tax="0.00", total=total, discount_amount="0.00")
        if i<14:
            add("order_payments", i, later(at,4), order_id=order["id"], user_id=QA_USER, type="payment", amount=paid,
                method="bank_transfer", reference=f"H60-SYN-PAY-{i+1:03}", paid_at=later(at,4), notes=NOTE + " No bank movement occurred.")
        if i<4:
            return_at=later(at,7); status=("pending","approved","received","completed")[i]
            ret=add("return_orders", i, return_at, order_id=order["id"], return_number=f"H60-SYN-RET-{i+1:03}", type="return",
                    status=status, reason="Synthetic project size revision", refund_amount=p["price"],
                    notes=NOTE + " Quoted refund only; completion is not a payment refund.")
            if status=="completed":
                ret.update(completed_at=return_at, processed_by=QA_USER)
            add("return_order_items", i, return_at, return_order_id=ret["id"], order_item_id=line["id"], product_id=p["id"],
                quantity=1, condition="new", restock=True, refund_amount=p["price"])
    ledger, balances = calculate_ledger(rows, locations[0], check_adjustments=False)
    adjustments={r["id"]:r for r in rows["stock_adjustments"]}
    for event in ledger:
        if event["table"]=="stock_adjustments":
            adjustments[event["record_id"]].update(quantity_before=event["before"],quantity_after=event["after"])
    for i,p in enumerate(products):
        p["stock"]=sum(balances[(p["id"],location)] for location in locations)
        p["updated_at"]=END
        for j,location in enumerate(locations):
            add("product_location_stocks", f"{i}/{j}", END, product_id=p["id"],location_id=location,quantity=balances[(p["id"],location)])
    plan={"app":"hmg-studio","organization_id":ORG,"label":NOTE,"period":{"start":START,"end":END},
          "business_count":60,"business_counts":dict(COUNTS),"support_counts":dict(SUPPORT),"support_count":sum(SUPPORT.values()),
          "apply_supported":False,"workflow_execution_verified":False,"policy_changes":[],
          "publication":{"stage_inactive":True,"publish_only_after_all_rows_verified":True,
                         "product_ids":[p["id"] for p in products],"patch":{"is_active":True}},
          "limitations":["Historical synthetic snapshots, not executed workflows or audit proof.",
                         "No real payment, refund, carrier purchase, or physical stock is represented.",
                         "Images are illustrative catalogue references, not photos of actual fictional slab instances.",
                         "Platform event subscribers absent at recorded preflight; physical database triggers unverified.",
                         "No cross-table transaction/CAS proof; live insertion needs separate reviewed authority."],
          "schema_sha256":hashlib.sha256(SCHEMA.read_bytes()).hexdigest(),
          "preflight_sha256":hashlib.sha256(PREFLIGHT.read_bytes()).hexdigest(),
          "image_provenance":media,"rows":rows,"stock_ledger":ledger}
    validate_plan(plan)
    return plan


def calculate_ledger(rows, factory, check_adjustments=True):
    """Derive stock movements from snapshot parents/children, never trust a supplied ledger."""
    events=[]
    def event(at,table,parent,product,location,delta,kind):
        quantity=number(delta)
        require(quantity==quantity.to_integral_value(),"Slab ledger requires whole units")
        events.append({"at":at,"table":table,"record_id":parent,"product_id":product,
                       "location_id":location,"delta":int(quantity),"kind":kind})
    for row in rows["stock_adjustments"]:
        event(row["created_at"],"stock_adjustments",row["id"],row["product_id"],row["location_id"],row["adjustment_quantity"],"adjustment")
    for parent in rows["purchase_orders"]:
        for line in rows["purchase_order_items"]:
            if line["purchase_order_id"]==parent["id"]:
                event(parent["received_date"]+"T09:00:00Z","purchase_orders",parent["id"],line["product_id"],line["receiving_location_id"],line["quantity_received"],"receipt")
    for parent in rows["orders"]:
        for line in rows["order_items"]:
            if line["order_id"]==parent["id"]:
                event(parent["shipped_at"],"orders",parent["id"],line["product_id"],factory,-line["quantity"],"sale")
    for parent in rows["return_orders"]:
        if parent["status"] in ("received","completed"):
            for line in rows["return_order_items"]:
                if line["return_order_id"]==parent["id"] and line["restock"]:
                    event(parent.get("completed_at",parent["updated_at"]),"return_orders",parent["id"],line["product_id"],factory,line["quantity"],"restock")
    for parent in rows["stock_transfers"]:
        for line in rows["stock_transfer_items"]:
            if line["stock_transfer_id"]==parent["id"]:
                event(parent["stock_dispatched_at"],"stock_transfers",parent["id"],line["product_id"],parent["from_location_id"],-line["quantity"],"transfer_out")
                event(parent["completed_at"],"stock_transfers",parent["id"],line["product_id"],parent["to_location_id"],line["quantity"],"transfer_in")
    for parent in rows["work_orders"]:
        for table,field,kind,sign in (("work_order_items","quantity_consumed","consume",-1),("work_order_outputs","quantity","produce",1)):
            for line in rows[table]:
                if line["work_order_id"]==parent["id"]:
                    event(parent["started_at"] if sign<0 else parent["completed_at"],"work_orders",parent["id"],line["product_id"],factory,number(line[field])*sign,kind)
    balances=defaultdict(int); adjustments={r["id"]:r for r in rows["stock_adjustments"]}
    for item in sorted(events,key=lambda e:(e["at"],e["record_id"],e["kind"],e["product_id"])):
        key=(item["product_id"],item["location_id"]);item["before"]=balances[key]; balances[key]+=item["delta"];item["after"]=balances[key]
        require(item["after"]>=0,"Negative chronological location balance")
        if item["table"]=="stock_adjustments" and check_adjustments:
            row=adjustments[item["record_id"]]
            require((row["quantity_before"],row["quantity_after"])==(item["before"],item["after"]),"Adjustment before/after mismatch")
    return sorted(events,key=lambda e:(e["at"],e["record_id"],e["kind"],e["product_id"])),balances


def validate_plan(plan):
    snapshot,preflight=load_inputs();rows=plan["rows"]
    require(plan["app"]=="hmg-studio" and plan["organization_id"]==ORG,"Plan scope mismatch")
    require(plan["business_count"]==60 and plan["business_counts"]==COUNTS,"Wrong business total")
    require(plan["support_counts"]==SUPPORT and plan["support_count"]==sum(SUPPORT.values()),"Wrong support total")
    require(plan["apply_supported"] is False and plan["workflow_execution_verified"] is False and plan["policy_changes"]==[],"Invalid authority claim")
    require(plan["period"]=={"start":START,"end":END} and plan["label"]==NOTE,"Missing synthetic provenance")
    require(plan["publication"]=={"stage_inactive":True,"publish_only_after_all_rows_verified":True,
                                  "product_ids":[uid("products",i) for i in range(6)],"patch":{"is_active":True}},"Unexpected publication plan")
    require(plan["schema_sha256"]==hashlib.sha256(SCHEMA.read_bytes()).hexdigest() and plan["preflight_sha256"]==hashlib.sha256(PREFLIGHT.read_bytes()).hexdigest(),"Evidence changed")
    require(set(rows)==COUNTS.keys()|SUPPORT.keys(),"Unexpected table")
    require(all(len(rows[t])==n for t,n in {**COUNTS,**SUPPORT}.items()),"Wrong row counts")
    schemas={t:s["json_schema"] for t,s in snapshot["schemas"].items()}
    indexes={t:{r["id"]:r for r in records} for t,records in rows.items()}
    all_ids=[r["id"] for records in rows.values() for r in records]
    require(len(set(all_ids))==len(all_ids),"Duplicate ID")
    require(not set(all_ids)&{r["id"] for records in fixtures().values() for r in records},"Existing fixture collision")
    external={t:{r["id"] for r in records} for t,records in preflight["external_rows"].items()}
    external["auth_user"]={QA_USER}
    start=datetime.fromisoformat(START.replace("Z","+00:00")); end=datetime.fromisoformat(END.replace("Z","+00:00"))
    for table,records in rows.items():
        fields={f["name"]:f for f in schemas[table]["fields"]}
        for index,row in enumerate(records):
            key=f"{index//2}/{index%2}" if table=="product_location_stocks" else index
            require(row["id"]==uid(table,key),"ID outside exact deterministic fixture namespace")
            require(set(row)<=set(fields),"Unknown field: "+table)
            if "organization_id" in fields:
                require(row.get("organization_id")==ORG,"Row outside synthetic organization")
            for name,field in fields.items():
                value=row.get(name); constraints=field.get("constraints",{})
                require(value is not None or not constraints.get("required"),"Missing required field: "+table+"."+name)
                if value is None: continue
                kind=field["type"]
                require(kind!="any","Legacy any values deliberately excluded")
                if kind=="string":
                    require(isinstance(value,str),"Expected string")
                    require(len(value)<=constraints.get("maxLength",100000),"String too long")
                    if field.get("format")=="uuid": UUID(value)
                elif kind=="integer": require(type(value) is int,"Expected integer")
                elif kind=="boolean": require(type(value) is bool,"Expected boolean")
                elif kind=="number": number(value)
                elif kind in ("date","datetime"):
                    try:
                        require(isinstance(value,str) and bool(re.fullmatch(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z" if kind=="datetime" else r"\d{4}-\d{2}-\d{2}",value)),"Noncanonical UTC date")
                        parsed=datetime.fromisoformat(value.replace("Z","+00:00")) if kind=="datetime" else datetime.combine(date.fromisoformat(value),datetime.min.time(),timezone.utc)
                        require(parsed.tzinfo is not None and start<=parsed<=end,"Date outside historical window")
                    except (TypeError,ValueError): raise ValueError("Invalid historical date") from None
                else: raise ValueError("Unexpected field type")
                if "enum" in constraints: require(value in constraints["enum"],"Invalid enum")
                if "minimum" in constraints: require(number(value)>=number(constraints["minimum"]),"Below minimum")
                if "maximum" in constraints: require(number(value)<=number(constraints["maximum"]),"Above maximum")
            for fk in schemas[table].get("foreignKeys",[]):
                require(len(fk["fields"])==1,"Unsupported compound FK")
                value=row.get(fk["fields"][0]);target=fk["reference"]["resource"].removeprefix("hmg_studio_")
                if value is not None: require(value in indexes.get(target,{}) or value in external.get(target,set()),"Unapproved FK")
            require(row.get("updated_at",row["created_at"])>=row["created_at"],"Reversed row dates")
            require(not any(key in row for key in ("voided_at","voided_by","void_reason","invoice_sent_at","invoice_sent_to","invoice_queued_at","sent_at","sent_to","queued_at")),"Unsupported external delivery or void semantics")
    require(plan["image_provenance"]==verified_images(),"Image provenance changed")
    for i,p in enumerate(rows["products"]):
        require(p["name"].startswith("SYNTHETIC") and NOTE in p["description"],"Unlabelled product")
        require(p["is_active"] is False,"Products must stage inactive")
        require(p["stock"]>=0 and p["tracking_type"]=="none" and p["type"]==("standard" if i<4 else "assembly"),"Invalid product snapshot")
        if i<4: require(p.get("image")==plan["image_provenance"][i]["storage_uri"],"Unverified image")
        else: require("image" not in p,"Unreviewed assembly image")
    for table,records in rows.items():
        for row in records:
            if "notes" in row: require(NOTE in row["notes"],"Unlabelled synthetic row")
            for email_field in ("email","customer_email"):
                if email_field in row: require(row[email_field].endswith("@example.invalid"),"Real contact forbidden")
    warehouse=preflight["external_rows"]["warehouses"][0]["id"]
    location_warehouse={r["id"]:r["warehouse_id"] for r in preflight["external_rows"]["product_locations"]}
    for parent_table,child_table,fk,quantity,price in (("orders","order_items","order_id","quantity","unit_price"),("purchase_orders","purchase_order_items","purchase_order_id","quantity_ordered","unit_cost")):
        for parent in rows[parent_table]:
            lines=[r for r in rows[child_table] if r[fk]==parent["id"]]
            require(len(lines)==1,"Expected exactly one synthetic line")
            subtotal=Decimal(0)
            for line in lines:
                require(line[quantity]>0,"Invalid line quantity")
                amount=number(line[quantity])*number(line[price]); require(amount>0,"Invalid illustrative price")
                require(number(line["subtotal"])==number(line["total"])==amount and number(line["tax"])==0,"Line total mismatch")
                subtotal+=amount
            require(number(parent["subtotal"])==number(parent["total"])==subtotal and number(parent["tax"])==number(parent["shipping"])==0,"Header total mismatch")
            require(parent["currency"]=="INR","Currency mismatch")
            if parent_table=="orders":
                require(parent["warehouse_id"]==warehouse,"Order warehouse differs from ledger")
                require(parent["order_date"]<=parent["shipped_at"]<=parent["delivered_at"],"Invalid order chronology")
                require(parent["status"]=="delivered" and parent["stock_committed"] is True,"Invalid order stock snapshot")
                payments=[r for r in rows["order_payments"] if r["order_id"]==parent["id"]]
                for payment in payments:
                    require(payment["type"]=="payment" and number(payment["amount"])>0 and payment["paid_at"]>=parent["delivered_at"],"Invalid synthetic payment")
                paid=sum((number(r["amount"]) for r in payments),Decimal(0))
                require(paid==number(parent["amount_paid"]) and 0<=paid<=subtotal,"Payment total mismatch")
                require(parent["payment_status"]==("paid" if paid==subtotal else "partial" if paid else "unpaid"),"Payment status mismatch")
            else:
                require(parent["status"]=="received" and parent["order_date"]<=parent["received_date"],"Invalid receipt snapshot")
                require(all(r["quantity_received"]==r["quantity_ordered"] for r in lines),"Received quantity mismatch")
                require(all(r["updated_at"][:10]>=parent["received_date"] for r in lines),"Received item predates receipt")
    for parent in rows["return_orders"]:
        order=indexes["orders"][parent["order_id"]]
        require(parent["created_at"]>=order["delivered_at"],"Return before delivery")
        lines=[r for r in rows["return_order_items"] if r["return_order_id"]==parent["id"]]
        require(len(lines)==1,"Return line count mismatch")
        for line in lines:
            original=indexes["order_items"][line["order_item_id"]]
            require(original["order_id"]==parent["order_id"] and original["product_id"]==line["product_id"],"Return source mismatch")
            require(0<line["quantity"]<=original["quantity"] and line["condition"]=="new" and line["restock"] is True,"Invalid restock snapshot")
            require(number(parent["refund_amount"])==number(line["refund_amount"])==number(original["unit_price"])*line["quantity"],"Return quote mismatch")
    for parent in rows["work_orders"]:
        require(parent["warehouse_id"]==warehouse,"Work warehouse differs from ledger")
        require(parent["status"]=="completed" and parent["quantity"]==parent["quantity_produced"]>0 and parent["started_at"]<=parent["completed_at"],"Invalid work snapshot")
        bom=[r for r in rows["product_components"] if r["parent_product_id"]==parent["product_id"]]
        lines=[r for r in rows["work_order_items"] if r["work_order_id"]==parent["id"]]
        outputs=[r for r in rows["work_order_outputs"] if r["work_order_id"]==parent["id"]]
        require(len(bom)==len(lines)==len(outputs)==1,"Invalid assembly support")
        require(lines[0]["product_id"]==bom[0]["component_product_id"] and number(lines[0]["quantity_required"])==number(lines[0]["quantity_consumed"])==number(bom[0]["quantity"])*parent["quantity"],"BOM consumption mismatch")
        require(outputs[0]["product_id"]==parent["product_id"] and outputs[0]["quantity"]==parent["quantity_produced"],"Assembly output mismatch")
        require(number(indexes["products"][parent["product_id"]]["purchase_price"])==number(bom[0]["quantity"])*number(indexes["products"][bom[0]["component_product_id"]]["purchase_price"]),"Synthetic component cost mismatch")
    for parent in rows["stock_transfers"]:
        require(parent["status"]=="completed" and parent["from_location_id"]!=parent["to_location_id"] and parent["prepared_at"]<=parent["stock_dispatched_at"]<=parent["completed_at"],"Invalid transfer snapshot")
        require(parent["from_warehouse_id"]==location_warehouse[parent["from_location_id"]] and parent["to_warehouse_id"]==location_warehouse[parent["to_location_id"]],"Transfer warehouse/location mismatch")
        require(parent["is_inter_warehouse"] is (parent["from_warehouse_id"]!=parent["to_warehouse_id"]),"Transfer inter-warehouse mismatch")
        lines=[r for r in rows["stock_transfer_items"] if r["stock_transfer_id"]==parent["id"]]
        require(len(lines)==1 and lines[0]["quantity"]>0,"Invalid transfer quantity")
    for index,row in enumerate(rows["stock_adjustments"]):
        delta=row["adjustment_quantity"]
        require(delta!=0 and row["quantity_after"]-row["quantity_before"]==delta,"Invalid adjustment arithmetic")
        require(row["type"]==("set" if index<4 else "add" if delta>0 else "remove"),"Invalid adjustment type/sign")
        if index<4: require(row["quantity_before"]==0 and delta>0,"Invalid opening balance")
    factory=preflight["external_rows"]["product_locations"][0]["id"]
    ledger,balances=calculate_ledger(rows,factory)
    require(ledger==plan["stock_ledger"],"Ledger mismatch")
    bins={}
    for row in rows["product_location_stocks"]:
        key=(row["product_id"],row["location_id"])
        require(key not in bins and row["quantity"]==balances[key],"Location balance mismatch")
        bins[key]=row["quantity"]
    for p in rows["products"]:
        require(p["stock"]==sum(q for (product,_),q in bins.items() if product==p["id"]),"Product stock mismatch")


if __name__=="__main__":
    proposal=build_plan()
    OUTPUT.write_text(json.dumps(proposal,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({"path":str(OUTPUT.relative_to(ROOT)),"business_count":proposal["business_count"],
                      "support_count":proposal["support_count"],"live_writes":0,"workflow_execution_verified":False}))
