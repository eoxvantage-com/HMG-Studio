import { useEffect, useMemo, useState } from "react";
import { useGetIdentity, useList, type CrudFilters } from "@refinedev/core";
import { Autocomplete, Alert, Box, Button, Card, CardContent, Checkbox, FormControlLabel, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router";
import { PageContainer } from "../../components/PageContainer";
import { ERP_QUERY_OPTIONS, type ErpRecord } from "../../services/erp";
import { reportUuid } from "../../services/operationalReports";
import { emptyOrderDraft, orderTotals, validateOrderDraft, validateReturnLines, type OrderCreateDraft, type ReturnCreateLine } from "./commerceCreateDraft";

const PAGE = { mode: "server" as const, currentPage: 1, pageSize: 100 };
const NONE = "00000000-0000-4000-8000-000000000000";
const today = () => new Date().toISOString().slice(0, 10);
const asText = (value: unknown) => typeof value === "string" ? value : "";
const asMoney = (value: unknown): number | null => {
  if (value === "" || value === null || value === undefined) return null;
  const result = Number(value);
  return Number.isFinite(result) && result >= 0 ? result : null;
};
type Org = { id: string; name: string; currency: string };

function useOrganizations() {
  const identity = useGetIdentity<{ id: string }>();
  const owner = !identity.isLoading && !identity.isFetching && !identity.isError && reportUuid(identity.data?.id) ? identity.data!.id : "";
  const meta = useMemo(() => ({ lookupOwner: owner }), [owner]);
  const organizations = useList<ErpRecord>({ resource: "organizations", sorters: [{ field: "name", order: "asc" }], pagination: PAGE, meta, queryOptions: { ...ERP_QUERY_OPTIONS, enabled: !!owner }, errorNotification: false });
  const options: Org[] = organizations.result.data.filter(row => reportUuid(row.id) && asText(row.name).trim()).map(row => ({ id: row.id, name: asText(row.name), currency: asText(row.default_currency) || asText(row.currency) || "" }));
  return { identity, owner, meta, organizations, options };
}

function WorkspaceHeader({ title, description, backTo }: { title: string; description: string; backTo: string }) {
  return <Stack spacing={2}>
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }}>
      <Box><Typography variant="h2">{title}</Typography><Typography color="text.secondary">{description}</Typography></Box>
      <Button component={RouterLink} to={backTo} variant="outlined">Back to list</Button>
    </Stack>
    <Alert severity="warning">This form is available, but save is disabled until its server-side atomic command, organization authorization and idempotency are verified. No data will be changed.</Alert>
  </Stack>;
}

