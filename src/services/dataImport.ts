/**
 * CSV templates, parsing and row validation for bulk imports.
 * Writes always go through the verified master commands / ledger; this module
 * only turns a spreadsheet into validated, deterministic command payloads.
 */
export type ImportKind = "products" | "customers" | "suppliers" | "purchase_orders";
export type TemplateColumn = { key: string; label: string; required?: boolean; help: string };
export type ImportIssue = { row: number; message: string };

const NAMESPACE = "8d0c5b6e-2f0e-4b8a-9a55-4f6c9b1d2e77";

/** Deterministic UUID v5 so re-uploading the same file replays instead of duplicating. */
export async function uuidV5(name: string, namespace = NAMESPACE): Promise<string> {
  const ns = namespace.replace(/-/g, "").match(/.{2}/g)!.map(byte => parseInt(byte, 16));
  const bytes = new Uint8Array([...ns, ...new TextEncoder().encode(name)]);
  const hash = new Uint8Array(await crypto.subtle.digest("SHA-1", bytes)).slice(0, 16);
  hash[6] = (hash[6] & 0x0f) | 0x50; hash[8] = (hash[8] & 0x3f) | 0x80;
  const hex = [...hash].map(byte => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export const TEMPLATES: Record<ImportKind, { title: string; description: string; columns: TemplateColumn[]; sample: Record<string, string>[] }> = {
  products: {
    title: "Products", description: "Stone slabs, tiles and basins with prices. Existing SKUs are skipped, never overwritten.",
    columns: [
      { key: "sku", label: "sku", required: true, help: "Unique product code, e.g. HMG-MAR-STAT-20" },
      { key: "name", label: "name", required: true, help: "Product name" },
      { key: "category", label: "category", help: "Existing category name, e.g. Marble" },
      { key: "selling_price", label: "selling_price", required: true, help: "Price per unit in the organization currency (no symbols)" },
      { key: "purchase_price", label: "purchase_price", help: "Cost per unit" },
      { key: "min_stock", label: "min_stock", help: "Minimum stock before reorder (whole number)" },
      { key: "reorder_point", label: "reorder_point", help: "Reorder point (whole number)" },
      { key: "reorder_quantity", label: "reorder_quantity", help: "Suggested reorder quantity" },
      { key: "barcode", label: "barcode", help: "Optional barcode value" },
      { key: "description", label: "description", help: "Finish, thickness, size, application" },
      { key: "notes", label: "notes", help: "Internal notes" },
      { key: "is_active", label: "is_active", help: "yes or no (default yes)" },
    ],
    sample: [
      { sku: "HMG-MAR-STAT-20", name: "Statuario Marble Slab 20mm", category: "Marble", selling_price: "28500", purchase_price: "19400", min_stock: "6", reorder_point: "8", reorder_quantity: "12", barcode: "", description: "Polished, 20mm, approx. 120 x 70 in", notes: "", is_active: "yes" },
      { sku: "HMG-GRA-ABS-18", name: "Absolute Black Granite 18mm", category: "Granite", selling_price: "6800", purchase_price: "4600", min_stock: "20", reorder_point: "25", reorder_quantity: "40", barcode: "", description: "Leather finish kitchen counters", notes: "", is_active: "yes" },
    ],
  },
  customers: {
    title: "Customers", description: "Architects, builders and project buyers. Rows matching an existing name or email are skipped.",
    columns: [
      { key: "name", label: "name", required: true, help: "Customer or project name" },
      { key: "code", label: "code", help: "Your customer code" },
      { key: "company_name", label: "company_name", help: "Company" },
      { key: "contact_name", label: "contact_name", help: "Contact person" },
      { key: "email", label: "email", help: "Email address" },
      { key: "phone", label: "phone", help: "Phone number" },
      { key: "tax_id", label: "tax_id", help: "GSTIN" },
      { key: "payment_terms", label: "payment_terms", help: "e.g. Net 30" },
      { key: "credit_limit", label: "credit_limit", help: "Credit limit amount" },
      { key: "currency", label: "currency", help: "3-letter code; defaults to the organization currency" },
      { key: "billing_address", label: "billing_address", help: "Street" }, { key: "billing_city", label: "billing_city", help: "City" },
      { key: "billing_state", label: "billing_state", help: "State" }, { key: "billing_zip_code", label: "billing_zip_code", help: "PIN code" },
      { key: "billing_country", label: "billing_country", help: "Country" },
      { key: "shipping_address", label: "shipping_address", help: "Delivery street" }, { key: "shipping_city", label: "shipping_city", help: "City" },
      { key: "shipping_state", label: "shipping_state", help: "State" }, { key: "shipping_zip_code", label: "shipping_zip_code", help: "PIN code" },
      { key: "shipping_country", label: "shipping_country", help: "Country" },
      { key: "notes", label: "notes", help: "Internal notes" },
    ],
    sample: [
      { name: "Lakeview Residences", code: "CUST-101", company_name: "Lakeview Developers Pvt Ltd", contact_name: "Anita Rao", email: "anita@lakeview.example", phone: "+91 98450 00000", tax_id: "29ABCDE1234F1Z5", payment_terms: "Net 30", credit_limit: "500000", currency: "INR", billing_address: "12 MG Road", billing_city: "Bengaluru", billing_state: "Karnataka", billing_zip_code: "560001", billing_country: "India", shipping_address: "Site 4, Hebbal", shipping_city: "Bengaluru", shipping_state: "Karnataka", shipping_zip_code: "560024", shipping_country: "India", notes: "" },
    ],
  },
  suppliers: {
    title: "Suppliers", description: "Quarries and stone suppliers. Rows matching an existing name or code are skipped.",
    columns: [
      { key: "name", label: "name", required: true, help: "Supplier name" }, { key: "code", label: "code", help: "Supplier code" },
      { key: "contact_name", label: "contact_name", help: "Contact person" }, { key: "email", label: "email", help: "Email" },
      { key: "phone", label: "phone", help: "Phone" }, { key: "address", label: "address", help: "Street" },
      { key: "city", label: "city", help: "City" }, { key: "state", label: "state", help: "State" },
      { key: "zip_code", label: "zip_code", help: "PIN / ZIP" }, { key: "country", label: "country", help: "Country" },
      { key: "website", label: "website", help: "https://…" }, { key: "payment_terms", label: "payment_terms", help: "e.g. 50% advance" },
      { key: "currency", label: "currency", help: "3-letter code; defaults to the organization currency" },
      { key: "rating", label: "rating", help: "1 to 5" }, { key: "notes", label: "notes", help: "Internal notes" },
    ],
    sample: [
      { name: "Rajasthan Marble Quarries", code: "SUP-201", contact_name: "Vikram Singh", email: "sales@rajmarble.example", phone: "+91 94140 00000", address: "RIICO Industrial Area", city: "Kishangarh", state: "Rajasthan", zip_code: "305801", country: "India", website: "", payment_terms: "50% advance", currency: "INR", rating: "4", notes: "" },
    ],
  },
  purchase_orders: {
    title: "Purchase orders", description: "One row per order line. Rows with the same po_reference become one purchase order. Re-uploading the same reference never creates a duplicate.",
    columns: [
      { key: "po_reference", label: "po_reference", required: true, help: "Your PO number; groups lines into one order" },
      { key: "supplier", label: "supplier", required: true, help: "Existing supplier name or code" },
      { key: "order_date", label: "order_date", required: true, help: "YYYY-MM-DD" },
      { key: "expected_date", label: "expected_date", help: "YYYY-MM-DD, on or after the order date" },
      { key: "product_sku", label: "product_sku", required: true, help: "Existing product SKU" },
      { key: "quantity", label: "quantity", required: true, help: "Whole number" },
      { key: "unit_cost", label: "unit_cost", required: true, help: "Cost per unit" },
      { key: "tax", label: "tax", help: "Order tax (first line of the order only)" },
      { key: "shipping", label: "shipping", help: "Order freight (first line of the order only)" },
      { key: "notes", label: "notes", help: "Order notes (first line of the order only)" },
    ],
    sample: [
      { po_reference: "PO-2025-014", supplier: "SUP-201", order_date: "2025-09-12", expected_date: "2025-10-01", product_sku: "HMG-MAR-STAT-20", quantity: "10", unit_cost: "19400", tax: "34920", shipping: "12000", notes: "Container lot 3" },
      { po_reference: "PO-2025-014", supplier: "SUP-201", order_date: "2025-09-12", expected_date: "2025-10-01", product_sku: "HMG-GRA-ABS-18", quantity: "20", unit_cost: "4600", tax: "", shipping: "", notes: "" },
    ],
  },
};

const quote = (value: string) => /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
export function templateCsv(kind: ImportKind): string {
  const template = TEMPLATES[kind];
  const lines = [template.columns.map(column => column.label), ...template.sample.map(row => template.columns.map(column => row[column.key] ?? ""))];
  return "\uFEFF" + lines.map(line => line.map(quote).join(",")).join("\r\n") + "\r\n";
}

/** RFC 4180 parser: quoted fields, escaped quotes, embedded newlines, BOM, CRLF. */
export function parseCsv(input: string): string[][] {
  const text = input.replace(/^\uFEFF/, "");
  const rows: string[][] = []; let field = ""; let row: string[] = []; let quoted = false;
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') { field += '"'; index++; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"' && field === "") quoted = true;
    else if (char === ",") { row.push(field); field = ""; }
    else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[index + 1] === "\n") index++;
      row.push(field); field = ""; rows.push(row); row = [];
    } else field += char;
  }
  if (quoted) throw new Error("The file has an unclosed quote. Check the row with a quotation mark.");
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows.filter(cells => cells.some(cell => cell.trim() !== ""));
}

