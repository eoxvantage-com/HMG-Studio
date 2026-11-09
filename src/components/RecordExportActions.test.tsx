import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Refine } from "@refinedev/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RecordExportActions } from "./RecordExportActions";

const auth = vi.hoisted(() => ({ data: { id: "normal-test-user" }, isLoading: false, isFetching: false, isError: false }));
vi.mock("@refinedev/core", async () => ({ ...await vi.importActual("@refinedev/core"), useGetIdentity: () => auth }));

afterEach(cleanup);
beforeEach(() => { auth.data.id = "normal-test-user"; auth.isFetching = false; auth.isError = false; });
describe("record export actions", () => {
  it("shows a scoped branded preview without creating an invoice or executing HTML", () => {
    render(<Refine options={{ disableTelemetry: true }}><RecordExportActions title="Order snapshot" columns={[{key:"name",label:"Name"}]} rows={[{name:"<script>not executable</script>"}]} scopeLabel="Current page only" filename="orders" /></Refine>);
    fireEvent.click(screen.getByRole("button", { name: "Print / PDF" }));
    expect(screen.getByAltText("HMG Stones")).toBeTruthy();
    expect(screen.getByText(/not an issued invoice or proof of payment/)).toBeTruthy();
    expect(screen.getByText("<script>not executable</script>")).toBeTruthy();
    expect(document.querySelector("script")).toBeNull();
  });
  it("disables exports for an empty page", () => {
    render(<Refine options={{ disableTelemetry: true }}><RecordExportActions title="Orders" columns={[]} rows={[]} scopeLabel="Current page only" filename="orders" /></Refine>);
    expect((screen.getByRole("button", { name: "Export CSV" }) as HTMLButtonElement).disabled).toBe(true);
  });
  it("downloads only mapped rows with a safe filename", () => {
    vi.useFakeTimers();
    const create = vi.fn(() => "blob:test"); const revoke = vi.fn();
    vi.stubGlobal("URL", { createObjectURL: create, revokeObjectURL: revoke });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    render(<Refine options={{ disableTelemetry: true }}><RecordExportActions title="Orders" columns={[{key:"name",label:"Name"}]} rows={[{name:"Slab"}]} scopeLabel="Current page only" filename="orders" /></Refine>);
    fireEvent.click(screen.getByRole("button", { name: "Export CSV" }));
    expect(create).toHaveBeenCalledWith(expect.any(Blob)); expect(click).toHaveBeenCalledOnce();
    vi.runAllTimers(); expect(revoke).toHaveBeenCalledWith("blob:test");
    click.mockRestore(); vi.unstubAllGlobals(); vi.useRealTimers();
  });
  it.each(["changed", "fetching", "error"])("blocks stale exports when identity is %s", kind => {
    const props = { title: "Orders", columns: [{key:"name",label:"Name"}], rows: [{name:"Old principal's record"}], scopeLabel: "Current page", filename: "orders" };
    const tree = () => <Refine options={{ disableTelemetry: true }}><RecordExportActions {...props} /></Refine>;
    const view = render(tree()); fireEvent.click(screen.getByRole("button", { name: "Print / PDF" }));
    if (kind === "changed") auth.data.id = "different-user";
    if (kind === "fetching") auth.isFetching = true;
    if (kind === "error") auth.isError = true;
    view.rerender(tree());
    expect(screen.queryByText("Old principal's record")).toBeNull();
    expect((screen.getByRole("button", { name: "Export CSV" }) as HTMLButtonElement).disabled).toBe(true);
  });
});
