"""Caller-scoped dashboard projection. No writes, credentials or external effects."""
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
import re

def read_rows(sdk, table, organization=None):
    result=[]; seen=set()
    # Page 21 proves exhaustion when exactly 2000 rows filled the first 20.
    # Any further row fails closed, never returning a partial projection.
    for page in range(1,22):
        query=sdk.database.from_(table)
        if organization is not None:query=query.filter("organization_id","eq",organization)
        reply=query.sort("id","asc").page(page).page_size(100).execute()
        rows=reply.get("data") if isinstance(reply,dict) else None
        if not isinstance(rows,list): raise ValueError("Invalid query")
        for row in rows:
            if not isinstance(row,dict) or not row.get("id") or row["id"] in seen:raise ValueError("Invalid pagination")
            if organization is not None and row.get("organization_id")!=organization:raise ValueError("Query scope mismatch")
            if len(result)>=2000:raise ValueError("Projection limit exceeded")
            seen.add(row["id"]);result.append(row)
        if len(rows)<100:return [r for r in result if not r.get("deleted_at")]
    raise ValueError("Projection limit exceeded")

def read_scoped_rows(sdk, table, organizations):
    result=[];seen=set()
    for organization in organizations:
        for row in read_rows(sdk,table,organization):
            if row['id'] in seen or len(result)>=2000:raise ValueError("Projection limit exceeded or duplicate row")
            seen.add(row['id']);result.append(row)
    return result


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

def ledger_projection(sdk, organization):
    response = sdk.functions.execute('hmg-stock-ledger-v1', params={
        'action':'state', 'organization_id':organization}, is_async=False)
    reply = response.get('data') if isinstance(response,dict) else None
    if not isinstance(reply,dict) or reply.get('ok') is not True or reply.get('code') != 'STATE' or 'commerce_v2' not in reply.get('capabilities',[]):
        raise ValueError('Ledger unavailable')
    state=reply.get('state')
    if not isinstance(state,dict) or state.get('organization_id') != organization or not re.fullmatch('[0-9a-f]{64}',state.get('head','')):
        raise ValueError('Invalid ledger scope')
    if not isinstance(state.get('balances'),list) or not isinstance(state.get('documents'),dict):
        raise ValueError('Incomplete ledger')
    totals={};seen=set()
    for row in state['balances']:
        key=(row['product_id'],row['location_id'])
        if key in seen or any(type(row.get(k)) is not int or row[k]<0 for k in ('quantity','reserved')) or row['reserved']>row['quantity']:
            raise ValueError('Invalid ledger balance')
        seen.add(key);totals[key[0]]=totals.get(key[0],0)+row['quantity']
    orders=[]
    for key,doc in state['documents'].items():
        if doc['id'] != key:raise ValueError('Invalid document identity')
        if doc['kind'] != 'sales_order':continue
        draft=doc['draft'];customer=draft.get('customer_id')
        name=doc['snapshots']['customers'][customer]['name'] if customer else draft['customer_name']
        orders.append({'id':key,'organization_id':organization,'order_number':doc['number'],
                       'currency':draft['currency'],'status':doc['status'],'total':doc['total'],
                       'order_date':draft['order_date'],'customer_name':name,'ledger':True})
    return totals,orders

