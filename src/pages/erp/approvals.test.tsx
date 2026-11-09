import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Refine, type DataProvider } from "@refinedev/core";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ErpModulePage } from "./index";

const getList = vi.fn();
const mutate = vi.fn();
const provider = { getApiUrl: () => "https://example.invalid", getList,
  create: mutate, update: mutate, deleteOne: mutate } as unknown as DataProvider;
function mount() {
  return render(<MemoryRouter initialEntries={["/approvals"]}><Refine dataProvider={provider}
    notificationProvider={() => ({ open: vi.fn(), close: vi.fn() })}
    options={{ disableTelemetry: true }}><ErpModulePage moduleKey="approvals" action="list" /></Refine></MemoryRouter>);
}
describe("read-only pending approval queues", () => {
  beforeEach(() => { getList.mockResolvedValue({ data: [], total: 0 }); });
  afterEach(cleanup);
  it("filters approval state, not ordinary pending document state, on every request", async () => {
    mount();
    await waitFor(() => expect(getList).toHaveBeenCalled());
    expect(screen.getByRole("tab", { name: "Sales orders" })).toBeTruthy();
    for (const [params] of getList.mock.calls) {
      expect(params.resource).toBe("orders");
      expect(params.filters).toContainEqual({ field: "approval_status", operator: "eq", value: "pending" });
    }
    fireEvent.change(screen.getByRole("textbox", { name: /Search sales orders/i }), { target: { value: "SYN" } });
    await waitFor(() => expect(getList).toHaveBeenLastCalledWith(expect.objectContaining({
      filters: expect.arrayContaining([{ field: "approval_status", operator: "eq", value: "pending" },
        expect.objectContaining({ operator: "or", value: expect.arrayContaining([{ field: "order_number", operator: "contains", value: "SYN" }]) })]),
      pagination: expect.objectContaining({ currentPage: 1, pageSize: 10, mode: "server" }),
    })));
    expect(mutate).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: /^Approve$/ })).toBeNull();
    expect(screen.getByText(/not a reviewer-assigned queue/i)).toBeTruthy();
  });
  it("switches resource-specific queues without loading inactive tabs", async () => {
    mount(); await screen.findByText("No sales orders yet");
    for (const [label, resource, field] of [
      ["Purchase orders", "purchase_orders", "approval_status"],
      ["Stock transfers", "stock_transfers", "approval_status"],
      ["Stock adjustment requests", "stock_adjustment_requests", "status"],
    ]) {
      getList.mockClear(); fireEvent.click(screen.getByRole("tab", { name: label }));
      await waitFor(() => expect(getList).toHaveBeenCalled());
      for (const [params] of getList.mock.calls) {
        expect(params.resource).toBe(resource);
        expect(params.filters).toContainEqual({ field, operator: "eq", value: "pending" });
      }
    }
  });
  it("keeps denied queues retryable instead of displaying a false empty state", async () => {
    getList.mockRejectedValue({ message: "Forbidden", statusCode: 403 }); mount();
    expect(await screen.findByText("Unable to load sales orders")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
    expect(screen.queryByText("No sales orders yet")).toBeNull();
  });
  it("qualifies monetary list values with their own row currency without conversion", async () => {
    getList.mockResolvedValue({ data: [{ id: "order-1", order_number: "SYN-1", approval_status: "pending",
      status: "processing", total: "100.00", currency: "INR" }], total: 1 });
    mount(); expect(await screen.findByText(/100\.00 INR/)).toBeTruthy();
  });
});
