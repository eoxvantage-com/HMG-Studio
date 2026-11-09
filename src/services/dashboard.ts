/** Validate the complete read-only projection before formatting or rendering it. */
export type Dashboard = {
  ok: true; currency: string; generated_at: string; product_count: number; category_count: number; location_count: number;
  inventory_value: string; pending_orders: number; order_count: number; revenue_month: string; receivables: string;
  stock_by_category: { name: string; value: string }[];
  low_stock: { id: string; name: string; sku: string; stock: string; minimum: string }[]; low_stock_count: number;
  recent_orders: { id: string; order_number: string; customer_name: string | null; status: string; order_date: string | null; total: string; currency: string }[];
  recent_products: { id: string; sku: string; name: string; stock: number; selling_price: string | null; currency: string }[];
  scope?: string; limitations?: string[];
};
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const text = (v: unknown): v is string => typeof v === "string";
const numeric = (v: unknown) => (typeof v === "string" || typeof v === "number") && /^-?\d+(\.\d+)?$/.test(String(v)) && Number.isFinite(Number(v));
const count = (v: unknown) => typeof v === "number" && Number.isSafeInteger(v) && v >= 0;
const date = (v: unknown) => text(v) && Number.isFinite(Date.parse(v));
const rows = (v: unknown, check: (r: Record<string, unknown>) => boolean) => Array.isArray(v) && v.every(r => record(r) && check(r));
export function parseDashboard(value: unknown): Dashboard | null {
  if (!record(value) || value.ok !== true || !text(value.currency) || !/^[A-Z]{3}$/.test(value.currency) || !date(value.generated_at)) return null;
  if (!["product_count", "category_count", "location_count", "pending_orders", "order_count", "low_stock_count"].every(k => count(value[k]))) return null;
  if (!["inventory_value", "revenue_month", "receivables"].every(k => text(value[k]) && numeric(value[k]))) return null;
  if (!rows(value.stock_by_category, r => text(r.name) && text(r.value) && numeric(r.value))) return null;
  if (!rows(value.low_stock, r => text(r.id) && !!r.id && text(r.name) && text(r.sku) && numeric(r.stock) && numeric(r.minimum))) return null;
  if (!rows(value.recent_orders, r => text(r.id) && !!r.id && text(r.order_number) && (r.customer_name == null || text(r.customer_name)) && text(r.status) && (r.order_date == null || date(r.order_date)) && numeric(r.total) && r.currency === value.currency)) return null;
  if (!rows(value.recent_products, r => text(r.id) && !!r.id && text(r.sku) && text(r.name) && numeric(r.stock) && (r.selling_price == null || numeric(r.selling_price)) && r.currency === value.currency)) return null;
  if (value.scope !== undefined && !text(value.scope)) return null;
  if (value.limitations !== undefined && (!Array.isArray(value.limitations) || !value.limitations.every(text))) return null;
  return value as Dashboard;
}
