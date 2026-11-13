import { expect, it } from "vitest";
import { locationSummary, replenishment, reservations, stockLevels } from "./stockInsights";
import type { CommerceDocument, CommerceState } from "./commerceLedger";

const sale: CommerceDocument = { id: "so", kind: "sales_order", number: "SO-1", revision: 2, status: "approved", approval_status: "approved",
  draft: { customer_id: "c", order_date: "2026-11-01", currency: "INR", notes: "", tax: "0.00", shipping: "0.00", items: [{ line_id: "l1", product_id: "p1", product_variant_id: null, quantity: 3, unit_price: "100.00" }] },
  snapshots: { customers: { c: { name: "Meridian" } }, products: { p1: { name: "Statuario" } }, locations: {} }, subtotal: "300.00", total: "300.00", created_by: "u", created_at: "", updated_at: "",
  allocations: [{ line_id: "l1", location_id: "f", quantity: 3 }], fulfilled: { [JSON.stringify(["l1", "f"])]: 1 }, received: {} };
const purchase: CommerceDocument = { ...sale, id: "po", kind: "purchase_order", number: "PO-1", status: "approved",
  draft: { supplier_id: "s", order_date: "2026-11-02", expected_date: null, currency: "INR", notes: "", tax: "0.00", shipping: "0.00", items: [{ line_id: "pl", product_id: "p2", product_variant_id: null, quantity: 4, unit_cost: "50.00", supplier_sku: null }] }, allocations: [], fulfilled: {}, received: { [JSON.stringify(["pl", "f"])]: 1 } };
const state = { organization_id: "o", sequence: 2, head: "h", stock_requests: {}, entitlements: {}, requests: {}, reservations: {}, documents: { so: sale, po: purchase },
  balances: [{ product_id: "p1", location_id: "f", quantity: 10, reserved: 2 }, { product_id: "p2", location_id: "f", quantity: 2, reserved: 0 }, { product_id: "p3", location_id: "f", quantity: 0, reserved: 0 }] } as CommerceState;
const products = [{ id: "p1", name: "Statuario", sku: "S1", is_active: true, purchase_price: 60, selling_price: 100, min_stock: 2 }, { id: "p2", name: "Black", sku: "B1", is_active: true, purchase_price: 50, selling_price: 80, reorder_point: 6, reorder_quantity: 10 }, { id: "p3", name: "Onyx", sku: "O1", is_active: true, min_stock: 1 }];

it("lists stock levels with free stock and values, skipping empty bins", () => {
  const rows = stockLevels(state, products, [{ id: "f", name: "Factory" }]);
  expect(rows.map(row => [row.name, row.free, row.sellValue])).toEqual([["Black", 2, 160], ["Statuario", 8, 1000]]);
  expect(locationSummary(rows)).toEqual([{ id: "f", location: "Factory", products: 2, onHand: 12, reserved: 2, sellValue: 1160 }]);
});
it("lists only the unshipped part of each reservation", () => {
  expect(reservations(state, [{ id: "f", name: "Factory" }])).toEqual([expect.objectContaining({ number: "SO-1", customer: "Meridian", product: "Statuario", location: "Factory", reserved: 3, shipped: 1, remaining: 2, value: 200 })]);
});
it("flags products below their reorder point after counting open purchase orders", () => {
  const rows = replenishment(state, products, [{ id: "s", name: "Quarry" }]);
  expect(rows.map(row => row.sku)).toEqual(["O1", "B1"]);
  expect(rows[1]).toMatchObject({ free: 2, onOrder: 3, point: 6, suggested: 10, supplier: "Quarry", status: "below" });
  expect(rows[0]).toMatchObject({ free: 0, status: "out", suggested: 2 });
});
