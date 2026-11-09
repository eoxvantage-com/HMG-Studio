import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { PurchaseOrderCreate } from "./purchaseOrderCreate";
import type { PurchaseOrderDraft } from "./purchaseOrderDraft";

const suppliers = [{ id: "s1", name: "Stone Supplier", currency: "INR" }];
const products = [{ id: "p1", name: "Absolute Black Slab", sku: "ABS-1", has_variants: true, variants: [{ id: "v1", title: "Polished", sku: "ABS-P", is_active: true }], supplier_costs: [{ supplier_id: "s1", cost_price: 21.25, supplier_sku: "HMG-ABS" }] }];
const base = { suppliers, products, organizationCurrency: "USD", today: "2026-11-08" };
afterEach(cleanup);

describe("purchase order create form", () => {
  it("shows source fields and an honest unsaved/loading state without sending a write", () => {
    const onSubmit = vi.fn();
    render(<MemoryRouter><PurchaseOrderCreate {...base} lookupStatus="loading" onSubmit={onSubmit} /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "Create purchase order" })).toBeTruthy();
    expect(screen.getByLabelText(/Supplier \*/)).toBeTruthy();
    expect(screen.getByLabelText(/Order date \*/)).toBeTruthy();
    expect(screen.getByLabelText(/Expected delivery/)).toBeTruthy();
    expect(screen.getByLabelText(/Currency \*/)).toBeTruthy();
    expect(screen.getByLabelText(/Notes/)).toBeTruthy();
    expect(screen.getByText(/not saved/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Create purchase order/i }).hasAttribute("disabled")).toBe(true);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("adds a supplier-priced variant line and recalculates preview totals without saving", async () => {
    render(<MemoryRouter><PurchaseOrderCreate {...base} lookupStatus="ready" /></MemoryRouter>);
    fireEvent.change(screen.getByRole("combobox", { name: "Supplier" }), { target: { value: "Stone" } });
    fireEvent.click(await screen.findByRole("option", { name: "Stone Supplier" }));
    expect((screen.getByLabelText(/Currency \*/) as HTMLInputElement).value).toBe("INR");
    fireEvent.change(screen.getByRole("combobox", { name: "Product" }), { target: { value: "Absolute" } });
    fireEvent.click(await screen.findByRole("option", { name: /Absolute Black Slab/ }));
    fireEvent.change(screen.getByRole("combobox", { name: "Variant" }), { target: { value: "Polished" } });
    fireEvent.click(await screen.findByRole("option", { name: /Polished/ }));
    expect((screen.getByLabelText(/Unit cost \*/) as HTMLInputElement).value).toBe("21.25");
    expect((screen.getByLabelText(/Supplier SKU/) as HTMLInputElement).value).toBe("HMG-ABS");
    fireEvent.change(screen.getByLabelText(/Quantity \*/), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: "Add line" }));
    const lines = screen.getByRole("region", { name: "Purchase order lines" });
    expect(within(lines).getByText("Absolute Black Slab")).toBeTruthy();
    expect(within(lines).getByText(/ABS-P/)).toBeTruthy();
    expect(screen.getByTestId("purchase-order-subtotal").textContent).toContain("42.50");
    fireEvent.change(screen.getByLabelText(/Tax amount/), { target: { value: "1.25" } });
    fireEvent.change(screen.getByLabelText(/Shipping amount/), { target: { value: "2.50" } });
    await waitFor(() => expect(screen.getByTestId("purchase-order-total").textContent).toContain("46.25"));
    expect(screen.getByRole("button", { name: /Create purchase order/i }).hasAttribute("disabled")).toBe(true);
  });

  it("validates before the verified command callback and prevents duplicate submission", async () => {
    let resolve!: () => void;
    const onSubmit = vi.fn((_draft: PurchaseOrderDraft) => new Promise<void>(done => { resolve = done; }));
    render(<MemoryRouter><PurchaseOrderCreate {...base} lookupStatus="ready" writeBlocker="" onSubmit={onSubmit} /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: /Create purchase order/i }));
    expect(await screen.findByText("Select a supplier in this organization.")).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole("combobox", { name: "Supplier" }), { target: { value: "Stone" } });
    fireEvent.click(await screen.findByRole("option", { name: "Stone Supplier" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Product" }), { target: { value: "Absolute" } });
    fireEvent.click(await screen.findByRole("option", { name: /Absolute Black Slab/ }));
    fireEvent.click(screen.getByRole("button", { name: "Add line" }));
    expect(await screen.findByText("Select an active variant of this product.")).toBeTruthy();
    fireEvent.change(screen.getByRole("combobox", { name: "Variant" }), { target: { value: "Polished" } });
    fireEvent.click(await screen.findByRole("option", { name: /Polished/ }));
    fireEvent.click(screen.getByRole("button", { name: "Add line" }));
    fireEvent.click(screen.getByRole("button", { name: /Create purchase order/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ supplier_id: "s1", currency: "INR", items: [{ product_id: "p1", product_variant_id: "v1", quantity: 1, unit_cost: 21.25 }] });
    fireEvent.click(screen.getByRole("button", { name: /Creating purchase order/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    resolve();
  });

  it("retains selected references when a paginated lookup returns a different page", async () => {
    const onSubmit = vi.fn(async (_draft: PurchaseOrderDraft) => undefined);
    const { rerender } = render(<MemoryRouter><PurchaseOrderCreate {...base} lookupStatus="ready" writeBlocker="" onSubmit={onSubmit} /></MemoryRouter>);
    fireEvent.change(screen.getByRole("combobox", { name: "Supplier" }), { target: { value: "Stone" } });
    fireEvent.click(await screen.findByRole("option", { name: "Stone Supplier" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Product" }), { target: { value: "Absolute" } });
    fireEvent.click(await screen.findByRole("option", { name: /Absolute Black Slab/ }));
    fireEvent.change(screen.getByRole("combobox", { name: "Variant" }), { target: { value: "Polished" } });
    fireEvent.click(await screen.findByRole("option", { name: /Polished/ }));
    fireEvent.click(screen.getByRole("button", { name: "Add line" }));
    rerender(<MemoryRouter><PurchaseOrderCreate {...base} suppliers={[]} products={[]} lookupStatus="ready" writeBlocker="" onSubmit={onSubmit} /></MemoryRouter>);
    expect((screen.getByRole("combobox", { name: "Supplier" }) as HTMLInputElement).value).toBe("Stone Supplier");
    fireEvent.click(screen.getByRole("button", { name: /Create purchase order/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });

  it("notifies the wrapper of product selection and resets the draft when organization scope changes", async () => {
    const onProductSelected = vi.fn();
    const onSupplierSelected = vi.fn();
    const { rerender } = render(<MemoryRouter><PurchaseOrderCreate {...base} lookupStatus="ready" scopeKey="org-1" organizationSelector={<span>Organization: Stone division</span>} onProductSelected={onProductSelected} onSupplierSelected={onSupplierSelected} /></MemoryRouter>);
    expect(screen.getByText("Organization: Stone division")).toBeTruthy();
    fireEvent.change(screen.getByRole("combobox", { name: "Supplier" }), { target: { value: "Stone" } });
    fireEvent.click(await screen.findByRole("option", { name: "Stone Supplier" }));
    expect(onSupplierSelected).toHaveBeenCalledWith("s1");
    fireEvent.change(screen.getByRole("combobox", { name: "Product" }), { target: { value: "Absolute" } });
    fireEvent.click(await screen.findByRole("option", { name: /Absolute Black Slab/ }));
    expect(onProductSelected).toHaveBeenCalledWith("p1");
    rerender(<MemoryRouter><PurchaseOrderCreate {...base} lookupStatus="ready" scopeKey="org-2" organizationSelector={<span>Organization: New division</span>} onProductSelected={onProductSelected} onSupplierSelected={onSupplierSelected} /></MemoryRouter>);
    await waitFor(() => expect((screen.getByRole("combobox", { name: "Product" }) as HTMLInputElement).value).toBe(""));
    expect(onProductSelected).toHaveBeenLastCalledWith(null);
    expect(onSupplierSelected).toHaveBeenLastCalledWith(null);
    expect(screen.getByText("Organization: New division")).toBeTruthy();
  });

  it("requires confirmation before changing supplier currency and clearing existing lines", async () => {
    const options = [...suppliers, { id: "s2", name: "Other Supplier", currency: "USD" }];
    const onSupplierSelected = vi.fn();
    render(<MemoryRouter><PurchaseOrderCreate {...base} suppliers={options} lookupStatus="ready" onSupplierSelected={onSupplierSelected} /></MemoryRouter>);
    fireEvent.change(screen.getByRole("combobox", { name: "Supplier" }), { target: { value: "Stone" } });
    fireEvent.click(await screen.findByRole("option", { name: "Stone Supplier" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Product" }), { target: { value: "Absolute" } });
    fireEvent.click(await screen.findByRole("option", { name: /Absolute Black Slab/ }));
    fireEvent.change(screen.getByRole("combobox", { name: "Variant" }), { target: { value: "Polished" } });
    fireEvent.click(await screen.findByRole("option", { name: /Polished/ }));
    fireEvent.click(screen.getByRole("button", { name: "Add line" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Supplier" }), { target: { value: "Other" } });
    fireEvent.click(await screen.findByRole("option", { name: "Other Supplier" }));
    const dialog = await screen.findByRole("dialog", { name: "Change supplier?" });
    expect((screen.getByLabelText(/Currency \*/) as HTMLInputElement).value).toBe("INR");
    expect(screen.getByRole("region", { name: "Purchase order lines", hidden: true }).textContent).toContain("Absolute Black Slab");
    expect(onSupplierSelected).toHaveBeenLastCalledWith("s1");
    fireEvent.click(within(dialog).getByRole("button", { name: "Keep supplier" }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Change supplier?" })).toBeNull());
    expect((screen.getByRole("combobox", { name: "Supplier" }) as HTMLInputElement).value).toBe("Stone Supplier");
    fireEvent.change(screen.getByRole("combobox", { name: "Supplier" }), { target: { value: "Other" } });
    fireEvent.click(await screen.findByRole("option", { name: "Other Supplier" }));
    fireEvent.click(within(await screen.findByRole("dialog", { name: "Change supplier?" })).getByRole("button", { name: "Change supplier and clear lines" }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Change supplier?" })).toBeNull());
    expect((screen.getByLabelText(/Currency \*/) as HTMLInputElement).value).toBe("USD");
    expect(screen.getByRole("region", { name: "Purchase order lines" }).textContent).toContain("No lines added");
    expect(onSupplierSelected).toHaveBeenLastCalledWith("s2");
  });

  it("prefills a late supplier quote without replacing buyer-edited pending cost or SKU", async () => {
    const initialProducts = [{ ...products[0], purchase_price: 25, supplier_costs: [] }];
    const { rerender } = render(<MemoryRouter><PurchaseOrderCreate {...base} products={initialProducts} lookupStatus="ready" /></MemoryRouter>);
    fireEvent.change(screen.getByRole("combobox", { name: "Supplier" }), { target: { value: "Stone" } });
    fireEvent.click(await screen.findByRole("option", { name: "Stone Supplier" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Product" }), { target: { value: "Absolute" } });
    fireEvent.click(await screen.findByRole("option", { name: /Absolute Black Slab/ }));
    expect((screen.getByLabelText(/Unit cost \*/) as HTMLInputElement).value).toBe("25");
    rerender(<MemoryRouter><PurchaseOrderCreate {...base} products={products} lookupStatus="ready" /></MemoryRouter>);
    expect((screen.getByLabelText(/Unit cost \*/) as HTMLInputElement).value).toBe("21.25");
    expect((screen.getByLabelText(/Supplier SKU/) as HTMLInputElement).value).toBe("HMG-ABS");
    fireEvent.change(screen.getByLabelText(/Unit cost \*/), { target: { value: "19.99" } });
    fireEvent.change(screen.getByLabelText(/Supplier SKU/), { target: { value: "BUYER-SKU" } });
    rerender(<MemoryRouter><PurchaseOrderCreate {...base} products={[{ ...products[0], supplier_costs: [{ supplier_id: "s1", cost_price: 18, supplier_sku: "UPDATED" }] }]} lookupStatus="ready" /></MemoryRouter>);
    expect((screen.getByLabelText(/Unit cost \*/) as HTMLInputElement).value).toBe("19.99");
    expect((screen.getByLabelText(/Supplier SKU/) as HTMLInputElement).value).toBe("BUYER-SKU");
  });
});
