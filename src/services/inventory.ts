import { hasCommerceAuthority, parseCommerceState, type CommerceState } from "./commerceLedger";
import type { CrudFilters } from "@refinedev/core";
import type { ErpRecord } from "./erp";

export function inventoryFilters(search: string, active: string): CrudFilters {
  const filters: CrudFilters = [{ field: "deleted_at", operator: "null", value: true }];
  if (search.trim()) filters.push({ operator: "or", value: ["name", "sku", "barcode"].map(field => ({ field, operator: "contains", value: search.trim() })) });
  if (active === "true" || active === "false") filters.push({ field: "is_active", operator: "eq", value: active === "true" });
  return filters;
}
export function finiteNumber(value: unknown): number | null {
  if (typeof value !== "number" && (typeof value !== "string" || !/^-?\d+(?:\.\d+)?$/.test(value.trim()))) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && Math.abs(parsed) <= Number.MAX_SAFE_INTEGER ? parsed : null;
}
export function inventoryMetrics(record: ErpRecord) {
  // Parent stock is not a trustworthy total for variant-managed products.
  const catalogue = typeof record.sku === "string" && record.sku.startsWith("HMG-WEB-");
  const stock = record.has_variants === true || catalogue && record.stock_projection !== "ledger_v2" ? null : finiteNumber(record.stock);
  const selling = finiteNumber(record.selling_price);
  const purchase = finiteNumber(record.purchase_price);
  const rawValue = stock !== null && selling !== null ? stock * selling : null;
  const rawMargin = selling !== null && selling > 0 && purchase !== null ? ((selling - purchase) / selling) * 100 : null;
  return { stock, selling, purchase, catalogue,
    value: rawValue !== null && Number.isFinite(rawValue) && Math.abs(rawValue) <= Number.MAX_SAFE_INTEGER ? rawValue : null,
    margin: rawMargin !== null && Number.isFinite(rawMargin) ? rawMargin : null,
  };
}
export function money(value: number | null, currency: unknown): string {
  if (value === null) return "Not available";
  if (typeof currency !== "string" || !/^[A-Z]{3}$/.test(currency)) return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} (currency unavailable)`;
  try { return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value); }
  catch { return `${value.toLocaleString()} ${currency}`; }
}
export function productImageUrl(value: unknown): string | null {
  if (typeof value !== "string" || /[\\\u0000-\u0020]/.test(value)) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !["www.hmgstones.com", "hmgstones.com"].includes(url.hostname) || url.port || url.username || url.password || url.search || url.hash) return null;
    if (!/^\/assets\/images\/products\/[a-zA-Z0-9_./%-]+\.(?:jpe?g|png|webp|avif)$/i.test(url.pathname)) return null;
    const decoded = decodeURIComponent(url.pathname);
    if (decoded.includes("..") || decoded.includes("\\") || /[\u0000-\u001f\u007f]/.test(decoded) || decoded.includes("%")) return null;
    return url.href;
  } catch { return null; }
}
export function barcodeIdentity(record: ErpRecord): { value: string; preview: boolean; format: "CODE128" | null } {
  const actual = typeof record.barcode === "string" && record.barcode.trim() ? record.barcode : "";
  const value = actual || (typeof record.sku === "string" ? record.sku : "");
  const type = typeof record.barcode_type === "string" ? record.barcode_type.toLowerCase().replace(/[-_ ]/g, "") : "";
  return { value, preview: !actual, format: (!actual || type === "code128") && /^[\x20-\x7e]{1,100}$/.test(value) ? "CODE128" : null };
}

/** Presentation priority only: all other schema relations remain reachable under More related data. */
export function primaryProductRelation(record: ErpRecord, resource: string, field: string): boolean {
  if (["product_location_stocks", "product_supplier"].includes(resource)) return true;
  if (resource === "product_variants") return record.has_variants === true;
  if (resource === "product_components") return record.type === "assembly" && field === "parent_product_id";
  if (resource === "product_serials") return record.tracking_type === "serial";
  if (resource === "product_batches") return record.tracking_type === "batch";
  return false;
}

/** A chart of this returned page, never a sum or product-wide inventory valuation. */
export function stockLocationChart(rows: ErpRecord[], total: number | undefined) {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const ids = new Set<string>();
  const locations = new Set<string>();
  const points: Array<{ id: string; location: string; quantity: number }> = [];
  for (const row of rows.slice(0, 100)) {
    const quantity = finiteNumber(row.quantity);
    const location = row.location_id;
    if (typeof row.id !== "string" || !uuid.test(row.id) || typeof location !== "string" || !uuid.test(location) || ids.has(row.id.toLowerCase()) || locations.has(location.toLowerCase()) || quantity === null) continue;
    ids.add(row.id.toLowerCase()); locations.add(location.toLowerCase());
    points.push({ id: row.id, location, quantity });
  }
  const omitted = rows.length - points.length;
  return { points, omitted, complete: omitted === 0 && Number.isSafeInteger(total) && total! >= 0 && rows.length === total };
}


export type InventoryAuthority = { kind: "legacy" } | { kind: "unavailable" } | { kind: "ledger"; balances: CommerceState["balances"] };
/** Replace, never add to native stock. Missing authority is unknown, not legacy. */
export function inventoryAuthorityRecord(record: ErpRecord, authority: InventoryAuthority | undefined): ErpRecord {
  if (authority?.kind === "legacy") return { ...record, stock_projection: "legacy" };
  if (authority?.kind !== "ledger") return { ...record, stock: null, stock_projection: "unavailable" };
  if (record.has_variants !== false || record.tracking_type !== "none" || record.type !== "standard") return { ...record, stock: null, stock_projection: "unsupported" };
  const stock = authority.balances.filter(bin => bin.product_id === record.id).reduce((sum, bin) => sum + bin.quantity, 0);
  return { ...record, stock: Number.isSafeInteger(stock) ? stock : null, stock_projection: "ledger_v2" };
}
export async function readInventoryAuthority(ids: string[], readOrganizations: (ids: string[]) => Promise<ErpRecord[]>, readLedger: (id: string) => Promise<unknown>): Promise<Record<string, InventoryAuthority>> {
  const unique = [...new Set(ids)];
  const result: Record<string, InventoryAuthority> = Object.fromEntries(unique.map(id => [id, { kind: "unavailable" }]));
  if (!unique.length || unique.length > 100) return result;
  try {
    const organizations = await readOrganizations(unique);
    for (const id of unique) {
      const matches = organizations.filter(row => row.id === id);
      const org = matches.length === 1 ? matches[0] : null;
      if (!org || org.is_active !== true || org.deleted_at !== null || !org.settings || typeof org.settings !== "object" || Array.isArray(org.settings)) continue;
      if (hasCommerceAuthority(org)) {
        try {
          const parsed = parseCommerceState(await readLedger(id), id);
          if (parsed?.code === "STATE") result[id] = { kind: "ledger", balances: parsed.state.balances };
        } catch { /* No native fallback after activation. */ }
      } else if ((org.settings as Record<string, unknown>).stock_authority == null || (org.settings as Record<string, unknown>).stock_authority === "legacy") result[id] = { kind: "legacy" };
    }
  } catch { /* Caller scope unavailable: leave every stock value unknown. */ }
  return result;
}