def main(params, user_data, sdk_client):
    if not user_data:return {"ok":False,"code":"UNAUTHENTICATED"}
    if not isinstance(params,dict) or any(k not in ("currency","dataset","request","__method__","__function__") for k in params):
        return {"ok":False,"code":"VALIDATION_ERROR"}
    currency=params.get("currency","INR")
    dataset=params.get('dataset','production')
    if not isinstance(dataset,str) or dataset not in ('production','test','all'):
        return {"ok":False,"code":"VALIDATION_ERROR"}
    if not isinstance(currency,str) or not re.fullmatch("[A-Z]{3}",currency):
        return {"ok":False,"code":"VALIDATION_ERROR"}
    try:
        # All reads execute as the caller. An inaccessible dataset is an error,
        # never an invented zero and never an elevated creator-context query.
        organizations=read_rows(sdk_client,'organizations')
        selected=[];unclassified=0;ledger_orgs=[]
        for organization in organizations:
            settings=organization.get('settings')
            kind=settings.get('dataset_kind') if isinstance(settings,dict) else None
            if kind not in ('production','test'):unclassified=unclassified+1
            # 'all' is the single business view: every active caller-visible
            # organization except ones explicitly labelled as test/QA data.
            if (kind==dataset) or (dataset=='all' and organization.get('is_active') is not False and kind!='test'):
                selected.append(organization['id'])
                authority=settings.get('stock_authority') if isinstance(settings,dict) else None
                if authority not in (None,'legacy','ledger_v2'):raise ValueError('Unknown stock authority')
                if authority=='ledger_v2':ledger_orgs.append(organization['id'])
        # A workspace label is data classification, not authorization. All reads
        # still use the caller. Unknown/unreadable organizations never become
        # production implicitly; all panels use the same classified subset.
        products=read_scoped_rows(sdk_client,"products",selected)
        legacy_orgs=[org for org in selected if org not in ledger_orgs]
        orders=[]
        for org in legacy_orgs:
            orders.extend(r for r in read_rows(sdk_client,"orders",org) if r.get("organization_id")==org)
            if len(orders)>2000:raise ValueError("Projection limit exceeded")
        categories=read_scoped_rows(sdk_client,"product_categories",selected)
        locations=read_scoped_rows(sdk_client,"product_locations",selected)
        for org in ledger_orgs:
            if any(r.get('organization_id')==org and r.get('is_active') is True and
                   (r.get('has_variants') is not False or r.get('tracking_type')!='none' or r.get('type')!='standard') for r in products):
                return {"ok":False,"code":"UNSUPPORTED_STOCK"}
            totals,documents=ledger_projection(sdk_client,org)
            products=[{**r,'stock':totals.get(r['id'],0)} if r.get('organization_id')==org else r for r in products]
            orders=[r for r in orders if r.get('organization_id')!=org]+documents
        # Validate scope discriminators before filtering: silently assigning a
        # ledger or treating an unknown active flag as True invents inclusion.
        for row in products+orders:
            row_currency=row.get("currency")
            if not isinstance(row_currency,str) or not re.fullmatch("[A-Z]{3}",row_currency):
                raise ValueError("Missing or invalid row currency")
        if any(type(r.get("is_active")) is not bool for r in products):
            raise ValueError("Missing or invalid active state")
        catalogue=[r for r in products if r['currency']==currency]
        quality={'total':len(catalogue),'inactive':sum(1 for r in catalogue if not r['is_active']),
                 'missing_selling_price':sum(1 for r in catalogue if r.get('selling_price') is None),
                 'missing_image':sum(1 for r in catalogue if not r.get('image'))}
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
        pipeline={};months={}
        for index in range(now.year*12+now.month-6,now.year*12+now.month):
            year,month=divmod(index,12)
            months[f'{year:04d}-{month+1:02d}']={'count':0,'revenue':Decimal('0')}
        for row in orders:
            state=row['status'];group=pipeline.setdefault(state,{'count':0,'value':Decimal('0')})
            group['count']=group['count']+1;group['value']=group['value']+amount(row.get('total'))
            key=order_times[row['id']].strftime('%Y-%m')
            if state in ('shipped','delivered','fulfilled') and key in months:
                months[key]['count']=months[key]['count']+1;months[key]['revenue']=months[key]['revenue']+amount(row.get('total'))
        product_times={r["id"]:timestamp(r.get("created_at"),optional=True) for r in products}
        revenue=sum((amount(r.get("total")) for r in orders if r.get("status") in ("shipped","delivered","fulfilled") and (order_times[r["id"]].year,order_times[r["id"]].month)==(now.year,now.month)),Decimal("0"))
        completed=[r for r in orders if r.get("status") in ("shipped","delivered","fulfilled")]
        fulfilled_value=sum((amount(r.get("total")) for r in completed),Decimal("0"))
        # Legacy rows carry amount_paid. Ledger documents record no payments yet,
        # so every confirmed (approved or fulfilled) order value is outstanding;
        # pending/rejected drafts are not receivables.
        receivables=sum((max(Decimal("0"),amount(r.get("total"))-(Decimal("0") if r.get("ledger") else amount(r.get("amount_paid"))))
                         for r in orders if not r.get("ledger") or r["status"] in ("approved","partially_fulfilled","fulfilled")),Decimal("0"))
        recent=sorted(orders,key=lambda r:(order_times[r["id"]],str(r["id"])),reverse=True)[:5]
        recent_products=sorted(products,key=lambda r:(product_times[r["id"]],str(r["id"])),reverse=True)[:5]
        return {"ok":True,"currency":currency,"dataset":dataset,"unclassified_organizations":unclassified,"generated_at":now.isoformat(),
                "catalogue_quality":quality,
                "order_pipeline":[{'status':k,'count':v['count'],'value':money(v['value'])} for k,v in sorted(pipeline.items())],
                "monthly_sales":[{'month':k,'count':v['count'],'revenue':money(v['revenue'])} for k,v in months.items()],
                "product_count":len(products),"category_count":len(categories),"location_count":len(locations),
                "inventory_value":money(value),"pending_orders":sum(1 for r in orders if r.get("status") in ("pending","processing")),
                "order_count":len(orders),"revenue_month":money(revenue),"receivables":money(receivables),
                "fulfilled_value":money(fulfilled_value),"fulfilled_count":len(completed),
                "open_orders":sum(1 for r in orders if r.get("status") in ("pending","processing","approved","partially_fulfilled","confirmed")),
                "receivables_reason":"Confirmed and fulfilled order value; no customer payments are recorded in the ledger yet." if ledger_orgs else None,
                "sales_basis":"fulfilled_order_value" if ledger_orgs else "shipped_order_value",
                "stock_by_category":[{"name":k,"value":money(v)} for k,v in sorted(groups.items(),key=lambda x:x[1],reverse=True)],
                "low_stock":low[:10],"low_stock_count":len(low),
                "recent_orders":[{k:r.get(k) for k in ("id","organization_id","order_number","customer_name","status","order_date","total","currency")} for r in recent],
                "recent_products":[{k:r.get(k) for k in ("id","sku","name","stock","selling_price","currency")} for r in recent_products],
                "scope":("All caller-visible business workspaces; workspaces labelled as test data are excluded." if dataset=='all' else "Caller-visible "+dataset+" workspaces only; unclassified workspaces excluded.")+" Selected currency. Inventory totals use non-deleted active products; catalogue readiness also includes inactive references. Sales show shipped/delivered or ledger-fulfilled order values by UTC order date, not accounting recognition or cash receipts. Activated organizations use ledger stock and documents exclusively.",
                "limitations":["Warehouse-specific projection and widget preferences are not yet implemented.","Projection refuses datasets over 2000 rows rather than returning partial totals.","Naive native timestamps are interpreted as UTC; products without creation dates sort last."]}
    except (Exception,InvalidOperation):
        return {"ok":False,"code":"DATA_UNAVAILABLE"}

