import { useEffect, useMemo, useState } from "react";
import { useList, useWarnAboutChange, type CrudFilters } from "@refinedev/core";
import { useSessionOwner } from "../../hooks/useSessionOwner";
import { Autocomplete, Alert, Box, Button, Card, CardContent, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, IconButton, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { formatDate, formatMoney, shortNumber } from "../../services/commercePresentation";
import { Link as RouterLink, useNavigate } from "react-router";
import { PageContainer } from "../../components/PageContainer";
import { QuickCustomerDialog } from "../../components/QuickCustomerDialog";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import { ERP_QUERY_OPTIONS, type ErpRecord } from "../../services/erp";
import { reportUuid } from "../../services/operationalReports";
import { emptyOrderDraft, orderTotals, validateOrderDraft, type OrderCreateDraft } from "./commerceCreateDraft";
import { useCommerceLedger } from "../../hooks/useCommerceLedger";
import { CommerceWorkflowStatus } from "../../components/CommerceWorkflowStatus";
import { useDefaultOrganization } from "../../hooks/useDefaultOrganization";
import { useToastOnError } from "../../hooks/useToastOnError";
import { canonicalMoney, exactNumericMoney, hasCommerceAuthority, isTestOrganization, newCommerceCommand, type CommerceCommand, type CommerceReturnLine } from "../../services/stockLedger";

const PAGE = { mode: "server" as const, currentPage: 1, pageSize: 100 };
const NONE = "00000000-0000-4000-8000-000000000000";
const today = () => new Date().toISOString().slice(0, 10);
const asText = (value: unknown) => typeof value === "string" ? value : "";
const asMoney = (value: unknown): number | null => {
  if (value === "" || value === null || value === undefined) return null;
  return exactNumericMoney(String(value));
};
type Org = { id: string; name: string; currency: string; authority: boolean };

function useOrganizations() {
  const { identity, owner } = useSessionOwner();
  const meta = useMemo(() => ({ lookupOwner: owner }), [owner]);
  const organizations = useList<ErpRecord>({ resource: "organizations", sorters: [{ field: "name", order: "asc" }], pagination: PAGE, meta, queryOptions: { ...ERP_QUERY_OPTIONS, enabled: !!owner }, errorNotification: false });
  const options: Org[] = (owner && !organizations.query.isError ? organizations.result.data : []).filter(row => row.is_active !== false && !row.deleted_at && reportUuid(row.id) && asText(row.name).trim() && !isTestOrganization(row)).map(row => ({ id: row.id, name: asText(row.name), currency: asText(row.default_currency) || asText(row.currency) || "", authority: hasCommerceAuthority(row) }))
    // Ledger-enabled organizations first; only they can save commerce documents.
    .sort((a, b) => Number(b.authority) - Number(a.authority) || a.name.localeCompare(b.name));
  const ledgerOptions = options.filter(item => item.authority);
  return { identity, owner, meta, organizations, options, ledgerOptions };
}

function WorkspaceHeader({ title, description, backTo }: { title: string; description: string; backTo: string }) {
  return <Stack spacing={2}>
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }}>
      <Box><Typography variant="h2">{title}</Typography><Typography color="text.secondary">{description}</Typography></Box>
      <Button component={RouterLink} to={backTo} variant="outlined">Back to list</Button>
    </Stack>
  </Stack>;
}

