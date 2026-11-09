import type { CrudFilters, GetListParams } from "@refinedev/core";
import { fieldLabel, getErpResource, type ErpRecord } from "./erp";
import { presentationValue } from "./erpPresentation";
import type { ExportColumn } from "./recordExport";

export const REPORT_DEFINITIONS = {
  orders: { title: "Sales orders", date: "order_date", dateOnly: false, group: "status", columns: ["order_number", "order_date", "customer_name", "status", "currency", "total", "amount_paid", "payment_status"] },
  purchase_orders: { title: "Purchase orders", date: "order_date", dateOnly: true, group: "status", columns: ["po_number", "order_date", "expected_date", "received_date", "supplier_id", "status", "currency", "total"] },
  order_payments: { title: "Customer payments", date: "paid_at", dateOnly: false, group: "type", columns: ["paid_at", "order_id", "type", "amount", "currency", "method", "reference", "voided_at"] },
  stock_adjustments: { title: "Stock adjustments", date: "created_at", dateOnly: false, group: "type", columns: ["created_at", "product_id", "location_id", "type", "quantity_before", "adjustment_quantity", "quantity_after", "reason"] },
} as const;
export type ReportKind = keyof typeof REPORT_DEFINITIONS;
export type ReportRequest = { kind: ReportKind; organizationId: string; from: string; to: string; currency: string; status: string };
export type ReportResult = { title: string; columns: ExportColumn[]; rows: Record<string, string>[]; count: number; generatedAt: string; groups: { label: string; count: number }[]; summaries: { label: string; value: string }[]; warnings: string[] };
type Read = (params: GetListParams) => Promise<{ data: ErpRecord[]; total: number }>;
export const reportUuid = (value: unknown): value is string => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
const currencyCode = (value: unknown): value is string => typeof value === "string" && /^[A-Z]{3}$/.test(value);
function day(value: string) {
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00.000Z`) : new Date(NaN);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) throw new Error("Choose valid report dates.");
  return parsed;
}
/** Native date-only and timezone-less datetimes have explicit UTC semantics, never browser-local time. */
export function reportTimestamp(value: unknown, dateOnly = false): number {
  if (typeof value !== "string") return NaN;
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return day(value).getTime();
    if (dateOnly) return NaN;
    const match = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2}):(\d{2})(\.\d{1,6})?(Z|[+-]\d{2}:\d{2})?$/.exec(value);
    if (!match || Number(match[2]) > 23 || Number(match[3]) > 59 || Number(match[4]) > 59) return NaN;
    day(match[1]);
    if (match[6] && match[6] !== "Z" && (Number(match[6].slice(1, 3)) > 23 || Number(match[6].slice(4)) > 59)) return NaN;
    return Date.parse(`${match[1]}T${match[2]}:${match[3]}:${match[4]}${match[5] ?? ""}${match[6] ?? "Z"}`);
  } catch { return NaN; }
}
function cents(value: unknown): bigint | null {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "number" && (!Number.isFinite(value) || !Number.isSafeInteger(Math.round(value * 100)))) return null;
  const text = String(value);
  if (!/^-?\d{1,14}(?:\.\d{1,2})?$/.test(text)) return null;
  const [whole, fraction = ""] = text.replace(/^-/, "").split(".");
  return (BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"))) * (text.startsWith("-") ? -1n : 1n);
}
function decimal(value: bigint) { const positive = value < 0n ? -value : value; return `${value < 0n ? "-" : ""}${positive / 100n}.${String(positive % 100n).padStart(2, "0")}`; }

/** No writes; caller provider retains native authorization. Completeness is bounded, not transactional isolation. */
export async function generateOperationalReport(request: ReportRequest, read: Read, current: () => boolean = () => true): Promise<ReportResult> {
  const definition = Object.hasOwn(REPORT_DEFINITIONS, request.kind) ? REPORT_DEFINITIONS[request.kind] : undefined;
  if (!definition || !reportUuid(request.organizationId) || request.currency && !currencyCode(request.currency) || typeof request.status !== "string" || request.status.length > 60 || /[\u0000-\u001f]/.test(request.status)) throw new Error("Invalid report scope.");
  if (["order_payments", "stock_adjustments"].includes(request.kind) && request.currency) throw new Error("Currency is not a direct filter for this report type.");
  const from = day(request.from); const to = day(request.to); const end = new Date(to.getTime() + 86400000);
  if (from > to || to.getTime() - from.getTime() > 366 * 5 * 86400000) throw new Error("Choose a report period of at most five years.");
  const guard = () => { if (!current()) throw new Error("Report generation cancelled."); };
  const scope: CrudFilters = [{ field: "organization_id", operator: "eq", value: request.organizationId }];
  const filters: CrudFilters = [...scope, { field: definition.date, operator: "gte", value: definition.dateOnly ? request.from : from.toISOString() }, { field: definition.date, operator: "lt", value: definition.dateOnly ? end.toISOString().slice(0, 10) : end.toISOString() }];
  if (request.currency) filters.push({ field: "currency", operator: "eq", value: request.currency });
  if (request.status.trim()) filters.push({ field: definition.group, operator: "eq", value: request.status.trim() });
  if (request.kind === "orders" || request.kind === "purchase_orders") filters.push({ field: "deleted_at", operator: "null", value: true });
  async function complete(resource: string, queryFilters: CrudFilters, accept: (row: ErpRecord) => boolean) {
    let expected: number | undefined; let last = "";
    const collected: ErpRecord[] = [];
    for (let page = 1; page <= 6; page++) {
      guard();
      let response: Awaited<ReturnType<Read>>;
      try { response = await read({ resource, filters: queryFilters, sorters: [{ field: "id", order: "asc" }], pagination: { mode: "server", currentPage: page, pageSize: 100 } }); }
      catch { guard(); throw new Error("Authorized data could not be read. Check access and try again."); }
      guard();
      if (!Array.isArray(response.data) || !Number.isSafeInteger(response.total) || response.total < 0 || response.total > 500 || response.data.length > 100 || expected !== undefined && response.total !== expected) throw new Error("Report exceeds 500 rows or its complete scope could not be verified. Narrow filters and generate again.");
      expected = response.total;
      for (const row of response.data) {
        if (!row || !reportUuid(row.id) || !reportUuid(row.organization_id) || row.organization_id.toLowerCase() !== request.organizationId.toLowerCase() || row.id.toLowerCase() <= last || !accept(row)) throw new Error("Report returned duplicate, unordered or out-of-scope records.");
        last = row.id.toLowerCase(); collected.push(row);
        if (collected.length > expected) throw new Error("Report row count changed during generation.");
      }
      if (response.data.length < 100) {
        if (collected.length !== expected) throw new Error("Report is incomplete. No partial result was published.");
        return collected;
      }
    }
    throw new Error("Report completeness could not be verified.");
  }
  const raw = await complete(request.kind, filters, row => {
    const timestamp = reportTimestamp(row[definition.date], definition.dateOnly);
    return Number.isFinite(timestamp) && timestamp >= from.getTime() && timestamp < end.getTime() && (!request.currency || row.currency === request.currency) && (!request.status.trim() || row[definition.group] === request.status.trim()) && (!(request.kind === "orders" || request.kind === "purchase_orders") || row.deleted_at === null);
  });
  const currencies = new Map<string, string>();
  const names = new Map<string, string>();
  const warnings: string[] = [];
  // One bounded batch per <=100 authorized order references. No table-wide order scan.
  if (request.kind === "order_payments") {
    const ids = [...new Set(raw.map(row => row.order_id).filter(reportUuid).map(id => id.toLowerCase()))].sort();
    for (let start = 0; start < ids.length; start += 100) {
      const batch = ids.slice(start, start + 100); const wanted = new Set(batch);
      const orders = await complete("orders", [...scope, { field: "id", operator: "in", value: batch }, { field: "deleted_at", operator: "null", value: true }], row => wanted.has(row.id.toLowerCase()) && row.deleted_at === null);
      for (const row of orders) {
        if (currencyCode(row.currency)) currencies.set(row.id.toLowerCase(), row.currency);
        if (typeof row.order_number === "string" && row.order_number.trim()) names.set(row.id.toLowerCase(), row.order_number);
      }
    }
  }
  const references = request.kind === "purchase_orders" ? [{ field: "supplier_id", resource: "suppliers" }] : request.kind === "stock_adjustments" ? [{ field: "product_id", resource: "products" }, { field: "location_id", resource: "product_locations" }] : [];
  for (const reference of references) {
    const ids = [...new Set(raw.map(row => row[reference.field]).filter(reportUuid).map(id => id.toLowerCase()))].sort();
    for (let start = 0; start < ids.length; start += 100) {
      const batch = ids.slice(start, start + 100); const wanted = new Set(batch);
      const target = getErpResource(reference.resource);
      const lookup: CrudFilters = [...scope, { field: "id", operator: "in", value: batch }];
      if (target?.schema.fields.some(field => field.name === "deleted_at")) lookup.push({ field: "deleted_at", operator: "null", value: true });
      const records = await complete(reference.resource, lookup, row => wanted.has(row.id.toLowerCase()) && (!target?.schema.fields.some(field => field.name === "deleted_at") || row.deleted_at === null));
      for (const row of records) if (typeof row.name === "string" && row.name.trim()) names.set(`${reference.field}:${row.id.toLowerCase()}`, row.name);
    }
  }
  const currencyFor = (row: ErpRecord) => request.kind === "order_payments" ? currencies.get(String(row.order_id).toLowerCase()) : currencyCode(row.currency) ? row.currency : undefined;
  const resource = getErpResource(request.kind);
  if (!resource?.liveVerified) throw new Error("Report schema is unavailable.");
  const columns = definition.columns.map(key => ({ key, label: key === "currency" ? "Currency" : key === "voided_at" ? "Void state / date" : fieldLabel(key) }));
  let characters = 0;
  const rows = raw.map(row => Object.fromEntries(columns.map(column => {
    const field = resource.schema.fields.find(item => item.name === column.key) ?? { name: column.key, type: "string" };
    const code = currencyFor(row);
    let value = column.key === "currency" ? code ?? "Currency unavailable" : presentationValue(resource, field, row[column.key], { currency: code, referenceLabel: (key, id) => key === "order_id" ? names.get(String(id).toLowerCase()) ?? "Order unavailable" : names.get(`${key}:${String(id).toLowerCase()}`) ?? "Name unavailable" });
    if (["total", "amount_paid", "amount"].includes(column.key)) {
      const amount = cents(row[column.key]); value = amount === null ? "Not available" : `${decimal(amount)} ${code ?? "(currency unavailable)"}`;
    } else if (column.key === "voided_at") {
      const timestamp = reportTimestamp(row.voided_at);
      value = row.voided_at === null ? "Not voided" : Number.isFinite(timestamp) ? `Voided ${new Date(timestamp).toISOString()}` : "Void state unavailable";
    } else if (["date", "datetime"].includes(field.type)) {
      const timestamp = reportTimestamp(row[column.key], field.type === "date");
      value = Number.isFinite(timestamp) ? presentationValue(resource, field, new Date(timestamp).toISOString()) : "Not available";
    }
    if (value.length > 20_000 || (characters += value.length) > 2_000_000) throw new Error("Report display is too large. Narrow the filters.");
    return [column.key, value];
  })));
  const groups = new Map<string, number>();
  for (const row of raw) {
    const value = typeof row[definition.group] === "string" && (row[definition.group] as string).trim() ? fieldLabel(String(row[definition.group]).slice(0, 120)) : "Not recorded";
    groups.set(value, (groups.get(value) ?? 0) + 1);
  }
  const summaries: ReportResult["summaries"] = [];
  const moneyFields = request.kind === "orders" ? ["total", "amount_paid"] : request.kind === "purchase_orders" ? ["total"] : request.kind === "order_payments" ? ["amount"] : [];
  for (const field of moneyFields) {
    const sums = new Map<string, bigint>(); let valid = true;
    for (const row of raw) {
      if (request.kind === "order_payments" && row.voided_at !== null) continue;
      const code = currencyFor(row); const amount = cents(row[field]);
      if (!code || amount === null || request.kind === "order_payments" && (typeof row.type !== "string" || !row.type.trim())) { valid = false; break; }
      const key = JSON.stringify([code, request.kind === "order_payments" ? String(row.type).slice(0, 60) : ""]);
      sums.set(key, (sums.get(key) ?? 0n) + amount);
    }
    if (!valid) { warnings.push(`Amount summary unavailable for ${fieldLabel(field)}: a currency or exact monetary value is missing.`); continue; }
    for (const [key, value] of sums) {
      const [code, type] = JSON.parse(key) as [string, string];
      const label = request.kind === "order_payments" ? `Recorded non-voided ${type} amounts` : field === "amount_paid" ? "Recorded amounts paid" : request.kind === "orders" ? "Recorded order totals" : "Recorded purchase totals";
      summaries.push({ label, value: `${decimal(value)} ${code}` });
    }
  }
  if (request.kind === "order_payments" && raw.some(row => row.voided_at !== null)) warnings.push("Voided records and unavailable void states are excluded from non-voided amount summaries; all returned records remain in the table.");
  guard();
  return { title: definition.title, columns, rows, count: raw.length, generatedAt: new Date().toISOString(), groups: [...groups].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)), summaries, warnings };
}
