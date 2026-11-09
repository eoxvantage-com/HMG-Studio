import copy
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from link_hmg_catalogue_media import plan_links, link_images
from import_hmg_catalogue import NOTE, ORG

PRODUCT = "ce75bdf5-4265-5e0c-92dc-3e5fd64b78bc"
SOURCE = "https://www.hmgstones.com/assets/images/products/granite/10-pigeon-eye-granite.jpg"
PATH = "hmg-catalogue/" + "a" * 64 + ".jpg"
URI = "storage://products/" + PATH


def fixture():
    row = {"id": PRODUCT, "organization_id": ORG, "sku": "HMG-WEB-CE75BDF542655E0C92DC3E5FD64B78BC", "notes": NOTE + "Source: https://www.hmgstones.com/product-details.php?product_id=10&product_name=granite", "image": SOURCE, "stock": 0, "price": 0, "selling_price": None, "purchase_price": None, "is_active": False}
    catalogue = {"app_slug": "hmg-studio", "organization_id": ORG, "rows": [row]}
    media = {"app_slug": "hmg-studio", "bucket": "products", "aborted": False, "verified_paths": [PATH], "verified_mappings": [{"product_id": PRODUCT, "path": PATH, "source_url": SOURCE, "storage_uri": URI}]}
    return catalogue, media


def test_link_plan_only_byte_verified_owned_product_matches():
    catalogue, media = fixture()
    plan = plan_links(catalogue, media)
    assert plan["links"][0]["patch"] == {"image": URI}
    assert plan["links"][0]["expected"] == catalogue["rows"][0]


@pytest.mark.parametrize("case", ["unverified", "wrong_source", "foreign_id", "bad_uri", "duplicate", "aborted"])
def test_invalid_mapping_rejected(case):
    catalogue, media = fixture()
    if case == "unverified": media["verified_paths"] = []
    elif case == "wrong_source": media["verified_mappings"][0]["source_url"] = "https://www.hmgstones.com/assets/images/products/other.jpg"
    elif case == "foreign_id": media["verified_mappings"][0]["product_id"] = "0ddcc7fd-234f-509b-975a-762f640bd262"
    elif case == "bad_uri": media["verified_mappings"][0]["storage_uri"] = "https://evil.com"
    elif case == "duplicate": media["verified_mappings"].append(media["verified_mappings"][0].copy())
    else: media["aborted"] = True
    with pytest.raises(ValueError): plan_links(catalogue, media)


def execute_fixture():
    catalogue, media = fixture(); plan = plan_links(catalogue, media)
    stored = copy.deepcopy(catalogue["rows"][0]); writes = []
    def read(identity):
        assert identity == PRODUCT
        return stored.copy()
    def patch(identity, values):
        assert identity == PRODUCT
        writes.append(values.copy()); stored.update(values); return 200
    return plan, stored, writes, read, patch


def test_link_updates_only_image_and_rerun_skips_exactly():
    plan, stored, writes, read, patch = execute_fixture()
    result = link_images(plan, read, patch)
    assert result["verified"] == [PRODUCT] and writes == [{"image": URI}]
    assert stored["stock"] == 0 and stored["price"] == 0
    assert link_images(plan, read, patch)["skipped"] == [PRODUCT]
    assert len(writes) == 1


@pytest.mark.parametrize("field,value", [("image", "user-new-image.jpg"), ("organization_id", "foreign"), ("stock", 7), ("is_active", True)])
def test_changed_user_or_business_record_is_not_modified(field, value):
    plan, stored, writes, read, patch = execute_fixture(); stored[field] = value
    result = link_images(plan, read, patch)
    assert result["aborted"] and not writes


def test_unknown_patch_outcome_reconciles_once_and_aborts_without_retry():
    plan, stored, writes, read, _ = execute_fixture()
    def patch(identity, values):
        writes.append(values.copy()); stored.update(values); raise TimeoutError("secret")
    result = link_images(plan, read, patch)
    assert result["aborted"] and result["verified"] == [PRODUCT] and len(writes) == 1
    assert "secret" not in str(result)


def test_incomplete_copy_cannot_generate_full_link_plan():
    catalogue, media = fixture(); media["verified_mappings"] = []
    with pytest.raises(ValueError):
        plan_links(catalogue, media)


@pytest.mark.parametrize("case", ["extra_patch_field", "wrong_bucket", "duplicate"])
def test_link_apply_revalidates_narrow_patch_before_network(case):
    plan, _, writes, read, patch = execute_fixture()
    if case == "extra_patch_field": plan["links"][0]["patch"]["stock"] = 50
    elif case == "wrong_bucket": plan["links"][0]["patch"]["image"] = "storage://images/other.jpg"
    else: plan["links"].append(plan["links"][0].copy())
    with pytest.raises(ValueError): link_images(plan, read, patch)
    assert not writes


def test_link_readback_preserves_extra_existing_fields_not_in_import_plan():
    plan, stored, writes, read, _ = execute_fixture()
    stored['metadata'] = '{"sentinel":"keep"}'
    stored['barcode'] = 'EXISTING-DO-NOT-CHANGE'
    def broken_backend(identity, values):
        writes.append(values.copy()); stored.update(values); stored['metadata'] = None; return 200
    result = link_images(plan, read, broken_backend)
    assert result['aborted'] and result['verified'] == [] and len(writes) == 1


def test_only_server_updated_at_may_change_alongside_image():
    plan, stored, _, read, _ = execute_fixture()
    stored['updated_at'] = '2026-11-06T10:00:00'
    stored['created_at'] = '2026-11-06T09:00:00'
    def timestamp_backend(identity, values):
        stored.update(values); stored['updated_at'] = '2026-11-06T11:00:00'; return 200
    result = link_images(plan, read, timestamp_backend)
    assert result['verified'] == [PRODUCT] and not result['aborted']


def test_preservation_does_not_treat_boolean_as_integer():
    plan, stored, _, read, _ = execute_fixture(); stored['metadata'] = {'flag': True}
    def changed_type(identity, values):
        stored.update(values); stored['metadata'] = {'flag': 1}; return 200
    result = link_images(plan, read, changed_type)
    assert result['aborted'] and result['verified'] == []
