import { describe, expect, it } from "vitest";
import { parseCsv, prepareContacts, prepareProducts, preparePurchaseOrders, readSheet, templateCsv, uuidV5, TEMPLATES } from "./dataImport";

describe("csv parsing", () => {
  it("handles BOM, quotes, escaped quotes, commas and newlines inside fields", () => {
    expect(parseCsv('\uFEFFa,b\r\n"x, y","say ""hi"""\r\n"multi\nline",2\r\n\r\n')).toEqual([["a", "b"], ["x, y", 'say "hi"'], ["multi\nline", "2"]]);
  });
  it("rejects an unclosed quote", () => { expect(() => parseCsv('a\n"open')).toThrow(/unclosed quote/); });
  it("round-trips every template through the parser with its sample rows", () => {
    for (const kind of Object.keys(TEMPLATES) as (keyof typeof TEMPLATES)[]) {
      const sheet = readSheet(kind, templateCsv(kind));
      expect(sheet.issues).toEqual([]);
      expect(sheet.rows.length).toBe(TEMPLATES[kind].sample.length);
      expect(sheet.rows[0].values).toMatchObject(Object.fromEntries(Object.entries(TEMPLATES[kind].sample[0]).filter(([, value]) => value)));
    }
  });
  it("reports missing required columns and ignores unknown ones", () => {
    const sheet = readSheet("products", "name,colour\nSlab,white\n");
    expect(sheet.issues.map(issue => issue.message)).toEqual(expect.arrayContaining(['Missing required column "sku". Use the template header row.', "Ignored unknown columns: colour."]));
  });
});

describe("row preparation", () => {
  it("validates products, resolves categories and skips existing SKUs", () => {
    const sheet = readSheet("products", "sku,name,category,selling_price,min_stock,is_active\nA1,Alpha,marble,\"₹1,250\",4,yes\nA2,Beta,Granite,100,,no\nA1,Again,Marble,5,,\nA3,Gamma,Quartz,10,,\nA4,Delta,,abc,,\nOLD,Existing,,10,,\n");
    const rows = prepareProducts(sheet, { categories: [{ id: "c1", name: "Marble" }, { id: "c2", name: "Granite" }], existingSkus: new Set(["old"]) });
    expect(rows.map(row => row.status)).toEqual(["ready", "ready", "error", "error", "error", "skip"]);
    expect(rows[0].payload).toMatchObject({ sku: "A1", name: "Alpha", price: "1250.00", category_id: "c1", min_stock: 4, is_active: true });
    expect(rows[1].payload).toMatchObject({ category_id: "c2", is_active: false });
    expect(rows[2].message).toMatch(/Duplicate SKU/); expect(rows[3].message).toMatch(/Unknown category "Quartz"/); expect(rows[4].message).toMatch(/selling_price/);
  });
  it("skips existing contacts and defaults currency", () => {
    const sheet = readSheet("customers", "name,email,credit_limit\nNew Buyer,new@x.example,5000\nOld Buyer,,\nBad,not-an-email,\n");
    const rows = prepareContacts("customers", sheet, { existing: [{ id: "1", name: "old buyer" }], currency: "INR" });
    expect(rows.map(row => row.status)).toEqual(["ready", "skip", "error"]);
    expect(rows[0].payload).toEqual({ name: "New Buyer", email: "new@x.example", credit_limit: "5000.00", currency: "INR", is_active: true });
  });
  it("groups purchase order lines by reference and resolves supplier and products", () => {
    const sheet = readSheet("purchase_orders", TEMPLATES.purchase_orders.columns.map(column => column.key).join(",") + "\nPO-1,SUP-1,2025-09-12,2025-10-01,S1,10,19400,34920,12000,Lot 3\nPO-1,SUP-1,2025-09-12,,S2,20,4600,,,\nPO-2,Unknown,2025-09-12,,S1,1,1,,,\nPO-3,SUP-1,2025-09-12,,S9,1,1,,,\n");
    const orders = preparePurchaseOrders(sheet, { suppliers: [{ id: "sup", name: "Quarry", code: "SUP-1" }], products: [{ id: "p1", sku: "S1" }, { id: "p2", sku: "S2" }], currency: "INR" });
    expect(orders.map(order => order.status)).toEqual(["ready", "error", "error"]);
    expect(orders[0].document).toMatchObject({ supplier_id: "sup", order_date: "2025-09-12", expected_date: "2025-10-01", currency: "INR", tax: "34920.00", shipping: "12000.00", notes: "Imported PO-1 · Lot 3" });
    expect((orders[0].document!.items as unknown[]).length).toBe(2);
    expect(orders[1].message).toMatch(/Unknown supplier/); expect(orders[2].message).toMatch(/unknown product SKU "S9"/);
  });
});

it("derives stable, valid v5 UUIDs", async () => {
  const a = await uuidV5("org|po|PO-1"); const b = await uuidV5("org|po|PO-1"); const c = await uuidV5("org|po|PO-2");
  expect(a).toBe(b); expect(a).not.toBe(c);
  expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});
