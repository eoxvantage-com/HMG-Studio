import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { Refine, type DataProvider } from "@refinedev/core";
import { MemoryRouter } from "react-router";
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
vi.setConfig({ testTimeout: 20000 });
const list = vi.fn(); const custom = vi.fn(); const notify = vi.fn();
const provider = { getApiUrl: () => "https://qa.example.invalid", getList: list, custom } as unknown as DataProvider;
const row = { id: "cat", name: "Granite", description: "Stone", slug: "granite", is_active: true, organization_id: "org" };
function mount() { return render(<MemoryRouter><Refine dataProvider={{ default: provider, app: provider }} notificationProvider={() => ({ open: notify, close: vi.fn() })} options={{ disableTelemetry: true }}><Categories /></Refine></MemoryRouter>); }
async function openCreate() {
  fireEvent.click(await screen.findByRole("button", { name: "Create category" }));
  return within(await screen.findByRole("dialog", { name: "Create category" }));
}
async function chooseOrganization(dialog: ReturnType<typeof within>) {
  fireEvent.mouseDown(dialog.getByRole("combobox", { name: /Organization/ }));
  fireEvent.click(await screen.findByRole("option", { name: "HMG Stones" }));
}
describe("category creation and server-side list", () => {
  beforeEach(() => {
    list.mockImplementation(async ({ resource }) => resource === "organizations" ? { data: [{ id: "org", name: "HMG Stones", settings: { dataset_kind: "production" } }, { id: "qa", name: "QA ONLY", settings: { dataset_kind: "test" } }], total: 2 } : { data: [row], total: 1 });
    custom.mockImplementation(async ({ payload }) => ({ data: { ok: true, verified: true, record: { ...row, id: payload.request_id, description: null } } }));
  });
  afterEach(() => { cleanup(); vi.clearAllMocks(); });
  it("scopes the list to business organizations and never exposes unsafe edit/delete", async () => {
    mount(); expect(await screen.findByText("Granite")).toBeTruthy();
    expect(list).toHaveBeenCalledWith(expect.objectContaining({ resource: "product_categories", filters: expect.arrayContaining([{ field: "organization_id", operator: "in", value: ["org"] }]) }));
    expect(screen.queryByRole("button", { name: /edit|delete/i })).toBeNull();
  });
  it("cancels the pending organization search when the dialog unmounts", async () => {
    const view = mount(); await screen.findByText("Granite");
    const dialog = await openCreate();
    fireEvent.change(dialog.getByRole("combobox", { name: /Organization/ }), { target: { value: "Pending lookup" } });
    expect(lookup.cancel).toBeDefined();
    const cancel = lookup.cancel;
    view.unmount();
    expect(cancel).toHaveBeenCalled();
  });
  it("starts in cards and switches to a server-backed table with scoped export", async () => {
    mount(); await screen.findByText("Granite", { selector: "h3" });
    expect(screen.getByRole("button", { name: "Export CSV" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Table" }));
    const table = await screen.findByRole("table", { name: "Categories" });
    expect(within(table).getByText("Granite")).toBeTruthy();
  });
  it("pushes search into server filters and resets to page one", async () => {
    list.mockImplementation(async ({ resource }) => resource === "organizations" ? { data: [{ id: "org", name: "HMG Stones" }], total: 1 } : { data: [row], total: 35 });
    mount(); await screen.findByText("Granite");
    fireEvent.click(screen.getByRole("button", { name: "Go to next page" }));
    await waitFor(() => expect(list).toHaveBeenCalledWith(expect.objectContaining({ resource: "product_categories", pagination: expect.objectContaining({ currentPage: 2 }) })));
    fireEvent.change(screen.getByRole("textbox", { name: "Search categories" }), { target: { value: "Marble" } });
    await waitFor(() => expect(list.mock.calls.at(-1)?.[0]).toMatchObject({ pagination: { currentPage: 1 }, filters: expect.arrayContaining([expect.objectContaining({ field: "name", value: "Marble" })]) }), { timeout: 3000 });
  });
  it("distinguishes no-data and no-search-results states", async () => {
    list.mockImplementation(async ({ resource }) => resource === "organizations" ? { data: [{ id: "org", name: "HMG Stones" }], total: 1 } : { data: [], total: 0 });
    mount(); await screen.findByText("No categories yet");
    fireEvent.change(screen.getByRole("textbox", { name: "Search categories" }), { target: { value: "Missing" } });
    await screen.findByText("No results found", {}, { timeout: 3000 });
  });
  it("shows errors instead of zero data", async () => {
    list.mockImplementation(async ({ resource }) => { if (resource === "organizations") return { data: [{ id: "org", name: "HMG Stones" }], total: 1 }; throw { statusCode: 403, message: "Forbidden" }; });
    mount(); await screen.findByText("Unable to load categories");
    expect(screen.queryByText("No categories yet")).toBeNull();
  });
  it.each(["", "Polished stone category"])("creates through the private app function and verifies persistence with description '%s'", async description => {
    custom.mockImplementation(async ({ payload }) => ({ data: { ok: true, verified: true, record: { ...row, id: payload.request_id, name: "Quartzite", description: description || null } } }));
    mount(); await screen.findByText("Granite");
    const dialog = await openCreate();
    expect(dialog.queryByText("QA ONLY")).toBeNull();
    fireEvent.change(dialog.getByRole("textbox", { name: /Category name/ }), { target: { value: "Quartzite" } });
    if (description) fireEvent.change(dialog.getByRole("textbox", { name: "Description" }), { target: { value: description } });
    await chooseOrganization(dialog);
    fireEvent.click(dialog.getByRole("button", { name: "Save category" }));
    await waitFor(() => expect(custom).toHaveBeenCalled());
    await waitFor(() => expect(notify).toHaveBeenCalledWith(expect.objectContaining({ type: "success" })));
    expect(custom.mock.calls[0][0]).toMatchObject({ url: "hmg-categories-v1", payload: { action: "create", organization_id: "org", values: { name: "Quartzite", description } } });
  });
  it("rejects a whitespace-only category name without sending a mutation", async () => {
    mount(); await screen.findByText("Granite");
    const dialog = await openCreate();
    fireEvent.change(dialog.getByRole("textbox", { name: /Category name/ }), { target: { value: "   " } });
    await chooseOrganization(dialog);
    fireEvent.click(dialog.getByRole("button", { name: "Save category" }));
    expect(await screen.findByText("Enter a category name.")).toBeTruthy();
    expect(custom).not.toHaveBeenCalled();
  });
});
