/** Web purchase-order create contract; preview only until a verified command posts the header and lines atomically. */
export type PurchaseOrderSupplier = { id: string; name: string; currency?: string | null };
export type PurchaseOrderVariant = { id: string; title: string; sku?: string | null; purchase_price?: number | string | null; is_active?: boolean; deleted_at?: string | null };
export type PurchaseOrderProduct = { id: string; name: string; sku?: string | null; purchase_price?: number | string | null; price?: number | string | null; has_variants?: boolean; variants?: PurchaseOrderVariant[]; supplier_costs?: Array<{ supplier_id: string; cost_price?: number | string | null; supplier_sku?: string | null }> };
export type PurchaseOrderLineDraft = { product_id: string; product_variant_id: string | null; product_name: string; variant_title: string | null; sku: string; quantity: number; unit_cost: number; supplier_sku: string };
export type PurchaseOrderDraft = { supplier_id: string; order_date: string; expected_date: string; currency: string; shipping: number; tax: number; notes: string; items: PurchaseOrderLineDraft[] };
export type PurchaseOrderErrors = Record<string, string>;

export function createPurchaseOrderDraft(today: string, organizationCurrency: string): PurchaseOrderDraft {
  return { supplier_id: "", order_date: today, expected_date: "", currency: organizationCurrency, shipping: 0, tax: 0, notes: "", items: [] };
}

