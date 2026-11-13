import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const f = vi.hoisted(() => ({ get: vi.fn(), identity: { data: { username: "pradeep+taruvi" } as { username?: string } | undefined, isLoading: false } }));
vi.mock("../taruviClient", () => ({ taruviClient: { httpClient: { get: f.get } } }));
vi.mock("@refinedev/core", () => ({ useGetIdentity: () => f.identity }));
vi.stubGlobal("__TARUVI_APP_SLUG__", "hmg-studio");
import { AppSwitcher, parseLauncherApps, safeAppUrl } from "./AppSwitcher";

const payload = { data: [
  { slug: "hmg_stones", display_name: "HMG Stones Studio", name: "HMG_Stones", url: "https://hmg.taruvibase.app", icon: "https://cdn.example/logo.png" },
  { slug: "hmg-studio", display_name: "HMG Stones Operations", name: "HMG-Studio", url: "https://hmg-ops.taruvibase.app", icon: null },
  { slug: "bad", display_name: "Script", url: "javascript:alert(1)", icon: null },
] };
beforeEach(() => { f.get.mockReset(); f.get.mockResolvedValue(payload); f.identity = { data: { username: "pradeep+taruvi" }, isLoading: false }; });
afterEach(cleanup);

describe("app switcher", () => {
  it("keeps only https app links and prefers display names", () => {
    expect(safeAppUrl("javascript:alert(1)")).toBeNull();
    expect(safeAppUrl("http://hmg.taruvibase.app")).toBeNull();
    expect(parseLauncherApps(payload).map(a => a.name)).toEqual(["HMG Stones Studio", "HMG Stones Operations"]);
    expect(parseLauncherApps({ data: "nope" })).toEqual([]);
  });
  it("loads the signed-in user's apps on open, marks the current one and links out", async () => {
    render(<AppSwitcher />);
    expect(f.get).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Apps" }));
    const studio = await screen.findByRole("link", { name: /HMG Stones Studio/ });
    expect(f.get).toHaveBeenCalledWith("api/users/pradeep%2Btaruvi/apps/");
    expect(studio.getAttribute("href")).toBe("https://hmg.taruvibase.app/");
    expect(screen.getByRole("link", { name: /HMG Stones Operations/ }).getAttribute("aria-current")).toBe("page");
    expect(screen.queryByText("Script")).toBeNull();
    fireEvent.change(screen.getByRole("textbox", { name: "Search for apps" }), { target: { value: "oper" } });
    expect(screen.queryByRole("link", { name: /HMG Stones Studio/ })).toBeNull();
  });
  it("says apps are unavailable when the list cannot be read", async () => {
    f.get.mockRejectedValue(new Error("denied"));
    render(<AppSwitcher />);
    fireEvent.click(screen.getByRole("button", { name: "Apps" }));
    expect(await screen.findByText("Apps are unavailable right now.")).toBeTruthy();
  });
});
