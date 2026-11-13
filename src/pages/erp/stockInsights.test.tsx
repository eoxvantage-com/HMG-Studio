import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, expect, it, vi } from "vitest";
import { StockInsights } from "./stockInsights";

const org = "22222222-2222-4222-8222-222222222222";
vi.mock("@refinedev/core", () => ({
  useGetIdentity: () => ({ data: { id: "11111111-1111-4111-8111-111111111111" }, isLoading: false, isFetching: false, isError: false }),
  useNotification: () => ({ open: vi.fn() }),
  useDataProvider: () => () => ({ getList: async ({ resource }: { resource: string }) => ({ data: resource === "products" ? [{ id: "p1", organization_id: org, name: "Statuario", sku: "S1", is_active: true, selling_price: 100, purchase_price: 60, min_stock: 20 }] : resource === "product_locations" ? [{ id: "f", organization_id: org, name: "Factory Yard" }] : [], total: 1 }) }),
  useList: () => ({ result: { data: [{ id: org, name: "HMG Stones", is_active: true, settings: { stock_authority: "ledger_v2" } }], total: 1 }, query: { isLoading: false, isFetching: false, isError: false } }),
}));
vi.mock("../../hooks/useCommerceLedger", () => ({ useCommerceLedger: () => ({ owner: "11111111-1111-4111-8111-111111111111", enabled: true, locked: false, pending: null, busy: false, message: "", refresh: vi.fn(), execute: vi.fn(),
  state: { organization_id: org, sequence: 3, head: "a".repeat(64), documents: {}, entitlements: {}, requests: {}, reservations: {}, stock_requests: {}, balances: [{ product_id: "p1", location_id: "f", quantity: 12, reserved: 2 }] } }) }));
afterEach(() => { cleanup(); localStorage.clear(); });

it("shows live ledger stock by location with values", async () => {
  render(<MemoryRouter><StockInsights view="levels" /></MemoryRouter>);
  expect(await screen.findByRole("link", { name: "Statuario" })).toBeTruthy();
  expect(screen.getAllByText("Factory Yard").length).toBeGreaterThan(0);
  expect(screen.getByRole("heading", { name: "Stock by warehouse" })).toBeTruthy();
  expect(screen.getAllByText("₹1,200.00").length).toBeGreaterThan(0);
});
it("suggests replenishment for products below their minimum", async () => {
  render(<MemoryRouter><StockInsights view="replenishment" /></MemoryRouter>);
  await waitFor(() => expect(screen.getAllByText("Below reorder point").length).toBe(2));
  expect(screen.getByRole("link", { name: "Order Statuario" }).getAttribute("href")).toBe("/purchase-orders/create");
});
