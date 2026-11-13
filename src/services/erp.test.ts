import { describe, expect, it } from "vitest";
import { buildErpFilters, editableFields, fieldLabel, listFields, labelField, getErpResource, normalizeValues, verifyReadback, writeBlocker, type ErpResource } from "./erp";

const resource: ErpResource = {
  name: "products", title: "Products", liveVerified: true,
  schema: { fields: [
    { name: "id", type: "string", format: "uuid", constraints: { required: true } },
    { name: "organization_id", type: "string", format: "uuid", constraints: { required: true } },
    { name: "name", type: "string", constraints: { required: true, maxLength: 255 } },
    { name: "sku", type: "string", constraints: { required: true } },
    { name: "price", type: "number", default: 0 },
    { name: "stock", type: "integer", default: 0 },
    { name: "description", type: "string" },
    { name: "is_active", type: "boolean", default: true },
    { name: "created_at", type: "datetime" },
  ] },
};
describe("ERP schema-backed form contracts", () => {
  it("prioritizes actual business identifiers and inventory quantities over timestamps", () => {
    const products = getErpResource("products")!;
    expect(listFields(products).map(f => f.name)).toEqual(["name", "sku", "stock", "selling_price", "is_active"]);
    expect(labelField(getErpResource("plugins")!)).toBe("slug");
    expect(labelField(getErpResource("work_orders")!)).toBe("work_order_number");
    expect(labelField(getErpResource("stock_transfers")!)).toBe("transfer_number");
  });
  it("builds server-side search and boolean filters, preserving false", () => {
    expect(buildErpFilters(resource, "  granite ", "is_active", "false")).toEqual([
      { field: "name", operator: "contains", value: "granite" },
      { field: "is_active", operator: "eq", value: false },
    ]);
  });
  it("rejects filter fields outside confirmed schema", () => {
    expect(() => buildErpFilters(resource, "", "guessed_column", "x")).toThrow();
  });
  it("never exposes stock, generated fields or tenant reassignment for editing", () => {
    expect(editableFields(resource, "edit").map(field => field.name)).toEqual(["name", "sku", "price", "description", "is_active"]);
    expect(editableFields(resource, "create").some(field => field.name === "organization_id")).toBe(true);
  });
  it("keeps transactional resources read-only, including apparently draft records", () => {
    expect(editableFields({ ...resource, name: "orders" }, "create")).toEqual([]);
    expect(writeBlocker({ ...resource, name: "orders" })).toMatch(/workflow/i);
  });
  it("requires explicit backend write verification, not just schema or UI access", () => {
    expect(writeBlocker(resource)).toMatch(/authorization/i);
  });
  it("does not let create verification enable update or deletion", () => {
    const verified = { ...resource, writeAuthorizationVerified: true, verifiedWriteActions: ["create" as const] };
    expect(writeBlocker(verified, "create")).toMatch(/product.*command/i);
    expect(writeBlocker({ ...verified, name: "customers", verifiedCommand: "hmg-contact-master-v1" }, "create")).toBe("");
    expect(writeBlocker({ ...verified, verifiedWriteActions: ["create", "update"] }, "update")).toMatch(/product.*command/i);
    expect(writeBlocker(verified, "update")).toMatch(/update.*verified/i);
    expect(writeBlocker(verified, "delete")).toMatch(/delete.*verified/i);
    expect(writeBlocker({ ...resource, writeAuthorizationVerified: true }, "create")).toMatch(/create.*verified/i);
  });
  it("normalizes blank optional fields to null and preserves false and decimal precision", () => {
    expect(normalizeValues(editableFields(resource, "edit"), { name: " Quartz ", sku: " Q1 ", price: "9007199254740993.25", description: "" }))
      .toEqual({ name: "Quartz", sku: "Q1", price: "9007199254740993.25", description: null, is_active: true });
    // Products can be activated/deactivated from the edit form; false must survive normalization.
    expect(normalizeValues(editableFields(resource, "edit"), { name: "Quartz", sku: "Q1", price: "1", is_active: false })).toMatchObject({ is_active: false });
    expect(() => normalizeValues(editableFields(resource, "edit"), { stock: 5 })).toThrow(/cannot be changed/i);
  });
  it("rejects unknown fields, whitespace required fields and invalid decimals", () => {
    const fields = editableFields(resource, "edit");
    expect(() => normalizeValues(fields, { name: "  ", sku: "X" })).toThrow(/Name/);
    expect(() => normalizeValues(fields, { name: "X", sku: "X", stock: 100 })).toThrow(/Stock/);
    expect(() => normalizeValues(fields, { name: "X", sku: "X", price: "1e309" })).toThrow(/selling price/i);
  });
  it("applies source validator nonnegative bounds even when a DB number has no minimum", () => {
    expect(() => normalizeValues(editableFields(resource, "edit"), { name: "X", sku: "X", price: "-0.01" })).toThrow(/at least 0/);
  });
  it.each(["-2147483649", "2147483648", -2147483649, 2147483648])("rejects INTEGER overflow %s even inside the JavaScript safe integer range", value => {
    expect(() => normalizeValues([{ name: "priority", type: "integer" }], { priority: value })).toThrow(/integer range/i);
  });
  it.each([[-2147483648, -2147483648], ["-2147483648", -2147483648], ["0", 0], ["2147483647", 2147483647], [2147483647, 2147483647]])("accepts INTEGER boundary %s", (value, expected) => {
    expect(normalizeValues([{ name: "priority", type: "integer" }], { priority: value })).toEqual({ priority: expected });
  });
  it.each(["min_stock", "reorder_point", "reorder_quantity"])("retains nonnegative product %s bounds within the INTEGER domain", name => {
    const fields = editableFields(getErpResource("products")!, "create").filter(field => field.name === name);
    expect(() => normalizeValues(fields, { [name]: "-1" })).toThrow(/at least 0/i);
    expect(normalizeValues(fields, { [name]: "2147483647" })).toEqual({ [name]: 2147483647 });
    expect(() => normalizeValues(fields, { [name]: "2147483648" })).toThrow(/integer range/i);
  });
  it.each(["create", "edit"] as const)("enforces supplier rating policy boundaries for %s", action => {
    const fields = editableFields(getErpResource("suppliers")!, action).filter(field => field.name === "rating");
    expect(normalizeValues(fields, { rating: "0" })).toEqual({ rating: 0 });
    expect(normalizeValues(fields, { rating: "5" })).toEqual({ rating: 5 });
    expect(() => normalizeValues(fields, { rating: "-1" })).toThrow(/at least 0/i);
    expect(() => normalizeValues(fields, { rating: "6" })).toThrow(/at most 5/i);
    expect(() => normalizeValues(fields, { rating: "2.5" })).toThrow(/whole number/i);
  });
  it("preserves narrower schema rating constraints", () => {
    const supplier: ErpResource = { name: "suppliers", title: "Suppliers", schema: { fields: [{ name: "rating", type: "integer", constraints: { minimum: 1, maximum: 4 } }] } };
    const fields = editableFields(supplier, "create");
    expect(() => normalizeValues(fields, { rating: 0 })).toThrow(/at least 1/i);
    expect(() => normalizeValues(fields, { rating: 5 })).toThrow(/at most 4/i);
    expect(normalizeValues(fields, { rating: 4 })).toEqual({ rating: 4 });
  });
  it.each(["warehouses", "product_locations"])("retains existing %s capacity bounds", name => {
    const fields = editableFields(getErpResource(name)!, "create").filter(field => field.name === "capacity");
    expect(normalizeValues(fields, { capacity: "0" })).toEqual({ capacity: 0 });
    expect(normalizeValues(fields, { capacity: "2147483647" })).toEqual({ capacity: 2147483647 });
    expect(() => normalizeValues(fields, { capacity: "-1" })).toThrow(/at least 0/i);
    expect(() => normalizeValues(fields, { capacity: "2147483648" })).toThrow(/at most 2147483647/i);
  });
  it("exposes source-backed product master fields without stock or duplicate selling prices", () => {
    const product = getErpResource("products")!;
    const names = editableFields(product, "create").map(field => field.name);
    expect(names).toEqual(expect.arrayContaining([
      "organization_id", "name", "sku", "type", "barcode", "barcode_type", "description",
      "currency", "purchase_price", "price", "min_stock", "reorder_point", "reorder_quantity",
      "category_id", "location_id", "tracking_type", "notes",
    ]));
    expect(names).not.toEqual(expect.arrayContaining(["stock", "selling_price", "images", "has_variants"]));
    expect(names).toContain("is_active");
    expect(editableFields(product, "edit").some(field => field.name === "organization_id")).toBe(false);
    expect(editableFields(product, "edit").some(field => field.name === "currency")).toBe(false);
    expect(editableFields(product, "edit").some(field => field.name === "is_active")).toBe(true);
    expect(fieldLabel("price")).toBe("Selling price");
  });
  it("uses source product defaults and validates price, thresholds and choice values", () => {
    const fields = editableFields(getErpResource("products")!, "create");
    expect(fields.find(field => field.name === "type")?.default).toBe("standard");
    expect(fields.find(field => field.name === "tracking_type")?.default).toBe("none");
    expect(fields.find(field => field.name === "price")?.constraints?.required).toBe(true);
    expect(fields.find(field => field.name === "min_stock")?.constraints?.required).toBe(true);
    const base = Object.fromEntries(fields.map(field => [field.name, field.default ?? ""]));
    Object.assign(base, { organization_id: "22222222-2222-4222-8222-222222222222", name: "Granite", sku: "GRA-1", price: "120", min_stock: "5" });
    expect(() => normalizeValues(fields, { ...base, reorder_quantity: "-1" })).toThrow(/Reorder quantity.*at least 0/i);
    expect(() => normalizeValues(fields, { ...base, min_stock: "2.5" })).toThrow(/Minimum stock level.*whole number/i);
    expect(() => normalizeValues(fields, { ...base, type: "unsupported" })).toThrow(/valid product type/i);
    expect(() => normalizeValues(fields, { ...base, tracking_type: "invalid" })).toThrow(/valid inventory tracking/i);
    expect(() => normalizeValues(fields, { ...base, price: "" })).toThrow(/Selling price is required/i);
  });
  it("validates selected barcode formats without altering optional barcode values", () => {
    const fields = editableFields(getErpResource("products")!, "create");
    const base = Object.fromEntries(fields.map(field => [field.name, field.default ?? ""]));
    Object.assign(base, { organization_id: "22222222-2222-4222-8222-222222222222", name: "Granite", sku: "GRA-1", price: "120", min_stock: "5" });
    expect(() => normalizeValues(fields, { ...base, barcode: "1234567890123", barcode_type: "ean13" })).toThrow(/EAN-13 check digit/i);
    expect(() => normalizeValues(fields, { ...base, barcode: "abc 123", barcode_type: "code39" })).toThrow(/Code 39/i);
    const valid = normalizeValues(fields, { ...base, barcode: "4006381333931", barcode_type: "ean13" });
    expect(valid.barcode).toBe("4006381333931");
    expect(valid.barcode_type).toBe("ean13");
  });
  it("requires identity and fresh field equality before reporting saved", () => {
    expect(verifyReadback(resource, "abc", { price: "12.00", is_active: false }, { id: "abc", price: 12, is_active: false })).toBe(true);
    expect(() => verifyReadback(resource, "abc", { price: "12.00" }, { id: "other", price: 12 })).toThrow(/confirmed/i);
    expect(() => verifyReadback(resource, "abc", { is_active: false }, { id: "abc", is_active: true })).toThrow(/confirmed/i);
    expect(() => verifyReadback(resource, "abc", { description: null }, { id: "abc" })).toThrow(/confirmed/i);
  });
  it("formats column labels without exposing implementation suffixes", () => {
    expect(fieldLabel("organization_id")).toBe("Organization");
    expect(fieldLabel("sku")).toBe("SKU");
  });
});

 describe("verified product command", () => {
  it("requires the exact command and each verified action", () => {
    const product = { ...resource, writeAuthorizationVerified: true, verifiedCommand: "hmg-product-master-v1", verifiedWriteActions: ["create", "update", "delete"] } as ErpResource;
    for (const action of ["create", "update", "delete"] as const) expect(writeBlocker(product, action)).toBe("");
    expect(writeBlocker({ ...product, verifiedCommand: "wrong" }, "update")).not.toBe("");
  });
  it("locks inventory semantics on product edit", () => {
    expect(editableFields(getErpResource("products")!, "edit").map(field => field.name)).not.toEqual(expect.arrayContaining(["type", "tracking_type"]));
  });
});

