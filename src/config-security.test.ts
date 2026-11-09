// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const environment = vi.hoisted(() => ({ logger: undefined as string | undefined }));

vi.mock("vite", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vite")>();
  return {
    ...actual,
    loadEnv: () => ({
      TARUVI_SITE_URL: "https://hmg.example.test",
      TARUVI_APP_SLUG: "hmg-studio",
      TARUVI_APP_TITLE: "HMG-Studio",
      TARUVI_API_KEY: "FAKE_SERVER_KEY_SENTINEL",
      VITE_TARUVI_API_KEY: "FAKE_LEGACY_BROWSER_KEY_SENTINEL",
      VITE_ENABLE_CLIENT_LOGGER: environment.logger,
    }),
  };
});

import viteConfig from "../vite.config";

describe("public configuration allowlist", () => {
  beforeEach(() => { environment.logger = undefined; });
  it("disables automatic VITE_* exposure, including legacy credential variables", async () => {
    if (typeof viteConfig !== "function") throw new Error("Expected Vite config factory");
    const config = await viteConfig({ command: "build", mode: "production" });
    expect(config.envPrefix).toEqual([]);
    expect(config.define).toEqual({
      __TARUVI_SITE_URL__: JSON.stringify("https://hmg.example.test"),
      __TARUVI_APP_SLUG__: JSON.stringify("hmg-studio"),
      __TARUVI_APP_TITLE__: JSON.stringify("HMG-Studio"),
      "import.meta.env.VITE_ENABLE_CLIENT_LOGGER": JSON.stringify("false"),
    });
    expect(JSON.stringify(config.define)).not.toContain("SENTINEL");
  });

  it.each(["true", "false", "", undefined])("preserves the opt-in browser logger (%s)", async (flag) => {
    environment.logger = flag;
    if (typeof viteConfig !== "function") throw new Error("Expected Vite config factory");
    const config = await viteConfig({ command: "serve", mode: "development" });
    expect(config.define?.["import.meta.env.VITE_ENABLE_CLIENT_LOGGER"])
      .toBe(JSON.stringify(flag === "true" ? "true" : "false"));
  });
});
