import {parsePendingCommand,type LedgerCommand} from "./ledgerCommands";
/** Strict native commerce-ledger boundary; no direct document/stock table writes. */
export type CommerceKind = "sales_order" | "purchase_order";
export type CommerceLine = { line_id: string; product_id: string; product_variant_id: null; quantity: number; unit_price?: string; unit_cost?: string; supplier_sku?: string | null };
export type CommerceDraft = { customer_id?: string | null; customer_name?: string; customer_email?: string; customer_address?: string; supplier_id?: string; order_date: string; expected_date?: string | null; currency: string; notes: string; tax: string; shipping: string; items: CommerceLine[] };
export type Allocation = { line_id: string; location_id: string; quantity: number };
export type CommerceReturnLine = { entitlement_id: string; location_id: string; quantity: number; condition: "new" | "used" | "damaged"; restock: boolean };
export type CommerceCommand = { request_id: string; action: string; reason: string; document?: CommerceDraft; document_id?: string; expected_revision?: number; allocations?: Allocation[]; lines?: Allocation[] | CommerceReturnLine[] | Record<string,unknown>[]; kind?: "movement" | "adjustment"; bins?: {product_id:string;location_id:string}[]; target_request_id?: string };
export type CommerceDocument = { id: string; kind: CommerceKind; number: string; revision: number; status: string; approval_status: "pending" | "approved" | "rejected"; draft: CommerceDraft; snapshots: Record<string, Record<string, Record<string, unknown>>>; subtotal: string; total: string; created_by: string; created_at: string; updated_at: string; allocations: Allocation[]; fulfilled: Record<string, number>; received: Record<string, number> };
export type CommerceEntitlement = { id: string; document_id: string; line_id: string; product_id: string; quantity: number; returned: number; source_fulfillment_request_id: string; source_location_id: string };
export type CommerceStockRequest = {status:"pending"|"posted"|"rejected"|"reversed";command:Extract<LedgerCommand,{action:"submit"}>&{kind:"movement"|"adjustment"}};
export type CommerceState = {stock_requests:Record<string,CommerceStockRequest>; organization_id: string; sequence: number; head: string; balances: { product_id: string; location_id: string; quantity: number; reserved: number }[]; documents: Record<string, CommerceDocument>; entitlements: Record<string, CommerceEntitlement>; requests: Record<string, { status: string; command: CommerceCommand }>; reservations: Record<string, Record<string, number>> };
export type CommerceResponse = { ok: true; code: "STATE" | "COMMITTED"; state: CommerceState; capabilities: string[]; request_id?: string | null; committed?: boolean; replay?: boolean };
export type DocumentPage = { ok: true; code: "DOCUMENTS"; organization_id: string; data: CommerceDocument[]; total: number; head: string; capabilities: string[] };
const obj = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
/** Organizations labelled as test/QA data stay out of business pickers and totals. */
export const isTestOrganization = (organization: unknown): boolean => obj(organization) && obj(organization.settings) && organization.settings.dataset_kind === "test";
export const hasCommerceAuthority = (organization: unknown): boolean => obj(organization) && obj(organization.settings) && organization.settings.stock_authority === "ledger_v2";
const uuid = (value: unknown): value is string => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
const text = (value: unknown, max = 2000): value is string => typeof value === "string" && value.length <= max;
const qty = (value: unknown): value is number => typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 2147483647;
const positive = (value: unknown): value is number => qty(value) && value > 0;
const exact = (value: Record<string, unknown>, keys: string[]) => Object.keys(value).sort().join("|") === [...keys].sort().join("|");
// The ledger records the caller's username (or id) as the actor, not necessarily a UUID.
const actor = (value: unknown): value is string => typeof value === "string" && value.length > 0 && value.length <= 200 && value.trim() === value;
const head = (value: unknown): value is string => typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
const date = (value: unknown) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
const timestamp = (value: unknown) => typeof value === "string" && value.length <= 40 && Number.isFinite(Date.parse(value));
const REJECTION_MESSAGES: Record<string, string> = {
  "Insufficient available stock": "Not enough free stock at the selected location. Pick a location that has stock or lower the quantity.",
  "Insufficient stock": "Not enough stock at the selected location. Pick a location that has stock or lower the quantity.",
  "Allocate every order line exactly": "Allocate the full quantity of every line (no more, no less) before approving.",
  "Invalid or duplicate line allocation": "Each line can use a location only once. Merge duplicate location rows.",
  "Document revision conflict": "Someone changed this document after you opened it. It has been reloaded; review it and try again.",
  "Document is not pending": "This document is no longer pending, so it cannot be approved or rejected.",
  "Missing stock baseline": "That product has no stock record at the selected location.",
  "Fulfillment exceeds allocation": "You are shipping more than was reserved for this order.",
  "Document quantity exceeded": "The quantity is more than what remains on this document.",
  "Reason required": "Enter a reason for this action.",
  "Expected date precedes order": "The expected delivery date must be on or after the order date.",
  "Invalid email": "Enter a valid customer email address.",
  "Posted document cannot be cancelled": "Stock has already been posted for this document, so it cannot be cancelled.",
  "Document cannot be amended": "This document can no longer be edited.",
  "Unsupported commerce transition": "That action is not allowed in the document's current status.",
  "Document is not eligible": "This document is not eligible for that action.",
  "Return entitlement exceeded": "The return quantity is more than was shipped.",
  "Canonical two-decimal money required": "Amounts must have at most two decimal places.",
  "Empty lines": "Add at least one line.",
  "Empty document": "Add at least one product line.",
  "Positive quantity required": "Quantities must be at least 1.",
};
/** User-facing text for a definitive ledger rejection; unknown details never leak through. */
const CODE_MESSAGES: Record<string, string> = {
  REQUEST_CONFLICT: "A different request already used this ID (for an import: the row changed since it was first imported). Nothing new was saved.",
  REFERENCE_FORBIDDEN: "A customer, supplier, product or location on this document is inactive, missing, or outside this organization.",
  VARIANT_UNSUPPORTED: "Variant products are not supported by this workflow yet.",
  TRACKING_UNSUPPORTED: "Batch or serial tracked products are not supported by this workflow yet.",
  HISTORY_CAPACITY_REACHED: "The stock ledger for this organization is full (testing limit of 200 events). Nothing was saved.",
  OUTPUT_CAPACITY_REACHED: "The stock ledger response would be too large. Nothing was saved.",
};
export function ledgerRejectionMessage(detail: unknown, code?: unknown): string {
  return typeof detail === "string" && REJECTION_MESSAGES[detail] || typeof code === "string" && CODE_MESSAGES[code] || "The ledger rejected this request. Nothing was saved; check the quantities and locations, then try again.";
}

