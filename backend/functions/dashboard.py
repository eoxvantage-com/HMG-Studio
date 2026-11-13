"""Caller-scoped dashboard projection. No writes, credentials or external effects."""
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
import json
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
    return totals,orders,state

# Operating targets agreed with the workspace owner (13 Nov 2026).
DELIVERY_TARGET_DAYS=7
APPROVAL_WAIT_DAYS=2
RETURN_WAIT_DAYS=3
# Delivery time is only measured for orders recorded within this many days of
# their order date. Backfilled history has no real shipping timestamps.
LIVE_ENTRY_DAYS=2
LEDGER_MAX_EVENTS=200
OPEN_SALES=('approved','partially_fulfilled')
OPEN_PURCHASES=('pending','approved','partially_received')
SEVERITY_RANK={'critical':0,'warning':1,'info':2}

def day_of(value):
    """Calendar day (UTC) of a YYYY-MM-DD order date or an ISO timestamp."""
    return timestamp(value if 'T' in value else value+'T00:00:00+00:00').date()

def percent(part,whole):
    return None if not whole else str((Decimal(part)*100/Decimal(whole)).quantize(Decimal('0.1')))

def metric(label,kind,value):
    return {'label':label,'kind':kind,'value':value if value is None or isinstance(value,str) else str(value)}

def worst(statuses):
    known=[s for s in statuses if s!='none']
    return 'risk' if 'risk' in known else 'watch' if 'watch' in known else 'good' if known else 'none'

def doc_name(doc):
    draft=doc['draft'];customer=draft.get('customer_id');supplier=draft.get('supplier_id')
    if customer:return doc['snapshots']['customers'][customer]['name']
    if supplier:return (doc['snapshots'].get('suppliers') or {}).get(supplier,{}).get('name') or 'Supplier'
    return draft.get('customer_name') or 'Customer'

