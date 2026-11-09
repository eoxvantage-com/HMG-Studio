import { describe, expect, it } from "vitest";
import { getErpResource, type ErpResource } from "./erp";
import { businessSections, moduleListFields, moduleSearchFields, presentationValue, statusPresentation } from "./erpPresentation";

const resource = (name: string) => getErpResource(name)!;
const value = (name: string, field: string, item: unknown, currency?: string) => presentationValue(resource(name), resource(name).schema.fields.find(x => x.name === field)!, item, { currency });

describe("business record presentation", () => {
  it("preserves zero and unknown monetary amounts without inventing INR", () => {
    expect(value("return_orders", "refund_amount", 0)).toContain("0");
    expect(value("return_orders", "refund_amount", 0)).toContain("currency unavailable");
    expect(value("return_orders", "refund_amount", null)).toBe("Not recorded");
    expect(value("return_orders", "refund_amount", "0", "USD")).toContain("USD");
    expect(value("return_orders", "refund_amount", false, "USD")).toBe("Not available");
  });
  it("shows independent persisted status domains and rejects malformed boolean values", () => {
    expect(statusPresentation("status", "pending")?.label).toBe("Pending");
    expect(statusPresentation("payment_status", "paid")?.label).toBe("Paid");
    expect(statusPresentation("approval_status", "rejected")?.label).toBe("Rejected");
    expect(statusPresentation("is_active", false)?.label).toBe("Inactive");
    expect(statusPresentation("is_active", "false")?.label).toBe("Not recorded");
    expect(statusPresentation("name", "paid")).toBeNull();
  });
  it("distinguishes a resolved reference label from an unresolved ID", () => {
    const r = resource("purchase_orders");
    const f = r.schema.fields.find(x => x.name === "supplier_id")!;
    expect(presentationValue(r, f, "supplier-123")).toBe("Reference: supplier-123");
    expect(presentationValue(r, f, "supplier-123", { referenceLabel: () => "Stone supplier" })).toBe("Stone supplier");
    expect(presentationValue(r, f, "supplier-123", { referenceLabel: () => "supplier-123" })).toBe("Reference: supplier-123");
  });
  it("groups every permitted field once and hides organization and sensitive fields", () => {
    for (const name of ["orders", "customers", "return_orders", "purchase_orders", "suppliers", "product_locations", "stock_adjustments"]) {
      const sections = businessSections(resource(name));
      const names = sections.flatMap(section => section.fields.map(field => field.name));
      expect(new Set(names).size).toBe(names.length);
      expect(names).not.toContain("organization_id");
      expect(sections.some(section => section.fields.length > 1)).toBe(true);
    }
    const r: ErpResource = { name: "unknown", title: "Unknown", schema: { fields: [{ name: "name", type: "string" }, { name: "api-key", type: "string" }, { name: "notes", type: "string" }] } };
    expect(businessSections(r).flatMap(section => section.fields.map(field => field.name))).toEqual(["name", "notes"]);
  });
  it("has currency-aware list fields and schema-bound multi-field searches", () => {
    expect(moduleSearchFields(resource("customers"))).toEqual(expect.arrayContaining(["name", "email"]));
    expect(moduleSearchFields(resource("orders"))).not.toContain("total");
    expect(moduleListFields(resource("orders")).map(x => x.name)).toContain("payment_status");
    expect(moduleListFields(resource("orders")).length).toBeLessThanOrEqual(6);
    expect(moduleSearchFields({ name: "ids_only", title: "IDs", schema: { fields: [{ name: "id", type: "string", format: "uuid" }] } })).toEqual([]);
    expect(moduleSearchFields({ name: "contacts", title: "Contacts", schema: { fields: [{ name: "email", type: "string", format: "email" }] } })).toEqual(["email"]);
  });
  it("keeps structured reports in their existing specialized renderer", () => {
    const names = businessSections(resource("saved_reports")).flatMap(s => s.fields.map(f => f.name));
    expect(names).not.toContain("filters_json");
    expect(names).not.toContain("columns_json");
  });
  it("organizes supporting resources into relationships, quantities and amounts", () => {
    const sections = businessSections(resource("order_items"));
    expect(sections.find(section => section.title === "Related records")?.fields.map(field => field.name)).toContain("product_id");
    expect(sections.find(section => section.title === "Recorded amounts")?.fields.map(field => field.name)).toContain("unit_price");
    expect(sections.find(section => section.title === "Quantities & limits")?.fields.map(field => field.name)).toContain("quantity");
  });
  it("does not coerce missing quantities, monetary precision or structured data into invented values", () => {
    expect(value("stock_adjustments", "quantity_before", 0)).toBe("0");
    expect(value("stock_adjustments", "quantity_before", null)).toBe("Not recorded");
    expect(value("orders", "total", "NaN", "USD")).toBe("Not available");
    expect(value("orders", "metadata", { api_key: "secret" })).toBe("Structured data");
  });
});
