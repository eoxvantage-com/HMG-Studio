import domainFixture from "./__fixtures__/commerce-ledger.json";
import { describe, expect, it } from "vitest";
import { canonicalMoney, exactNumericMoney, parseCommerceCommand, parseCommerceState, parseDocumentPage } from "./commerceLedger";
const org = "11111111-1111-4111-8111-111111111111";
const request = "22222222-2222-4222-8222-222222222222";
const product = "33333333-3333-4333-8333-333333333333";
const line = "44444444-4444-4444-8444-444444444444";
const draft = { customer_id: null, customer_name: "Buyer", customer_email: "", customer_address: "", order_date: "2026-11-11", currency: "INR", notes: "", tax: "0.00", shipping: "0.00", items: [{ line_id: line, product_id: product, product_variant_id: null, quantity: 1, unit_price: "10.00" }] };
const command = { request_id: request, action: "create_order", reason: "New order", document: draft };
const state = { organization_id: org, sequence: 0, head: "a".repeat(64), balances: [], reservations: {}, entitlements: {}, requests: {}, documents: {} };
describe("commerce ledger boundary", () => {
  it("accepts the actual Python domain lifecycle projection without synthetic aliases",()=>{const parsed=parseCommerceState(domainFixture,domainFixture.state.organization_id);expect(parsed).not.toBeNull();expect(Object.values(parsed!.state.documents).some(row=>row.status==="fulfilled")).toBe(true);expect(Object.keys(parsed!.state.entitlements).length).toBeGreaterThan(0);});
  it("rejects numeric draft conversion that changes exact minor units",()=>{expect(exactNumericMoney("1.15")).toBe(1.15);expect(exactNumericMoney("90071992547409.91")).toBeNull();expect(exactNumericMoney("1.001")).toBeNull();});
  it("normalizes decimal amounts without rounding silently", () => {
    expect(canonicalMoney("12.3")).toBe("12.30");
    for (const value of ["1.001", "1e3", "-1", "NaN", "90071992547409.92"]) expect(() => canonicalMoney(value)).toThrow();
  });
  it("restores only exact validated commands and freezes nested lines", () => {
    const parsed = parseCommerceCommand(command);
    expect(parsed).toEqual(command);
    expect(Object.isFrozen(parsed)).toBe(true);
    expect(Object.isFrozen((parsed as typeof command).document.items[0])).toBe(true);
    expect(parseCommerceCommand({ ...command, injected: true })).toBeNull();
    expect(parseCommerceCommand({ ...command, document: { ...draft, items: [{ ...draft.items[0], product_variant_id: product }] } })).toBeNull();
  });
  it("requires native commerce capability and correct scope", () => {
    expect(parseCommerceState({ ok: true, code: "STATE", state, capabilities: ["commerce_v2"] }, org)?.state).toEqual({...state,stock_requests:{}});
    expect(parseCommerceState({ ok: true, code: "STATE", state }, org)).toBeNull();
    expect(parseCommerceState({ ok: true, code: "STATE", state, capabilities: ["commerce_v2"] }, request)).toBeNull();
  });
  it("rejects partial or invalid document pages", () => {
    const page = { ok: true, code: "DOCUMENTS", organization_id: org, data: [], total: 0, head: "a".repeat(64), capabilities: ["commerce_v2"] };
    expect(parseDocumentPage(page, org)?.total).toBe(0);
    expect(parseDocumentPage({ ...page, data: [{ id: request }] }, org)).toBeNull();
    expect(parseDocumentPage({ ...page, head: "bad" }, org)).toBeNull();
  });
});
