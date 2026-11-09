"""Caller-scoped product-master metadata commands, excluding stock posting.

This function intentionally rejects opening stock and child resources. A full
product workflow requires a separately verified atomic stock/variant/media
command and app-scoped policy/readback acceptance before release.
"""
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
from uuid import UUID
import re


ALLOWED_VALUES = {
    "name", "sku", "description", "price", "purchase_price", "currency",
    "stock", "min_stock", "reorder_point", "reorder_quantity", "barcode",
    "barcode_type", "category_id", "location_id", "is_active", "notes",
    "tracking_type", "type",
}
EDITABLE_VALUES = ALLOWED_VALUES - {"stock", "currency", "type", "tracking_type"}
OUTPUT_FIELDS = (
    "id", "organization_id", "name", "sku", "description", "price",
    "selling_price", "purchase_price", "currency", "stock", "min_stock",
    "reorder_point", "reorder_quantity", "barcode", "barcode_type",
    "category_id", "location_id", "is_active", "notes", "tracking_type",
    "type", "created_at", "updated_at",
)


def failure(code, errors=None):
    return {"ok": False, "verified": False, "code": code, "errors": errors or {}}


def first(sdk, table, filters):
    query = sdk.database.from_(table)
    for field, value in filters.items():
        query = query.filter(field, "eq", value)
    response = query.page_size(1).execute()
    if not isinstance(response, dict) or not isinstance(response.get("data"), list):
        raise ValueError("Invalid native query response")
    return response["data"][0] if response["data"] else None


def text_value(value, maximum=None, required=False):
    if value is None and not required:
        return None
    if not isinstance(value, str):
        raise ValueError("Expected text")
    value = value.strip()
    if (required and not value) or (maximum is not None and len(value) > maximum):
        raise ValueError("Invalid text length")
    return value or None


def uuid_value(value):
    if value in (None, ""):
        return None
    return str(UUID(value))


def money(value, required=False):
    if value in (None, "") and not required:
        return None
    if isinstance(value, bool) or not isinstance(value, (str, int, float, Decimal)):
        raise ValueError("Invalid amount")
    source = str(value)
    if len(source) > 64:
        raise ValueError("Invalid amount")
    try:
        parsed = Decimal(source)
    except InvalidOperation as exc:
        raise ValueError("Invalid amount") from exc
    # Bound expansion before format(..., "f"): a tiny exponential input can
    # otherwise request gigabytes of output in the function worker.
    if (not parsed.is_finite() or parsed < 0 or
            abs(parsed.as_tuple().exponent) > 18 or parsed.adjusted() > 18):
        raise ValueError("Invalid amount")
    return format(parsed, "f")


def quantity(value, required=False):
    if value in (None, "") and not required:
        return None
    if isinstance(value, bool):
        raise ValueError("Invalid quantity")
    try:
        parsed = int(value)
    except (TypeError, ValueError, OverflowError) as exc:
        raise ValueError("Invalid quantity") from exc
    if str(value).strip() != str(parsed) or not 0 <= parsed <= 2147483647:
        raise ValueError("Invalid quantity")
    return parsed


def valid_gtin(value, length):
    if len(value) != length or not value.isascii() or not value.isdigit():
        return False
    weighted = sum(int(char) * (3 if index % 2 == 0 else 1)
                   for index, char in enumerate(reversed(value[:-1])))
    return (10 - weighted % 10) % 10 == int(value[-1])


def validate_barcode(value, kind):
    if kind is not None and kind not in ("code128", "ean13", "upca", "ean8", "code39"):
        raise ValueError("Invalid barcode type")
    if value is None or kind is None:
        return
    if kind == "code128":
        valid = len(value) <= 80 and re.fullmatch(r"[\x20-\x7e]+", value) is not None
    elif kind == "code39":
        valid = len(value) <= 43 and re.fullmatch(r"[0-9A-Z\-. $/+%]+", value) is not None
    else:
        valid = valid_gtin(value, {"ean13": 13, "upca": 12, "ean8": 8}[kind])
    if not valid:
        raise ValueError("Invalid barcode")


