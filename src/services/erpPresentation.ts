import { displayValue, fieldLabel, labelField, listFields, logicalResource, relationFor, visibleFields, type ErpField, type ErpResource } from "./erp";
import { finiteNumber, money } from "./inventory";

export type PresentationContext = { currency?: string; referenceLabel?: (field: string, value: unknown) => string };
export type BusinessSection = { id: string; title: string; fields: ErpField[] };
type Group = readonly [string, readonly string[]];
const groups: Record<string, readonly Group[]> = {
  orders: [
    ["Customer & fulfillment", ["order_number", "customer_id", "customer_name", "customer_email", "customer_address", "warehouse_id", "status", "stock_committed"]],
    ["Amounts & payment", ["subtotal", "discount_type", "discount_value", "discount_amount", "tax", "shipping", "total", "amount_paid", "payment_status", "currency"]],
    ["Order timeline", ["order_date", "shipped_at", "delivered_at"]],
    ["Invoice references", ["invoice_number", "invoice_issued_at", "invoice_sent_at", "invoice_sent_to", "invoice_queued_at"]],
  ],
  customers: [
    ["Customer profile", ["name", "code", "company_name", "contact_name", "email", "phone", "is_active"]],
    ["Billing address", ["billing_address", "billing_city", "billing_state", "billing_zip_code", "billing_country"]],
    ["Shipping address", ["shipping_address", "shipping_city", "shipping_state", "shipping_zip_code", "shipping_country"]],
    ["Commercial terms", ["tax_id", "payment_terms", "credit_limit", "currency"]],
  ],
  suppliers: [
    ["Supplier profile", ["name", "code", "contact_name", "email", "phone", "website", "is_active"]],
    ["Supplier address", ["address", "city", "state", "zip_code", "country"]],
    ["Commercial terms", ["payment_terms", "currency", "rating"]],
  ],
  return_orders: [
    ["Return document", ["return_number", "order_id", "type", "status"]],
    ["Recorded refund & disposition", ["refund_amount", "reason", "processed_by", "completed_at"]],
  ],
  purchase_orders: [
    ["Supplier & purchase order", ["po_number", "supplier_id", "status"]],
    ["Purchase amounts", ["subtotal", "tax", "shipping", "total", "currency"]],
    ["Delivery timeline", ["order_date", "expected_date", "received_date", "sent_at", "sent_to", "queued_at"]],
  ],
  product_locations: [
    ["Location profile", ["name", "code", "warehouse_id", "is_active"]],
    ["Storage position", ["aisle", "shelf", "bin", "capacity"]],
  ],
  warehouses: [
    ["Warehouse profile", ["name", "code", "manager_name", "phone", "email", "is_active", "is_default"]],
    ["Address", ["address_line_1", "address_line_2", "city", "province", "postal_code", "country"]],
    ["Operating settings", ["timezone", "currency", "capacity", "priority"]],
  ],
  stock_adjustments: [
    ["Stock reference", ["product_id", "product_variant_id", "location_id", "type"]],
    ["Recorded quantities", ["quantity_before", "adjustment_quantity", "quantity_after"]],
    ["Adjustment context", ["reason", "reference_type", "reference_id", "user_id"]],
  ],
  stock_transfers: [
    ["Transfer route", ["transfer_number", "from_warehouse_id", "to_warehouse_id", "from_location_id", "to_location_id", "is_inter_warehouse"]],
    ["Dispatch & receipt", ["status", "shipping_method", "tracking_number", "prepared_at", "shipped_at", "stock_dispatched_at", "estimated_arrival", "completed_at", "transferred_by", "completed_by"]],
  ],
  work_orders: [
    ["Production order", ["work_order_number", "product_id", "product_variant_id", "warehouse_id", "status"]],
    ["Recorded production", ["quantity", "quantity_produced", "started_at", "completed_at"]],
  ],
  order_payments: [
    ["Recorded payment", ["order_id", "type", "amount", "method", "reference", "paid_at", "user_id"]],
    ["Void information", ["voided_at", "voided_by", "void_reason"]],
  ],
  shipments: [
    ["Shipment reference", ["order_id", "warehouse_id", "carrier", "carrier_name", "service", "status", "tracking_status_detail"]],
    ["Tracking & delivery", ["tracking_number", "tracking_url", "shipped_at", "delivered_at", "last_tracked_at"]],
    ["Package & cost", ["cost", "currency", "weight_oz", "length_in", "width_in", "height_in"]],
    ["Customer notification", ["notify_customer", "customer_notified_at", "customer_notification_queued_at"]],
  ],
};
const structuredFields: Record<string, string[]> = {
  saved_reports: ["columns", "filters", "sort", "columns_json", "filters_json", "sort_json"],
  activity_logs: ["properties", "properties_json"],
};
const sensitive = /secret|password|token|authorization|api[_-]?key/i;
const permitted = (resource: ErpResource) => visibleFields(resource).filter(field => !["id", "organization_id"].includes(field.name) && !sensitive.test(field.name));

