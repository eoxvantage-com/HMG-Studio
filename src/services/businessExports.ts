import type { CommerceDocument, CommerceState } from "./commerceLedger";
import type { ExportColumn } from "./recordExport";
import { TEMPLATES } from "./dataImport";

/** Financial, operations and master-data exports computed from the verified ledger state and catalogue. */
export type ExportKind = "sales_register" | "receivables" | "purchase_register" | "gst_summary" | "stock_valuation" | "stock_by_location"
  | "dispatch_report" | "receipts_report" | "reorder_report" | "products_master" | "customers_master" | "suppliers_master";
type Row = Record<string, unknown>;
export type ExportInput = { state: CommerceState; products: Row[]; customers: Row[]; suppliers: Row[]; locations: Row[]; categories: Row[]; from: string; to: string; today?: string };
export type ExportResult = { title: string; columns: ExportColumn[]; rows: Record<string, string>[]; totals?: Record<string, string>; note: string };

export const EXPORTS: { kind: ExportKind; group: "Financial" | "Operations" | "Master data"; title: string; description: string; dated: boolean }[] = [
  { kind: "sales_register", group: "Financial", title: "Sales register", description: "Every sales order with subtotal, GST, freight and total.", dated: true },
  { kind: "receivables", group: "Financial", title: "Receivables ageing", description: "Amounts owed by each customer, bucketed 0–30, 31–60, 61–90 and 90+ days.", dated: false },
  { kind: "purchase_register", group: "Financial", title: "Purchase register", description: "Every purchase order with supplier, GST, freight and total.", dated: true },
  { kind: "gst_summary", group: "Financial", title: "GST summary (monthly)", description: "Output GST on fulfilled sales vs input GST on received purchases.", dated: true },
  { kind: "stock_valuation", group: "Financial", title: "Stock valuation", description: "On-hand, reserved and free stock valued at cost and at selling price.", dated: false },
  { kind: "dispatch_report", group: "Operations", title: "Dispatch / production report", description: "Slabs and pieces shipped per product, with orders and value.", dated: true },
  { kind: "receipts_report", group: "Operations", title: "Goods received report", description: "Quantities received from suppliers per product.", dated: true },
  { kind: "stock_by_location", group: "Operations", title: "Stock by location", description: "Every product and yard/rack with on-hand, reserved and free quantities.", dated: false },
  { kind: "reorder_report", group: "Operations", title: "Reorder report", description: "Products at or below their reorder point with a suggested order quantity.", dated: false },
  { kind: "products_master", group: "Master data", title: "Products", description: "Catalogue in the import template format (re-importable).", dated: false },
  { kind: "customers_master", group: "Master data", title: "Customers", description: "Customer list in the import template format.", dated: false },
  { kind: "suppliers_master", group: "Master data", title: "Suppliers", description: "Supplier list in the import template format.", dated: false },
];

const s = (value: unknown) => typeof value === "string" ? value : typeof value === "number" && Number.isFinite(value) ? String(value) : "";
const n = (value: unknown) => { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : 0; };
const m = (value: number) => (Math.round(value * 100) / 100).toFixed(2);
const inRange = (date: string, from: string, to: string) => (!from || date >= from) && (!to || date <= to);
const byId = (rows: Row[]) => new Map(rows.map(row => [s(row.id), row]));
const lineSum = (record: Record<string, number>, lineId: string) => Object.entries(record).reduce((sum, [key, value]) => { try { return JSON.parse(key)[0] === lineId ? sum + value : sum; } catch { return sum; } }, 0);
const party = (doc: CommerceDocument) => doc.kind === "sales_order"
  ? (doc.draft.customer_id ? s(doc.snapshots.customers?.[doc.draft.customer_id]?.name) : s(doc.draft.customer_name)) || "—"
  : s(doc.snapshots.suppliers?.[doc.draft.supplier_id ?? ""]?.name) || "—";
const docs = (state: CommerceState, kind: CommerceDocument["kind"]) => Object.values(state.documents).filter(doc => doc.kind === kind).sort((a, b) => a.draft.order_date.localeCompare(b.draft.order_date) || a.number.localeCompare(b.number));
const OPEN_RECEIVABLE = ["approved", "partially_fulfilled", "fulfilled"];
const productName = (doc: CommerceDocument, id: string, products: Map<string, Row>) => s(doc.snapshots.products?.[id]?.name) || s(products.get(id)?.name) || "Unknown product";

