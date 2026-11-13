"""Private caller-scoped customer/supplier metadata commands.

Reuses validate-contacts-profile-v1; never mutates orders, balances or payments.
Deletion is a tombstone retaining the record and its historical references.
"""
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
from uuid import UUID
import re
import json
import time
import httpx


COMMON = {"name", "code", "contact_name", "email", "phone", "payment_terms", "currency", "notes", "is_active"}
FIELDS = {
    "customers": COMMON | {"company_name", "billing_address", "billing_city", "billing_state", "billing_zip_code",
        "billing_country", "shipping_address", "shipping_city", "shipping_state", "shipping_zip_code",
        "shipping_country", "tax_id", "credit_limit"},
    "suppliers": COMMON | {"address", "city", "state", "zip_code", "country", "website", "rating"},
}
SYSTEM_FIELDS = {"id", "organization_id", "created_at", "updated_at", "deleted_at"}


def failure(code, errors=None):
    return {"ok": False, "verified": False, "code": code, "errors": errors or {}}


def first(sdk, table, filters):
    query = sdk.database.from_(table)
    for key, value in filters.items():
        query = query.filter(key, "eq", value)
    result = query.page_size(1).execute()
    if not isinstance(result, dict) or not isinstance(result.get("data"), list):
        raise ValueError("Invalid native read")
    rows = result["data"]
    if rows and (not isinstance(rows[0], dict) or any(rows[0].get(k) != v for k, v in filters.items())):
        raise ValueError("Unexpected native row")
    return rows[0] if rows else None


def allowed(sdk, table, record_id, action, attrs):
    try:
        decision = sdk.policy.check_resources(resources=[{
            "resource": {"kind": "datatable:" + table, "id": record_id, "attr": attrs},
            "actions": [action],
        }], principal=None)
        return decision["results"][0]["actions"][action] == "EFFECT_ALLOW"
    except Exception:
        return False


def canonical(table, values):
    result = dict(values)
    number = "credit_limit" if table == "customers" else "rating"
    value = result.get(number)
    if value is not None:
        if isinstance(value, bool) or not isinstance(value, (str, int, float, Decimal)):
            raise ValueError("Invalid number")
        source = str(value)
        if len(source) > 64:
            raise ValueError("Invalid number")
        parsed = Decimal(source)
        if not parsed.is_finite() or parsed < 0 or abs(parsed.as_tuple().exponent) > 18 or parsed.adjusted() > 18:
            raise ValueError("Invalid number")
        if number == "rating":
            if parsed != parsed.to_integral_value() or parsed > 5:
                raise ValueError("Invalid rating")
            result[number] = int(parsed)
        else:
            result[number] = format(parsed, "f")
    return result


def validate(sdk, table, values):
    values = dict(values)
    currency = values.get("currency")
    if not isinstance(currency, str) or len(currency.strip()) != 3 or not currency.strip().isascii() or not currency.strip().isalpha():
        return None, failure("VALIDATION_ERROR")
    if type(values.get("is_active")) is not bool:
        return None, failure("VALIDATION_ERROR")
    values["currency"] = currency.strip().upper()
    try:
        response = sdk.functions.execute("validate-contacts-profile-v1", params={"resource": table, "values": values}, is_async=False)
        result = response["data"]
        if result.get("valid") is not True:
            return None, failure("VALIDATION_ERROR", result.get("errors"))
        normalized = result["values"]
        if (not isinstance(normalized, dict) or set(normalized) != set(values) or
                any(k not in FIELDS[table] for k in normalized)):
            return None, failure("VALIDATION_UNAVAILABLE")
        return canonical(table, normalized), None
    except Exception:
        return None, failure("VALIDATION_UNAVAILABLE")


def success(table, record, replayed=False):
    values = canonical(table, {k: v for k, v in record.items() if k in FIELDS[table] | SYSTEM_FIELDS})
    return {"ok": True, "verified": True, "replayed": replayed, "record": values}


