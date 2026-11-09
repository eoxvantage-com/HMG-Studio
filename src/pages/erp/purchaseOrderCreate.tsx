import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link as RouterLink } from "react-router";
import { Alert, Autocomplete, Box, Breadcrumbs, Button, Card, CardContent, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Link, Skeleton, Stack, TextField, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { PageContainer } from "../../components/PageContainer";
import { addPurchaseOrderLine, createPurchaseOrderDraft, defaultPurchaseOrderSupplierSku, defaultPurchaseOrderUnitCost, purchaseOrderLineTotal, purchaseOrderTotals, validatePurchaseOrderDraft, type PurchaseOrderDraft, type PurchaseOrderProduct, type PurchaseOrderSupplier, type PurchaseOrderVariant } from "./purchaseOrderDraft";

export type PurchaseOrderCreateProps = {
  /** Must be real, organization-scoped provider results; never hardcode catalogue records. */
  suppliers: PurchaseOrderSupplier[];
  products: PurchaseOrderProduct[];
  lookupStatus: "loading" | "ready" | "error";
  organizationCurrency: string;
  today?: string;
  lookupError?: string;
  onSupplierSearch?: (query: string) => void;
  onSupplierSelected?: (supplierId: string | null) => void;
  onProductSearch?: (query: string) => void;
  onProductSelected?: (productId: string | null) => void;
  organizationSelector?: ReactNode;
  /** Changing this scope discards all unsaved lines and resets references. */
  scopeKey?: string;
  /** Only the verified atomic header+lines command should be passed here. It must read back before resolving. */
  onSubmit?: (draft: PurchaseOrderDraft) => Promise<void>;
  /** Empty only after backend command, role, RLS and readback verification. */
  writeBlocker?: string;
};

const DEFAULT_BLOCKER = "The atomic purchase order command has not been deployed and verified. This draft is not saved, and no stock or financial data will change.";
const dateToday = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
const numberInput = (value: string) => value === "" ? 0 : Number(value);
const validLineMoney = (value: number) => Number.isFinite(value) && value >= 0 && Number.isSafeInteger(Math.round(value * 100)) && Math.abs(value * 100 - Math.round(value * 100)) < 1e-7;

export function PurchaseOrderCreate({ suppliers, products, lookupStatus, organizationCurrency, today, lookupError, onSupplierSearch, onSupplierSelected, onProductSearch, onProductSelected, organizationSelector, scopeKey, onSubmit, writeBlocker = DEFAULT_BLOCKER }: PurchaseOrderCreateProps) {
  const [draft, setDraft] = useState<PurchaseOrderDraft>(() => createPurchaseOrderDraft(today ?? dateToday(), organizationCurrency));
  const [selectedSupplier, setSelectedSupplier] = useState<PurchaseOrderSupplier | null>(null);
  const [pendingSupplier, setPendingSupplier] = useState<PurchaseOrderSupplier | null | undefined>(undefined);
  const [knownProducts, setKnownProducts] = useState<PurchaseOrderProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<PurchaseOrderProduct | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<PurchaseOrderVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [unitCost, setUnitCost] = useState(0);
  const [supplierSku, setSupplierSku] = useState("");
  const [unitCostEdited, setUnitCostEdited] = useState(false);
  const [supplierSkuEdited, setSupplierSkuEdited] = useState(false);
  const [taxRate, setTaxRate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lineError, setLineError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const previousScope = useRef(scopeKey);
  const supplier = selectedSupplier;
  const currentProduct = products.find(item => item.id === selectedProduct?.id) ?? selectedProduct;
  const activeVariants = useMemo(() => currentProduct?.variants?.filter(item => item.is_active !== false && !item.deleted_at) ?? [], [currentProduct]);
  const totals = purchaseOrderTotals(draft);
  const money = (amount: number | null) => amount === null || !Number.isFinite(amount) ? "Unavailable" : `${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${draft.currency}`;

  useEffect(() => {
    if (previousScope.current === scopeKey) return;
    previousScope.current = scopeKey;
    setDraft(createPurchaseOrderDraft(today ?? dateToday(), organizationCurrency));
    setSelectedSupplier(null); setPendingSupplier(undefined); setKnownProducts([]); setSelectedProduct(null); setSelectedVariant(null);
    setQuantity(1); setUnitCost(0); setSupplierSku(""); setUnitCostEdited(false); setSupplierSkuEdited(false); setTaxRate("");
    setErrors({}); setLineError(""); setSubmitError("");
    onSupplierSelected?.(null);
    onProductSelected?.(null);
  }, [scopeKey, organizationCurrency, today]);

  useEffect(() => {
    if (!taxRate.trim()) return;
    const rate = Number(taxRate);
    if (!Number.isFinite(rate) || rate < 0 || rate > 100 || totals.subtotal === null) return;
    const tax = Math.round(Math.round(totals.subtotal * 100) * rate / 100) / 100;
    setDraft(previous => previous.tax === tax ? previous : { ...previous, tax });
  }, [taxRate, totals.subtotal]);

  // The wrapper can attach a supplier quote after the product was selected.
  // Update only untouched pending inputs; never replace a buyer's manual edit.
  useEffect(() => {
    if (!currentProduct || !draft.supplier_id) return;
    if (!unitCostEdited) setUnitCost(defaultPurchaseOrderUnitCost(currentProduct, draft.supplier_id, selectedVariant));
    if (!supplierSkuEdited) setSupplierSku(defaultPurchaseOrderSupplierSku(currentProduct, draft.supplier_id));
  }, [currentProduct, draft.supplier_id, selectedVariant, unitCostEdited, supplierSkuEdited]);

  const applySupplier = (next: PurchaseOrderSupplier | null, clearLines: boolean) => {
    setSelectedSupplier(next);
    setPendingSupplier(undefined);
    onSupplierSelected?.(next?.id ?? null);
    setDraft(previous => ({ ...previous, supplier_id: next?.id ?? "", currency: next?.currency || organizationCurrency, ...(clearLines ? { items: [], tax: 0, shipping: 0 } : {}) }));
    if (clearLines) { setTaxRate(""); setErrors({}); }
    if (currentProduct) {
      setUnitCost(defaultPurchaseOrderUnitCost(currentProduct, next?.id ?? "", selectedVariant));
      setSupplierSku(defaultPurchaseOrderSupplierSku(currentProduct, next?.id ?? ""));
      setUnitCostEdited(false); setSupplierSkuEdited(false);
    }
    setErrors(previous => ({ ...previous, supplier_id: "" }));
  };
  const changeSupplier = (next: PurchaseOrderSupplier | null) => {
    if (draft.items.length && next?.id !== draft.supplier_id) { setPendingSupplier(next); return; }
    applySupplier(next, false);
  };
  const changeProduct = (next: PurchaseOrderProduct | null) => {
    if (next) setKnownProducts(previous => previous.some(item => item.id === next.id) ? previous : [...previous, next]);
    setSelectedProduct(next); setSelectedVariant(null); setLineError("");
    onProductSelected?.(next?.id ?? null);
    setUnitCost(next ? defaultPurchaseOrderUnitCost(next, draft.supplier_id) : 0);
    setSupplierSku(next ? defaultPurchaseOrderSupplierSku(next, draft.supplier_id) : "");
    setUnitCostEdited(false); setSupplierSkuEdited(false);
  };
  const changeVariant = (next: PurchaseOrderVariant | null) => {
    setSelectedVariant(next); setLineError("");
    if (currentProduct) setUnitCost(defaultPurchaseOrderUnitCost(currentProduct, draft.supplier_id, next));
    setUnitCostEdited(false);
  };
  const addLine = () => {
    if (!currentProduct) { setLineError("Select a product."); return; }
    if (currentProduct.has_variants && !selectedVariant) { setLineError("Select an active variant of this product."); return; }
    if (!Number.isSafeInteger(quantity) || quantity < 1) { setLineError("Quantity must be a safe whole number of at least one."); return; }
    if (!validLineMoney(unitCost)) { setLineError("Unit cost must be nonnegative with no more than two decimal places."); return; }
    if (supplierSku.length > 255) { setLineError("Supplier SKU must be 255 characters or fewer."); return; }
    const candidate = addPurchaseOrderLine(draft.items, currentProduct, selectedVariant, draft.supplier_id, quantity, unitCost, supplierSku);
    if (candidate === draft.items || purchaseOrderTotals({ ...draft, items: candidate }).total === null) { setLineError("The line or purchase order total exceeds the supported money range."); return; }
    setKnownProducts(previous => [...previous.filter(item => item.id !== currentProduct.id), currentProduct]);
    setDraft(previous => ({ ...previous, items: candidate }));
    setSelectedProduct(null); setSelectedVariant(null); setQuantity(1); setUnitCost(0); setSupplierSku(""); setUnitCostEdited(false); setSupplierSkuEdited(false); setLineError("");
    onProductSelected?.(null);
    setErrors(previous => ({ ...previous, items: "" }));
  };
  const updateLine = (index: number, field: "quantity" | "unit_cost" | "supplier_sku", value: number | string) => setDraft(previous => ({ ...previous, items: previous.items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) }));
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!onSubmit || writeBlocker || lookupStatus !== "ready" || savingRef.current) return;
    const nextErrors = validatePurchaseOrderDraft(draft, selectedSupplier ? [selectedSupplier, ...suppliers] : suppliers, [...knownProducts, ...products]);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    savingRef.current = true; setSaving(true); setSubmitError("");
    try { await onSubmit(draft); }
    catch (error) { setSubmitError(error instanceof Error ? error.message : "The purchase order could not be saved. No success was confirmed."); }
    finally { savingRef.current = false; setSaving(false); }
  };

  return <PageContainer><Stack spacing={3}>
    <Breadcrumbs><Link component={RouterLink} to="/">Workspace</Link><Link component={RouterLink} to="/purchase-orders">Purchase Orders</Link><Typography>Create</Typography></Breadcrumbs>
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}><Box><Typography variant="h2">Create purchase order</Typography><Typography color="text.secondary">Select a supplier and add at least one product line.</Typography></Box><Button component={RouterLink} to="/purchase-orders" variant="outlined">Back to purchase orders</Button></Stack>
    {writeBlocker && <Alert severity="info">{writeBlocker}</Alert>}
    {organizationSelector}
    {lookupStatus === "loading" && <Box role="status" aria-label="Loading suppliers and products"><Skeleton height={48} /><Skeleton variant="rounded" height={180} /></Box>}
    {lookupStatus === "error" && <Alert severity="error">Unable to load suppliers or products. {lookupError || "Check access and retry."} No data has been changed.</Alert>}
    {lookupStatus === "ready" && (!suppliers.length || !products.length) && <Alert severity="warning">{!suppliers.length ? "No suppliers returned by the current lookup. " : ""}{!products.length ? "No products returned by the current lookup." : ""}</Alert>}
    <Box component="form" onSubmit={handleSubmit} noValidate><Stack spacing={3}>
      <Card><CardContent><Stack spacing={2}>
        <Typography variant="h6">Order details</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
          <Autocomplete options={suppliers} filterOptions={options => options} value={supplier} onChange={(_, next) => changeSupplier(next)} onInputChange={(_, value, reason) => { if (reason === "input") onSupplierSearch?.(value); }} getOptionLabel={option => option.name} isOptionEqualToValue={(a, b) => a.id === b.id} loading={lookupStatus === "loading"} disabled={lookupStatus !== "ready"} renderInput={params => <TextField {...params} label="Supplier" required error={!!errors.supplier_id} helperText={errors.supplier_id || "Organization-scoped supplier"} />} />
          <TextField label="Currency" required value={draft.currency} onChange={event => setDraft(previous => ({ ...previous, currency: event.target.value.toUpperCase() }))} error={!!errors.currency} helperText={errors.currency || "Supplier currency is prefilled; verify before ordering."} />
          <TextField label="Order date" type="date" required value={draft.order_date} onChange={event => setDraft(previous => ({ ...previous, order_date: event.target.value }))} slotProps={{ inputLabel: { shrink: true } }} error={!!errors.order_date} helperText={errors.order_date} />
          <TextField label="Expected delivery" type="date" value={draft.expected_date} onChange={event => setDraft(previous => ({ ...previous, expected_date: event.target.value }))} slotProps={{ inputLabel: { shrink: true } }} error={!!errors.expected_date} helperText={errors.expected_date} />
        </Box>
        <TextField label="Notes" multiline rows={3} value={draft.notes} onChange={event => setDraft(previous => ({ ...previous, notes: event.target.value }))} />
      </Stack></CardContent></Card>
      <Card><CardContent><Stack spacing={2}>
        <Typography variant="h6">Add items</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
          <Autocomplete options={products} filterOptions={options => options} value={selectedProduct} onChange={(_, next) => changeProduct(next)} onInputChange={(_, value, reason) => { if (reason === "input") onProductSearch?.(value); }} getOptionLabel={option => `${option.name}${option.sku ? ` (${option.sku})` : ""}`} isOptionEqualToValue={(a, b) => a.id === b.id} loading={lookupStatus === "loading"} disabled={lookupStatus !== "ready"} renderInput={params => <TextField {...params} label="Product" required helperText="Select a catalogue product" />} />
          {currentProduct?.has_variants && <Autocomplete options={activeVariants} value={selectedVariant} onChange={(_, next) => changeVariant(next)} getOptionLabel={option => `${option.title}${option.sku ? ` (${option.sku})` : ""}`} isOptionEqualToValue={(a, b) => a.id === b.id} renderInput={params => <TextField {...params} label="Variant" required helperText={activeVariants.length ? "Select the variant to receive" : "No active variants are loaded for this product."} />} />}
          <TextField label="Quantity" type="number" required value={quantity} onChange={event => setQuantity(numberInput(event.target.value))} slotProps={{ htmlInput: { min: 1, step: 1 } }} />
          <TextField label="Unit cost" type="number" required value={unitCost} onChange={event => { setUnitCostEdited(true); setUnitCost(numberInput(event.target.value)); }} slotProps={{ htmlInput: { min: 0, step: "0.01" } }} helperText="Review this cost in the purchase order currency; no exchange conversion is applied." />
          <TextField label="Supplier SKU" value={supplierSku} onChange={event => { setSupplierSkuEdited(true); setSupplierSku(event.target.value); }} slotProps={{ htmlInput: { maxLength: 255 } }} />
        </Box>
        {lineError && <Alert severity="error">{lineError}</Alert>}
        {errors.items && <Alert severity="error">{errors.items}</Alert>}
        <Box><Button type="button" variant="outlined" startIcon={<AddRoundedIcon />} onClick={addLine} disabled={lookupStatus !== "ready"}>Add line</Button></Box>
      </Stack></CardContent></Card>
      <Card><CardContent><Stack spacing={2} role="region" aria-label="Purchase order lines">
        <Typography variant="h6">Order items ({draft.items.length})</Typography>
        {draft.items.length === 0 ? <Typography color="text.secondary">No lines added. Select a product above.</Typography> : draft.items.map((line, index) => <Box key={`${line.product_id}:${line.product_variant_id ?? "parent"}`} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "minmax(0,2fr) 100px 130px 130px auto" }, gap: 2, alignItems: "center" }}>
          <Box><Typography>{line.product_name}</Typography><Typography variant="body2" color="text.secondary">SKU: {line.sku || "—"}{line.variant_title ? ` · ${line.variant_title}` : ""}</Typography></Box>
          <TextField size="small" label={`Line ${index + 1} quantity`} type="number" value={line.quantity} onChange={event => updateLine(index, "quantity", numberInput(event.target.value))} error={!!errors[`items.${index}.quantity`]} helperText={errors[`items.${index}.quantity`]} slotProps={{ htmlInput: { min: 1, step: 1 } }} />
          <TextField size="small" label={`Line ${index + 1} unit cost`} type="number" value={line.unit_cost} onChange={event => updateLine(index, "unit_cost", numberInput(event.target.value))} error={!!errors[`items.${index}.unit_cost`]} helperText={errors[`items.${index}.unit_cost`]} slotProps={{ htmlInput: { min: 0, step: "0.01" } }} />
          <Typography textAlign={{ sm: "right" }}>{money(purchaseOrderLineTotal(line))}</Typography>
          <Button type="button" color="error" aria-label={`Remove line ${index + 1}`} onClick={() => setDraft(previous => ({ ...previous, items: previous.items.filter((_, itemIndex) => itemIndex !== index) }))}><DeleteRoundedIcon /></Button>
          <Box sx={{ gridColumn: { sm: "1 / -1" } }}><TextField size="small" label={`Line ${index + 1} supplier SKU`} value={line.supplier_sku} onChange={event => updateLine(index, "supplier_sku", event.target.value)} error={!!errors[`items.${index}.supplier_sku`]} helperText={errors[`items.${index}.supplier_sku`]} /></Box>
        </Box>)}
        <Stack spacing={1} sx={{ alignSelf: "flex-end", minWidth: { xs: "100%", sm: 280 } }}>
          <Typography data-testid="purchase-order-subtotal">Subtotal: {money(totals.subtotal)}</Typography>
          <TextField label="Tax amount" type="number" value={draft.tax} onChange={event => { setTaxRate(""); setDraft(previous => ({ ...previous, tax: numberInput(event.target.value) })); }} error={!!errors.tax} helperText={errors.tax || "Stored as an amount, not a rate."} slotProps={{ htmlInput: { min: 0, step: "0.01" } }} />
          <TextField label="Tax rate" type="number" value={taxRate} onChange={event => setTaxRate(event.target.value)} helperText="Optional percentage for the preview; only the calculated amount is saved." slotProps={{ htmlInput: { min: 0, max: 100, step: "0.001" } }} />
          <TextField label="Shipping amount" type="number" value={draft.shipping} onChange={event => setDraft(previous => ({ ...previous, shipping: numberInput(event.target.value) }))} error={!!errors.shipping} helperText={errors.shipping} slotProps={{ htmlInput: { min: 0, step: "0.01" } }} />
          <Typography variant="h6" data-testid="purchase-order-total">Total: {money(totals.total)}</Typography>
          {totals.total === null && <Alert severity="error">The preview exceeds the supported money range or contains invalid line amounts. Correct the values before saving.</Alert>}
          <Typography variant="body2" color="text.secondary">Preview only. The server must recalculate and persist amounts atomically before this purchase order is confirmed.</Typography>
        </Stack>
      </Stack></CardContent></Card>
      {submitError && <Alert severity="error">The purchase order could not be confirmed. {submitError}</Alert>}
      <Stack direction="row" spacing={1.25} justifyContent="flex-end"><Button component={RouterLink} to="/purchase-orders" variant="outlined">Cancel</Button><Button type="submit" variant="contained" disabled={!!writeBlocker || !onSubmit || lookupStatus !== "ready" || saving} startIcon={saving ? <CircularProgress size={16} /> : undefined}>{saving ? "Creating purchase order" : "Create purchase order"}</Button></Stack>
    </Stack></Box>
    <Dialog open={pendingSupplier !== undefined} onClose={() => setPendingSupplier(undefined)} maxWidth="xs" fullWidth>
      <DialogTitle>Change supplier?</DialogTitle>
      <DialogContent><DialogContentText>Changing from <strong>{selectedSupplier?.name ?? "the current supplier"}</strong> to <strong>{pendingSupplier?.name ?? "no supplier"}</strong> will clear {draft.items.length} unsaved line{draft.items.length === 1 ? "" : "s"}, tax and shipping so costs are not relabelled under another currency. This action cannot be undone.</DialogContentText></DialogContent>
      <DialogActions><Button variant="outlined" onClick={() => setPendingSupplier(undefined)}>Keep supplier</Button><Button variant="contained" color="error" onClick={() => applySupplier(pendingSupplier ?? null, true)}>Change supplier and clear lines</Button></DialogActions>
    </Dialog>
  </Stack></PageContainer>;
}