it("normalizes product-create currency before permission and readback comparison", () => {
  const product = getErpResource("products")!;
  const fields = editableFields(product, "create");
  const base = Object.fromEntries(fields.map(field => [field.name, field.default ?? ""]));
  Object.assign(base, { organization_id: "22222222-2222-4222-8222-222222222222", name: "Granite", sku: "GRA-1", price: "120", min_stock: "5", currency: " usd " });
  const normalized = normalizeValues(fields, base);
  expect(normalized.currency).toBe("USD");
  expect(verifyReadback(product, "product-id", normalized, { id: "product-id", ...normalized, currency: "USD" })).toBe(true);
  for (const currency of ["US", "USDD", "U1D", "u$d", "123", "u d"]) expect(() => normalizeValues(fields, { ...base, currency })).toThrow(/three ASCII letters/i);
});

it.each(["customers", "suppliers"])("only permits verified logical deletion for %s", name => {
  const master = { ...getErpResource(name)!, verifiedCommand: "hmg-contact-master-v1", liveVerified: true, writeAuthorizationVerified: true, verifiedWriteActions: ["delete" as const] };
  expect(writeBlocker(master, "delete")).toBe("");
  expect(writeBlocker({ ...master, verifiedWriteActions: ["update"] }, "delete")).not.toBe("");
  expect(writeBlocker({ ...master, liveVerified: false }, "delete")).not.toBe("");
  expect(writeBlocker({ ...master, writeAuthorizationVerified: false }, "delete")).not.toBe("");
  expect(writeBlocker({ ...master, name: "warehouses" }, "delete")).not.toBe("");
});