export type ParsedSheet = { rows: { line: number; values: Record<string, string> }[]; issues: ImportIssue[] };
export const MAX_IMPORT_ROWS = 500;
export function readSheet(kind: ImportKind, csv: string): ParsedSheet {
  const table = parseCsv(csv);
  if (!table.length) return { rows: [], issues: [{ row: 0, message: "The file is empty." }] };
  const header = table[0].map(cell => cell.trim().toLowerCase().replace(/\s+/g, "_"));
  const known = new Set(TEMPLATES[kind].columns.map(column => column.key));
  const issues: ImportIssue[] = [];
  for (const column of TEMPLATES[kind].columns.filter(item => item.required)) if (!header.includes(column.key)) issues.push({ row: 1, message: `Missing required column "${column.key}". Use the template header row.` });
  const unknown = header.filter(name => name && !known.has(name));
  if (unknown.length) issues.push({ row: 1, message: `Ignored unknown columns: ${unknown.join(", ")}.` });
  const body = table.slice(1);
  if (body.length > MAX_IMPORT_ROWS) issues.push({ row: 0, message: `Only the first ${MAX_IMPORT_ROWS} rows are imported per file. Split larger files.` });
  const rows = body.slice(0, MAX_IMPORT_ROWS).map((cells, index) => ({ line: index + 2, values: Object.fromEntries(header.map((name, column) => [name, (cells[column] ?? "").trim()]).filter(([name]) => known.has(name))) }));
  return { rows, issues };
}

