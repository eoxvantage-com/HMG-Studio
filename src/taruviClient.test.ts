import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("browser session configuration", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal("__TARUVI_SITE_URL__", "https://hmg.example.test");
    vi.stubGlobal("__TARUVI_APP_SLUG__", "hmg-studio");
    vi.stubGlobal("__TARUVI_API_KEY__", "FAKE_TEST_SERVER_ONLY_KEY");
    vi.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => vi.unstubAllGlobals());

  it("uses the user's session and never passes a server key to the SDK", async () => {
    const { taruviClient } = await import("./taruviClient");
    expect(taruviClient.getConfig()).toMatchObject({
      apiUrl: "https://hmg.example.test",
      appSlug: "hmg-studio",
      authMode: "session",
    });
    expect(taruviClient.getConfig()).not.toHaveProperty("apiKey");
  });

  it("can initialize hosted sign-in without any API key", async () => {
    vi.stubGlobal("__TARUVI_API_KEY__", undefined);
    await expect(import("./taruviClient")).resolves.toHaveProperty("taruviClient");
  });

  it.each(["__TARUVI_SITE_URL__", "__TARUVI_APP_SLUG__"])(
    "rejects missing public configuration: %s",
    async (name) => {
      vi.stubGlobal(name, "");
      await expect(import("./taruviClient")).rejects.toThrow(
        "Missing required environment variable",
      );
    },
  );

  it("does not inject or declare server credentials in the browser source", () => {
    for (const path of ["vite.config.ts", "src/vite-env.d.ts", "src/taruviClient.ts"]) {
      expect(readFileSync(path, "utf8").includes("__TARUVI_API_KEY__"), path).toBe(false);
    }
  });
});