export function OrderCreateWorkspace() {
  const { owner } = useSessionOwner();
  return <OrderCreateInner key={owner} />;
}
function OrderCreateInner() {
  const { identity, owner, meta, organizations, options, ledgerOptions } = useOrganizations();
  const [orgId, setOrgId] = useState("");
  const org = options.find(item => item.id === orgId);
  const ledger = useCommerceLedger(orgId, !!org?.authority);
  const navigate = useNavigate();
  const { warnWhen, setWarnWhen } = useWarnAboutChange();
  const [dirty, setDirty] = useState(false);
  const [confirm, setConfirm] = useState<CommerceCommand | null>(null);
  const [reviewError, setReviewError] = useState("");
  const [exitPath, setExitPath] = useState("");
  const [reason, setReason] = useState("Create sales order");
  useEffect(() => { setWarnWhen(dirty || !!ledger.pending); return () => setWarnWhen(false); }, [dirty, ledger.pending, setWarnWhen]);
  useEffect(() => { if (exitPath && !warnWhen && !dirty && !ledger.pending) navigate(exitPath); }, [exitPath, warnWhen, dirty, ledger.pending, navigate]);
  const completed = (command: CommerceCommand) => { setDirty(false); setConfirm(null); setWarnWhen(false); setExitPath(`/orders/show/${command.request_id}?organization=${encodeURIComponent(orgId)}`); };
  useDefaultOrganization(orgId, ledgerOptions.map(option => option.id), setOrgId, !organizations.query.isLoading);
  useEffect(() => {
    if (!org) return;
    setDraft(current => current.organization_id === org.id && current.currency === org.currency ? current : { ...current, organization_id: org.id, currency: org.currency, customer_id: null, customer_name: "", customer_email: "", customer_address: "", items: [] });
    setSelectedCustomer(null);
    setSelectedProduct(null);
  }, [org?.id, org?.currency]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<ErpRecord | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ErpRecord | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ErpRecord | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [rawAmounts, setRawAmounts] = useState({tax:"0",shipping:"0"});
  const [draft, setDraft] = useState<OrderCreateDraft>(() => emptyOrderDraft(today(), ""));
  const customersFilter = useMemo<CrudFilters>(() => [
    { field: "organization_id", operator: "eq", value: orgId || NONE },
    { field: "is_active", operator: "eq", value: true },
    { field: "deleted_at", operator: "null", value: true },
    ...(customerSearch.trim() ? [{ operator: "or" as const, value: ["name", "company_name", "email", "code"].map(field => ({ field, operator: "contains" as const, value: customerSearch.trim() })) }] : []),
  ], [orgId, customerSearch]);
  const productsFilter = useMemo<CrudFilters>(() => [
    { field: "organization_id", operator: "eq", value: orgId || NONE }, { field: "is_active", operator: "eq", value: true }, { field: "deleted_at", operator: "null", value: true },
    ...(productSearch.trim() ? [{ operator: "or" as const, value: ["name", "sku", "barcode"].map(field => ({ field, operator: "contains" as const, value: productSearch.trim() })) }] : []),
  ], [orgId, productSearch]);
  const customers = useList<ErpRecord>({ resource: "customers", filters: customersFilter, sorters: [{ field: "name", order: "asc" }], pagination: PAGE, meta, queryOptions: { ...ERP_QUERY_OPTIONS, enabled: !!orgId }, errorNotification: false });
  const products = useList<ErpRecord>({ resource: "products", filters: productsFilter, sorters: [{ field: "name", order: "asc" }], pagination: PAGE, meta, queryOptions: { ...ERP_QUERY_OPTIONS, enabled: !!orgId }, errorNotification: false });
  const variantFilter = useMemo<CrudFilters>(() => [
    { field: "organization_id", operator: "eq", value: orgId || NONE }, { field: "product_id", operator: "eq", value: asText(selectedProduct?.id) || NONE },
    { field: "is_active", operator: "eq", value: true }, { field: "deleted_at", operator: "null", value: true },
  ], [orgId, selectedProduct?.id]);
  const variants = useList<ErpRecord>({ resource: "product_variants", filters: variantFilter, sorters: [{ field: "title", order: "asc" }], pagination: PAGE, meta, queryOptions: { ...ERP_QUERY_OPTIONS, enabled: !!orgId && !!selectedProduct?.has_variants }, errorNotification: false });
  const errors = validateOrderDraft(draft);
  const totals = orderTotals(draft);
  const lookupFailed = identity.isError || organizations.query.isError || customers.query.isError || products.query.isError || variants.query.isError || (customers.result.total ?? 0) > PAGE.pageSize || (products.result.total ?? 0) > PAGE.pageSize || (variants.result.total ?? 0) > PAGE.pageSize;
  const addItem = () => {
    if (!selectedProduct || !Number.isSafeInteger(quantity) || quantity < 1 || selectedProduct.has_variants === true) return;
    const currencyPrices = selectedProduct.price_in_currencies && typeof selectedProduct.price_in_currencies === "object" ? selectedProduct.price_in_currencies as Record<string, unknown> : undefined;
    const selectedCurrencyPrice = currencyPrices?.[draft.currency];
    const productCurrency = asText(selectedProduct.currency || org?.currency);
    const priceValue = selectedVariant?.price ?? selectedCurrencyPrice ?? (productCurrency === draft.currency ? selectedProduct.selling_price : undefined);
    const price = asMoney(priceValue);
    if (price === null) { setReviewError("This product has no exact selling price in the order currency. Set its selling price or choose another product."); return; }
    const item = { product_id: selectedProduct.id, product_variant_id: selectedVariant?.id ? String(selectedVariant.id) : null, product_name: asText(selectedProduct.name), sku: asText(selectedVariant?.sku) || asText(selectedProduct.sku), quantity, unit_price: price };
    setDraft(current => ({ ...current, items: [...current.items, item] }));
    setDirty(true);
    setSelectedProduct(null); setSelectedVariant(null); setQuantity(1);
  };
  const update = (key: keyof OrderCreateDraft, value: unknown) => { setDirty(true); setDraft(current => ({ ...current, [key]: value })); };
  // Selecting a saved customer prefills the order's party details from that record.
  const selectCustomer = (value: ErpRecord | null) => {
    setSelectedCustomer(value); setDirty(true);
    const shipping = !!asText(value?.shipping_address);
    const address = [shipping ? asText(value?.shipping_address) : asText(value?.billing_address), asText(shipping ? value?.shipping_city : value?.billing_city), asText(shipping ? value?.shipping_zip_code : value?.billing_zip_code)].filter(Boolean).join(", ");
    setDraft(current => ({ ...current, customer_id: value ? String(value.id) : null, customer_name: asText(value?.name), customer_email: asText(value?.email), customer_address: address, currency: asText(value?.currency) || current.currency }));
  };
  const [newCustomerOpen, setNewCustomerOpen] = useState(false);
  const review = () => {
    if (ledger.locked || lookupFailed || Object.keys(errors).length) return;
    try {
      setReviewError("");
      setConfirm(newCommerceCommand({ action: "create_order", reason, document: {
        customer_id: draft.customer_id, customer_name: draft.customer_name, customer_email: draft.customer_email, customer_address: draft.customer_address,
        order_date: draft.order_date, currency: draft.currency, notes: draft.notes, tax: canonicalMoney(draft.tax), shipping: canonicalMoney(draft.shipping),
        items: draft.items.map(item => ({ line_id: crypto.randomUUID(), product_id: item.product_id, product_variant_id: null, quantity: item.quantity, unit_price: canonicalMoney(item.unit_price) })),
      } }));
    } catch (error) { setReviewError(error instanceof Error ? error.message : "Check the order details."); }
  };
  useToastOnError(reviewError, "Order not saved");
  const freeStock = (productId: string) => (ledger.state?.balances ?? []).filter(row => row.product_id === productId).reduce((sum, row) => sum + Math.max(0, row.quantity - row.reserved), 0);
  const productOptions = products.result.data.filter(row => row.organization_id === orgId && row.is_active !== false && !row.deleted_at && row.type === "standard" && row.tracking_type === "none" && row.has_variants !== true);
  const applyGst = () => { if (totals.subtotal === null) return; const tax = Math.round(totals.subtotal * 18) / 100; setRawAmounts(current => ({ ...current, tax: tax.toFixed(2) })); update("tax", tax); };
  const setLine = (index: number, patch: Partial<OrderCreateDraft["items"][number]>) => update("items", draft.items.map((item, i) => i === index ? { ...item, ...patch } : item));
  const money = (value: number | null | undefined) => value === null || value === undefined || !Number.isFinite(value) ? "Unavailable" : formatMoney(value, draft.currency || "INR");
  return <PageContainer><Stack spacing={3}>
    <WorkspaceHeader title="Create Order" description="Pick the customer, add slabs or products, and save the order for approval." backTo="/orders" />
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
      <Autocomplete size="small" sx={{ width: { xs: "100%", sm: 320 } }} options={options} value={org ?? null} disabled={dirty || !!ledger.pending} disableClearable={!!org} onChange={(_, value) => { setOrgId(value?.id ?? ""); setSelectedCustomer(null); setSelectedProduct(null); setDraft(current => ({ ...current, organization_id: value?.id ?? "", currency: value?.currency ?? "", customer_id: null, customer_name: "", customer_email: "", customer_address: "", items: [] })); }} getOptionLabel={item => item.name} groupBy={item => item.authority ? "Ledger active" : "Ledger not activated (read-only)"} getOptionDisabled={item => !item.authority} isOptionEqualToValue={(a,b) => a.id === b.id} renderInput={params => <TextField {...params} label="Organization" required error={!!errors.organization_id} helperText={errors.organization_id} />} />
      {dirty && <Typography variant="caption" color="text.secondary">The organization is locked while the draft has changes.</Typography>}
    </Stack>
    <CommerceWorkflowStatus ledger={ledger} onRecovered={(_state, command) => completed(command)} />
    {!owner && <Alert severity={identity.isError ? "error" : "info"}>Sign in again to load permitted organizations.</Alert>}
    {lookupFailed && <Alert severity="error">Some permitted customer, product or variant options could not be fully loaded. Refresh and retry before continuing.</Alert>}
    {owner && !organizations.query.isLoading && (options.length === 0 ? <Alert severity="warning">No permitted organizations are available.</Alert> : ledgerOptions.length === 0 ? <Alert severity="warning">None of your organizations has the commerce ledger activated, so orders cannot be saved yet.</Alert> : null)}
    <Box component="fieldset" disabled={ledger.busy || !!ledger.pending || !!confirm || !!exitPath} sx={{ border: 0, p: 0, m: 0, minWidth: 0, display: "grid", gridTemplateColumns: { xs: "1fr", lg: "7fr 5fr" }, gap: 3 }}>
      <Stack spacing={3}>
        <Card><CardContent><Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center"><Typography variant="h6">Customer</Typography><Button size="small" variant="outlined" startIcon={<PersonAddAltRoundedIcon />} disabled={!orgId || !ledger.enabled} onClick={() => setNewCustomerOpen(true)}>Add new customer</Button></Stack>
          <Autocomplete loading={customers.query.isFetching} noOptionsText={customers.query.isError ? "Customers could not be loaded" : "No matching customers in this organization"} options={customers.result.data.filter(row => row.organization_id === orgId && row.is_active !== false && !row.deleted_at)} value={selectedCustomer} onChange={(_, value) => selectCustomer(value)} onInputChange={(_, value, why) => { if (why === "input") setCustomerSearch(value); }} filterOptions={items => items} getOptionLabel={item => `${asText(item.name)}${item.email ? ` · ${item.email}` : ""}`} isOptionEqualToValue={(a,b) => a.id === b.id} disabled={!orgId} renderInput={params => <TextField {...params} label="Customer" helperText="Pick a saved customer to fill in name, email and delivery address." />} />
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
            <TextField label="Customer name" required InputProps={{readOnly:!!selectedCustomer}} value={draft.customer_name} onChange={event => update("customer_name", event.target.value)} error={!!errors.customer_name} helperText={errors.customer_name} />
            <TextField label="Customer email" type="email" InputProps={{readOnly:!!selectedCustomer}} value={draft.customer_email} onChange={event => update("customer_email", event.target.value)} error={!!errors.customer_email} helperText={errors.customer_email} />
          </Box>
          <TextField label="Shipping address" multiline minRows={2} value={draft.customer_address} onChange={event => update("customer_address", event.target.value)} />
        </Stack></CardContent></Card>
        <Card><CardContent><Stack spacing={2}><Typography variant="h6">Order items</Typography>
          <Box sx={{ display: "grid", gap: 2, alignItems: "start", gridTemplateColumns: { xs: "1fr", sm: "1fr 120px auto" } }}>
            <Autocomplete loading={products.query.isFetching} noOptionsText={products.query.isError ? "Products could not be loaded" : "No matching products in this organization"} options={productOptions} value={selectedProduct} onChange={(_, value) => { setSelectedProduct(value); setSelectedVariant(null); }} onInputChange={(_, value, why) => { if (why === "input") setProductSearch(value); }} filterOptions={items => items} getOptionLabel={item => `${asText(item.name)} (${asText(item.sku)})`} isOptionEqualToValue={(a,b) => a.id === b.id} disabled={!orgId}
              renderOption={(props, item) => { const { key, ...rest } = props as typeof props & { key: string }; const price = asMoney(item.selling_price); const free = freeStock(item.id); return <li key={key} {...rest}><Stack direction="row" justifyContent="space-between" spacing={2} sx={{ width: "100%" }}><Box><Typography variant="body2">{asText(item.name)} ({asText(item.sku)})</Typography></Box><Stack alignItems="flex-end"><Typography variant="body2">{price === null ? "No price" : formatMoney(price, draft.currency || "INR")}</Typography>{ledger.state && <Typography variant="caption" color={free > 0 ? "text.secondary" : "error"}>{free} free</Typography>}</Stack></Stack></li>; }}
              renderInput={params => <TextField {...params} label="Product" helperText="Search active products; price and free stock are shown." />} />
            <TextField label="Quantity" type="number" onFocus={event => event.target.select()} value={quantity} inputProps={{ min: 1, step: 1 }} onChange={event => setQuantity(Number(event.target.value))} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); addItem(); } }} />
            <Button onClick={addItem} variant="contained" startIcon={<AddRoundedIcon />} disabled={!selectedProduct || selectedProduct.has_variants === true} sx={{ height: 40 }}>Add line</Button>
          </Box>
          {selectedProduct?.has_variants === true && <Alert severity="warning">This workflow currently supports non-variant products only. Choose a standard product; no variant stock is combined with parent stock.</Alert>}
          {selectedProduct && ledger.state && quantity > freeStock(selectedProduct.id) && <Alert severity="warning">Only {freeStock(selectedProduct.id)} free in stock. You can still save the order, but it can't be approved until stock arrives.</Alert>}
          {errors.items && <Typography color="error" variant="body2">{errors.items}</Typography>}
          {draft.items.length > 0 ? <Table size="small" aria-label="Order lines"><TableHead><TableRow><TableCell>Product</TableCell><TableCell align="right" sx={{ width: 110 }}>Quantity</TableCell><TableCell align="right">Unit price</TableCell><TableCell align="right">Line total</TableCell><TableCell align="right" sx={{ width: 56 }} /></TableRow></TableHead><TableBody>
            {draft.items.map((item, index) => <TableRow key={`${item.product_id}:${item.product_variant_id}:${index}`}>
              <TableCell><Typography variant="body2" fontWeight={600}>{item.product_name}</Typography><Typography variant="caption" color="text.secondary">{item.sku}</Typography></TableCell>
              <TableCell align="right"><TextField size="small" type="number" value={item.quantity} inputProps={{ min: 1, step: 1, "aria-label": `Quantity for ${item.product_name}` }} onFocus={event => event.target.select()} onChange={event => setLine(index, { quantity: Number(event.target.value) })} sx={{ width: 90 }} /></TableCell>
              <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>{money(item.unit_price)}</TableCell>
              <TableCell align="right" sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>{money(item.quantity * item.unit_price)}</TableCell>
              <TableCell align="right"><Tooltip title="Remove line"><IconButton size="small" color="error" aria-label={`Remove ${item.product_name}`} onClick={() => update("items", draft.items.filter((_, i) => i !== index))}><DeleteOutlineRoundedIcon fontSize="small" /></IconButton></Tooltip></TableCell>
            </TableRow>)}
          </TableBody></Table> : <Typography color="text.secondary" variant="body2" sx={{ py: 2, textAlign: "center" }}>No lines yet. Choose a product and quantity, then press Add line.</Typography>}
        </Stack></CardContent></Card>
      </Stack>
      <Stack spacing={3}>
        <Card><CardContent><Stack spacing={2}><Typography variant="h6">Order details</Typography>
          <TextField label="Order date" type="date" required value={draft.order_date} onChange={event => update("order_date", event.target.value)} InputLabelProps={{ shrink: true }} error={!!errors.order_date} helperText={errors.order_date} />
          <TextField label="Currency" value={draft.currency} InputProps={{ readOnly: true }} helperText="From the customer, or the organization when the customer has none." />
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "1fr 1fr" }}>
            <TextField label="Tax amount" type="number" onFocus={event => event.target.select()} inputProps={{ min: 0, step: "0.01" }} value={rawAmounts.tax} onChange={event => { setRawAmounts(current => ({...current,tax:event.target.value})); update("tax", asMoney(event.target.value) ?? NaN); }} error={!!errors.tax} helperText={errors.tax ?? <Button size="small" sx={{ p: 0, minHeight: 0 }} disabled={totals.subtotal === null || !draft.items.length} onClick={applyGst}>Apply 18% GST</Button>} />
            <TextField label="Shipping" type="number" onFocus={event => event.target.select()} inputProps={{ min: 0, step: "0.01" }} value={rawAmounts.shipping} onChange={event => { setRawAmounts(current => ({...current,shipping:event.target.value})); update("shipping", asMoney(event.target.value) ?? NaN); }} error={!!errors.shipping} helperText={errors.shipping} />
          </Box>
          <TextField label="Notes" multiline minRows={2} value={draft.notes} onChange={event => update("notes", event.target.value)} placeholder="Site, finish, templating or delivery instructions" />
        </Stack></CardContent></Card>
        <Card><CardContent><Stack spacing={1}><Typography variant="h6">Summary</Typography>
          {[["Subtotal", totals.subtotal], ["Tax", totals.tax], ["Shipping", totals.shipping]].map(([label, value]) => <Stack key={String(label)} direction="row" justifyContent="space-between"><Typography color="text.secondary">{label}</Typography><Typography sx={{ fontVariantNumeric: "tabular-nums" }}>{money(value as number | null)}</Typography></Stack>)}
          <Divider /><Stack direction="row" justifyContent="space-between"><Typography variant="h6">Total</Typography><Typography variant="h6" sx={{ fontVariantNumeric: "tabular-nums" }}>{money(totals.total)}</Typography></Stack>
          {errors.total && <Typography color="error">{errors.total}</Typography>}
          <TextField label="Workflow reason" required value={reason} onChange={event => { setReason(event.target.value); setDirty(true); }} sx={{ mt: 1 }} />
          <Button variant="contained" size="large" onClick={review} disabled={ledger.locked || lookupFailed || Object.keys(errors).length > 0} aria-describedby="order-save-blocker">Create Order</Button>
          <Typography id="order-save-blocker" variant="caption" color="text.secondary">{ledger.enabled ? "Saves a pending order with all lines. Approval reserves stock; shipping is a separate step." : "No order or stock write has been sent."}</Typography>
        </Stack></CardContent></Card>
      </Stack>
    </Box>
    <QuickCustomerDialog open={newCustomerOpen} organizationId={orgId} currency={draft.currency} initialName={selectedCustomer ? "" : draft.customer_name} onClose={() => setNewCustomerOpen(false)}
      onCreated={record => { setNewCustomerOpen(false); setCustomerSearch(""); void customers.query.refetch(); selectCustomer(record); }} />
    <Dialog open={!!confirm} onClose={() => { if (!ledger.busy) setConfirm(null); }} aria-labelledby="order-confirm-title"><DialogTitle id="order-confirm-title">Create this sales order?</DialogTitle><DialogContent><Typography fontWeight={600}>{draft.customer_name} · {draft.items.length} line{draft.items.length === 1 ? "" : "s"} · {money(totals.total)}</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>All lines are saved together as a pending order. No stock is reserved or shipped and no payment is recorded.</Typography></DialogContent><DialogActions><Button variant="outlined" disabled={ledger.busy} onClick={() => setConfirm(null)}>Back to draft</Button><Button variant="contained" disabled={ledger.busy} onClick={async () => { if (confirm) { const command = confirm; const state = await ledger.execute(command); if (state) completed(command); else setConfirm(null); } }}>Confirm create order</Button></DialogActions></Dialog>
  </Stack></PageContainer>;
}

