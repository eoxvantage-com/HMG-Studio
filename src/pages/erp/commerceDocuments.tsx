import { useEffect, useMemo, useRef, useState } from "react";
import { useCustomMutation, useList, useNotification, useWarnAboutChange, type CrudFilters } from "@refinedev/core";
import { Link as RouterLink, useLocation } from "react-router";
import {
  Alert, Autocomplete, Box, Breadcrumbs, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, IconButton, InputAdornment, Link, MenuItem, Skeleton, Stack, Tab, Table, TableBody, TableCell, TableHead,
  TablePagination, TableRow, Tabs, TextField, Tooltip, Typography,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import { useSessionOwner } from "../../hooks/useSessionOwner";
import { useDefaultOrganization } from "../../hooks/useDefaultOrganization";
import { StockLedgerWorkspace } from "./stockLedger";
import { PageContainer } from "../../components/PageContainer";
import { CommerceWorkflowStatus, RefreshWorkflowButton } from "../../components/CommerceWorkflowStatus";
import { useCommerceLedger } from "../../hooks/useCommerceLedger";
import { ERP_QUERY_OPTIONS, type ErpRecord } from "../../services/erp";
import { reportUuid } from "../../services/operationalReports";
import { toast } from "../../providers/notificationProvider";
import { allocationProblems, availableAt, requiredByLine, suggestAllocations, type AllocationMode } from "../../services/commerceAllocation";
import { formatDate, formatMoney, shortNumber, statusColor, statusLabel } from "../../services/commercePresentation";
import { isTestOrganization } from "../../services/commerceLedger";
import { LEDGER_FUNCTION, canonicalMoney, hasCommerceAuthority, newCommerceCommand, parseDocumentPage, type Allocation, type CommerceCommand, type CommerceReturnLine, type CommerceDocument, type CommerceDraft, type CommerceKind, type DocumentPage } from "../../services/stockLedger";

const PAGE = { mode: "server" as const, currentPage: 1, pageSize: 100 };
const text = (value: unknown) => typeof value === "string" ? value : "";
const pathFor = (kind: CommerceKind) => kind === "sales_order" ? "/orders" : "/purchase-orders";
type Ledger = ReturnType<typeof useCommerceLedger>;
export const documentParty = (document: CommerceDocument) => document.kind === "sales_order"
  ? document.draft.customer_id ? text(document.snapshots.customers?.[document.draft.customer_id]?.name) || "Customer unavailable" : text(document.draft.customer_name)
  : text(document.snapshots.suppliers?.[document.draft.supplier_id ?? ""]?.name) || "Supplier unavailable";
const productName = (document: CommerceDocument, id: string) => text(document.snapshots.products?.[id]?.name) || "Product unavailable";
const fulfilledKey = (lineId: string, locationId: string) => JSON.stringify([lineId, locationId]);
const SectionTitle = ({ children }: { children: string }) => <Typography sx={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", color: "text.disabled", mb: 1 }}>{children}</Typography>;
const StatusChip = ({ status }: { status: string }) => <Chip size="small" label={statusLabel(status)} color={statusColor(status)} />;

export function CommerceDocumentsWorkspace(props: { kind?: CommerceKind; documentId?: string; edit?: boolean; approvals?: boolean; returns?: boolean; stockKind?: "movement" | "adjustment" }) {
  const { owner } = useSessionOwner();
  return <CommerceDocumentsInner key={owner} {...props} />;
}

function CommerceDocumentsInner({ kind = "sales_order", documentId, edit = false, approvals = false, returns = false, stockKind }: { kind?: CommerceKind; documentId?: string; edit?: boolean; approvals?: boolean; returns?: boolean; stockKind?: "movement" | "adjustment" }) {
  const { owner } = useSessionOwner();
  const route = useLocation();
  const [organizationId, setOrganizationId] = useState(new URLSearchParams(route.search).get("organization") ?? "");
  const meta = useMemo(() => ({ lookupOwner: owner }), [owner]);
  const organizations = useList<ErpRecord>({ resource: "organizations", pagination: PAGE, meta, queryOptions: { ...ERP_QUERY_OPTIONS, enabled: !!owner }, errorNotification: false });
  const options = (owner && !organizations.query.isError ? organizations.result.data : [])
    .filter(row => row.is_active !== false && !row.deleted_at && reportUuid(row.id) && text(row.name) && (!isTestOrganization(row) || row.id === organizationId))
    .sort((a, b) => Number(hasCommerceAuthority(b)) - Number(hasCommerceAuthority(a)) || text(a.name).localeCompare(text(b.name)));
  const ledgerOptions = options.filter(row => hasCommerceAuthority(row));
  const organization = options.find(row => row.id === organizationId);
  useDefaultOrganization(organizationId, ledgerOptions.map(row => row.id), setOrganizationId, !organizations.query.isLoading);
  const ledger = useCommerceLedger(organizationId, !!organization && hasCommerceAuthority(organization));
  const [dirty, setDirty] = useState(false); const { setWarnWhen } = useWarnAboutChange();
  useEffect(() => { setWarnWhen(dirty || !!ledger.pending); return () => setWarnWhen(false); }, [dirty, ledger.pending, setWarnWhen]);
  const filters = useMemo<CrudFilters>(() => [{ field: "organization_id", operator: "eq", value: organizationId }, { field: "is_active", operator: "eq", value: true }, { field: "deleted_at", operator: "null", value: true }], [organizationId]);
  const locations = useList<ErpRecord>({ resource: "product_locations", filters, pagination: PAGE, meta, queryOptions: { ...ERP_QUERY_OPTIONS, enabled: !!organizationId }, errorNotification: false });
  const namedLocations = locations.result.data.filter(row => row.organization_id === organizationId && reportUuid(row.id) && text(row.name));
  const locationError = locations.query.isError || (locations.result.total ?? 0) > 100;
  const title = stockKind ? stockKind === "movement" ? "Stock transfers" : "Stock adjustments" : approvals ? "Approvals" : returns ? "Returns" : kind === "sales_order" ? "Sales orders" : "Purchase orders";
  const subtitle = stockKind ? "Move or correct stock through reviewed ledger requests." : approvals ? "Everything waiting for a decision, in one queue." : returns ? "Review customer returns and restock eligible items." : kind === "sales_order" ? "Quote, approve, reserve and ship customer orders." : "Order stone from suppliers and receive it into your yards.";
  const lastDocument = useRef<{ scope: string; document: CommerceDocument } | null>(null);
  const documentScope = `${owner}:${organizationId}:${documentId ?? ""}`;
  const liveDocument = documentId ? ledger.state?.documents[documentId] : undefined;
  if (liveDocument) lastDocument.current = { scope: documentScope, document: liveDocument };
  const current = liveDocument ?? (lastDocument.current?.scope === documentScope ? lastDocument.current.document : undefined);
  const [tab, setTab] = useState(0); const [recovered, setRecovered] = useState<CommerceCommand | null>(null);
  const locked = dirty || !!ledger.pending || ledger.busy;
  const listPath = returns ? "/returns" : pathFor(kind);
  return <PageContainer><Stack spacing={3}>
    <Breadcrumbs><Link component={RouterLink} to="/">Workspace</Link>{documentId ? <Link component={RouterLink} to={`${listPath}${organizationId ? `?organization=${organizationId}` : ""}`}>{title}</Link> : <Typography color="text.primary" fontWeight={600}>{title}</Typography>}{documentId && current && <Typography color="text.primary" fontWeight={600}>{shortNumber(current.number)}</Typography>}</Breadcrumbs>
    {!documentId && <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ md: "center" }} spacing={2}>
      <Box><Typography variant="h2">{title}</Typography><Typography color="text.secondary">{subtitle}</Typography></Box>
      {!approvals && !stockKind && <Button component={RouterLink} to={`${listPath}/create`} variant="contained" startIcon={<AddRoundedIcon />}>{returns ? "Create return" : kind === "sales_order" ? "Create order" : "Create purchase order"}</Button>}
    </Stack>}
    <Stack direction="row" spacing={1} alignItems="center">
      <Autocomplete size="small" sx={{ width: { xs: "100%", sm: 320 } }} options={options} value={organization ?? null} disabled={locked} loading={organizations.query.isFetching}
        getOptionLabel={row => text(row.name)} groupBy={row => hasCommerceAuthority(row) ? "Ledger active" : "Ledger not activated (read-only)"} getOptionDisabled={row => !hasCommerceAuthority(row)}
        isOptionEqualToValue={(a, b) => a.id === b.id} onChange={(_, row) => setOrganizationId(row?.id ?? "")} disableClearable={!!organization}
        renderInput={params => <TextField {...params} label="Organization" required error={organizations.query.isError} helperText={organizations.query.isError ? "Organizations could not be loaded. Refresh and try again." : !owner ? "Loading your session…" : ledgerOptions.length === 0 && !organizations.query.isLoading ? "None of your organizations has the commerce ledger activated yet." : undefined} />} />
      <RefreshWorkflowButton ledger={ledger} />
    </Stack>
    <CommerceWorkflowStatus ledger={ledger} onRecovered={(_, command) => setRecovered(command)} />
    {documentId && current && !liveDocument && <Alert severity="warning">This document could not be re-verified. Your draft is kept, but saving is locked until the workflow reloads.</Alert>}
    {stockKind ? <StockLedgerWorkspace key={`${owner}:${organizationId}:${stockKind}`} organizationId={organizationId} ledger={ledger} kind={stockKind} onDirtyChange={setDirty} />
      : documentId ? current && current.kind === kind ? <CommerceDocumentDetail key={`${owner}:${organizationId}:${documentId}`} document={current} ledger={liveDocument ? ledger : { ...ledger, enabled: false, locked: true }} locations={namedLocations} locationError={locationError} recovered={recovered} edit={edit} onDirty={setDirty} />
        : <Alert severity="info">No verified document is available in the selected organization. Refresh the workflow or select the correct organization; no historical row is substituted.</Alert>
      : approvals ? <>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} aria-label="Approval queues" variant="scrollable">{["Sales orders", "Purchase orders", "Returns", "Stock transfers", "Stock adjustments"].map(label => <Tab key={label} label={label} disabled={locked} />)}</Tabs>
        {tab >= 3 ? <StockLedgerWorkspace key={`${owner}:${organizationId}:${tab}`} organizationId={organizationId} ledger={ledger} kind={tab === 3 ? "movement" : "adjustment"} queueOnly onDirtyChange={setDirty} />
          : tab === 2 ? <ReturnQueue key={`${owner}:${organizationId}`} ledger={ledger} locations={namedLocations} />
            : <DocumentList key={`${organizationId}:${tab}`} kind={tab === 0 ? "sales_order" : "purchase_order"} organizationId={organizationId} enabled={ledger.enabled} approvals head={ledger.state?.head} />}
      </>
        : returns ? <ReturnQueue key={`${owner}:${organizationId}`} ledger={ledger} locations={namedLocations} />
          : <DocumentList key={`${organizationId}:${kind}`} kind={kind} organizationId={organizationId} enabled={ledger.enabled} head={ledger.state?.head} />}
  </Stack></PageContainer>;
}

