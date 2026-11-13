import type { GetListParams } from "@refinedev/core";
import type { ErpRecord } from "./erp";
import { hasCommerceAuthority, parseCommerceState } from "./commerceLedger";
import { generateOperationalReport, REPORT_DEFINITIONS, reportTimestamp, reportUuid, type ReportRequest, type ReportResult } from "./operationalReports";

type Readers = {
  read: (params: GetListParams) => Promise<{ data: ErpRecord[]; total: number }>;
  organization: (id: string) => Promise<unknown>;
  ledger: (id: string) => Promise<unknown>;
};
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);

/** Select authority afresh before each report. Never fall back after ledger activation. */
export async function generateScopedOperationalReport(request: ReportRequest, api: Readers, current: () => boolean = () => true): Promise<ReportResult> {
  const from = reportTimestamp(request.from, true), to = reportTimestamp(request.to, true);
  if (!reportUuid(request.organizationId) || !Object.hasOwn(REPORT_DEFINITIONS, request.kind) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(request.from) || !/^\d{4}-\d{2}-\d{2}$/.test(request.to) ||
      !Number.isFinite(from) || !Number.isFinite(to) || from > to || to - from > 366 * 5 * 86400000 ||
      request.currency && !/^[A-Z]{3}$/.test(request.currency) || typeof request.status !== "string" ||
      request.status.length > 60 || /[\u0000-\u001f]/.test(request.status)) throw new Error("Invalid report scope or dates.");
  const guard = () => { if (!current()) throw new Error("Report generation cancelled."); };
  guard();
  const org = await api.organization(request.organizationId); guard();
  if (!object(org) || org.id !== request.organizationId || org.is_active !== true || org.deleted_at !== null || !object(org.settings)) throw new Error("Organization authority is unavailable.");
  const authority = org.settings.stock_authority;
  if (!hasCommerceAuthority(org)) {
    if (authority != null && authority !== "legacy") throw new Error("Unknown organization stock authority.");
    const result = await generateOperationalReport(request, api.read, current); guard();
    return { ...result, warnings: ["Legacy native-record report; not a ledger projection.", ...result.warnings] };
  }
  // Payments are not part of this ledger; legacy adjustment rows are not its postings.
  if (request.kind === "order_payments" || request.kind === "stock_adjustments") {
    const result = await generateOperationalReport(request, api.read, current); guard();
    return { ...result, title: `Historical ${result.title.toLowerCase()}`, warnings: [
      "Historical native records only, not current ledger postings or payment evidence. Review current stock requests in the stock workflow and approvals screens.", ...result.warnings] };
  }
  const result = parseCommerceState(await api.ledger(request.organizationId), request.organizationId); guard();
  if (!result || result.code !== "STATE") throw new Error("Unable to verify complete ledger snapshot; no legacy fallback was used.");
  const kind = request.kind === "orders" ? "sales_order" : "purchase_order";
  const documents = Object.values(result.state.documents).filter(doc => doc.kind === kind &&
    reportTimestamp(doc.draft.order_date, true) >= from && reportTimestamp(doc.draft.order_date, true) < to + 86400000 &&
    (!request.currency || doc.draft.currency === request.currency) && (!request.status.trim() || doc.status === request.status.trim()))
    .sort((a, b) => a.id.localeCompare(b.id));
  if (documents.length > 500) throw new Error("Report exceeds 500 rows. Narrow filters.");
  const sums = new Map<string, bigint>(), groups = new Map<string, number>();
  const rows = documents.map(doc => {
    const party = kind === "sales_order"
      ? doc.draft.customer_id ? doc.snapshots.customers?.[doc.draft.customer_id]?.name : doc.draft.customer_name
      : doc.snapshots.suppliers?.[doc.draft.supplier_id ?? ""]?.name;
    sums.set(doc.draft.currency, (sums.get(doc.draft.currency) ?? 0n) + BigInt(doc.total.replace(".", "")));
    groups.set(doc.status, (groups.get(doc.status) ?? 0) + 1);
    return { number: doc.number, date: doc.draft.order_date, party: typeof party === "string" ? party : "Name unavailable", status: doc.status, currency: doc.draft.currency, total: doc.total };
  });
  guard();
  return {
    title: REPORT_DEFINITIONS[request.kind].title, rows, count: rows.length, generatedAt: new Date().toISOString(),
    columns: [{ key: "number", label: "Document" }, { key: "date", label: "Order date" },
      { key: "party", label: kind === "sales_order" ? "Customer" : "Supplier" }, { key: "status", label: "Status" },
      { key: "currency", label: "Currency" }, { key: "total", label: "Recorded total" }],
    groups: [...groups].sort(([a], [b]) => a.localeCompare(b)).map(([label, count]) => ({ label, count })),
    summaries: [...sums].sort(([a], [b]) => a.localeCompare(b)).map(([currency, amount]) => ({
      label: kind === "sales_order" ? "Recorded order totals (not payments)" : "Recorded purchase totals (not payments)",
      value: `${amount / 100n}.${String(amount % 100n).padStart(2, "0")} ${currency}` })),
    warnings: [`Complete bounded ledger snapshot at sequence ${result.state.sequence}, head ${result.state.head}. Includes the displayed document statuses; not recognized revenue or proof of payments. No legacy document totals are added.`],
  };
}
