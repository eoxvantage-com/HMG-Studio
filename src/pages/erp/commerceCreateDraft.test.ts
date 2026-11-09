import { describe, expect, it } from "vitest";
import { emptyOrderDraft, orderTotals, validateOrderDraft, validateReturnLines } from "./commerceCreateDraft";

describe("commerce create draft validation", () => {
  it("requires organization, customer details, and at least one positive-price item before order submission", () => {
    const draft = emptyOrderDraft("2026-11-08", "INR");
    expect(validateOrderDraft(draft)).toMatchObject({ organization_id: expect.any(String), customer_name: expect.any(String), items: expect.any(String) });
    draft.organization_id = "org"; draft.customer_name = "Buyer";
    draft.items = [{ product_id: "p", product_variant_id: null, product_name: "Slab", sku: "S-1", quantity: 2, unit_price: 125.5 }];
    expect(validateOrderDraft(draft)).toEqual({});
  });
  it("calculates totals in integer cents and rejects overflow", () => {
    const draft = emptyOrderDraft("2026-11-08", "INR");
    draft.items = [{ product_id: "p", product_variant_id: null, product_name: "Slab", sku: "S-1", quantity: 2, unit_price: 125.5 }];
    draft.shipping = 10; draft.tax = 5;
    expect(orderTotals(draft).total).toBe(266);
    draft.items[0].quantity = Number.MAX_SAFE_INTEGER;
    expect(orderTotals(draft).total).toBeNull();
  });
  it("rejects malformed calendar dates without throwing", () => {
    const draft = emptyOrderDraft("not-a-date", "INR");
    expect(() => validateOrderDraft(draft)).not.toThrow();
    expect(validateOrderDraft(draft).order_date).toBeTruthy();
  });
  it("rejects return quantities beyond remaining eligible quantity", () => {
    expect(validateReturnLines([{ order_item_id: "i", product_id: "p", quantity: 2, returnable_quantity: 1, condition: "new", restock: true }])).toMatchObject({ "items.0.quantity": expect.any(String) });
    expect(validateReturnLines([{ order_item_id: "i", product_id: "p", quantity: 1, returnable_quantity: 1, condition: "damaged", restock: true }])).toMatchObject({ "items.0.restock": expect.any(String) });
    expect(validateReturnLines([{ order_item_id: "i", product_id: "p", quantity: 1, returnable_quantity: 1, condition: "new", restock: true }])).toEqual({});
  });
});
