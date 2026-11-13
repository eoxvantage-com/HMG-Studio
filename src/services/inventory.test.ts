import { describe, expect, it } from "vitest";
import { inventoryFilters, inventoryMetrics, productImageUrl, barcodeIdentity, money, primaryProductRelation, stockLocationChart, inventoryAuthorityRecord } from "./inventory";

describe("inventory presentation contracts", () => {
  it("sends search as one server OR with active and deletion constraints", () => {
    expect(inventoryFilters(" marble ", "true")).toEqual([
      { field: "deleted_at", operator: "null", value: true },
      { operator: "or", value: ["name", "sku", "barcode"].map(field => ({ field, operator: "contains", value: "marble" })) },
      { field: "is_active", operator: "eq", value: true },
    ]);
  });
  it("keeps absent, invalid and variant-dependent metrics unknown, not zero", () => {
    expect(inventoryMetrics({ id: "a", stock: null, selling_price: "", purchase_price: "no" })).toMatchObject({ stock: null, selling: null, purchase: null, value: null, margin: null });
    expect(inventoryMetrics({ id: "a", stock: 12, selling_price: 20, has_variants: true })).toMatchObject({ stock: null, value: null });
    expect(inventoryMetrics({ id: "a", sku: "HMG-WEB-001", stock: 0, price: 0, selling_price: null })).toMatchObject({ stock: null, selling: null, value: null });
    expect(inventoryMetrics({ id: "a", stock: 0, selling_price: 0, purchase_price: 0 })).toMatchObject({ stock: 0, selling: 0, purchase: 0, value: 0, margin: null });
  });
  it("calculates labelled record-level valuation without adding bin stock", () => {
    expect(inventoryMetrics({ id: "a", stock: 5, selling_price: "12.50", purchase_price: 10 })).toMatchObject({ value: 62.5, margin: 20 });
    expect(money(null, "INR")).toBe("Not available");
  });
  it("only allows verified HTTPS HMG product image paths", () => {
    expect(productImageUrl("https://www.hmgstones.com/assets/images/products/stone.jpg")).toContain("stone.jpg");
    expect(productImageUrl("https://hmgstones.com/assets/images/products/White%20Marble.jpg")).toContain("White%20Marble.jpg");
    for (const url of ["javascript:alert(1)", "https://evil.test/assets/images/products/a.jpg", "https://hmgstones.com.evil.test/assets/images/products/a.jpg", "https://hmgstones.com/other/a.jpg", "https://u:p@hmgstones.com/assets/images/products/a.jpg", "https://hmgstones.com/assets/images/products/%2e%2e/secret", "https://hmgstones.com:8443/assets/images/products/a.jpg"]) expect(productImageUrl(url)).toBeNull();
  });
  it("distinguishes stored barcodes, unsupported formats, and SKU previews", () => {
    expect(barcodeIdentity({ id: "a", sku: "STONE-1" })).toMatchObject({ value: "STONE-1", preview: true, format: "CODE128" });
    expect(barcodeIdentity({ id: "a", barcode: "123", barcode_type: "ean13" })).toMatchObject({ value: "123", preview: false, format: null });
    expect(barcodeIdentity({ id: "a", barcode: "ABC", barcode_type: "code128" })).toMatchObject({ value: "ABC", preview: false, format: "CODE128" });
    expect(barcodeIdentity({ id: "a", barcode: " ABC ", barcode_type: "code128" }).value).toBe(" ABC ");
  });
});


