"""Caller-scoped dashboard projection. No writes, credentials or external effects."""
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
import re

def read_rows(sdk, table):
    result=[]; seen=set()
    # Page 21 proves exhaustion when exactly 2000 rows filled the first 20.
    # Any further row fails closed, never returning a partial projection.
    for page in range(1,22):
        reply=sdk.database.from_(table).sort("id","asc").page(page).page_size(100).execute()
        rows=reply.get("data") if isinstance(reply,dict) else None
        if not isinstance(rows,list): raise ValueError("Invalid query")
        for row in rows:
            if not isinstance(row,dict) or not row.get("id") or row["id"] in seen:raise ValueError("Invalid pagination")
            if len(result)>=2000:raise ValueError("Projection limit exceeded")
            seen.add(row["id"]);result.append(row)
        if len(rows)<100:return [r for r in result if not r.get("deleted_at")]
    raise ValueError("Projection limit exceeded")

def amount(value):
    # Missing facts are unknown, not zero. In particular, a legacy catalogue
    # price is not a substitute for a recorded selling price.
    if value is None or isinstance(value,bool):raise ValueError("Missing or invalid amount")
    number=Decimal(str(value))
    if not number.is_finite():raise ValueError("Nonfinite amount")
    return number

def money(value):
    return str(value.quantize(Decimal("0.01")))

def timestamp(value, optional=False):
    """Parse native ISO dates as UTC instants; legacy naive values mean UTC."""
    if value is None or value=="":
        if optional:return datetime.min.replace(tzinfo=timezone.utc)
        raise ValueError("Missing timestamp")
    if not isinstance(value,str):raise ValueError("Invalid timestamp")
    parsed=datetime.fromisoformat(value.replace("Z","+00:00"))
    if parsed.tzinfo is None:parsed=parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)

def main(params, user_data, sdk_client):
    if not user_data:return {"ok":False,"code":"UNAUTHENTICATED"}
    if not isinstance(params,dict) or any(k not in ("currency","request","__method__","__function__") for k in params):
        return {"ok":False,"code":"VALIDATION_ERROR"}
    currency=params.get("currency","INR")
    if not isinstance(currency,str) or not re.fullmatch("[A-Z]{3}",currency):
        return {"ok":False,"code":"VALIDATION_ERROR"}
    try:
        # All reads execute as the caller. An inaccessible dataset is an error,
        # never an invented zero and never an elevated creator-context query.
        products=read_rows(sdk_client,"products")
        orders=read_rows(sdk_client,"orders")
        categories=read_rows(sdk_client,"product_categories")
        locations=read_rows(sdk_client,"product_locations")
        # Validate scope discriminators before filtering: silently assigning a
        # ledger or treating an unknown active flag as True invents inclusion.
        for row in products+orders:
            row_currency=row.get("currency")
            if not isinstance(row_currency,str) or not re.fullmatch("[A-Z]{3}",row_currency):
                raise ValueError("Missing or invalid row currency")
        if any(type(r.get("is_active")) is not bool for r in products):
            raise ValueError("Missing or invalid active state")
        products=[r for r in products if r["currency"]==currency and r["is_active"]]
        orders=[r for r in orders if r["currency"]==currency]
        if any(not isinstance(r.get("status"),str) or not r["status"].strip() for r in orders):
            raise ValueError("Missing or invalid order status")
        orders=[r for r in orders if r["status"]!="cancelled"]
        names={r["id"]:r.get("name","Uncategorized") for r in categories}
        groups={};value=Decimal("0");low=[]
        for product in products:
            stock=amount(product.get("stock"))
            price=amount(product.get("selling_price"))
            line=stock*price;value+=line
            category=names.get(product.get("category_id"),"Uncategorized")
            groups[category]=groups.get(category,Decimal("0"))+line
            if stock<=amount(product.get("min_stock")):
                low.append({"id":product["id"],"name":product.get("name",""),"sku":product.get("sku",""),"stock":str(stock),"minimum":str(product.get("min_stock",0))})
        now=datetime.now(timezone.utc)
        order_times={r["id"]:timestamp(r.get("order_date")) for r in orders}
        product_times={r["id"]:timestamp(r.get("created_at"),optional=True) for r in products}
        revenue=sum((amount(r.get("total")) for r in orders if r.get("status") in ("shipped","delivered") and (order_times[r["id"]].year,order_times[r["id"]].month)==(now.year,now.month)),Decimal("0"))
        receivables=sum((max(Decimal("0"),amount(r.get("total"))-amount(r.get("amount_paid"))) for r in orders),Decimal("0"))
        recent=sorted(orders,key=lambda r:(order_times[r["id"]],str(r["id"])),reverse=True)[:5]
        recent_products=sorted(products,key=lambda r:(product_times[r["id"]],str(r["id"])),reverse=True)[:5]
        return {"ok":True,"currency":currency,"generated_at":now.isoformat(),
                "product_count":len(products),"category_count":len(categories),"location_count":len(locations),
                "inventory_value":money(value),"pending_orders":sum(1 for r in orders if r.get("status") in ("pending","processing")),
                "order_count":len(orders),"revenue_month":money(revenue),"receivables":money(receivables),
                "stock_by_category":[{"name":k,"value":money(v)} for k,v in sorted(groups.items(),key=lambda x:x[1],reverse=True)],
                "low_stock":low[:10],"low_stock_count":len(low),
                "recent_orders":[{k:r.get(k) for k in ("id","order_number","customer_name","status","order_date","total","currency")} for r in recent],
                "recent_products":[{k:r.get(k) for k in ("id","sku","name","stock","selling_price","currency")} for r in recent_products],
                "scope":"Caller-visible records; selected currency; non-deleted active products. Revenue uses shipped/delivered orders in the current UTC month.",
                "limitations":["Warehouse-specific projection and widget preferences are not yet implemented.","Projection refuses datasets over 2000 rows rather than returning partial totals.","Naive native timestamps are interpreted as UTC; products without creation dates sort last."]}
    except (Exception,InvalidOperation):
        return {"ok":False,"code":"DATA_UNAVAILABLE"}