const MONEY = /^\d+(?:\.\d{1,2})?$/;
export const cleanMoney = (value: string) => value.replace(/[₹$,\s]/g, "");
const money = (value: string) => { const clean = cleanMoney(value); return MONEY.test(clean) ? (Number(clean)).toFixed(2) : null; };
const whole = (value: string) => /^\d+$/.test(value.trim()) ? Number(value) : null;
const date = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
const email = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const yes = (value: string) => !value || /^(y|yes|true|1|active)$/i.test(value) ? true : /^(n|no|false|0|inactive)$/i.test(value) ? false : null;
const optional = (values: Record<string, string>, keys: string[]) => Object.fromEntries(keys.filter(key => values[key]).map(key => [key, values[key]]));

export type Lookup = { id: string; name?: unknown; code?: unknown; email?: unknown; sku?: unknown };
const norm = (value: unknown) => typeof value === "string" ? value.trim().toLowerCase() : "";
export type PreparedRow = { line: number; key: string; label: string; status: "ready" | "skip" | "error"; message: string; payload?: Record<string, unknown> };

export function prepareProducts(sheet: ParsedSheet, context: { categories: Lookup[]; existingSkus: Set<string> }): PreparedRow[] {
  const seen = new Set<string>();
  return sheet.rows.map(({ line, values }) => {
    const sku = values.sku ?? ""; const label = `${values.name || "—"} (${sku || "no SKU"})`; const fail = (message: string): PreparedRow => ({ line, key: sku, label, status: "error", message });
    if (!sku) return fail("SKU is required.");
    if (!values.name) return fail("Name is required.");
    if (seen.has(norm(sku))) return fail("Duplicate SKU in this file.");
    seen.add(norm(sku));
    if (context.existingSkus.has(norm(sku))) return { line, key: sku, label, status: "skip", message: "SKU already exists; left unchanged." };
    const price = money(values.selling_price ?? ""); if (price === null) return fail("selling_price must be a number with up to 2 decimals.");
    const cost = values.purchase_price ? money(values.purchase_price) : undefined; if (cost === null) return fail("purchase_price must be a number.");
    const numbers: Record<string, number> = {};
    for (const key of ["min_stock", "reorder_point", "reorder_quantity"]) { if (!values[key]) continue; const parsed = whole(values[key]); if (parsed === null) return fail(`${key} must be a whole number.`); numbers[key] = parsed; }
    const active = yes(values.is_active ?? ""); if (active === null) return fail("is_active must be yes or no.");
    let category_id: string | undefined;
    if (values.category) { const match = context.categories.find(item => norm(item.name) === norm(values.category)); if (!match) return fail(`Unknown category "${values.category}". Create it under Categories first.`); category_id = match.id; }
    return { line, key: sku, label, status: "ready", message: "Will be created.", payload: { sku, name: values.name, price, ...(cost ? { purchase_price: cost } : {}), min_stock: numbers.min_stock ?? 0, ...(numbers.reorder_point !== undefined ? { reorder_point: numbers.reorder_point } : {}), ...(numbers.reorder_quantity !== undefined ? { reorder_quantity: numbers.reorder_quantity } : {}), ...(category_id ? { category_id } : {}), ...optional(values, ["barcode", "description", "notes"]), ...(values.barcode ? { barcode_type: "code128" } : {}), is_active: active } };
  });
}

