import { describe, expect, it } from "vitest";
import { notificationFilters, safeNotificationPath, validateNotificationPage } from "./notifications";
const owner = "11111111-1111-4111-8111-111111111111";
const row = { id: "22222222-2222-4222-8222-222222222222", user_id: owner, title: "Stock warning", message: "Review the yard", type: "info", priority: "normal", read_at: null };
describe("personal notification contract", () => {
  it("keeps personal scope while adding server search, read and type filters", () => {
    expect(notificationFilters(owner, { search: " stone ", status: "unread", type: "warning" })).toEqual([
      { field: "user_id", operator: "eq", value: owner },
      { field: "title", operator: "contains", value: "stone" },
      { field: "read_at", operator: "null", value: true },
      { field: "type", operator: "eq", value: "warning" },
    ]);
    expect(notificationFilters(owner, { status: "read" })).toContainEqual({ field: "read_at", operator: "nnull", value: true });
    expect(() => notificationFilters("")).toThrow();
  });
  it("accepts provider totals, not a count of the fetched page", () => {
    expect(validateNotificationPage({ data: [row], total: 40 }, owner).total).toBe(40);
  });
  it("fails closed for wrong owners and malformed totals or rows", () => {
    for (const value of [{ data: [row], total: -1 }, { data: [row] }, { data: [row], total: 0 }, { data: [{ ...row, user_id: "other" }], total: 1 }, { data: [{ ...row, title: {} }], total: 1 }]) {
      expect(() => validateNotificationPage(value, owner)).toThrow();
    }
  });
  it("only navigates to known read-only internal routes", () => {
    expect(safeNotificationPath("/inventory")).toBe("/inventory");
    expect(safeNotificationPath(`/orders/show/${row.id}`)).toBe(`/orders/show/${row.id}`);
    for (const url of ["https://evil.invalid", "//evil.invalid", "/\\evil.invalid", "javascript:alert(1)", "/%2f%2fevil.invalid", "/inventory/../users", "/inventory/create", "/logout", "/orders?redirect=https://evil.invalid", "/unknown", null]) {
      expect(safeNotificationPath(url)).toBeUndefined();
    }
  });
});
