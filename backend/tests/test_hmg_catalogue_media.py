import hashlib
import sys
from pathlib import Path

import pytest
import httpx

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from copy_hmg_catalogue_media import plan_media, copy_media, validate_bucket, native_reader, native_upload, public_client

BODY = b"\xff\xd8\xffsample"
SHA = hashlib.sha256(BODY).hexdigest()
URL = "https://www.hmgstones.com/assets/images/products/marble/a.jpg"


def fixture():
    images = [{"url": URL, "verified": True, "sha256": SHA, "content_type": "image/jpeg", "bytes": len(BODY)}]
    catalogue = {"app_slug": "hmg-studio", "organization_id": "913d46eb-585d-5a5c-b1d4-b9d22052a8d6", "rows": [{"id": "0ddcc7fd-234f-509b-975a-762f640bd262", "image": URL}]}
    return plan_media(catalogue, images)


def test_content_addressed_private_object_plan_and_uri_mapping():
    plan = fixture()
    assert plan["objects"][0]["path"] == "hmg-catalogue/" + SHA + ".jpg"
    assert plan["bucket"] == "products"
    assert plan["mappings"][0]["storage_uri"] == "storage://products/hmg-catalogue/" + SHA + ".jpg"


def test_nonverified_or_external_source_never_planned():
    catalogue = {"app_slug": "hmg-studio", "organization_id": "913d46eb-585d-5a5c-b1d4-b9d22052a8d6", "rows": [{"id": "0ddcc7fd-234f-509b-975a-762f640bd262", "image": "https://evil.com/a.jpg"}]}
    with pytest.raises(ValueError):
        plan_media(catalogue, [])
    catalogue["rows"][0]["image"] = URL
    with pytest.raises(ValueError, match="not verified"):
        plan_media(catalogue, [{"url": URL, "verified": False}])


def test_exact_private_bucket_identity_required():
    bucket = {"id": 662, "app": 694, "slug": "products", "visibility": "private", "storage_provider": "s3"}
    validate_bucket(bucket)
    for field, bad in (("id", 663), ("app", 123), ("visibility", "public"), ("slug", "images")):
        with pytest.raises(ValueError):
            validate_bucket({**bucket, field: bad})


def test_upload_absent_object_once_verify_bytes_then_map():
    stored = {}; writes = []
    def upload(entry, body):
        writes.append(entry["path"]); stored[entry["path"]] = body; return 201
    result = copy_media(fixture(), lambda url: (BODY, "image/jpeg"), stored.get, upload)
    assert len(writes) == 1 and len(result["verified_mappings"]) == 1 and not result["aborted"]
    assert result["database_updates"] == 0


def test_existing_identical_object_skips_upload_and_different_object_aborts():
    def forbidden(*args):
        raise AssertionError("Must not upload")
    result = copy_media(fixture(), forbidden, lambda path: BODY, forbidden)
    assert result["skipped"] and result["verified_mappings"]
    result = copy_media(fixture(), forbidden, lambda path: b"different", forbidden)
    assert result["aborted"] and not result["verified_mappings"]


def test_source_change_aborts_before_upload():
    writes = []
    result = copy_media(fixture(), lambda url: (b"\xff\xd8\xffchanged", "image/jpeg"), lambda path: None, lambda *args: writes.append(args))
    assert result["aborted"] and not writes


def test_unknown_upload_outcome_reconciles_without_retry_and_aborts():
    stored = {}; writes = []
    def upload(entry, body):
        writes.append(entry["path"]); stored[entry["path"]] = body
        raise TimeoutError("do not expose this secret")
    result = copy_media(fixture(), lambda url: (BODY, "image/jpeg"), stored.get, upload)
    assert result["aborted"] and len(writes) == 1 and len(result["verified_mappings"]) == 1
    assert "secret" not in str(result)


def test_read_denial_is_not_absence_and_does_not_upload():
    def denied(path):
        raise PermissionError("403")
    writes = []
    result = copy_media(fixture(), lambda url: (BODY, "image/jpeg"), denied, lambda *args: writes.append(args))
    assert result["aborted"] and not writes


def test_mappings_must_match_private_content_addressed_path():
    plan = fixture(); plan["mappings"][0]["storage_uri"] = "https://evil.com/tracker"
    with pytest.raises(ValueError):
        copy_media(plan, lambda url: (BODY, "image/jpeg"), lambda path: None, lambda *args: 201)


def test_native_reader_never_treats_403_as_missing():
    with httpx.Client(transport=httpx.MockTransport(lambda request: httpx.Response(403))) as client:
        with pytest.raises(httpx.HTTPStatusError):
            native_reader(client)(fixture()["objects"][0]["path"])


def test_native_reader_verifies_private_metadata_and_never_follows_redirects():
    path = fixture()["objects"][0]["path"]
    requests = []
    def transport(request):
        requests.append(request)
        if request.url.params.get("metadata"):
            return httpx.Response(200, json={"data": {"bucket": 662, "visibility": "private", "file_path": path}})
        return httpx.Response(302, headers={"location": "https://evil.com/collect"})
    with httpx.Client(transport=httpx.MockTransport(transport)) as client:
        with pytest.raises(ValueError):
            native_reader(client)(path)
    assert len(requests) == 2
    assert all(request.url.host == "insurance.taruvi.cloud" for request in requests)


def test_native_upload_uses_scoped_multipart_arrays_without_metadata_changes():
    requests = []
    def transport(request):
        requests.append(request)
        return httpx.Response(201, json={"data": {"uploaded_count": 1, "failed_count": 0, "total": 1}})
    with httpx.Client(transport=httpx.MockTransport(transport)) as client:
        assert native_upload(client)(fixture()["objects"][0], BODY) == 201
    request = requests[0]
    assert request.method == "POST" and request.url.path == "/api/apps/hmg-studio/storage/buckets/products/objects/batch-upload/"
    assert b'name="files"' in request.content and b'name="paths"' in request.content and b'name="metadata"' in request.content
    assert b'visibility' not in request.content


@pytest.mark.parametrize("case", ["duplicate_object", "duplicate_product", "oversized", "false_size", "wrong_source"])
def test_adversarial_media_plan_rejected_before_network(case):
    plan = fixture()
    if case == "duplicate_object":
        plan["objects"].append(plan["objects"][0].copy())
    elif case == "duplicate_product":
        plan["mappings"].append(plan["mappings"][0].copy())
    elif case == "oversized":
        plan["objects"][0]["bytes"] = 9 * 1024 * 1024
    elif case == "false_size":
        plan["objects"][0]["bytes"] = False
    else:
        plan["mappings"][0]["source_url"] = "https://www.hmgstones.com/assets/images/products/wrong.jpg"
    def forbidden(*args):
        raise AssertionError("No network permitted for malformed plan")
    with pytest.raises(ValueError):
        copy_media(plan, forbidden, forbidden, forbidden)


def test_public_fetch_client_disables_stale_keepalive_without_credentials(monkeypatch):
    captured = {}
    def create(**kwargs):
        captured.update(kwargs); return object()
    monkeypatch.setattr(httpx, "Client", create)
    public_client()
    assert captured["limits"].max_keepalive_connections == 0
    assert captured["trust_env"] is False and "headers" not in captured


def test_read_failure_records_phase_and_no_upload_attempt():
    def failed_source(url):
        raise httpx.RemoteProtocolError("server disconnected")
    result = copy_media(fixture(), failed_source, lambda path: None, lambda *args: 201)
    assert result["failures"][0]["phase"] == "source_read"
    assert result["failures"][0]["upload_attempted"] is False