export function ReturnCreateWorkspace() {
  const { owner } = useSessionOwner();
  return <ReturnCreateInner key={owner} />;
}
function ReturnCreateInner() {
  const { identity, owner, meta, organizations, options, ledgerOptions } = useOrganizations();
  const [orgId, setOrgId] = useState("");
  const [orderId, setOrderId] = useState("");
  const org = options.find(item => item.id === orgId);
  const ledger = useCommerceLedger(orgId, !!org?.authority);
  const [reason, setReason] = useState("");
  const [lines, setLines] = useState<Record<string, CommerceReturnLine>>({});
  const [confirm, setConfirm] = useState<CommerceCommand | null>(null);
  const [error, setError] = useState("");
  useToastOnError(error, "Return not saved");
  const [exitPath, setExitPath] = useState("");
  const navigate = useNavigate();
  const {warnWhen, setWarnWhen} = useWarnAboutChange();
  const dirty = !!reason || Object.keys(lines).length > 0;
  useEffect(() => { setWarnWhen(dirty || !!ledger.pending); return () => setWarnWhen(false); }, [dirty, ledger.pending, setWarnWhen]);
  useEffect(() => { if (exitPath && !dirty && !ledger.pending && !warnWhen) void navigate(exitPath); }, [exitPath, dirty, ledger.pending, warnWhen, navigate]);
  useDefaultOrganization(orgId, ledgerOptions.map(option => option.id), setOrgId, !organizations.query.isLoading);
  const locationFilters = useMemo<CrudFilters>(() => [{field:"organization_id",operator:"eq",value:orgId || NONE},{field:"is_active",operator:"eq",value:true},{field:"deleted_at",operator:"null",value:true}], [orgId]);
  const locations = useList<ErpRecord>({resource:"product_locations", filters:locationFilters, pagination:PAGE, meta, queryOptions:{...ERP_QUERY_OPTIONS,enabled:!!orgId},errorNotification:false});
  const locationOptions = locations.result.data.filter(row => row.organization_id === orgId && reportUuid(row.id) && asText(row.name));
  const locationFailed = locations.query.isError || (locations.result.total ?? 0) > PAGE.pageSize;
  const pendingQuantities: Record<string, number> = {};
  for (const request of Object.values(ledger.state?.requests ?? {})) if (request.status === "pending") for (const line of (request.command.lines ?? []) as CommerceReturnLine[]) pendingQuantities[line.entitlement_id] = (pendingQuantities[line.entitlement_id] ?? 0) + line.quantity;
  const entitlements = Object.values(ledger.state?.entitlements ?? {}).filter(item => item.quantity - item.returned - (pendingQuantities[item.id] ?? 0) > 0);
  const orders = Object.values(ledger.state?.documents ?? {}).filter(item => item.kind === "sales_order" && entitlements.some(entitlement => entitlement.document_id === item.id));
  const selectedOrder = orders.find(item => item.id === orderId);
  const eligible = entitlements.filter(item => item.document_id === orderId);
  const completed = (command: CommerceCommand) => { if (command.action !== "submit_return") return; setReason(""); setLines({}); setConfirm(null); setExitPath(`/returns?organization=${orgId}`); };
  const review = () => {
    try {
      if (!selectedOrder || locationFailed || !ledger.enabled) throw new Error("Reload the complete eligible order and locations before continuing.");
      const selected = Object.values(lines);
      for (const line of selected) {
        const entitlement = eligible.find(item => item.id === line.entitlement_id);
        if (!entitlement || line.quantity > entitlement.quantity - entitlement.returned - (pendingQuantities[entitlement.id] ?? 0) || !locationOptions.some(location => location.id === line.location_id)) throw new Error("Check the return quantities and authorized locations.");
      }
      setConfirm(newCommerceCommand({action:"submit_return",reason,document_id:orderId,lines:selected})); setError("");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Check the return."); }
  };
  return <PageContainer><Stack spacing={3}>
    <WorkspaceHeader title="Create Return" description="Record products a customer is sending back from a shipped order. Stock is restocked only after approval." backTo="/returns" />
    <CommerceWorkflowStatus ledger={ledger} onRecovered={(_, command) => completed(command)} />
    {!owner && <Alert severity={identity.isError ? "error" : "info"}>Sign in again to load permitted organizations.</Alert>}
    {locationFailed && <Alert severity="error">Authorized return locations could not be fully loaded. Refresh and retry.</Alert>}
    
    <Box component="fieldset" disabled={ledger.busy || !!ledger.pending || !!confirm || !!exitPath} sx={{border:0,p:0,m:0,minWidth:0}}><Stack spacing={3}>
      <Card><CardContent><Stack spacing={2}><Typography variant="h6">Return details</Typography>
        <Autocomplete options={options} value={org ?? null} disabled={dirty} onChange={(_,value) => {setOrgId(value?.id ?? "");setOrderId("");}} getOptionLabel={item => item.name} groupBy={item => item.authority ? "Commerce ledger active" : "Ledger not activated (read-only)"} getOptionDisabled={item => !item.authority} isOptionEqualToValue={(a,b) => a.id === b.id} renderInput={params => <TextField {...params} label="Organization" required />} />
        <Autocomplete options={orders} value={selectedOrder ?? null} disabled={!ledger.enabled || dirty} onChange={(_,value) => {setOrderId(value?.id ?? "");setLines({});}} getOptionLabel={item => `${shortNumber(item.number)} · ${asText(item.draft.customer_id ? item.snapshots.customers?.[item.draft.customer_id]?.name : item.draft.customer_name)} · ${formatDate(item.draft.order_date)}`} isOptionEqualToValue={(a,b) => a.id === b.id} noOptionsText="No shipped orders have quantities left to return" renderInput={params => <TextField {...params} label="Eligible order" required helperText="Shipped orders with quantities not yet returned." />} />
        <TextField label="Reason" required multiline minRows={2} value={reason} onChange={event => setReason(event.target.value)} inputProps={{maxLength:2000}} helperText="For example: chipped edge on delivery, wrong finish." />
      </Stack></CardContent></Card>
      <Card><CardContent><Stack spacing={2}><Typography variant="h6">Return items</Typography>
        {!eligible.length && <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>Choose an eligible order to see the products you can return.</Typography>}
        {eligible.map(item => {
          const selected = lines[item.id]; const remaining = item.quantity-item.returned-(pendingQuantities[item.id] ?? 0);
          const productName = asText(selectedOrder?.snapshots.products?.[item.product_id]?.name) || "Product";
          const updateLine = (patch:Partial<CommerceReturnLine>) => setLines(current => ({...current,[item.id]:{...current[item.id],...patch}}));
          return <Stack key={item.id} spacing={2} sx={{borderBottom:1,borderColor:"divider",pb:2}}>
            <FormControlLabel label={`${productName} · up to ${remaining} returnable`} control={<Checkbox checked={!!selected} onChange={event => setLines(current => {const next={...current};if(event.target.checked) next[item.id]={entitlement_id:item.id,location_id:locationOptions.some(location => location.id === item.source_location_id) ? item.source_location_id : "",quantity:1,condition:"new",restock:true};else delete next[item.id];return next;})} />} />
            {selected && <Stack direction={{xs:"column",md:"row"}} spacing={2}>
              <TextField label={`Return quantity · ${productName}`} type="number" onFocus={event => event.target.select()} value={selected.quantity} inputProps={{min:1,max:remaining,step:1}} onChange={event => updateLine({quantity:Number(event.target.value)})} />
              <Autocomplete sx={{minWidth:240}} options={locationOptions} value={locationOptions.find(location => location.id === selected.location_id) ?? null} loading={locations.query.isFetching} getOptionLabel={location => asText(location.name)} isOptionEqualToValue={(a,b) => a.id === b.id} onChange={(_,location) => updateLine({location_id:String(location?.id ?? "")})} renderInput={params => <TextField {...params} label="Return location" required />} />
              <TextField select label="Condition" value={selected.condition} onChange={event => updateLine({condition:event.target.value as CommerceReturnLine["condition"],restock:event.target.value === "damaged" ? false : selected.restock})}><MenuItem value="new">New / unopened</MenuItem><MenuItem value="used">Used / opened</MenuItem><MenuItem value="damaged">Damaged</MenuItem></TextField>
              <FormControlLabel label="Restock after approval" control={<Checkbox checked={selected.restock} disabled={selected.condition === "damaged"} onChange={event => updateLine({restock:event.target.checked})} />} />
            </Stack>}
          </Stack>;
        })}
      </Stack></CardContent></Card>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }} justifyContent="space-between">
        <Typography variant="caption" color="text.secondary">No refund or stock update will occur here. Approval restocks the selected items in one step.</Typography>
        <Stack direction="row" spacing={1}><Button component={RouterLink} to="/returns" variant="outlined">Cancel</Button><Button variant="contained" disabled={ledger.locked || locationFailed || locations.query.isLoading || !Object.keys(lines).length || !reason.trim()} onClick={review}>Submit Return Request</Button></Stack>
      </Stack>
    </Stack></Box>
    <Dialog open={!!confirm} onClose={() => !ledger.busy && setConfirm(null)} fullWidth maxWidth="sm"><DialogTitle>Submit this return request?</DialogTitle><DialogContent><Stack spacing={1}><Typography fontWeight={600}>{selectedOrder ? shortNumber(selectedOrder.number) : ""}</Typography>{Object.values(lines).map(line => { const item = eligible.find(entry => entry.id === line.entitlement_id); return <Typography key={line.entitlement_id} variant="body2">{asText(item ? selectedOrder?.snapshots.products?.[item.product_id]?.name : "") || "Product"}: {line.quantity} · {line.condition}{line.restock ? `, restock to ${asText(locationOptions.find(location => location.id === line.location_id)?.name) || "location"}` : ", not restocked"}</Typography>; })}<Typography variant="body2" color="text.secondary">The request waits for approval. The server rechecks remaining quantities first.</Typography></Stack></DialogContent><DialogActions><Button disabled={ledger.busy} onClick={() => setConfirm(null)}>Keep editing</Button><Button variant="contained" disabled={ledger.busy} onClick={async () => {if(confirm){const command=confirm;const state=await ledger.execute(command);if(state) completed(command);else setConfirm(null);}}}>Confirm return request</Button></DialogActions></Dialog>
  </Stack></PageContainer>;
}
