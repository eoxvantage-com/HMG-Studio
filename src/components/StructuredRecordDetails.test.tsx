import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { StructuredRecordDetails } from "./StructuredRecordDetails";
afterEach(cleanup);
describe("structured record details", () => {
  it("shows report columns, filter count and sorting without executing a report", () => {
    render(<StructuredRecordDetails resource="saved_reports" record={{ columns_json: ["name", "sku"], filters_json: { items: [] }, sort_json: { field: "name", direction: "asc" } }} />);
    expect(screen.getByRole("heading", { name: "Report definition" })).toBeTruthy();
    expect(screen.getByText("SKU")).toBeTruthy();
    expect(screen.getByText("No filters configured")).toBeTruthy();
    expect(screen.getByText("Name · Ascending")).toBeTruthy();
  });
  it("distinguishes malformed configuration from an empty configuration", () => {
    render(<StructuredRecordDetails resource="saved_reports" record={{ columns: "invalid", filters: "invalid", sort: "invalid" }} />);
    expect(screen.getAllByText("Unavailable or invalid configuration")).toHaveLength(3);
    expect(screen.queryByText("No filters configured")).toBeNull();
  });
  it("renders synthetic activity data as text and hides sensitive property keys", () => {
    render(<StructuredRecordDetails resource="activity_logs" record={{ properties_json: { synthetic: true, purpose: "<script>example</script>", api_key: "secret-value" } }} />);
    expect(screen.getByText("<script>example</script>")).toBeTruthy();
    expect(screen.queryByText(/secret-value/)).toBeNull();
    expect(document.querySelector("script")).toBeNull();
  });
  it("redacts sensitive field-filter values even in nested groups", () => {
    render(<StructuredRecordDetails resource="saved_reports" record={{ filters_json: { items: [{ operator: "or", value: [{ field: "api_key", operator: "eq", value: "never-show-this" }] }] } }} />);
    expect(screen.queryByText(/never-show-this/)).toBeNull();
    expect(screen.getByText(/redacted/)).toBeTruthy();
  });
});
