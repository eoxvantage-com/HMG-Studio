import { describe, expect, it, vi } from "vitest";
import { generateOperationalReport, reportTimestamp, type ReportRequest } from "./operationalReports";
const org = "11111111-1111-4111-8111-111111111111";
const id = (n: number) => `22222222-2222-4222-8222-${String(n).padStart(12, "0")}`;
const request: ReportRequest = { kind: "orders", organizationId: org, from: "2026-05-01", to: "2026-10-31", currency: "INR", status: "" };
const order = (n = 1) => ({ id: id(n), organization_id: org, order_number: `SO-${n}`, order_date: "2026-06-01T00:00:00Z", status: "pending", currency: "INR", total: "12.34", amount_paid: "2.10", customer_name: "Stone buyer", secret_note: "hidden", deleted_at: null });
describe("bounded operational reports", () => {
  it("uses server organization/date/currency filters and exports only fixed displayed fields", async () => {
    const read = vi.fn().mockResolvedValue({ data: [order()], total: 1 });
    const result = await generateOperationalReport(request, read);
    expect(read).toHaveBeenCalledWith(expect.objectContaining({ resource: "orders", sorters: [{ field: "id", order: "asc" }], filters: expect.arrayContaining([{ field: "organization_id", operator: "eq", value: org }, { field: "currency", operator: "eq", value: "INR" }, { field: "order_date", operator: "gte", value: "2026-05-01T00:00:00.000Z" }]) }));
    expect(result.rows).toHaveLength(1); expect(JSON.stringify(result)).not.toContain("hidden");
    expect(result.groups).toEqual([{ label: "Pending", count: 1 }]);
    expect(result.summaries).toContainEqual({ label: "Recorded order totals", value: "12.34 INR" });
  });
  it("reads stable bounded pages completely, including an exact-boundary exhaustion check", async () => {
    const read = vi.fn().mockResolvedValueOnce({ data: Array.from({ length: 100 }, (_, n) => order(n + 1)), total: 100 }).mockResolvedValueOnce({ data: [], total: 100 });
    expect((await generateOperationalReport(request, read)).rows).toHaveLength(100);
    expect(read).toHaveBeenCalledTimes(2);
  });
  it.each(["over-limit", "duplicate", "changed-total", "short-page"])("rejects %s instead of publishing partial totals", async mode => {
    const first = Array.from({ length: 100 }, (_, n) => order(n + 1));
    const read = vi.fn().mockResolvedValueOnce(mode === "over-limit" ? { data: [order()], total: 501 } : mode === "short-page" ? { data: [order()], total: 101 } : { data: first, total: 101 }).mockResolvedValueOnce({ data: [order(mode === "duplicate" ? 1 : 101)], total: mode === "changed-total" ? 102 : 101 });
    await expect(generateOperationalReport(request, read)).rejects.toThrow();
  });
  it.each([{ organization_id: id(8) }, { order_date: "2027-01-01" }, { currency: "USD" }, { id: "bad" }])("rejects rows outside the requested scope", async patch => {
    await expect(generateOperationalReport(request, vi.fn().mockResolvedValue({ data: [{ ...order(), ...patch }], total: 1 }))).rejects.toThrow();
  });
  it("cancels stale generation before returning or reading another page", async () => {
    let current = true;
    const read = vi.fn(async () => { current = false; return { data: [order()], total: 1 }; });
    await expect(generateOperationalReport(request, read, () => current)).rejects.toThrow("cancelled");
    expect(read).toHaveBeenCalledTimes(1);
  });
  it("resolves payment currency only through authorized matching orders and keeps refunds separate", async () => {
    const read = vi.fn().mockImplementation(async ({ resource }) => resource === "order_payments" ? { data: [{ id: id(2), organization_id: org, order_id: id(1), paid_at: "2026-06-01T00:00:00Z", type: "refund", voided_at: null, amount: "4.50", method: "cash" }], total: 1 } : { data: [order()], total: 1 });
    const result = await generateOperationalReport({ ...request, kind: "order_payments", currency: "" }, read);
    expect(result.summaries).toContainEqual({ label: "Recorded non-voided refund amounts", value: "4.50 INR" });
    expect(read).toHaveBeenCalledWith(expect.objectContaining({ resource: "orders", filters: expect.arrayContaining([{ field: "id", operator: "in", value: [id(1)] }]) }));
  });
  it("withholds payment amount summaries when parent currency is unavailable", async () => {
    const read = vi.fn().mockImplementation(async ({ resource }) => resource === "order_payments" ? { data: [{ id: id(2), organization_id: org, order_id: id(1), paid_at: "2026-06-01T00:00:00Z", type: "payment", voided_at: null, amount: 50 }], total: 1 } : { data: [], total: 0 });
    const result = await generateOperationalReport({ ...request, kind: "order_payments", currency: "" }, read);
    expect(result.summaries).toEqual([]); expect(result.warnings.join(" ")).toMatch(/currency/i);
  });
  it("never sums quantities across stock snapshots and does not treat null money as zero", async () => {
    const result = await generateOperationalReport({ ...request, kind: "stock_adjustments", currency: "" }, vi.fn().mockResolvedValue({ data: [{ id: id(1), organization_id: org, created_at: "2026-06-01", type: "addition", quantity_before: 10, adjustment_quantity: 3, quantity_after: 13 }], total: 1 }));
    expect(result.summaries).toEqual([]);
    const unknown = await generateOperationalReport(request, vi.fn().mockResolvedValue({ data: [{ ...order(), total: null }], total: 1 }));
    expect(unknown.summaries.some(item => item.label === "Recorded order totals")).toBe(false);
  });
  it("rejects invalid organization, report kind, currency or date before any query", async () => {
    const read = vi.fn();
    for (const patch of [{ organizationId: "" }, { kind: "auth_user" }, { currency: "bad" }, { from: "2026-02-30" }]) await expect(generateOperationalReport({ ...request, ...patch } as ReportRequest, read)).rejects.toThrow();
    expect(read).not.toHaveBeenCalled();
  });
  it("resolves purchasing suppliers with bounded authorized IDs rather than exposing raw party IDs", async () => {
    const read = vi.fn().mockImplementation(async ({ resource }) => resource === "purchase_orders" ? { data: [{ id: id(2), organization_id: org, supplier_id: id(1), po_number: "PO-1", order_date: "2026-06-01", currency: "INR", total: "10", status: "draft", deleted_at: null }], total: 1 } : { data: [{ id: id(1), organization_id: org, name: "Quarry", deleted_at: null }], total: 1 });
    const result = await generateOperationalReport({ ...request, kind: "purchase_orders" }, read);
    expect(result.rows[0].supplier_id).toBe("Quarry");
    expect(read).toHaveBeenCalledWith(expect.objectContaining({ resource: "suppliers", filters: expect.arrayContaining([{ field: "id", operator: "in", value: [id(1)] }]) }));
  });

  it("normalizes native timezone-less timestamps to UTC and rejects invalid calendar dates", () => {
    expect(reportTimestamp("2026-06-01T00:00:00")).toBe(Date.UTC(2026, 5, 1));
    expect(reportTimestamp("2026-06-01 00:00:00")).toBe(Date.UTC(2026, 5, 1));
    expect(reportTimestamp("2026-06-01T02:00:00+02:00")).toBe(Date.UTC(2026, 5, 1));
    expect(Number.isNaN(reportTimestamp("2026-02-30"))).toBe(true);
    expect(Number.isNaN(reportTimestamp("2026-02-30T10:00:00Z"))).toBe(true);
  });
  it("includes a timezone-less timestamp at the requested UTC end-day boundary", async () => {
    const result = await generateOperationalReport(request, vi.fn().mockResolvedValue({ data: [{ ...order(), order_date: "2026-10-31T23:59:59" }], total: 1 }));
    expect(result.count).toBe(1);
  });
  it("does not count voided or unreturned void states as non-voided payments", async () => {
    const payment = { organization_id: org, order_id: id(1), paid_at: "2026-06-01T00:00:00", type: "payment", amount: "10.00" };
    const read = vi.fn().mockImplementation(async ({ resource }) => resource === "order_payments" ? { data: [{ ...payment, id: id(2), voided_at: null }, { ...payment, id: id(3), voided_at: "2026-06-02T00:00:00Z" }, { ...payment, id: id(4) }], total: 3 } : { data: [order()], total: 1 });
    const result = await generateOperationalReport({ ...request, kind: "order_payments", currency: "" }, read);
    expect(result.rows[0].voided_at).toBe("Not voided");
    expect(result.rows[2].voided_at).toBe("Void state unavailable");
    expect(result.summaries).toEqual([{ label: "Recorded non-voided payment amounts", value: "10.00 INR" }]);
    expect(result.warnings.join(" ")).toMatch(/void/i);
  });
  it.each([false, {}, NaN, Infinity, 99_999_999_999_999.99])("does not display malformed or unsafe numeric money as a real amount", async total => {
    const result = await generateOperationalReport(request, vi.fn().mockResolvedValue({ data: [{ ...order(), total }], total: 1 }));
    expect(result.rows[0].total).toBe("Not available");
    expect(result.summaries.some(summary => summary.label === "Recorded order totals")).toBe(false);
  });
  it.each([undefined, false, 0, ""])("rejects absent or malformed deletion state", async deleted_at => {
    await expect(generateOperationalReport(request, vi.fn().mockResolvedValue({ data: [{ ...order(), deleted_at }], total: 1 }))).rejects.toThrow();
  });

});
