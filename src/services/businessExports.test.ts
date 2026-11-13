import { describe, expect, it } from "vitest";
import { buildExport, type ExportInput } from "./businessExports";
import type { CommerceDocument, CommerceState } from "./commerceLedger";

const doc = (patch: Partial<CommerceDocument> & { id: string }): CommerceDocument => ({
  kind: "sales_order", number: `SO-${patch.id}`, revision: 1, status: "fulfilled", approval_status: "approved",
  draft: { customer_id: "c1", order_date: "2026-10-06", currency: "INR", notes: "", tax: "180.00", shipping: "50.00", items: [{ line_id: `${patch.id}-l1`, product_id: "p1", product_variant_id: null, quantity: 4, unit_price: "250.00" }] },
  snapshots: { customers: { c1: { name: "Meridian" } }, suppliers: { s1: { name: "Quarry" } }, products: { p1: { name: "Statuario" } } },
  subtotal: "1000.00", total: "1230.00", created_by: "u", created_at: "", updated_at: "", allocations: [], fulfilled: {}, received: {}, ...patch,
});
const state = (documents: CommerceDocument[]): CommerceState => ({ organization_id: "o", sequence: 1, head: "h", stock_requests: {}, entitlements: {}, requests: {}, reservations: {}, documents: Object.fromEntries(documents.map(d => [d.id, d])),
  balances: [{ product_id: "p1", location_id: "f", quantity: 10, reserved: 3 }, { product_id: "p2", location_id: "f", quantity: 1, reserved: 0 }] });
const base = (documents: CommerceDocument[]): ExportInput => ({ state: state(documents), from: "", to: "", today: "2026-11-12",
  products: [{ id: "p1", sku: "S1", name: "Statuario", is_active: true, purchase_price: "150", selling_price: "250", category_id: "cat", min_stock: 2 }, { id: "p2", sku: "S2", name: "Black", is_active: true, purchase_price: "100", selling_price: "200", reorder_point: 5, reorder_quantity: 10 }],
  customers: [], suppliers: [], locations: [{ id: "f", name: "Factory" }], categories: [{ id: "cat", name: "Marble" }] });

describe("business exports", () => {
  it("builds a sales register whose totals exclude cancelled orders and respect the date range", () => {
    const result = buildExport("sales_register", { ...base([doc({ id: "a" }), doc({ id: "b", status: "cancelled" }), doc({ id: "c", draft: { ...doc({ id: "c" }).draft, order_date: "2026-08-01" } })]), from: "2026-10-01", to: "2026-10-31" });
    expect(result.rows.map(row => row.number)).toEqual(["SO-a", "SO-b"]);
    expect(result.totals).toMatchObject({ subtotal: "1000.00", tax: "180.00", total: "1230.00" });
    expect(result.rows[0]).toMatchObject({ party: "Meridian", status: "fulfilled" });
  });
  it("ages receivables per customer from the order date", () => {
    const result = buildExport("receivables", base([doc({ id: "a" }), doc({ id: "b", status: "approved", draft: { ...doc({ id: "b" }).draft, order_date: "2026-11-10" } }), doc({ id: "p", status: "pending" })]));
    expect(result.rows).toEqual([{ party: "Meridian", orders: "2", oldest: "2026-10-06", b0: "1230.00", b1: "1230.00", b2: "0.00", b3: "0.00", total: "2460.00" }]);
  });
  it("summarises GST from fulfilled sales and received purchases", () => {
    const purchase = doc({ id: "po", kind: "purchase_order", status: "received", subtotal: "500.00", draft: { supplier_id: "s1", order_date: "2026-10-20", currency: "INR", notes: "", tax: "90.00", shipping: "0.00", items: [] } });
    const result = buildExport("gst_summary", base([doc({ id: "a" }), purchase, doc({ id: "x", status: "approved" })]));
    expect(result.rows).toEqual([{ month: "2026-10", sales: "1000.00", output: "180.00", purchases: "500.00", input: "90.00", net: "90.00" }]);
  });
  it("values stock at cost and selling price and lists products to reorder", () => {
    const valuation = buildExport("stock_valuation", base([]));
    expect(valuation.rows[1]).toMatchObject({ sku: "S1", on_hand: "10", reserved: "3", free: "7", cost_value: "1500.00", sell_value: "2500.00", category: "Marble" });
    expect(valuation.totals).toMatchObject({ cost_value: "1600.00", sell_value: "2700.00" });
    const reorder = buildExport("reorder_report", base([]));
    expect(reorder.rows).toEqual([expect.objectContaining({ sku: "S2", free: "1", point: "5", suggested: "10", value: "1000.00" })]);
  });
  it("reports dispatched quantities from posted fulfillments only", () => {
    const shipped = doc({ id: "a", fulfilled: { [JSON.stringify(["a-l1", "f"])]: 3 } });
    const result = buildExport("dispatch_report", base([shipped, doc({ id: "b", status: "approved" })]));
    expect(result.rows).toEqual([{ sku: "S1", name: "Statuario", quantity: "3", orders: "1", value: "750.00" }]);
  });
  it("exports products in the re-importable template format", () => {
    const result = buildExport("products_master", base([]));
    expect(result.columns.map(column => column.key)).toContain("selling_price");
    expect(result.rows[0]).toMatchObject({ sku: "S1", category: "Marble", selling_price: "250.00", is_active: "yes" });
  });
});
