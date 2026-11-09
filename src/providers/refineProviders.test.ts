import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("native session auth provider contract", () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    vi.stubGlobal("__TARUVI_SITE_URL__", "https://hmg.example.test");
    vi.stubGlobal("__TARUVI_APP_SLUG__", "hmg-studio");
    vi.spyOn(console, "info").mockImplementation(() => {});
  });
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("denies an absent session without sending a protected API request", async () => {
    const { taruviClient } = await import("../taruviClient");
    const request = vi.spyOn(taruviClient.httpClient, "get");
    const { taruviAuthProvider } = await import("./refineProviders");
    expect(await taruviAuthProvider.check()).toMatchObject({ authenticated: false });
    expect(request).not.toHaveBeenCalled();
  });

  it("does not trust a present but server-rejected session", async () => {
    const { taruviClient } = await import("../taruviClient");
    taruviClient.tokenClient.setAccessToken("FAKE_TEST_SESSION");
    vi.spyOn(taruviClient.httpClient, "get").mockRejectedValue({ statusCode: 401 });
    const { taruviAuthProvider } = await import("./refineProviders");
    expect(await taruviAuthProvider.check()).toMatchObject({ authenticated: false });
  });

  it("accepts a session only after server validation", async () => {
    const { taruviClient } = await import("../taruviClient");
    taruviClient.tokenClient.setAccessToken("FAKE_TEST_SESSION");
    const request = vi.spyOn(taruviClient.httpClient, "get").mockResolvedValue({ status: "success" });
    const { taruviAuthProvider } = await import("./refineProviders");
    expect(await taruviAuthProvider.check()).toEqual({ authenticated: true });
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("preserves the session on 403 instead of redirecting or logging out", async () => {
    const { taruviClient } = await import("../taruviClient");
    taruviClient.tokenClient.setAccessToken("FAKE_TEST_SESSION");
    const { taruviAuthProvider } = await import("./refineProviders");
    const error = { statusCode: 403, message: "Forbidden" };
    const url = window.location.href;
    const result = await taruviAuthProvider.onError(error);
    expect(result).toEqual({ error });
    expect(taruviClient.tokenClient.isAuthenticated()).toBe(true);
    expect(window.location.href).toBe(url);
  });

  it("sends only the session credential through the real SDK request interceptor", async () => {
    const { default: axios } = await import("axios");
    const create = axios.create.bind(axios);
    const sent: Array<Record<string, unknown>> = [];
    vi.spyOn(axios, "create").mockImplementation((config) => {
      const instance = create(config);
      instance.defaults.adapter = async (request) => {
        sent.push(request.headers.toJSON());
        return { data: { status: "success" }, status: 200, statusText: "OK", headers: {}, config: request };
      };
      return instance;
    });
    const { taruviClient } = await import("../taruviClient");
    taruviClient.tokenClient.setAccessToken("FAKE_TEST_SESSION");
    const { taruviAuthProvider } = await import("./refineProviders");
    expect(await taruviAuthProvider.check()).toEqual({ authenticated: true });
    expect(sent).toHaveLength(1);
    expect(sent[0]["X-Session-Token"]).toBe("FAKE_TEST_SESSION");
    expect(Object.keys(sent[0]).map((key) => key.toLowerCase())).not.toContain("authorization");
  });
});