def matches(table, row, org, expected):
    if not row or row.get("organization_id") != org or row.get("deleted_at") is not None:
        return False
    actual, expected = canonical(table, row), canonical(table, expected)
    for key, value in expected.items():
        if key == "credit_limit" and value is not None and actual.get(key) is not None:
            if Decimal(actual[key]) == Decimal(value):
                continue
        if actual.get(key) != value:
            return False
    return True


def same_instant(value, expected):
    try:
        # Verified native serialization omits UTC offset; require full time,
        # preserve exact microseconds, and never infer UTC for date-only input.
        if not re.fullmatch(r"[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]{1,6})?(?:Z|[+-][0-9]{2}:[0-9]{2})?", value):
            return False
        actual = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if actual.tzinfo is None:
            actual = actual.replace(tzinfo=timezone.utc)
        expected_time = datetime.fromisoformat(expected.replace("Z", "+00:00"))
        return expected_time.tzinfo is not None and actual == expected_time
    except (ValueError, TypeError, AttributeError):
        return False


def main(params, user_data, sdk_client):
    if not isinstance(user_data, dict) or not user_data:
        return failure("UNAUTHENTICATED")
    keys = {"resource", "action", "organization_id", "request_id", "values", "request", "__function__", "__method__"}
    if not isinstance(params, dict) or any(k not in keys for k in params):
        return failure("VALIDATION_ERROR")
    table, action = params.get("resource"), params.get("action")
    if isinstance(table, str) and table in METADATA_FIELDS:
        return metadata_main(params, sdk_client)
    if not isinstance(table, str) or table not in FIELDS or action not in ("create", "update", "readback", "delete"):
        return failure("VALIDATION_ERROR")
    try:
        org, record_id = str(UUID(params.get("organization_id", ""))), str(UUID(params.get("request_id", "")))
    except (ValueError, TypeError, AttributeError):
        return failure("VALIDATION_ERROR")
    supplied = params.get("values")
    if action in ("create", "update"):
        if not isinstance(supplied, dict) or not supplied or any(k not in FIELDS[table] for k in supplied):
            return failure("VALIDATION_ERROR")
    elif "values" in params:
        return failure("VALIDATION_ERROR")
    lookup = {"organization_id": org, "id": record_id}
    try:
        if not first(sdk_client, "organizations", {"id": org}):
            return failure("FORBIDDEN")
        existing = first(sdk_client, table, lookup)
    except Exception:
        return failure("FORBIDDEN")
    if existing and not allowed(sdk_client, table, record_id, "read", existing):
        return failure("FORBIDDEN")
    if action == "readback":
        try:
            return success(table, existing) if existing and existing.get("deleted_at") is None else failure("NOT_FOUND")
        except (ValueError, InvalidOperation, TypeError):
            return failure("READBACK_FAILED")
    if action != "create" and not existing:
        return failure("NOT_FOUND")
    if action == "delete":
        if not allowed(sdk_client, table, record_id, "delete", existing):
            return failure("FORBIDDEN")
        deleted = {"ok": True, "verified": True, "deleted": True, "id": record_id}
        if existing.get("deleted_at") is not None:
            return deleted if existing.get("is_active") is False else failure("READBACK_FAILED")
        now = datetime.now(timezone.utc).isoformat(timespec="milliseconds")
        patch = {"deleted_at": now, "updated_at": now, "is_active": False}
    else:
        if existing and existing.get("deleted_at") is not None:
            return failure("CONFLICT" if action == "create" else "NOT_FOUND")
        try:
            previous = canonical(table, {k: v for k, v in (existing or {}).items() if k in FIELDS[table]}) if action == "update" else {}
        except (ValueError, InvalidOperation, TypeError):
            return failure("VALIDATION_ERROR")
        values, error = validate(sdk_client, table, {"currency": "USD", "is_active": True, **previous, **supplied})
        if error:
            return error
        proposed = {**(existing or {}), **values, "organization_id": org}
        if (action == "update" and not allowed(sdk_client, table, record_id, action, existing)) or not allowed(sdk_client, table, record_id, action, proposed):
            return failure("FORBIDDEN")
        if action == "create" and existing:
            try:
                return success(table, existing, True) if matches(table, existing, org, values) else failure("CONFLICT")
            except (ValueError, InvalidOperation, TypeError):
                return failure("READBACK_FAILED")
        patch = values if action == "create" else {k: values[k] for k in supplied if values[k] != previous.get(k)}
        try:
            if patch.get("code") and (not existing or patch["code"] != existing.get("code")):
                if first(sdk_client, table, {"organization_id": org, "code": patch["code"]}):
                    return failure("DUPLICATE_CODE")
            if not patch:
                return success(table, existing)
        except Exception:
            return failure("LOAD_FAILED")
        now = datetime.now(timezone.utc).isoformat(timespec="milliseconds")
        patch = {**patch, "updated_at": now}
    uncertain = False
    try:
        if action == "create":
            sdk_client.database.from_(table).create({**patch, **lookup, "created_at": now, "deleted_at": None}).execute()
        else:
            sdk_client.database.update(table, record_id=record_id, data=patch)
    except Exception:
        uncertain = True
    try:
        saved = first(sdk_client, table, lookup)
        if saved and allowed(sdk_client, table, record_id, "read", saved):
            if action == "delete":
                if saved.get("is_active") is False and same_instant(saved.get("deleted_at"), now):
                    return deleted
            elif matches(table, saved, org, {k: v for k, v in patch.items() if k != "updated_at"}):
                return success(table, saved, uncertain)
    except Exception:
        pass
    return failure("WRITE_UNCONFIRMED" if uncertain else "READBACK_FAILED")


