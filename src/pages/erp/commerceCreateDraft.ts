export type OrderCreateItem = { product_id: string; product_variant_id: string | null; product_name: string; sku: string; quantity: number; unit_price: number };
export type OrderCreateDraft = { organization_id: string; customer_name: string; customer_id: string | null; customer_email: string; customer_address: string; order_date: string; currency: string; notes: string; tax: number; shipping: number; items: OrderCreateItem[] };
export type ReturnCreateLine = { order_item_id: string; product_id: string; quantity: number; returnable_quantity: number; condition: "new" | "used" | "damaged"; restock: boolean };
export type CreateErrors = Record<string, string>;
export function emptyOrderDraft(today: string, currency: string): OrderCreateDraft { return { organization_id:"", customer_name:"", customer_id:null, customer_email:"", customer_address:"", order_date:today, currency, notes:"", tax:0, shipping:0, items:[] }; }
const amountCents = (value: unknown): number | null => {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return null;
  const cents = Math.round(value * 100);
  return Number.isSafeInteger(cents) && Math.abs(value * 100 - cents) < 1e-7 ? cents : null;
};
const isDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
};
export function validateOrderDraft(draft: OrderCreateDraft): CreateErrors {
  const errors: CreateErrors = {};
  if (!draft.organization_id) errors.organization_id = "Choose an organization.";
  if (!draft.customer_name.trim() || draft.customer_name.trim().length > 255) errors.customer_name = "Enter a customer name up to 255 characters.";
  if (draft.customer_email && (!/^\S+@\S+\.\S+$/.test(draft.customer_email) || draft.customer_email.length > 255)) errors.customer_email = "Enter a valid email address.";
  if (!isDate(draft.order_date)) errors.order_date = "Enter a valid order date.";
  if (!/^[A-Z]{3}$/.test(draft.currency)) errors.currency = "Choose a supported currency.";
  if (amountCents(draft.tax) === null) errors.tax = "Tax must be a nonnegative amount with up to two decimals.";
  if (amountCents(draft.shipping) === null) errors.shipping = "Shipping must be a nonnegative amount with up to two decimals.";
  if (!draft.items.length) errors.items = "Add at least one order item.";
  draft.items.forEach((item, index) => {
    if (!item.product_id) errors[`items.${index}.product_id`] = "Choose a product.";
    if (!Number.isSafeInteger(item.quantity) || item.quantity < 1) errors[`items.${index}.quantity`] = "Quantity must be a whole number of at least one.";
    if (amountCents(item.unit_price) === null) errors[`items.${index}.unit_price`] = "Unit price must be nonnegative with up to two decimals.";
    else if (Number.isSafeInteger(item.quantity) && item.quantity > 0 && !Number.isSafeInteger(amountCents(item.unit_price)! * item.quantity)) errors[`items.${index}.unit_price`] = "Line total exceeds the supported range.";
  });
  if (orderTotals(draft).total === null) errors.total = "Order total exceeds the supported money range.";
  return errors;
}
export function orderTotals(draft: OrderCreateDraft): { subtotal: number | null; tax: number | null; shipping: number | null; total: number | null } {
  const tax = amountCents(draft.tax); const shipping = amountCents(draft.shipping);
  let subtotal = 0;
  for (const item of draft.items) {
    const cents = amountCents(item.unit_price);
    if (cents === null || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || !Number.isSafeInteger(cents * item.quantity) || !Number.isSafeInteger(subtotal + cents * item.quantity)) return { subtotal: null, tax: tax === null ? null : tax / 100, shipping: shipping === null ? null : shipping / 100, total: null };
    subtotal += cents * item.quantity;
  }
  const total = tax === null || shipping === null || !Number.isSafeInteger(subtotal + tax + shipping) ? null : (subtotal + tax + shipping) / 100;
  return { subtotal: subtotal / 100, tax: tax === null ? null : tax / 100, shipping: shipping === null ? null : shipping / 100, total };
}
export function validateReturnLines(lines: ReturnCreateLine[]): CreateErrors {
  const errors: CreateErrors = {};
  if (!lines.length) errors.items = "Select at least one eligible order line.";
  const seen = new Set<string>();
  lines.forEach((line, index) => {
    if (!line.order_item_id || !line.product_id || seen.has(line.order_item_id)) errors[`items.${index}.order_item_id`] = "Each selected order line must be unique and valid.";
    seen.add(line.order_item_id);
    if (!Number.isSafeInteger(line.quantity) || line.quantity < 1 || !Number.isSafeInteger(line.returnable_quantity) || line.returnable_quantity < 0 || line.quantity > line.returnable_quantity) errors[`items.${index}.quantity`] = "Quantity must be within the remaining eligible quantity.";
    if (!["new", "used", "damaged"].includes(line.condition)) errors[`items.${index}.condition`] = "Choose a valid item condition.";
    if (line.condition === "damaged" && line.restock) errors[`items.${index}.restock`] = "Damaged items cannot be marked for restock.";
  });
  return errors;
}
