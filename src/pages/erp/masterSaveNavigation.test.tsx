import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { Refine, type DataProvider } from "@refinedev/core";
import routerProvider from "@refinedev/react-router";
import { Link, MemoryRouter, Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UnsavedChangesDialog } from "../../components/UnsavedChangesDialog";
import { ErpModulePage } from "./index";

vi.mock("jsbarcode", () => ({ default: vi.fn() }));
vi.mock("../../services/productMedia", async importOriginal => {
  const actual = await importOriginal<typeof import("../../services/productMedia")>();
  return { ...actual, prepareProductImage: async (file: File) => ({ file, sha256: "a".repeat(64), upload: { content_type: "image/png", content_base64: "cG5n" } }) };
});
vi.mock("../../services/erp", async importOriginal => {
  const actual = await importOriginal<typeof import("../../services/erp")>();
  return { ...actual, initialValues: (fields: Parameters<typeof actual.initialValues>[0], record?: Record<string, unknown>) => actual.initialValues(fields, record ?? row), getErpResource: (name: string) => {
    const resource = actual.getErpResource(name);
    return resource ? { ...resource, liveVerified: true, verifiedCommand: "hmg-product-master-v1", writeAuthorizationVerified: true, verifiedWriteActions: ["create", "update"] } : undefined;
  } };
});

const row = { id: "11111111-1111-4111-8111-111111111111", organization_id: "22222222-2222-4222-8222-222222222222", name: "Granite", sku: "GR1", price: "0", min_stock: 0, type: "standard", tracking_type: "none", is_active: true, currency: "USD" };
const custom = vi.fn();
const notify = vi.fn();
const provider = {
  getApiUrl: () => "https://example.invalid", getList: vi.fn(async () => ({ data: [], total: 0 })),
  getMany: vi.fn(async () => ({ data: [{ id: row.organization_id, name: "HMG Studio" }] })),
  getOne: vi.fn(async () => ({ data: row })), create: vi.fn(), update: vi.fn(), deleteOne: vi.fn(), custom,
} as unknown as DataProvider;
let cache: ReturnType<typeof createCache>;
function mount(action: "create" | "edit" = "edit") {
  render(<CacheProvider value={cache}><MemoryRouter initialEntries={[action === "create" ? "/inventory/create" : `/inventory/edit/${row.id}`]}>
    <Refine routerProvider={routerProvider} dataProvider={{ default: provider, app: provider }}
      accessControlProvider={{ can: async () => ({ can: true }) }}
      notificationProvider={() => ({ open: notify, close: vi.fn() })}
      options={{ disableTelemetry: true, warnWhenUnsavedChanges: true }}
      resources={[{ name: "products", list: "/inventory", create: "/inventory/create", edit: "/inventory/edit/:id", show: "/inventory/show/:id" }]}>
      <Link to="/other">Other page</Link>
      <Routes>
        <Route path="/inventory" element={<h1>Product list</h1>} />
        <Route path="/inventory/create" element={<ErpModulePage moduleKey="inventory" action="create" />} />
        <Route path="/inventory/edit/:id" element={<ErpModulePage moduleKey="inventory" action="edit" />} />
        <Route path="/inventory/show/:id" element={<h1>Saved product details</h1>} />
        <Route path="/other" element={<h1>Other page content</h1>} />
      </Routes>
      <UnsavedChangesDialog />
    </Refine>
  </MemoryRouter></CacheProvider>);
}

