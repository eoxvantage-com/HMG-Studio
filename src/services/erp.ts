import type { CrudFilters } from "@refinedev/core";
import manifestText from "../../backend/schema/erp-manifest.json?raw";

export type ErpField = { name: string; type: string; format?: string; default?: unknown; constraints?: { required?: boolean; maxLength?: number; enum?: unknown[]; minimum?: number; maximum?: number }; [key: string]: unknown };
export type ErpRelation = { fields: string[]; reference: { resource: string; fields: string[] } };
export type ErpResource = { name: string; title: string; liveVerified?: boolean; schema: { fields: ErpField[]; foreignKeys?: ErpRelation[] }; verifiedCommand?: string; writeAuthorizationVerified?: boolean; verifiedWriteActions?: Array<"create" | "update" | "delete"> };
export type ErpRecord = { id: string; [key: string]: unknown };
const manifest = JSON.parse(manifestText) as { resources: ErpResource[] };
export const erpResources = manifest.resources;
export const ERP_QUERY_OPTIONS = { retry: false, refetchOnWindowFocus: false, refetchOnReconnect: false } as const;
export const logicalResource = (name: string) => name.replace(/^hmg_studio_/, "");
export const getErpResource = (name?: string) => erpResources.find(resource => resource.name === logicalResource(name ?? ""));

