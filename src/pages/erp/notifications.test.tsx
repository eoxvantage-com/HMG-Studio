import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Refine, useGetIdentity, type DataProvider } from "@refinedev/core";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationsPage } from "./notifications";
import { NotificationBell } from "../../components/NotificationBell";
import { analysisFixture } from "../../services/__fixtures__/dashboardAnalysis";
const dash = vi.hoisted(() => ({ value: { dashboard: null as unknown, query: {}, updatedAt: null } }));
vi.mock("../../hooks/useDashboard", () => ({ useDashboard: () => dash.value, DASHBOARD_REFRESH_MS: 45000 }));
const owner = "11111111-1111-4111-8111-111111111111";
const row = { id: "22222222-2222-4222-8222-222222222222", user_id: owner, title: "Stone stock alert", message: "Review the yard", type: "info", priority: "normal", read_at: null, created_at: "2026-11-06T09:00:00", action_url: "/inventory" };
const getList = vi.fn(); const create = vi.fn(); const update = vi.fn(); const deleteOne = vi.fn();
const identity = vi.fn();
function IdentityRefresh() { const query = useGetIdentity(); return <button onClick={() => query.refetch()}>Refresh test identity</button>; }
function mount(bell = false, action: "list" | "create" | "edit" | "show" = "list", id = row.id) {
  const provider = { getApiUrl: () => "https://example.invalid", getList, create, update, deleteOne } as unknown as DataProvider;
  const tree = (current: typeof action) => <MemoryRouter><Refine dataProvider={provider} authProvider={{ login: async () => ({ success: true }), logout: async () => ({ success: true }), check: async () => ({ authenticated: true }), onError: async () => ({}), getIdentity: identity }} options={{ disableTelemetry: true }}>
    {bell ? <NotificationBell /> : <NotificationsPage action={current} id={id} />}
    <IdentityRefresh />
  </Refine></MemoryRouter>;
  const view = render(tree(action));
  return { ...view, rerenderAction: (next: typeof action) => view.rerender(tree(next)) };
}
beforeEach(() => { vi.clearAllMocks(); identity.mockResolvedValue({ id: owner }); getList.mockResolvedValue({ data: [row], total: 1 }); });
afterEach(cleanup);
describe("personal notification inbox", () => {
  it("exports only the visible personal page with an explicit scope", async () => {
    mount(); await screen.findByText(row.title);
    await waitFor(() => expect((screen.getByRole("button", { name: "Print / PDF" }) as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(screen.getByRole("button", { name: "Print / PDF" }));
    expect(await screen.findByText(/Current personal inbox page only\./)).toBeTruthy();
    expect(screen.queryByText(owner)).toBeNull();
    expect(create).not.toHaveBeenCalled();
  });
  it("queries personal records and provides a safe action link", async () => {
    mount(); expect(await screen.findByText(row.title)).toBeTruthy();
    expect(getList).toHaveBeenCalledWith(expect.objectContaining({ resource: "notifications", filters: expect.arrayContaining([{ field: "user_id", operator: "eq", value: owner }]) }));
    expect(screen.getByRole("link", { name: "Open related record" }).getAttribute("href")).toBe("/inventory");
    expect(create).not.toHaveBeenCalled(); expect(update).not.toHaveBeenCalled(); expect(deleteOne).not.toHaveBeenCalled();
  });
  it("never sends unscoped requests without identity", async () => {
    identity.mockResolvedValue(null); mount();
    expect(await screen.findByText(/Unable to identify your account/)).toBeTruthy();
    expect(getList).not.toHaveBeenCalled();
  });
  it("sends search to the provider and keeps ownership scope", async () => {
    mount(); await screen.findByText(row.title);
    fireEvent.change(screen.getByRole("textbox", { name: "Search notifications" }), { target: { value: "marble" } });
    await waitFor(() => expect(getList).toHaveBeenLastCalledWith(expect.objectContaining({ filters: expect.arrayContaining([{ field: "title", operator: "contains", value: "marble" }, { field: "user_id", operator: "eq", value: owner }]) })));
  });
  it("uses server pagination", async () => {
    getList.mockResolvedValue({ data: [row], total: 30 }); mount(); await screen.findByText(row.title);
    fireEvent.click(screen.getByRole("button", { name: "Go to next page" }));
    await waitFor(() => expect(getList).toHaveBeenLastCalledWith(expect.objectContaining({ pagination: expect.objectContaining({ currentPage: 2 }) })));
  });
  it("shows a real error instead of empty success or cross-user data", async () => {
    getList.mockResolvedValue({ data: [{ ...row, user_id: "other" }], total: 1 }); mount();
    expect(await screen.findByText("Unable to load notifications")).toBeTruthy();
    expect(screen.queryByText(row.title)).toBeNull();
  });
  it("blocks mutation routes without querying or writing", async () => {
    mount(false, "edit"); expect(await screen.findByText(/Notification changes are unavailable/)).toBeTruthy();
    expect(getList).not.toHaveBeenCalled(); expect(update).not.toHaveBeenCalled();
  });
  it("scopes detail reads by both owner and id", async () => {
    mount(false, "show"); await screen.findByText(row.title);
    expect(getList).toHaveBeenCalledWith(expect.objectContaining({ filters: expect.arrayContaining([{ field: "id", operator: "eq", value: row.id }, { field: "user_id", operator: "eq", value: owner }]) }));
  });
  it("does not let invalid detail identifiers trigger an unscoped imperative refetch", async () => {
    mount(false, "show", "not-a-uuid");
    fireEvent.click(await screen.findByRole("button", { name: "Try again" }));
    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
    expect(getList).not.toHaveBeenCalled();
  });
  it("does not carry list pagination or filters into a detail request", async () => {
    getList.mockResolvedValue({ data: [row], total: 30 }); const view = mount(); await screen.findByText(row.title);
    fireEvent.click(screen.getByRole("button", { name: "Go to next page" }));
    await waitFor(() => expect(getList).toHaveBeenLastCalledWith(expect.objectContaining({ pagination: expect.objectContaining({ currentPage: 2 }) })));
    getList.mockResolvedValue({ data: [row], total: 1 }); view.rerenderAction("show");
    await waitFor(() => expect(getList).toHaveBeenLastCalledWith(expect.objectContaining({ pagination: expect.objectContaining({ currentPage: 1, pageSize: 1 }), filters: [{ field: "user_id", operator: "eq", value: owner }, { field: "id", operator: "eq", value: row.id }] })));
  });
  it("does not interpret an empty detail id as an inbox request", async () => {
    mount(false, "show", ""); fireEvent.click(await screen.findByRole("button", { name: "Try again" }));
    expect(getList).not.toHaveBeenCalled();
  });
  it("hides cached personal rows after an account switch while the new request is pending", async () => {
    mount(); await screen.findByText(row.title);
    const next = "33333333-3333-4333-8333-333333333333";
    identity.mockResolvedValue({ id: next }); getList.mockImplementation(() => new Promise(() => {}));
    fireEvent.click(screen.getByRole("button", { name: "Refresh test identity" }));
    await waitFor(() => expect(getList).toHaveBeenLastCalledWith(expect.objectContaining({ filters: expect.arrayContaining([{ field: "user_id", operator: "eq", value: next }]) })));
    expect(screen.queryByText(row.title)).toBeNull();
  });
  it("hides prior successful rows after a denied refresh", async () => {
    mount(); await screen.findByText(row.title); getList.mockRejectedValue({ message: "Forbidden", statusCode: 403 });
    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
    expect(await screen.findByText("Unable to load notifications")).toBeTruthy(); expect(screen.queryByText(row.title)).toBeNull();
  });
});
describe("header notification bell", () => {
  it("announces total unread from the server and opens the preview", async () => {
    getList.mockResolvedValue({ data: [row], total: 40 }); mount(true);
    fireEvent.click(await screen.findByRole("button", { name: "Notifications, 40 unread" }));
    expect(await screen.findByText(row.title)).toBeTruthy();
    expect(screen.getByRole("link", { name: "View all notifications" }).getAttribute("href")).toBe("/notifications");
  });
  it("does not announce zero unread on backend failure", async () => {
    getList.mockRejectedValue({ message: "Forbidden", statusCode: 403 }); mount(true);
    expect(await screen.findByRole("button", { name: "Notifications unavailable" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Notifications, 0 unread" })).toBeNull();
  });
  it("removes a cached unread count if a later refresh is denied", async () => {
    getList.mockResolvedValue({ data: [row], total: 40 }); mount(true);
    const bell = await screen.findByRole("button", { name: "Notifications, 40 unread" });
    getList.mockRejectedValue({ message: "Forbidden", statusCode: 403 }); fireEvent.click(bell);
    fireEvent.click(await screen.findByRole("button", { name: "Retry" }));
    fireEvent.click(screen.getByRole("button", { name: "Close notifications" }));
    expect(await screen.findByRole("button", { name: "Notifications unavailable" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Notifications, 40 unread" })).toBeNull();
  });
it("bell lists server operations alerts and counts critical ones", async () => {
  getList.mockResolvedValue({ data: [], total: 0 }); identity.mockResolvedValue({ id: owner });
  dash.value = { dashboard: { analysis: analysisFixture() }, query: {}, updatedAt: null };
  mount(true);
  const bell = await screen.findByRole("button", { name: /Notifications, 1 unread/ });
  fireEvent.click(bell);
  expect(await screen.findByText("PO-567890AB delivery overdue")).toBeTruthy();
  expect(screen.queryByText("3 products at or below minimum")).toBeNull();
  expect(screen.getByRole("link", { name: "All operations alerts (3)" }).getAttribute("href")).toBe("/?tab=alerts");
  dash.value = { dashboard: null, query: {}, updatedAt: null };
});
});