def build_analysis(now,currency,products,ledgers,deliveries=None):
    """Operational analysis from verified ledger documents and active products only.

    Nothing is estimated: a figure with no underlying records is None, and the
    frontend shows it as not available rather than zero. Delivery time uses a
    recorded order_deliveries date when one exists; otherwise the ledger ship
    time for orders entered on their order date.
    """
    recorded={}
    for row in deliveries or []:
        if row.get('deleted_at') or not row.get('document_id') or not row.get('delivered_on'):continue
        if row['document_id'] in recorded:raise ValueError('Duplicate delivery record')
        recorded[row['document_id']]=row
    sources={'recorded':0,'backfill':0,'ledger':0}
    today=now.date()
    month_keys=[]
    for index in range(now.year*12+now.month-6,now.year*12+now.month):
        year,month=divmod(index,12);month_keys.append(f'{year:04d}-{month+1:02d}')
    trend={k:{'month':k,'revenue':Decimal('0'),'orders':0,'units_shipped':0,'units_returned':0,'delivery_days':[]} for k in month_keys}
    alerts=[];late=[];delivery_days=[];excluded=0
    ordered_units=0;shipped_units=0;open_value=Decimal('0');open_count=0;pending_approval=0;pending_sales=0
    entitled_units=0;returned_units=0;returns={'pending':0,'posted':0,'rejected':0}
    po_open=0;po_overdue=0;po_open_value=Decimal('0')
    product_revenue={};demand={};free={};on_hand_units=0;reserved_units=0;capacity_used=0
    names={p['id']:p.get('name') or p.get('sku') or 'Product' for p in products}
    tracked={p['id'] for p in products}
    for org,state in ledgers:
        capacity_used=max(capacity_used,state.get('sequence',-1)+1)
        for row in state['balances']:
            if row['product_id'] not in tracked:continue
            free[row['product_id']]=free.get(row['product_id'],0)+row['quantity']-row['reserved']
            on_hand_units=on_hand_units+row['quantity'];reserved_units=reserved_units+row['reserved']
        documents=state['documents']
        for doc in documents.values():
            draft=doc['draft']
            if draft['currency']!=currency or doc['status']=='cancelled':continue
            status=doc['status'];order_day=day_of(draft['order_date']);created=timestamp(doc['created_at']);updated=timestamp(doc['updated_at'])
            for product_id,snapshot in (doc['snapshots'].get('products') or {}).items():
                names.setdefault(product_id,snapshot.get('name') or snapshot.get('sku') or 'Product')
            link_base=('/orders/show/' if doc['kind']=='sales_order' else '/purchase-orders/show/')+doc['id']+'?organization='+org
            if status=='pending' and (now-created).days>=APPROVAL_WAIT_DAYS:
                pending_approval=pending_approval+1
                alerts.append({'severity':'warning','kind':'approval','title':doc['number']+' waiting for approval',
                               'detail':f"{doc_name(doc)} · entered {(now-created).days} days ago (target {APPROVAL_WAIT_DAYS})",
                               'link':link_base,'age_days':(now-created).days})
            if doc['kind']=='purchase_order':
                if status in OPEN_PURCHASES:
                    po_open=po_open+1;po_open_value=po_open_value+amount(doc['total'])
                    expected=draft.get('expected_date')
                    if expected and status!='pending' and day_of(expected)<today:
                        po_overdue=po_overdue+1;age=(today-day_of(expected)).days
                        alerts.append({'severity':'critical','kind':'purchase_overdue','title':doc['number']+' delivery overdue',
                                       'detail':f"{doc_name(doc)} · expected {expected}, {age} days late",'link':link_base,'age_days':age})
                continue
            if doc['kind']!='sales_order':continue
            quantities={item['line_id']:item['quantity'] for item in draft['items']}
            prices={item['line_id']:Decimal(item['unit_price']) for item in draft['items']}
            products_by_line={item['line_id']:item['product_id'] for item in draft['items']}
            shipped_by_line={}
            for key,value in doc['fulfilled'].items():
                line=json.loads(key)[0];shipped_by_line[line]=shipped_by_line.get(line,0)+value
            shipped=sum(shipped_by_line.values())
            month=order_day.strftime('%Y-%m')
            if month in trend and status!='rejected':
                bucket=trend[month];bucket['orders']=bucket['orders']+1;bucket['units_shipped']=bucket['units_shipped']+shipped
                if status=='fulfilled':bucket['revenue']=bucket['revenue']+amount(doc['total'])
            for line,units in shipped_by_line.items():
                product_id=products_by_line[line];entry=product_revenue.setdefault(product_id,{'units':0,'revenue':Decimal('0')})
                entry['units']=entry['units']+units;entry['revenue']=entry['revenue']+prices[line]*units
            if status in ('approved','partially_fulfilled','fulfilled'):
                ordered_units=ordered_units+sum(quantities.values());shipped_units=shipped_units+shipped
            if status=='pending':
                pending_sales=pending_sales+1
                for line,units in quantities.items():
                    demand[products_by_line[line]]=demand.get(products_by_line[line],0)+units
            if status in OPEN_SALES or status=='pending':
                open_count=open_count+1;open_value=open_value+amount(doc['total'])
            if status in OPEN_SALES:
                age=(today-order_day).days
                if age>DELIVERY_TARGET_DAYS:
                    late.append({'id':doc['id'],'organization_id':org,'number':doc['number'],'customer':doc_name(doc),'age_days':age,'total':doc['total']})
                    alerts.append({'severity':'critical' if age>2*DELIVERY_TARGET_DAYS else 'warning','kind':'late_shipment',
                                   'title':doc['number']+' not shipped','detail':f"{doc_name(doc)} · {age} days since order (target {DELIVERY_TARGET_DAYS})",
                                   'link':link_base,'age_days':age})
            if status=='fulfilled':
                row=recorded.get(doc['id'])
                if row and row.get('organization_id')==org:
                    days=(day_of(row['delivered_on'])-order_day).days
                    if days<0:raise ValueError('Delivery before order date')
                    delivery_days.append(days);source=row.get('source') if row.get('source') in ('recorded','backfill') else 'recorded'
                    sources[source]=sources[source]+1
                    if month in trend:trend[month]['delivery_days']=trend[month]['delivery_days']+[days]
                elif (created.date()-order_day).days<=LIVE_ENTRY_DAYS:
                    days=max(0,(updated.date()-order_day).days);delivery_days.append(days);sources['ledger']=sources['ledger']+1
                    if month in trend:trend[month]['delivery_days']=trend[month]['delivery_days']+[days]
                else:excluded=excluded+1
        for entitlement in state.get('entitlements',{}).values():
            doc=documents.get(entitlement.get('document_id'))
            if doc and doc['draft']['currency']==currency:
                entitled_units=entitled_units+entitlement['quantity'];returned_units=returned_units+entitlement['returned']
        for request_id,request in state.get('requests',{}).items():
            command=request['command']
            if command.get('action')!='submit_return':continue
            doc=documents.get(command['document_id'])
            if not doc or doc['draft']['currency']!=currency:continue
            status=request['status'];returns[status]=returns.get(status,0)+1
            units=sum(line['quantity'] for line in command['lines'])
            created=timestamp(request['created_at']);month=created.strftime('%Y-%m')
            if month in trend and status!='rejected':trend[month]['units_returned']=trend[month]['units_returned']+units
            if status=='pending' and (now-created).days>=RETURN_WAIT_DAYS:
                alerts.append({'severity':'warning','kind':'return_waiting','title':'Return for '+doc['number']+' waiting',
                               'detail':f"{units} units · submitted {(now-created).days} days ago (target {RETURN_WAIT_DAYS})",
                               'link':'/returns?organization='+org,'age_days':(now-created).days})
    shortfalls=[]
    for product_id,needed in demand.items():
        available=free.get(product_id,0)
        if needed>available:
            shortfalls.append({'id':product_id,'name':names.get(product_id,'Product'),'needed':needed,'free':available})
            alerts.append({'severity':'critical','kind':'stock_shortfall','title':names.get(product_id,'Product')+' short for pending orders',
                           'detail':f"{needed} needed by pending orders · {available} free",'link':'/inventory/show/'+product_id,'age_days':0})
    out_of_stock=[p for p in products if amount(p.get('stock'))<=0]
    low=[p for p in products if amount(p.get('stock'))>0 and amount(p.get('stock'))<=amount(p.get('min_stock'))]
    if out_of_stock:
        alerts.append({'severity':'warning','kind':'out_of_stock','title':f"{len(out_of_stock)} products out of stock",
                       'detail':', '.join(sorted(names.get(p['id'],'Product') for p in out_of_stock)[:4])+(' and more' if len(out_of_stock)>4 else ''),
                       'link':'/replenishment','age_days':0})
    if low:
        alerts.append({'severity':'info','kind':'low_stock','title':f"{len(low)} products at or below minimum",
                       'detail':', '.join(sorted(names.get(p['id'],'Product') for p in low)[:4])+(' and more' if len(low)>4 else ''),
                       'link':'/replenishment','age_days':0})
    if ledgers and capacity_used>=LEDGER_MAX_EVENTS*0.8:
        alerts.append({'severity':'critical' if capacity_used>=LEDGER_MAX_EVENTS*0.95 else 'warning','kind':'ledger_capacity',
                       'title':'Stock ledger nearly full','detail':f"{capacity_used} of {LEDGER_MAX_EVENTS} events used",'link':'/operations','age_days':0})
    alerts.sort(key=lambda a:(SEVERITY_RANK[a['severity']],-a['age_days'],a['title']))
    counts={k:sum(1 for a in alerts if a['severity']==k) for k in SEVERITY_RANK}
    value_cost=Decimal('0');missing_cost=0;value_selling=Decimal('0')
    for p in products:
        stock=amount(p.get('stock'));value_selling=value_selling+stock*amount(p.get('selling_price'))
        if p.get('purchase_price') is None:missing_cost=missing_cost+1
        else:value_cost=value_cost+stock*amount(p.get('purchase_price'))
    delivery_days.sort()
    average=None if not delivery_days else str((Decimal(sum(delivery_days))/len(delivery_days)).quantize(Decimal('0.1')))
    median=None if not delivery_days else str(delivery_days[len(delivery_days)//2])
    on_time=percent(sum(1 for d in delivery_days if d<=DELIVERY_TARGET_DAYS),len(delivery_days))
    buckets=[('0-2 days',0,2),('3-5 days',3,5),('6-7 days',6,7),('8-14 days',8,14),('15+ days',15,10**6)]
    fill_rate=percent(shipped_units,ordered_units);return_rate=percent(returned_units,entitled_units);reserved_rate=percent(reserved_units,on_hand_units)
    has_sales=bool(ordered_units or open_count or delivery_days or excluded)
    def band(value,good,watch,higher_is_better=True):
        if value is None:return 'none'
        number=Decimal(value)
        if higher_is_better:return 'good' if number>=good else 'watch' if number>=watch else 'risk'
        return 'good' if number<=good else 'watch' if number<=watch else 'risk'
    delivery_status=worst([band(average,DELIVERY_TARGET_DAYS,DELIVERY_TARGET_DAYS*1.5,False),'risk' if len(late)>=3 else 'watch' if late else 'good' if has_sales else 'none'])
    stock_status='risk' if shortfalls else 'watch' if out_of_stock or low else 'good' if products else 'none'
    returns_status=worst([band(return_rate,5,10,False),'watch' if any(a['kind']=='return_waiting' for a in alerts) else 'none'])
    segments=[
        {'key':'orders','label':'Orders','value':metric('Open orders','count',open_count),'caption':'open orders',
         'status':('watch' if pending_approval else 'good') if has_sales else 'none','link':'/orders',
         'metrics':[metric('Open order value','money',money(open_value)),metric('Waiting for approval','count',pending_sales),
                    metric(f'Approval older than {APPROVAL_WAIT_DAYS} days','count',pending_approval)]},
        {'key':'fulfilment','label':'Fulfilment','value':metric('Fill rate','percent',fill_rate),'caption':'of confirmed units shipped',
         'status':band(fill_rate,80,50),'link':'/orders',
         'metrics':[metric('Units confirmed','count',ordered_units),metric('Units shipped','count',shipped_units),metric('Shipped this month','money',money(trend[month_keys[-1]]['revenue']))]},
        {'key':'delivery','label':'Days to deliver','value':metric('Average','days',average),'caption':f'average · target {DELIVERY_TARGET_DAYS} days',
         'status':delivery_status,'link':'/orders',
         'metrics':[metric('Late orders','count',len(late)),metric('On time','percent',on_time),metric('Median','days',median),
                    metric('Orders measured','count',len(delivery_days)),metric('Backfilled delivery dates','count',sources['backfill']),metric('No delivery date','count',excluded)]},
        {'key':'returns','label':'Returns','value':metric('Return rate','percent',return_rate),'caption':'of shipped units returned',
         'status':returns_status,'link':'/returns',
         'metrics':[metric('Units shipped','count',entitled_units),metric('Units returned','count',returned_units),metric('Pending returns','count',returns.get('pending',0)),
                    metric('Approved returns','count',returns.get('posted',0))]},
        {'key':'stock','label':'Stock health','value':metric('Out of stock','count',len(out_of_stock)),'caption':'products out of stock',
         'status':stock_status,'link':'/replenishment',
         'metrics':[metric('Low stock','count',len(low)),metric('Short for pending orders','count',len(shortfalls)),metric('Active products','count',len(products))]},
        {'key':'inventory','label':'Inventory','value':metric('Value at selling price','money',money(value_selling)),'caption':'at selling price',
         'status':'good' if products else 'none','link':'/stock-by-warehouse',
         'metrics':[metric('Value at cost','money',money(value_cost)),metric('Products without cost','count',missing_cost),metric('Units on hand','count',on_hand_units),
                    metric('Units reserved','count',reserved_units),metric('Reserved share','percent',reserved_rate)]},
        {'key':'purchasing','label':'Purchasing','value':metric('Open purchase orders','count',po_open),'caption':'open purchase orders',
         'status':'risk' if po_overdue else 'good' if ledgers else 'none','link':'/purchase-orders',
         'metrics':[metric('Overdue deliveries','count',po_overdue),metric('Open PO value','money',money(po_open_value))]},
        {'key':'alerts','label':'Alerts','value':metric('Open alerts','count',len(alerts)),'caption':'need attention',
         'status':'risk' if counts['critical'] else 'watch' if counts['warning'] else 'good','link':'/',
         'metrics':[metric('Critical','count',counts['critical']),metric('Warnings','count',counts['warning']),metric('For information','count',counts['info'])]},
    ]
    top=sorted(product_revenue.items(),key=lambda x:(-x[1]['revenue'],names.get(x[0],'')))[:5]
    return {'targets':{'delivery_days':DELIVERY_TARGET_DAYS,'approval_days':APPROVAL_WAIT_DAYS,'return_days':RETURN_WAIT_DAYS},
            'status':worst([s['status'] for s in segments]),'segments':segments,'alerts':alerts[:25],'alert_counts':counts,
            'trend':[{'month':v['month'],'revenue':money(v['revenue']),'orders':v['orders'],'units_shipped':v['units_shipped'],'units_returned':v['units_returned'],
                      'avg_delivery_days':None if not v['delivery_days'] else str((Decimal(sum(v['delivery_days']))/len(v['delivery_days'])).quantize(Decimal('0.1')))} for v in trend.values()],
            'delivery':{'samples':len(delivery_days),'excluded':excluded,'sources':sources,'average_days':average,'median_days':median,'on_time_rate':on_time,
                        'buckets':[{'label':label,'count':sum(1 for d in delivery_days if low_<=d<=high)} for label,low_,high in buckets],
                        'late':sorted(late,key=lambda x:-x['age_days'])[:10]},
            'top_products':[{'id':k,'name':names.get(k,'Product'),'units':v['units'],'revenue':money(v['revenue'])} for k,v in top],
            'shortfalls':shortfalls[:10],
            'capacity':{'used':capacity_used,'max':LEDGER_MAX_EVENTS} if ledgers else None,
            'basis':'Ledger documents, return requests and stock bins for activated workspaces in the selected currency, plus active products. Delivery time uses recorded delivery dates (order_deliveries, including backfilled history marked as such) or, for orders entered within '+str(LIVE_ENTRY_DAYS)+' days of their order date, the ledger shipment time.'}

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
        ledger_states=[]
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
            totals,documents,ledger_state=ledger_projection(sdk_client,org)
            ledger_states.append((org,ledger_state))
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
        try:
            # Analysis failure is reported, never replaced with estimates or zeros.
            deliveries=[]
            for org,unused_state in ledger_states:
                deliveries.extend(read_rows(sdk_client,'order_deliveries',org))
            analysis=build_analysis(now,currency,products,ledger_states,deliveries)
        except (Exception,InvalidOperation):
            analysis=None
        recent=sorted(orders,key=lambda r:(order_times[r["id"]],str(r["id"])),reverse=True)[:5]
        recent_products=sorted(products,key=lambda r:(product_times[r["id"]],str(r["id"])),reverse=True)[:5]
        return {"ok":True,"currency":currency,"dataset":dataset,"unclassified_organizations":unclassified,"generated_at":now.isoformat(),
                "catalogue_quality":quality,"analysis":analysis,
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