// These are form candidates, NOT a security boundary. A table also needs an
// explicitly verified server-side authorization contract and native permission.
// No stock, workflow, payment, approval, audit or identity writes are generic.
const masterFields: Record<string, string[]> = {
  // The web product form calls `price` the selling price. The separate
  // `selling_price` column belongs to another API surface and must not create
  // a second, divergent selling-price control here.
  products: ["organization_id", "sku", "name", "description", "price", "barcode", "barcode_type", "type", "category_id", "location_id", "currency", "notes", "purchase_price", "min_stock", "reorder_point", "reorder_quantity", "tracking_type", "is_active"],
  customers: ["organization_id", "name", "code", "company_name", "contact_name", "email", "phone", "billing_address", "billing_city", "billing_state", "billing_zip_code", "billing_country", "shipping_address", "shipping_city", "shipping_state", "shipping_zip_code", "shipping_country", "tax_id", "payment_terms", "credit_limit", "currency", "notes", "is_active"],
  suppliers: ["organization_id", "name", "code", "contact_name", "email", "phone", "address", "city", "state", "zip_code", "country", "website", "payment_terms", "currency", "notes", "is_active", "rating"],
  product_locations: ["organization_id", "warehouse_id", "name", "code", "description", "aisle", "shelf", "bin", "capacity", "is_active"],
  warehouses: ["organization_id", "name", "code", "description", "address_line_1", "address_line_2", "city", "province", "postal_code", "country", "phone", "email", "manager_name", "timezone", "currency", "priority", "capacity", "is_active"],
};
const labels: Record<string, string> = { sku: "SKU", is_active: "Active", tax_id: "Tax ID", po_number: "Purchase order number", min_stock: "Minimum stock level", max_stock: "Maximum stock", price: "Selling price", purchase_price: "Purchase price (cost)", type: "Product type", tracking_type: "Inventory tracking" };
export function fieldLabel(name: string): string {
  return labels[name] ?? name.replace(/_id$/, "").replace(/_/g, " ").replace(/^./, value => value.toUpperCase());
}
export function labelField(resource: ErpResource): string {
  return ["name", "title", "order_number", "po_number", "work_order_number", "transfer_number", "return_number", "audit_number", "reference", "code", "sku", "slug", "subject", "id"].find(name => resource.schema.fields.some(field => field.name === name)) ?? "id";
}
const listColumns: Record<string, string[]> = {
  products: ["name", "sku", "stock", "selling_price", "is_active"],
  customers: ["name", "code", "contact_name", "email", "is_active"],
  suppliers: ["name", "code", "contact_name", "email", "is_active"],
  orders: ["order_number", "customer_name", "status", "order_date", "total"],
  purchase_orders: ["po_number", "status", "order_date", "expected_date", "total"],
  return_orders: ["return_number", "type", "status", "refund_amount", "created_at"],
  stock_transfers: ["transfer_number", "status", "shipping_method", "tracking_number", "created_at"],
  stock_audits: ["audit_number", "name", "audit_type", "status", "created_at"],
  work_orders: ["work_order_number", "quantity", "quantity_produced", "status", "created_at"],
  product_locations: ["name", "code", "aisle", "shelf", "is_active"],
  warehouses: ["name", "code", "city", "currency", "is_active"],
  plugins: ["slug", "source", "is_active", "activated_at", "deactivated_at"],
  notifications: ["title", "type", "priority", "read_at", "created_at"],
  activity_logs: ["description", "action", "category", "subject_type", "created_at"],
  saved_reports: ["name", "data_source", "chart_type", "is_shared", "updated_at"],
  data_exports: ["filename", "type", "status", "row_count", "created_at"],
  shipments: ["carrier_name", "tracking_number", "status", "cost", "currency"],
  stock_adjustments: ["reason", "type", "quantity_before", "quantity_after", "created_at"],
};
export function listFields(resource: ErpResource): ErpField[] {
  const candidates = visibleFields(resource).filter(field => !["id", "organization_id"].includes(field.name) && !["any", "object"].includes(field.type));
  const priority = listColumns[resource.name] ?? [labelField(resource), "sku", "code", "status", "is_active", "quantity", "total", "created_at"];
  const rank = (name: string) => priority.includes(name) ? priority.indexOf(name) : 100;
  return [...candidates].sort((a, b) => rank(a.name) - rank(b.name)).slice(0, 5);
}
export function visibleFields(resource: ErpResource): ErpField[] {
  return resource.schema.fields.filter(field => !field["x-auto-generated"] && !["search_vector", "deleted_at"].includes(field.name) && !/secret|password|token|authorization|api_key/i.test(field.name));
}
export function relationFor(resource: ErpResource, field: string): ErpRelation | undefined {
  return resource.schema.foreignKeys?.find(relation => relation.fields.length === 1 && relation.fields[0] === field);
}
export function buildErpFilters(resource: ErpResource, search: string, field: string, value: string): CrudFilters {
  const filters: CrudFilters = [];
  const searchField = labelField(resource);
  if (search.trim()) filters.push({ field: searchField, operator: searchField === "id" ? "eq" : "contains", value: search.trim() });
  if (field && value !== "") {
    const definition = resource.schema.fields.find(item => item.name === field);
    if (!definition) throw new Error("Unknown filter field");
    filters.push({ field, operator: "eq", value: definition.type === "boolean" ? value === "true" : value });
  }
  return filters;
}
export function editableFields(resource: ErpResource, action: "create" | "edit"): ErpField[] {
  const allowed = masterFields[resource.name] ?? [];
  // Source validators: inventory numeric prices min:0; customer credit_limit
  // min:0; location/warehouse capacity integer 0..2147483647.
  const nonnegative = resource.name === "products" ? ["price", "purchase_price", "min_stock", "reorder_point", "reorder_quantity"] : resource.name === "customers" ? ["credit_limit"] : ["capacity"];
  const productChoices: Record<string, string[]> = {
    barcode_type: ["code128", "ean13", "upca", "ean8", "code39"],
    type: ["standard", "kit", "assembly"],
    tracking_type: ["none", "batch", "serial"],
  };
  return resource.schema.fields.filter(field => allowed.includes(field.name) && !(action === "edit" && (field.name === "organization_id" || (resource.name === "products" && ["currency", "type", "tracking_type"].includes(field.name)))))
    .map(field => {
      if (["customers", "suppliers"].includes(resource.name) && field.name === "currency") return { ...field, format: "currency-code" };
      // The live supplier policy restricts ratings to 0..5; retain any tighter schema bounds.
      if (resource.name === "suppliers" && field.name === "rating") return { ...field, constraints: { ...field.constraints, minimum: Math.max(0, field.constraints?.minimum ?? 0), maximum: Math.min(5, field.constraints?.maximum ?? 5) } };
      if (resource.name !== "products") return nonnegative.includes(field.name) ? { ...field, constraints: { ...field.constraints, minimum: Math.max(0, field.constraints?.minimum ?? 0) } } : field;
      const required = ["name", "sku", "price", "min_stock", "currency", "type", "tracking_type"].includes(field.name);
      return { ...field, ...(field.name === "currency" ? { format: "currency-code" } : {}), constraints: {
        ...field.constraints,
        ...(required ? { required: true } : {}),
        ...(nonnegative.includes(field.name) ? { minimum: Math.max(0, field.constraints?.minimum ?? 0) } : {}),
        ...(productChoices[field.name] ? { enum: productChoices[field.name] } : {}),
      } };
    });
}
export function writeBlocker(resource: ErpResource, action: "create" | "update" | "delete" = "create"): string {
  if (action === "delete" && !["products", "customers", "suppliers"].includes(resource.name)) return "Deletion requires a verified dependency-aware workflow and confirmation. No deletion will be sent from this view.";
  if (!masterFields[resource.name]) return "Changes require a verified workflow command. Stock, money, approvals and lifecycle transitions cannot be posted from this view.";
  if (!resource.liveVerified) return "The live schema has not been verified. Saving is unavailable until the Taruvi contract is confirmed.";
  if (resource.writeAuthorizationVerified !== true) return "Server authorization and organization isolation are not yet verified for this resource. Saving is unavailable; no data will be changed.";
  if (!resource.verifiedWriteActions?.includes(action)) return `The ${action} operation has not been verified end to end for this resource. No data will be changed.`;
  // Product creation must synchronize price/selling_price and may require
  // opening-stock posting. Never let a manifest flag enable generic table
  // writes before the verified product command is deployed and wired here.
  if (resource.name === "products" && resource.verifiedCommand !== "hmg-product-master-v1") return "Product changes require the verified product command; direct catalogue writes are unavailable.";
  if (["customers", "suppliers"].includes(resource.name) && resource.verifiedCommand !== "hmg-contact-master-v1") return "Contact changes require the verified contact command; direct writes are unavailable.";
  if (["product_locations", "warehouses"].includes(resource.name) && resource.verifiedCommand !== "hmg-contact-master-v1") return "Location and warehouse changes require the verified metadata command; direct table writes are unavailable.";
  return "";
}
const decimalPattern = /^-?\d+(?:\.\d+)?$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function validGtin(value: string, length: number): boolean {
  if (value.length !== length || !/^\d+$/.test(value)) return false;
  const data = value.slice(0, -1);
  let sum = 0;
  for (let i = data.length - 1, weight = 3; i >= 0; i--, weight = weight === 3 ? 1 : 3) sum += Number(data[i]) * weight;
  return (10 - sum % 10) % 10 === Number(value.at(-1));
}
function validateProductBarcode(barcode: string, type: unknown): void {
  const selected = typeof type === "string" ? type : "code128";
  const rules: Record<string, { valid: boolean; message: string }> = {
    code128: { valid: /^[\x20-\x7e]{1,80}$/.test(barcode), message: "printable ASCII, up to 80 characters" },
    ean13: { valid: validGtin(barcode, 13), message: "13 digits with a valid EAN-13 check digit" },
    upca: { valid: validGtin(barcode, 12), message: "12 digits with a valid UPC-A check digit" },
    ean8: { valid: validGtin(barcode, 8), message: "8 digits with a valid EAN-8 check digit" },
    code39: { valid: barcode.length <= 43 && /^[0-9A-Z\-. $/+%]+$/.test(barcode), message: "Code 39 uppercase letters, digits and permitted symbols, up to 43 characters" },
  };
  if (rules[selected] && !rules[selected].valid) throw new Error(`Barcode must use ${rules[selected].message}.`);
}
export function normalizeValues(fields: ErpField[], values: Record<string, unknown>): Record<string, unknown> {
  for (const name of Object.keys(values)) if (!fields.some(field => field.name === name)) throw new Error(`${fieldLabel(name)} cannot be changed here.`);
  const output: Record<string, unknown> = {};
  for (const field of fields) {
    const label = fieldLabel(field.name);
    let value = values[field.name];
    if (value === undefined) value = field.default;
    if (typeof value === "string") value = value.trim();
    if (value === "" || value === undefined || value === null) {
      if (field.constraints?.required) throw new Error(`${label} is required.`);
      output[field.name] = null; continue;
    }
    if (field.type === "boolean") {
      if (typeof value !== "boolean") throw new Error(`${label} must be Yes or No.`);
    } else if (field.type === "number" || field.type === "integer") {
      const text = String(value);
      if (!decimalPattern.test(text) || (field.type === "integer" && !/^-?\d+$/.test(text))) throw new Error(`${label} must be a valid ${field.type === "integer" ? "whole number" : "decimal"}.`);
      if (!Number.isFinite(Number(text))) throw new Error(`${label} is outside the supported range.`);
      if (field.constraints?.minimum !== undefined && Number(text) < field.constraints.minimum) throw new Error(`${label} must be at least ${field.constraints.minimum}.`);
      if (field.constraints?.maximum !== undefined && Number(text) > field.constraints.maximum) throw new Error(`${label} must be at most ${field.constraints.maximum}.`);
      if (field.type === "integer") {
        // Manifest integer fields use PostgreSQL INTEGER, not the wider JavaScript safe-integer domain.
        if (!Number.isSafeInteger(Number(text)) || Number(text) < -2147483648 || Number(text) > 2147483647) throw new Error(`${label} is outside the supported integer range.`);
        value = Number(text);
      } else value = text; // Decimal strings preserve precision; Python/DB remains authoritative.
    } else {
      if (typeof value !== "string") throw new Error(`${label} must be text.`);
      let normalizedText = value;
      if (field.format === "currency-code") {
        if (!/^[A-Za-z]{3}$/.test(normalizedText)) throw new Error(`${label} must contain exactly three ASCII letters.`);
        normalizedText = normalizedText.toUpperCase();
      }
      if (field.constraints?.maxLength && normalizedText.length > field.constraints.maxLength) throw new Error(`${label} must have ${field.constraints.maxLength} characters or fewer.`);
      if (field.format === "uuid" && !uuidPattern.test(normalizedText)) throw new Error(`Choose a valid ${label.toLowerCase()}.`);
      if (field.name.includes("email") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedText)) throw new Error(`${label} must contain a valid email address.`);
      if (field.type === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(normalizedText)) throw new Error(`${label} must be a date.`);
      value = normalizedText;
    }
    if (field.constraints?.enum && !field.constraints.enum.includes(value)) throw new Error(`Choose a valid ${label.toLowerCase()}.`);
    output[field.name] = value;
  }
  if (fields.some(field => field.name === "barcode_type") && typeof output.barcode === "string") validateProductBarcode(output.barcode, output.barcode_type);
  return output;
}
function canonicalDecimal(value: unknown): string | undefined {
  const text = String(value);
  if (!decimalPattern.test(text)) return undefined;
  const [whole, fraction = ""] = text.split(".");
  const digits = `${BigInt(whole)}${fraction.replace(/0+$/, "") ? `.${fraction.replace(/0+$/, "")}` : ""}`;
  return whole.startsWith("-") && BigInt(whole) === 0n && fraction.replace(/0+$/, "") ? `-${digits}` : digits;
}
export function verifyReadback(resource: ErpResource, id: string, values: Record<string, unknown>, row: Record<string, unknown>): boolean {
  const fail = () => { throw new Error("Save could not be confirmed. Check the saved record before submitting another request."); };
  if (row.id !== id) fail();
  for (const [key, expected] of Object.entries(values)) {
    const field = resource.schema.fields.find(item => item.name === key);
    const actual = row[key];
    if (field?.type === "number" && expected !== null) {
      if (canonicalDecimal(actual) === undefined || canonicalDecimal(actual) !== canonicalDecimal(expected)) fail();
    } else if (actual !== expected) fail();
  }
  return true;
}
export function initialValues(fields: ErpField[], row?: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(fields.map(field => [field.name, row ? row[field.name] ?? "" : field.default ?? ""]));
}
const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric", timeZone: "UTC" });
export function displayValue(field: ErpField, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (field.type === "boolean") return value === true ? "Yes" : "No";
  if (["date", "datetime"].includes(field.type)) return Number.isFinite(Date.parse(String(value))) ? dateFormatter.format(new Date(String(value))) : "—";
  if (typeof value === "object") return Array.isArray(value) ? `${value.length} items` : "Structured data";
  return String(value);
}
