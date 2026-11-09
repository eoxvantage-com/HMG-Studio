import { describe, expect, it } from "vitest";
import { addPurchaseOrderLine, createPurchaseOrderDraft, defaultPurchaseOrderUnitCost, purchaseOrderTotals, validatePurchaseOrderDraft, type PurchaseOrderProduct } from "./purchaseOrderDraft";

const product: PurchaseOrderProduct = { id: "p1", name: "Absolute Black Slab", sku: "ABS-1", purchase_price: 25, price: 40, supplier_costs: [{ supplier_id: "s1", cost_price: 21.25, supplier_sku: "HMG-ABS" }] };

describe("purchase order draft contract", () => {
  it("uses source defaults and supplier-linked cost and SKU before generic prices", () => {
    const draft = createPurchaseOrderDraft("2026-11-08", "INR");
    expect(draft).toMatchObject({ supplier_id: "", order_date: "2026-11-08", expected_date: "", currency: "INR", shipping: 0, tax: 0, notes: "", items: [] });
    expect(defaultPurchaseOrderUnitCost(product, "s1")).toBe(21.25);
    expect(defaultPurchaseOrderUnitCost(product, "s2")).toBe(25);
    expect(defaultPurchaseOrderUnitCost({ id: "p2", name: "Stone", price: 14 }, "s2")).toBe(0);
    expect(defaultPurchaseOrderUnitCost({ id: "p3", name: "Stone" }, "s2")).toBe(0);
  });

  it("combines identical product/variant lines, keeps separate variants, and previews integer-cent totals", () => {
    const first = addPurchaseOrderLine([], product, null, "s1", 2, 21.25, "HMG-ABS");
    const combined = addPurchaseOrderLine(first, product, null, "s1", 3, 20, "NEW-SKU");
    expect(combined).toHaveLength(1);
    expect(combined[0]).toMatchObject({ quantity: 5, unit_cost: 20, supplier_sku: "HMG-ABS", sku: "ABS-1" });
    const withVariant = addPurchaseOrderLine(combined, product, { id: "v1", title: "Polished", sku: "ABS-P", is_active: true }, "s1", 1, 10.05, "HMG-P");
    expect(withVariant).toHaveLength(2);
    expect(purchaseOrderTotals({ ...createPurchaseOrderDraft("2026-11-08", "INR"), items: withVariant, tax: 1.11, shipping: 2.22 })).toEqual({ subtotal: 110.05, tax: 1.11, shipping: 2.22, total: 113.38 });
  });

  it("rejects missing supplier/items, invalid date order and currency, negative or overprecision money, and variant mismatch", () => {
    const invalid = createPurchaseOrderDraft("2026-11-08", "INR");
    expect(validatePurchaseOrderDraft(invalid, [], [])).toMatchObject({ supplier_id: expect.any(String), items: expect.any(String) });
    const draft = { ...invalid, supplier_id: "s1", expected_date: "2026-11-07", currency: "US", tax: 1.001, shipping: -1, items: [{ product_id: "p1", product_variant_id: null, product_name: "Stone", variant_title: null, sku: "P", quantity: 0, unit_cost: 1.001, supplier_sku: "x".repeat(256) }] };
    const errors = validatePurchaseOrderDraft(draft, [{ id: "s1", name: "Supplier" }], [{ ...product, has_variants: true, variants: [{ id: "v1", title: "Polished", is_active: true }] }]);
    expect(errors).toMatchObject({ expected_date: expect.any(String), currency: expect.any(String), tax: expect.any(String), shipping: expect.any(String), "items.0.product_variant_id": expect.any(String), "items.0.quantity": expect.any(String), "items.0.unit_cost": expect.any(String), "items.0.supplier_sku": expect.any(String) });
    expect(validatePurchaseOrderDraft({ ...draft, expected_date: "", currency: "INR", tax: 0, shipping: 0, items: [{ ...draft.items[0], product_variant_id: "v2", quantity: 1, unit_cost: 1, supplier_sku: "OK" }] }, [{ id: "s1", name: "Supplier" }], [{ ...product, has_variants: true, variants: [{ id: "v1", title: "Polished", is_active: true }] }])["items.0.product_variant_id"]).toBeTruthy();
  });

  it("never previews an unsafe cent total or accepts unsafe quantities and combined amounts", () => {
    const base = createPurchaseOrderDraft("2026-11-08", "INR");
    const oversized = { ...base, supplier_id: "s1", items: [{ product_id: "p1", product_variant_id: null, product_name: "Stone", variant_title: null, sku: "P", quantity: Number.MAX_SAFE_INTEGER, unit_cost: 2, supplier_sku: "" }] };
    expect(purchaseOrderTotals(oversized)).toMatchObject({ subtotal: null, total: null });
    expect(validatePurchaseOrderDraft(oversized, [{ id: "s1", name: "Supplier" }], [product])).toHaveProperty("items.0.unit_cost");
    const overflow = { ...base, supplier_id: "s1", tax: 90_000_000_000_000, shipping: 90_000_000_000_000, items: [{ ...oversized.items[0], quantity: 1, unit_cost: 1 }] };
    expect(purchaseOrderTotals(overflow).total).toBeNull();
    expect(validatePurchaseOrderDraft(overflow, [{ id: "s1", name: "Supplier" }], [product])).toHaveProperty("total");
    expect(validatePurchaseOrderDraft({ ...oversized, items: [{ ...oversized.items[0], quantity: Number.MAX_SAFE_INTEGER + 1, unit_cost: 1 }] }, [{ id: "s1", name: "Supplier" }], [product])).toHaveProperty("items.0.quantity");
  });
});
