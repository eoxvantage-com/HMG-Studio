import { describe, expect, it } from "vitest";
import { formatMetric, parseAnalysis } from "./dashboardAnalysis";
import { parseDashboard } from "./dashboard";
import { analysisFixture } from "./__fixtures__/dashboardAnalysis";

const money = (value: string) => `₹${value}`;
const base = { ok: true, currency: "INR", dataset: "all", unclassified_organizations: 0, generated_at: "2026-11-13T09:00:00Z", product_count: 1, category_count: 1, location_count: 1, inventory_value: "1.00", pending_orders: 0, order_count: 0, revenue_month: "0.00", receivables: "0.00", stock_by_category: [], low_stock: [], low_stock_count: 0, recent_orders: [], recent_products: [] };

describe("dashboard analysis parsing", () => {
  it("accepts the server analysis shape", () => {
    expect(parseAnalysis(analysisFixture())?.segments).toHaveLength(8);
  });
  it("rejects external links, wrong segment counts and non-numeric metrics", () => {
    const external = analysisFixture(); external.alerts[0].link = "https://evil.test/";
    expect(parseAnalysis(external)).toBeNull();
    const protocolRelative = analysisFixture(); protocolRelative.segments[0].link = "//evil.test";
    expect(parseAnalysis(protocolRelative)).toBeNull();
    const short = analysisFixture(); short.segments.pop();
    expect(parseAnalysis(short)).toBeNull();
    const text = analysisFixture(); text.segments[0].value.value = "lots";
    expect(parseAnalysis(text)).toBeNull();
  });
  it("keeps the overview when the analysis is invalid or missing", () => {
    expect(parseDashboard({ ...base, analysis: { status: "watch" } })?.analysis).toBeNull();
    expect(parseDashboard({ ...base, analysis: null })?.analysis).toBeNull();
    expect(parseDashboard(base)?.analysis).toBeUndefined();
    expect(parseDashboard({ ...base, analysis: analysisFixture() })?.analysis?.status).toBe("watch");
  });
  it("formats missing values as not available, never zero", () => {
    expect(formatMetric({ label: "Average", kind: "days", value: null }, money)).toBe("Not available");
    expect(formatMetric({ label: "Average", kind: "days", value: "3.5" }, money)).toBe("3.5 days");
    expect(formatMetric({ label: "Rate", kind: "percent", value: "71.3" }, money)).toBe("71.3%");
    expect(formatMetric({ label: "Value", kind: "money", value: "10.00" }, money)).toBe("₹10.00");
    expect(formatMetric({ label: "Units", kind: "count", value: "1500" }, money)).toBe("1,500");
  });
});
