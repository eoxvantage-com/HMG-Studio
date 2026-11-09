import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { MuiSidenav } from "./MuiSidenav";
import { ERP_MODULES } from "../../erp/modules";

const logout = vi.fn();
vi.mock("@refinedev/core", () => ({
  useMenu: () => ({ menuItems: [], selectedKey: "/categories" }),
  useGetIdentity: () => ({ data: { first_name: "Stone", username: "stone.operator" } }),
  useLogout: () => ({ mutate: logout }),
  useIsExistAuthentication: () => true,
  useTranslate: () => (_key: string, fallback: string) => fallback,
  useWarnAboutChange: () => ({ warnWhen: false, setWarnWhen: vi.fn() }),
  CanAccess: ({ children }: { children: React.ReactNode }) => children,
}));
afterEach(cleanup);
describe("ERP navigation", () => {
  it("starts expanded with HMG identity, grouped modules and account controls", () => {
    render(<MemoryRouter initialEntries={["/categories"]}><MuiSidenav /></MemoryRouter>);
    expect(screen.getByRole("img", { name: "HMG Stones" }).getAttribute("src")).toBe("/brand/hmg-stones-logo.webp");
    expect(screen.getByText("Stone operations")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Categories" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByText("Catalog")).toBeTruthy();
    expect(screen.getByText("Stock")).toBeTruthy();
    expect(within(screen.getByRole("navigation", { name: "ERP modules" })).getAllByRole("link")).toHaveLength(ERP_MODULES.length);
    expect(screen.getByRole("link", { name: /Account preferences/ }).getAttribute("href")).toBe("/settings/account");
    fireEvent.click(screen.getByRole("button", { name: "Log out" }));
    expect(logout).toHaveBeenCalledTimes(1);
  });
  it("searches the complete navigation and has an explicit empty state", () => {
    render(<MemoryRouter><MuiSidenav /></MemoryRouter>);
    fireEvent.change(screen.getByRole("textbox", { name: "Search modules" }), { target: { value: "nothing-matches" } });
    expect(screen.getByText("No modules found")).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Categories" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Clear module search" }));
    expect(within(screen.getByRole("navigation", { name: "ERP modules" })).getAllByRole("link")).toHaveLength(ERP_MODULES.length);
  });
});