# Separate least-privilege metadata identity; never reuse stock or owner credentials.
METADATA_ORIGIN = "https://hmg-stones.taruvibase.cloud"
METADATA_USER = "svc_hmg_metadata_20261111"
METADATA_ORGS = ("55dcee2a-dea1-4dfc-83ee-9474f7b5815b", "616d839b-e107-4511-b12f-fd6ed301d999", "4166493b-ca74-4117-8a42-a3ec669bbfd0")
METADATA_FIELDS = {
    "product_locations": {"warehouse_id", "name", "code", "description", "aisle", "shelf", "bin", "capacity", "is_active"},
    "warehouses": {"name", "code", "description", "address_line_1", "address_line_2", "city", "province", "postal_code", "country", "phone", "email", "manager_name", "timezone", "currency", "priority", "capacity", "is_active"},
}


def metadata_authorize(sdk, table, org, action, attrs):
    reply = sdk.policy.check_resources(resources=[{
        "resource": {"kind": "function:hmg-contact-master-v1", "id": "hmg-contact-master-v1",
                     "attr": {**attrs, "organization_id": org, "metadata_resource": table, "action": action}},
        "actions": ["execute"]}], principal=None)
    if reply["results"][0]["actions"]["execute"] != "EFFECT_ALLOW":
        raise ValueError("Denied")


def metadata_values(table, values):
    if not isinstance(values, dict) or any(k not in METADATA_FIELDS[table] for k in values):
        raise ValueError("Invalid fields")
    if len(json.dumps(values, ensure_ascii=False, allow_nan=False).encode("utf-8")) > 32768:
        raise ValueError("Input limit")
    result = dict(values)
    for key, value in values.items():
        if key == "is_active":
            if type(value) is not bool:raise ValueError("Invalid boolean")
        elif key in ("capacity", "priority"):
            if value is None and key == "capacity":continue
            if type(value) is not int or not (-2147483648 if key == "priority" else 0) <= value <= 2147483647:
                raise ValueError("Invalid integer")
        elif value is not None:
            if not isinstance(value, str):raise ValueError("Invalid text")
            limit = ({"code":50,"province":255,"postal_code":255,"country":255,"phone":30,"timezone":50,"currency":3}.get(key,4096) if table == "warehouses" else 4096)
            if len(value)>limit:raise ValueError("Text limit")
            result[key] = value.strip()
            if key == "warehouse_id":result[key]=str(UUID(value))
            if key == "currency" and value:
                if not re.fullmatch("[A-Za-z]{3}",value):raise ValueError("Invalid currency")
                result[key]=value.upper()
    if not isinstance(result.get("name"),str) or not result["name"]:raise ValueError("Missing name")
    if type(result.get("is_active")) is not bool:raise ValueError("Missing active")
    return result


