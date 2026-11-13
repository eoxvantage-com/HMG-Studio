import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PurchaseOrderWorkspace } from "./purchaseOrderWorkspace";

const calls = vi.hoisted(() => [] as Array<Record<string, unknown>>);
const fixture = vi.hoisted(() => ({ emptyOrganizations: false, staleProduct: false }));
vi.mock("../../hooks/useCommerceLedger",()=>({useCommerceLedger:()=>({owner:"11111111-1111-4111-8111-111111111111",state:null,enabled:false,locked:true,pending:null,busy:false,refresh:vi.fn()})}));
vi.mock("@refinedev/core", () => ({
  useWarnAboutChange:()=>({warnWhen:false,setWarnWhen:vi.fn()}),
  useGetIdentity: () => ({ data: { id: "11111111-1111-4111-8111-111111111111" }, isLoading: false, isFetching: false, isError: false }),
  useList: (args: Record<string, unknown>) => {
    calls.push(args);
    const resource = String(args.resource);
    const rows: Record<string, Array<Record<string, unknown>>> = {
      organizations: fixture.emptyOrganizations ? [] : [{ id: "22222222-2222-4222-8222-222222222222", name: "HMG", default_currency: "INR" }],
      suppliers: [{ id: "33333333-3333-4333-8333-333333333333", organization_id: "22222222-2222-4222-8222-222222222222", name: "Stone Supplier", currency: "INR" }],
      products: [{ id: "44444444-4444-4444-8444-444444444444", organization_id: "22222222-2222-4222-8222-222222222222", name: "Granite", sku: "G-1", type:"standard",tracking_type:"none" }],
    };
    return { result: { data: rows[resource] ?? [], total: (rows[resource] ?? []).length }, query: { isLoading: false, isFetching: false, isError: false } };
  },
  useOne: () => ({ result: fixture.staleProduct ? { id: "55555555-5555-4555-8555-555555555555", organization_id: "22222222-2222-4222-8222-222222222222", name: "Inactive slab", is_active: false } : null, query: { isLoading: false, isFetching: false, isError: false } }),
}));
vi.mock("./purchaseOrderCreate", () => ({ PurchaseOrderCreate: ({ suppliers, products, lookupStatus, lookupError, organizationCurrency, onProductSelected }: { suppliers: unknown[]; products: unknown[]; lookupStatus: string; lookupError?: string; organizationCurrency: string; onProductSelected?: (id: string) => void }) => <div data-testid="po-form">{lookupStatus} / {organizationCurrency} / {suppliers.length} / {products.length} / {lookupError}<button onClick={() => onProductSelected?.("55555555-5555-4555-8555-555555555555")}>Select stale product</button></div> }));
afterEach(() => { cleanup(); calls.length = 0; fixture.emptyOrganizations = false; fixture.staleProduct = false; });

describe("purchase order workspace loader", () => {
  it("selects the sole permitted organization and scopes live supplier/product lookups", async () => {
    render(<MemoryRouter><PurchaseOrderWorkspace /></MemoryRouter>);
    await waitFor(() => expect(screen.getByTestId("po-form").textContent).toContain("ready / INR / 1 / 1"));
    for (const resource of ["suppliers", "products"]) {
      const call = calls.find(item => item.resource === resource && (item.queryOptions as { enabled?: boolean })?.enabled);
      expect(call).toBeTruthy();
      expect(call?.filters).toEqual(expect.arrayContaining([{ field: "organization_id", operator: "eq", value: "22222222-2222-4222-8222-222222222222" }]));
      expect(call?.meta).toEqual({ lookupOwner: "11111111-1111-4111-8111-111111111111" });
    }
    for (const resource of ["product_variants", "product_supplier"]) expect(calls.find(item => item.resource === resource)?.meta).toEqual({ lookupOwner: "11111111-1111-4111-8111-111111111111" });
  });
  it("reports when no organizations are available instead of loading forever", async () => {
    fixture.emptyOrganizations = true;
    render(<MemoryRouter><PurchaseOrderWorkspace /></MemoryRouter>);
    await waitFor(() => expect(screen.getByTestId("po-form").textContent).toContain("error /"));
    expect(screen.getByTestId("po-form").textContent).toContain("No permitted organizations");
  });
  it("does not add an inactive stale product detail to the options", async () => {
    fixture.staleProduct = true;
    render(<MemoryRouter><PurchaseOrderWorkspace /></MemoryRouter>);
    await waitFor(() => expect(screen.getByTestId("po-form").textContent).toContain("ready / INR / 1 / 1"));
    fireEvent.click(screen.getByRole("button", { name: "Select stale product" }));
    await waitFor(() => expect(screen.getByTestId("po-form").textContent).toContain("error / INR / 1 / 1"));
  });
});
