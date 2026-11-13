import type { ComponentProps, PropsWithChildren } from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const harness = vi.hoisted(() => ({
  check: vi.fn(),
  login: vi.fn(async () => ({ success: true })),
  nav: vi.fn(),
  settings: vi.fn(),
  refineProps: {} as Record<string, unknown>,
  accessControl: { can: vi.fn(async () => ({ can: false })) },
}));

vi.mock("@refinedev/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@refinedev/core")>();
  return {
    ...actual,
    Refine: (props: ComponentProps<typeof actual.Refine>) => {
      harness.refineProps = props as Record<string, unknown>;
      return <actual.Refine {...props} options={{ ...props.options, disableTelemetry: true }} />;
    },
  };
});
vi.mock("./components/ErpWorkspaceHeader", () => ({
  ErpWorkspaceHeader: () => { harness.nav(); return <nav aria-label="HMG account navigation" />; },
}));
vi.mock("./components/sidenav/MuiSidenav", () => ({ ERP_SIDEBAR_WIDTH:220 }));
vi.mock("./contexts/app-settings", () => ({
  AppSettingsProvider: ({ children }: PropsWithChildren) => {
    harness.settings();
    return children;
  },
  useAppSettings: () => ({ settings: { displayName: "HMG-Studio" } }),
}));
vi.mock("./taruviClient", () => ({ taruviClient: {} }));
vi.mock("./providers/refineProviders", () => ({
  taruviDataProvider: { getApiUrl: () => "https://hmg.example.test" },
  taruviStorageProvider: { getApiUrl: () => "https://hmg.example.test" },
  taruviAppProvider: { getApiUrl: () => "https://hmg.example.test" },
  taruviUserProvider: { getApiUrl: () => "https://hmg.example.test" },
  taruviAuthProvider: {
    check: harness.check,
    login: harness.login,
    logout: async () => ({ success: true }),
    onError: async (error: unknown) => ({ error }),
    getIdentity: async () => null,
  },
  taruviAccessControlProvider: harness.accessControl,
}));
vi.mock("@refinedev/kbar", () => ({
  RefineKbar: () => null,
  RefineKbarProvider: ({ children }: PropsWithChildren) => children,
}));
// Layout/snackbar internals are outside this test; keep Refine and its actual
// asynchronous Authenticated guard real while avoiding MUI's Node ESM loader.
vi.mock("@refinedev/mui", () => ({
  ErrorComponent: () => <div>Unknown route</div>,
  RefineSnackbarProvider: ({ children }: PropsWithChildren) => children,
  ThemedLayout: ({ children }: PropsWithChildren) => children,
  useNotificationProvider: () => ({ open: vi.fn(), close: vi.fn() }),
}));
vi.mock("./components", () => ({
  CustomSider: () => null,
  ErrorBoundary: ({ children }: PropsWithChildren) => children,
  UnsavedChangesDialog: () => null,
}));
vi.mock("./pages/home", () => ({ Home: () => <h1>Protected home route</h1> }));
vi.mock("./pages/account", () => ({ AccountPreferences: () => <h1>Account preferences route</h1> }));
vi.mock("./pages/categories", () => ({ Categories: () => <h1>Categories route</h1> }));

vi.mock("./pages/erp", () => ({ErpModulePage: ({moduleKey}:{moduleKey:string}) => <h1>{moduleKey} route</h1>}));

import App from "./App";

describe("authenticated application shell", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
    harness.check.mockResolvedValue({ authenticated: false, redirectTo: "/login" });
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
    });
  });

  afterEach(cleanup);

  it.each(["/", "/login"])(
    "does not mount protected navigation/settings before login at %s",
    async (path) => {
      window.history.replaceState(null, "", path);
      render(<App />);
      await screen.findByText("Redirecting to login...");
      expect(harness.nav).not.toHaveBeenCalled();
      expect(harness.settings).not.toHaveBeenCalled();
      expect(screen.queryByRole("heading", { name: "Protected home route" })).toBeNull();
    },
  );

  it("keeps the protected shell unmounted while the real auth check is pending", async () => {
    harness.check.mockReturnValue(new Promise(() => {}));
    render(<App />);
    await waitFor(() => expect(harness.check).toHaveBeenCalled());
    expect(screen.getByRole("status", { name: "Checking session" })).toBeTruthy();
    expect(harness.nav).not.toHaveBeenCalled();
    expect(harness.settings).not.toHaveBeenCalled();
    expect(harness.login).not.toHaveBeenCalled();
  });

  it("mounts the shared shell only after the native auth provider accepts the session", async () => {
    harness.check.mockResolvedValue({ authenticated: true });
    render(<App />);
    await screen.findByRole("heading", { name: "Protected home route" });
    expect(screen.getByRole("navigation", { name: "HMG account navigation" })).toBeTruthy();
    expect(harness.settings).toHaveBeenCalled();
  });

  it("wires the existing access-control provider, not a parallel permission system", () => {
    render(<App />);
    expect(harness.refineProps.accessControlProvider).toBe(harness.accessControl);
  });

  it("registers account preferences under the authenticated shell", async () => {
    window.history.replaceState(null, "", "/settings/account");
    harness.check.mockResolvedValue({ authenticated: true });
    render(<App />);
    await screen.findByRole("heading", { name: "Account preferences route" });
  });

  it("registers the verified category resource and authenticated route", async () => {
    window.history.replaceState(null, "", "/categories");
    harness.check.mockResolvedValue({ authenticated: true });
    render(<App />);
    await screen.findByRole("heading", { name: "Categories route" });
    expect(harness.refineProps.resources).toEqual(expect.arrayContaining([expect.objectContaining({ name: "product_categories", list: "/categories" })]));
  });
});