def validate(values):
    if not isinstance(values, dict) or any(key not in ALLOWED_VALUES for key in values):
        raise ValueError("Unsupported product field")
    if values.get("stock", 0) not in (0, "0"):
        raise ValueError("Opening stock requires a verified posting command")
    currency = text_value(values.get("currency", "USD"), 3, True)
    if len(currency) != 3 or not currency.isalpha():
        raise ValueError("Invalid currency")
    product_type = values.get("type", "standard")
    tracking = values.get("tracking_type", "none")
    if product_type not in ("standard", "kit", "assembly") or tracking not in ("none", "batch", "serial"):
        raise ValueError("Invalid product type or tracking")
    active = values.get("is_active", True)
    if not isinstance(active, bool):
        raise ValueError("Invalid active status")
    sale = money(values.get("price"), True)
    result = {
        "name": text_value(values.get("name"), 255, True),
        "sku": text_value(values.get("sku"), 255, True),
        "description": text_value(values.get("description")),
        "price": sale,
        "selling_price": sale,
        "purchase_price": money(values.get("purchase_price")),
        "currency": currency.upper(),
        "stock": 0,
        "min_stock": quantity(values.get("min_stock", 0), True),
        "reorder_point": quantity(values.get("reorder_point")),
        "reorder_quantity": quantity(values.get("reorder_quantity")),
        "barcode": text_value(values.get("barcode"), 255),
        "barcode_type": text_value(values.get("barcode_type"), 16),
        "category_id": uuid_value(values.get("category_id")),
        "location_id": uuid_value(values.get("location_id")),
        "is_active": active,
        "notes": text_value(values.get("notes")),
        "tracking_type": tracking,
        "type": product_type,
        "has_variants": False,
    }
    validate_barcode(result["barcode"], result["barcode_type"])
    return result


def matches(record, org, values):
    if not isinstance(record, dict) or record.get("organization_id") != org or record.get("deleted_at") is not None:
        return False
    for field, expected in values.items():
        actual = record.get(field)
        if field in ("price", "selling_price", "purchase_price"):
            try:
                if actual is not None and expected is not None and Decimal(str(actual)) == Decimal(str(expected)):
                    continue
            except (ValueError, InvalidOperation, TypeError):
                return False
        if actual != expected:
            return False
    return True


def success(record, replayed=False):
    return {"ok": True, "verified": True, "replayed": replayed,
            "record": {key: record.get(key) for key in OUTPUT_FIELDS}}


def policy_allows(sdk, product_id, action, attributes):
    try:
        decision = sdk.policy.check_resources(resources=[{
            "resource": {"kind": "datatable:products", "id": product_id, "attr": attributes},
            "actions": [action],
        }], principal=None)
        return decision["results"][0]["actions"][action] == "EFFECT_ALLOW"
    except Exception:
        return False


def update_product(sdk, org, product_id, existing, supplied):
    if not existing or existing.get("deleted_at") is not None:
        return failure("NOT_FOUND")
    if existing.get("organization_id") != org or existing.get("id") != product_id:
        return failure("FORBIDDEN")
    try:
        merged = {key: value for key, value in existing.items() if key in ALLOWED_VALUES and key != "stock"}
        normalized = validate({**merged, **supplied})
    except (ValueError, TypeError, AttributeError):
        return failure("VALIDATION_ERROR")
    patch = {key: normalized[key] for key in supplied if normalized[key] != existing.get(key)}
    if "price" in supplied and ("price" in patch or normalized["selling_price"] != existing.get("selling_price")):
        patch["selling_price"] = normalized["selling_price"]
    proposed = {**existing, **patch}
    if (not policy_allows(sdk, product_id, "update", existing) or
            not policy_allows(sdk, product_id, "update", proposed)):
        return failure("FORBIDDEN")
    try:
        for table, key in (("product_categories", "category_id"), ("product_locations", "location_id")):
            if proposed.get(key) and not first(sdk, table, {"organization_id": org, "id": proposed[key]}):
                return failure("FORBIDDEN")
        if "sku" in patch:
            if first(sdk, "products", {"organization_id": org, "sku": patch["sku"]}):
                return failure("DUPLICATE_SKU")
    except Exception:
        return failure("FORBIDDEN")
    if not patch:
        return success(existing)
    patch["updated_at"] = datetime.now(timezone.utc).isoformat()
    uncertain = False
    try:
        # Patch only submitted metadata: never overwrite stock, variants,
        # organization, or unrelated concurrent metadata changes.
        sdk.database.update("products", record_id=product_id, data=patch)
    except Exception:
        uncertain = True
    try:
        saved = first(sdk, "products", {"organization_id": org, "id": product_id})
        if matches(saved, org, {key: value for key, value in patch.items() if key != "updated_at"}):
            return success(saved, uncertain)
    except Exception:
        pass
    return failure("WRITE_UNCONFIRMED" if uncertain else "READBACK_FAILED")


def same_instant(actual, expected):
    try:
        left = datetime.fromisoformat(actual.replace("Z", "+00:00"))
        right = datetime.fromisoformat(expected.replace("Z", "+00:00"))
        return left.tzinfo is not None and right.tzinfo is not None and left == right
    except (TypeError, ValueError, AttributeError):
        return False