def metadata_matches(row, expected):
    # Python bool compares equal to integers: readback must preserve native types.
    return isinstance(row,dict) and all(type(row.get(k)) is type(v) and row.get(k)==v for k,v in expected.items())


def metadata_success(table, row, replay=False):
    fields = METADATA_FIELDS[table] | SYSTEM_FIELDS | ({"is_default"} if table == "warehouses" else set())
    return {"ok": True, "verified": True, "replayed": replay, "record": {k:v for k,v in row.items() if k in fields}}


def metadata_http(client, method, url, deadline, headers=None, payload=None):
    remaining=deadline-time.monotonic()
    if remaining<=0:raise TimeoutError("Deadline")
    response=client.request(method,url,headers=headers,json=payload,timeout=min(3.0,remaining))
    if len(response.content)>1048576:raise ValueError("Response limit")
    return response


def metadata_body(response):
    if not 200<=response.status_code<300:raise ValueError("Native request failed")
    body=response.json()
    if not isinstance(body,dict):raise ValueError("Invalid response")
    return body


def metadata_write(sdk, table, org, record_id, action, patch, expected):
    secret=sdk.secrets.get("hmg_metadata_writer_v1")
    value=secret.get("value") if isinstance(secret,dict) else None
    if isinstance(value,str) and len(value)<=4096:value=json.loads(value)
    if (not isinstance(value,dict) or set(value)!={"username","password"} or value["username"]!=METADATA_USER
            or not isinstance(value["password"],str) or not 12<=len(value["password"])<=1024):raise ValueError("Invalid configuration")
    deadline=time.monotonic()+10
    with httpx.Client(follow_redirects=False,trust_env=False,verify=True) as client:
        token=metadata_body(metadata_http(client,"POST",METADATA_ORIGIN+"/api/cloud/auth/jwt/token/",deadline,payload=value)).get("access")
        if not isinstance(token,str) or not token or len(token)>16384:raise ValueError("Invalid token")
        headers={"Authorization":"Bearer "+token,"X-App-Slug":"hmg-studio"}
        identity=metadata_body(metadata_http(client,"GET",METADATA_ORIGIN+"/api/users/me/",deadline,headers)).get("data")
        if not isinstance(identity,dict) or identity.get("username")!=METADATA_USER:raise ValueError("Wrong identity")
        base=METADATA_ORIGIN+"/api/apps/hmg-studio/datatables/"+table+"/data/"
        # Native GET of an absent UUID is policy-denied (403), not 404.
        # CREATE is insert-only: native UUID PK conflict returns409 without upsert.
        # Caller replay was checked before secret access; concurrent conflicts
        # reconcile only through exact caller-visible readback below.
        if action=="update":
            current=metadata_body(metadata_http(client,"GET",base+record_id+"/",deadline,headers)).get("data")
            if not isinstance(current,dict) or current.get("id")!=record_id or current.get("organization_id")!=org or current.get("deleted_at") is not None:raise ValueError("Scope mismatch")
            if any(current.get(k)!=v for k,v in expected.items()):raise ValueError("Changed record")
        metadata_body(metadata_http(client,"POST" if action=="create" else "PATCH",base if action=="create" else base+record_id+"/",deadline,headers,patch))


