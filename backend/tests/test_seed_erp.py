from pathlib import Path
import importlib.util
import json
import copy
import pytest

def module():
    spec = importlib.util.spec_from_file_location("seed",Path(__file__).parents[1]/"scripts"/"seed_erp.py")
    result = importlib.util.module_from_spec(spec); spec.loader.exec_module(result); return result

def test_fixtures_are_stable_isolated_and_schema_valid():
    seed=module(); one=seed.fixtures(); assert one==seed.fixtures()
    manifest=json.loads((Path(__file__).parents[1]/"schema"/"erp-manifest.json").read_text())
    schemas={r["name"]:r["schema"] for r in manifest["resources"]}
    for table,rows in one.items():
        names={f["name"] for f in schemas[table]["fields"]}
        for row in rows:
            assert set(row)<=names
            if "organization_id" in names: assert row["organization_id"]==seed.ORG
            for field in schemas[table]["fields"]:
                if field.get("constraints",{}).get("required") and "default" not in field and not field.get("x-auto-generated"):
                    assert row.get(field["name"]) is not None, (table,field["name"])
    assert len(one["products"])>=8
    assert all(r["stock_committed"] is False for r in one["orders"])
    assert all(r["status"]=="draft" for r in one["purchase_orders"])
    assert all("@example.invalid" in r["email"] for r in one["customers"])

def test_seed_does_not_overwrite_mismatched_record():
    seed=module()
    assert seed.can_skip({"id":"x","name":"SYNTHETIC"},{"id":"x","name":"SYNTHETIC","extra":None})
    assert not seed.can_skip({"id":"x","name":"SYNTHETIC"},{"id":"x","name":"business"})


@pytest.mark.parametrize("table,legacy,typed", [
    ("saved_reports", ["columns", "filters", "sort"], ["columns_json", "filters_json", "sort_json"]),
    ("activity_logs", ["properties"], ["properties_json"]),
])
def test_typed_wire_adapter_preserves_logical_fixtures_and_legacy_compare(table, legacy, typed):
    seed = module()
    logical = seed.fixtures()[table][0]
    before = copy.deepcopy(logical)
    wire = seed.fixture_wire(table, logical)
    assert logical == before
    assert not set(legacy) & set(wire)
    assert set(typed) <= set(wire)
    assert seed.can_skip_fixture(table, logical, wire)
    encoded = {**logical, **{key: json.dumps(logical[key]) for key in legacy}}
    assert seed.can_skip_fixture(table, logical, encoded)
    combined = {**encoded, **{key: wire[key] for key in typed}}
    assert seed.can_skip_fixture(table, logical, combined)
    combined[legacy[0]] = '"changed"'
    assert not seed.can_skip_fixture(table, logical, combined)
    combined = {**encoded, **{key: wire[key] for key in typed}}
    combined[typed[0]] = {"changed": True}
    assert not seed.can_skip_fixture(table, logical, combined)


def test_wire_adapter_does_not_change_unrelated_resources_or_comparisons():
    seed = module()
    row = seed.fixtures()["customers"][0]
    assert seed.fixture_wire("customers", row) == row
    assert seed.fixture_wire("customers", row) is not row
    assert seed.can_skip_fixture("customers", row, row)
    assert not seed.can_skip_fixture("customers", row, {**row, "name": "changed"})


def test_wire_adapter_shapes_are_native_and_invalid_json_is_not_hidden():
    seed = module()
    report = seed.fixtures()["saved_reports"][0]
    wire = seed.fixture_wire("saved_reports", report)
    assert wire["columns_json"] == report["columns"]
    assert wire["filters_json"] == {"items": []}
    assert wire["sort_json"] == report["sort"]
    with pytest.raises(ValueError):
        seed.fixture_wire("saved_reports", {**report, "columns": "[]"})
    with pytest.raises(ValueError):
        seed.fixture_wire("saved_reports", {**report, "filters": ["wrong"]})
    assert not seed.can_skip_fixture("saved_reports", report, {**report, "sort": "invalid json"})
    assert not seed.can_skip_fixture("saved_reports", report, {**wire, "sort_json": None})


def test_structured_fixture_boolean_is_not_numeric_one():
    seed = module()
    expected = seed.fixtures()["activity_logs"][0]
    wire = seed.fixture_wire("activity_logs", expected)
    changed = {**expected["properties"], "synthetic": 1}
    assert not seed.can_skip_fixture("activity_logs", expected, {**wire, "properties_json": changed})
    assert not seed.can_skip_fixture("activity_logs", expected, {**wire, "properties": json.dumps(changed)})

def test_json_readback_compares_values_not_object_key_order():
    seed=module()
    assert seed.can_skip({"sort":{"field":"name","direction":"asc"}}, {"sort":{"direction":"asc","field":"name"}})
    assert not seed.can_skip({"sort":{"field":"name","direction":"asc"}}, {"sort":{"direction":"desc","field":"name"}})

