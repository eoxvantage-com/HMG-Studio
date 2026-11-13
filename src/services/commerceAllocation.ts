import type { Allocation, CommerceDocument, CommerceState } from "./commerceLedger";

type Balance = CommerceState["balances"][number];
type Location = { id: string; name?: unknown };
export type AllocationMode = "approve_document" | "fulfill_order" | "receive_purchase_order";

/** Free stock (on hand minus reserved) for one product at one location. */
export function availableAt(balances: Balance[], productId: string, locationId: string): number {
  const row = balances.find(item => item.product_id === productId && item.location_id === locationId);
  return row ? Math.max(0, row.quantity - row.reserved) : 0;
}

const productOf = (document: CommerceDocument, lineId: string) => document.draft.items.find(line => line.line_id === lineId)?.product_id ?? "";
const fulfilledKey = (lineId: string, locationId: string) => JSON.stringify([lineId, locationId]);
const receivedFor = (document: CommerceDocument, lineId: string) => Object.entries(document.received).reduce((sum, [key, value]) => {
  try { return JSON.parse(key)[0] === lineId ? sum + value : sum; } catch { return sum; }
}, 0);

/** Quantity each line still needs for the chosen action. */
export function requiredByLine(document: CommerceDocument, mode: AllocationMode): Record<string, number> {
  const out: Record<string, number> = {};
  for (const line of document.draft.items) {
    if (mode === "approve_document") out[line.line_id] = line.quantity;
    else if (mode === "receive_purchase_order") out[line.line_id] = Math.max(0, line.quantity - receivedFor(document, line.line_id));
    else out[line.line_id] = document.allocations.filter(row => row.line_id === line.line_id)
      .reduce((sum, row) => sum + Math.max(0, row.quantity - (document.fulfilled[fulfilledKey(row.line_id, row.location_id)] ?? 0)), 0);
  }
  return out;
}

/**
 * Sensible starting rows so the user does not have to guess:
 * approvals reserve from the locations with the most free stock first,
 * fulfillment ships exactly what was reserved, receipts go to the location
 * that already holds the product (or the first location).
 */
export function suggestAllocations(document: CommerceDocument, mode: AllocationMode, balances: Balance[], locations: Location[]): Allocation[] {
  const ids = locations.map(location => location.id);
  if (mode === "fulfill_order") return document.allocations
    .map(row => ({ ...row, quantity: row.quantity - (document.fulfilled[fulfilledKey(row.line_id, row.location_id)] ?? 0) }))
    .filter(row => row.quantity > 0);
  const required = requiredByLine(document, mode);
  const planned: Record<string, number> = {};
  const rows: Allocation[] = [];
  for (const line of document.draft.items) {
    let remaining = required[line.line_id] ?? 0;
    if (remaining <= 0) continue;
    const ranked = [...ids].sort((a, b) => availableAt(balances, line.product_id, b) - availableAt(balances, line.product_id, a));
    if (mode === "receive_purchase_order") { rows.push({ line_id: line.line_id, location_id: ranked[0] ?? "", quantity: remaining }); continue; }
    for (const locationId of ranked) {
      const key = `${line.product_id}|${locationId}`;
      const free = availableAt(balances, line.product_id, locationId) - (planned[key] ?? 0);
      if (free <= 0) continue;
      const take = Math.min(free, remaining);
      rows.push({ line_id: line.line_id, location_id: locationId, quantity: take });
      planned[key] = (planned[key] ?? 0) + take; remaining -= take;
      if (!remaining) break;
    }
    // Not enough free stock anywhere: keep the shortfall visible on the best location.
    if (remaining > 0) {
      const existing = rows.find(row => row.line_id === line.line_id && row.location_id === ranked[0]);
      if (existing) existing.quantity += remaining; else rows.push({ line_id: line.line_id, location_id: ranked[0] ?? "", quantity: remaining });
    }
  }
  return rows;
}

export type AllocationProblem = { lineId?: string; index?: number; message: string };

/** Everything the ledger would reject, found before a request is sent. */
export function allocationProblems(document: CommerceDocument, mode: AllocationMode, rows: Allocation[], balances: Balance[], locations: Location[]): AllocationProblem[] {
  const problems: AllocationProblem[] = [];
  const names = new Map(locations.map(location => [location.id, typeof location.name === "string" ? location.name : "the selected location"]));
  const required = requiredByLine(document, mode);
  const seen = new Set<string>();
  rows.forEach((row, index) => {
    if (!names.has(row.location_id)) problems.push({ index, lineId: row.line_id, message: "Choose a location." });
    if (!Number.isInteger(row.quantity) || row.quantity < 1) problems.push({ index, lineId: row.line_id, message: "Quantity must be at least 1." });
    const key = `${row.line_id}|${row.location_id}`;
    if (row.location_id && seen.has(key)) problems.push({ index, lineId: row.line_id, message: "This location is already used for this line." });
    seen.add(key);
  });
  for (const line of document.draft.items) {
    const total = rows.filter(row => row.line_id === line.line_id).reduce((sum, row) => sum + (Number.isFinite(row.quantity) ? row.quantity : 0), 0);
    const need = required[line.line_id] ?? 0;
    if (mode === "approve_document" && total !== need) problems.push({ lineId: line.line_id, message: `Allocate exactly ${need} (currently ${total}).` });
    if (mode !== "approve_document" && total > need) problems.push({ lineId: line.line_id, message: `Only ${need} remaining on this line (currently ${total}).` });
  }
  if (mode === "approve_document") {
    const demand: Record<string, number> = {};
    for (const row of rows) { const key = `${productOf(document, row.line_id)}|${row.location_id}`; demand[key] = (demand[key] ?? 0) + (row.quantity || 0); }
    for (const [key, quantity] of Object.entries(demand)) {
      const [productId, locationId] = key.split("|");
      const free = availableAt(balances, productId, locationId);
      if (locationId && quantity > free) problems.push({ lineId: rows.find(row => productOf(document, row.line_id) === productId && row.location_id === locationId)?.line_id,
        message: `Only ${free} free at ${names.get(locationId) ?? "this location"} (requested ${quantity}).` });
    }
  }
  if (mode === "fulfill_order") rows.forEach((row, index) => {
    const reserved = document.allocations.find(item => item.line_id === row.line_id && item.location_id === row.location_id);
    const open = reserved ? reserved.quantity - (document.fulfilled[fulfilledKey(row.line_id, row.location_id)] ?? 0) : 0;
    if (row.quantity > open) problems.push({ index, lineId: row.line_id, message: `Only ${open} reserved and unshipped at this location.` });
  });
  if (mode === "fulfill_order" && !rows.length) problems.push({ message: "Nothing is left to ship on this order." });
  if (mode === "receive_purchase_order" && !rows.length) problems.push({ message: "Nothing is left to receive on this purchase order." });
  return problems;
}
