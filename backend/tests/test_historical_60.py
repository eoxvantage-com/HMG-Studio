import copy
import importlib.util
import sys
from pathlib import Path

import pytest

SCRIPTS = Path(__file__).parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))


def planner():
    spec = importlib.util.spec_from_file_location("historical_60", SCRIPTS / "generate_historical_60.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_exact_sixty_deterministic_headers_support_separate_and_offline():
    m = planner()
    one = m.build_plan()
    assert one == m.build_plan()
    assert one["business_counts"] == {
        "orders": 16, "purchase_orders": 10, "return_orders": 4,
        "stock_adjustments": 8, "stock_transfers": 4,
        "work_orders": 4, "order_payments": 14,
    }
    assert sum(one["business_counts"].values()) == 60
    assert one["business_count"] == 60
    assert one["support_count"] == sum(one["support_counts"].values())
    assert not {"shipments", "shipment_items", "activity_logs", "users", "notifications"} & one["rows"].keys()
    assert one["workflow_execution_verified"] is False
    assert one["apply_supported"] is False
    assert m.validate_plan(one) is None


def test_six_month_chronology_and_private_illustrative_photos():
    m = planner(); plan = m.build_plan()
    assert {r["order_date"][5:7] for r in plan["rows"]["orders"]} == {"05", "06", "07", "08", "09", "10"}
    assert len(plan["image_provenance"]) == 4
    for p in plan["rows"]["products"][:4]:
        assert p["image"].startswith("storage://products/hmg-catalogue/")
        assert "illustrative" in p["description"].lower()
        assert p["name"].startswith("SYNTHETIC")
    assert all(e["after"] >= 0 for e in plan["stock_ledger"])
    assert all(r["type"] == "payment" and float(r["amount"]) > 0 for r in plan["rows"]["order_payments"])


@pytest.mark.parametrize("table,field,value", [
    ("products", "organization_id", "00000000-0000-0000-0000-000000000000"),
    ("products", "stock", -1),
    ("products", "stock", True),
    ("products", "image", "storage://products/not-verified.jpg"),
    ("products", "price", "NaN"),
    ("orders", "total", "1"),
    ("orders", "order_date", "2026-04-01T00:00:00Z"),
    ("orders", "delivered_at", "2026-05-01T00:00:00Z"),
    ("orders", "delivered_at", "2026-05-17T09:00:00+00:00"),
    ("order_items", "product_id", "00000000-0000-0000-0000-000000000000"),
    ("order_items", "quantity", 9999),
    ("order_payments", "amount", "999999999"),
    ("stock_adjustments", "quantity_after", 9999),
    ("stock_transfers", "to_location_id", "00000000-0000-0000-0000-000000000000"),
    ("work_order_items", "quantity_consumed", "999"),
    ("return_order_items", "quantity", 999),
    ("order_payments", "id", "00000000-0000-0000-0000-000000000000"),
    ("orders", "customer_email", "real@example.com"),
    ("order_payments", "voided_at", "2026-05-20T00:00:00Z"),
    ("stock_transfer_items", "quantity", -3),
    ("stock_adjustments", "type", "remove"),
    ("purchase_order_items", "updated_at", "2026-05-03T09:00:00Z"),
])
def test_rejects_tampered_scope_types_finances_chronology_and_stock(table, field, value):
    m = planner(); plan = m.build_plan()
    plan["rows"][table][0][field] = value
    with pytest.raises(ValueError):
        m.validate_plan(plan)


def test_rejects_duplicate_id_counts_ledger_and_unknown_fields():
    m = planner(); original = m.build_plan()
    for change in [
        lambda p: p["rows"]["customers"][1].update(id=p["rows"]["customers"][0]["id"]),
        lambda p: p.update(business_count=61),
        lambda p: p["stock_ledger"][0].update(delta=999),
        lambda p: p["rows"]["return_orders"][0].update(currency="INR"),
        lambda p: p["rows"]["products"][0].update(metadata={"pretend": True}),
    ]:
        plan = copy.deepcopy(original); change(plan)
        with pytest.raises(ValueError):
            m.validate_plan(plan)


def test_no_network_or_environment_loading_in_planner_source():
    source = (SCRIPTS / "generate_historical_60.py").read_text()
    assert "import httpx" not in source
    assert "scoped_calls" not in source
    assert "environment()" not in source
    assert "--apply" not in source


@pytest.mark.parametrize("table,field", [("orders", "warehouse_id"), ("work_orders", "warehouse_id"), ("stock_transfers", "from_warehouse_id")])
def test_rejects_valid_but_wrong_warehouse(table, field):
    m = planner(); plan = m.build_plan()
    plan["rows"][table][0][field] = m.load_inputs()[1]["external_rows"]["warehouses"][1]["id"]
    with pytest.raises(ValueError):
        m.validate_plan(plan)
