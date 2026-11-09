import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Refine, type DataProvider } from "@refinedev/core";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NativeManagementPage } from "./platform";
const users = vi.fn(); const roles = vi.fn(); const getUser = vi.fn(); const forbidden = vi.fn();
const person = { id: "u1", username: "qa_user", email: "qa@example.invalid", first_name: "QA", last_name: "User", is_active: true, is_staff: false, is_deleted: false, date_joined: "2026-11-06T00:00:00Z", roles: [{ name: "Reader", slug: "reader", type: "app", app_slug: "hmg-studio", source: "direct" }] };
const provider = (getList: typeof users, getOne = forbidden) => ({ getApiUrl: () => "https://example.invalid", getList, getOne, create: forbidden, update: forbidden, deleteOne: forbidden }) as unknown as DataProvider;
function mount(kind: "users" | "roles") {
  return render(<MemoryRouter><Refine dataProvider={{ default: provider(forbidden), user: provider(users, getUser), app: provider(roles) }} options={{ disableTelemetry: true }}><NativeManagementPage kind={kind} /></Refine></MemoryRouter>);
}
describe("native management read-only pages", () => {
  beforeEach(() => { users.mockResolvedValue({ data: [person], total: 1 }); roles.mockResolvedValue({ data: [{ id: 1, name: "Reader", slug: "reader", description: "Read only", permissions: ["read"] }], total: 1 }); getUser.mockResolvedValue({ data: person }); });
  afterEach(cleanup);
  it("uses the dedicated user provider and server search without identity datatables", async () => {
    mount("users"); await screen.findByText("qa_user");
    expect(users.mock.calls.every(([request]) => request.filters.some((filter: { field: string; value: string }) => filter.field === "roles" && filter.value === "hmg-studio-hmg-team"))).toBe(true);
    fireEvent.change(screen.getByRole("textbox", { name: "Search users" }), { target: { value: "quartz" } });
    await waitFor(() => expect(users).toHaveBeenLastCalledWith(expect.objectContaining({ resource: "users", filters: expect.arrayContaining([{ field: "search", operator: "eq", value: "quartz" }]), pagination: expect.objectContaining({ pageSize: 10 }) })));
    expect(forbidden).not.toHaveBeenCalled();
    expect(users.mock.calls.every(([request]) => request.filters.some((filter: { field: string; value: string }) => filter.field === "roles" && filter.value === "hmg-studio-hmg-team"))).toBe(true);
  });
  it("opens a native user detail with role counts and no identity writes", async () => {
    mount("users"); await screen.findByText("qa_user"); fireEvent.click(screen.getByRole("button", { name: "View qa_user" }));
    expect(await screen.findByRole("tab", { name: "Roles (1)" })).toBeTruthy();
    expect(getUser).toHaveBeenCalledWith(expect.objectContaining({ resource: "users", id: "qa_user" }));
    expect(screen.queryByRole("button", { name: /delete|save|reset password/i })).toBeNull();
    expect(forbidden).not.toHaveBeenCalled();
  });
  it("distinguishes forbidden reads from an empty user list", async () => {
    users.mockRejectedValue({ statusCode: 403, message: "Forbidden" }); mount("users");
    expect(await screen.findByText("Unable to load users")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
    expect(screen.queryByText("No users yet")).toBeNull();
  });
  it("encodes the native username lookup without using the UUID", async () => {
    const special = { ...person, username: "pradeep+taruvi" };
    users.mockResolvedValue({ data: [special], total: 1 }); getUser.mockResolvedValue({ data: special });
    mount("users"); fireEvent.click(await screen.findByRole("button", { name: "View pradeep+taruvi" }));
    await screen.findByRole("tab", { name: "Roles (1)" });
    expect(getUser).toHaveBeenCalledWith(expect.objectContaining({ id: "pradeep%2Btaruvi" }));
  });
  it("does not display mismatched native identity details", async () => {
    getUser.mockResolvedValue({ data: { ...person, username: "someone_else", email: "private@hmg.com" } });
    mount("users"); fireEvent.click(await screen.findByRole("button", { name: "View qa_user" }));
    await screen.findByText("Unable to load user details");
    expect(screen.queryByText("private@hmg.com")).toBeNull();
  });
  it("reads native app roles without pretending the endpoint supports filtering", async () => {
    mount("roles"); expect(await screen.findByText("Reader")).toBeTruthy();
    expect(roles).toHaveBeenCalledWith(expect.objectContaining({ resource: "roles", pagination: expect.objectContaining({ mode: "off" }) }));
    expect(screen.getByRole("textbox", { name: "Search roles" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByText(/does not support server-side search, filters or pagination/)).toBeTruthy();
    expect(forbidden).not.toHaveBeenCalled();
  });
  it("keeps missing role data visibly empty rather than inventing permissions", async () => {
    roles.mockResolvedValue({ data: [], total: 0 }); mount("roles");
    expect(await screen.findByText("No roles yet")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /create|edit|delete/i })).toBeNull();
  });
});