/** Schema-bound descriptors; every displayed field has exactly one section owner. */
export function businessSections(resource: ErpResource): BusinessSection[] {
  const name = logicalResource(resource.name);
  const available = permitted(resource).filter(field => !(structuredFields[name] ?? []).includes(field.name));
  const remaining = new Map(available.map(field => [field.name, field]));
  const sections: BusinessSection[] = [];
  const take = (title: string, names: readonly string[]) => {
    const fields = names.flatMap(key => { const field = remaining.get(key); remaining.delete(key); return field ? [field] : []; });
    if (fields.length) sections.push({ id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, ""), title, fields });
  };
  for (const [title, names] of groups[name] ?? []) take(title, names);
  take("Approval record", [...remaining.keys()].filter(key => /^(approval_|approved_)/.test(key)));
  take("Related records", [...remaining.keys()].filter(key => key !== "tax_id" && /_id$/.test(key)));
  take("Recorded amounts", [...remaining.keys()].filter(key => monetary.has(key) || key === "currency"));
  take("Quantities & limits", [...remaining.keys()].filter(key => /quantity|^stock$|^min_stock$|^max_stock$|capacity|lead_time|reorder/.test(key)));
  take("Status & settings", [...remaining.keys()].filter(key => /status$|^is_|^has_/.test(key)));
  take("Record details", [...remaining.keys()].filter(key => !["notes", "description", "metadata"].includes(key) && !/(_at|_date|_by)$/.test(key) && key !== "created_by"));
  take("Notes & context", ["description", "notes", "metadata"]);
  take("Record history", [...remaining.keys()]);
  return sections;
}

export type StatusPresentation = { label: string; color: "default" | "success" | "warning" | "error" | "info" };
export function statusPresentation(field: string, value: unknown): StatusPresentation | null {
  if (!["status", "payment_status", "approval_status", "is_active", "stock_committed"].includes(field)) return null;
  if (field === "is_active" || field === "stock_committed") {
    if (typeof value !== "boolean") return { label: "Not recorded", color: "default" };
    return { label: field === "is_active" ? value ? "Active" : "Inactive" : value ? "Committed" : "Not committed", color: value ? "success" : "default" };
  }
  if (typeof value !== "string" || !value.trim()) return { label: "Not recorded", color: "default" };
  const normalized = value.trim().toLowerCase();
  const color = ["paid", "approved", "completed", "delivered", "received", "active"].includes(normalized) ? "success"
    : ["rejected", "cancelled", "canceled", "failed", "overdue"].includes(normalized) ? "error"
    : ["pending", "unpaid", "partial", "partially_paid", "on_hold"].includes(normalized) ? "warning"
    : ["processing", "in_progress", "shipped", "draft"].includes(normalized) ? "info" : "default";
  return { label: fieldLabel(value.trim()), color };
}

const monetary = new Set(["subtotal", "tax", "shipping", "total", "credit_limit", "unit_price", "unit_cost", "cost", "cost_price", "price", "purchase_price", "selling_price", "refund_amount", "amount_paid", "discount_amount", "amount"]);
export function presentationValue(resource: ErpResource, field: ErpField, value: unknown, context: PresentationContext = {}): string {
  if (value === null || value === undefined || value === "") return "Not recorded";
  const status = statusPresentation(field.name, value);
  if (status) return status.label;
  if (monetary.has(field.name)) {
    const number = finiteNumber(value);
    if (number === null) return "Not available";
    const currency = context.currency;
    const rendered = money(number, currency);
    // A currency code is explicit even when the locale uses an ambiguous '$'.
    return typeof currency === "string" && /^[A-Z]{3}$/.test(currency) ? `${rendered} ${currency}` : rendered;
  }
  if (relationFor(resource, field.name) || /_id$/.test(field.name) && field.name !== "tax_id") {
    const label = context.referenceLabel?.(field.name, value);
    return label && label.trim() && label !== String(value) ? label : `Reference: ${String(value)}`;
  }
  if (typeof value === "object") return Array.isArray(value) ? `${value.length} items` : "Structured data";
  if (field.type === "boolean") return typeof value === "boolean" ? value ? "Yes" : "No" : "Not recorded";
  if (["number", "integer"].includes(field.type)) {
    const number = finiteNumber(value);
    return number === null ? "Not available" : number.toLocaleString(undefined, { maximumFractionDigits: 6 });
  }
  const formatted = displayValue(field, value);
  return formatted === "—" ? "Not recorded" : formatted;
}

const listNames: Record<string, string[]> = {
  orders: ["order_number", "customer_name", "status", "payment_status", "order_date", "total"],
  customers: ["name", "code", "company_name", "email", "is_active"],
  suppliers: ["name", "code", "contact_name", "email", "is_active"],
  purchase_orders: ["po_number", "supplier_id", "status", "expected_date", "total"],
  return_orders: ["return_number", "order_id", "type", "status", "refund_amount"],
  product_locations: ["name", "warehouse_id", "aisle", "shelf", "is_active"],
  stock_adjustments: ["product_id", "type", "quantity_before", "adjustment_quantity", "quantity_after", "created_at"],
};
export function moduleListFields(resource: ErpResource): ErpField[] {
  const preferred = listNames[logicalResource(resource.name)];
  const fields = permitted(resource);
  return preferred ? preferred.flatMap(name => fields.filter(field => field.name === name)).slice(0, 6) : listFields(resource).filter(field => fields.some(allowed => allowed.name === field.name));
}
export function moduleSearchFields(resource: ErpResource): string[] {
  const desired = [labelField(resource), "name", "code", "email", "company_name", "contact_name", "customer_name", "customer_email", "sku", "tracking_number", "reference", "reason"];
  return [...new Set(desired)].filter(name => permitted(resource).some(field => field.name === name && field.type === "string" && !["uuid", "date", "date-time", "datetime"].includes(field.format ?? "") && !/_id$/.test(name)));
}
