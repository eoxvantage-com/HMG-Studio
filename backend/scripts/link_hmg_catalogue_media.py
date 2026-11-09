"""Link verified private product photos on unchanged, owned catalogue references only.

Default creates a review plan; --apply requires exact plan SHA-256. PATCH payload
contains only image. Fresh read guards prevent intentional overwrites but native
PATCH does not provide an established compare-and-swap/concurrency guarantee.
No policy changes, stock transactions, price updates or normal-user write claims.
"""
import argparse
import copy
import hashlib
import json
import re
from urllib.parse import unquote
from uuid import UUID, NAMESPACE_URL, uuid5

import httpx

from import_hmg_catalogue import EVIDENCE, NOTE, ORG, canonical_url, reconcile
from provision_erp import environment

BASE = "https://insurance.taruvi.cloud/api/apps/hmg-studio/datatables/products/data/"


def verify_preserved(before, after):
    # updated_at is the documented server-maintained product timestamp. No
    # other extra field (including unknown future columns) may silently change.
    def snapshot(row):
        value = {key: value for key, value in row.items() if key not in {"image", "updated_at"}}
        return json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(",", ":"), allow_nan=False)
    if snapshot(before) != snapshot(after):
        raise ValueError("Non-image product fields changed during image link")


def validate_expected(row):
    UUID(row["id"])
    reconcile([row], [])
    source = canonical_url(row["notes"].removeprefix(NOTE + "Source: "), "product")
    if row["id"] != str(uuid5(NAMESPACE_URL, "hmg-studio/public-catalogue/v1/" + source)) or row["sku"] != "HMG-WEB-" + UUID(row["id"]).hex.upper():
        raise ValueError("Unexpected catalogue identity")
    if row["organization_id"] != ORG or row["is_active"] is not False or type(row["stock"]) is not int or row["stock"] != 0 or row.get("selling_price") is not None or row.get("purchase_price") is not None:
        raise ValueError("Only inactive unpriced owned references can be linked")
    if canonical_url(unquote(row["image"]), "image") != row["image"]:
        raise ValueError("Unexpected original public image")


def plan_links(catalogue, media):
    if catalogue.get("app_slug") != "hmg-studio" or catalogue.get("organization_id") != ORG or media.get("app_slug") != "hmg-studio" or media.get("bucket") != "products" or media.get("aborted") is not False:
        raise ValueError("Unexpected catalogue or media verification scope")
    rows = {row["id"]: row for row in catalogue["rows"]}; links = []
    for mapping in media["verified_mappings"]:
        identity = mapping["product_id"]; path = mapping["path"]; uri = mapping["storage_uri"]
        if identity not in rows or path not in media["verified_paths"] or not re.fullmatch(r"hmg-catalogue/[0-9a-f]{64}\.(jpg|png|webp)", path) or uri != "storage://products/" + path:
            raise ValueError("Unverified private object mapping")
        row = rows[identity]; validate_expected(row)
        if mapping["source_url"] != row["image"]:
            raise ValueError("Source image no longer matches the catalogue reference")
        links.append({"id": identity, "expected": row, "patch": {"image": uri}})
    if len({link["id"] for link in links}) != len(links):
        raise ValueError("Duplicate product links")
    if {link["id"] for link in links} != {row["id"] for row in catalogue["rows"] if row.get("image")}:
        raise ValueError("Image copy is incomplete for the reviewed catalogue")
    return {"app_slug": "hmg-studio", "organization_id": ORG, "links": links, "image_field_only": True, "atomic_compare_and_swap_verified": False}


