import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { StyleProvider, createCache as createAntCache } from "@ant-design/cssinjs";
import { cleanup, configure, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Refine, type DataProvider } from "@refinedev/core";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InventoryList, InventoryRelated, ProductOverview } from "./inventory";
import { getErpResource } from "../../services/erp";
import { getErpModule } from "../../erp/modules";

vi.mock("jsbarcode", () => ({ default: vi.fn() }));
vi.mock("@refinedev/core", async () => ({ ...await vi.importActual("@refinedev/core"), useGetIdentity: () => ({ data: { id: "11111111-1111-4111-8111-111111111111" }, isLoading: false, isFetching: false, isError: false }) }));
// Ant's CSS-in-JS and semantic table rendering exceed the 1s RTL default on Windows.
configure({ asyncUtilTimeout: 5000 });
vi.setConfig({ testTimeout: 15000 });
const getList = vi.fn();
const org="33333333-3333-4333-8333-333333333333";
const custom=vi.fn();
const organizationRead=vi.fn();
const provider = { getApiUrl: () => "https://example.invalid", custom, getList: (args: {resource:string}) => args.resource === "organizations" ? organizationRead(args) : getList(args) } as unknown as DataProvider;
const row = { id: "product-1", name: "Carrara", sku: "CR-1", stock: 12, selling_price: 100, purchase_price: 75, currency: "INR", is_active: true };
let emotionCache: ReturnType<typeof createCache>;
function mount(content: React.ReactNode) { return render(<StyleProvider cache={createAntCache()} autoClear><CacheProvider value={emotionCache}><MemoryRouter><Refine dataProvider={{default:provider,app:provider}} options={{ disableTelemetry: true }}>{content}</Refine></MemoryRouter></CacheProvider></StyleProvider>); }
beforeEach(() => {
    emotionCache = createCache({ key: "workspace-test" });
  const getComputedStyle = window.getComputedStyle.bind(window);
  vi.spyOn(window, "getComputedStyle").mockImplementation(element => getComputedStyle(element));
  window.matchMedia = vi.fn().mockImplementation(() => ({ matches: false, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  getList.mockResolvedValue({ data: [row], total: 1 });
  organizationRead.mockResolvedValue({data:[{id:org,is_active:true,deleted_at:null,settings:{}}],total:1});custom.mockReset();
});
afterEach(() => { cleanup(); emotionCache.sheet.flush(); });
describe("inventory workspace", () => {
  it("renders ledger bins and never reads native stock for activated organizations",async()=>{
    const product="44444444-4444-4444-8444-444444444444";
    const location="55555555-5555-4555-8555-555555555555";
    organizationRead.mockResolvedValue({data:[{id:org,is_active:true,deleted_at:null,settings:{stock_authority:"ledger_v2"}}],total:1});
    custom.mockResolvedValue({data:{ok:true,code:"STATE",capabilities:["commerce_v2"],state:{organization_id:org,sequence:1,head:"a".repeat(64),balances:[{product_id:product,location_id:location,quantity:17,reserved:2}],documents:{},entitlements:{},requests:{},reservations:{}}}});
    getList.mockImplementation(async()=>({data:[{id:location,name:"Ledger rack"}],total:1}));
    mount(<InventoryRelated kind="stock" record={{...row,id:product,organization_id:org,has_variants:false,tracking_type:"none",type:"standard"}} onCount={vi.fn()} />);
    await screen.findByRole("img",{name:/Location quantities: Ledger rack: 17/});
    expect(getList.mock.calls.some(([args])=>args.resource==="product_location_stocks")).toBe(false);
  });
  it("has one product list query and pushes the OR search to the provider", async () => {
    mount(<InventoryList resource={getErpResource("products")!} module={getErpModule("inventory")!} />);
    await screen.findByRole("link", { name: "Carrara" });
    expect(getList.mock.calls.filter(([args]) => args.resource === "products")).toHaveLength(1);
    fireEvent.change(screen.getByRole("textbox", { name: "Search products" }), { target: { value: "CR-1" } });
    await waitFor(() => expect(getList).toHaveBeenLastCalledWith(expect.objectContaining({ filters: expect.arrayContaining([{ operator: "or", value: ["name", "sku", "barcode"].map(field => ({ field, operator: "contains", value: "CR-1" })) }]) })));
  });
  it("lists business workspaces only and shows stock status", async () => {
    organizationRead.mockResolvedValue({ data: [{ id: org, is_active: true, deleted_at: null, settings: { dataset_kind: "production" } }, { id: "qa-org", is_active: true, deleted_at: null, settings: { dataset_kind: "test" } }], total: 2 });
    getList.mockImplementation(async (args: { resource: string }) => args.resource === "products" ? { data: [{ ...row, organization_id: org, min_stock: 20 }], total: 1 } : { data: [], total: 0 });
    mount(<InventoryList resource={getErpResource("products")!} module={getErpModule("inventory")!} />);
    await screen.findByRole("link", { name: "Carrara" });
    const products = getList.mock.calls.filter(([args]) => args.resource === "products");
    expect(products).toHaveLength(1);
    expect(products[0][0].filters).toEqual(expect.arrayContaining([{ field: "organization_id", operator: "in", value: [org] }]));
    expect(screen.getByText("Low stock")).toBeTruthy();
  });
  it("exports only the displayed inventory page with qualified money and no hidden media fields", async () => {
    getList.mockResolvedValue({ data: [{ ...row, image: "storage://products/hidden.jpg", notes: "hidden sentinel" }], total: 200 });
    mount(<InventoryList resource={getErpResource("products")!} module={getErpModule("inventory")!} />);
    await screen.findByRole("link", { name: "Carrara" });
    fireEvent.click(screen.getByRole("button", { name: "Print / PDF" }));
    expect(await screen.findByRole("dialog", { name: "Document preview" })).toBeTruthy();
    expect(screen.getAllByText(/Current visible inventory page only/).length).toBeGreaterThan(0);
    expect(screen.queryByText("hidden sentinel")).toBeNull();
    expect(screen.queryByText("storage://products/hidden.jpg")).toBeNull();
    expect(getList.mock.calls.filter(([args]) => args.resource === "products")).toHaveLength(1);
  });
  it("presents informative metrics and explicitly labels an unsaved SKU barcode", async () => {
    mount(<ProductOverview record={row} />);
    expect(await screen.findByText("On-hand stock")).toBeTruthy();
    expect(screen.getByText("Indicative selling value")).toBeTruthy();
    expect(screen.getByText("25.0%" )).toBeTruthy();
    expect(screen.getByText(/SKU barcode preview/)).toBeTruthy();
    expect(screen.getByText(/No verified product image/)).toBeTruthy();
    expect(getList).not.toHaveBeenCalled();
  });
  it("does not load untrusted remote media or misrepresent unknown prices", () => {
    mount(<ProductOverview record={{ ...row, image: "https://evil.test/a.jpg", selling_price: null, purchase_price: null, stock: null }} />);
    expect(document.querySelector('img[src^="https://evil.test"]')).toBeNull();
    expect(screen.getAllByText("Not available").length).toBeGreaterThan(2);
  });
  it("prints locally without a popup or document-writing API", () => {
    const print = vi.spyOn(window, "print").mockImplementation(() => undefined);
    const open = vi.spyOn(window, "open");
    mount(<ProductOverview record={row} />);
    fireEvent.click(screen.getByRole("button", { name: "Print product identity" }));
    expect(print).toHaveBeenCalledOnce();
    expect(open).not.toHaveBeenCalled();
    expect(document.querySelector(".inventory-codes style")?.textContent).toContain("body:not(:has(.hmg-export-document)) .inventory-codes");
  });
  it("uses parent-constrained stock and bounded name lookups, without adding bin quantities", async () => {
    getList.mockImplementation(async ({ resource }) => ({ data: resource === "product_location_stocks" ? [{ id: "bin-1", location_id: "loc-1", quantity: 7 }] : resource === "product_locations" ? [{ id: "loc-1", name: "Rack A", warehouse_id: "wh-1" }] : [{ id: "wh-1", name: "Factory" }], total: 1 }));
    const onCount = vi.fn();
    mount(<InventoryRelated kind="stock" record={{...row,organization_id:org}} onCount={onCount} />);
    expect(await screen.findByText("Factory")).toBeTruthy();
    expect(screen.getByText("Rack A")).toBeTruthy();
    expect(getList).toHaveBeenCalledWith(expect.objectContaining({ resource: "product_location_stocks", filters: [{ field: "product_id", operator: "eq", value: row.id }] }));
    expect(getList).toHaveBeenCalledWith(expect.objectContaining({ resource: "product_locations", filters: [{ field: "id", operator: "in", value: ["loc-1"] }] }));
    expect(onCount).toHaveBeenCalledWith(1);
  });
  it("ignores unrequested reference rows instead of following their warehouse IDs", async () => {
    getList.mockImplementation(async ({ resource }) => ({ data: resource === "product_location_stocks" ? [{ id: "bin-1", location_id: "loc-1", quantity: 7 }] : [{ id: "loc-other", name: "Foreign rack", warehouse_id: "wh-other" }], total: 1 }));
    mount(<InventoryRelated kind="stock" record={{...row,organization_id:org}} onCount={vi.fn()} />);
    await waitFor(() => expect(getList).toHaveBeenCalledWith(expect.objectContaining({ resource: "product_locations" })));
    expect(screen.queryByText("Foreign rack")).toBeNull();
    expect(getList.mock.calls.some(([args]) => args.resource === "warehouses")).toBe(false);
  });
  it("exports only displayed supplier terms with supplier currency", async () => {
    getList.mockImplementation(async ({ resource }) => ({ data: resource === "product_supplier" ? [{ id: "link-1", supplier_id: "supplier-1", cost_price: 50, hidden: "private sentinel" }] : [{ id: "supplier-1", name: "Quarry", currency: "USD" }], total: 1 }));
    mount(<InventoryRelated kind="suppliers" record={row} onCount={vi.fn()} />);
    await screen.findByText("Quarry");
    fireEvent.click(screen.getByRole("button", { name: "Print / PDF" }));
    expect(await screen.findByRole("dialog", { name: "Document preview" })).toBeTruthy();
    expect(screen.getAllByText(/Current visible supplier page only/).length).toBeGreaterThan(0);
    expect(screen.queryByText("private sentinel")).toBeNull();
    expect(screen.getAllByText(/USD/).length).toBeGreaterThan(0);
  });
  it("uses the supplier currency, never the product currency for supplier terms", async () => {
    getList.mockImplementation(async ({ resource }) => ({ data: resource === "product_supplier" ? [{ id: "link-1", supplier_id: "supplier-1", cost_price: 50 }] : [{ id: "supplier-1", name: "Quarry", currency: "USD" }], total: 1 }));
    mount(<InventoryRelated kind="suppliers" record={row} onCount={vi.fn()} />);
    expect(await screen.findByText("$50.00 USD")).toBeTruthy();
  });
  it("charts the same bounded location page without requesting aggregate or extra stock rows", async () => {
    const location = "22222222-2222-4222-8222-222222222222";
    getList.mockImplementation(async ({ resource }) => ({ data: resource === "product_location_stocks" ? [{ id: "11111111-1111-4111-8111-111111111111", location_id: location, quantity: 7 }] : [{ id: location, name: "Rack B" }], total: resource === "product_location_stocks" ? 20 : 1 }));
    mount(<InventoryRelated kind="stock" record={{...row,organization_id:org}} onCount={vi.fn()} />);
    expect(await screen.findByText("Locations on this page")).toBeTruthy();
    expect(await screen.findByRole("img", { name: /Location quantities: Rack B: 7/ })).toBeTruthy();
    expect(getList.mock.calls.filter(([args]) => args.resource === "product_location_stocks")).toHaveLength(1);
    expect(screen.queryByText("All accessible recorded locations")).toBeNull();
  });
  it("labels complete locations only with exact scope and preserves the table fallback", async () => {
    const location = "22222222-2222-4222-8222-222222222222";
    getList.mockImplementation(async ({ resource }) => ({ data: resource === "product_location_stocks" ? [{ id: "11111111-1111-4111-8111-111111111111", location_id: location, quantity: -2 }] : [{ id: location, name: "Rack C" }], total: 1 }));
    mount(<InventoryRelated kind="stock" record={{...row,organization_id:org}} onCount={vi.fn()} />);
    expect(await screen.findByText("All accessible recorded locations")).toBeTruthy();
    expect(await screen.findByRole("img", { name: /Location quantities: Rack C: -2/ })).toBeTruthy();
    expect(screen.getAllByRole("table").length).toBeGreaterThan(0);
  });

});