def test_native_naive_datetime_readback_is_same_utc_instant():
    seed=module()
    assert seed.can_skip({"order_date":"2026-11-06T09:00:00Z"},{"order_date":"2026-11-06T09:00:00"})
    assert not seed.can_skip({"order_date":"2026-11-06T09:00:00Z"},{"order_date":"2026-11-06T09:01:00"})

def test_extended_fixtures_are_inert_coherent_drafts():
    seed = module(); data = seed.fixtures()
    assert data["stock_transfer_items"][0]["stock_transfer_id"] == seed.uid("transfer/1")
    assert data["stock_transfers"][0]["status"] == "pending"
    audit = data["stock_audit_items"][0]
    assert audit["counted_quantity"] is None and audit["status"] == "pending"
    assert audit["system_quantity"] == data["products"][0]["stock"]
    component = data["product_components"][0]
    work = next(row for row in data["work_orders"] if row["id"] == seed.uid("work/2"))
    item = data["work_order_items"][0]
    product = next(row for row in data["products"] if row["id"] == work["product_id"])
    assert product["type"] == "assembly" and product["stock"] == 0
    assembly_ids = {row["id"] for row in data["products"] if row["type"] == "assembly"}
    assert all(row["product_id"] in assembly_ids for row in data["work_orders"])
    assert component["parent_product_id"] == product["id"]
    assert item["product_id"] == component["component_product_id"]
    assert item["quantity_required"] == component["quantity"] * work["quantity"]
    assert work["status"] == "draft" and work["quantity_produced"] == 0
    assert item["quantity_consumed"] == 0
    shipment = data["shipments"][0]
    assert shipment["status"] == "pending" and shipment["carrier"] == "manual"
    assert shipment["notify_customer"] is False
    assert not any(shipment.get(k) for k in ("shipped_at", "tracking_number", "label_url", "customer_notification_queued_at"))
    line = data["shipment_items"][0]
    order_line = next(row for row in data["order_items"] if row["id"] == line["order_item_id"])
    assert line["shipment_id"] == shipment["id"] and order_line["order_id"] == shipment["order_id"]
    assert 0 < line["quantity"] <= order_line["quantity"]
    assert data["saved_reports"][0]["is_shared"] is False
    assert data["saved_reports"][0]["data_source"] == "products"
    assert data["activity_logs"][0]["properties"]["synthetic"] is True
    for row in data["warehouse_reorder_points"]:
        assert 0 <= row["min_stock"] <= row["reorder_point"] <= row["max_stock"]
    # No fabricated shipped history to make a return eligible; no jobs or integrations.
    assert not set(data) & {"return_orders", "return_order_items", "report_schedules", "email_logs",
                            "plugins", "webhooks", "webhook_deliveries", "order_payments",
                            "stock_reservations", "work_order_allocations", "work_order_outputs"}

def test_all_fixture_ids_types_enums_and_foreign_keys_are_valid():
    from datetime import datetime
    from decimal import Decimal
    from uuid import UUID
    seed = module(); data = seed.fixtures()
    schemas = {r["name"]: r["schema"] for r in json.loads(
        (Path(__file__).parents[1]/"schema"/"erp-manifest.json").read_text())["resources"]}
    ids = [row["id"] for rows in data.values() for row in rows]
    assert len(ids) == len(set(ids))
    for table, rows in data.items():
        schema = schemas[table]
        for row in rows:
            for field in schema["fields"]:
                value = row.get(field["name"])
                if value is None: continue
                constraints = field.get("constraints", {})
                if field.get("format") == "uuid": UUID(value)
                if field["type"] == "integer": assert type(value) is int
                if field["type"] == "number": assert Decimal(str(value)).is_finite()
                if field["type"] == "boolean": assert type(value) is bool
                if field["type"] == "string": assert isinstance(value, str)
                if field["type"] in ("date", "datetime"): datetime.fromisoformat(value.replace("Z", "+00:00"))
                if "enum" in constraints: assert value in constraints["enum"]
                if "maxLength" in constraints: assert len(value) <= constraints["maxLength"]
                if "minimum" in constraints: assert Decimal(str(value)) >= constraints["minimum"]
            for fk in schema.get("foreignKeys", []):
                values = tuple(row.get(key) for key in fk["fields"])
                if any(value is None for value in values): continue
                reference = fk["reference"]
                target = reference["resource"].removeprefix("hmg_studio_")
                if target == "auth_user": assert values == (seed.QA_USER,)
                else:
                    assert values in {tuple(record[key] for key in reference["fields"])
                                      for record in data[target]}, (table, fk)
