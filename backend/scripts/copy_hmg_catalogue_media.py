"""Copy hash-verified public catalogue raster images into Studio's private products bucket.

Default writes a dry-run plan only. --apply requires its reviewed SHA-256.
No database edits, bucket configuration, policy or visibility changes are made.
Existing paths are downloaded and compared, never intentionally overwritten.
"""
import argparse
import hashlib
import json
import re
from urllib.parse import unquote
from uuid import UUID

import httpx

from import_hmg_catalogue import EVIDENCE, ORG, canonical_url, fetch_bounded, image_signature
from provision_erp import environment

ORIGIN = "https://insurance.taruvi.cloud"
BUCKET_URL = ORIGIN + "/api/apps/hmg-studio/storage/buckets/products/"
OBJECTS_URL = BUCKET_URL + "objects/"
MAX_BYTES = 8 * 1024 * 1024
EXTENSIONS = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}


def public_client():
    # The public source occasionally closes keep-alive sockets without a usable
    # response. Fresh connections avoid reusing those sockets; no retry needed.
    return httpx.Client(timeout=20, trust_env=False, limits=httpx.Limits(max_keepalive_connections=0))


def validate_bucket(bucket):
    expected = {"id": 662, "app": 694, "slug": "products", "visibility": "private", "storage_provider": "s3"}
    if any(bucket.get(key) != value for key, value in expected.items()):
        raise ValueError("Unexpected private Studio products bucket identity")


def plan_media(catalogue, images):
    if catalogue.get("app_slug") != "hmg-studio" or catalogue.get("organization_id") != ORG:
        raise ValueError("Unexpected catalogue scope")
    verified = {image["url"]: image for image in images if image.get("verified")}
    objects = {}; mappings = []
    for row in catalogue["rows"]:
        UUID(row["id"])
        url = row.get("image")
        if not url:
            continue
        if canonical_url(unquote(url), "image") != url or url not in verified:
            raise ValueError("Image was not verified against the exact public catalogue URL")
        image = verified[url]; digest = image.get("sha256", ""); mime = image.get("content_type")
        if not re.fullmatch(r"[0-9a-f]{64}", digest) or mime not in EXTENSIONS or not 0 < image.get("bytes", 0) <= MAX_BYTES:
            raise ValueError("Invalid verified image digest, MIME or size")
        path = "hmg-catalogue/" + digest + "." + EXTENSIONS[mime]
        entry = {"path": path, "source_url": url, "source_urls": [], "sha256": digest, "mime": mime, "bytes": image["bytes"]}
        if path in objects and any(objects[path][key] != entry[key] for key in ("sha256", "mime", "bytes")):
            raise ValueError("Conflicting content-addressed object")
        objects.setdefault(path, entry)
        objects[path]["source_urls"] = sorted(set(objects[path]["source_urls"] + [url]))
        mappings.append({"product_id": row["id"], "source_url": url, "path": path, "storage_uri": "storage://products/" + path})
    if len({m["product_id"] for m in mappings}) != len(mappings):
        raise ValueError("Duplicate product media mapping")
    return {"app_slug": "hmg-studio", "organization_id": ORG, "bucket": "products", "bucket_id": 662, "app_id": 694,
            "visibility": "private", "objects": sorted(objects.values(), key=lambda value: value["path"]),
            "mappings": mappings, "database_updates": 0}


def validate_entry(entry, body):
    return (isinstance(body, bytes) and len(body) == entry["bytes"] and len(body) <= MAX_BYTES and
            hashlib.sha256(body).hexdigest() == entry["sha256"] and image_signature(body, entry["mime"]))


