"""Bounded public HMG catalogue reader and synthetic-reference planner.

Default is offline dry-run from a saved feed. --fetch makes public read requests
only. No storage writes, policies, schema changes or commercial stock changes.
Apply requires an explicitly approved plan SHA-256 and uses native create-only
POST, never upsert. Provisioning credentials remain in process memory only.
"""
import argparse
import asyncio
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
import hashlib
import json
from pathlib import Path
import re
from urllib.parse import parse_qsl, quote, urlencode, urljoin, urlsplit, urlunsplit
from uuid import NAMESPACE_URL, UUID, uuid5

import httpx

ROOT = Path(__file__).resolve().parents[2]
EVIDENCE = ROOT / "docs/hmg-studio/evidence"
ORG = "913d46eb-585d-5a5c-b1d4-b9d22052a8d6"
BASE = "https://www.hmgstones.com/"
FEED = BASE + "assets/includes/products-new.json"
NOTE = ("HMG WEBSITE CATALOGUE REFERENCE — no physical stock or commercial price verified; "
        "required legacy price=0 is a placeholder, not a quotation. REFERENCE ONLY. ")


def schema_digest(schema):
    return hashlib.sha256(json.dumps(schema, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


def canonical_url(value, kind):
    if not isinstance(value, str) or not value or any(ord(c) < 32 for c in value) or "\\" in value or "%" in value:
        raise ValueError("Unsafe URL encoding")
    parsed = urlsplit(urljoin(BASE, value))
    if parsed.scheme != "https" or parsed.netloc not in {"www.hmgstones.com", "hmgstones.com"} or parsed.fragment:
        raise ValueError("Only exact HTTPS HMG hosts are allowed")
    if any(part in {".", ".."} for part in value.split("/")):
        raise ValueError("Unsafe path traversal")
    path = parsed.path
    if kind == "image":
        if not path.startswith("/assets/images/products/") or parsed.query or not re.search(r"\.(jpg|jpeg|png|webp)$", path, re.I):
            raise ValueError("Not a permitted product raster image")
        query = ""
    elif kind == "product":
        args = parse_qsl(parsed.query, keep_blank_values=True)
        if path != "/product-details.php" or len(args) != 2 or {k for k, _ in args} != {"product_name", "product_id"}:
            raise ValueError("Unexpected product detail URL")
        fields = dict(args)
        if not re.fullmatch(r"[a-zA-Z0-9_-]+", fields["product_name"]) or not re.fullmatch(r"[0-9]+", fields["product_id"]):
            raise ValueError("Invalid product identity")
        query = urlencode(sorted(args))
    elif kind == "feed":
        if path != "/assets/includes/products-new.json" or parsed.query:
            raise ValueError("Unexpected feed URL")
        query = ""
    else:
        raise ValueError("Unknown URL kind")
    return urlunsplit(("https", "www.hmgstones.com", quote(path, safe="/-._~"), query, ""))


def fetch_bounded(client, url, kind, limit):
    # Already canonical inputs may contain percent-encoded spaces; decode only
    # this generated URL once, then validate the full redirect target again.
    from urllib.parse import unquote
    current = canonical_url(unquote(url), kind)
    for _ in range(4):
        with client.stream("GET", current, follow_redirects=False, timeout=20) as response:
            if response.is_redirect:
                target = urljoin(current, response.headers.get("location", ""))
                current = canonical_url(target, kind)
                continue
            response.raise_for_status()
            if int(response.headers.get("content-length", "0")) > limit:
                raise ValueError("Response exceeds byte limit")
            chunks = []; length = 0
            for chunk in response.iter_bytes():
                length += len(chunk)
                if length > limit:
                    raise ValueError("Response exceeds byte limit")
                chunks.append(chunk)
            return b"".join(chunks), response.headers.get("content-type", "").split(";")[0].lower(), current
    raise ValueError("Redirect limit exceeded")


def image_signature(body, content_type):
    return bool((content_type == "image/jpeg" and body.startswith(b"\xff\xd8\xff")) or
                (content_type == "image/png" and body.startswith(b"\x89PNG\r\n\x1a\n")) or
                (content_type == "image/webp" and body.startswith(b"RIFF") and body[8:12] == b"WEBP"))


def plan_catalogue(items, schema, verified_images=frozenset(), categories=()):
    if not isinstance(items, list) or len(items) > 2000:
        raise ValueError("Unexpected feed collection")
    fields = {f["name"]: f for f in schema["fields"]}
    price_required = bool(fields["price"].get("constraints", {}).get("required"))
    grouped = {}; rejected = []
    for index, item in enumerate(items):
        try:
            source = canonical_url(item["url"], "product")
            name = item["name"].strip()
            if not name or len(name) > 255 or any(ord(c) < 32 for c in name):
                raise ValueError("Invalid product name")
            grouped.setdefault(source, []).append({**item, "name": name})
        except (ValueError, KeyError, TypeError, AttributeError):
            rejected.append({"index": index, "reason": "Invalid product identity or name"})
    rows = []; conflicts = []; image_candidates = set()
    category_map = {}
    for category in categories:
        if category.get("organization_id") == ORG:
            try:
                UUID(category["id"])
                category_map.setdefault(category["name"].strip().casefold(), []).append(category["id"])
            except (ValueError, KeyError, AttributeError):
                continue
    for source, variants in sorted(grouped.items()):
        if len({v["name"] for v in variants}) != 1:
            conflicts.append({"source": source, "names": sorted({v["name"] for v in variants}), "reason": "Conflicting names for one public product URL"})
            continue
        item = variants[0]
        identity = str(uuid5(NAMESPACE_URL, "hmg-studio/public-catalogue/v1/" + source))
        category = str(item.get("stone") or dict(parse_qsl(urlsplit(source).query))["product_name"])[:100]
        row = {"id": identity, "organization_id": ORG, "sku": "HMG-WEB-" + UUID(identity).hex.upper(),
               "name": item["name"], "description": "Public HMG catalogue reference. Source category: " + category + ". Source: " + source,
               "notes": NOTE + "Source: " + source,
               "price": 0 if price_required else None, "selling_price": None, "purchase_price": None,
               "stock": 0, "min_stock": 0, "currency": "INR", "is_active": False,
               "has_variants": False, "tracking_type": "none", "type": "standard"}
        matches = category_map.get(category.strip().casefold(), [])
        if len(matches) == 1:
            row["category_id"] = matches[0]
        try:
            image = canonical_url(item["src"], "image")
            image_candidates.add(image)
            if image in verified_images and len(image) <= 255:
                row["image"] = image
        except (ValueError, KeyError, TypeError):
            pass
        unknown = set(row) - fields.keys()
        if unknown or any(fields[key]["type"] == "any" for key in row):
            raise ValueError("Unconfirmed fields or JSON any write in proposal")
        rows.append(row)
    return {"app_slug": "hmg-studio", "organization_id": ORG, "schema_sha256": schema_digest(schema), "source_count": len(items), "unique_source_urls": len(grouped),
            "rows": rows, "conflicts": conflicts, "rejected": rejected, "image_candidates": sorted(image_candidates),
            "technical_price_placeholder": price_required, "commercial_prices_verified": False,
            "physical_stock_verified": False, "storage_objects_created": 0, "blockers": []}


def reconcile(proposed, existing):
    by_id = {row["id"]: row for row in existing}
    missing = []
    for row in proposed:
        if row["organization_id"] != ORG or not row["sku"].startswith("HMG-WEB-") or not row["notes"].startswith(NOTE):
            raise ValueError("Unowned import row")
        old = by_id.get(row["id"])
        if old is not None:
            def equal(key, value):
                saved = old.get(key)
                if key in {"price", "selling_price", "purchase_price", "stock", "min_stock"} and value is not None:
                    if isinstance(saved, bool) or not isinstance(saved, (int, float, str)):
                        return False
                    try:
                        return Decimal(str(value)) == Decimal(str(saved))
                    except InvalidOperation:
                        return False
                return type(saved) is type(value) and saved == value
            if any(not equal(key, value) for key, value in row.items()):
                raise ValueError("Refusing to overwrite existing or changed record: " + row["id"])
        else:
            missing.append(row)
    return missing


async def apply_plan(plan, current_schema, call, create_only, save=lambda report: None):
    """Call is an exact-ID read adapter; create_only sends one native POST per row.

    There is deliberately no retry. Even a reconciled timeout aborts this run.
    Caller supplies a known process-only admin client, not frontend credentials.
    """
    if plan.get("app_slug") != "hmg-studio" or plan.get("organization_id") != ORG:
        raise ValueError("App or organization mismatch")
    if plan.get("schema_sha256") != schema_digest(current_schema):
        raise ValueError("Schema drift: regenerate and review the plan")
    if plan.get("blockers"):
        raise ValueError("Plan contains blockers")
    if len({row["id"] for row in plan["rows"]}) != len(plan["rows"]):
        raise ValueError("Duplicate planned identities")
    fields = {field["name"]: field for field in current_schema["fields"]}
    for row in plan["rows"]:
        reconcile([row], [])
        source = row["notes"].removeprefix(NOTE + "Source: ")
        # The canonical URL includes only two observed public product keys.
        source = canonical_url(source, "product")
        expected_id = str(uuid5(NAMESPACE_URL, "hmg-studio/public-catalogue/v1/" + source))
        if row["id"] != expected_id or row["sku"] != "HMG-WEB-" + UUID(expected_id).hex.upper():
            raise ValueError("Invalid deterministic identity")
        if set(row) - fields.keys() or any(fields[key]["type"] == "any" for key in row):
            raise ValueError("Unknown field or JSON any mutation")
        if "image" in row:
            from urllib.parse import unquote
            if canonical_url(unquote(row["image"]), "image") != row["image"]:
                raise ValueError("Image URL is not canonical")
        if any(row.get(key) is not None for key in ("selling_price", "purchase_price", "barcode")) or row["stock"] != 0 or row["is_active"] is not False:
            raise ValueError("Only unpriced inactive catalogue references may be provisioned")
        if row["price"] != (0 if fields["price"].get("constraints", {}).get("required") else None):
            raise ValueError("Unexpected legacy price")
    report = {"app_slug": "hmg-studio", "organization_id": ORG, "create_only": True, "created": [], "verified": [], "skipped": [], "failures": [], "aborted": False}
    async def query(row):
        result = await call("datatable_data", {"action": "query", "table_name": "products", "filters": {"id": row["id"]}, "limit": 2})
        data = result.get("data")
        if isinstance(data, dict):
            data = data.get("data")
        if not isinstance(data, list) or len(data) > 1 or any(item.get("id") != row["id"] for item in data):
            raise ValueError("Unexpected exact-ID readback")
        return data
    for row in plan["rows"]:
        try:
            missing = reconcile([row], await query(row))
        except Exception as error:
            report["aborted"] = True
            report["failures"].append({"id": row["id"], "phase": "preflight_read", "error_type": type(error).__name__, "retry_sent": False})
            save(report); return report
        if not missing:
            report["skipped"].append(row["id"]); save(report); continue
        status = None; error_type = None
        try:
            status = create_only(row)
        except Exception as error:
            error_type = type(error).__name__
        # Always reconcile including 403/409/timeouts; never re-send a write.
        try:
            saved = await query(row)
            if saved and not reconcile([row], saved):
                report["verified"].append(row["id"])
                if status is not None and 200 <= status < 300:
                    report["created"].append(row["id"])
        except Exception as error:
            error_type = type(error).__name__
        if error_type or status is None or not 200 <= status < 300 or row["id"] not in report["verified"]:
            report["aborted"] = True
            report["failures"].append({"id": row["id"], "http_status": status, "error_type": error_type, "retry_sent": False})
            save(report); return report
        save(report)
    return report


def native_read_adapter(client):
    """Explicit native app route avoids transient MCP table-context failures."""
    async def read(name, args):
        if name != "datatable_data" or args.get("action") != "query" or args.get("table_name") != "products" or set(args.get("filters", {})) != {"id"}:
            raise ValueError("Only exact product ID reads are allowed")
        identity = args["filters"]["id"]
        UUID(identity)
        response = client.get("https://insurance.taruvi.cloud/api/apps/hmg-studio/datatables/products/data/", params={"id": identity, "page_size": 2})
        response.raise_for_status()
        body = response.json()
        data = body.get("data")
        if not isinstance(data, list) or len(data) > 1 or body.get("total") != len(data) or any(row.get("id") != identity for row in data):
            raise ValueError("Unexpected native exact-ID readback")
        return {"data": {"data": data, "total": len(data)}}
    return read


def snapshot_images(urls):
    def inspect(url):
        try:
            with httpx.Client(trust_env=False) as client:
                body, mime, final = fetch_bounded(client, url, "image", 8 * 1024 * 1024)
            valid = image_signature(body, mime)
            return {"url": url, "final_url": final, "verified": valid, "content_type": mime,
                    "bytes": len(body), "sha256": hashlib.sha256(body).hexdigest() if valid else None}
        except Exception as error:
            return {"url": url, "verified": False, "error_type": type(error).__name__}
    with ThreadPoolExecutor(max_workers=6) as pool:
        return list(pool.map(inspect, urls))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--fetch", action="store_true", help="Fetch public catalogue and validate bounded raster images; read only")
    parser.add_argument("--feed", type=Path, default=EVIDENCE / "hmg-catalogue-source.json")
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--approve-plan-sha256", help="SHA-256 of the exact reviewed hmg-catalogue-plan.json bytes")
    args = parser.parse_args()
    if args.apply:
        if args.fetch:
            raise SystemExit("Fetch and apply must be separate reviewed steps")
        plan_bytes = (EVIDENCE / "hmg-catalogue-plan.json").read_bytes()
        if args.approve_plan_sha256 != hashlib.sha256(plan_bytes).hexdigest():
            raise SystemExit("Exact approved plan SHA-256 required; no writes sent")
        async def apply_live():
            from provision_erp import environment
            from restrict_synthetic import scoped_calls
            import logging
            logging.disable(logging.CRITICAL)
            env = environment()
            async with scoped_calls(env) as call:
                response = await call("get_datatable_schema", {"table_name": "products"})
                data = response["data"]
                if isinstance(data, list):
                    if len(data) != 1:
                        raise ValueError("Expected only the products schema")
                    data = data[0]
                if data.get("name") != "products":
                    raise ValueError("Unexpected schema resource")
                live_schema = data["json_schema"]
                def save(report):
                    (EVIDENCE / "hmg-catalogue-import.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
                with httpx.Client(timeout=45, trust_env=False, headers={"Authorization": "Api-Key " + env["TARUVI_API_KEY"], "X-App-Slug": "hmg-studio"}) as client:
                    def create_only(row):
                        return client.post(env["TARUVI_SITE_URL"].rstrip("/") + "/api/apps/hmg-studio/datatables/products/data/", json=row).status_code
                    result = await apply_plan(json.loads(plan_bytes), live_schema, native_read_adapter(client), create_only, save)
                print(json.dumps({"created": len(result["created"]), "verified": len(result["verified"]), "skipped": len(result["skipped"]), "aborted": result["aborted"]}))
                if result["aborted"]:
                    raise SystemExit(1)
        asyncio.run(apply_live())
        return
    schema = json.loads((ROOT / "backend/schema/inventory-native-readonly.json").read_text(encoding="utf-8"))["schemas"]["products"]["json_schema"]
    if args.fetch:
        with httpx.Client(trust_env=False) as client:
            body, _, _ = fetch_bounded(client, FEED, "feed", 2 * 1024 * 1024)
        feed = json.loads(body)
        args.feed.write_text(json.dumps(feed, indent=2, ensure_ascii=False), encoding="utf-8")
    else:
        feed = json.loads(args.feed.read_text(encoding="utf-8"))
    items = feed["items"]
    initial = plan_catalogue(items, schema)
    image_path = EVIDENCE / "hmg-catalogue-images.json"
    images = snapshot_images(initial["image_candidates"]) if args.fetch else json.loads(image_path.read_text(encoding="utf-8")) if image_path.exists() else []
    if args.fetch:
        image_path.write_text(json.dumps(images, indent=2), encoding="utf-8")
    plan = plan_catalogue(items, schema, {image["url"] for image in images if image.get("verified")})
    plan["observed_at"] = datetime.now(timezone.utc).isoformat()
    plan["dry_run"] = True
    (EVIDENCE / "hmg-catalogue-plan.json").write_text(json.dumps(plan, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps({"source_count": plan["source_count"], "planned_rows": len(plan["rows"]), "conflicts": plan["conflicts"],
                      "verified_images": sum(bool(r.get("image")) for r in plan["rows"]), "database_writes": 0}))


if __name__ == "__main__":
    main()
