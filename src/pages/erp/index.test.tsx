import { StyleProvider, createCache as createAntCache } from "@ant-design/cssinjs";
import { cleanup, configure, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { Refine, type DataProvider } from "@refinedev/core";
import routerProvider from "@refinedev/react-router";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { ErpModulePage } from "./index";

const harness = vi.hoisted(() => ({ command: false, writable: false, live: true, readback: [] as unknown[], actions: ["create", "update"] as Array<"create" | "update" | "delete">, resource: "products" }));
vi.mock("jsbarcode", () => ({ default: vi.fn() }));
vi.mock("./purchaseOrderWorkspace", () => ({ PurchaseOrderWorkspace: () => <div data-testid="purchase-order-create">Purchase order create form</div> }));
vi.mock("./commerceCreate", () => ({ OrderCreateWorkspace: () => <div data-testid="order-create">Order create form</div>, ReturnCreateWorkspace: () => <div data-testid="return-create">Return create form</div> }));
vi.mock("@refinedev/core", async () => ({ ...await vi.importActual("@refinedev/core"), useGetIdentity: () => ({ data: { id: "11111111-1111-4111-8111-111111111111" }, isLoading: false, isFetching: false, isError: false }) }));
configure({ asyncUtilTimeout: 5000 });
vi.setConfig({ testTimeout: 15000 });
vi.mock("../../erp/modules", () => ({
  getErpModule: (key: string) => ({ key, label: harness.resource === "products" ? "Products" : "Customers", path: "/inventory", resource: harness.resource, kind: "data", description: "Business records" }),
  ERP_MODULES: [{ key: "orders", resource: "orders", path: "/orders", label: "Orders", group: "Workspace", kind: "workflow", description: "Sales orders" }],
}));
vi.mock("../../services/erp", async importOriginal => {
  const actual = await importOriginal<typeof import("../../services/erp")>();
  return { ...actual, verifyReadback: (...args: Parameters<typeof actual.verifyReadback>) => { harness.readback = args; return actual.verifyReadback(...args); }, getErpResource: (name: string) => {
    const item = actual.getErpResource(name);
    return item ? { ...item, liveVerified: harness.live, verifiedCommand: harness.command ? "hmg-product-master-v1" : harness.writable && ["customers", "suppliers", "warehouses"].includes(name) ? "hmg-contact-master-v1" : undefined, writeAuthorizationVerified: harness.writable, verifiedWriteActions: harness.writable ? harness.actions : [] } : undefined;
  } };
});
const getList = vi.fn();
const getOne = vi.fn();
const create = vi.fn();
const update = vi.fn();
const custom = vi.fn();
const notify = vi.fn();
const can = vi.fn(async (_params: unknown) => ({ can: true }));
const provider = { getApiUrl: () => "https://example.invalid", getList, getOne, create, update } as unknown as DataProvider;
const row = { priority: 0, id: "11111111-1111-4111-8111-111111111111", organization_id: "22222222-2222-4222-8222-222222222222", name: "Granite", sku: "GR1", price: "0", min_stock: 0, type: "standard", tracking_type: "none", is_active: true, currency: "USD" };
let emotionCache: ReturnType<typeof createCache>;
function mount(action: "list" | "create" | "edit" | "show" = "list", moduleKey = "inventory") {
  const url = action === "list" ? "/inventory" : action === "create" ? "/inventory/create" : `/inventory/${action}/${row.id}`;
  return render(<StyleProvider cache={createAntCache()} autoClear><CacheProvider value={emotionCache}><MemoryRouter initialEntries={[url]}><Refine routerProvider={routerProvider} dataProvider={{ default: provider, app: { ...provider, custom } }}
    accessControlProvider={{ can }} notificationProvider={() => ({ open: notify, close: vi.fn() })}
    options={{ disableTelemetry: true }} resources={[{ name: "products", list: "/inventory", create: "/inventory/create", edit: "/inventory/edit/:id", show: "/inventory/show/:id" }]}>
    <Routes><Route path="/inventory" element={<ErpModulePage moduleKey={moduleKey} action="list" />} />
      <Route path="/inventory/create" element={<ErpModulePage moduleKey="inventory" action="create" />} />
      <Route path="/inventory/:action/:id" element={<ErpModulePage moduleKey="inventory" action={action} />} /></Routes>
  </Refine></MemoryRouter></CacheProvider></StyleProvider>);
}
describe("schema-backed ERP module pages", () => {
  beforeEach(() => {
    // Keep MUI styles test-local: accumulated global CSS made later Ant cases
    // take 26-50s in JSDOM; the same cases take 2-4s with a fresh cache.
    emotionCache = createCache({ key: "erp-test" });
    const getComputedStyle = window.getComputedStyle.bind(window);
    vi.spyOn(window, "getComputedStyle").mockImplementation(element => getComputedStyle(element));
    window.matchMedia = vi.fn().mockImplementation(() => ({ matches: false, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    for (const mock of [can, getList, getOne, create, update, custom, notify]) mock.mockReset();
    harness.command = false; harness.writable = false; harness.live = true; harness.readback = []; harness.resource = "products";
    harness.actions = ["create", "update"];
    can.mockResolvedValue({ can: true });
    getList.mockResolvedValue({ data: [row], total: 1 });
    getOne.mockResolvedValue({ data: row });
    create.mockResolvedValue({ data: row }); update.mockResolvedValue({ data: row });
  });
  afterEach(() => {
    cleanup();
    emotionCache.sheet.flush();
    expect(document.querySelectorAll('style[data-emotion^="erp-test"]').length).toBe(0);
  });
  it.each([["stock-by-warehouse", "product_location_stocks", "Stock by warehouse"], ["reservations", "stock_reservations", "Reservations"], ["replenishment", "warehouse_reorder_points", "Replenishment"]])("renders %s from the live ledger, never the legacy %s table", async (moduleKey, resource, title) => {
    harness.resource = resource;
    getList.mockResolvedValue({ data: [], total: 0 });
    mount("list", moduleKey);
    expect(await screen.findByRole("heading", { name: title })).toBeTruthy();
    expect(getList.mock.calls.some(([args]) => args.resource === resource)).toBe(false);
  });
  it("does not query hidden relation panels and exposes relations after the original first eight", async () => {
    mount("show");
    await screen.findByRole("heading", { name: "Granite" });
    expect(getList.mock.calls.every(([args]) => args.resource === "organizations")).toBe(true);
    expect(screen.queryByRole("tablist")).toBeNull();
    expect(getOne).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/^Product variants \(/i)).toBeNull();
    // The lazy stock panel selects its ledger/native authority when expanded.
    expect(screen.getByText(/^Stock by location \(/i)).toBeTruthy();
    expect(screen.getByText(/^Suppliers \(/i)).toBeTruthy();
    const more = screen.getByRole("button", { name: "More related data" });
    expect(more.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(more);
    expect(getList.mock.calls.every(([args]) => args.resource === "organizations")).toBe(true);
    const variants = screen.getByText(/^Product variants \(/i).closest("button")!;
    expect(variants.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(variants);
    await waitFor(() => expect(getList).toHaveBeenCalledWith(expect.objectContaining({ resource: "product_variants", filters: expect.arrayContaining([{ field: "product_id", operator: "eq", value: row.id }]) })));
    expect(getList.mock.calls.every(([args]) => ["organizations", "product_variants"].includes(args.resource))).toBe(true);
    fireEvent.click(variants);
    expect(screen.queryByLabelText(/Search product variants/i)).toBeNull();
  });
  it("groups a generic customer record without raw-field cards or horizontal tabs", async () => {
    harness.resource = "customers";
    getOne.mockResolvedValue({ data: { ...row, company_name: "Stone Works", billing_city: "Bengaluru", credit_limit: "1250", currency: "INR" } });
    mount("show");
    expect(await screen.findByRole("heading", { name: "Granite" })).toBeTruthy();
    expect(screen.queryByRole("tablist")).toBeNull();
    expect(screen.getByText("Stone Works")).toBeTruthy();
    expect(getOne).toHaveBeenCalledTimes(1);
    expect(create).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });
  it("resolves displayed business references with bounded ID filters, never identity datatables", async () => {
    const locationId = "33333333-3333-4333-8333-333333333333";
    getOne.mockResolvedValue({ data: { ...row, location_id: locationId, created_by: row.id } });
    getList.mockImplementation(async ({ resource }) => ({ data: resource === "product_locations" ? [{ id: locationId, name: "Stone Yard" }] : [], total: resource === "product_locations" ? 1 : 0 }));
    mount("show");
    await screen.findByRole("heading", { name: "Granite" });
    await waitFor(() => expect(getList).toHaveBeenCalledWith(expect.objectContaining({ resource: "product_locations", filters: [{ field: "id", operator: "in", value: [locationId] }] })));
    expect(getList.mock.calls.some(([args]) => args.resource === "auth_user")).toBe(false);
    expect(getOne).toHaveBeenCalledTimes(1);
  });
  it("links registered related records to their real module instead of the parent route", async () => {
    harness.resource = "customers";
    getOne.mockResolvedValue({ data: { ...row, name: "Buyer" } });
    getList.mockResolvedValue({ data: [{ id: "order-1", order_number: "SO-001", customer_id: row.id, status: "pending", total: 10, currency: "INR" }], total: 1 });
    mount("show");
    await screen.findByRole("heading", { name: "Buyer" });
    fireEvent.click(screen.getByRole("button", { name: /^Orders / }));
    const link = await screen.findByRole("link", { name: "SO-001" });
    expect(link.getAttribute("href")).toBe("/orders/show/order-1");
    expect(screen.getByRole("link", { name: "View SO-001" }).getAttribute("href")).toBe("/orders/show/order-1");
  });
  it("uses configured multi-field customer search on the server", async () => {
    harness.resource = "customers";
    mount();
    await screen.findByText("Granite", { selector: "a" });
    fireEvent.change(screen.getByRole("textbox", { name: /Search customers/i }), { target: { value: "stone" } });
    await waitFor(() => expect(getList).toHaveBeenLastCalledWith(expect.objectContaining({
      resource: "customers", filters: expect.arrayContaining([expect.objectContaining({ operator: "or", value: expect.arrayContaining([{ field: "name", operator: "contains", value: "stone" }, { field: "email", operator: "contains", value: "stone" }]) })])
    })));
  });


  // Retain the existing dispatcher-only upper bound; cache isolation above
  // removes cross-test CSS growth. Provider assertions keep the 5s waitFor bound.
  it("renders live rows and sends search/filter/pagination to the provider", async () => {
    mount();
    expect(await screen.findByText("Granite", { selector: "a" })).toBeTruthy();
    fireEvent.change(screen.getByLabelText(/Search products/i), { target: { value: "quartz" } });
    await waitFor(() => expect(getList).toHaveBeenLastCalledWith(expect.objectContaining({ resource: "products", filters: expect.arrayContaining([{ operator: "or", value: ["name", "sku", "barcode"].map(field => ({ field, operator: "contains", value: "quartz" })) }]), pagination: expect.objectContaining({ pageSize: 10 }) })));
  }, 30000);
  it("shows a retryable error, never a false empty success", async () => {
    getList.mockRejectedValue({ message: "Forbidden", statusCode: 403 }); mount();
    expect(await screen.findByText("Unable to load products")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
  });
  it("does not query schema-only resources before live verification", () => {
    harness.live = false; mount();
    expect(screen.getByText(/live schema.*verified/i)).toBeTruthy();
    expect(getList).not.toHaveBeenCalled();
  });
  it("routes purchase-order creation to its header-and-lines form and exposes list navigation", async () => {
    harness.resource = "purchase_orders";
    mount("create");
    expect(screen.getByTestId("purchase-order-create")).toBeTruthy();
    cleanup();
    mount("list");
    expect(await screen.findByRole("link", { name: /Create purchase order/i })).toBeTruthy();
  });
  it("exposes create actions for inventory, orders, and returns", async () => {
    harness.resource = "products";
    mount("list");
    expect(await screen.findByRole("link", { name: /Add product/i })).toBeTruthy();
    cleanup(); emotionCache.sheet.flush(); emotionCache = createCache({ key: "erp-test" });
    harness.resource = "orders";
    mount("list");
    expect(await screen.findByRole("link", { name: /Create order/i })).toBeTruthy();
    cleanup(); emotionCache.sheet.flush(); emotionCache = createCache({ key: "erp-test" });
    harness.resource = "return_orders";
    mount("list");
    expect(await screen.findByRole("link", { name: /Create return/i })).toBeTruthy();
  });
  it("routes direct order and return create URLs to their dedicated forms", () => {
    harness.resource = "orders"; mount("create");
    expect(screen.getByTestId("order-create")).toBeTruthy();
    cleanup(); emotionCache.sheet.flush(); emotionCache = createCache({ key: "erp-test" });
    harness.resource = "return_orders"; mount("create");
    expect(screen.getByTestId("return-create")).toBeTruthy();
  });
  it("keeps unverified backend writes blocked even for an allowed UI permission", async () => {
    mount("create");
    expect(await screen.findByText(/Server authorization.*not yet verified/i)).toBeTruthy();
    expect(create).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Save record" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("textbox", { name: /SKU/i }).hasAttribute("disabled")).toBe(false);
    expect(screen.getByRole("heading", { name: "Basic information" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Pricing" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Replenishment and classification" })).toBeTruthy();
    expect(screen.getByRole("spinbutton", { name: "Selling price" })).toBeTruthy();
    expect(screen.getByRole("spinbutton", { name: "Minimum stock level" })).toBeTruthy();
    expect((screen.getByRole("spinbutton", { name: "Selling price" }) as HTMLInputElement).value).toBe("");
    expect((screen.getByRole("spinbutton", { name: "Minimum stock level" }) as HTMLInputElement).value).toBe("");
    expect(screen.getByRole("combobox", { name: "Product type" })).toBeTruthy();
    expect(screen.getByRole("combobox", { name: "Inventory tracking" })).toBeTruthy();
    expect(screen.getByRole("combobox", { name: "Barcode type" })).toBeTruthy();
    expect(screen.queryByRole("checkbox", { name: /^Active/i })).toBeNull();
    expect(screen.queryByRole("spinbutton", { name: "Stock" })).toBeNull();
    expect(screen.getAllByRole("spinbutton", { name: /Selling price/i })).toHaveLength(1);
    expect(screen.getByText(/Opening stock, variants and suppliers require a verified server workflow/i)).toBeTruthy();
  });
  it("renders typed master fields, excludes stock and locks organization on edit", async () => {
    harness.writable = true; mount("edit");
    expect(await screen.findByDisplayValue("Granite")).toBeTruthy();
    expect(screen.getByRole("textbox", { name: /SKU/i })).toBeTruthy();
    expect(screen.queryByRole("spinbutton", { name: /^Stock/i })).toBeNull();
    expect(screen.queryByRole("combobox", { name: /^Organization/i })).toBeNull();
    expect(screen.queryByRole("combobox", { name: /^Currency/i })).toBeNull();
    expect(screen.queryByRole("checkbox", { name: /^Active/i })).toBeNull();
    expect(screen.getByRole("button", { name: "Save record" }).hasAttribute("disabled")).toBe(true);
  });
  it("blocks direct edit routes when only create has been verified", async () => {
    harness.resource = "customers"; harness.writable = true; harness.actions = ["create"]; mount("edit");
    expect(await screen.findByText(/update operation has not been verified/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Save record" }).hasAttribute("disabled")).toBe(true);
    expect(update).not.toHaveBeenCalled();
  });
  it("does not notify success until fresh readback matches the submitted fields", async () => {
    harness.resource = "warehouses"; harness.writable = true; custom.mockResolvedValue({ data: { ok: true, verified: true, record: row } }); mount("edit");
    fireEvent.change(await screen.findByDisplayValue("Granite"), { target: { value: "Quartz" } });
    fireEvent.click(screen.getByRole("button", { name: "Save record" }));
    await screen.findByText(/Save could not be confirmed/i);
    expect(custom).toHaveBeenCalledTimes(1); expect(update).not.toHaveBeenCalled();
    expect(custom.mock.calls[0][0].payload).toMatchObject({ resource: "warehouses", action: "update", request_id: row.id, organization_id: row.organization_id, values: { name: "Quartz" } });
    expect(can).toHaveBeenCalledWith(expect.objectContaining({ resource: "function:hmg-contact-master-v1", action: "execute", params: expect.objectContaining({ metadata_resource: "warehouses", action: "update", id: row.id, organization_id: row.organization_id, name: "Quartz" }) }));
    expect(notify.mock.calls.some(call => call[0].type === "success")).toBe(false);
    expect(screen.getByRole("button", { name: "Check saved record" })).toBeTruthy();
  });

  it("resets page one and clears stale row counts when search returns zero", async () => {
    getList.mockResolvedValue({ data: [row], total: 25 }); mount();
    await screen.findByText("Granite", { selector: "a" });
    fireEvent.click(screen.getByRole("button", { name: "Go to next page" }));
    await waitFor(() => expect(getList).toHaveBeenLastCalledWith(expect.objectContaining({ pagination: expect.objectContaining({ currentPage: 2 }) })));
    getList.mockResolvedValue({ data: [], total: 0 });
    fireEvent.change(screen.getByLabelText(/Search products/i), { target: { value: "not found" } });
    await waitFor(() => expect(getList).toHaveBeenLastCalledWith(expect.objectContaining({ pagination: expect.objectContaining({ currentPage: 1 }), filters: expect.arrayContaining([{ operator: "or", value: ["name", "sku", "barcode"].map(field => ({ field, operator: "contains", value: "not found" })) }]) })));
    // Ant Table intentionally omits pagination when total is zero.
    expect(await screen.findByText("No results found")).toBeTruthy();
    expect(screen.queryByText("25 products")).toBeNull();
  }, 30000);
  it("reports success only after a matching fresh readback", async () => {
    harness.resource = "warehouses"; harness.writable = true;
    custom.mockImplementation(async ({ payload }) => ({ data: { ok: true, verified: true, record: { ...row, ...payload.values } } }));
    mount("edit");
    fireEvent.change(await screen.findByDisplayValue("Granite"), { target: { value: "Quartz" } });
    fireEvent.click(screen.getByRole("button", { name: "Save record" }));
    await waitFor(() => expect(custom).toHaveBeenCalledTimes(1));
    expect(custom.mock.calls[0][0]).toMatchObject({ url: "hmg-contact-master-v1", payload: { resource: "warehouses", action: "update", request_id: row.id, organization_id: row.organization_id, values: { name: "Quartz" } } });
    expect(harness.readback[3]).toMatchObject(harness.readback[2] as Record<string, unknown>);
    await waitFor(() => expect(notify).toHaveBeenCalledWith(expect.objectContaining({ type: "success", message: "Record saved" })));
    expect(update).not.toHaveBeenCalled(); expect(create).not.toHaveBeenCalled();
  });
  it("saves products through the private command, not generic table writes", async () => {
    harness.command = true; harness.writable = true;
    custom.mockImplementation(async ({ payload }) => ({ data: { ok: true, verified: true, record: { ...row, ...payload.values, selling_price: payload.values.price } } }));
    mount("edit");
    fireEvent.change(await screen.findByDisplayValue("Granite"), { target: { value: "Quartz" } });
    expect(screen.queryByRole("combobox", { name: "Product type" })).toBeNull();
    expect(screen.queryByRole("combobox", { name: "Inventory tracking" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Save record" }));
    await waitFor(() => expect(custom).toHaveBeenCalledTimes(1));
    expect(custom.mock.calls[0][0]).toMatchObject({ url: "hmg-product-master-v1", payload: { action: "update", organization_id: row.organization_id, request_id: row.id, values: { name: "Quartz" } } });
    expect(custom.mock.calls[0][0].payload.values).not.toHaveProperty("organization_id");
    expect(custom.mock.calls[0][0].payload.values).not.toHaveProperty("tracking_type");
    await waitFor(() => expect(notify).toHaveBeenCalledWith(expect.objectContaining({ type: "success", message: "Record saved" })));
    expect(create).not.toHaveBeenCalled(); expect(update).not.toHaveBeenCalled();
  });
  it("recovers an ambiguous product save with readback and no repeated write", async () => {
    harness.command = true; harness.writable = true;
    custom.mockRejectedValue(new Error("timeout")); mount("edit");
    fireEvent.change(await screen.findByDisplayValue("Granite"), { target: { value: "Quartz" } });
    fireEvent.click(screen.getByRole("button", { name: "Save record" }));
    fireEvent.click(await screen.findByRole("button", { name: "Check saved record" }));
    await waitFor(() => expect(custom).toHaveBeenCalledTimes(2));
    expect(custom.mock.calls[1][0].payload).toEqual({ action: "readback", request_id: row.id, organization_id: row.organization_id });
    expect(notify.mock.calls.some(call => call[0].type === "success")).toBe(false);
  });
  it("requires confirmation and fresh permission before logical product deletion", async () => {
    harness.command = true; harness.writable = true; harness.actions = ["delete"];
    custom.mockResolvedValue({ data: { ok: true, verified: true, deleted: true, id: row.id } });
    mount("show");
    fireEvent.click(await screen.findByRole("button", { name: "Delete product" }));
    const dialog = within(screen.getByRole("dialog"));
    expect(custom).not.toHaveBeenCalled();
    can.mockResolvedValue({ can: false });
    fireEvent.click(dialog.getByRole("button", { name: "Delete product" }));
    expect(await dialog.findByText(/No write was sent/)).toBeTruthy();
    expect(custom).not.toHaveBeenCalled();
  });
  it("checks ambiguous deletion through an authorized fresh table read, never a second command", async () => {
    harness.command = true; harness.writable = true; harness.actions = ["delete"];
    custom.mockRejectedValue(new Error("timeout")); mount("show");
    fireEvent.click(await screen.findByRole("button", { name: "Delete product" }));
    const dialog = within(screen.getByRole("dialog"));
    fireEvent.click(dialog.getByRole("button", { name: "Delete product" }));
    const check = await dialog.findByRole("button", { name: "Check saved record" });
    getOne.mockResolvedValue({ data: { ...row, is_active: false, deleted_at: "2026-11-09T00:00:00Z" } });
    fireEvent.click(check);
    await waitFor(() => expect(notify).toHaveBeenCalledWith(expect.objectContaining({ type: "success", message: "Product removed" })));
    expect(can).toHaveBeenCalledWith(expect.objectContaining({ resource: "datatable:products", action: "read", params: row }));
    expect(custom).toHaveBeenCalledTimes(1);
    expect(custom.mock.calls[0][0].payload.action).toBe("delete");
    expect(getOne).toHaveBeenCalledWith(expect.objectContaining({ resource: "products", id: row.id }));
  });
  it.each(["denied", "missing", "other-organization", "other-id", "active", "invalid-date"])("does not infer ambiguous deletion from %s", async failure => {
    harness.command = true; harness.writable = true; harness.actions = ["delete"];
    custom.mockRejectedValue(new Error("timeout")); mount("show");
    fireEvent.click(await screen.findByRole("button", { name: "Delete product" }));
    const dialog = within(screen.getByRole("dialog"));
    fireEvent.click(dialog.getByRole("button", { name: "Delete product" }));
    const check = await dialog.findByRole("button", { name: "Check saved record" });
    const callsBefore = getOne.mock.calls.length;
    if (failure === "denied") can.mockImplementation(async (params: any) => ({ can: params.action !== "read" }));
    else if (failure === "missing") getOne.mockRejectedValue({ statusCode: 404 });
    else getOne.mockResolvedValue({ data: { ...row, is_active: failure === "active", deleted_at: failure === "invalid-date" ? "bad-date" : "2026-11-09T00:00:00Z",
      ...(failure === "other-organization" ? { organization_id: "other" } : {}), ...(failure === "other-id" ? { id: "other" } : {}) } });
    fireEvent.click(check);
    await waitFor(() => expect(can).toHaveBeenCalledWith(expect.objectContaining({ action: "read" })));
    await waitFor(() => expect(dialog.getByRole("button", { name: "Check saved record" }).hasAttribute("disabled")).toBe(false));
    expect(custom).toHaveBeenCalledTimes(1);
    expect(notify.mock.calls.some(call => call[0].type === "success")).toBe(false);
    if (failure === "denied") expect(getOne).toHaveBeenCalledTimes(callsBefore);
  });
  it.each(["customers", "suppliers"])("deletes %s through the private command after fresh permission", async name => {
    harness.resource = name; harness.writable = true; harness.actions = ["delete"];
    custom.mockResolvedValue({ data: { ok: true, verified: true, deleted: true, id: row.id } });
    mount("show");
    const label = `Delete ${name === "customers" ? "customer" : "supplier"}`;
    fireEvent.click(await screen.findByRole("button", { name: label }));
    expect(custom).not.toHaveBeenCalled();
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: label }));
    await waitFor(() => expect(notify).toHaveBeenCalledWith(expect.objectContaining({ type: "success", message: name === "customers" ? "Customer removed" : "Supplier removed" })));
    expect(custom).toHaveBeenCalledTimes(1);
    expect(custom.mock.calls[0][0]).toMatchObject({ url: "hmg-contact-master-v1", payload: { resource: name, action: "delete", request_id: row.id, organization_id: row.organization_id } });
    expect(can).toHaveBeenCalledWith(expect.objectContaining({ resource: `datatable:${name}`, action: "delete", params: row }));
    expect(update).not.toHaveBeenCalled();
  });
  it("denies contact deletion without fresh permission", async () => {
    harness.resource = "customers"; harness.writable = true; harness.actions = ["delete"];
    mount("show");
    fireEvent.click(await screen.findByRole("button", { name: "Delete customer" }));
    can.mockResolvedValue({ can: false });
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Delete customer" }));
    expect(await screen.findByText(/No write was sent/)).toBeTruthy();
    expect(update).not.toHaveBeenCalled();
    expect(custom).not.toHaveBeenCalled();
  });
  it("keeps failed contact deletion uncertain and recovers read-only", async () => {
    harness.resource = "customers"; harness.writable = true; harness.actions = ["delete"];
    custom.mockRejectedValue(new Error("timeout")); mount("show");
    fireEvent.click(await screen.findByRole("button", { name: "Delete customer" }));
    const dialog = within(screen.getByRole("dialog"));
    fireEvent.click(dialog.getByRole("button", { name: "Delete customer" }));
    const check = await dialog.findByRole("button", { name: "Check saved record" });
    expect(notify.mock.calls.some(call => call[0].type === "success")).toBe(false);
    getOne.mockResolvedValue({ data: { ...row, deleted_at: "2026-11-09T00:00:00Z", is_active: false } });
    fireEvent.click(check);
    await waitFor(() => expect(notify).toHaveBeenCalledWith(expect.objectContaining({ type: "success", message: "Customer removed" })));
    expect(custom).toHaveBeenCalledTimes(1); expect(update).not.toHaveBeenCalled();
  });
  it.each([["products", "VALIDATION_ERROR"], ["customers", "VALIDATION_ERROR"], ["suppliers", "VALIDATION_ERROR"], ["customers", "DUPLICATE_CODE"], ["suppliers", "DUPLICATE_CODE"], ["customers", "VALIDATION_UNAVAILABLE"]])("allows correcting a definite %s command rejection %s", async (name, code) => {
    harness.resource = name; harness.writable = true; harness.command = name === "products";
    custom.mockResolvedValueOnce({ data: { ok: false, code } });
    custom.mockImplementation(async ({ payload }) => ({ data: { ok: true, verified: true, record: { ...row, ...payload.values, selling_price: payload.values.price } } }));
    mount("edit");
    fireEvent.change(await screen.findByDisplayValue("Granite"), { target: { value: "Rejected draft" } });
    fireEvent.click(screen.getByRole("button", { name: "Save record" }));
    expect(await screen.findByText(code === "DUPLICATE_CODE" ? /code is already used/i : code === "VALIDATION_UNAVAILABLE" ? /Validation is temporarily unavailable/i : /server rejected this request without saving/i)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Check saved record" })).toBeNull();
    const field = screen.getByDisplayValue("Rejected draft");
    expect(field.hasAttribute("disabled")).toBe(false);
    fireEvent.change(field, { target: { value: "Corrected draft" } });
    fireEvent.click(screen.getByRole("button", { name: "Save record" }));
    await waitFor(() => expect(notify).toHaveBeenCalledWith(expect.objectContaining({ type: "success", message: "Record saved" })));
    expect(custom).toHaveBeenCalledTimes(2);
    expect(custom.mock.calls[1][0]).toMatchObject({ url: name === "products" ? "hmg-product-master-v1" : "hmg-contact-master-v1", payload: { action: "update", request_id: row.id, organization_id: row.organization_id, values: { name: "Corrected draft" }, ...(name === "products" ? {} : { resource: name }) } });
    expect(create).not.toHaveBeenCalled(); expect(update).not.toHaveBeenCalled();
  });
  it.each(["products", "customers", "suppliers"])("keeps unknown %s command outcomes uncertain with readback only", async name => {
    harness.resource = name; harness.writable = true; harness.command = name === "products";
    custom.mockResolvedValue({ data: { ok: false, code: "WRITE_UNCONFIRMED" } }); mount("edit");
    fireEvent.change(await screen.findByDisplayValue("Granite"), { target: { value: "Uncertain draft" } });
    fireEvent.click(screen.getByRole("button", { name: "Save record" }));
    fireEvent.click(await screen.findByRole("button", { name: "Check saved record" }));
    await waitFor(() => expect(custom).toHaveBeenCalledTimes(2));
    expect(custom.mock.calls[1][0].payload).toEqual({ action: "readback", request_id: row.id, organization_id: row.organization_id, ...(name === "products" ? {} : { resource: name }) });
    expect(notify.mock.calls.some(call => call[0].type === "success")).toBe(false);
    expect(create).not.toHaveBeenCalled(); expect(update).not.toHaveBeenCalled();
  });
  it.each(["customers", "suppliers"])("shows %s tombstones instead of editable forms", async name => {
    harness.resource = name; harness.writable = true;
    getOne.mockResolvedValue({ data: { ...row, deleted_at: "2026-11-09T00:00:00Z", is_active: false } });
    mount("edit");
    expect(await screen.findByRole("heading", { name: "Granite - Removed" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Save record" })).toBeNull();
  });
  it("shows product tombstones instead of editable forms", async () => {
    harness.command = true; harness.writable = true;
    getOne.mockResolvedValue({ data: { ...row, deleted_at: "2026-11-09T00:00:00Z", is_active: false } });
    mount("edit");
    expect(await screen.findByRole("heading", { name: "Granite - Removed" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Save record" })).toBeNull();
  });
  it("checks full proposed permissions before writing and denies without a mutation", async () => {
    harness.resource = "warehouses"; harness.writable = true; can.mockResolvedValue({ can: false }); mount("edit");
    fireEvent.change(await screen.findByDisplayValue("Granite"), { target: { value: "Quartz" } });
    fireEvent.click(screen.getByRole("button", { name: "Save record" }));
    expect(await screen.findByText(/No write was sent/)).toBeTruthy();
    expect(update).not.toHaveBeenCalled();
    expect(custom).not.toHaveBeenCalled(); expect(create).not.toHaveBeenCalled();
    expect(can).toHaveBeenCalledWith(expect.objectContaining({ resource: "function:hmg-contact-master-v1", action: "execute", params: expect.objectContaining({ metadata_resource: "warehouses", action: "update", id: row.id, organization_id: row.organization_id, name: "Quartz" }) }));
    expect(screen.queryByRole("button", { name: "Check saved record" })).toBeNull();
  });
});
