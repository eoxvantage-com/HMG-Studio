import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link as RouterLink } from "react-router";
import { Alert, Autocomplete, Box, Breadcrumbs, Button, Card, CardContent, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, IconButton, Link, Skeleton, Stack, TextField, Tooltip, Typography, type TextFieldProps } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { exactNumericMoney } from "../../services/stockLedger";
import { PageContainer } from "../../components/PageContainer";
import { useToastOnError } from "../../hooks/useToastOnError";
import { formatMoney } from "../../services/commercePresentation";
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
  confirmBeforeSubmit?: boolean;
  workflowStatus?: ReactNode;
  externalLocked?: boolean;
  onDirtyChange?: (dirty: boolean) => void;
};

const DEFAULT_BLOCKER = "The atomic purchase order command has not been deployed and verified. This draft is not saved, and no stock or financial data will change.";
const dateToday = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
const numberInput = (value: string) => value === "" ? 0 : Number(value);
function ExactMoneyField({value,onAmount,...props}:Omit<TextFieldProps,"value"|"onChange">&{value:number;onAmount:(value:number)=>void}) {
  const [raw,setRaw]=useState(String(value)); const focused=useRef(false);
  useEffect(()=>{if(!focused.current&&Number.isFinite(value))setRaw(String(value));},[value]);
  const invalid=exactNumericMoney(raw)===null;
  return <TextField {...props} value={raw} error={invalid||props.error} helperText={invalid?"Enter an exact amount with up to two decimal places within the supported range.":props.helperText} onFocus={event=>{focused.current=true;event.target.select();}} onBlur={()=>{focused.current=false;}} onChange={event=>{const next=event.target.value;setRaw(next);onAmount(exactNumericMoney(next)??NaN);}}/>;
}

const validLineMoney = (value: number) => Number.isFinite(value) && value >= 0 && Number.isSafeInteger(Math.round(value * 100)) && Math.abs(value * 100 - Math.round(value * 100)) < 1e-7;