function freeStock(state: CommerceState) {
  const totals = new Map<string, { quantity: number; reserved: number }>();
  for (const row of state.balances) { const current = totals.get(row.product_id) ?? { quantity: 0, reserved: 0 }; totals.set(row.product_id, { quantity: current.quantity + row.quantity, reserved: current.reserved + row.reserved }); }
  return totals;
}
const days = (from: string, to: string) => Math.max(0, Math.floor((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000));

export function buildExport(kind: ExportKind, input: ExportInput): ExportResult {
  const { state, from, to } = input; const today = input.today ?? new Date().toISOString().slice(0, 10);
  const products = byId(input.products); const categories = byId(input.categories); const locations = byId(input.locations);
  const period = from || to ? `Orders dated ${from || "start"} to ${to || "today"}.` : "All dates.";
  switch (kind) {
    case "sales_register": case "purchase_register": {
      const sales = kind === "sales_register";
      const list = docs(state, sales ? "sales_order" : "purchase_order").filter(doc => inRange(doc.draft.order_date, from, to));
      const rows = list.map(doc => ({ number: doc.number, date: doc.draft.order_date, party: party(doc), status: doc.status, subtotal: m(n(doc.subtotal)), tax: m(n(doc.draft.tax)), shipping: m(n(doc.draft.shipping)), total: m(n(doc.total)), currency: doc.draft.currency }));
      const counted = list.filter(doc => !["cancelled", "rejected"].includes(doc.status));
      return { title: sales ? "Sales register" : "Purchase register", note: `${period} Totals exclude cancelled and rejected documents. Recorded values, not payments.`,
        columns: [{ key: "number", label: sales ? "Order" : "Purchase order" }, { key: "date", label: "Date" }, { key: "party", label: sales ? "Customer" : "Supplier" }, { key: "status", label: "Status" }, { key: "subtotal", label: "Subtotal" }, { key: "tax", label: "GST / tax" }, { key: "shipping", label: "Freight" }, { key: "total", label: "Total" }, { key: "currency", label: "Currency" }],
        rows, totals: { subtotal: m(counted.reduce((sum, doc) => sum + n(doc.subtotal), 0)), tax: m(counted.reduce((sum, doc) => sum + n(doc.draft.tax), 0)), shipping: m(counted.reduce((sum, doc) => sum + n(doc.draft.shipping), 0)), total: m(counted.reduce((sum, doc) => sum + n(doc.total), 0)) } };
    }
    case "receivables": {
      const groups = new Map<string, { party: string; orders: number; oldest: string; buckets: number[]; total: number }>();
      for (const doc of docs(state, "sales_order").filter(item => OPEN_RECEIVABLE.includes(item.status))) {
        const key = doc.draft.customer_id ?? `name:${party(doc)}`; const age = days(doc.draft.order_date, today);
        const current = groups.get(key) ?? { party: party(doc), orders: 0, oldest: doc.draft.order_date, buckets: [0, 0, 0, 0], total: 0 };
        current.orders++; current.oldest = doc.draft.order_date < current.oldest ? doc.draft.order_date : current.oldest; current.total += n(doc.total);
        current.buckets[age <= 30 ? 0 : age <= 60 ? 1 : age <= 90 ? 2 : 3] += n(doc.total); groups.set(key, current);
      }
      const rows = [...groups.values()].sort((a, b) => b.total - a.total).map(item => ({ party: item.party, orders: String(item.orders), oldest: item.oldest, b0: m(item.buckets[0]), b1: m(item.buckets[1]), b2: m(item.buckets[2]), b3: m(item.buckets[3]), total: m(item.total) }));
      const sum = (index: number) => m([...groups.values()].reduce((total, item) => total + item.buckets[index], 0));
      return { title: "Receivables ageing", note: `As of ${today}. Approved and fulfilled order values; no customer payments are recorded yet, so every confirmed order counts as outstanding. Age is from the order date.`,
        columns: [{ key: "party", label: "Customer" }, { key: "orders", label: "Open orders" }, { key: "oldest", label: "Oldest order" }, { key: "b0", label: "0–30 days" }, { key: "b1", label: "31–60 days" }, { key: "b2", label: "61–90 days" }, { key: "b3", label: "90+ days" }, { key: "total", label: "Total owed" }],
        rows, totals: { b0: sum(0), b1: sum(1), b2: sum(2), b3: sum(3), total: m([...groups.values()].reduce((total, item) => total + item.total, 0)) } };
    }
    case "gst_summary": {
      const months = new Map<string, { salesTaxable: number; output: number; purchaseTaxable: number; input: number }>();
      const bucket = (date: string) => { const key = date.slice(0, 7); const current = months.get(key) ?? { salesTaxable: 0, output: 0, purchaseTaxable: 0, input: 0 }; months.set(key, current); return current; };
      for (const doc of docs(state, "sales_order").filter(item => ["fulfilled", "partially_fulfilled"].includes(item.status) && inRange(item.draft.order_date, from, to))) { const month = bucket(doc.draft.order_date); month.salesTaxable += n(doc.subtotal); month.output += n(doc.draft.tax); }
      for (const doc of docs(state, "purchase_order").filter(item => ["received", "partially_received"].includes(item.status) && inRange(item.draft.order_date, from, to))) { const month = bucket(doc.draft.order_date); month.purchaseTaxable += n(doc.subtotal); month.input += n(doc.draft.tax); }
      const rows = [...months.entries()].sort().map(([month, value]) => ({ month, sales: m(value.salesTaxable), output: m(value.output), purchases: m(value.purchaseTaxable), input: m(value.input), net: m(value.output - value.input) }));
      const all = [...months.values()];
      return { title: "GST summary", note: `${period} Indicative only: uses the tax amounts recorded on fulfilled sales and received purchases, by order month. Confirm with your accountant before filing.`,
        columns: [{ key: "month", label: "Month" }, { key: "sales", label: "Taxable sales" }, { key: "output", label: "Output GST" }, { key: "purchases", label: "Taxable purchases" }, { key: "input", label: "Input GST" }, { key: "net", label: "Net GST payable" }],
        rows, totals: { sales: m(all.reduce((t, v) => t + v.salesTaxable, 0)), output: m(all.reduce((t, v) => t + v.output, 0)), purchases: m(all.reduce((t, v) => t + v.purchaseTaxable, 0)), input: m(all.reduce((t, v) => t + v.input, 0)), net: m(all.reduce((t, v) => t + v.output - v.input, 0)) } };
    }
    case "stock_valuation": case "reorder_report": {
      const stock = freeStock(state);
      const list = input.products.filter(row => row.is_active === true && !row.deleted_at).sort((a, b) => s(a.name).localeCompare(s(b.name)));
      if (kind === "reorder_report") {
        const rows = list.map(row => { const total = stock.get(s(row.id)) ?? { quantity: 0, reserved: 0 }; const free = total.quantity - total.reserved; const point = row.reorder_point != null ? n(row.reorder_point) : n(row.min_stock); return { row, free, point, total }; })
          .filter(item => item.point > 0 && item.free <= item.point)
          .map(({ row, free, point, total }) => ({ sku: s(row.sku), name: s(row.name), category: s(categories.get(s(row.category_id))?.name) || "—", on_hand: String(total.quantity), free: String(free), point: String(point), suggested: String(row.reorder_quantity != null && n(row.reorder_quantity) > 0 ? n(row.reorder_quantity) : Math.max(1, point * 2 - free)), cost: m(n(row.purchase_price)), value: m((row.reorder_quantity != null && n(row.reorder_quantity) > 0 ? n(row.reorder_quantity) : Math.max(1, point * 2 - free)) * n(row.purchase_price)) }));
        return { title: "Reorder report", note: `As of ${today}. Free stock = on hand minus reserved. Reorder point falls back to minimum stock; suggested quantity uses the product's reorder quantity, otherwise twice the point minus free stock.`,
          columns: [{ key: "sku", label: "SKU" }, { key: "name", label: "Product" }, { key: "category", label: "Category" }, { key: "on_hand", label: "On hand" }, { key: "free", label: "Free" }, { key: "point", label: "Reorder point" }, { key: "suggested", label: "Suggested order" }, { key: "cost", label: "Unit cost" }, { key: "value", label: "Order value at cost" }],
          rows, totals: { value: m(rows.reduce((t, r) => t + n(r.value), 0)) } };
      }
      const rows = list.map(row => { const total = stock.get(s(row.id)) ?? { quantity: 0, reserved: 0 }; return { sku: s(row.sku), name: s(row.name), category: s(categories.get(s(row.category_id))?.name) || "—", on_hand: String(total.quantity), reserved: String(total.reserved), free: String(total.quantity - total.reserved), cost: m(n(row.purchase_price)), cost_value: m(total.quantity * n(row.purchase_price)), price: m(n(row.selling_price)), sell_value: m(total.quantity * n(row.selling_price)) }; });
      return { title: "Stock valuation", note: `As of ${today}. Active products only. Values = on-hand quantity × recorded unit cost / selling price; not an accounting valuation.`,
        columns: [{ key: "sku", label: "SKU" }, { key: "name", label: "Product" }, { key: "category", label: "Category" }, { key: "on_hand", label: "On hand" }, { key: "reserved", label: "Reserved" }, { key: "free", label: "Free" }, { key: "cost", label: "Unit cost" }, { key: "cost_value", label: "Value at cost" }, { key: "price", label: "Selling price" }, { key: "sell_value", label: "Value at selling price" }],
        rows, totals: { on_hand: String(rows.reduce((t, r) => t + n(r.on_hand), 0)), cost_value: m(rows.reduce((t, r) => t + n(r.cost_value), 0)), sell_value: m(rows.reduce((t, r) => t + n(r.sell_value), 0)) } };
    }
    case "stock_by_location": {
      const rows = state.balances.filter(row => row.quantity > 0 || row.reserved > 0).map(row => ({ sku: s(products.get(row.product_id)?.sku), name: s(products.get(row.product_id)?.name) || "Unknown product", location: s(locations.get(row.location_id)?.name) || "Unknown location", on_hand: String(row.quantity), reserved: String(row.reserved), free: String(row.quantity - row.reserved) }))
        .sort((a, b) => a.name.localeCompare(b.name) || a.location.localeCompare(b.location));
      return { title: "Stock by location", note: `As of ${today}. Ledger balances with stock or reservations.`, columns: [{ key: "sku", label: "SKU" }, { key: "name", label: "Product" }, { key: "location", label: "Location" }, { key: "on_hand", label: "On hand" }, { key: "reserved", label: "Reserved" }, { key: "free", label: "Free" }], rows,
        totals: { on_hand: String(rows.reduce((t, r) => t + n(r.on_hand), 0)), reserved: String(rows.reduce((t, r) => t + n(r.reserved), 0)), free: String(rows.reduce((t, r) => t + n(r.free), 0)) } };
    }
    case "dispatch_report": case "receipts_report": {
      const dispatch = kind === "dispatch_report";
      const totals = new Map<string, { name: string; quantity: number; orders: Set<string>; value: number }>();
      for (const doc of docs(state, dispatch ? "sales_order" : "purchase_order").filter(item => inRange(item.draft.order_date, from, to))) {
        for (const line of doc.draft.items) {
          const quantity = lineSum(dispatch ? doc.fulfilled : doc.received, line.line_id); if (!quantity) continue;
          const current = totals.get(line.product_id) ?? { name: productName(doc, line.product_id, products), quantity: 0, orders: new Set<string>(), value: 0 };
          current.quantity += quantity; current.orders.add(doc.id); current.value += quantity * n(dispatch ? line.unit_price : line.unit_cost); totals.set(line.product_id, current);
        }
      }
      const rows = [...totals.entries()].sort((a, b) => b[1].quantity - a[1].quantity).map(([id, item]) => ({ sku: s(products.get(id)?.sku), name: item.name, quantity: String(item.quantity), orders: String(item.orders.size), value: m(item.value) }));
      return { title: dispatch ? "Dispatch report" : "Goods received report", note: `${period} Quantities actually ${dispatch ? "shipped (posted fulfillments)" : "received (posted receipts)"}, grouped by product. Value at the order line ${dispatch ? "price" : "cost"}.`,
        columns: [{ key: "sku", label: "SKU" }, { key: "name", label: "Product" }, { key: "quantity", label: dispatch ? "Quantity shipped" : "Quantity received" }, { key: "orders", label: dispatch ? "Orders" : "Purchase orders" }, { key: "value", label: dispatch ? "Sales value" : "Purchase value" }], rows,
        totals: { quantity: String(rows.reduce((t, r) => t + n(r.quantity), 0)), value: m(rows.reduce((t, r) => t + n(r.value), 0)) } };
    }
    case "products_master": {
      const columns = TEMPLATES.products.columns.map(column => ({ key: column.key, label: column.label }));
      const rows = input.products.filter(row => !row.deleted_at).sort((a, b) => s(a.sku).localeCompare(s(b.sku))).map(row => ({ sku: s(row.sku), name: s(row.name), category: s(categories.get(s(row.category_id))?.name), selling_price: row.selling_price == null ? "" : m(n(row.selling_price)), purchase_price: row.purchase_price == null ? "" : m(n(row.purchase_price)), min_stock: s(row.min_stock), reorder_point: s(row.reorder_point), reorder_quantity: s(row.reorder_quantity), barcode: s(row.barcode), description: s(row.description), notes: s(row.notes), is_active: row.is_active === false ? "no" : "yes" }));
      return { title: "Products", columns, rows, note: "Import template format. Stock is not included; see Stock valuation." };
    }
    case "customers_master": case "suppliers_master": {
      const table = kind === "customers_master" ? "customers" : "suppliers";
      const columns = TEMPLATES[table].columns.map(column => ({ key: column.key, label: column.label }));
      const rows = (table === "customers" ? input.customers : input.suppliers).filter(row => !row.deleted_at).sort((a, b) => s(a.name).localeCompare(s(b.name))).map(row => Object.fromEntries(columns.map(column => [column.key, s(row[column.key])])));
      return { title: table === "customers" ? "Customers" : "Suppliers", columns, rows, note: "Import template format." };
    }
  }
}