def link_images(plan, read, patch, save=lambda report: None):
    if plan.get("app_slug") != "hmg-studio" or plan.get("organization_id") != ORG or not plan.get("image_field_only"):
        raise ValueError("Unexpected linking scope")
    if len({link["id"] for link in plan["links"]}) != len(plan["links"]):
        raise ValueError("Duplicate product links")
    for link in plan["links"]:
        validate_expected(link["expected"])
        if link["id"] != link["expected"]["id"] or set(link["patch"]) != {"image"} or not re.fullmatch(r"storage://products/hmg-catalogue/[0-9a-f]{64}\.(jpg|png|webp)", link["patch"]["image"]):
            raise ValueError("Only reviewed image links may be patched")
    report = {"app_slug": "hmg-studio", "organization_id": ORG, "image_field_only": True, "updated": [], "skipped": [], "verified": [], "failures": [], "aborted": False, "atomic_compare_and_swap_verified": False}
    for link in plan["links"]:
        identity = link["id"]; desired = {**link["expected"], **link["patch"]}; attempted = False; status = None
        try:
            old = copy.deepcopy(read(identity))
            if old.get("image") == desired["image"]:
                if reconcile([desired], [old]):
                    raise ValueError("Already-linked record did not match")
                report["skipped"].append(identity)
            else:
                if reconcile([link["expected"]], [old]):
                    raise ValueError("Expected owned product missing")
                attempted = True
                status = patch(identity, link["patch"])
                if status is None or not 200 <= status < 300:
                    raise ValueError("Native image patch was unsuccessful")
                after = read(identity)
                if reconcile([desired], [after]):
                    raise ValueError("Image patch readback mismatch")
                verify_preserved(old, after)
                report["updated"].append(identity)
            report["verified"].append(identity)
        except Exception as error:
            if attempted:
                try:
                    after = read(identity)
                    verify_preserved(old, after)
                    if not reconcile([desired], [after]):
                        report["verified"].append(identity)
                except Exception:
                    pass
            report["aborted"] = True
            report["failures"].append({"id": identity, "http_status": status, "error_type": type(error).__name__, "patch_attempted": attempted, "retry_sent": False})
        save(report)
        if report["aborted"]:
            break
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--approve-plan-sha256")
    args = parser.parse_args()
    path = EVIDENCE / "hmg-catalogue-media-links-plan.json"
    if not args.apply:
        catalogue = json.loads((EVIDENCE / "hmg-catalogue-plan.json").read_text(encoding="utf-8"))
        media = json.loads((EVIDENCE / "hmg-catalogue-media-copy.json").read_text(encoding="utf-8"))
        plan = plan_links(catalogue, media)
        path.write_text(json.dumps(plan, indent=2, ensure_ascii=False), encoding="utf-8")
        print(json.dumps({"dry_run": True, "links": len(plan["links"]), "patch_fields": ["image"], "database_writes": 0}))
        return
    raw = path.read_bytes()
    if args.approve_plan_sha256 != hashlib.sha256(raw).hexdigest():
        raise SystemExit("Exact reviewed plan SHA-256 required; no writes sent")
    plan = json.loads(raw); env = environment()
    with httpx.Client(timeout=45, trust_env=False, headers={"Authorization": "Api-Key " + env["TARUVI_API_KEY"], "X-App-Slug": "hmg-studio"}) as client:
        def read(identity):
            response = client.get(BASE, params={"id": identity, "page_size": 2}, follow_redirects=False)
            response.raise_for_status(); body = response.json(); rows = body.get("data")
            if not isinstance(rows, list) or len(rows) != 1 or body.get("total") != 1 or rows[0].get("id") != identity:
                raise ValueError("Expected exactly one owned product")
            return rows[0]
        def patch(identity, values):
            return client.patch(BASE + identity + "/", json=values, follow_redirects=False).status_code
        def save(report):
            report["plan_sha256"] = args.approve_plan_sha256
            (EVIDENCE / "hmg-catalogue-media-links.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
        result = link_images(plan, read, patch, save)
    print(json.dumps({"updated": len(result["updated"]), "skipped": len(result["skipped"]), "verified": len(result["verified"]), "aborted": result["aborted"]}))
    if result["aborted"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
