import copy
import sys
from pathlib import Path

import httpx
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from import_hmg_catalogue import canonical_url, plan_catalogue, fetch_bounded, image_signature, reconcile, apply_plan, schema_digest, native_read_adapter


def item(**changes):
    return dict({"name": "White Stone", "stone": "marble", "url": "product-details.php?product_name=marble&product_id=1", "src": "assets/images/products/marble/White Stone.jpg"}, **changes)


def schema(required=False):
    import json
    snapshot = json.loads((Path(__file__).resolve().parents[1] / "schema/inventory-native-readonly.json").read_text())
    result = snapshot["schemas"]["products"]["json_schema"]
    next(f for f in result["fields"] if f["name"] == "price")["constraints"]["required"] = required
    return result


def test_deterministic_reference_rows_do_not_invent_price_barcode_or_stock():
    a = plan_catalogue([item()], schema())
    b = plan_catalogue([item()], schema())
    row = a["rows"][0]
    assert a == b
    assert row["sku"].startswith("HMG-WEB-")
    assert row["stock"] == 0 and row["price"] is None
    assert row["selling_price"] is None and row["purchase_price"] is None
    assert "barcode" not in row and "images" not in row and "metadata" not in row
    assert "REFERENCE ONLY" in row["notes"] and not row["is_active"]
    assert "image" not in row  # Only independently verified image URLs are usable.


def test_required_legacy_zero_is_explicitly_technical_not_a_commercial_quote():
    result = plan_catalogue([item()], schema(True))
    row = result["rows"][0]
    assert row["price"] == 0 and row["selling_price"] is None
    assert "legacy price=0 is a placeholder, not a quotation" in row["notes"]
    assert result["technical_price_placeholder"] is True


def test_duplicate_source_url_with_conflicting_name_is_quarantined():
    result = plan_catalogue([item(), item(name="Different Stone"), item(url="product-details.php?product_id=2&product_name=marble")], schema())
    assert len(result["rows"]) == 1 and len(result["conflicts"]) == 1
    assert result["source_count"] == 3


def test_exact_duplicates_are_deduplicated_and_query_order_canonicalized():
    assert len(plan_catalogue([item(), item(url="product-details.php?product_id=1&product_name=marble")], schema())["rows"]) == 1


@pytest.mark.parametrize("url", ["https://evil.com/assets/images/products/a.jpg", "//evil.com/a", "http://www.hmgstones.com/a", "https://www.hmgstones.com@evil.com/a", "https://www.hmgstones.com:443/a", "assets/images/products/../../secrets", "assets/images/products/%2e%2e/a.jpg", "assets/images/products/a.svg", "assets/images/products/a.jpg?x=1", "assets/images/products/a\\b.jpg"])
def test_untrusted_image_urls_rejected(url):
    with pytest.raises(ValueError):
        canonical_url(url, "image")


def test_verified_images_only_and_exact_category_mapping():
    url = canonical_url(item()["src"], "image")
    categories = [{"id": "36f8fd6a-b9c9-4efa-b43d-15872653cc54", "name": "Marble", "organization_id": "913d46eb-585d-5a5c-b1d4-b9d22052a8d6"}]
    row = plan_catalogue([item()], schema(), {url}, categories)["rows"][0]
    assert row["image"] == url and row["category_id"] == categories[0]["id"]
    categories[0]["organization_id"] = "foreign"
    assert "category_id" not in plan_catalogue([item()], schema(), {url}, categories)["rows"][0]


def test_reconcile_never_overwrites_even_same_id_changed_or_foreign():
    row = plan_catalogue([item()], schema())["rows"][0]
    assert reconcile([row], [row]) == []
    assert reconcile([row], []) == [row]
    changed = copy.deepcopy(row); changed["name"] = "Edited"
    with pytest.raises(ValueError, match="overwrite"):
        reconcile([row], [changed])


def test_network_limit_and_redirect_validation():
    with httpx.Client(transport=httpx.MockTransport(lambda r: httpx.Response(302, headers={"location": "https://evil.com/x"}))) as client:
        with pytest.raises(ValueError):
            fetch_bounded(client, canonical_url(item()["src"], "image"), "image", 100)
    with httpx.Client(transport=httpx.MockTransport(lambda r: httpx.Response(200, content=b"x" * 101))) as client:
        with pytest.raises(ValueError, match="limit"):
            fetch_bounded(client, canonical_url(item()["src"], "image"), "image", 100)


def test_images_need_raster_magic_not_html_or_svg():
    assert image_signature(b"\xff\xd8\xffdata", "image/jpeg")
    assert not image_signature(b"<html>login</html>", "image/jpeg")
    assert not image_signature(b"<svg></svg>", "image/svg+xml")


@pytest.mark.parametrize("url", ["product-details.php?product_name=marble&product_id=1&redirect=x", "product-details.php?product_name=marble&product_id=1&product_id=2", "https://evil.com/product-details.php?product_name=marble&product_id=1", "product-details.php?product_name=marble&product_id=../../x"])
def test_product_identity_cannot_include_untrusted_or_duplicate_parameters(url):
    with pytest.raises(ValueError):
        canonical_url(url, "product")


