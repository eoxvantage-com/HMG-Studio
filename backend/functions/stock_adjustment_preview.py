"""Caller-scoped stock adjustment preview. No writes or commit authorization.

Scope is deliberately limited to the synthetic organization, standard untracked
products, and one existing bin balance. Reads are not an atomic snapshot.
"""
from datetime import datetime, timezone
from uuid import UUID


SYNTHETIC_ORG = "913d46eb-585d-5a5c-b1d4-b9d22052a8d6"
MAX_INT = 2147483647
RESERVATION_LIMIT = 200
ADJUSTMENT_TYPES = ("manual", "recount", "damage", "loss", "return", "correction")


def failure(code):
    return {"ok": False, "code": code, "stock_posted": False,
            "request_created": False, "authorizes_commit": False}


def identifier(value):
    if not isinstance(value, str) or str(UUID(value)) != value:
        raise ValueError("Invalid identifier")
    return value


def quantity(value):
    if type(value) is not int or not 0 <= value <= MAX_INT:
        raise ValueError("Invalid quantity")
    return value


def rows(sdk, table, filters, limit):
    query = sdk.database.from_(table)
    for field, value in filters.items():
        query = query.filter(field, "eq", value)
    reply = query.sort("id", "asc").page_size(limit + 1).execute()
    if not isinstance(reply, dict):
        raise ValueError("Invalid query response")
    data, total = reply.get("data"), reply.get("total")
    if (not isinstance(data, list) or type(total) is not int
            or total != len(data) or not 0 <= total <= limit):
        raise ValueError("Incomplete query response")
    seen = set()
    for row in data:
        if not isinstance(row, dict):
            raise ValueError("Invalid row")
        row_id = identifier(row.get("id"))
        if row_id in seen or any(row.get(key) != value for key, value in filters.items()):
            raise ValueError("Invalid query scope")
        seen.add(row_id)
    return data


def one(sdk, table, filters):
    data = rows(sdk, table, filters, 1)
    if len(data) != 1:
        raise ValueError("Missing record")
    return data[0]


def active(row):
    if row.get("is_active") is not True or "deleted_at" not in row or row["deleted_at"] is not None:
        raise ValueError("Inactive or deleted record")


def timestamp(value):
    if value is None:
        return None
    if not isinstance(value, str) or "T" not in value:
        raise ValueError("Invalid timestamp")
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    # Native datetimes can omit their UTC offset, as in the dashboard contract.
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def reservation_total(records, location_id, now, product_stock):
    reserved, count = 0, 0
    for row in records:
        amount = quantity(row.get("quantity"))
        for key, maximum in (("owner_type", 100), ("owner_reference", 191), ("scope_key", 100)):
            value = row.get(key)
            if not isinstance(value, str) or not value.strip() or len(value) > maximum:
                raise ValueError("Unknown reservation owner")
        # Missing nullable fields are not evidence of a null/terminal state.
        times = {key: timestamp(row[key]) for key in ("expires_at", "consumed_at", "released_at")}
        for key in ("consumed_at", "released_at"):
            if times[key] is not None and times[key] > now:
                raise ValueError("Future terminal reservation")
        if (times["consumed_at"] is not None or times["released_at"] is not None
                or (times["expires_at"] is not None and times["expires_at"] <= now)):
            continue
        if row["location_id"] not in (None, location_id):
            raise ValueError("Other-location reservations require broader verification")
        if any(row[key] is not None for key in ("product_variant_id", "product_serial_id", "product_batch_id")):
            raise ValueError("Tracked reservation scope is unsupported")
        # A global reservation is fully charged against this bin. Never infer
        # an allocation from other bins or silently omit ambiguous reservations.
        reserved += amount
        count += 1
        if reserved > product_stock:
            raise ValueError("Reservations exceed product stock")
    return reserved, count


def main(params, user_data, sdk_client):
    if not user_data:
        return failure("UNAUTHENTICATED")
    allowed = ("organization_id", "product_id", "location_id", "product_variant_id",
               "type", "adjustment_quantity", "action", "request", "__method__", "__function__")
    try:
        if not isinstance(params, dict) or any(key not in allowed for key in params):
            raise ValueError("Invalid parameters")
        org = identifier(params.get("organization_id"))
        product_id = identifier(params.get("product_id"))
        location_id = identifier(params.get("location_id"))
        delta = params.get("adjustment_quantity")
        kind = params.get("type")
        if (org != SYNTHETIC_ORG or params.get("product_variant_id") is not None
                or params.get("action", "preview") != "preview" or kind not in ADJUSTMENT_TYPES
                or type(delta) is not int or not -2147483648 <= delta <= MAX_INT or delta == 0):
            raise ValueError("Unsupported adjustment")
    except Exception:
        return failure("VALIDATION_ERROR")

    try:
        organization = one(sdk_client, "organizations", {"id": org})
        active(organization)
        product = one(sdk_client, "products", {"organization_id": org, "id": product_id})
        active(product)
        if (product.get("has_variants") is not False or product.get("tracking_type") != "none"
                or product.get("type") != "standard"):
            return failure("UNSUPPORTED_PRODUCT")
        product_before = quantity(product.get("stock"))
        location = one(sdk_client, "product_locations", {"organization_id": org, "id": location_id})
        active(location)
        warehouse_id = identifier(location.get("warehouse_id"))
        warehouse = one(sdk_client, "warehouses", {"organization_id": org, "id": warehouse_id})
        active(warehouse)
        balance = one(sdk_client, "product_location_stocks",
                      {"organization_id": org, "product_id": product_id, "location_id": location_id})
        location_before = quantity(balance.get("quantity"))
        if location_before > product_before:
            raise ValueError("Inconsistent stock")
    except Exception:
        return failure("DATA_UNAVAILABLE")

    try:
        reservations = rows(sdk_client, "stock_reservations",
                            {"organization_id": org, "product_id": product_id}, RESERVATION_LIMIT)
        now = datetime.now(timezone.utc)
        reserved, reservation_count = reservation_total(reservations, location_id, now, product_before)
    except Exception:
        return failure("AVAILABILITY_UNCONFIRMED")

    available = max(0, location_before - reserved)
    if delta < 0 and -delta > available:
        return failure("INSUFFICIENT_AVAILABLE")
    product_after, location_after = product_before + delta, location_before + delta
    if not 0 <= product_after <= MAX_INT or not 0 <= location_after <= MAX_INT:
        return failure("QUANTITY_OUT_OF_RANGE")
    return {
        "ok": True, "code": "PREVIEW_ONLY", "stock_posted": False,
        "request_created": False, "authorizes_commit": False, "snapshot_at": now.isoformat(),
        "preview": {
            "organization_id": org, "product_id": product_id, "location_id": location_id,
            "warehouse_id": warehouse_id, "type": kind, "adjustment_quantity": delta,
            "product_before": product_before, "product_after": product_after,
            "location_before": location_before, "location_after": location_after,
            "reserved_quantity_conservative": reserved,
            "available_quantity_conservative": available, "active_reservation_count": reservation_count,
        },
        "limitations": [
            "Caller-visible read-only snapshot, not atomic; no stock, request, reservation or approval was written.",
            "Global reservations are fully charged against this bin; other-location and tracked active reservations are refused.",
            "Reservation visibility depends on caller read policies; this preview never authorizes a commit.",
            "Concurrent changes can stale this preview. Posting requires revalidation and verified atomic provider primitives.",
        ],
    }
