/** Strictly validated operational analysis returned by hmg-dashboard-v1. Nothing here is computed client-side. */
export type SegmentStatus = "good" | "watch" | "risk" | "none";
export type MetricKind = "count" | "money" | "percent" | "days";
export type AnalysisMetric = { label: string; kind: MetricKind; value: string | null };
export type AnalysisSegment = { key: string; label: string; value: AnalysisMetric; caption: string; status: SegmentStatus; link: string; metrics: AnalysisMetric[] };
export type AlertSeverity = "critical" | "warning" | "info";
export type AnalysisAlert = { severity: AlertSeverity; kind: string; title: string; detail: string; link: string; age_days: number };
export type LateOrder = { id: string; organization_id: string; number: string; customer: string; age_days: number; total: string };
export type Analysis = {
  targets: { delivery_days: number; approval_days: number; return_days: number };
  status: SegmentStatus;
  segments: AnalysisSegment[];
  alerts: AnalysisAlert[];
  alert_counts: Record<AlertSeverity, number>;
  trend: { month: string; revenue: string; orders: number; units_shipped: number; units_returned: number; avg_delivery_days?: string | null }[];
  delivery: { samples: number; excluded: number; sources?: { recorded: number; backfill: number; ledger: number }; average_days: string | null; median_days: string | null; on_time_rate: string | null; buckets: { label: string; count: number }[]; late: LateOrder[] };
  top_products: { id: string; name: string; units: number; revenue: string }[];
  shortfalls: { id: string; name: string; needed: number; free: number }[];
  capacity: { used: number; max: number } | null;
  basis: string;
};

const STATUSES: SegmentStatus[] = ["good", "watch", "risk", "none"];
const KINDS: MetricKind[] = ["count", "money", "percent", "days"];
const SEVERITIES: AlertSeverity[] = ["critical", "warning", "info"];
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const text = (v: unknown): v is string => typeof v === "string";
const count = (v: unknown): v is number => typeof v === "number" && Number.isSafeInteger(v) && v >= 0;
const numeric = (v: unknown) => text(v) && /^-?\d+(\.\d+)?$/.test(v);
const list = <T,>(v: unknown, check: (r: Record<string, unknown>) => boolean): v is T[] => Array.isArray(v) && v.every(r => record(r) && check(r));
const internal = (v: unknown) => text(v) && v.startsWith("/") && !v.startsWith("//");
const metric = (m: unknown) => record(m) && text(m.label) && KINDS.includes(m.kind as MetricKind) && (m.value === null || numeric(m.value));

export function parseAnalysis(value: unknown): Analysis | null {
  if (!record(value) || !record(value.targets) || !STATUSES.includes(value.status as SegmentStatus) || !text(value.basis)) return null;
  const t = value.targets;
  if (![t.delivery_days, t.approval_days, t.return_days].every(count)) return null;
  if (!list(value.segments, s => text(s.key) && text(s.label) && metric(s.value) && text(s.caption) && STATUSES.includes(s.status as SegmentStatus) && internal(s.link) && Array.isArray(s.metrics) && s.metrics.every(metric))) return null;
  if ((value.segments as unknown[]).length !== 8) return null;
  if (!list(value.alerts, a => SEVERITIES.includes(a.severity as AlertSeverity) && text(a.kind) && text(a.title) && text(a.detail) && internal(a.link) && count(a.age_days))) return null;
  if (!record(value.alert_counts) || !SEVERITIES.every(k => count((value.alert_counts as Record<string, unknown>)[k]))) return null;
  if (!list(value.trend, r => text(r.month) && /^\d{4}-(0[1-9]|1[0-2])$/.test(r.month) && numeric(r.revenue) && count(r.orders) && count(r.units_shipped) && count(r.units_returned) && (r.avg_delivery_days === undefined || r.avg_delivery_days === null || numeric(r.avg_delivery_days)))) return null;
  const d = value.delivery;
  if (!record(d) || !count(d.samples) || !count(d.excluded) || ![d.average_days, d.median_days, d.on_time_rate].every(x => x === null || numeric(x))) return null;
  if (d.sources !== undefined && (!record(d.sources) || !count(d.sources.recorded) || !count(d.sources.backfill) || !count(d.sources.ledger))) return null;
  if (!list(d.buckets, b => text(b.label) && count(b.count))) return null;
  if (!list(d.late, o => text(o.id) && text(o.organization_id) && text(o.number) && text(o.customer) && count(o.age_days) && numeric(o.total))) return null;
  if (!list(value.top_products, p => text(p.id) && text(p.name) && count(p.units) && numeric(p.revenue))) return null;
  if (!list(value.shortfalls, p => text(p.id) && text(p.name) && count(p.needed) && count(p.free))) return null;
  if (value.capacity !== null && (!record(value.capacity) || !count(value.capacity.used) || !count(value.capacity.max))) return null;
  return value as unknown as Analysis;
}

export const STATUS_TEXT: Record<SegmentStatus, string> = { good: "Healthy", watch: "Needs attention", risk: "At risk", none: "No data yet" };
export const STATUS_CHIP: Record<SegmentStatus, "success" | "warning" | "error" | "default"> = { good: "success", watch: "warning", risk: "error", none: "default" };
export const SEVERITY_TEXT: Record<AlertSeverity, string> = { critical: "Critical", warning: "Warning", info: "Info" };
export const SEVERITY_CHIP: Record<AlertSeverity, "error" | "warning" | "info"> = { critical: "error", warning: "warning", info: "info" };

/** Display a server metric. Missing values say so instead of showing zero. */
export function formatMetric(m: AnalysisMetric, money: (value: string, compact?: boolean) => string, compact = false): string {
  if (m.value === null) return "Not available";
  if (m.kind === "money") return money(m.value, compact);
  if (m.kind === "percent") return `${m.value}%`;
  if (m.kind === "days") return `${m.value} ${m.value === "1" || m.value === "1.0" ? "day" : "days"}`;
  return Number(m.value).toLocaleString("en-IN");
}