def delete_product(sdk, org, product_id, existing):
    if not existing:
        return failure("NOT_FOUND")
    if existing.get("organization_id") != org or existing.get("id") != product_id:
        return failure("FORBIDDEN")
    if not policy_allows(sdk, product_id, "delete", existing):
        return failure("FORBIDDEN")
    deleted_result = {"ok": True, "verified": True, "deleted": True, "id": product_id}
    if existing.get("deleted_at") is not None:
        if existing.get("is_active") is False and policy_allows(sdk, product_id, "read", existing):
            return deleted_result
        return failure("READBACK_FAILED")
    # Emit millisecond precision so serializers supporting either milliseconds
    # or microseconds can preserve the exact instant without rounding tolerance.
    now = datetime.now(timezone.utc).isoformat(timespec="milliseconds")
    patch = {"deleted_at": now, "updated_at": now, "is_active": False}
    # Logical deletion preserves stock and every historical foreign key. The
    # native update must also authorize its own caller-scoped mutation.
    uncertain = False
    try:
        sdk.database.update("products", record_id=product_id, data=patch)
    except Exception:
        uncertain = True
    try:
        saved = first(sdk, "products", {"organization_id": org, "id": product_id})
        if (isinstance(saved, dict) and saved.get("id") == product_id and
                saved.get("organization_id") == org and same_instant(saved.get("deleted_at"), now) and
                saved.get("is_active") is False and policy_allows(sdk, product_id, "read", saved)):
            return deleted_result
    except Exception:
        pass
    # Missing/hidden rows never prove deletion. Do not retry an uncertain write.
    return failure("WRITE_UNCONFIRMED" if uncertain else "READBACK_FAILED")


def main(params, user_data, sdk_client):
    if not isinstance(user_data, dict) or not user_data:
        return failure("UNAUTHENTICATED")
    allowed = {"action", "organization_id", "request_id", "values", "request", "__function__", "__method__"}
    if not isinstance(params, dict) or any(key not in allowed for key in params):
        return failure("VALIDATION_ERROR")
    action = params.get("action")
    if action not in ("create", "update", "readback", "delete"):
        return failure("VALIDATION_ERROR")
    try:
        org = str(UUID(params.get("organization_id", "")))
        product_id = str(UUID(params.get("request_id", "")))
    except (ValueError, TypeError, AttributeError):
        return failure("VALIDATION_ERROR")
    if action in ("readback", "delete") and "values" in params:
        return failure("VALIDATION_ERROR")
    if action == "update":
        supplied = params.get("values")
        if (not isinstance(supplied, dict) or not supplied or
                any(key not in EDITABLE_VALUES for key in supplied)):
            return failure("VALIDATION_ERROR")
    try:
        values = validate(params.get("values")) if action == "create" else None
    except (ValueError, TypeError, AttributeError):
        return failure("VALIDATION_ERROR")
    try:
        # Native policy resolves the authenticated caller. A legacy user_data
        # organization attribute is not an authorization boundary; access to
        # the selected business organization also requires caller-scoped reads.
        decision = sdk_client.policy.check_resources(resources=[{
            "resource": {"kind": "datatable:products", "id": product_id,
                         "attr": {"organization_id": org, **(values or {})}},
            "actions": ["create" if action == "create" else "read"],
        }], principal=None)
        effect = decision["results"][0]["actions"]["create" if action == "create" else "read"]
        if effect != "EFFECT_ALLOW":
            return failure("FORBIDDEN")
    except Exception:
        return failure("FORBIDDEN")
    lookup = {"organization_id": org, "id": product_id}
    try:
        # The injected SDK must retain caller-scoped row policies. The
        # selected organization is input, never authority by itself.
        if not first(sdk_client, "organizations", {"id": org}):
            return failure("FORBIDDEN")
        existing = first(sdk_client, "products", lookup)
        if action == "readback":
            return success(existing) if existing and existing.get("deleted_at") is None else failure("NOT_FOUND")
        if action == "update":
            return update_product(sdk_client, org, product_id, existing, supplied)
        if action == "delete":
            return delete_product(sdk_client, org, product_id, existing)
        for table, key in (("product_categories", "category_id"), ("product_locations", "location_id")):
            if values[key] and not first(sdk_client, table, {"organization_id": org, "id": values[key]}):
                return failure("FORBIDDEN")
    except Exception:
        return failure("FORBIDDEN")
    if existing:
        return success(existing, True) if matches(existing, org, values) else failure("CONFLICT")
    try:
        if first(sdk_client, "products", {"organization_id": org, "sku": values["sku"]}):
            return failure("DUPLICATE_SKU")
    except Exception:
        return failure("LOAD_FAILED")
    now = datetime.now(timezone.utc).isoformat()
    row = {"id": product_id, "organization_id": org, **values,
           "created_at": now, "updated_at": now, "deleted_at": None}
    try:
        sdk_client.database.from_("products").create(row).execute()
    except Exception:
        # A timeout may follow a committed write; reconcile by stable UUID,
        # never issue a second create on the same request.
        try:
            saved = first(sdk_client, "products", lookup)
            if matches(saved, org, values):
                return success(saved, True)
        except Exception:
            pass
        return failure("WRITE_UNCONFIRMED")
    try:
        saved = first(sdk_client, "products", lookup)
        if matches(saved, org, values):
            return success(saved)
    except Exception:
        pass
    return failure("READBACK_FAILED")
