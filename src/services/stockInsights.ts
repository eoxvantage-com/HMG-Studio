import type { CommerceState } from "./commerceLedger";
import type { ErpRecord } from "./erp";

const s = (value: unknown) => typeof value === "string" ? value : "";
const n = (value: unknown) => { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : 0; };
const key = (lineId: string, locationId: string) => JSON.stringify([lineId, locationId]);
const lineTotal = (record: Record<string, number>, lineId: string) => Object.entries(record).reduce((sum, [k, v]) => { try { return JSON.parse(k)[0] === lineId ? sum + v : sum; } catch { return sum; } }, 0);

export type LevelRow = { productId: string; locationId: string; name: string; sku: string; image: unknown; location: string; onHand: number; reserved: number; free: number; costValue: number; sellValue: number };
export function stockLevels(state: CommerceState, products: ErpRecord[], locations: ErpRecord[]): LevelRow[] {
  const productMap = new Map(products.map(row => [row.id, row])); const locationMap = new Map(locations.map(row => [row.id, row]));
  return state.balances.filter(row => row.quantity > 0 || row.reserved > 0).map(row => {
    const product = productMap.get(row.product_id);
    return { productId: row.product_id, locationId: row.location_id, name: s(product?.name) || "Unknown product", sku: s(product?.sku), image: product?.image, location: s(locationMap.get(row.location_id)?.name) || "Unknown location",
      onHand: row.quantity, reserved: row.reserved, free: row.quantity - row.reserved, costValue: row.quantity * n(product?.purchase_price), sellValue: row.quantity * n(product?.selling_price) };
  }).sort((a, b) => a.name.localeCompare(b.name) || a.location.localeCompare(b.location));
}
export function locationSummary(rows: LevelRow[]) {
  const map = new Map<string, { location: string; products: number; onHand: number; reserved: number; sellValue: number }>();
  for (const row of rows) { const current = map.get(row.locationId) ?? { location: row.location, products: 0, onHand: 0, reserved: 0, sellValue: 0 }; current.products++; current.onHand += row.onHand; current.reserved += row.reserved; current.sellValue += row.sellValue; map.set(row.locationId, current); }
  return [...map.entries()].map(([id, value]) => ({ id, ...value })).sort((a, b) => b.sellValue - a.sellValue);
}

export type ReservationRow = { documentId: string; number: string; customer: string; orderDate: string; status: string; product: string; productId: string; location: string; reserved: number; shipped: number; remaining: number; value: number };
export function reservations(state: CommerceState, locations: ErpRecord[]): ReservationRow[] {
  const locationMap = new Map(locations.map(row => [row.id, row]));
  const rows: ReservationRow[] = [];
  for (const doc of Object.values(state.documents)) {
    if (doc.kind !== "sales_order" || !["approved", "partially_fulfilled"].includes(doc.status)) continue;
    const customer = doc.draft.customer_id ? s(doc.snapshots.customers?.[doc.draft.customer_id]?.name) : s(doc.draft.customer_name);
    for (const allocation of doc.allocations) {
      const line = doc.draft.items.find(item => item.line_id === allocation.line_id); if (!line) continue;
      const shipped = doc.fulfilled[key(allocation.line_id, allocation.location_id)] ?? 0; const remaining = allocation.quantity - shipped;
      if (remaining <= 0) continue;
      rows.push({ documentId: doc.id, number: doc.number, customer: customer || "—", orderDate: doc.draft.order_date, status: doc.status, productId: line.product_id, product: s(doc.snapshots.products?.[line.product_id]?.name) || "Unknown product",
        location: s(doc.snapshots.locations?.[allocation.location_id]?.name) || s(locationMap.get(allocation.location_id)?.name) || "Unknown location", reserved: allocation.quantity, shipped, remaining, value: remaining * n(line.unit_price) });
    }
  }
  return rows.sort((a, b) => a.orderDate.localeCompare(b.orderDate) || a.number.localeCompare(b.number));
}

export type ReplenishmentRow = { productId: string; name: string; sku: string; image: unknown; onHand: number; reserved: number; free: number; onOrder: number; point: number; suggested: number; cost: number; supplierId: string; supplier: string; status: "out" | "below" };
/** Products whose free stock plus open purchase quantities is at or below the reorder point (falls back to minimum stock). */
export function replenishment(state: CommerceState, products: ErpRecord[], suppliers: ErpRecord[]): ReplenishmentRow[] {
  const totals = new Map<string, { quantity: number; reserved: number }>();
  for (const row of state.balances) { const current = totals.get(row.product_id) ?? { quantity: 0, reserved: 0 }; totals.set(row.product_id, { quantity: current.quantity + row.quantity, reserved: current.reserved + row.reserved }); }
  const onOrder = new Map<string, number>(); const lastSupplier = new Map<string, { date: string; supplierId: string }>();
  for (const doc of Object.values(state.documents)) {
    if (doc.kind !== "purchase_order") continue;
    for (const line of doc.draft.items) {
      const previous = lastSupplier.get(line.product_id);
      if (doc.draft.supplier_id && (!previous || doc.draft.order_date > previous.date)) lastSupplier.set(line.product_id, { date: doc.draft.order_date, supplierId: doc.draft.supplier_id });
      if (["pending", "approved", "partially_received"].includes(doc.status)) onOrder.set(line.product_id, (onOrder.get(line.product_id) ?? 0) + Math.max(0, line.quantity - lineTotal(doc.received, line.line_id)));
    }
  }
  const supplierMap = new Map(suppliers.map(row => [row.id, row]));
  return products.filter(row => row.is_active === true && !row.deleted_at).flatMap(row => {
    const total = totals.get(row.id) ?? { quantity: 0, reserved: 0 }; const free = total.quantity - total.reserved; const incoming = onOrder.get(row.id) ?? 0;
    const point = row.reorder_point != null && n(row.reorder_point) > 0 ? n(row.reorder_point) : n(row.min_stock);
    if (point <= 0 || free + incoming > point) return [];
    const suggested = n(row.reorder_quantity) > 0 ? n(row.reorder_quantity) : Math.max(1, point * 2 - free - incoming);
    const supplierId = lastSupplier.get(row.id)?.supplierId ?? "";
    return [{ productId: row.id, name: s(row.name), sku: s(row.sku), image: row.image, onHand: total.quantity, reserved: total.reserved, free, onOrder: incoming, point, suggested, cost: n(row.purchase_price), supplierId, supplier: s(supplierMap.get(supplierId)?.name), status: free <= 0 ? "out" as const : "below" as const }];
  }).sort((a, b) => Number(b.status === "out") - Number(a.status === "out") || (a.free + a.onOrder - a.point) - (b.free + b.onOrder - b.point) || a.name.localeCompare(b.name));
}