export function OrderCreateWorkspace() {
  const { identity, owner, meta, organizations, options } = useOrganizations();
  const [orgId, setOrgId] = useState("");
  const org = options.find(item => item.id === orgId);
  useEffect(() => { if (!orgId && !organizations.query.isLoading && organizations.result.total === 1 && options.length === 1) setOrgId(options[0].id); }, [orgId, organizations.query.isLoading, organizations.result.total, options]);
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
    if (!selectedProduct || !Number.isSafeInteger(quantity) || quantity < 1 || (selectedProduct.has_variants === true && !selectedVariant)) return;
    const currencyPrices = selectedProduct.price_in_currencies && typeof selectedProduct.price_in_currencies === "object" ? selectedProduct.price_in_currencies as Record<string, unknown> : undefined;
    const selectedCurrencyPrice = currencyPrices?.[draft.currency];
    const productCurrency = asText(selectedProduct.currency || org?.currency);
    const priceValue = selectedVariant?.price ?? selectedCurrencyPrice ?? (productCurrency === draft.currency ? selectedProduct.price : undefined);
    const price = asMoney(priceValue);
    if (price === null) return;
    const item = { product_id: selectedProduct.id, product_variant_id: selectedVariant?.id ? String(selectedVariant.id) : null, product_name: asText(selectedProduct.name), sku: asText(selectedVariant?.sku) || asText(selectedProduct.sku), quantity, unit_price: price };
    setDraft(current => ({ ...current, items: [...current.items, item] }));
    setSelectedProduct(null); setSelectedVariant(null); setQuantity(1);
  };
  const update = (key: keyof OrderCreateDraft, value: unknown) => setDraft(current => ({ ...current, [key]: value }));
  return <PageContainer><Stack spacing={3}>
    <WorkspaceHeader title="Create Order" description="Add a customer order and its line items." backTo="/orders" />
    {!owner && <Alert severity={identity.isError ? "error" : "info"}>Sign in again to load permitted organizations.</Alert>}
    {lookupFailed && <Alert severity="error">Some permitted customer, product or variant options could not be fully loaded. Refresh and retry before continuing.</Alert>}
    {options.length === 0 && !organizations.query.isLoading && <Alert severity="warning">No permitted organizations are available.</Alert>}
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "7fr 5fr" }, gap: 3 }}>
      <Stack spacing={3}>
        <Card><CardContent><Stack spacing={2}><Typography variant="h6">Customer Information</Typography>
          <Autocomplete options={options} value={org ?? null} onChange={(_, value) => { setOrgId(value?.id ?? ""); setSelectedCustomer(null); setSelectedProduct(null); setDraft(current => ({ ...current, organization_id: value?.id ?? "", currency: value?.currency ?? "", customer_id: null, customer_name: "", customer_email: "", customer_address: "", items: [] })); }} getOptionLabel={item => item.name} isOptionEqualToValue={(a,b) => a.id === b.id} renderInput={params => <TextField {...params} label="Organization" required error={!!errors.organization_id} helperText={errors.organization_id ?? "Choose the organization for this order."} />} />
          <Autocomplete options={customers.result.data} value={selectedCustomer} onChange={(_, value) => { setSelectedCustomer(value); setDraft(current => ({ ...current, customer_id: value ? String(value.id) : null, customer_name: asText(value?.name), customer_email: asText(value?.email), customer_address: asText(value?.shipping_address) || asText(value?.billing_address), currency: asText(value?.currency) || current.currency })); }} onInputChange={(_, value, reason) => { if (reason === "input") setCustomerSearch(value); }} filterOptions={items => items} getOptionLabel={item => `${asText(item.name)}${item.email ? ` · ${item.email}` : ""}`} isOptionEqualToValue={(a,b) => a.id === b.id} disabled={!orgId} renderInput={params => <TextField {...params} label="Saved customer (optional)" helperText="Search permitted customers, or enter one-off details below." />} />
          <TextField label="Customer name" required value={draft.customer_name} onChange={event => update("customer_name", event.target.value)} error={!!errors.customer_name} helperText={errors.customer_name} />
          <TextField label="Customer email" type="email" value={draft.customer_email} onChange={event => update("customer_email", event.target.value)} error={!!errors.customer_email} helperText={errors.customer_email} />
          <TextField label="Shipping address" multiline minRows={2} value={draft.customer_address} onChange={event => update("customer_address", event.target.value)} />
        </Stack></CardContent></Card>
        <Card><CardContent><Stack spacing={2}><Typography variant="h6">Order Items</Typography>
          <Autocomplete options={products.result.data} value={selectedProduct} onChange={(_, value) => { setSelectedProduct(value); setSelectedVariant(null); }} onInputChange={(_, value, reason) => { if (reason === "input") setProductSearch(value); }} filterOptions={items => items} getOptionLabel={item => `${asText(item.name)} (${asText(item.sku)})`} isOptionEqualToValue={(a,b) => a.id === b.id} disabled={!orgId} renderInput={params => <TextField {...params} label="Product" helperText="Choose an active product in the selected organization." />} />
          {selectedProduct?.has_variants === true && <Autocomplete options={variants.result.data} value={selectedVariant} onChange={(_, value) => setSelectedVariant(value)} filterOptions={items => items} getOptionLabel={item => `${asText(item.title)}${item.sku ? ` (${item.sku})` : ""}`} isOptionEqualToValue={(a,b) => a.id === b.id} renderInput={params => <TextField {...params} label="Product variant" required helperText="Choose an active variant." />} />}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}><TextField label="Quantity" type="number" value={quantity} inputProps={{ min: 1, step: 1 }} onChange={event => setQuantity(Number(event.target.value))} /><Button onClick={addItem} variant="outlined" disabled={!selectedProduct || (selectedProduct.has_variants === true && !selectedVariant)}>Add line</Button></Stack>
          {errors.items && <Typography color="error">{errors.items}</Typography>}
          {draft.items.map((item, index) => <Stack key={`${item.product_id}:${item.product_variant_id}:${index}`} direction="row" justifyContent="space-between" alignItems="center" sx={{ borderBottom: 1, borderColor: "divider", py: 1 }}><Typography>{item.product_name} · {item.sku} × {item.quantity}</Typography><Stack direction="row" spacing={1} alignItems="center"><Typography>{(item.quantity * item.unit_price).toFixed(2)} {draft.currency}</Typography><Button size="small" color="error" onClick={() => update("items", draft.items.filter((_, i) => i !== index))}>Remove</Button></Stack></Stack>)}
        </Stack></CardContent></Card>
      </Stack>
      <Stack spacing={3}>
        <Card><CardContent><Stack spacing={2}><Typography variant="h6">Order Details</Typography><TextField label="Order date" type="date" required value={draft.order_date} onChange={event => update("order_date", event.target.value)} InputLabelProps={{ shrink: true }} error={!!errors.order_date} helperText={errors.order_date} /><TextField label="Currency" value={draft.currency} InputProps={{ readOnly: true }} helperText="Uses the selected customer's currency when available, otherwise the organization currency." /><TextField label="Tax amount" type="number" inputProps={{ min: 0, step: "0.01" }} value={draft.tax} onChange={event => update("tax", Number(event.target.value))} error={!!errors.tax} helperText={errors.tax} /><TextField label="Shipping" type="number" inputProps={{ min: 0, step: "0.01" }} value={draft.shipping} onChange={event => update("shipping", Number(event.target.value))} error={!!errors.shipping} helperText={errors.shipping} /><TextField label="Notes" multiline minRows={2} value={draft.notes} onChange={event => update("notes", event.target.value)} /></Stack></CardContent></Card>
        <Card><CardContent><Stack spacing={1}><Typography variant="h6">Order Summary</Typography><Typography>Subtotal: {totals.subtotal?.toFixed(2) ?? "Unavailable"} {draft.currency}</Typography><Typography>Tax: {totals.tax?.toFixed(2) ?? "Unavailable"} {draft.currency}</Typography><Typography>Shipping: {totals.shipping?.toFixed(2) ?? "Unavailable"} {draft.currency}</Typography><Typography variant="h6">Total: {totals.total?.toFixed(2) ?? "Unavailable"} {draft.currency}</Typography>{errors.total && <Typography color="error">{errors.total}</Typography>}</Stack></CardContent></Card>
        <Button variant="contained" disabled aria-describedby="order-save-blocker">Create Order</Button><Typography id="order-save-blocker" variant="caption" color="text.secondary">No order or stock write has been sent.</Typography>
      </Stack>
    </Box>
  </Stack></PageContainer>;
}