def metadata_main(params, sdk):
    table, action=params["resource"],params.get("action")
    if action not in ("create","update","readback"):return failure("VALIDATION_ERROR")
    try:
        org, record_id=str(UUID(params.get("organization_id",""))),str(UUID(params.get("request_id","")))
        if org not in METADATA_ORGS:return failure("FORBIDDEN")
        supplied=params.get("values")
        if action=="readback":
            if "values" in params:return failure("VALIDATION_ERROR")
        elif not isinstance(supplied,dict) or not supplied or any(k not in METADATA_FIELDS[table] for k in supplied):return failure("VALIDATION_ERROR")
        elif len(json.dumps(supplied,ensure_ascii=False,allow_nan=False).encode("utf-8"))>32768:return failure("VALIDATION_ERROR")
    except Exception:return failure("VALIDATION_ERROR")
    try:
        metadata_authorize(sdk,table,org,action,{})
        organization=first(sdk,"organizations",{"id":org})
        if not organization or organization.get("is_active") is not True or organization.get("deleted_at") is not None:return failure("FORBIDDEN")
        existing=first(sdk,table,{"id":record_id,"organization_id":org})
        if existing:
            if existing.get("deleted_at") is not None:return failure("NOT_FOUND")
            metadata_authorize(sdk,table,org,action,existing)
        if action=="readback":return metadata_success(table,existing) if existing else failure("NOT_FOUND")
        if action=="update" and not existing:return failure("NOT_FOUND")
        previous={k:v for k,v in (existing or {}).items() if k in METADATA_FIELDS[table]}
        defaults={"is_active":True,**({"priority":0,"country":"CA"} if table=="warehouses" else {})}
        try:values=metadata_values(table,{**defaults,**(previous if action=="update" else {}),**supplied})
        except Exception:return failure("VALIDATION_ERROR")
        metadata_authorize(sdk,table,org,action,{**(existing or {}),**values,"id":record_id})
        if table=="product_locations" and values.get("warehouse_id"):
            warehouse=first(sdk,"warehouses",{"id":values["warehouse_id"],"organization_id":org})
            if not warehouse or warehouse.get("is_active") is not True or warehouse.get("deleted_at") is not None:return failure("REFERENCE_FORBIDDEN")
        intended=dict(values)
        if table=="warehouses":
            default=False if action=="create" else existing.get("is_default")
            if type(default) is not bool:return failure("READBACK_FAILED")
            intended["is_default"]=default
        if action=="create" and existing:
            return metadata_success(table,existing,True) if metadata_matches(existing,intended) else failure("CONFLICT")
        patch=values if action=="create" else {k:values[k] for k in supplied if values[k]!=previous.get(k)}
        if not patch:return metadata_success(table,existing) if metadata_matches(existing,intended) else failure("READBACK_FAILED")
        # Advisory duplicate check only: without a native composite unique key,
        # concurrent different-ID creates may reuse a code. UUID replay and stock safety do not rely on code uniqueness.
        if patch.get("code") and (not existing or patch["code"]!=existing.get("code")):
            if first(sdk,table,{"organization_id":org,"code":patch["code"]}):return failure("DUPLICATE_CODE")
    except Exception:return failure("FORBIDDEN")
    now=datetime.now(timezone.utc).isoformat(timespec="milliseconds")
    expected=intended
    patch={**patch,"updated_at":now}
    if action=="create":patch={**patch,"id":record_id,"organization_id":org,"created_at":now,"deleted_at":None,**({"is_default":False} if table=="warehouses" else {})}
    uncertain=False
    try:metadata_write(sdk,table,org,record_id,action,patch,{k:v for k,v in (existing or {}).items() if k in METADATA_FIELDS[table]|SYSTEM_FIELDS})
    except Exception:uncertain=True
    try:
        saved=first(sdk,table,{"id":record_id,"organization_id":org})
        if saved and saved.get("deleted_at") is None and metadata_matches(saved,expected):
            metadata_authorize(sdk,table,org,"readback",saved)
            return metadata_success(table,saved,uncertain)
    except Exception:pass
    return failure("WRITE_UNCONFIRMED" if uncertain else "READBACK_FAILED")
