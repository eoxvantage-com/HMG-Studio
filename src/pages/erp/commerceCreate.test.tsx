import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OrderCreateWorkspace, ReturnCreateWorkspace } from "./commerceCreate";

const fixture = vi.hoisted(() => ({ owner: "11111111-1111-4111-8111-111111111111", organizationId: "22222222-2222-4222-8222-222222222222" }));
vi.mock("@refinedev/core", () => ({
  useGetIdentity: () => ({ data: { id: fixture.owner }, isLoading: false, isFetching: false, isError: false }),
  useList: (args: Record<string, unknown>) => {
    const resource = String(args.resource);
    const values: Record<string, Array<Record<string, unknown>>> = {
      organizations: [{ id: fixture.organizationId, name: "HMG Stones", currency: "INR" }],
      customers: [{ id: "33333333-3333-4333-8333-333333333333", organization_id: fixture.organizationId, name: "Project Buyer", currency: "INR", is_active: true }],
      products: [{ id: "44444444-4444-4444-8444-444444444444", organization_id: fixture.organizationId, name: "Absolute Black Slab", sku: "ABS-01", price: 6800, currency: "INR", is_active: true }],
      product_variants: [], orders: [], order_items: [], return_orders: [], return_order_items: [],
    };
    const rows = values[resource] ?? [];
    return { result: { data: rows, total: rows.length }, query: { isLoading: false, isFetching: false, isError: false, refetch: vi.fn() } };
  },
}));
afterEach(() => cleanup());

describe("commerce create forms", () => {
  it("renders a real-data order form and never enables an unverified save", async () => {
    render(<MemoryRouter><OrderCreateWorkspace /></MemoryRouter>);
    expect(await screen.findByRole("heading", { name: "Create Order" })).toBeTruthy();
    await waitFor(() => expect(screen.getByRole("combobox", { name: /Organization/ })).toBeTruthy());
    expect(screen.getByRole("textbox", { name: /Customer name/ })).toBeTruthy();
    expect(document.querySelector('input[type="date"]')).toBeTruthy();
    expect(screen.getByRole("button", { name: "Create Order" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByText(/No order or stock write has been sent/i)).toBeTruthy();
  });
  it("renders return eligibility fields with saving guarded", async () => {
    render(<MemoryRouter><ReturnCreateWorkspace /></MemoryRouter>);
    expect(await screen.findByRole("heading", { name: "Create Return" })).toBeTruthy();
    expect(screen.getByRole("combobox", { name: /Organization/ })).toBeTruthy();
    expect(screen.getByRole("combobox", { name: /Eligible order/ })).toBeTruthy();
    expect(screen.getByRole("textbox", { name: /Reason/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Submit Return Request" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByText(/No refund or stock update will occur here/i)).toBeTruthy();
  });
});