export function canonicalMoney(value: string | number): string {
  const raw = String(value);
  if (!/^\d+(?:\.\d{1,2})?$/.test(raw)) throw new Error("Enter a non-negative amount with up to two decimal places.");
  const [whole, fraction = ""] = raw.split(".");
  const minor = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
  if (minor > 9007199254740991n) throw new Error("The amount is too large.");
  return `${BigInt(whole)}.${fraction.padEnd(2, "0")}`;
}
/** Bridge for older numeric draft helpers: reject every inexact conversion. */
export function exactNumericMoney(raw:string|number):number|null {
 try { const canonical=canonicalMoney(raw); const number=Number(raw); const cents=Math.round(number*100);
  return Number.isSafeInteger(cents)&&canonicalMoney(number)===canonical&&number.toFixed(2)===canonical&&BigInt(cents)===BigInt(canonical.replace(".",""))?number:null;
 } catch {return null;}
}
const money = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  try { return canonicalMoney(value) === value; } catch { return false; }
};
function validDraft(value: unknown, kind: CommerceKind): value is CommerceDraft {
  if (!obj(value) || !date(value.order_date) || typeof value.currency !== "string" || !/^[A-Z]{3}$/.test(value.currency) || !text(value.notes) || !money(value.tax) || !money(value.shipping)) return false;
  const sales = kind === "sales_order";
  const common = ["order_date", "currency", "notes", "tax", "shipping", "items"];
  if (!exact(value, [...common, ...(sales ? ["customer_id", "customer_name", "customer_email", "customer_address"] : ["supplier_id", "expected_date"])])) return false;
  if (sales ? !(value.customer_id === null || uuid(value.customer_id)) || !text(value.customer_name, 255) || !value.customer_name.trim() || !text(value.customer_email, 255) || !text(value.customer_address) : !uuid(value.supplier_id) || !(value.expected_date === null || date(value.expected_date))) return false;
  if (!Array.isArray(value.items) || !value.items.length || value.items.length > 100) return false;
  return value.items.every(line => obj(line) && exact(line, ["line_id", "product_id", "product_variant_id", "quantity", ...(sales ? ["unit_price"] : ["unit_cost", "supplier_sku"])]) && uuid(line.line_id) && uuid(line.product_id) && line.product_variant_id === null && positive(line.quantity) && money(sales ? line.unit_price : line.unit_cost) && (sales || line.supplier_sku === null || text(line.supplier_sku, 255))) && new Set(value.items.map(line => line.line_id)).size === value.items.length;
}
const allocation = (value: unknown) => obj(value) && exact(value, ["line_id", "location_id", "quantity"]) && uuid(value.line_id) && uuid(value.location_id) && positive(value.quantity);
function freeze<T>(value: T): T {
  if (value && typeof value === "object") { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
export function parseCommerceCommand(value: unknown): CommerceCommand | null {
  if (!obj(value) || !uuid(value.request_id) || !text(value.reason) || !value.reason.trim()) return null;
  const common = ["request_id", "action", "reason"];
  const document = uuid(value.document_id) && positive(value.expected_revision);
  let valid = false;
  switch (value.action) {
    case "submit": {
      const stock=parsePendingCommand(value);
      valid=!!stock&&stock.action==="submit"&&["movement","adjustment"].includes(stock.kind)&&stock.lines.every(line=>uuid(line.product_id)&&(stock.kind==="movement"?uuid(line.source)&&uuid(line.destination):uuid(line.location_id)));
      break;
    }
    case "approve": case "reject": case "reverse": valid=!!parsePendingCommand(value)&&uuid(value.target_request_id);break;
    case "register_bins": valid=exact(value,[...common,"bins"])&&Array.isArray(value.bins)&&value.bins.length>0&&value.bins.length<=100&&value.bins.every(bin=>obj(bin)&&exact(bin,["product_id","location_id"])&&uuid(bin.product_id)&&uuid(bin.location_id))&&new Set(value.bins.map(bin=>`${bin.product_id}:${bin.location_id}`)).size===value.bins.length;break;
    case "create_order": case "create_purchase_order": valid = exact(value, [...common, "document"]) && validDraft(value.document, value.action === "create_order" ? "sales_order" : "purchase_order"); break;
    case "amend_document": valid = document && exact(value, [...common, "document_id", "expected_revision", "document"]) && (validDraft(value.document, "sales_order") || validDraft(value.document, "purchase_order")); break;
    case "approve_document": valid = document && exact(value, [...common, "document_id", "expected_revision", "allocations"]) && Array.isArray(value.allocations) && value.allocations.length <= 100 && value.allocations.every(allocation); break;
    case "reject_document": case "cancel_document": valid = document && exact(value, [...common, "document_id", "expected_revision"]); break;
    case "fulfill_order": case "receive_purchase_order": valid = document && exact(value, [...common, "document_id", "expected_revision", "lines"]) && Array.isArray(value.lines) && !!value.lines.length && value.lines.length <= 100 && value.lines.every(allocation); break;
    case "approve_return": case "reject_return": valid = exact(value, [...common, "target_request_id"]) && uuid(value.target_request_id); break;
    case "submit_return": valid = uuid(value.document_id) && exact(value, [...common, "document_id", "lines"]) && Array.isArray(value.lines) && !!value.lines.length && value.lines.length <= 100 && value.lines.every(line => obj(line) && exact(line, ["entitlement_id", "location_id", "quantity", "condition", "restock"]) && uuid(line.entitlement_id) && uuid(line.location_id) && positive(line.quantity) && ["new", "used", "damaged"].includes(String(line.condition)) && typeof line.restock === "boolean" && !(line.condition === "damaged" && line.restock)); break;
  }
  return valid ? freeze(structuredClone(value)) as CommerceCommand : null;
}
export function newCommerceCommand(input: Omit<CommerceCommand, "request_id">): CommerceCommand {
  const command = parseCommerceCommand({ ...input, request_id: crypto.randomUUID() });
  if (!command) throw new Error("Check the document fields, amounts and quantities before continuing.");
  return command;
}
export function parseCommerceDocument(value: unknown): CommerceDocument | null {
  if (!obj(value) || !uuid(value.id) || !["sales_order", "purchase_order"].includes(String(value.kind)) || !text(value.number, 100) || !value.number || !positive(value.revision) || !["pending", "approved", "partially_fulfilled", "fulfilled", "partially_received", "received", "rejected", "cancelled"].includes(String(value.status)) || !["pending", "approved", "rejected"].includes(String(value.approval_status))) return null;
  if (!validDraft(value.draft, value.kind as CommerceKind) || !money(value.subtotal) || !money(value.total) || !actor(value.created_by) || !timestamp(value.created_at) || !timestamp(value.updated_at) || !obj(value.snapshots)) return null;
  if (!Array.isArray(value.allocations) || !value.allocations.every(allocation) || !obj(value.fulfilled) || !Object.values(value.fulfilled).every(qty) || !obj(value.received) || !Object.values(value.received).every(qty)) return null;
  return value as CommerceDocument;
}
export function parseCommerceState(value: unknown, organization: string): CommerceResponse | null {
  if (!obj(value) || value.ok !== true || !["STATE", "COMMITTED"].includes(String(value.code)) || !Array.isArray(value.capabilities) || !value.capabilities.includes("commerce_v2") || !obj(value.state)) return null;
  const state = value.state;
  if (state.organization_id !== organization || !uuid(organization) || !qty(state.sequence) || !head(state.head) || !obj(state.documents) || !Object.entries(state.documents).every(([id, item]) => parseCommerceDocument(item)?.id === id)) return null;
  if (!Array.isArray(state.balances) || !state.balances.every(bin => obj(bin) && uuid(bin.product_id) && uuid(bin.location_id) && qty(bin.quantity) && qty(bin.reserved) && bin.reserved <= bin.quantity) || new Set(state.balances.map(bin => `${bin.product_id}:${bin.location_id}`)).size !== state.balances.length) return null;
  if (!obj(state.entitlements) || !obj(state.requests) || !obj(state.reservations) || !Object.values(state.reservations).every(item => obj(item) && Object.values(item).every(qty))) return null;
  // V1 entries remain historical; only validated v2 entitlements/returns are actionable.
  const entitlements: Record<string, CommerceEntitlement> = {};
  for (const [key, item] of Object.entries(state.entitlements)) {
    if (!obj(item)) return null;
    if (item.document_id === undefined) continue;
    if (item.id !== key || !uuid(key) || !uuid(item.document_id) || !uuid(item.line_id) || !uuid(item.product_id) || !qty(item.quantity) || !qty(item.returned) || item.returned > item.quantity || !uuid(item.source_fulfillment_request_id) || !uuid(item.source_location_id)) return null;
    entitlements[key] = item as CommerceEntitlement;
  }
  const requests: CommerceState["requests"] = {};
  const stock_requests: CommerceState["stock_requests"] = {};
  for (const [key, item] of Object.entries(state.requests)) {
    if (!obj(item) || !obj(item.command)) return null;
    if(item.command.action==="submit"&&["movement","adjustment"].includes(String(item.command.kind))){
      if(!["pending","posted","rejected","reversed"].includes(String(item.status))||item.command.request_id!==key||!parseCommerceCommand(item.command))return null;
      stock_requests[key]=item as CommerceStockRequest;continue;
    }
    if (item.command.action !== "submit_return") continue;
    if (!["pending", "posted", "rejected"].includes(String(item.status)) || item.command.request_id !== key || !parseCommerceCommand(item.command)) return null;
    requests[key] = item as CommerceState["requests"][string];
  }
  if (value.committed !== undefined && typeof value.committed !== "boolean" || value.replay !== undefined && typeof value.replay !== "boolean" || value.request_id != null && !uuid(value.request_id)) return null;
  return { ...value, state: { ...state, entitlements, requests, stock_requests } } as CommerceResponse;
}
export function parseDocumentPage(value: unknown, organization: string): DocumentPage | null {
  if (!obj(value) || value.ok !== true || value.code !== "DOCUMENTS" || value.organization_id !== organization || !Array.isArray(value.capabilities) || !value.capabilities.includes("commerce_v2") || !head(value.head) || !qty(value.total) || !Array.isArray(value.data) || value.data.length > 50 || value.data.length > value.total || !value.data.every(parseCommerceDocument) || new Set(value.data.map(item => item.id)).size !== value.data.length) return null;
  return value as DocumentPage;
}
