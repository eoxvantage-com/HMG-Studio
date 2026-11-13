import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OrderCreateWorkspace, ReturnCreateWorkspace } from "./commerceCreate";

const fixture = vi.hoisted(() => ({ owner: "11111111-1111-4111-8111-111111111111", organizationId: "22222222-2222-4222-8222-222222222222", resources: [] as string[], enabled: false, execute: vi.fn(), createCustomer: vi.fn(), warn: false }));
vi.mock("../../hooks/useCommerceLedger", () => ({ useCommerceLedger: () => ({ owner: fixture.owner, enabled: fixture.enabled, locked: !fixture.enabled, state: fixture.enabled ? { documents: {}, entitlements: {}, requests: {}, balances: [] } : null, pending: null, busy: false, message: "", refresh: vi.fn(), execute: fixture.execute }) }));
vi.mock("@refinedev/core", () => ({
  useWarnAboutChange: () => ({ warnWhen: fixture.warn, setWarnWhen: (value: boolean) => { fixture.warn = value; } }),
  useGetIdentity: () => ({ data: { id: fixture.owner }, isLoading: false, isFetching: false, isError: false }),
  useCustomMutation: () => ({ mutateAsync: fixture.createCustomer, mutation: { isPending: false } }),
  useNotification: () => ({ open: vi.fn() }),
  useList: (args: Record<string, unknown>) => {
    const resource = String(args.resource); fixture.resources.push(resource);
    const values: Record<string, Array<Record<string, unknown>>> = {
      organizations: [{ id: fixture.organizationId, name: "HMG Stones", currency: "INR", settings: { stock_authority: "ledger_v2" } }],
      customers: [{ id: "33333333-3333-4333-8333-333333333333", organization_id: fixture.organizationId, name: "Project Buyer", email: "buyer@example.invalid", shipping_address: "Site 7, Hennur Road", shipping_city: "Bengaluru", shipping_zip_code: "560043", currency: "INR", is_active: true }],
      products: [{ id: "44444444-4444-4444-8444-444444444444", organization_id: fixture.organizationId, name: "Absolute Black Slab", sku: "ABS-01", selling_price: 6800, type:"standard", tracking_type:"none", currency: "INR", is_active: true }],
      product_variants: [], orders: [], order_items: [], return_orders: [], return_order_items: [],
    };
    const rows = values[resource] ?? [];
    return { result: { data: rows, total: rows.length }, query: { isLoading: false, isFetching: false, isError: false, refetch: vi.fn() } };
  },
}));
afterEach(() => { cleanup(); fixture.resources = []; fixture.enabled = false; fixture.warn = false; fixture.execute.mockReset(); fixture.createCustomer.mockReset(); });