def test_foreign_or_changed_ownership_cannot_be_skipped():
    row = plan_catalogue([item()], schema())["rows"][0]
    foreign = {**row, "organization_id": "other"}
    with pytest.raises(ValueError, match="overwrite"):
        reconcile([row], [foreign])
    with pytest.raises(ValueError, match="Unowned"):
        reconcile([foreign], [])


def test_invalid_feed_members_quarantined_without_overriding_other_rows():
    result = plan_catalogue([item(), {"name": "No identity"}, None], schema())
    assert len(result["rows"]) == 1 and len(result["rejected"]) == 2


def test_redirect_loops_are_bounded():
    url = canonical_url(item()["src"], "image")
    requests = []
    def redirect(request):
        requests.append(request)
        return httpx.Response(302, headers={"location": "/assets/images/products/a.jpg"})
    with httpx.Client(transport=httpx.MockTransport(redirect)) as client:
        with pytest.raises(ValueError, match="Redirect limit"):
            fetch_bounded(client, url, "image", 100)
    assert len(requests) == 4


def execution_fixture():
    plan = plan_catalogue([item()], schema())
    stored = []
    requests = []
    async def call(name, args):
        assert name == "datatable_data" and args["action"] == "query"
        return {"data": {"data": stored, "total": len(stored)}}
    def post(row):
        requests.append(row.copy()); stored.append(row.copy()); return 201
    return plan, stored, requests, call, post


def test_apply_creates_once_then_verifies_and_rerun_only_skips():
    import asyncio
    plan, stored, requests, call, post = execution_fixture()
    result = asyncio.run(apply_plan(plan, schema(), call, post))
    assert len(requests) == 1 and result["verified"] == [plan["rows"][0]["id"]]
    assert asyncio.run(apply_plan(plan, schema(), call, post))["skipped"] == result["verified"]
    assert len(requests) == 1


def test_schema_drift_aborts_before_any_write():
    import asyncio
    plan, _, requests, call, post = execution_fixture()
    changed = schema(); changed["fields"].append({"name": "unexpected", "type": "string"})
    with pytest.raises(ValueError, match="Schema drift"):
        asyncio.run(apply_plan(plan, changed, call, post))
    assert requests == []


def test_unknown_create_outcome_reconciles_but_never_retries():
    import asyncio
    plan, stored, requests, call, _ = execution_fixture()
    def post(row):
        requests.append(row.copy()); stored.append(row.copy()); raise TimeoutError("secret error content must not leak")
    result = asyncio.run(apply_plan(plan, schema(), call, post))
    assert len(requests) == 1 and result["aborted"] and result["verified"]
    assert "secret" not in str(result)


def test_denial_aborts_and_reads_back_without_write_retry():
    import asyncio
    plan, _, requests, call, _ = execution_fixture()
    def post(row):
        requests.append(row.copy()); return 403
    result = asyncio.run(apply_plan(plan, schema(), call, post))
    assert len(requests) == 1 and result["aborted"] and not result["verified"]


def test_native_zero_string_accepted_but_booleans_are_not_numbers():
    row = plan_catalogue([item()], schema(True))["rows"][0]
    assert reconcile([row], [{**row, "price": "0.00", "stock": "0"}]) == []
    with pytest.raises(ValueError):
        reconcile([row], [{**row, "stock": False}])


def test_tampered_deterministic_identity_cannot_be_imported():
    import asyncio
    plan, _, requests, call, post = execution_fixture()
    plan["rows"][0]["id"] = "36f8fd6a-b9c9-4efa-b43d-15872653cc54"
    with pytest.raises(ValueError, match="identity"):
        asyncio.run(apply_plan(plan, schema(), call, post))
    assert requests == []


def test_apply_revalidates_image_host_and_duplicate_ids():
    import asyncio
    plan, _, requests, call, post = execution_fixture()
    plan["rows"][0]["image"] = "https://evil.com/tracker.jpg"
    with pytest.raises(ValueError):
        asyncio.run(apply_plan(plan, schema(), call, post))
    del plan["rows"][0]["image"]
    plan["rows"].append(plan["rows"][0].copy())
    with pytest.raises(ValueError, match="Duplicate"):
        asyncio.run(apply_plan(plan, schema(), call, post))
    assert requests == []


def test_preflight_read_failure_saves_aborted_and_sends_no_write():
    import asyncio
    plan, _, requests, _, post = execution_fixture()
    snapshots = []
    async def broken_read(name, args):
        raise RuntimeError("Table products not found")
    result = asyncio.run(apply_plan(plan, schema(), broken_read, post, snapshots.append))
    assert result["aborted"] and result["failures"][0]["phase"] == "preflight_read"
    assert snapshots and not requests


def test_native_read_adapter_is_exact_app_get_only():
    import asyncio
    requests = []
    def transport(request):
        requests.append(request)
        return httpx.Response(200, json={"data": [], "total": 0})
    with httpx.Client(transport=httpx.MockTransport(transport)) as client:
        call = native_read_adapter(client)
        result = asyncio.run(call("datatable_data", {"action": "query", "table_name": "products", "filters": {"id": "0ddcc7fd-234f-509b-975a-762f640bd262"}, "limit": 2}))
        assert result["data"]["data"] == []
        with pytest.raises(ValueError):
            asyncio.run(call("datatable_data", {"action": "upsert"}))
    assert len(requests) == 1 and requests[0].method == "GET"
    assert requests[0].url.path == "/api/apps/hmg-studio/datatables/products/data/"