export function prepareContacts(kind: "customers" | "suppliers", sheet: ParsedSheet, context: { existing: Lookup[]; currency: string }): PreparedRow[] {
  const fields = TEMPLATES[kind].columns.map(column => column.key);
  const seen = new Set<string>();
  return sheet.rows.map(({ line, values }) => {
    const label = values.name || "—"; const fail = (message: string): PreparedRow => ({ line, key: values.name ?? "", label, status: "error", message });
    if (!values.name) return fail("Name is required.");
    if (values.email && !email(values.email)) return fail("Email is not valid.");
    if (values.currency && !/^[A-Za-z]{3}$/.test(values.currency)) return fail("currency must be a 3-letter code such as INR.");
    if (kind === "customers" && values.credit_limit && money(values.credit_limit) === null) return fail("credit_limit must be a number.");
    if (kind === "suppliers" && values.rating && !/^[1-5]$/.test(values.rating)) return fail("rating must be 1 to 5.");
    if (kind === "suppliers" && values.website && !/^https?:\/\//i.test(values.website)) return fail("website must start with http:// or https://.");
    const identity = norm(values.code) || norm(values.email) || norm(values.name);
    if (seen.has(identity)) return fail("Duplicate row in this file.");
    seen.add(identity);
    const duplicate = context.existing.find(item => norm(item.name) === norm(values.name) || (values.email && norm(item.email) === norm(values.email)) || (values.code && norm(item.code) === norm(values.code)));
    if (duplicate) return { line, key: identity, label, status: "skip", message: "Already exists (same name, email or code); left unchanged." };
    const payload: Record<string, unknown> = Object.fromEntries(fields.filter(key => values[key]).map(key => [key, values[key]]));
    payload.currency = (values.currency || context.currency).toUpperCase();
    if (kind === "customers" && values.credit_limit) payload.credit_limit = money(values.credit_limit);
    if (kind === "suppliers" && values.rating) payload.rating = Number(values.rating);
    payload.is_active = true;
    return { line, key: identity, label, status: "ready", message: "Will be created.", payload };
  });
}

export type PurchaseImport = { reference: string; lines: number[]; label: string; status: "ready" | "error"; message: string; document?: Record<string, unknown> };
export function preparePurchaseOrders(sheet: ParsedSheet, context: { suppliers: Lookup[]; products: Lookup[]; currency: string }): PurchaseImport[] {
  const groups = new Map<string, { line: number; values: Record<string, string> }[]>();
  for (const row of sheet.rows) { const key = row.values.po_reference ?? ""; groups.set(key, [...(groups.get(key) ?? []), row]); }
  return [...groups.entries()].map(([reference, rows]) => {
    const lines = rows.map(row => row.line); const head = rows[0].values;
    const fail = (message: string): PurchaseImport => ({ reference, lines, label: reference || "(no reference)", status: "error", message });
    if (!reference) return fail("po_reference is required on every row.");
    const supplier = context.suppliers.find(item => norm(item.code) === norm(head.supplier) || norm(item.name) === norm(head.supplier));
    if (!supplier) return fail(`Unknown supplier "${head.supplier}". Import or create the supplier first.`);
    if (rows.some(row => norm(row.values.supplier) !== norm(head.supplier))) return fail("All lines of one PO must use the same supplier.");
    if (!date(head.order_date ?? "")) return fail("order_date must be YYYY-MM-DD.");
    if (head.expected_date && (!date(head.expected_date) || head.expected_date < head.order_date)) return fail("expected_date must be YYYY-MM-DD and not before the order date.");
    const tax = head.tax ? money(head.tax) : "0.00"; const shipping = head.shipping ? money(head.shipping) : "0.00";
    if (tax === null || shipping === null) return fail("tax and shipping must be numbers.");
    const items: Record<string, unknown>[] = [];
    for (const row of rows) {
      const product = context.products.find(item => norm(item.sku) === norm(row.values.product_sku));
      if (!product) return fail(`Line ${row.line}: unknown product SKU "${row.values.product_sku}".`);
      const quantity = whole(row.values.quantity ?? ""); if (!quantity) return fail(`Line ${row.line}: quantity must be a whole number of at least 1.`);
      const cost = money(row.values.unit_cost ?? ""); if (cost === null) return fail(`Line ${row.line}: unit_cost must be a number.`);
      items.push({ product_id: product.id, product_variant_id: null, quantity, unit_cost: cost, supplier_sku: null, _line: row.line });
    }
    // The ledger checks at most 20 references per document: the supplier plus 19 distinct products.
    if (new Set(items.map(item => item.product_id)).size > 19) return fail("A purchase order can have at most 19 different products. Split it into two references.");
    if (items.length > 100) return fail("A purchase order can have at most 100 lines.");
    const notes = [`Imported ${reference}`, head.notes].filter(Boolean).join(" · ");
    return { reference, lines, label: `${reference} · ${typeof supplier.name === "string" ? supplier.name : ""} · ${items.length} line${items.length === 1 ? "" : "s"}`, status: "ready", message: "Will be created as a pending purchase order.",
      document: { supplier_id: supplier.id, order_date: head.order_date, expected_date: head.expected_date || null, currency: context.currency, notes, tax, shipping, items } };
  });
}
