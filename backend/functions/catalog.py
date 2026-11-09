"""Native, caller-scoped single-record category creation and readback.

Updates are intentionally not exposed: native old/new organization enforcement
failed live QA. This command never elevates the injected caller's permissions.
"""
import re
from datetime import datetime, timezone
from uuid import UUID


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


def success(record, replayed=False):
    fields = ("id", "organization_id", "name", "description", "slug", "is_active", "created_at", "updated_at")
    return {"ok": True, "verified": True, "replayed": replayed,
            "record": {key: record.get(key) for key in fields}}


def matches(record, org, values):
    return (record and record.get("organization_id") == org
            and record.get("name") == values["name"]
            and record.get("description") == values.get("description")
            and record.get("is_active") is True
            and record.get("parent_id") is None and record.get("deleted_at") is None)


def main(params, user_data, sdk_client):
    if not user_data:
        return failure("UNAUTHENTICATED")
    allowed = ("action", "organization_id", "request_id", "values", "request", "__function__", "__method__")
    if not isinstance(params, dict) or any(k not in allowed for k in params):
        return failure("VALIDATION_ERROR")
    action = params.get("action")
    if action not in ("create", "readback"):
        return failure("VALIDATION_ERROR")
    try:
        org = str(UUID(params.get("organization_id", "")))
        record_id = str(UUID(params.get("request_id", "")))
    except (ValueError, TypeError, AttributeError):
        return failure("VALIDATION_ERROR")
    values = params.get("values")
    if action == "create" and (not isinstance(values, dict) or any(k not in ("name", "description") for k in values)):
        return failure("VALIDATION_ERROR")
    if action == "readback" and "values" in params:
        return failure("VALIDATION_ERROR")
    lookup = {"organization_id": org, "id": record_id}
    try:
        # Selected organization is input, not authority. Native row policies
        # independently constrain this read and the following create/readback.
        if not first(sdk_client, "organizations", {"id": org}):
            return failure("FORBIDDEN")
        existing = first(sdk_client, "product_categories", lookup)
    except Exception:
        return failure("FORBIDDEN")
    if action == "readback":
        return success(existing) if existing else failure("NOT_FOUND")
    try:
        validated = sdk_client.functions.execute("validate-catalog-profile-v1", params={
            "resource": "product_categories", "values": values}, is_async=False)
        validation = validated.get("data", {})
        if validation.get("valid") is not True:
            return failure("VALIDATION_ERROR", validation.get("errors", {}))
        values = validation["values"]
    except Exception:
        return failure("VALIDATION_UNAVAILABLE")
    if existing:
        return success(existing, True) if matches(existing, org, values) else failure("CONFLICT")
    try:
        # Slugs are internal ASCII identifiers; preserve the full display name.
        # unicodedata is not permitted by the native function sandbox.
        stem = re.sub(r"[^a-z0-9]+", "-", values["name"].lower()).strip("-")[:240].rstrip("-") or "category"
        slug = None
        for suffix in range(100):
            candidate = stem if suffix == 0 else stem + "-" + str(suffix)
            if not first(sdk_client, "product_categories", {"organization_id": org, "slug": candidate}):
                slug = candidate
                break
        if slug is None:
            return failure("CONFLICT")
    except Exception:
        return failure("LOAD_FAILED")
    now = datetime.now(timezone.utc).isoformat()
    record = {"id": record_id, "organization_id": org, "name": values["name"],
              "description": values.get("description"), "slug": slug, "is_active": True,
              "parent_id": None, "deleted_at": None, "created_at": now, "updated_at": now}
    try:
        sdk_client.database.from_("product_categories").create(record).execute()
    except Exception:
        # Reconcile once by a stable UUID; never repeat an uncertain create.
        try:
            saved = first(sdk_client, "product_categories", lookup)
            if matches(saved, org, values):
                return success(saved, True)
        except Exception:
            pass
        return failure("WRITE_UNCONFIRMED")
    try:
        saved = first(sdk_client, "product_categories", lookup)
        if matches(saved, org, values) and saved.get("slug") == slug:
            return success(saved)
    except Exception:
        pass
    return failure("READBACK_FAILED")
