import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fixture from "../../services/__fixtures__/commerce-ledger.json";
import { parseCommerceState, type CommerceState } from "../../services/commerceLedger";
import { ApprovalsPage } from "./approvals";
import { formatMoney, shortNumber } from "../../services/commercePresentation";

const f = vi.hoisted(() => ({ read: vi.fn(), api: vi.fn(), execute: vi.fn(), legacyList: vi.fn(), state: null as CommerceState | null, unavailable: false }));
vi.mock("@refinedev/core", () => ({
  useGetIdentity: () => ({ data: { id: "11111111-1111-4111-8111-111111111111" }, isLoading: false, isFetching: false, isError: false }),
  useWarnAboutChange: () => ({ warnWhen: false, setWarnWhen: vi.fn() }),
  useNotification: () => ({ open: vi.fn() }),
  useList: (args: Record<string, unknown>) => f.read(args),
  useCustomMutation: () => ({ mutateAsync: f.api }),
}));
vi.mock("../../hooks/useCommerceLedger", () => ({ useCommerceLedger: () => ({
  owner: "11111111-1111-4111-8111-111111111111", state: f.unavailable ? null : f.state,
  enabled: !f.unavailable, locked: f.unavailable, pending: null, busy: false, storageBlocked: false,
  message: f.unavailable ? "Forbidden: workflow access could not be verified." : "",
  refresh: vi.fn(), execute: f.execute,
}) }));
const org = fixture.state.organization_id;
function LocationProbe() { const location = useLocation(); return <output aria-label="Current route">{location.pathname}{location.search}</output>; }
function mount() {
  return render(<MemoryRouter initialEntries={[`/approvals?organization=${org}`]}>
    <ApprovalsPage renderList={f.legacyList} /><LocationProbe />
  </MemoryRouter>);
}

describe("unified ledger approval workspace", () => {
  beforeEach(() => {
    f.read.mockReset(); f.api.mockReset(); f.execute.mockReset(); f.legacyList.mockReset(); f.unavailable = false;
    f.state = parseCommerceState(fixture, org)!.state;
    f.read.mockImplementation(({ resource }: { resource: string }) => ({
      result: { data: resource === "organizations" ? [{ id: org, name: "HMG Studio", is_active: true, deleted_at: null, settings: { stock_authority: "ledger_v2" } }] : [], total: resource === "organizations" ? 1 : 0 },
      query: { isLoading: false, isFetching: false, isError: false },
    }));
    f.api.mockImplementation(async ({ values }: { values: { kind: string; status?: string } }) => {
      const documents = Object.values(f.state!.documents).filter(document => document.kind === values.kind && (!values.status || document.status === values.status));
      return { data: { ok: true, code: "DOCUMENTS", organization_id: org, data: documents, total: documents.length, head: f.state!.head, capabilities: ["commerce_v2"] } };
    });
  });
  afterEach(cleanup);

  it("delegates all five normal queues to the same ledger without invoking legacy lists or writes", async () => {
    mount();
    await waitFor(() => expect(f.api).toHaveBeenCalled());
    const labels = ["Sales orders", "Purchase orders", "Returns", "Stock transfers", "Stock adjustments"];
    expect(screen.getAllByRole("tab")).toHaveLength(5);
    for (const label of labels) expect(screen.getByRole("tab", { name: label })).toBeTruthy();
    expect(screen.queryByRole("tab", { name: /QA/i })).toBeNull();
    for (const label of labels.slice(1)) fireEvent.click(screen.getByRole("tab", { name: label }));
    expect(f.legacyList).not.toHaveBeenCalled();
    expect(f.execute).not.toHaveBeenCalled();
    const resources = f.read.mock.calls.map(([params]) => params.resource);
    for (const resource of ["orders", "purchase_orders", "return_orders", "stock_transfers", "stock_adjustments", "stock_adjustment_requests"])
      expect(resources).not.toContain(resource);
    expect(f.api.mock.calls.every(([request]) => request.values.action === "documents" && request.method === "post" && request.dataProviderName === "app")).toBe(true);
  });

  it("requests pending sales and purchasing documents through the scoped native endpoint", async () => {
    mount();
    await waitFor(() => expect(f.api).toHaveBeenCalledWith(expect.objectContaining({ values: expect.objectContaining({ action: "documents", organization_id: org, kind: "sales_order", status: "pending", page: 1 }) })));
    fireEvent.click(screen.getByRole("tab", { name: "Purchase orders" }));
    await waitFor(() => expect(f.api).toHaveBeenCalledWith(expect.objectContaining({ values: expect.objectContaining({ action: "documents", organization_id: org, kind: "purchase_order", status: "pending", page: 1 }) })));
    expect(f.execute).not.toHaveBeenCalled();
  });

  it("preserves organization context in normal review/edit links and shows row currency", async () => {
    mount();
    const pending = Object.values(f.state!.documents).find(document => document.kind === "sales_order" && document.status === "pending")!;
    const cell = await screen.findByText(shortNumber(pending.number));
    const row = cell.closest("tr")!;
    expect(within(row).getByText(formatMoney(pending.total, pending.draft.currency))).toBeTruthy();
    const review = within(row).getByRole("link", { name: "Review" });
    expect(review.getAttribute("href")).toBe(`/orders/show/${pending.id}?organization=${org}`);
    expect(within(row).getByRole("link", { name: "Edit" }).getAttribute("href")).toBe(`/orders/edit/${pending.id}?organization=${org}`);
    fireEvent.click(review);
    expect(screen.getByLabelText("Current route").textContent).toBe(`/orders/show/${pending.id}?organization=${org}`);
  });

  it("keeps an unavailable workflow retryable without claiming an empty queue", () => {
    f.unavailable = true; mount();
    expect(screen.getByText(/Forbidden: workflow access could not be verified/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Refresh workflow" })).toBeTruthy();
    expect(screen.queryByText(/No documents yet|No matching items/)).toBeNull();
    expect(f.api).not.toHaveBeenCalled(); expect(f.execute).not.toHaveBeenCalled(); expect(f.legacyList).not.toHaveBeenCalled();
  });
});