export function PurchaseOrderCreate({ suppliers, products, lookupStatus, organizationCurrency, today, lookupError, onSupplierSearch, onSupplierSelected, onProductSearch, onProductSelected, organizationSelector, scopeKey, onSubmit, writeBlocker = DEFAULT_BLOCKER, confirmBeforeSubmit = false, workflowStatus, externalLocked = false, onDirtyChange }: PurchaseOrderCreateProps) {
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
  useToastOnError(submitError, "Purchase order not saved");
  useToastOnError(lineError, "Line not added");
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [reviewDraft, setReviewDraft] = useState<PurchaseOrderDraft | null>(null);
  const initialDraft = useRef(JSON.stringify(draft));
  useEffect(() => { onDirtyChange?.(JSON.stringify(draft) !== initialDraft.current); }, [draft, onDirtyChange]);
  const previousScope = useRef(scopeKey);
  const supplier = selectedSupplier;
  const currentProduct = products.find(item => item.id === selectedProduct?.id) ?? selectedProduct;
  const activeVariants = useMemo(() => currentProduct?.variants?.filter(item => item.is_active !== false && !item.deleted_at) ?? [], [currentProduct]);
  const totals = purchaseOrderTotals(draft);
  const money = (amount: number | null) => amount === null || !Number.isFinite(amount) ? "Unavailable" : /^[A-Z]{3}$/.test(draft.currency) ? formatMoney(amount, draft.currency) : amount.toFixed(2);

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
    if (!onSubmit || writeBlocker || lookupStatus !== "ready" || savingRef.current || externalLocked) return;
    const nextErrors = validatePurchaseOrderDraft(draft, selectedSupplier ? [selectedSupplier, ...suppliers] : suppliers, [...knownProducts, ...products]);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    if (confirmBeforeSubmit) { setReviewDraft(structuredClone(draft)); return; }
    await submitDraft(draft);
  };
  const submitDraft = async (confirmed: PurchaseOrderDraft) => {
    if (!onSubmit || savingRef.current || externalLocked || writeBlocker) return;
    setReviewDraft(null);
    savingRef.current = true; setSaving(true); setSubmitError("");
    try { await onSubmit(confirmed); initialDraft.current = JSON.stringify(confirmed); onDirtyChange?.(false); }
    catch (error) { setSubmitError(error instanceof Error ? error.message : "The purchase order could not be saved. No success was confirmed."); }
    finally { savingRef.current = false; setSaving(false); }
  };

  return <PageContainer><Stack spacing={3}>
    <Breadcrumbs><Link component={RouterLink} to="/">Workspace</Link><Link component={RouterLink} to="/purchase-orders">Purchase Orders</Link><Typography>Create</Typography></Breadcrumbs>
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}><Box><Typography variant="h2">Create purchase order</Typography><Typography color="text.secondary">Select a supplier and add at least one product line.</Typography></Box></Stack>
    {writeBlocker && <Alert severity="info">{writeBlocker}</Alert>}
    {workflowStatus}
    {organizationSelector}
    {lookupStatus === "loading" && <Box role="status" aria-label="Loading suppliers and products"><Skeleton height={48} /><Skeleton variant="rounded" height={180} /></Box>}
    {lookupStatus === "error" && <Alert severity="error">Unable to load suppliers or products. {lookupError || "Check access and retry."} No data has been changed.</Alert>}
    {lookupStatus === "ready" && (!suppliers.length || !products.length) && <Alert severity="warning">{!suppliers.length ? "No suppliers returned by the current lookup. " : ""}{!products.length ? "No products returned by the current lookup." : ""}</Alert>}
    <Box component="form" onSubmit={handleSubmit} noValidate><Box component="fieldset" disabled={externalLocked || saving || !!reviewDraft} sx={{ border: 0, p: 0, m: 0, minWidth: 0, display: "grid", gridTemplateColumns: { xs: "1fr", lg: "7fr 4fr" }, gap: 3, alignItems: "start" }}>
      <Stack spacing={3} sx={{ minWidth: 0 }}>
      <Card><CardContent><Stack spacing={2}>
        <Typography variant="h6">Order details</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
          <Autocomplete options={suppliers} filterOptions={options => options} value={supplier} onChange={(_, next) => changeSupplier(next)} onInputChange={(_, value, reason) => { if (reason === "input") onSupplierSearch?.(value); }} getOptionLabel={option => option.name} isOptionEqualToValue={(a, b) => a.id === b.id} loading={lookupStatus === "loading"} disabled={lookupStatus !== "ready"} renderInput={params => <TextField {...params} label="Supplier" required error={!!errors.supplier_id} helperText={errors.supplier_id} />} />
          <TextField label="Currency" required value={draft.currency} onChange={event => setDraft(previous => ({ ...previous, currency: event.target.value.toUpperCase() }))} error={!!errors.currency} helperText={errors.currency || "Prefilled from the supplier."} />
          <TextField label="Order date" type="date" required value={draft.order_date} onChange={event => setDraft(previous => ({ ...previous, order_date: event.target.value }))} slotProps={{ inputLabel: { shrink: true } }} error={!!errors.order_date} helperText={errors.order_date} />
          <TextField label="Expected delivery" type="date" value={draft.expected_date} onChange={event => setDraft(previous => ({ ...previous, expected_date: event.target.value }))} slotProps={{ inputLabel: { shrink: true } }} error={!!errors.expected_date} helperText={errors.expected_date} />
        </Box>
        <TextField label="Notes" multiline rows={2} value={draft.notes} onChange={event => setDraft(previous => ({ ...previous, notes: event.target.value }))} placeholder="Container, lot, finish or delivery instructions" />
      </Stack></CardContent></Card>
      <Card><CardContent><Stack spacing={2}>
        <Typography variant="h6">Add items</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr 1fr" }, gap: 2 }}>
          <Autocomplete options={products} filterOptions={options => options} value={selectedProduct} onChange={(_, next) => changeProduct(next)} onInputChange={(_, value, reason) => { if (reason === "input") onProductSearch?.(value); }} getOptionLabel={option => `${option.name}${option.sku ? ` (${option.sku})` : ""}`} isOptionEqualToValue={(a, b) => a.id === b.id} loading={lookupStatus === "loading"} disabled={lookupStatus !== "ready"} renderInput={params => <TextField {...params} label="Product" required />} />
          <TextField label="Quantity" type="number" onFocus={event => event.target.select()} required value={quantity} onChange={event => setQuantity(numberInput(event.target.value))} slotProps={{ htmlInput: { min: 1, step: 1 } }} />
          <ExactMoneyField label="Unit cost" required value={unitCost} onAmount={value => { setUnitCostEdited(true); setUnitCost(value); }} slotProps={{ htmlInput: { min: 0, step: "0.01" } }} helperText={`In ${draft.currency || "the order currency"}`} />
          {currentProduct?.has_variants && <Autocomplete options={activeVariants} value={selectedVariant} onChange={(_, next) => changeVariant(next)} getOptionLabel={option => `${option.title}${option.sku ? ` (${option.sku})` : ""}`} isOptionEqualToValue={(a, b) => a.id === b.id} renderInput={params => <TextField {...params} label="Variant" required helperText={activeVariants.length ? "Select the variant to receive" : "No active variants are loaded for this product."} />} />}
          <TextField label="Supplier SKU" value={supplierSku} onChange={event => { setSupplierSkuEdited(true); setSupplierSku(event.target.value); }} slotProps={{ htmlInput: { maxLength: 255 } }} />
        </Box>
        {lineError && <Alert severity="error">{lineError}</Alert>}
        {errors.items && <Alert severity="error">{errors.items}</Alert>}
        <Box><Button type="button" variant="contained" startIcon={<AddRoundedIcon />} onClick={addLine} disabled={lookupStatus !== "ready"}>Add line</Button></Box>
      </Stack></CardContent></Card>
      <Card><CardContent><Stack spacing={2} role="region" aria-label="Purchase order lines">
        <Typography variant="h6">Order items ({draft.items.length})</Typography>
        {draft.items.length === 0 ? <Typography color="text.secondary" variant="body2" sx={{ py: 2, textAlign: "center" }}>No lines yet. Choose a product, quantity and cost above, then press Add line.</Typography> : draft.items.map((line, index) => <Box key={`${line.product_id}:${line.product_variant_id ?? "parent"}`} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "minmax(0,2fr) 110px 140px 120px auto" }, gap: 1.5, alignItems: "start", pb: 1.5, borderBottom: 1, borderColor: "divider" }}>
          <Box><Typography fontWeight={600} variant="body2">{line.product_name}</Typography><Typography variant="caption" color="text.secondary">SKU: {line.sku || "—"}{line.variant_title ? ` · ${line.variant_title}` : ""}</Typography>
            <TextField size="small" fullWidth sx={{ mt: 1 }} label={`Line ${index + 1} supplier SKU`} value={line.supplier_sku} onChange={event => updateLine(index, "supplier_sku", event.target.value)} error={!!errors[`items.${index}.supplier_sku`]} helperText={errors[`items.${index}.supplier_sku`]} /></Box>
          <TextField size="small" label={`Line ${index + 1} quantity`} type="number" onFocus={event => event.target.select()} value={line.quantity} onChange={event => updateLine(index, "quantity", numberInput(event.target.value))} error={!!errors[`items.${index}.quantity`]} helperText={errors[`items.${index}.quantity`]} slotProps={{ htmlInput: { min: 1, step: 1 } }} />
          <ExactMoneyField size="small" label={`Line ${index + 1} unit cost`} value={line.unit_cost} onAmount={value => updateLine(index, "unit_cost", value)} error={!!errors[`items.${index}.unit_cost`]} helperText={errors[`items.${index}.unit_cost`]} slotProps={{ htmlInput: { min: 0, step: "0.01" } }} />
          <Typography textAlign={{ sm: "right" }} fontWeight={600} sx={{ pt: 1, fontVariantNumeric: "tabular-nums" }}>{money(purchaseOrderLineTotal(line))}</Typography>
          <Tooltip title="Remove line"><IconButton color="error" aria-label={`Remove line ${index + 1}`} onClick={() => setDraft(previous => ({ ...previous, items: previous.items.filter((_, itemIndex) => itemIndex !== index) }))}><DeleteRoundedIcon /></IconButton></Tooltip>
        </Box>)}
      </Stack></CardContent></Card>
      </Stack>
      <Stack spacing={3} sx={{ position: { lg: "sticky" }, top: { lg: 88 } }}>
      <Card><CardContent><Stack spacing={1.5}>
        <Typography variant="h6">Summary</Typography>
        <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">Subtotal</Typography><Typography data-testid="purchase-order-subtotal" sx={{ fontVariantNumeric: "tabular-nums" }}>{money(totals.subtotal)}</Typography></Stack>
        <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: "1fr 1fr" }}>
          <TextField size="small" label="Tax rate %" type="number" onFocus={event => event.target.select()} value={taxRate} onChange={event => setTaxRate(event.target.value)} helperText="e.g. 18 for GST" slotProps={{ htmlInput: { min: 0, max: 100, step: "0.001" } }} />
          <ExactMoneyField size="small" label="Tax amount" value={draft.tax} onAmount={value => { setTaxRate(""); setDraft(previous => ({ ...previous, tax: value })); }} error={!!errors.tax} helperText={errors.tax} slotProps={{ htmlInput: { min: 0, step: "0.01" } }} />
        </Box>
        <ExactMoneyField size="small" label="Shipping amount" value={draft.shipping} onAmount={value => setDraft(previous => ({ ...previous, shipping: value }))} error={!!errors.shipping} helperText={errors.shipping} slotProps={{ htmlInput: { min: 0, step: "0.01" } }} />
        <Divider />
        <Stack direction="row" justifyContent="space-between"><Typography variant="h6">Total</Typography><Typography variant="h6" data-testid="purchase-order-total" sx={{ fontVariantNumeric: "tabular-nums" }}>{money(totals.total)}</Typography></Stack>
        {totals.total === null && <Alert severity="error">The amounts are invalid or too large. Correct the values before saving.</Alert>}
        {submitError && <Alert severity="error">The purchase order could not be confirmed. {submitError}</Alert>}
        <Button type="submit" size="large" variant="contained" disabled={!!writeBlocker || !onSubmit || lookupStatus !== "ready" || saving} startIcon={saving ? <CircularProgress size={16} /> : undefined}>{saving ? "Creating purchase order" : "Create purchase order"}</Button>
        <Button component={RouterLink} to="/purchase-orders" variant="outlined">Cancel</Button>
        <Typography variant="caption" color="text.secondary">Saves a pending purchase order for approval. Stock is added when you receive it. Totals are recalculated by the ledger.</Typography>
      </Stack></CardContent></Card>
      </Stack>
    </Box></Box>
    <Dialog open={!!reviewDraft} onClose={() => setReviewDraft(null)} maxWidth="sm" fullWidth>
      <DialogTitle>Review purchase order</DialogTitle>
      <DialogContent><DialogContentText>Create a purchase order for {supplier?.name} with {reviewDraft?.items.length ?? 0} lines, total {money(totals.total)}. This submits a pending document for approval; it does not receive stock or record payment.</DialogContentText></DialogContent>
      <DialogActions><Button onClick={() => setReviewDraft(null)}>Keep editing</Button><Button variant="contained" disabled={externalLocked || saving} onClick={() => { if (reviewDraft) void submitDraft(reviewDraft); }}>Confirm purchase order</Button></DialogActions>
    </Dialog>
    <Dialog open={pendingSupplier !== undefined} onClose={() => setPendingSupplier(undefined)} maxWidth="xs" fullWidth>
      <DialogTitle>Change supplier?</DialogTitle>
      <DialogContent><DialogContentText>Changing from <strong>{selectedSupplier?.name ?? "the current supplier"}</strong> to <strong>{pendingSupplier?.name ?? "no supplier"}</strong> will clear {draft.items.length} unsaved line{draft.items.length === 1 ? "" : "s"}, tax and shipping so costs are not relabelled under another currency. This action cannot be undone.</DialogContentText></DialogContent>
      <DialogActions><Button variant="outlined" onClick={() => setPendingSupplier(undefined)}>Keep supplier</Button><Button variant="contained" color="error" onClick={() => applySupplier(pendingSupplier ?? null, true)}>Change supplier and clear lines</Button></DialogActions>
    </Dialog>
  </Stack></PageContainer>;
}