it.each(["customers", "suppliers"])("requires the private contact command for %s writes", name => {
 const master = { ...getErpResource(name)!, liveVerified: true, writeAuthorizationVerified: true, verifiedWriteActions: ["create", "update", "delete"] } as ErpResource;
 for (const action of ["create", "update", "delete"] as const) {
  expect(writeBlocker({ ...master, verifiedCommand: undefined }, action)).not.toBe("");
  expect(writeBlocker({ ...master, verifiedCommand: "hmg-contact-master-v1" }, action)).toBe("");
 }
});

it.each(["customers", "suppliers"])("normalizes %s currency before permission and command readback", name => {
 const fields = editableFields(getErpResource(name)!, "edit").filter(field => field.name === "currency");
 expect(normalizeValues(fields, { currency: " inr " })).toEqual({ currency: "INR" });
 expect(() => normalizeValues(fields, { currency: "IN12" })).toThrow(/three ASCII letters/i);
});

it.each(["product_locations", "warehouses"])("requires the private metadata command and prevents protected %s writes", name => {
  const base = {...getErpResource(name)!,liveVerified:true,writeAuthorizationVerified:true,verifiedWriteActions:["create","update","delete"] as const};
  const verified = {...base,verifiedWriteActions:[...base.verifiedWriteActions],verifiedCommand:"hmg-contact-master-v1"};
  expect(writeBlocker({...verified,verifiedCommand:undefined},"create")).toMatch(/command/i);
  expect(writeBlocker(verified,"create")).toBe("");expect(writeBlocker(verified,"update")).toBe("");
  expect(writeBlocker(verified,"delete")).toMatch(/deletion/i);
  expect(writeBlocker({...verified,writeAuthorizationVerified:false},"create")).toMatch(/authorization/i);
  for(const action of ["create","edit"] as const){const names=editableFields(verified,action).map(field=>field.name);for(const field of ["is_default","stock","quantity","deleted_at"])expect(names).not.toContain(field);if(action==="edit")expect(names).not.toContain("organization_id");}
});