export function ReturnCreateWorkspace() {
  const { identity, owner, meta, organizations, options } = useOrganizations();
  const [orgId, setOrgId] = useState("");
  const [orderId, setOrderId] = useState("");
  const org = options.find(item => item.id === orgId);
  useEffect(() => { if (!orgId && !organizations.query.isLoading && organizations.result.total === 1 && options.length === 1) setOrgId(options[0].id); }, [orgId, organizations.query.isLoading, organizations.result.total, options]);
  const orderFilters = useMemo<CrudFilters>(() => [{ field: "organization_id", operator: "eq", value: orgId || NONE }, { field: "status", operator: "in", value: ["shipped", "delivered"] }, { field: "deleted_at", operator: "null", value: true }], [orgId]);
  const orders = useList<ErpRecord>({ resource: "orders", filters: orderFilters, sorters: [{ field: "order_date", order: "desc" }], pagination: PAGE, meta, queryOptions: { ...ERP_QUERY_OPTIONS, enabled: !!orgId }, errorNotification: false });
  const lineFilters = useMemo<CrudFilters>(() => [{ field: "order_id", operator: "eq", value: orderId || NONE }], [orderId]);
  const returnFilters = useMemo<CrudFilters>(() => [{ field: "order_id", operator: "eq", value: orderId || NONE }], [orderId]);
  const orderLines = useList<ErpRecord>({ resource: "order_items", filters: lineFilters, pagination: PAGE, meta, queryOptions: { ...ERP_QUERY_OPTIONS, enabled: !!orderId }, errorNotification: false });
  const priorReturns = useList<ErpRecord>({ resource: "return_orders", filters: returnFilters, pagination: PAGE, meta, queryOptions: { ...ERP_QUERY_OPTIONS, enabled: !!orderId }, errorNotification: false });
  const priorReturnIds = priorReturns.result.data.filter(row => !["rejected", "cancelled"].includes(asText(row.status))).map(row => String(row.id));
  const claimFilters = useMemo<CrudFilters>(() => [{ field: "return_order_id", operator: "in", value: priorReturnIds.length ? priorReturnIds : [NONE] }], [priorReturnIds.join("|")]);
  const claims = useList<ErpRecord>({ resource: "return_order_items", filters: claimFilters, pagination: PAGE, meta, queryOptions: { ...ERP_QUERY_OPTIONS, enabled: !!orderId && priorReturnIds.length > 0 }, errorNotification: false });
  const [type, setType] = useState<"return" | "exchange">("return");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<Record<string, ReturnCreateLine>>({});
  useEffect(() => setLines({}), [orderId]);
  const claimed = new Map<string, number>();
  for (const item of claims.result.data) {
    const returnRecord = priorReturns.result.data.find(row => row.id === item.return_order_id);
    if (!returnRecord || ["rejected", "cancelled"].includes(asText(returnRecord.status))) continue;
    claimed.set(String(item.order_item_id), (claimed.get(String(item.order_item_id)) ?? 0) + (Number(item.quantity) || 0));
  }
  const selectedLines = Object.values(lines);
  const validation = validateReturnLines(selectedLines);
  const loadError = identity.isError || organizations.query.isError || orders.query.isError || orderLines.query.isError || priorReturns.query.isError || claims.query.isError || (orders.result.total ?? 0) > PAGE.pageSize || (orderLines.result.total ?? 0) > PAGE.pageSize || (priorReturns.result.total ?? 0) > PAGE.pageSize || (claims.result.total ?? 0) > PAGE.pageSize;
  const lineRecords = orderLines.result.data;
  const toggle = (row: ErpRecord, selected: boolean) => {
    const id = String(row.id);
    const returnable = Math.max(0, (Number(row.quantity) || 0) - (claimed.get(id) ?? 0));
    setLines(current => {
      if (!selected || !returnable) { const next = { ...current }; delete next[id]; return next; }
      return { ...current, [id]: { order_item_id: id, product_id: String(row.product_id ?? ""), quantity: 1, returnable_quantity: returnable, condition: "new", restock: true } };
    });
  };
  return <PageContainer><Stack spacing={3}>
    <WorkspaceHeader title="Create Return" description="Select an eligible order, then choose the lines and quantities to return." backTo="/returns" />
    {!owner && <Alert severity={identity.isError ? "error" : "info"}>Sign in again to load permitted organizations.</Alert>}
    {loadError && <Alert severity="error">Return eligibility could not be fully verified from permitted records. No return can be saved.</Alert>}
    {options.length === 0 && !organizations.query.isLoading && <Alert severity="warning">No permitted organizations are available.</Alert>}
    <Card><CardContent><Stack spacing={2}><Typography variant="h6">Return Details</Typography>
      <Autocomplete options={options} value={org ?? null} onChange={(_, value) => { setOrgId(value?.id ?? ""); setOrderId(""); }} getOptionLabel={item => item.name} isOptionEqualToValue={(a,b) => a.id === b.id} renderInput={params => <TextField {...params} label="Organization" required helperText="Choose the organization that owns the source order." />} />
      <Autocomplete options={orders.result.data} value={orders.result.data.find(row => row.id === orderId) ?? null} onChange={(_, value) => setOrderId(value ? String(value.id) : "")} filterOptions={items => items} getOptionLabel={item => `${asText(item.order_number)} · ${asText(item.customer_name)} · ${asText(item.status)}`} isOptionEqualToValue={(a,b) => a.id === b.id} disabled={!orgId} renderInput={params => <TextField {...params} label="Eligible order" required helperText="Only shipped and delivered orders are listed." />} />
      <TextField select label="Type" value={type} onChange={event => setType(event.target.value as "return" | "exchange")}><MenuItem value="return">Return (refund handled separately)</MenuItem><MenuItem value="exchange">Exchange request</MenuItem></TextField>
      <TextField label="Reason" required value={reason} onChange={event => setReason(event.target.value)} />
      <TextField label="Notes (optional)" multiline minRows={2} value={notes} onChange={event => setNotes(event.target.value)} />
    </Stack></CardContent></Card>
    <Card><CardContent><Stack spacing={2}><Typography variant="h6">Return Items</Typography>
      {orderId && orderLines.result.total === 0 && !orderLines.query.isLoading && <Typography color="text.secondary">This order has no returnable line items.</Typography>}
      {lineRecords.map(row => {
        const id = String(row.id); const returnable = Math.max(0, (Number(row.quantity) || 0) - (claimed.get(id) ?? 0)); const selected = lines[id];
        return <Stack key={id} direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }} sx={{ borderBottom: 1, borderColor: "divider", py: 1 }}>
          <FormControlLabel control={<Checkbox checked={!!selected} disabled={!returnable || loadError} onChange={event => toggle(row, event.target.checked)} />} label={`${asText(row.product_name)} · ${asText(row.sku)} (ordered ${Number(row.quantity) || 0}, remaining ${returnable})`} />
          {selected && <><TextField label="Quantity" type="number" size="small" value={selected.quantity} inputProps={{ min: 1, max: returnable, step: 1 }} error={!!validation[`items.${lineRecords.indexOf(row)}.quantity`]} onChange={event => setLines(current => ({ ...current, [id]: { ...current[id], quantity: Number(event.target.value) } }))} /><TextField select label="Condition" size="small" value={selected.condition} onChange={event => setLines(current => ({ ...current, [id]: { ...current[id], condition: event.target.value as ReturnCreateLine["condition"], restock: event.target.value === "damaged" ? false : current[id].restock } }))}><MenuItem value="new">New / unopened</MenuItem><MenuItem value="used">Used / opened</MenuItem><MenuItem value="damaged">Damaged</MenuItem></TextField><FormControlLabel control={<Checkbox checked={selected.restock} disabled={selected.condition === "damaged"} onChange={event => setLines(current => ({ ...current, [id]: { ...current[id], restock: event.target.checked } }))} />} label="Restock" /></>}
        </Stack>;
      })}
      {validation.items && <Typography color="error">{validation.items}</Typography>}
    </Stack></CardContent></Card>
    <Button variant="contained" disabled aria-describedby="return-save-blocker">Submit Return Request</Button><Typography id="return-save-blocker" variant="caption" color="text.secondary">Saving is unavailable until the atomic return command verifies remaining quantities and persists header and lines together. No refund or stock update will occur here.</Typography>
  </Stack></PageContainer>;
}
