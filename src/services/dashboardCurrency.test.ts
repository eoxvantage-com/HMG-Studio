import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const now = Date.parse("2026-11-07T12:00:00Z");
const valid = { date: "2026-11-06", base: "INR", quote: "USD", rate: 0.010647 };
const fetchRate = vi.fn();
const response = (value: unknown) => new Response(JSON.stringify(value), { status: 200 });

describe("public dashboard reference rates", () => {
  beforeEach(() => { vi.resetModules(); vi.useFakeTimers(); vi.setSystemTime(now); vi.stubGlobal("fetch", fetchRate); fetchRate.mockReset(); });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
  it("sends only the fixed public currency pair without credentials or referrer and caches briefly", async () => {
    const { getDashboardRate } = await import("./dashboardCurrency");
    fetchRate.mockResolvedValueOnce(response(valid)).mockResolvedValueOnce(response(valid));
    expect(await getDashboardRate("USD")).toMatchObject(valid);
    expect(fetchRate).toHaveBeenCalledWith("https://api.frankfurter.dev/v2/rate/INR/USD?providers=ecb", expect.objectContaining({ credentials: "omit", referrerPolicy: "no-referrer", redirect: "error", mode: "cors", cache: "no-store", signal: expect.any(AbortSignal) }));
    expect(fetchRate.mock.calls[0][1].headers).toEqual({ Accept: "application/json" });
    await getDashboardRate("USD"); expect(fetchRate).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(300_001); await getDashboardRate("USD"); expect(fetchRate).toHaveBeenCalledTimes(2);
  });
  it.each([
    { ...valid, base: "USD" }, { ...valid, quote: "EUR" }, { ...valid, rate: 0 },
    { ...valid, rate: -1 }, { ...valid, rate: "0.01" }, { ...valid, rate: true },
    { ...valid, rate: null }, { ...valid, date: "2026-10-30" },
    { ...valid, date: "2026-11-08" }, { ...valid, date: "2026-02-30" },
    { ...valid, date: "2026-11-06T00:00:00Z" }, null,
  ])("rejects malformed, mismatched, stale or future rates (%j)", async value => {
    const { getDashboardRate } = await import("./dashboardCurrency");
    fetchRate.mockResolvedValueOnce(response(value));
    await expect(getDashboardRate("USD")).rejects.toThrow();
  });
  it("rejects unsupported targets before making any request", async () => {
    const { getDashboardRate } = await import("./dashboardCurrency");
    await expect(getDashboardRate("https://evil.test" as "USD")).rejects.toThrow();
    expect(fetchRate).not.toHaveBeenCalled();
  });
  it("accepts exactly seven calendar days but rechecks cached freshness after midnight", async () => {
    const { getDashboardRate } = await import("./dashboardCurrency");
    vi.setSystemTime(Date.parse("2026-11-07T23:59:59Z"));
    fetchRate.mockImplementation(() => Promise.resolve(response({ ...valid, date: "2026-10-31" })));
    await getDashboardRate("USD");
    vi.setSystemTime(Date.parse("2026-11-08T00:00:01Z"));
    await expect(getDashboardRate("USD")).rejects.toThrow();
    expect(fetchRate).toHaveBeenCalledTimes(2);
  });
  it("aborts a slow request at the bounded timeout", async () => {
    const { getDashboardRate } = await import("./dashboardCurrency");
    fetchRate.mockImplementation((_url, options) => new Promise((_resolve, reject) => options.signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")))));
    const request = getDashboardRate("USD"); const rejection = expect(request).rejects.toThrow();
    await vi.advanceTimersByTimeAsync(8000); await rejection;
    expect(fetchRate.mock.calls[0][1].signal.aborted).toBe(true);
  });
  it("propagates cancellation and never caches a response that arrived after cancellation", async () => {
    const { getDashboardRate } = await import("./dashboardCurrency");
    let resolve!: (value: Response) => void;
    fetchRate.mockImplementationOnce(() => new Promise<Response>(r => { resolve = r; })).mockResolvedValueOnce(response(valid));
    const controller = new AbortController(); const first = getDashboardRate("USD", controller.signal);
    controller.abort(); resolve(response(valid)); await expect(first).rejects.toThrow();
    await getDashboardRate("USD"); expect(fetchRate).toHaveBeenCalledTimes(2);
  });
  it("rejects HTTP errors, oversized responses and invalid JSON without caching them", async () => {
    const { getDashboardRate } = await import("./dashboardCurrency");
    fetchRate.mockResolvedValueOnce(new Response("Denied", { status: 503 })).mockResolvedValueOnce(new Response("x".repeat(5000))).mockResolvedValueOnce(new Response("not json")).mockResolvedValueOnce(response(valid));
    for (let i=0;i<3;i++) await expect(getDashboardRate("USD")).rejects.toThrow();
    await expect(getDashboardRate("USD")).resolves.toMatchObject(valid);
  });
});
