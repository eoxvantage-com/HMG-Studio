import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Refine, type DataProvider } from "@refinedev/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Categories } from "./index";
const lookup = vi.hoisted(() => ({ cancel: undefined as undefined | ReturnType<typeof vi.spyOn> }));
vi.mock("@refinedev/mui", async () => {
  const actual = await vi.importActual<typeof import("@refinedev/mui")>("@refinedev/mui");
  return { ...actual, useAutocomplete: (...args: Parameters<typeof actual.useAutocomplete>) => {
    const result = actual.useAutocomplete(...args);
    const search = result.onSearch as typeof result.onSearch & { cancel: () => void };
    if (!vi.isMockFunction(search.cancel)) lookup.cancel = vi.spyOn(search, "cancel");
    return result;
  } };
});
const list = vi.fn(); const custom = vi.fn(); const notify = vi.fn();
const provider = { getApiUrl: () => "https://qa.example.invalid", getList: list, custom } as unknown as DataProvider;
const row = { id: "cat", name: "QA Granite", description: "Stone", slug: "qa-granite", is_active: true, organization_id: "org" };
function mount() { return render(<Refine dataProvider={{ default: provider, app: provider }} notificationProvider={() => ({ open: notify, close: vi.fn() })} options={{ disableTelemetry: true }}><Categories /></Refine>); }
describe("category creation and server-side list", () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({ matches: false, media: query, onchange: null, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn() }));
    const computedStyle = window.getComputedStyle.bind(window);
    vi.spyOn(window, "getComputedStyle").mockImplementation(element => computedStyle(element));
    list.mockImplementation(async ({resource}) => resource === "organizations" ? {data:[{id:"org",name:"QA Organization"}],total:1} : {data:[row],total:1});
    custom.mockImplementation(async ({ payload }) => ({ data: {ok:true,verified:true,record:{...row,id:payload.request_id,description:null}} }));
  });
  afterEach(cleanup);
  it("cancels the pending organization search when the dialog unmounts", async () => {
    const view = mount(); await screen.findByText("QA Granite");
    fireEvent.click(screen.getByRole("button", { name: /Create category/ }));
    fireEvent.change(screen.getByRole("combobox", { name: "Organization" }), { target: { value: "Pending lookup" } });
    const cancel = lookup.cancel;
    expect(cancel).toBeDefined();
    view.unmount();
    expect(cancel).toHaveBeenCalled();
  });
  it("renders actual rows and never exposes unsafe edit/delete", async () => {
    mount(); expect(await screen.findByText("QA Granite")).toBeTruthy();
    expect(screen.queryByRole("button",{name:/edit|delete/i})).toBeNull();
  });
  it("uses Ant Design controls with one primary action and leaves breadcrumb to the app shell", async () => {
    const { container } = mount();
    await screen.findByText("QA Granite");
    expect(container.querySelectorAll(".ant-btn-primary")).toHaveLength(1);
    expect(container.querySelectorAll(".ant-breadcrumb")).toHaveLength(0);
    expect(screen.getByRole("button", { name: "Export CSV" }).className).not.toContain("ant-btn-primary");
  });
  it("starts in cards and supports a server-backed table with scoped export", async () => {
    mount(); await screen.findByRole("heading", { name: "QA Granite" });
    expect(screen.getByRole("button", { name: "Export CSV" })).toBeTruthy();
    const display = screen.getByRole("combobox", { name: "Display" });
    fireEvent.mouseDown(display);
    fireEvent.click(await screen.findByText("Table", { selector: ".ant-select-item-option-content" }));
    expect(await screen.findByRole("table")).toBeTruthy();
  });
  it("pushes search into server filters", async () => {
    mount(); await screen.findByText("QA Granite");
    fireEvent.change(screen.getByRole("textbox",{name:"Search categories"}),{target:{value:"Marble"}});
    await waitFor(() => expect(list).toHaveBeenCalledWith(expect.objectContaining({resource:"product_categories",filters:expect.arrayContaining([expect.objectContaining({field:"name",value:"Marble"})])})),{timeout:2000});
  });
  it("resets a later page when the server search changes", async () => {
    list.mockResolvedValue({data:[row],total:35}); mount();
    await screen.findByText("QA Granite");
    fireEvent.click(document.querySelector(".ant-pagination-next button")!);
    await waitFor(() => expect(list).toHaveBeenCalledWith(expect.objectContaining({pagination:expect.objectContaining({currentPage:2})})));
    fireEvent.change(screen.getByRole("textbox",{name:"Search categories"}),{target:{value:"Marble"}});
    await waitFor(() => expect(list.mock.calls.at(-1)?.[0]).toMatchObject({pagination:{currentPage:1},filters:expect.arrayContaining([expect.objectContaining({field:"name",value:"Marble"})])}),{timeout:2000});
  });
  it("updates the grid total to zero after a populated search", async () => {
    list.mockResolvedValue({data:[row],total:35}); mount();
    await screen.findByText("QA Granite");
    list.mockResolvedValue({data:[],total:0});
    fireEvent.change(screen.getByRole("textbox",{name:"Search categories"}),{target:{value:"Missing"}});
    await waitFor(() => expect(screen.getByText("No results found")).toBeTruthy(),{timeout:2000});
  });
  it("distinguishes no-data and no-search-results states", async () => {
    list.mockResolvedValue({data:[],total:0}); mount();
    await screen.findByText("No categories yet");
    fireEvent.change(screen.getByRole("textbox",{name:"Search categories"}),{target:{value:"Missing"}});
    await screen.findByText("No results found");
  });
  it("shows errors instead of zero data", async () => {
    list.mockRejectedValue({statusCode:403,message:"Forbidden"}); mount();
    await screen.findByText("Unable to load categories");
    expect(screen.queryByText("No categories yet")).toBeNull();
  });
  it.each(["", "Polished stone category"])("creates through the private app function and verifies persistence with description '%s'", async description => {
    custom.mockImplementation(async ({ payload }) => ({ data: { ok: true, verified: true, record: { ...row, id: payload.request_id, description: description || null } } }));
    mount(); await screen.findByText("QA Granite");
    fireEvent.click(screen.getByRole("button",{name:/Create category/}));
    fireEvent.change(screen.getByRole("textbox",{name:/Category name/}),{target:{value:"QA Granite"}});
    if (description) fireEvent.change(screen.getByRole("textbox", { name: "Description" }), { target: { value: description } });
    const organization = screen.getByRole("combobox",{name:"Organization"});
    fireEvent.mouseDown(organization);
    // Wait for the server-backed option and click the rendered item, not the virtual a11y mirror.
    fireEvent.click(await screen.findByText("QA Organization", { selector: ".ant-select-item-option-content" }));
    await waitFor(() => expect(organization.closest(".ant-select")?.querySelector(".ant-select-selection-item")?.textContent).toBe("QA Organization"));
    fireEvent.click(screen.getByRole("button",{name:"Save category"}));
    await waitFor(() => expect(custom, document.querySelector("#create-category")?.textContent ?? "Form missing").toHaveBeenCalled());
    await waitFor(() => expect(notify).toHaveBeenCalledWith(expect.objectContaining({type:"success"})));
    expect(custom.mock.calls[0][0]).toMatchObject({url:"hmg-categories-v1",payload:{action:"create",organization_id:"org",values:{name:"QA Granite",description}}});
  // Whole-suite JSDOM/MUI rendering reached 5.4s; scoped run was 2.5s.
  // Keep request assertions unchanged and give this dialog interaction 10s.
  }, 10000);
  it("rejects a whitespace-only category name without sending a mutation", async () => {
    mount(); await screen.findByText("QA Granite");
    fireEvent.click(screen.getByRole("button", { name: /Create category/ }));
    fireEvent.change(screen.getByRole("textbox", { name: /Category name/ }), { target: { value: "   " } });
    fireEvent.mouseDown(screen.getByRole("combobox", { name: "Organization" }));
    fireEvent.click(await screen.findByText("QA Organization", { selector: ".ant-select-item-option-content" }));
    fireEvent.click(screen.getByRole("button", { name: "Save category" }));
    expect(await screen.findByText("Enter a category name.")).toBeTruthy();
    expect(custom).not.toHaveBeenCalled();
    expect(notify).not.toHaveBeenCalled();
  });
});

