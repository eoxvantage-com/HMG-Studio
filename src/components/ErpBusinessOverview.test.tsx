import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { getErpResource } from "../services/erp";
import { ModuleRecordOverview } from "./ErpBusinessOverview";
afterEach(cleanup);

describe("grouped business overview", () => {
  it("shows grouped order sections with independent statuses and no fabricated outstanding balance", () => {
    render(<ModuleRecordOverview resource={getErpResource("orders")!} record={{ id: "1", total: 100, amount_paid: 0, currency: "USD", status: "pending", payment_status: "unpaid", approval_status: "approved" }} />);
    expect(screen.getByRole("heading", { name: "Amounts & payment" })).toBeTruthy();
    expect(screen.getAllByText("Pending").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Unpaid").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Approved").length).toBeGreaterThan(0);
    expect(screen.queryByText(/Outstanding balance/i)).toBeNull();
    const summary = within(screen.getByRole("region", { name: "At a glance" }));
    expect(summary.getByText("Total")).toBeTruthy();
    expect(summary.getByText("Amount paid")).toBeTruthy();
    expect(summary.getByText("Unpaid")).toBeTruthy();
  });
  it("uses inherited return currency and describes refund recording honestly", () => {
    render(<ModuleRecordOverview resource={getErpResource("return_orders")!} record={{ id: "1", refund_amount: 0, status: "pending", order_id: "parent" }} context={{ currency: "GBP" }} referenceLabel={() => "ORD-001"} />);
    expect(screen.getAllByText(/GBP/).length).toBeGreaterThan(0);
    expect(screen.getByText("ORD-001")).toBeTruthy();
    expect(screen.getByText(/does not confirm that a refund was executed/i)).toBeTruthy();
    expect(screen.queryByText("parent")).toBeNull();
  });
  it("reuses report details and renders no controls or extra data queries", () => {
    render(<ModuleRecordOverview resource={getErpResource("saved_reports")!} record={{ id: "1", name: "A report", columns_json: ["sku"], filters_json: { items: [] }, sort_json: { field: "sku", direction: "asc" } }} />);
    expect(screen.getByRole("heading", { name: "Report definition" })).toBeTruthy();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(screen.getByText(/does not execute the report/)).toBeTruthy();
  });
  it("groups location placement without exposing organization IDs", () => {
    render(<ModuleRecordOverview resource={getErpResource("product_locations")!} record={{ id: "1", name: "Slab bay", organization_id: "private-org", aisle: "A", shelf: "2", bin: "4", capacity: 0 }} />);
    expect(screen.getByRole("heading", { name: "Storage position" })).toBeTruthy();
    expect(screen.queryByText("private-org")).toBeNull();
    expect(screen.getAllByText("0").length).toBeGreaterThan(0);
  });
  it("summarizes persisted adjustment quantities without calculating or filling missing quantities", () => {
    render(<ModuleRecordOverview resource={getErpResource("stock_adjustments")!} record={{ id: "1", quantity_before: 12, adjustment_quantity: -2, quantity_after: null }} />);
    const summary = within(screen.getByRole("region", { name: "At a glance" }));
    expect(summary.getByText("12")).toBeTruthy();
    expect(summary.getByText("-2")).toBeTruthy();
    expect(summary.getByText("Not recorded")).toBeTruthy();
    expect(summary.queryByText("10")).toBeNull();
  });
  it("uses customer credit and currency rather than fabricated order counts", () => {
    render(<ModuleRecordOverview resource={getErpResource("customers")!} record={{ id: "1", credit_limit: 0, currency: "EUR", is_active: false }} />);
    const summary = within(screen.getByRole("region", { name: "At a glance" }));
    expect(summary.getByText("Credit limit")).toBeTruthy();
    expect(summary.getByText("EUR")).toBeTruthy();
    expect(summary.getByText("Inactive")).toBeTruthy();
    expect(summary.queryByText(/orders/i)).toBeNull();
  });
});
