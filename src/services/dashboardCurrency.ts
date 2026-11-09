/** Public reference data only. Never pass this request through the authenticated SDK. */
export type DashboardCurrency = "INR" | "USD" | "EUR";
export type DashboardRate = { date: string; base: "INR"; quote: "USD" | "EUR"; rate: number };
const DAY = 86_400_000;
const CACHE_MS = 300_000;
const cache = new Map<string, { value: DashboardRate; at: number }>();

function validRate(value: unknown, target: string, now: number): value is DashboardRate {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const r = value as Record<string, unknown>;
  if (r.base !== "INR" || r.quote !== target || typeof r.rate !== "number" || !Number.isFinite(r.rate) || r.rate <= 0 || typeof r.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(r.date)) return false;
  const time = Date.parse(`${r.date}T00:00:00Z`);
  const today = Math.floor(now / DAY) * DAY;
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === r.date && time <= today && today - time <= 7 * DAY;
}

export async function getDashboardRate(target: "USD" | "EUR", signal?: AbortSignal): Promise<DashboardRate> {
  if (target !== "USD" && target !== "EUR") throw new Error("Unsupported display currency");
  if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
  const cached = cache.get(target); const now = Date.now();
  if (cached && now >= cached.at && now - cached.at < CACHE_MS && validRate(cached.value, target, now)) return cached.value;
  cache.delete(target);
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  const timeout = setTimeout(abort, 8000);
  try {
    const response = await fetch(`https://api.frankfurter.dev/v2/rate/INR/${target}?providers=ecb`, {
      method: "GET", mode: "cors", credentials: "omit", referrerPolicy: "no-referrer",
      redirect: "error", cache: "no-store", headers: { Accept: "application/json" }, signal: controller.signal,
    });
    if (controller.signal.aborted) throw new DOMException("Cancelled", "AbortError");
    if (!response.ok || !response.body) throw new Error("Reference rate unavailable");
    const reader = response.body.getReader(); const chunks: Uint8Array[] = []; let size = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 4096) { await reader.cancel(); throw new Error("Invalid reference rate response"); }
        chunks.push(value);
      }
    } finally { reader.releaseLock(); }
    if (controller.signal.aborted) throw new DOMException("Cancelled", "AbortError");
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    const value: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!validRate(value, target, Date.now())) throw new Error("Invalid or outdated reference rate");
    const rate = Object.freeze({ date: value.date, base: value.base, quote: value.quote, rate: value.rate });
    cache.set(target, { value: rate, at: Date.now() });
    return rate;
  } finally { clearTimeout(timeout); signal?.removeEventListener("abort", abort); }
}
