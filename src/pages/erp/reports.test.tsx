import { cleanup, configure, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Refine, type DataProvider } from "@refinedev/core";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReportsWorkspace } from "./reports";
const auth = vi.hoisted(() => ({ data: { id: "11111111-1111-4111-8111-111111111111" }, isLoading: false, isFetching: false, isError: false }));
vi.mock("@refinedev/core", async () => ({ ...await vi.importActual("@refinedev/core"), useGetIdentity: () => auth }));
configure({ asyncUtilTimeout: 5000 }); vi.setConfig({ testTimeout: 15000 });
const org = "33333333-3333-4333-8333-333333333333";
const getList = vi.fn();
const provider = { getApiUrl: () => "https://example.invalid", getList,
  getOne: async ({ id }: { id: string }) => ({ data: { id, is_active: true, deleted_at: null, settings: {} } }) } as unknown as DataProvider;
const tree = () => <MemoryRouter><Refine dataProvider={provider} options={{ disableTelemetry: true }}><ReportsWorkspace /></Refine></MemoryRouter>;
beforeEach(() => {
  auth.data.id = "11111111-1111-4111-8111-111111111111"; auth.isLoading = false; auth.isFetching = false; auth.isError = false;
  getList.mockImplementation(async ({ resource }) => resource === "organizations" ? { data: [{ id: org, name: "Permitted company" }], total: 1 } : { data: [{ id: "22222222-2222-4222-8222-222222222222", organization_id: org, order_number: "SO-visible", order_date: "2026-10-01", currency: "INR", total: 25, amount_paid: 0, status: "pending", deleted_at: null }], total: 1 });
});
afterEach(cleanup);
async function ready() {
  await waitFor(() => expect((screen.getByRole("button", { name: "Generate report" }) as HTMLButtonElement).disabled).toBe(false));
  fireEvent.change(screen.getByLabelText("From date"), { target: { value: "2026-05-01" } });
  fireEvent.change(screen.getByLabelText("To date"), { target: { value: "2026-10-31" } });
}
describe("operational report workspace", () => {
  it("only loads permitted organizations until Generate, then offers mapped result exports", async () => {
    render(tree()); await ready();
    expect(getList.mock.calls.every(([args]) => args.resource === "organizations")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Generate report" }));
    expect(await screen.findByText("SO-visible")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Export CSV" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Saved definitions" }).getAttribute("href")).toBe("/reports?view=definitions");
  });
  it("does not select an organization from an incomplete or multi-organization page", async () => {
    getList.mockResolvedValue({ data: [{ id: org, name: "Company" }], total: 2 }); render(tree());
    await waitFor(() => expect(getList).toHaveBeenCalled());
    expect((screen.getByRole("button", { name: "Generate report" }) as HTMLButtonElement).disabled).toBe(true);
  });
  it.each(["change", "fetch", "error"])("hides previous results on identity %s", async state => {
    const view = render(tree()); await ready(); fireEvent.click(screen.getByRole("button", { name: "Generate report" }));
    await screen.findByText("SO-visible");
    if (state === "change") auth.data.id = "99999999-9999-4999-8999-999999999999";
    if (state === "fetch") auth.isFetching = true;
    if (state === "error") auth.isError = true;
    view.rerender(tree());
    expect(screen.queryByText("SO-visible")).toBeNull(); expect(screen.queryByRole("button", { name: "Export CSV" })).toBeNull();
  });
  it("clears results on filter changes and shows generation errors instead of prior data", async () => {
    render(tree()); await ready(); fireEvent.click(screen.getByRole("button", { name: "Generate report" })); await screen.findByText("SO-visible");
    fireEvent.change(screen.getByLabelText("From date"), { target: { value: "2026-06-01" } });
    expect(screen.queryByText("SO-visible")).toBeNull();
    getList.mockRejectedValue({ statusCode: 403 }); fireEvent.click(screen.getByRole("button", { name: "Generate report" }));
    expect(await screen.findByText(/Unable to generate a complete report/)).toBeTruthy(); expect(screen.queryByRole("button", { name: "Export CSV" })).toBeNull();
  });
  it("discards an in-flight report after the principal changes", async () => {
    let finish!: (value: unknown) => void;
    const pending = new Promise(resolve => { finish = resolve; });
    getList.mockImplementation(async ({ resource }) => resource === "organizations" ? { data: [{ id: org, name: "Permitted company" }], total: 1 } : pending);
    const view = render(tree()); await ready(); fireEvent.click(screen.getByRole("button", { name: "Generate report" }));
    await waitFor(() => expect(getList.mock.calls.some(([args]) => args.resource === "orders")).toBe(true));
    auth.data.id = "99999999-9999-4999-8999-999999999999"; view.rerender(tree());
    finish({ data: [{ id: "22222222-2222-4222-8222-222222222222", organization_id: org, order_number: "SO-late", order_date: "2026-10-01", currency: "INR", total: 25, amount_paid: 0, status: "pending", deleted_at: null }], total: 1 });
    await waitFor(() => expect(screen.queryByLabelText("Generating report")).toBeNull());
    expect(screen.queryByText("SO-late")).toBeNull();
  });

});