function finiteMoney(value: unknown): number | null {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

export function defaultPurchaseOrderUnitCost(product: PurchaseOrderProduct, supplierId: string, variant?: PurchaseOrderVariant | null): number {
  const supplierLink = product.supplier_costs?.find(link => String(link.supplier_id) === String(supplierId));
  // HMG safety deviation from legacy Inventoros: a selling price is not a
  // purchase quotation. Missing purchase cost remains zero for buyer review.
  return finiteMoney(supplierLink?.cost_price) ?? finiteMoney(variant?.purchase_price) ?? finiteMoney(product.purchase_price) ?? 0;
}

export function defaultPurchaseOrderSupplierSku(product: PurchaseOrderProduct, supplierId: string): string {
  return product.supplier_costs?.find(link => String(link.supplier_id) === String(supplierId))?.supplier_sku ?? "";
}

export function addPurchaseOrderLine(lines: PurchaseOrderLineDraft[], product: PurchaseOrderProduct, variant: PurchaseOrderVariant | null, supplierId: string, quantity: number, unitCost?: number, supplierSku?: string): PurchaseOrderLineDraft[] {
  if (!Number.isSafeInteger(quantity) || quantity < 1 || (product.has_variants && !variant)) return lines;
  const nextCost = finiteMoney(unitCost) ?? defaultPurchaseOrderUnitCost(product, supplierId, variant);
  if (purchaseOrderLineTotal({ quantity, unit_cost: nextCost }) === null) return lines;
  const existingIndex = lines.findIndex(line => line.product_id === product.id && line.product_variant_id === (variant?.id ?? null));
  if (existingIndex !== -1) {
    const combined = lines[existingIndex].quantity + quantity;
    if (purchaseOrderLineTotal({ quantity: combined, unit_cost: nextCost }) === null) return lines;
    return lines.map((line, index) => index === existingIndex ? { ...line, quantity: combined, unit_cost: nextCost } : line);
  }
  return [...lines, {
    product_id: product.id,
    product_variant_id: variant?.id ?? null,
    product_name: product.name,
    variant_title: variant?.title ?? null,
    sku: variant?.sku || product.sku || "",
    quantity,
    unit_cost: nextCost,
    supplier_sku: supplierSku ?? defaultPurchaseOrderSupplierSku(product, supplierId),
  }];
}

function safeCents(value: unknown): number | null {
  if (!validAmount(value)) return null;
  return Math.round(Number(value) * 100);
}
function purchaseOrderLineCents(line: Pick<PurchaseOrderLineDraft, "quantity" | "unit_cost">): number | null {
  const unitCents = safeCents(line.unit_cost);
  if (!Number.isSafeInteger(line.quantity) || line.quantity < 1 || unitCents === null || unitCents > Math.floor(Number.MAX_SAFE_INTEGER / line.quantity)) return null;
  return unitCents * line.quantity;
}
export function purchaseOrderLineTotal(line: Pick<PurchaseOrderLineDraft, "quantity" | "unit_cost">): number | null {
  const lineCents = purchaseOrderLineCents(line);
  return lineCents === null ? null : lineCents / 100;
}
export function purchaseOrderTotals(draft: PurchaseOrderDraft): { subtotal: number | null; tax: number | null; shipping: number | null; total: number | null } {
  let subtotalCents: number | null = 0;
  for (const line of draft.items) {
    const lineCents = purchaseOrderLineCents(line);
    if (subtotalCents === null || lineCents === null || lineCents > Number.MAX_SAFE_INTEGER - subtotalCents) { subtotalCents = null; break; }
    subtotalCents += lineCents;
  }
  const taxCents = safeCents(draft.tax);
  const shippingCents = safeCents(draft.shipping);
  const totalCents = subtotalCents === null || taxCents === null || shippingCents === null || taxCents > Number.MAX_SAFE_INTEGER - subtotalCents || shippingCents > Number.MAX_SAFE_INTEGER - subtotalCents - taxCents ? null : subtotalCents + taxCents + shippingCents;
  return { subtotal: subtotalCents === null ? null : subtotalCents / 100, tax: taxCents === null ? null : taxCents / 100, shipping: shippingCents === null ? null : shippingCents / 100, total: totalCents === null ? null : totalCents / 100 };
}

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
function validAmount(value: unknown): boolean {
  const number = finiteMoney(value);
  if (number === null) return false;
  const amountCents = number * 100;
  return Number.isSafeInteger(Math.round(amountCents)) && Math.abs(amountCents - Math.round(amountCents)) < 1e-7;
}

/** Client feedback only. Server must recheck organization-scoped FKs, costs and totals. */
export function validatePurchaseOrderDraft(draft: PurchaseOrderDraft, suppliers: PurchaseOrderSupplier[], products: PurchaseOrderProduct[]): PurchaseOrderErrors {
  const errors: PurchaseOrderErrors = {};
  if (!draft.supplier_id || !suppliers.some(supplier => supplier.id === draft.supplier_id)) errors.supplier_id = "Select a supplier in this organization.";
  if (!validDate(draft.order_date)) errors.order_date = "Enter a valid order date.";
  if (draft.expected_date && (!validDate(draft.expected_date) || !validDate(draft.order_date) || draft.expected_date < draft.order_date)) errors.expected_date = "Expected delivery must be on or after the order date.";
  if (!/^[A-Z]{3}$/.test(draft.currency)) errors.currency = "Enter a three-letter currency code.";
  if (!validAmount(draft.tax)) errors.tax = "Tax must be nonnegative with no more than two decimal places.";
  if (!validAmount(draft.shipping)) errors.shipping = "Shipping must be nonnegative with no more than two decimal places.";
  if (draft.items.length === 0) errors.items = "Add at least one product.";
  draft.items.forEach((line, index) => {
    const product = products.find(item => item.id === line.product_id);
    if (!product) errors[`items.${index}.product_id`] = "Select an available product.";
    const variant = product?.variants?.find(item => item.id === line.product_variant_id && item.is_active !== false && !item.deleted_at);
    if ((product?.has_variants && !variant) || (!product?.has_variants && line.product_variant_id)) errors[`items.${index}.product_variant_id`] = "Select an active variant of this product.";
    if (!Number.isSafeInteger(line.quantity) || line.quantity < 1) errors[`items.${index}.quantity`] = "Quantity must be a safe whole number of at least one.";
    if (!validAmount(line.unit_cost)) errors[`items.${index}.unit_cost`] = "Unit cost must be nonnegative with no more than two decimal places.";
    else if (!errors[`items.${index}.quantity`] && purchaseOrderLineTotal(line) === null) errors[`items.${index}.unit_cost`] = "Line amount exceeds the supported money range.";
    if (line.supplier_sku.length > 255) errors[`items.${index}.supplier_sku`] = "Supplier SKU must be 255 characters or fewer.";
  });
  if (draft.items.length && purchaseOrderTotals(draft).total === null) errors.total = "Purchase order total exceeds the supported money range or contains invalid amounts.";
  return errors;
}