const STATUSES = ["pending", "approved", "partially_fulfilled", "fulfilled", "partially_received", "received", "rejected", "cancelled"];
function DocumentList({ kind, organizationId, enabled, approvals = false, head }: { kind: CommerceKind; organizationId: string; enabled: boolean; approvals?: boolean; head?: string }) {
  const { mutateAsync } = useCustomMutation(); const api = useRef(mutateAsync); api.current = mutateAsync;
  const [search, setSearch] = useState(""); const [status, setStatus] = useState(approvals ? "pending" : ""); const [page, setPage] = useState(0); const [pageSize, setPageSize] = useState(20); const [revision, setRevision] = useState(0);
  const resultScope = useRef(""); const queryScope = `${organizationId}:${kind}:${page}:${pageSize}:${search}:${status}:${revision}`;
  const [result, setResult] = useState<DocumentPage | null>(null); const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const pinned = useRef<string | undefined>(undefined); const request = useRef(0);
  useEffect(() => { setPage(0); pinned.current = undefined; setRevision(value => value + 1); }, [head]);
  useEffect(() => {
    const token = ++request.current; setResult(null); setError(""); if (!enabled) { setBusy(false); return; }
    setBusy(true);
    const timer = window.setTimeout(() => {
      void api.current({ url: LEDGER_FUNCTION, method: "post", dataProviderName: "app", meta: { kind: "function", async: false }, values: { action: "documents", organization_id: organizationId, kind, page: page + 1, page_size: pageSize, ...(search.trim() ? { search: search.trim() } : {}), ...(status ? { status } : {}), ...(page > 0 && pinned.current ? { expected_head: pinned.current } : {}) }, successNotification: false, errorNotification: false }).then(response => {
        if (token !== request.current) return;
        const raw = response.data as { code?: string }; if (raw?.code === "HEAD_CHANGED") { pinned.current = undefined; setPage(0); setRevision(value => value + 1); setError("The ledger changed. Reloading the first page to avoid mixing snapshots."); return; }
        const parsed = parseDocumentPage(response.data, organizationId); if (!parsed || parsed.data.some(document => document.kind !== kind) || page > 0 && parsed.head !== pinned.current) throw new Error("The document page could not be verified.");
        pinned.current = parsed.head; resultScope.current = queryScope; setResult(parsed);
      }).catch(failure => { if (token === request.current) setError(failure instanceof Error ? failure.message : "Unable to load documents."); }).finally(() => { if (token === request.current) setBusy(false); });
    }, 300);
    return () => { window.clearTimeout(timer); request.current++; };
  }, [organizationId, kind, enabled, page, pageSize, search, status, revision]);
  const visibleResult = enabled && resultScope.current === queryScope ? result : null;
  const reset = () => { setPage(0); pinned.current = undefined; };
  const party = kind === "sales_order" ? "Customer" : "Supplier";
  return <Card><CardContent><Stack spacing={2}>
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
      <TextField size="small" label="Search documents" placeholder={`Number or ${party.toLowerCase()}`} value={search} inputProps={{ maxLength: 200 }} sx={{ minWidth: 260 }} onChange={event => { reset(); setSearch(event.target.value); }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }} />
      <TextField size="small" select label="Status" value={status} sx={{ minWidth: 200 }} onChange={event => { reset(); setStatus(event.target.value); }}><MenuItem value="">All statuses</MenuItem>{STATUSES.filter(value => kind === "sales_order" ? !value.includes("received") : !value.includes("fulfilled")).map(value => <MenuItem key={value} value={value}>{statusLabel(value)}</MenuItem>)}</TextField>
      <Box flex={1} />
      <Button variant="outlined" size="small" disabled={busy || !enabled} onClick={() => { reset(); setRevision(value => value + 1); }}>Refresh documents</Button>
    </Stack>
    {(search || status) && <Stack direction="row" spacing={1}>{search && <Chip label={`Search: ${search}`} onDelete={() => { reset(); setSearch(""); }} />}{status && <Chip label={`Status: ${statusLabel(status)}`} onDelete={() => { reset(); setStatus(""); }} />}</Stack>}
    {error && <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => { reset(); setRevision(value => value + 1); }}>Try again</Button>}>Unable to load documents. {error}</Alert>}
    <Table aria-label="Commerce documents" size="small">
      <TableHead><TableRow><TableCell>Number</TableCell><TableCell>{party}</TableCell><TableCell>Status</TableCell><TableCell>Date</TableCell><TableCell align="right">Total</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
      <TableBody>
        {busy && !visibleResult && [0, 1, 2, 3].map(index => <TableRow key={index}>{[0, 1, 2, 3, 4, 5].map(cell => <TableCell key={cell}><Skeleton /></TableCell>)}</TableRow>)}
        {visibleResult?.data.map(document => <TableRow key={document.id} hover>
          <TableCell><Tooltip title={document.number}><Link component={RouterLink} to={`${pathFor(kind)}/show/${document.id}?organization=${organizationId}`} underline="hover" fontWeight={600}>{shortNumber(document.number)}</Link></Tooltip></TableCell>
          <TableCell sx={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{documentParty(document) || "—"}</TableCell>
          <TableCell><StatusChip status={document.status} /></TableCell>
          <TableCell>{formatDate(document.draft.order_date)}</TableCell>
          <TableCell align="right">{formatMoney(document.total, document.draft.currency)}</TableCell>
          <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
            <Tooltip title={approvals ? "Review" : "View"}><IconButton size="small" component={RouterLink} to={`${pathFor(kind)}/show/${document.id}?organization=${organizationId}`} aria-label={approvals ? "Review" : "View"}><VisibilityRoundedIcon fontSize="small" /></IconButton></Tooltip>
            {["pending", "rejected"].includes(document.status) && <Tooltip title="Edit"><IconButton size="small" component={RouterLink} to={`${pathFor(kind)}/edit/${document.id}?organization=${organizationId}`} aria-label="Edit"><EditRoundedIcon fontSize="small" /></IconButton></Tooltip>}
          </TableCell>
        </TableRow>)}
      </TableBody>
    </Table>
    {!busy && !error && enabled && visibleResult?.total === 0 && <Stack alignItems="center" spacing={1} sx={{ py: 4 }}><ReceiptLongRoundedIcon color="disabled" fontSize="large" /><Typography variant="h6">{search ? "No results found" : status ? "No matching items" : "No documents yet"}</Typography><Typography color="text.secondary">{search ? "Try another document number or name." : status ? "Change the status filter." : "Create the first document for this organization."}</Typography></Stack>}
    <TablePagination component="div" count={visibleResult?.total ?? -1} page={page} rowsPerPage={pageSize} rowsPerPageOptions={[10, 20, 50]} onPageChange={(_, value) => { if (!busy && pinned.current) setPage(value); }} onRowsPerPageChange={event => { reset(); setPageSize(Number(event.target.value)); }} />
  </Stack></CardContent></Card>;
}