def copy_media(plan, fetch_source, read_stored, upload, save=lambda report: None):
    if (plan.get("app_slug"), plan.get("bucket"), plan.get("bucket_id"), plan.get("app_id"), plan.get("visibility"), plan.get("organization_id")) != ("hmg-studio", "products", 662, 694, "private", ORG):
        raise ValueError("Unexpected destination scope")
    for entry in plan["objects"]:
        if type(entry.get("bytes")) is not int or not 0 < entry["bytes"] <= MAX_BYTES:
            raise ValueError("Invalid bounded object size")
        if not re.fullmatch(r"hmg-catalogue/[0-9a-f]{64}\.(jpg|png|webp)", entry["path"]) or entry["path"] != "hmg-catalogue/" + entry["sha256"] + "." + EXTENSIONS.get(entry["mime"], "invalid"):
            raise ValueError("Invalid content-addressed path")
        if canonical_url(unquote(entry["source_url"]), "image") != entry["source_url"]:
            raise ValueError("Invalid source URL")
        if not isinstance(entry.get("source_urls"), list) or entry["source_url"] not in entry["source_urls"]:
            raise ValueError("Missing source-image correspondence")
        for source in entry["source_urls"]:
            if canonical_url(unquote(source), "image") != source:
                raise ValueError("Invalid equivalent image URL")
    paths = {entry["path"] for entry in plan["objects"]}
    if len(paths) != len(plan["objects"]):
        raise ValueError("Duplicate planned object paths")
    by_path = {entry["path"]: entry for entry in plan["objects"]}
    if len({mapping["product_id"] for mapping in plan["mappings"]}) != len(plan["mappings"]):
        raise ValueError("Duplicate product mappings")
    for mapping in plan["mappings"]:
        UUID(mapping["product_id"])
        if mapping["path"] not in paths or mapping["storage_uri"] != "storage://products/" + mapping["path"]:
            raise ValueError("Invalid private storage mapping")
        if canonical_url(unquote(mapping["source_url"]), "image") != mapping["source_url"]:
            raise ValueError("Invalid mapping source URL")
        if mapping["source_url"] not in by_path[mapping["path"]]["source_urls"]:
            raise ValueError("Source URL and content hash path do not correspond")
    report = {"app_slug": "hmg-studio", "bucket": "products", "uploaded": [], "skipped": [], "verified_paths": [], "verified_mappings": [], "failures": [], "aborted": False, "database_updates": 0}
    for entry in plan["objects"]:
        path = entry["path"]; attempted_upload = False; status = None
        phase = "destination_read"
        try:
            old = read_stored(path)
            if old is not None:
                if not validate_entry(entry, old):
                    raise ValueError("Existing object differs; will not overwrite")
                report["skipped"].append(path)
            else:
                phase = "source_read"
                body, mime = fetch_source(entry["source_url"])
                if mime != entry["mime"] or not validate_entry(entry, body):
                    raise ValueError("Source bytes changed since approved image snapshot")
                attempted_upload = True
                phase = "upload"
                status = upload(entry, body)
                if status is None or not 200 <= status < 300:
                    raise RuntimeError("Upload was not successful")
                phase = "upload_readback"
                if not validate_entry(entry, read_stored(path)):
                    raise ValueError("Uploaded object readback does not match source digest")
                report["uploaded"].append(path)
            report["verified_paths"].append(path)
        except Exception as error:
            # A timeout/partial response may have persisted the object. Always
            # reconcile it, never replay the upload or delete anything.
            if attempted_upload:
                try:
                    if validate_entry(entry, read_stored(path)):
                        report["verified_paths"].append(path)
                except Exception:
                    pass
            report["aborted"] = True
            report["failures"].append({"path": path, "phase": phase, "http_status": status, "error_type": type(error).__name__, "upload_attempted": attempted_upload, "retry_sent": False})
        report["verified_mappings"] = [mapping for mapping in plan["mappings"] if mapping["path"] in report["verified_paths"]]
        save(report)
        if report["aborted"]:
            break
    return report


