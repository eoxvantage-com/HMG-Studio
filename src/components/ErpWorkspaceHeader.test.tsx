import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { ErpWorkspaceHeader } from "./ErpWorkspaceHeader";
vi.mock("./NotificationBell", () => ({ NotificationBell: () => <button aria-label="Notifications" /> }));
afterEach(cleanup);
describe("ERP workspace header", () => {
  it("shows route context, demonstration provenance and account link", () => {
    render(<MemoryRouter initialEntries={["/categories"]}><ErpWorkspaceHeader /></MemoryRouter>);
    expect(screen.getByText("Categories")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Notifications" })).toBeTruthy();
    expect(screen.getByText("Demonstration workspace")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Account preferences" }).getAttribute("href")).toBe("/settings/account");
  });
  it("opens the same complete navigation on mobile", () => {
    const open = vi.fn(); window.addEventListener("hmg:open-navigation", open);
    render(<MemoryRouter><ErpWorkspaceHeader /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    expect(open).toHaveBeenCalledTimes(1);
    window.removeEventListener("hmg:open-navigation", open);
  });
});