type WorkflowAction = "approve_document" | "reject_document" | "cancel_document" | "fulfill_order" | "receive_purchase_order" | "amend_document";
const ACTION_COPY: Record<WorkflowAction, { title: (number: string, sales: boolean) => string; body: (sales: boolean) => string; confirm: (sales: boolean) => string; reason: (sales: boolean) => string; destructive?: boolean }> = {
  approve_document: { title: (number, sales) => sales ? `Approve ${number} and reserve stock?` : `Approve ${number}?`, body: sales => sales ? "Choose where the stock comes from. Reserving does not ship anything yet; you post the fulfillment later." : "Approval lets you receive stock against this purchase order. No stock moves yet.", confirm: sales => sales ? "Approve and reserve stock" : "Approve purchase order", reason: sales => sales ? "Approved; stock reserved for the customer." : "Purchase approved." },
  reject_document: { title: number => `Reject ${number}?`, body: () => "The document stays on record as rejected and can be edited and resubmitted. No stock moves.", confirm: sales => sales ? "Reject order" : "Reject purchase order", reason: () => "", destructive: true },
  cancel_document: { title: number => `Cancel ${number}?`, body: () => "Cancelling releases any reserved stock. This action cannot be undone.", confirm: sales => sales ? "Cancel order" : "Cancel purchase order", reason: () => "", destructive: true },
  fulfill_order: { title: number => `Ship ${number}?`, body: () => "Posts the shipment and takes the stock out of the reserved locations. Lower a quantity to ship part of the order.", confirm: () => "Post fulfillment", reason: () => "Dispatched to the customer." },
  receive_purchase_order: { title: number => `Receive stock for ${number}?`, body: () => "Adds the received slabs to the chosen locations. Lower a quantity to record a partial delivery.", confirm: () => "Post receipt", reason: () => "Goods received and checked." },
  amend_document: { title: number => `Save changes to ${number}?`, body: () => "The ledger rechecks the revision and recalculates the total.", confirm: () => "Confirm and save", reason: () => "" },
};