describe("commerce create forms", () => {
  it("reviews and submits an enabled sales order as one immutable command", async () => {
    fixture.enabled = true; fixture.execute.mockResolvedValue(null);
    render(<MemoryRouter><OrderCreateWorkspace /></MemoryRouter>);
    const name = await screen.findByRole("textbox", { name: /Customer name/ });
    fireEvent.change(name, { target: { value: "Walk-in buyer" } });
    fireEvent.mouseDown(screen.getByRole("combobox", { name: "Product" }));
    fireEvent.click(await screen.findByRole("option", { name: /Absolute Black Slab \(ABS-01\)/ }));
    fireEvent.click(screen.getByRole("button", { name: "Add line" }));
    fireEvent.click(screen.getByRole("button", { name: "Create Order" }));
    expect(fixture.execute).not.toHaveBeenCalled();
    fireEvent.click(await screen.findByRole("button", { name: "Confirm create order" }));
    await waitFor(() => expect(fixture.execute).toHaveBeenCalledTimes(1));
    expect(fixture.execute.mock.calls[0][0]).toMatchObject({ action: "create_order", document: { customer_name: "Walk-in buyer", tax: "0.00", shipping: "0.00", items: [{ product_id: "44444444-4444-4444-8444-444444444444", product_variant_id: null, unit_price: "6800.00", quantity: 1 }] } });
  });
  it("edits line quantities in place and applies 18% GST to the subtotal", async () => {
    fixture.enabled = true; fixture.execute.mockResolvedValue(null);
    render(<MemoryRouter><OrderCreateWorkspace /></MemoryRouter>);
    fireEvent.change(await screen.findByRole("textbox", { name: /Customer name/ }), { target: { value: "Site buyer" } });
    fireEvent.mouseDown(screen.getByRole("combobox", { name: "Product" }));
    fireEvent.click(await screen.findByRole("option", { name: /Absolute Black Slab \(ABS-01\)/ }));
    fireEvent.click(screen.getByRole("button", { name: "Add line" }));
    fireEvent.change(screen.getByRole("spinbutton", { name: "Quantity for Absolute Black Slab" }), { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply 18% GST" }));
    expect((screen.getByRole("spinbutton", { name: /Tax amount/ }) as HTMLInputElement).value).toBe("3672.00");
    fireEvent.click(screen.getByRole("button", { name: "Create Order" }));
    fireEvent.click(await screen.findByRole("button", { name: "Confirm create order" }));
    await waitFor(() => expect(fixture.execute).toHaveBeenCalledTimes(1));
    expect(fixture.execute.mock.calls[0][0]).toMatchObject({ document: { tax: "3672.00", items: [{ quantity: 3, unit_price: "6800.00" }] } });
  });
  it("prefills customer details from a saved customer", async () => {
    fixture.enabled = true;
    render(<MemoryRouter><OrderCreateWorkspace /></MemoryRouter>);
    fireEvent.mouseDown(await screen.findByRole("combobox", { name: "Customer" }));
    fireEvent.click(await screen.findByRole("option", { name: /Project Buyer/ }));
    expect((screen.getByRole("textbox", { name: /Customer name/ }) as HTMLInputElement).value).toBe("Project Buyer");
    expect((screen.getByRole("textbox", { name: /Customer email/ }) as HTMLInputElement).value).toBe("buyer@example.invalid");
    expect((screen.getByRole("textbox", { name: /Shipping address/ }) as HTMLInputElement).value).toBe("Site 7, Hennur Road, Bengaluru, 560043");
  });
  it("adds a new customer through the contact command and selects it", async () => {
    fixture.enabled = true;
    fixture.createCustomer.mockResolvedValue({ data: { ok: true, verified: true, record: { id: "55555555-5555-4555-8555-555555555555", organization_id: fixture.organizationId, name: "New Villa Client", email: "villa@example.invalid", billing_address: "No. 3, Sankey Road", billing_city: "Bengaluru", currency: "INR", is_active: true } } });
    render(<MemoryRouter><OrderCreateWorkspace /></MemoryRouter>);
    fireEvent.click(await screen.findByRole("button", { name: "Add new customer" }));
    fireEvent.change(await screen.findByRole("textbox", { name: /^Customer name/ , hidden: false }), { target: { value: "New Villa Client" } });
    fireEvent.click(screen.getByRole("button", { name: "Save customer" }));
    await waitFor(() => expect(fixture.createCustomer).toHaveBeenCalledTimes(1));
    expect(fixture.createCustomer.mock.calls[0][0]).toMatchObject({ url: "hmg-contact-master-v1", values: { resource: "customers", action: "create", organization_id: fixture.organizationId, values: { name: "New Villa Client", currency: "INR", is_active: true } } });
    await waitFor(() => expect((screen.getByRole("textbox", { name: /Customer email/ }) as HTMLInputElement).value).toBe("villa@example.invalid"));
    expect((screen.getByRole("textbox", { name: /Shipping address/ }) as HTMLInputElement).value).toBe("No. 3, Sankey Road, Bengaluru");
  });
  it("renders a real-data order form and never enables an unverified save", async () => {
    render(<MemoryRouter><OrderCreateWorkspace /></MemoryRouter>);
    expect(await screen.findByRole("heading", { name: "Create Order" })).toBeTruthy();
    await waitFor(() => expect(screen.getByRole("combobox", { name: /Organization/ })).toBeTruthy());
    expect(screen.getByRole("textbox", { name: /Customer name/ })).toBeTruthy();
    expect(document.querySelector('input[type="date"]')).toBeTruthy();
    expect(screen.getByRole("button", { name: "Create Order" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByText(/No order or stock write has been sent/i)).toBeTruthy();
  });
  it("uses the ledger, not legacy order rows, for return eligibility", () => {
    render(<MemoryRouter><ReturnCreateWorkspace /></MemoryRouter>);
    expect(fixture.resources).not.toContain("order_items");
    expect(fixture.resources).not.toContain("return_order_items");
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
