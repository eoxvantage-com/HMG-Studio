import { describe, expect, it, vi } from "vitest";
import fixture from "./__fixtures__/commerce-ledger.json";
import { generateScopedOperationalReport } from "./ledgerOperationalReports";
import type { ReportRequest } from "./operationalReports";

const org = fixture.state.organization_id;
const request: ReportRequest = { kind: "orders", organizationId: org, from: "2026-11-01", to: "2026-11-30", currency: "INR", status: "" };
const organization = { id: org, is_active: true, deleted_at: null, settings: { stock_authority: "ledger_v2" } };
const dependencies = () => ({ read: vi.fn(), organization: vi.fn().mockResolvedValue(organization), ledger: vi.fn().mockResolvedValue(fixture) });

describe("authority-aware operational reports", () => {
  it("uses the actual domain document snapshot without native order queries or invented payments", async () => {
    const api = dependencies();
    const result = await generateScopedOperationalReport(request, api);
    expect(api.read).not.toHaveBeenCalled();
    expect(result.count).toBe(2);
    expect(result.summaries).toContainEqual({ label: "Recorded order totals (not payments)", value: "47.00 INR" });
    expect(result.columns.some(column => column.key === "amount_paid")).toBe(false);
    expect(result.warnings.join(" ")).toContain(fixture.state.head);
  });
  it("filters a complete snapshot by date, status and currency", async () => {
    const api = dependencies();
    expect((await generateScopedOperationalReport({ ...request, status: "pending" }, api)).count).toBe(1);
    expect((await generateScopedOperationalReport({ ...request, currency: "USD" }, api)).count).toBe(0);
    expect((await generateScopedOperationalReport({ ...request, to: "2026-11-10" }, api)).count).toBe(0);
  });
  it("reads purchasing supplier names from sealed snapshots", async () => {
    const result = await generateScopedOperationalReport({ ...request, kind: "purchase_orders" }, dependencies());
    expect(result.rows.every(row => row.party === "Fixture Supplier")).toBe(true);
    expect(result.count).toBe(2);
  });
  it("does not let an entered draft name override the saved customer snapshot", async () => {
    const copy = structuredClone(fixture);
    Object.values(copy.state.documents).forEach(doc => { if ("customer_name" in doc.draft) doc.draft.customer_name = "Spoofed name"; });
    const api = dependencies(); api.ledger.mockResolvedValue(copy);
    const result = await generateScopedOperationalReport(request, api);
    expect(result.rows.every(row => row.party === "Fixture Buyer")).toBe(true);
  });
  it.each([null, { ...fixture, state: { ...fixture.state, organization_id: "wrong" } }, { ok: false, code: "FORBIDDEN" }])("never falls back to legacy after malformed/denied ledger response", async response => {
    const api = dependencies(); api.ledger.mockResolvedValue(response);
    await expect(generateScopedOperationalReport(request, api)).rejects.toThrow();
    expect(api.read).not.toHaveBeenCalled();
  });
  it.each([null, { ...organization, is_active: false }, { ...organization, settings: { stock_authority: "unknown" } }])("requires verified active organization authority", async value => {
    const api = dependencies(); api.organization.mockResolvedValue(value);
    await expect(generateScopedOperationalReport(request, api)).rejects.toThrow();
    expect(api.read).not.toHaveBeenCalled(); expect(api.ledger).not.toHaveBeenCalled();
  });
  it("labels payment/native adjustment reports historical rather than ledger totals", async () => {
    const api = dependencies(); api.read.mockResolvedValue({ data: [], total: 0 });
    const result = await generateScopedOperationalReport({ ...request, kind: "stock_adjustments", currency: "" }, api);
    expect(result.title).toContain("Historical");
    expect(result.warnings.join(" ")).toMatch(/not.*current/i);
    expect(api.ledger).not.toHaveBeenCalled();
  });
  it("does not publish a stale in-flight snapshot", async () => {
    const api = dependencies(); let current = true;
    api.ledger.mockImplementation(async () => { current = false; return fixture; });
    await expect(generateScopedOperationalReport(request, api, () => current)).rejects.toThrow(/cancelled/i);
  });
  it("rejects invalid dates before executing the ledger", async () => {
    const api = dependencies();
    await expect(generateScopedOperationalReport({ ...request, from: "2026-02-30" }, api)).rejects.toThrow();
    expect(api.ledger).not.toHaveBeenCalled();
  });
});