function CommerceDocumentDetail({ document, ledger, locations, locationError, recovered, edit, onDirty }: { recovered: CommerceCommand | null; document: CommerceDocument; ledger: Ledger; locations: ErpRecord[]; locationError: boolean; edit: boolean; onDirty: (dirty: boolean) => void }) {
  const { open } = useNotification();
  const [draft, setDraft] = useState<CommerceDraft>(() => structuredClone(document.draft)); const [dirty, setDirty] = useState(false); const [reason, setReason] = useState("");
  const [action, setAction] = useState<WorkflowAction | null>(null); const [tab, setTab] = useState(0);
  const [amendment, setAmendment] = useState<CommerceDraft | null>(null);
  const [draftRevision, setDraftRevision] = useState(document.revision);
  const [productSearch, setProductSearch] = useState(""); const [selectedProduct, setSelectedProduct] = useState<ErpRecord | null>(null);
  const organizationId = ledger.state?.organization_id ?? "";
  const productFilters = useMemo<CrudFilters>(() => [{ field: "organization_id", operator: "eq", value: organizationId }, { field: "is_active", operator: "eq", value: true }, { field: "deleted_at", operator: "null", value: true }, { field: "type", operator: "eq", value: "standard" }, { field: "tracking_type", operator: "eq", value: "none" }, ...(productSearch ? [{ field: "name", operator: "contains" as const, value: productSearch }] : [])], [organizationId, productSearch]);
  const products = useList<ErpRecord>({ resource: "products", filters: productFilters, pagination: { mode: "server", currentPage: 1, pageSize: 20 }, meta: { lookupOwner: ledger.owner }, queryOptions: { ...ERP_QUERY_OPTIONS, enabled: edit && ledger.enabled }, errorNotification: false });
  const productOptions = products.result.data.filter(row => row.organization_id === organizationId && row.is_active !== false && !row.deleted_at && row.type === "standard" && row.tracking_type === "none" && row.has_variants !== true && reportUuid(row.id));
  const [addedNames, setAddedNames] = useState<Record<string, string>>({});
  const editable = ["pending", "rejected"].includes(document.status); const sales = document.kind === "sales_order";
  const number = shortNumber(document.number);
  useEffect(() => { onDirty(dirty); return () => onDirty(false); }, [dirty, onDirty]);
  useEffect(() => { if (!dirty) { setDraft(structuredClone(document.draft)); setDraftRevision(document.revision); } }, [document.revision, dirty]);
  useEffect(() => { if (recovered?.document_id === document.id) { setDirty(false); setAction(null); setReason(""); } }, [recovered, document.id]);
  const change = (patch: Partial<CommerceDraft>) => { setDraft(current => ({ ...current, ...patch })); setDirty(true); };
  const addProduct = () => {
    try {
      if (!selectedProduct || !ledger.enabled || ledger.locked || products.query.isError) throw new Error("Choose a permitted standard product.");
      if (selectedProduct.currency && selectedProduct.currency !== draft.currency) throw new Error("The selected product uses another currency; no exchange conversion is applied.");
      const amount = selectedProduct[sales ? "selling_price" : "purchase_price"];
      if (typeof amount !== "string" && typeof amount !== "number") throw new Error("Set this product's catalogue price before adding it.");
      const price = canonicalMoney(amount); const line = { line_id: crypto.randomUUID(), product_id: selectedProduct.id, product_variant_id: null, quantity: 1, ...(sales ? { unit_price: price } : { unit_cost: price, supplier_sku: null }) };
      setAddedNames(current => ({ ...current, [selectedProduct.id]: text(selectedProduct.name) })); change({ items: [...draft.items, line] }); setSelectedProduct(null); setProductSearch("");
    } catch (failure) { toast(open, "error", "Product not added", failure instanceof Error ? failure.message : "Unable to add product."); }
  };
  const saveDraft = () => {
    try {
      const value = { ...draft, tax: canonicalMoney(draft.tax), shipping: canonicalMoney(draft.shipping), items: draft.items.map(line => ({ ...line, ...(sales ? { unit_price: canonicalMoney(line.unit_price ?? "") } : { unit_cost: canonicalMoney(line.unit_cost ?? "") }) })) };
      if (value.items.some(line => !Number.isInteger(line.quantity) || line.quantity < 1)) throw new Error("Quantities must be whole numbers of at least 1.");
      setAmendment(value); setAction("amend_document");
    } catch (failure) { toast(open, "error", "Check the order", failure instanceof Error ? failure.message : "Check the order fields."); }
  };
  const reservedFor = (lineId: string) => document.allocations.filter(row => row.line_id === lineId).reduce((sum, row) => sum + row.quantity, 0);
  const shippedFor = (lineId: string) => Object.entries(sales ? document.fulfilled : document.received).reduce((sum, [key, value]) => { try { return JSON.parse(key)[0] === lineId ? sum + value : sum; } catch { return sum; } }, 0);
  const lineTotal = (line: CommerceDraft["items"][number]) => Number(sales ? line.unit_price : line.unit_cost) * line.quantity;
  const subtotal = document.draft.items.reduce((sum, line) => sum + lineTotal(line), 0);
  const actions = <Stack direction="row" flexWrap="wrap" gap={1} justifyContent="flex-end">
    {!edit && editable && <Button variant="outlined" startIcon={<EditRoundedIcon />} component={RouterLink} to={`${pathFor(document.kind)}/edit/${document.id}?organization=${ledger.state?.organization_id}`}>Edit draft</Button>}
    {document.status === "pending" && !dirty && <Button variant="outlined" color="error" disabled={ledger.locked} onClick={() => setAction("reject_document")}>Reject</Button>}
    {["pending", "rejected", "approved"].includes(document.status) && !dirty && <Button color="error" disabled={ledger.locked} onClick={() => setAction("cancel_document")}>Cancel document</Button>}
    {document.status === "pending" && !dirty && <Button variant="contained" startIcon={<CheckCircleRoundedIcon />} disabled={ledger.locked} onClick={() => setAction("approve_document")}>Approve</Button>}
    {sales && ["approved", "partially_fulfilled"].includes(document.status) && <Button variant="contained" disabled={ledger.locked} onClick={() => setAction("fulfill_order")}>Fulfill order</Button>}
    {!sales && ["approved", "partially_received"].includes(document.status) && <Button variant="contained" disabled={ledger.locked} onClick={() => setAction("receive_purchase_order")}>Receive stock</Button>}
  </Stack>;
  return <Stack spacing={3}>
    <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
      <Box>
        <Stack direction="row" spacing={1.5} alignItems="center"><Tooltip title={document.number}><Typography variant="h2">{number}</Typography></Tooltip><StatusChip status={document.status} /></Stack>
        <Typography variant="body2" color="text.secondary">{documentParty(document) || "—"} · {formatDate(document.draft.order_date)} · Revision {document.revision} · Updated {new Date(document.updated_at).toLocaleString()}</Typography>
      </Box>
      {actions}
    </Stack>

    {!edit && <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" } }}>
      <Card variant="outlined"><CardContent><SectionTitle>{sales ? "Customer" : "Supplier"}</SectionTitle>
        <Typography fontWeight={600}>{documentParty(document) || "—"}</Typography>
        {sales && <><Typography variant="body2" color="text.secondary">{(document.draft.customer_id ? text(document.snapshots.customers?.[document.draft.customer_id]?.email) : document.draft.customer_email) || "—"}</Typography><Typography variant="body2" sx={{ mt: 1, whiteSpace: "pre-wrap" }}>{document.draft.customer_address || "No delivery address"}</Typography></>}
      </CardContent></Card>
      <Card variant="outlined"><CardContent><SectionTitle>Order</SectionTitle>
        <Typography variant="body2">Order date: {formatDate(document.draft.order_date)}</Typography>
        {!sales && <Typography variant="body2">Expected: {formatDate(document.draft.expected_date)}</Typography>}
        <Typography variant="body2">Currency: {document.draft.currency}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, whiteSpace: "pre-wrap" }}>{document.draft.notes || "No notes"}</Typography>
      </CardContent></Card>
      <Card variant="outlined"><CardContent><SectionTitle>Totals</SectionTitle>
        {[["Subtotal", document.subtotal || String(subtotal)], ["Tax", document.draft.tax], ["Shipping", document.draft.shipping]].map(([label, value]) => <Stack key={label} direction="row" justifyContent="space-between"><Typography variant="body2" color="text.secondary">{label}</Typography><Typography variant="body2">{formatMoney(value, document.draft.currency)}</Typography></Stack>)}
        <Divider sx={{ my: 1 }} /><Stack direction="row" justifyContent="space-between"><Typography fontWeight={600}>Total</Typography><Typography fontWeight={600}>{formatMoney(document.total, document.draft.currency)}</Typography></Stack>
      </CardContent></Card>
    </Box>}

    <Tabs value={tab} onChange={(_, value) => setTab(value)}><Tab label={`Line items (${document.draft.items.length})`} /><Tab label={`Allocations (${document.allocations.length})`} /></Tabs>
    {tab === 1 ? <Card variant="outlined"><CardContent>{document.allocations.length ? <Table size="small" aria-label="Stock allocations"><TableHead><TableRow><TableCell>Product</TableCell><TableCell>Location</TableCell><TableCell align="right">Reserved</TableCell><TableCell align="right">Shipped</TableCell></TableRow></TableHead><TableBody>
      {document.allocations.map((row, index) => <TableRow key={index}><TableCell>{productName(document, document.draft.items.find(line => line.line_id === row.line_id)?.product_id ?? "")}</TableCell><TableCell>{text(document.snapshots.locations?.[row.location_id]?.name) || text(locations.find(location => location.id === row.location_id)?.name) || "Location unavailable"}</TableCell><TableCell align="right">{row.quantity}</TableCell><TableCell align="right">{document.fulfilled[fulfilledKey(row.line_id, row.location_id)] ?? 0}</TableCell></TableRow>)}
    </TableBody></Table> : <Typography color="text.secondary">No stock is reserved yet. Approving a sales order reserves stock.</Typography>}</CardContent></Card>
      : edit ? <Card variant="outlined"><CardContent><Stack spacing={2}>
        {!editable && <Alert severity="warning">This document can't be edited in its current status. Use its fulfillment, receipt or cancellation actions instead.</Alert>}
        <Box component="fieldset" disabled={!editable || ledger.locked || !!action} sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}><Stack spacing={2}>
          {sales && <><SectionTitle>Customer</SectionTitle>
            <TextField label="Customer name" value={document.draft.customer_id ? documentParty(document) : draft.customer_name} InputProps={{ readOnly: !!document.draft.customer_id }} onChange={event => change({ customer_name: event.target.value })} />
            <TextField label="Customer email" value={document.draft.customer_id ? text(document.snapshots.customers?.[document.draft.customer_id]?.email) : draft.customer_email} InputProps={{ readOnly: !!document.draft.customer_id }} onChange={event => change({ customer_email: event.target.value })} />
            <TextField label="Shipping / delivery address" multiline minRows={2} value={draft.customer_address} onChange={event => change({ customer_address: event.target.value })} /></>}
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" } }}>
            <TextField label="Order date" type="date" value={draft.order_date} InputLabelProps={{ shrink: true }} onChange={event => change({ order_date: event.target.value })} />
            {!sales && <TextField label="Expected delivery" type="date" value={draft.expected_date ?? ""} InputLabelProps={{ shrink: true }} onChange={event => change({ expected_date: event.target.value || null })} />}
            <TextField label="Currency" value={draft.currency} InputProps={{ readOnly: true }} />
          </Box>
          <SectionTitle>Line items</SectionTitle>
          {draft.items.map((line, index) => <Box key={line.line_id} sx={{ display: "grid", gap: 2, alignItems: "center", gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr 1fr auto" } }}>
            <Box><Typography fontWeight={600}>{addedNames[line.product_id] ?? productName(document, line.product_id)}</Typography><Typography variant="caption" color="text.secondary">{text(document.snapshots.products?.[line.product_id]?.sku)}</Typography></Box>
            <TextField label={`Quantity ${index + 1}`} type="number" value={line.quantity} inputProps={{ min: 1, step: 1 }} onFocus={event => event.target.select()} onChange={event => change({ items: draft.items.map((item, i) => i === index ? { ...item, quantity: Number(event.target.value) } : item) })} />
            <TextField label={`${sales ? "Unit price" : "Unit cost"} ${index + 1}`} value={sales ? line.unit_price : line.unit_cost} inputProps={{ inputMode: "decimal" }} onChange={event => change({ items: draft.items.map((item, i) => i === index ? { ...item, ...(sales ? { unit_price: event.target.value } : { unit_cost: event.target.value }) } : item) })} />
            {editable ? <Tooltip title="Remove line"><span><IconButton aria-label="Remove line" color="error" disabled={draft.items.length === 1} onClick={() => change({ items: draft.items.filter((_, i) => i !== index) })}><DeleteOutlineRoundedIcon /></IconButton></span></Tooltip> : <span />}
          </Box>)}
          {editable && <Stack direction={{ xs: "column", sm: "row" }} spacing={2}><Autocomplete sx={{ flex: 1 }} options={productOptions} value={selectedProduct} filterOptions={items => items} loading={products.query.isFetching} getOptionLabel={row => `${text(row.name)} · ${text(row.sku)}`} isOptionEqualToValue={(a, b) => a.id === b.id} onInputChange={(_, value, why) => { if (why === "input") setProductSearch(value); }} onChange={(_, row) => setSelectedProduct(row)} renderInput={params => <TextField {...params} label="Add product" error={products.query.isError} helperText={products.query.isError ? "Unable to load permitted products." : "Search standard products; quantities and prices stay editable."} />} /><Button variant="outlined" startIcon={<AddRoundedIcon />} disabled={!selectedProduct || products.query.isFetching || products.query.isError} onClick={addProduct}>Add product line</Button></Stack>}
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
            <TextField label="Tax amount" value={draft.tax} inputProps={{ inputMode: "decimal" }} onChange={event => change({ tax: event.target.value })} />
            <TextField label="Shipping amount" value={draft.shipping} inputProps={{ inputMode: "decimal" }} onChange={event => change({ shipping: event.target.value })} />
          </Box>
          <TextField label="Notes" multiline minRows={2} value={draft.notes} onChange={event => change({ notes: event.target.value })} />
        </Stack></Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center"><Typography color="text.secondary" variant="body2">{dirty ? "The ledger recalculates the total when you save." : ""}</Typography><Typography variant="h6">Verified total: {formatMoney(document.total, document.draft.currency)}</Typography></Stack>
        {editable && <><TextField label="Workflow reason" required value={reason} disabled={ledger.locked || !!action} onChange={event => setReason(event.target.value)} inputProps={{ maxLength: 2000 }} helperText="Why are you changing this document? Saved with the revision." />
          <Stack direction="row" spacing={1.25} justifyContent="flex-end"><Button variant="outlined" component={RouterLink} to={`${pathFor(document.kind)}/show/${document.id}?organization=${organizationId}`}>Back to document</Button><Button variant="contained" disabled={ledger.locked || !dirty || !reason.trim()} onClick={saveDraft}>Save changes</Button></Stack></>}
      </Stack></CardContent></Card>
        : <Card variant="outlined"><CardContent><Table size="small" aria-label="Line items"><TableHead><TableRow><TableCell>Product</TableCell><TableCell align="right">Quantity</TableCell>{sales && <TableCell align="right">Reserved</TableCell>}<TableCell align="right">{sales ? "Shipped" : "Received"}</TableCell><TableCell align="right">{sales ? "Unit price" : "Unit cost"}</TableCell><TableCell align="right">Line total</TableCell></TableRow></TableHead><TableBody>
          {document.draft.items.map(line => <TableRow key={line.line_id}><TableCell><Typography fontWeight={600} variant="body2">{productName(document, line.product_id)}</Typography><Typography variant="caption" color="text.secondary">{text(document.snapshots.products?.[line.product_id]?.sku)}</Typography></TableCell><TableCell align="right">{line.quantity}</TableCell>{sales && <TableCell align="right">{reservedFor(line.line_id)}</TableCell>}<TableCell align="right">{shippedFor(line.line_id)}</TableCell><TableCell align="right">{formatMoney(sales ? line.unit_price : line.unit_cost, document.draft.currency)}</TableCell><TableCell align="right">{formatMoney(lineTotal(line), document.draft.currency)}</TableCell></TableRow>)}
        </TableBody></Table></CardContent></Card>}

    {action && <WorkflowDialog key={`${action}:${document.revision}`} action={action} document={document} number={number} ledger={ledger} locations={locations} locationError={locationError}
      initialReason={action === "amend_document" ? reason : ACTION_COPY[action].reason(sales)} amendment={action === "amend_document" ? amendment : null} draftRevision={draftRevision}
      onClose={() => setAction(null)} onDone={() => { setDirty(false); setAction(null); setReason(""); setAmendment(null); }} />}
  </Stack>;
}

function WorkflowDialog({ action, document, number, ledger, locations, locationError, initialReason, amendment, draftRevision, onClose, onDone }: {
  action: WorkflowAction; document: CommerceDocument; number: string; ledger: Ledger; locations: ErpRecord[]; locationError: boolean;
  initialReason: string; amendment: CommerceDraft | null; draftRevision: number; onClose: () => void; onDone: () => void;
}) {
  const { open } = useNotification();
  const sales = document.kind === "sales_order";
  const copy = ACTION_COPY[action];
  const mode: AllocationMode | null = action === "approve_document" && sales ? "approve_document" : action === "fulfill_order" ? "fulfill_order" : action === "receive_purchase_order" ? "receive_purchase_order" : null;
  const balances = ledger.state?.balances ?? [];
  const [rows, setRows] = useState<Allocation[]>(() => mode ? suggestAllocations(document, mode, balances, locations) : []);
  const [reason, setReason] = useState(initialReason);
  const [busy, setBusy] = useState(false);
  const problems = mode ? allocationProblems(document, mode, rows, balances, locations) : [];
  const required = mode ? requiredByLine(document, mode) : {};
  const locationName = (id: string) => text(locations.find(location => location.id === id)?.name) || text(document.snapshots.locations?.[id]?.name) || "Location unavailable";
  const update = (index: number, patch: Partial<Allocation>) => setRows(current => current.map((row, i) => i === index ? { ...row, ...patch } : row));
  const submit = async () => {
    if (!reason.trim()) { toast(open, "error", "Reason required", "Enter a reason for this action."); return; }
    if (problems.length) { toast(open, "error", "Fix the allocation first", problems[0].message); return; }
    if (!ledger.enabled || ledger.locked) { toast(open, "error", "Workflow not ready", "Reload the workflow and try again."); return; }
    const base = { action, reason: reason.trim(), document_id: document.id, expected_revision: action === "amend_document" ? draftRevision : document.revision };
    const command = action === "amend_document" ? newCommerceCommand({ ...base, document: amendment ?? document.draft })
      : action === "approve_document" ? newCommerceCommand({ ...base, allocations: sales ? rows : [] })
        : mode ? newCommerceCommand({ ...base, lines: rows }) : newCommerceCommand(base);
    setBusy(true);
    const result = await ledger.execute(command);
    setBusy(false);
    if (result) onDone();
  };
  return <Dialog open onClose={() => !busy && !ledger.busy && onClose()} fullWidth maxWidth={mode ? "md" : "sm"} aria-labelledby="workflow-dialog-title">
    <DialogTitle id="workflow-dialog-title">{copy.title(number, sales)}</DialogTitle>
    <DialogContent dividers><Stack spacing={2}>
      <Typography color="text.secondary">{copy.body(sales)}</Typography>
      {locationError && mode && <Alert severity="error">Locations could not be completely loaded. Reload the page before posting.</Alert>}
      {mode && document.draft.items.filter(line => (required[line.line_id] ?? 0) > 0 || rows.some(row => row.line_id === line.line_id)).map(line => {
        const lineRows = rows.map((row, index) => ({ row, index })).filter(item => item.row.line_id === line.line_id);
        const total = lineRows.reduce((sum, item) => sum + (item.row.quantity || 0), 0);
        const need = required[line.line_id] ?? 0;
        const ok = mode === "approve_document" ? total === need : total <= need && total > 0;
        const lineProblems = problems.filter(problem => problem.lineId === line.line_id && problem.index === undefined);
        return <Card key={line.line_id} variant="outlined"><CardContent><Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box><Typography fontWeight={600}>{productName(document, line.product_id)}</Typography><Typography variant="caption" color="text.secondary">{text(document.snapshots.products?.[line.product_id]?.sku)}</Typography></Box>
            <Chip size="small" color={ok ? "success" : "warning"} label={mode === "approve_document" ? `${total} of ${need} allocated` : `${total} of ${need} remaining`} />
          </Stack>
          {lineRows.map(({ row, index }) => {
            const rowProblems = problems.filter(problem => problem.index === index);
            return <Box key={index} sx={{ display: "grid", gap: 1.5, alignItems: "start", gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr auto" } }}>
              {mode === "fulfill_order" ? <TextField label={`Location ${index + 1}`} value={locationName(row.location_id)} InputProps={{ readOnly: true }} />
                : <Autocomplete options={locations} value={locations.find(location => location.id === row.location_id) ?? null} getOptionLabel={location => text(location.name)} isOptionEqualToValue={(a, b) => a.id === b.id}
                  onChange={(_, location) => update(index, { location_id: location?.id ?? "" })}
                  renderOption={(props, location) => { const { key, ...rest } = props as typeof props & { key: string }; const free = availableAt(balances, line.product_id, location.id); return <li key={key} {...rest}><Stack direction="row" justifyContent="space-between" sx={{ width: "100%" }} spacing={2}><span>{text(location.name)}</span><Typography variant="caption" color={mode === "approve_document" && free < 1 ? "error" : "text.secondary"}>{mode === "approve_document" ? `${free} free` : `${free} on hand`}</Typography></Stack></li>; }}
                  renderInput={params => <TextField {...params} label={`Location ${index + 1}`} required error={rowProblems.some(problem => problem.message === "Choose a location.")} helperText={row.location_id && mode === "approve_document" ? `${availableAt(balances, line.product_id, row.location_id)} free at this location` : undefined} />} />}
              <TextField label={`Quantity ${index + 1}`} type="number" value={Number.isFinite(row.quantity) ? row.quantity : ""} inputProps={{ min: 1, step: 1 }} onFocus={event => event.target.select()} onChange={event => update(index, { quantity: Number(event.target.value) })} error={rowProblems.length > 0 && !rowProblems.every(problem => problem.message === "Choose a location.")} helperText={rowProblems.find(problem => problem.message !== "Choose a location.")?.message} />
              <Tooltip title="Remove this location"><span><IconButton aria-label={`Remove location ${index + 1}`} disabled={lineRows.length === 1 && mode === "approve_document"} onClick={() => setRows(current => current.filter((_, i) => i !== index))}><DeleteOutlineRoundedIcon /></IconButton></span></Tooltip>
            </Box>;
          })}
          {lineProblems.map(problem => <Typography key={problem.message} variant="body2" color="error">{problem.message}</Typography>)}
          {mode !== "fulfill_order" && <Box><Button size="small" startIcon={<AddRoundedIcon />} onClick={() => setRows(current => [...current, { line_id: line.line_id, location_id: "", quantity: Math.max(1, need - total) }])}>Add another location</Button></Box>}
        </Stack></CardContent></Card>;
      })}
      {problems.filter(problem => !problem.lineId && problem.index === undefined).map(problem => <Alert key={problem.message} severity="warning">{problem.message}</Alert>)}
      <TextField label="Workflow reason" required value={reason} onChange={event => setReason(event.target.value)} inputProps={{ maxLength: 2000 }} helperText="Saved with this action in the ledger history." autoFocus={!mode} />
    </Stack></DialogContent>
    <DialogActions>
      <Button variant="outlined" disabled={busy || ledger.busy} onClick={onClose}>Back</Button>
      <Button variant="contained" color={copy.destructive ? "error" : "primary"} disabled={busy || ledger.busy || !reason.trim() || problems.length > 0} onClick={() => void submit()}>{busy || ledger.busy ? "Saving…" : copy.confirm(sales)}</Button>
    </DialogActions>
  </Dialog>;
}

function ReturnQueue({ ledger, locations }: { ledger: Ledger; locations: ErpRecord[] }) {
  const { open } = useNotification();
  const [search, setSearch] = useState(""); const [status, setStatus] = useState("pending"); const [reason, setReason] = useState(""); const [confirm, setConfirm] = useState<CommerceCommand | null>(null);
  const [page, setPage] = useState(0); const [size, setSize] = useState(10);
  useEffect(() => setPage(0), [search, status, ledger.state?.head]);
  const requests = Object.entries(ledger.state?.requests ?? {}).filter(([, request]) => (!status || request.status === status) && (!search || `${ledger.state?.documents[request.command.document_id ?? ""]?.number ?? ""} ${request.command.reason}`.toLowerCase().includes(search.toLowerCase())));
  const summary = (command: CommerceCommand) => ((command.lines ?? []) as CommerceReturnLine[]).map(line => {
    const entitlement = ledger.state?.entitlements[line.entitlement_id]; const document = ledger.state?.documents[command.document_id ?? ""];
    const name = document && entitlement ? productName(document, entitlement.product_id) : "Product unavailable";
    const location = text(locations.find(item => item.id === line.location_id)?.name) || `Location ID ${line.location_id}`;
    return <Typography key={line.entitlement_id} variant="body2">{name} · Quantity {line.quantity} · {line.condition} · {line.restock ? "Restock" : "Do not restock"} · {location}</Typography>;
  });
  const stage = (action: string, id: string) => {
    try { setConfirm(newCommerceCommand({ action, target_request_id: id, reason })); }
    catch (failure) { toast(open, "error", "Check the review", failure instanceof Error ? failure.message : "Enter a reason."); }
  };
  return <Stack spacing={2}>
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}><TextField size="small" label="Search returns" value={search} onChange={event => setSearch(event.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }} /><TextField size="small" select label="Return status" value={status} sx={{ minWidth: 180 }} onChange={event => setStatus(event.target.value)}><MenuItem value="">All statuses</MenuItem><MenuItem value="pending">Pending</MenuItem><MenuItem value="posted">Posted</MenuItem><MenuItem value="rejected">Rejected</MenuItem></TextField></Stack>
    {(search || status) && <Stack direction="row" spacing={1}>{search && <Chip label={`Search: ${search}`} onDelete={() => setSearch("")} />}{status && <Chip label={`Status: ${statusLabel(status)}`} onDelete={() => setStatus("")} />}</Stack>}
    {ledger.enabled && !requests.length && <Alert severity="info">{search ? "No results found." : status ? "No matching return requests." : "No return requests yet."}</Alert>}
    {requests.length > 0 && <TextField label="Review reason" value={reason} required disabled={ledger.locked} onChange={event => setReason(event.target.value)} inputProps={{ maxLength: 2000 }} helperText="Required before approving or rejecting a return." />}
    {requests.slice(page * size, (page + 1) * size).map(([id, request]) => {
      const document = ledger.state?.documents[request.command.document_id ?? ""];
      return <Card key={id} variant="outlined"><CardContent><Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center"><Typography variant="h6">{document ? shortNumber(document.number) : "Order unavailable"} · {document ? documentParty(document) : ""}</Typography><StatusChip status={request.status} /></Stack>
        <Typography>{request.command.reason}</Typography>{summary(request.command)}
        {request.status === "pending" && <Stack direction="row" spacing={1} justifyContent="flex-end"><Button variant="outlined" color="error" disabled={ledger.locked || !reason.trim()} onClick={() => stage("reject_return", id)}>Reject return</Button><Button variant="contained" disabled={ledger.locked || !reason.trim()} onClick={() => stage("approve_return", id)}>Approve return</Button></Stack>}
      </Stack></CardContent></Card>;
    })}
    {requests.length > size && <TablePagination component="div" count={requests.length} page={page} rowsPerPage={size} rowsPerPageOptions={[10, 20, 50]} onPageChange={(_, value) => setPage(value)} onRowsPerPageChange={event => { setSize(Number(event.target.value)); setPage(0); }} />}
    <Dialog open={!!confirm} onClose={() => !ledger.busy && setConfirm(null)}><DialogTitle>{confirm?.action === "approve_return" ? "Approve this return?" : "Reject this return?"}</DialogTitle><DialogContent><Typography>{confirm?.action === "approve_return" ? "Approves the return and restocks eligible items once. No refund is recorded." : "Rejects the return without changing stock."}</Typography>{confirm?.target_request_id && ledger.state?.requests[confirm.target_request_id] && summary(ledger.state.requests[confirm.target_request_id].command)}</DialogContent><DialogActions><Button variant="outlined" disabled={ledger.busy} onClick={() => setConfirm(null)}>Back</Button><Button variant="contained" color={confirm?.action === "reject_return" ? "error" : "primary"} disabled={ledger.busy} onClick={async () => { if (confirm) { const result = await ledger.execute(confirm); if (result) setReason(""); setConfirm(null); } }}>Confirm return review</Button></DialogActions></Dialog>
  </Stack>;
}