describe("compact product relationships and stock chart scope", () => {
  const product = { id: "p", type: "standard", has_variants: false, tracking_type: "none" };
  it("prioritizes only confirmed product capabilities without discarding other relationships", () => {
    expect(primaryProductRelation(product, "product_location_stocks", "product_id")).toBe(true);
    expect(primaryProductRelation(product, "product_supplier", "product_id")).toBe(true);
    expect(primaryProductRelation(product, "product_variants", "product_id")).toBe(false);
    expect(primaryProductRelation({ ...product, has_variants: true }, "product_variants", "product_id")).toBe(true);
    expect(primaryProductRelation({ ...product, type: "assembly" }, "product_components", "parent_product_id")).toBe(true);
    expect(primaryProductRelation({ ...product, type: "assembly" }, "product_components", "component_product_id")).toBe(false);
    expect(primaryProductRelation({ ...product, tracking_type: "serial" }, "product_serials", "product_id")).toBe(true);
    expect(primaryProductRelation({ ...product, tracking_type: "batch" }, "product_batches", "product_id")).toBe(true);
    expect(primaryProductRelation(product, "stock_adjustments", "product_id")).toBe(false);
  });
  const stock = { id: "11111111-1111-4111-8111-111111111111", location_id: "22222222-2222-4222-8222-222222222222", quantity: 7 };
  it("only declares complete location coverage for distinct valid rows and an exact backend total", () => {
    expect(stockLocationChart([stock], 1).complete).toBe(true);
    for (const total of [undefined, 2, -1, 1.5]) expect(stockLocationChart([stock], total).complete).toBe(false);
    expect(stockLocationChart([stock, stock], 2).complete).toBe(false);
    const mixedCase = { ...stock, id: "abcdefab-1111-4111-8111-111111111111", location_id: "fedcbafe-2222-4222-8222-222222222222" };
    expect(stockLocationChart([mixedCase, { ...mixedCase, id: mixedCase.id.toUpperCase(), location_id: mixedCase.location_id.toUpperCase() }], 2).complete).toBe(false);
    expect(stockLocationChart([mixedCase, { ...mixedCase, id: "33333333-3333-4333-8333-333333333333", location_id: mixedCase.location_id.toUpperCase() }], 2).complete).toBe(false);
    expect(stockLocationChart([{ ...stock, id: "invalid" }], 1).complete).toBe(false);
    expect(stockLocationChart([stock, { ...stock, id: "33333333-3333-4333-8333-333333333333" }], 2).complete).toBe(false);
  });
  it("does not invent zero for unknown quantities and preserves signed and zero values", () => {
    expect(stockLocationChart([{ ...stock, quantity: null }], 1)).toMatchObject({ complete: false, points: [], omitted: 1 });
    expect(stockLocationChart([{ ...stock, quantity: -3 }], 1).points[0].quantity).toBe(-3);
    expect(stockLocationChart([{ ...stock, quantity: 0 }], 1).points[0].quantity).toBe(0);
  });
});


describe("authoritative inventory",()=>{
 const record={id:"p",organization_id:"o",has_variants:false,tracking_type:"none",type:"standard",sku:"HMG-WEB-001",stock:999,selling_price:10};
 it("never falls back while authority is unknown or ledger unavailable",()=>{
  expect(inventoryMetrics(inventoryAuthorityRecord(record,undefined)).stock).toBeNull();
  expect(inventoryMetrics(inventoryAuthorityRecord(record,{kind:"unavailable"})).stock).toBeNull();
 });
 it("uses complete ledger bins exclusively including a verified zero for catalogue items",()=>{
  const authority={kind:"ledger" as const,balances:[{product_id:"p",location_id:"l",quantity:4,reserved:2}]};
  expect(inventoryMetrics(inventoryAuthorityRecord(record,authority)).stock).toBe(4);
  expect(inventoryMetrics(inventoryAuthorityRecord(record,{...authority,balances:[]})).stock).toBe(0);
 });
 it("keeps unsupported tracked stock unknown instead of zero",()=>{
  for(const fields of [{tracking_type:"batch"},{tracking_type:"serial"},{type:"assembly"}]) expect(inventoryMetrics(inventoryAuthorityRecord({...record,...fields},{kind:"ledger",balances:[]})).stock).toBeNull();
 });
 it("retains explicit legacy stock but does not infer variant totals",()=>{
  expect(inventoryMetrics(inventoryAuthorityRecord({...record,sku:"STONE"},{kind:"legacy"})).stock).toBe(999);
  expect(inventoryMetrics(inventoryAuthorityRecord({...record,has_variants:true},{kind:"ledger",balances:[]})).stock).toBeNull();
 });
});
