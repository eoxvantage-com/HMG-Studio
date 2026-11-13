import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { DataExchangeWorkspace } from "./dataExchange";

const org = "22222222-2222-4222-8222-222222222222";
const f = vi.hoisted(() => ({ mutate: vi.fn(), getList: vi.fn(), execute: vi.fn(), notify: vi.fn() }));
vi.mock("@refinedev/core", () => ({
  useGetIdentity: () => ({ data: { id: "11111111-1111-4111-8111-111111111111" }, isLoading: false, isFetching: false, isError: false }),
  useNotification: () => ({ open: f.notify }),
  useWarnAboutChange: () => ({ warnWhen: false, setWarnWhen: vi.fn() }),
  useCustomMutation: () => ({ mutateAsync: f.mutate }),
  useDataProvider: () => () => ({ getList: f.getList }),
  useList: () => ({ result: { data: [{ id: org, name: "HMG Stones", currency: "INR", is_active: true, settings: { stock_authority: "ledger_v2", dataset_kind: "production" } }, { id: "33333333-3333-4333-8333-333333333333", name: "QA ONLY", is_active: true, settings: { dataset_kind: "test" } }], total: 2 }, query: { isLoading: false, isFetching: false, isError: false } }),
}));
const state = { organization_id: org, sequence: 27, head: "a".repeat(64), documents: {}, balances: [], entitlements: {}, requests: {}, reservations: {}, stock_requests: {} };
vi.mock("../../hooks/useCommerceLedger", () => ({ useCommerceLedger: () => ({ owner: "11111111-1111-4111-8111-111111111111", state, enabled: true, locked: false, pending: null, busy: false, message: "", refresh: vi.fn(), execute: f.execute }) }));
beforeEach(() => {
  f.getList.mockImplementation(async ({ resource }: { resource: string }) => ({ data: resource === "products" ? [{ id: "p-old", organization_id: org, sku: "OLD-1", name: "Old" }] : resource === "product_categories" ? [{ id: "cat-1", organization_id: org, name: "Marble" }] : [], total: 0 }));
  f.mutate.mockResolvedValue({ data: { ok: true, verified: true, replayed: false } });
});
afterEach(() => { cleanup(); vi.clearAllMocks(); localStorage.clear(); });

function upload(csv: string) {
  const input = screen.getByLabelText("Upload Products CSV") as HTMLInputElement;
  const file = new File([csv], "products.csv", { type: "text/csv" });
  Object.defineProperty(file, "text", { value: () => Promise.resolve(csv) });
  fireEvent.change(input, { target: { files: [file] } });
}

it("previews a product CSV, skips existing SKUs and creates the rest through the product command", async () => {
  render(<MemoryRouter><DataExchangeWorkspace /></MemoryRouter>);
  expect(screen.queryByText("QA ONLY")).toBeNull();
  await waitFor(() => expect((screen.getByRole("combobox", { name: /Organization/ }) as HTMLInputElement).value).toBe("HMG Stones"));
  upload("sku,name,category,selling_price\nNEW-1,Statuario,Marble,28500\nOLD-1,Old,,10\nBAD-1,Bad,Quartz,5\n");
  const preview = await screen.findByRole("table", { name: "Import preview" });
  expect(within(preview).getByText("Will be created.")).toBeTruthy();
  expect(within(preview).getByText(/already exists/)).toBeTruthy();
  expect(within(preview).getByText(/Unknown category "Quartz"/)).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Import 1 row" }));
  fireEvent.click(await screen.findByRole("button", { name: "Start import" }));
  await screen.findByRole("table", { name: "Import results" });
  expect(f.mutate).toHaveBeenCalledTimes(1);
  expect(f.mutate.mock.calls[0][0]).toMatchObject({ url: "hmg-product-master-v1", dataProviderName: "app", values: { action: "create", organization_id: org, values: { sku: "NEW-1", name: "Statuario", price: "28500.00", category_id: "cat-1", currency: "INR", is_active: true } } });
  expect(f.mutate.mock.calls[0][0].values.request_id).toMatch(/^[0-9a-f-]{36}$/);
  expect(f.notify).toHaveBeenCalledWith(expect.objectContaining({ type: "success", description: "Import complete" }));
});

it("blocks a file without the required columns before anything is sent", async () => {
  render(<MemoryRouter><DataExchangeWorkspace /></MemoryRouter>);
  await waitFor(() => expect((screen.getByRole("combobox", { name: /Organization/ }) as HTMLInputElement).value).toBe("HMG Stones"));
  upload("title,cost\nSlab,10\n");
  expect(await screen.findByText(/Missing required column "sku"/)).toBeTruthy();
  expect(screen.queryByRole("table", { name: "Import preview" })).toBeNull();
  expect(f.mutate).not.toHaveBeenCalled();
});

it("offers financial and operations exports once the ledger and records are loaded", async () => {
  render(<MemoryRouter><DataExchangeWorkspace /></MemoryRouter>);
  fireEvent.click(screen.getByRole("tab", { name: "Export & reports" }));
  for (const title of ["Sales register", "Receivables ageing", "GST summary (monthly)", "Stock valuation", "Dispatch / production report", "Reorder report"]) expect(screen.getByText(title)).toBeTruthy();
  await waitFor(() => expect(screen.getByRole("button", { name: "Download Sales register" }).hasAttribute("disabled")).toBe(false));
  fireEvent.click(screen.getAllByRole("button", { name: "Preview" })[4]);
  expect(await screen.findByRole("dialog")).toBeTruthy();
  expect(screen.getAllByText(/Active products only/).length).toBeGreaterThan(0);
});