describe("verified master save navigation with the real unsaved-changes guard", () => {
  beforeEach(() => {
    cache = createCache({ key: "save-guard-test" });
    window.matchMedia = vi.fn().mockImplementation(() => ({ matches: false, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    custom.mockReset(); notify.mockReset();
    URL.createObjectURL = vi.fn(() => "blob:preview"); URL.revokeObjectURL = vi.fn();
    custom.mockImplementation(async ({ payload }) => ({ data: { ok: true, verified: true, record: { ...row, ...payload.values, selling_price: payload.values.price } } }));
  });
  afterEach(() => { cleanup(); cache.sheet.flush(); });

  it("does not offer unsupported new-product stock configurations",async()=>{
    mount("create");
    fireEvent.mouseDown(await screen.findByRole("combobox",{name:/Product type/}));
    expect((await screen.findByRole("option",{name:"Kit"})).getAttribute("aria-disabled")).toBe("true");
    expect(screen.getByRole("option",{name:"Assembly"}).getAttribute("aria-disabled")).toBe("true");
  });
  it("navigates after verified save without asking to discard saved changes", async () => {
    mount();
    fireEvent.change(await screen.findByDisplayValue("Granite"), { target: { value: "Quartz" } });
    fireEvent.click(screen.getByRole("button", { name: "Save record" }));
    await waitFor(() => expect(notify).toHaveBeenCalledWith(expect.objectContaining({ type: "success", message: "Record saved" })));
    expect(await screen.findByRole("heading", { name: "Saved product details" })).toBeTruthy();
    expect(screen.queryByText("Unsaved Changes")).toBeNull();
    expect(custom).toHaveBeenCalledTimes(1);
  });

  it("protects image-only changes and saves bytes through the product command without accepting a client path", async () => {
    custom.mockImplementation(async ({ payload }) => ({ data: { ok: true, verified: true, record: { ...row, ...payload.values, selling_price: payload.values.price, image: `storage://products/hmg-products/${row.organization_id}/${row.id}/${"a".repeat(64)}.png` } } }));
    mount();
    await screen.findByDisplayValue("Granite");
    fireEvent.change(screen.getByLabelText("Product image file"), { target: { files: [new File(["png"], "Marble.png", { type: "image/png" })] } });
    await screen.findByText("Marble.png");
    fireEvent.click(screen.getByRole("link", { name: "Other page" }));
    fireEvent.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Cancel" }));
    fireEvent.click(await screen.findByRole("button", { name: "Save record" }));
    expect(await screen.findByRole("heading", { name: "Saved product details" })).toBeTruthy();
    const payload = custom.mock.calls[0][0].payload;
    expect(payload.image_upload).toEqual({ content_type: "image/png", content_base64: "cG5n" });
    expect(payload.values).not.toHaveProperty("image");
    expect(custom).toHaveBeenCalledTimes(1);
  });

  it("retains and freezes image selection when the saved image cannot be verified", async () => {
    mount();
    await screen.findByDisplayValue("Granite");
    fireEvent.change(screen.getByLabelText("Product image file"), { target: { files: [new File(["png"], "Marble.png", { type: "image/png" })] } });
    await screen.findByText("Marble.png");
    fireEvent.click(screen.getByRole("button", { name: "Save record" }));
    await screen.findByRole("button", { name: "Check saved record" });
    expect(screen.getByText("Marble.png")).toBeTruthy();
    expect(screen.getByLabelText("Product image file").hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: "Remove selected image" }).hasAttribute("disabled")).toBe(true);
    expect(notify.mock.calls.some(([message]) => message.type === "success")).toBe(false);
  });

  it("retries a correlated media-stage failure using the same new product ID", async () => {
    custom.mockImplementationOnce(async ({ payload }) => ({ data: { ok: false, code: "MEDIA_UNCONFIRMED", product_write_attempted: false, request_id: payload.request_id } }))
      .mockImplementationOnce(async ({ payload }) => ({ data: { ok: true, verified: true, record: { ...row, ...payload.values, id: payload.request_id, selling_price: payload.values.price, image: `storage://products/hmg-products/${row.organization_id}/${payload.request_id}/${"a".repeat(64)}.png` } } }));
    mount("create");
    fireEvent.change(screen.getByRole("spinbutton", { name: "Selling price" }), { target: { value: "10" } });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Minimum stock level" }), { target: { value: "0" } });
    fireEvent.change(screen.getByLabelText("Product image file"), { target: { files: [new File(["png"], "Marble.png", { type: "image/png" })] } });
    await screen.findByText("Marble.png");
    fireEvent.click(screen.getByRole("button", { name: "Save record" }));
    await screen.findByText(/A staged image may remain/);
    expect(screen.queryByRole("button", { name: "Check saved record" })).toBeNull();
    expect(screen.getByText("Marble.png")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Save record" }));
    expect(await screen.findByRole("heading", { name: "Saved product details" })).toBeTruthy();
    const ids = custom.mock.calls.map(([request]) => request.payload.request_id);
    expect(ids).toHaveLength(2); expect(ids[0]).toBe(ids[1]);
  });

  it.each(["wrong-id", "missing-flag"])("does not unlock an uncorrelated media-stage result: %s", async variant => {
    custom.mockResolvedValue({ data: { ok: false, code: "MEDIA_UNCONFIRMED", request_id: variant === "wrong-id" ? "wrong-id" : row.id, ...(variant === "missing-flag" ? {} : { product_write_attempted: false }) } });
    mount();
    fireEvent.change(await screen.findByDisplayValue("Granite"), { target: { value: "Quartz" } });
    fireEvent.click(screen.getByRole("button", { name: "Save record" }));
    expect(await screen.findByRole("button", { name: "Check saved record" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Save record" })).toBeNull();
  });

  it.each(["timeout", "mismatched readback", "server rejection"])("keeps navigation protection after %s", async failure => {
    if (failure === "timeout") custom.mockRejectedValue(new Error("timeout"));
    else if (failure === "server rejection") custom.mockResolvedValue({ data: { ok: false, code: "VALIDATION_ERROR" } });
    else custom.mockResolvedValue({ data: { ok: true, verified: true, record: row } });
    mount();
    fireEvent.change(await screen.findByDisplayValue("Granite"), { target: { value: "Quartz" } });
    fireEvent.click(screen.getByRole("button", { name: "Save record" }));
    if (failure === "server rejection") await screen.findByText(/server rejected this request without saving changes/i);
    else await screen.findByRole("button", { name: "Check saved record" });
    fireEvent.click(screen.getByRole("link", { name: "Other page" }));
    expect(await screen.findByText("Unsaved Changes")).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Other page content" })).toBeNull();
    expect(notify.mock.calls.some(([message]) => message.type === "success")).toBe(false);
  });

  it("clears uncertainty only after recovered readback without repeating the write", async () => {
    let saved: Record<string, unknown>;
    custom.mockImplementationOnce(async ({ payload }) => {
      saved = { ...row, ...payload.values, selling_price: payload.values.price };
      throw new Error("lost response");
    }).mockImplementationOnce(async () => ({ data: { ok: true, verified: true, record: saved } }));
    mount();
    fireEvent.change(await screen.findByDisplayValue("Granite"), { target: { value: "Quartz" } });
    fireEvent.click(screen.getByRole("button", { name: "Save record" }));
    fireEvent.click(await screen.findByRole("button", { name: "Check saved record" }));
    expect(await screen.findByRole("heading", { name: "Saved product details" })).toBeTruthy();
    expect(screen.queryByText("Unsaved Changes")).toBeNull();
    expect(custom).toHaveBeenCalledTimes(2);
    expect(custom.mock.calls.map(([request]) => request.payload.action)).toEqual(["update", "readback"]);
  });

  it.each([false, true])("leaves after explicit discard confirmation without a second unsaved dialog (uncertain: %s)", async uncertain => {
    if (uncertain) custom.mockRejectedValue(new Error("timeout"));
    mount();
    fireEvent.change(await screen.findByDisplayValue("Granite"), { target: { value: "Quartz" } });
    if (uncertain) {
      fireEvent.click(screen.getByRole("button", { name: "Save record" }));
      await screen.findByRole("button", { name: "Check saved record" });
    }
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(await screen.findByText("Discard record draft?")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Discard draft" }));
    expect(await screen.findByRole("heading", { name: "Product list" })).toBeTruthy();
    expect(screen.queryByText("Unsaved Changes")).toBeNull();
    expect(custom).toHaveBeenCalledTimes(uncertain ? 1 : 0);
  });
});