def native_reader(client):
    def read(path):
        metadata = client.get(OBJECTS_URL + path + "/", params={"metadata": "true"}, follow_redirects=False)
        if metadata.status_code == 404:
            return None
        metadata.raise_for_status()
        payload = metadata.json()
        obj = payload.get("data", payload)
        if obj.get("bucket") != 662 or obj.get("visibility") != "private" or obj.get("file_path") != path:
            raise ValueError("Unexpected object metadata or privacy")
        with client.stream("GET", OBJECTS_URL + path + "/", follow_redirects=False) as response:
            if response.status_code != 200:
                raise ValueError("Private download must be a direct authenticated 200 response")
            if int(response.headers.get("content-length", "0")) > MAX_BYTES:
                raise ValueError("Stored object exceeds bounded size")
            chunks = []; size = 0
            for chunk in response.iter_bytes():
                size += len(chunk)
                if size > MAX_BYTES:
                    raise ValueError("Stored object exceeds bounded size")
                chunks.append(chunk)
            return b"".join(chunks)
    return read


def native_upload(client):
    def upload(entry, body):
        response = client.post(OBJECTS_URL + "batch-upload/", files=[("files", (entry["path"].split("/")[-1], body, entry["mime"]))],
                               data={"paths": json.dumps([entry["path"]]), "metadata": json.dumps([{"source": entry["source_url"], "sha256": entry["sha256"], "catalogue_reference": True}])}, follow_redirects=False)
        if not 200 <= response.status_code < 300:
            return response.status_code
        data = response.json().get("data", {})
        if data.get("uploaded_count") != 1 or data.get("failed_count") != 0 or data.get("total") != 1:
            raise ValueError("Unexpected or partial upload response")
        return response.status_code
    return upload


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--approve-plan-sha256")
    args = parser.parse_args()
    path = EVIDENCE / "hmg-catalogue-media-plan.json"
    if not args.apply:
        catalogue = json.loads((EVIDENCE / "hmg-catalogue-plan.json").read_text(encoding="utf-8"))
        images = json.loads((EVIDENCE / "hmg-catalogue-images.json").read_text(encoding="utf-8"))
        plan = plan_media(catalogue, images)
        path.write_text(json.dumps(plan, indent=2), encoding="utf-8")
        print(json.dumps({"dry_run": True, "objects": len(plan["objects"]), "mappings": len(plan["mappings"]), "bytes": sum(entry["bytes"] for entry in plan["objects"]), "storage_writes": 0}))
        return
    raw = path.read_bytes()
    if args.approve_plan_sha256 != hashlib.sha256(raw).hexdigest():
        raise SystemExit("Exact reviewed plan SHA-256 required; no uploads sent")
    plan = json.loads(raw); env = environment()
    with httpx.Client(timeout=45, trust_env=False, headers={"Authorization": "Api-Key " + env["TARUVI_API_KEY"], "X-App-Slug": "hmg-studio"}) as client, public_client() as public:
        response = client.get(BUCKET_URL, follow_redirects=False); response.raise_for_status()
        bucket = response.json(); validate_bucket(bucket)
        def source(url):
            body, mime, _ = fetch_bounded(public, url, "image", MAX_BYTES)
            return body, mime
        def save(report):
            report["plan_sha256"] = args.approve_plan_sha256
            (EVIDENCE / "hmg-catalogue-media-copy.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
        result = copy_media(plan, source, native_reader(client), native_upload(client), save)
        response = client.get(BUCKET_URL, follow_redirects=False); response.raise_for_status()
        after = response.json(); validate_bucket(after)
        for key in ("id", "app", "slug", "visibility", "storage_provider", "file_size_limit", "allowed_mime_types"):
            if bucket.get(key) != after.get(key):
                raise ValueError("Bucket configuration changed during copy")
        print(json.dumps({"uploaded": len(result["uploaded"]), "skipped": len(result["skipped"]), "verified_mappings": len(result["verified_mappings"]), "aborted": result["aborted"]}))
        if result["aborted"]:
            raise SystemExit(1)


if __name__ == "__main__":
    main()
