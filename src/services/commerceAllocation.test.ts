import { describe, expect, it } from "vitest";
import { allocationProblems, availableAt, suggestAllocations } from "./commerceAllocation";
import { ledgerRejectionMessage, type CommerceDocument } from "./commerceLedger";

const FACTORY = "f", DISPATCH = "d";
const locations = [{ id: DISPATCH, name: "Dispatch" }, { id: FACTORY, name: "Factory" }];
const doc = (items: { line: string; product: string; quantity: number }[], extra: Partial<CommerceDocument> = {}): CommerceDocument => ({
  id: "doc", kind: "sales_order", number: "SO-1", revision: 1, status: "pending", approval_status: "pending",
  draft: { order_date: "2026-11-11", currency: "INR", notes: "", tax: "0.00", shipping: "0.00", items: items.map(item => ({ line_id: item.line, product_id: item.product, product_variant_id: null, quantity: item.quantity, unit_price: "1.00" })) },
  snapshots: {}, subtotal: "0.00", total: "0.00", created_by: "u", created_at: "", updated_at: "", allocations: [], fulfilled: {}, received: {}, ...extra,
});
// Mirrors the live HMG Stones state: all onyx/travertine stock sits in the Factory.
const balances = [
  { product_id: "onyx", location_id: DISPATCH, quantity: 0, reserved: 0 },
  { product_id: "onyx", location_id: FACTORY, quantity: 11, reserved: 0 },
  { product_id: "trav", location_id: DISPATCH, quantity: 0, reserved: 0 },
  { product_id: "trav", location_id: FACTORY, quantity: 24, reserved: 10 },
];

describe("sales approval allocation", () => {
  const order = doc([{ line: "l1", product: "onyx", quantity: 1 }, { line: "l2", product: "trav", quantity: 6 }]);
  it("defaults each line to a location that actually has free stock", () => {
    expect(suggestAllocations(order, "approve_document", balances, locations)).toEqual([
      { line_id: "l1", location_id: FACTORY, quantity: 1 },
      { line_id: "l2", location_id: FACTORY, quantity: 6 },
    ]);
    expect(allocationProblems(order, "approve_document", suggestAllocations(order, "approve_document", balances, locations), balances, locations)).toEqual([]);
  });
  it("reports the exact problems from the failed live approval before sending", () => {
    const rows = [
      { line_id: "l1", location_id: DISPATCH, quantity: 1 },
      { line_id: "l2", location_id: DISPATCH, quantity: 6 },
      { line_id: "l2", location_id: DISPATCH, quantity: 1 },
    ];
    const messages = allocationProblems(order, "approve_document", rows, balances, locations).map(problem => problem.message);
    expect(messages).toContain("This location is already used for this line.");
    expect(messages).toContain("Allocate exactly 6 (currently 7).");
    expect(messages.some(message => message.startsWith("Only 0 free at Dispatch"))).toBe(true);
  });
  it("splits across locations when one location is short and keeps any shortfall visible", () => {
    const short = [{ product_id: "trav", location_id: DISPATCH, quantity: 3, reserved: 0 }, { product_id: "trav", location_id: FACTORY, quantity: 4, reserved: 0 }];
    const big = doc([{ line: "l2", product: "trav", quantity: 9 }]);
    const rows = suggestAllocations(big, "approve_document", short, locations);
    expect(rows).toEqual([{ line_id: "l2", location_id: FACTORY, quantity: 6 }, { line_id: "l2", location_id: DISPATCH, quantity: 3 }]);
    expect(allocationProblems(big, "approve_document", rows, short, locations).map(problem => problem.message)).toContain("Only 4 free at Factory (requested 6).");
  });
  it("computes free stock as on-hand minus reserved", () => {
    expect(availableAt(balances, "trav", FACTORY)).toBe(14);
    expect(availableAt(balances, "missing", FACTORY)).toBe(0);
  });
});

describe("fulfillment and receipt", () => {
  it("ships exactly what is reserved and unshipped", () => {
    const order = doc([{ line: "l1", product: "onyx", quantity: 4 }], { status: "approved", allocations: [{ line_id: "l1", location_id: FACTORY, quantity: 4 }], fulfilled: { [JSON.stringify(["l1", FACTORY])]: 1 } });
    const rows = suggestAllocations(order, "fulfill_order", balances, locations);
    expect(rows).toEqual([{ line_id: "l1", location_id: FACTORY, quantity: 3 }]);
    expect(allocationProblems(order, "fulfill_order", [{ ...rows[0], quantity: 4 }], balances, locations).map(problem => problem.message)).toContain("Only 3 reserved and unshipped at this location.");
  });
  it("receives the remaining quantity into the location that already holds the product", () => {
    const purchase = doc([{ line: "l1", product: "onyx", quantity: 6 }], { kind: "purchase_order", received: { [JSON.stringify(["l1", FACTORY])]: 2 } });
    expect(suggestAllocations(purchase, "receive_purchase_order", balances, locations)).toEqual([{ line_id: "l1", location_id: FACTORY, quantity: 4 }]);
  });
});

it("maps known ledger rejection details to clear text and hides unknown text", () => {
  expect(ledgerRejectionMessage("Insufficient available stock")).toMatch(/Not enough free stock/);
  expect(ledgerRejectionMessage("Allocate every order line exactly")).toMatch(/full quantity of every line/);
  expect(ledgerRejectionMessage("something internal")).toMatch(/ledger rejected this request/);
  expect(ledgerRejectionMessage(undefined)).toMatch(/ledger rejected this request/);
});
