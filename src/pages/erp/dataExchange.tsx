import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCustomMutation, useDataProvider, useList, useNotification, useWarnAboutChange } from "@refinedev/core";
import { Link as RouterLink } from "react-router";
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Autocomplete, Box, Breadcrumbs, Button, Card, CardActionArea, CardContent, Checkbox, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, FormControlLabel, LinearProgress, Link, Stack, Tab, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, Tabs, TextField, Typography,
} from "@mui/material";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { PageContainer } from "../../components/PageContainer";
import { RecordExportActions } from "../../components/RecordExportActions";
import { RefreshWorkflowButton } from "../../components/CommerceWorkflowStatus";
import { useSessionOwner } from "../../hooks/useSessionOwner";
import { useDefaultOrganization } from "../../hooks/useDefaultOrganization";
import { useCommerceLedger } from "../../hooks/useCommerceLedger";
import { toast } from "../../providers/notificationProvider";
import { ERP_QUERY_OPTIONS, type ErpRecord } from "../../services/erp";
import { reportUuid } from "../../services/operationalReports";
import { exportCsv, exportFilename } from "../../services/recordExport";
import { hasCommerceAuthority, isTestOrganization, parseCommerceCommand, type CommerceCommand } from "../../services/commerceLedger";
import { TEMPLATES, prepareContacts, prepareProducts, preparePurchaseOrders, readSheet, templateCsv, uuidV5, type ImportKind, type ImportIssue, type PreparedRow, type PurchaseImport } from "../../services/dataImport";
import { fetchAll } from "../../services/recordFetch";
import { EXPORTS, buildExport, type ExportKind, type ExportResult } from "../../services/businessExports";

const text = (value: unknown) => typeof value === "string" ? value : "";
const LEDGER_EVENT_LIMIT = 200;
const KINDS: ImportKind[] = ["products", "customers", "suppliers", "purchase_orders"];

function download(name: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; document.body.appendChild(anchor); anchor.click(); anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

type Masters = { products: ErpRecord[]; customers: ErpRecord[]; suppliers: ErpRecord[]; locations: ErpRecord[]; categories: ErpRecord[] };
export function DataExchangeWorkspace() {
  const { owner } = useSessionOwner();
  return <DataExchangeInner key={owner} />;
}

function DataExchangeInner() {
  const { owner } = useSessionOwner();
  const { open } = useNotification();
  const provider = useDataProvider();
  const providerRef = useRef(provider); providerRef.current = provider;
  const openRef = useRef(open); openRef.current = open;
  const mastersRef = useRef<{ org: string; data: Masters } | null>(null);
  const [organizationId, setOrganizationId] = useState("");
  const meta = useMemo(() => ({ lookupOwner: owner }), [owner]);
  const organizations = useList<ErpRecord>({ resource: "organizations", pagination: { mode: "server", currentPage: 1, pageSize: 100 }, meta, queryOptions: { ...ERP_QUERY_OPTIONS, enabled: !!owner }, errorNotification: false });
  const options = (organizations.query.isError ? [] : organizations.result.data).filter(row => row.is_active !== false && !row.deleted_at && reportUuid(row.id) && text(row.name) && !isTestOrganization(row))
    .sort((a, b) => Number(hasCommerceAuthority(b)) - Number(hasCommerceAuthority(a)) || text(a.name).localeCompare(text(b.name)));
  useDefaultOrganization(organizationId, options.map(row => row.id), setOrganizationId, !organizations.query.isLoading);
  const organization = options.find(row => row.id === organizationId);
  const currency = text(organization?.default_currency) || text(organization?.currency) || "INR";
  const ledger = useCommerceLedger(organizationId, !!organization && hasCommerceAuthority(organization));
  const [tab, setTab] = useState(0);
  const [masters, setMasters] = useState<{ org: string; data: Masters } | null>(null);
  const [loadingMasters, setLoadingMasters] = useState(false);
  const loadMasters = useCallback(async (force = false): Promise<Masters | null> => {
    if (!organizationId) return null;
    if (!force && mastersRef.current?.org === organizationId) return mastersRef.current.data;
    setLoadingMasters(true);
    try {
      const [products, customers, suppliers, locations, categories] = await Promise.all(["products", "customers", "suppliers", "product_locations", "product_categories"].map(resource => fetchAll(providerRef.current, resource, organizationId)));
      const data = { products, customers, suppliers, locations, categories };
      mastersRef.current = { org: organizationId, data }; setMasters(mastersRef.current); return data;
    } catch (error) { toast(openRef.current, "error", "Could not load records", error instanceof Error ? error.message : "Try again."); return null; }
    finally { setLoadingMasters(false); }
  }, [organizationId]);
  return <PageContainer><Stack spacing={3}>
    <Breadcrumbs><Link component={RouterLink} to="/">Workspace</Link><Typography color="text.primary" fontWeight={600}>Import / Export</Typography></Breadcrumbs>
    <Box><Typography variant="h2">Import / Export</Typography><Typography color="text.secondary">Load your existing products, customers, suppliers and purchase orders from a spreadsheet, and download financial and operations reports.</Typography></Box>
    <Stack direction="row" spacing={1} alignItems="center">
      <Autocomplete size="small" sx={{ width: { xs: "100%", sm: 320 } }} options={options} value={organization ?? null} disableClearable={!!organization} getOptionLabel={row => text(row.name)} isOptionEqualToValue={(a, b) => a.id === b.id} onChange={(_, row) => setOrganizationId(row?.id ?? "")} renderInput={params => <TextField {...params} label="Organization" required />} />
      <RefreshWorkflowButton ledger={ledger} />
    </Stack>
    {organization && !hasCommerceAuthority(organization) && <Alert severity="info">Purchase-order imports and ledger reports need an organization with the stock ledger activated. Products, customers and suppliers can still be imported.</Alert>}
    <Tabs value={tab} onChange={(_, value) => setTab(value)}><Tab label="Import" /><Tab label="Export & reports" /></Tabs>
    {tab === 0 ? <ImportPanel key={organizationId} organizationId={organizationId} currency={currency} ledger={ledger} loadMasters={loadMasters} />
      : <ExportPanel key={organizationId} organizationName={text(organization?.name)} ledger={ledger} masters={masters?.org === organizationId ? masters.data : null} loading={loadingMasters} loadMasters={loadMasters} />}
  </Stack></PageContainer>;
}

type Outcome = { line: string; item: string; result: "Created" | "Skipped" | "Failed" | "Already imported"; detail: string };
function ImportPanel({ organizationId, currency, ledger, loadMasters }: { organizationId: string; currency: string; ledger: ReturnType<typeof useCommerceLedger>; loadMasters: (force?: boolean) => Promise<Masters | null> }) {
  const { open } = useNotification();
  const { mutateAsync } = useCustomMutation();
  const { setWarnWhen } = useWarnAboutChange();
  const [kind, setKind] = useState<ImportKind>("products");
  const [fileName, setFileName] = useState("");
  const [issues, setIssues] = useState<ImportIssue[]>([]);
  const [rows, setRows] = useState<PreparedRow[]>([]);
  const [orders, setOrders] = useState<PurchaseImport[]>([]);
  const [preparing, setPreparing] = useState(false);
  const [running, setRunning] = useState<{ done: number; total: number } | null>(null);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [confirm, setConfirm] = useState(false);
  const [receive, setReceive] = useState(false);
  const [receiveLocation, setReceiveLocation] = useState<ErpRecord | null>(null);
  const [locations, setLocations] = useState<ErpRecord[]>([]);
  const [page, setPage] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { setWarnWhen(!!running); return () => setWarnWhen(false); }, [running, setWarnWhen]);
  const reset = () => { setFileName(""); setIssues([]); setRows([]); setOrders([]); setOutcomes([]); setPage(0); if (input.current) input.current.value = ""; };
  const purchase = kind === "purchase_orders";
  const ready = purchase ? orders.filter(order => order.status === "ready") : rows.filter(row => row.status === "ready");
  const summary = purchase
    ? { ready: ready.length, skip: 0, error: orders.filter(order => order.status === "error").length }
    : { ready: ready.length, skip: rows.filter(row => row.status === "skip").length, error: rows.filter(row => row.status === "error").length };
  const ledgerUsed = ledger.state?.sequence ?? 0;
  const ledgerNeeded = purchase ? ready.length * (receive ? 3 : 1) : 0;
  const overCapacity = purchase && ledgerUsed + ledgerNeeded > LEDGER_EVENT_LIMIT;

  const onFile = async (file: File | undefined) => {
    if (!file || !organizationId) return;
    reset(); setFileName(file.name); setPreparing(true);
    try {
      if (file.size > 2 * 1024 * 1024) throw new Error("The file is larger than 2 MB. Split it into smaller files.");
      const sheet = readSheet(kind, await file.text());
      setIssues(sheet.issues);
      if (sheet.issues.some(issue => issue.message.startsWith("Missing required column"))) return;
      const data = await loadMasters(true);
      if (!data) return;
      setLocations(data.locations);
      if (kind === "products") setRows(prepareProducts(sheet, { categories: data.categories, existingSkus: new Set(data.products.map(row => text(row.sku).trim().toLowerCase())) }));
      else if (kind === "customers" || kind === "suppliers") setRows(prepareContacts(kind, sheet, { existing: kind === "customers" ? data.customers : data.suppliers, currency }));
      else setOrders(preparePurchaseOrders(sheet, { suppliers: data.suppliers, products: data.products.filter(row => row.is_active !== false), currency }));
    } catch (error) { setIssues([{ row: 0, message: error instanceof Error ? error.message : "The file could not be read." }]); }
    finally { setPreparing(false); }
  };

  const run = async () => {
    setConfirm(false);
    const results: Outcome[] = [];
    const total = ready.length; setRunning({ done: 0, total });
    const callFunction = async (url: string, values: Record<string, unknown>) => (await mutateAsync({ url, method: "post", dataProviderName: "app", meta: { kind: "function", async: false }, values, successNotification: false, errorNotification: false })).data as { ok?: boolean; code?: string; replayed?: boolean };
    try {
      if (!purchase) {
        for (const [index, row] of (ready as PreparedRow[]).entries()) {
          try {
            const requestId = await uuidV5(`${organizationId}|${kind}|${row.key.toLowerCase()}`);
            const reply = kind === "products"
              ? await callFunction("hmg-product-master-v1", { action: "create", organization_id: organizationId, request_id: requestId, values: { ...row.payload, currency } })
              : await callFunction("hmg-contact-master-v1", { resource: kind, action: "create", organization_id: organizationId, request_id: requestId, values: row.payload });
            results.push({ line: String(row.line), item: row.label, result: reply?.ok ? reply.replayed ? "Already imported" : "Created" : "Failed", detail: reply?.ok ? "" : ({ DUPLICATE_SKU: "SKU already exists.", FORBIDDEN: "You don't have permission, or a referenced record is not in this organization.", VALIDATION_ERROR: "A value was rejected; check the row.", CONFLICT: "A different record already uses this import ID." } as Record<string, string>)[reply?.code ?? ""] ?? `Rejected (${reply?.code ?? "unknown"}).` });
          } catch (error) { results.push({ line: String(row.line), item: row.label, result: "Failed", detail: error instanceof Error ? error.message : "Request failed." }); }
          setRunning({ done: index + 1, total });
        }
      } else {
        for (const [index, order] of (ready as PurchaseImport[]).entries()) {
          const line = order.lines.join(", ");
          try {
            const documentId = await uuidV5(`${organizationId}|purchase_order|${order.reference.toLowerCase()}`);
            const source = order.document!;
            const items = await Promise.all((source.items as Record<string, unknown>[]).map(async item => { const { _line, ...rest } = item; return { ...rest, line_id: await uuidV5(`${documentId}|line|${String(_line)}|${String(rest.product_id)}`) } as Record<string, unknown> & { line_id: string; quantity: number }; }));
            const document = { ...source, items };
            const create = parseCommerceCommand({ request_id: documentId, action: "create_purchase_order", reason: `Imported ${order.reference}`, document });
            if (!create) throw new Error("The order could not be prepared.");
            const created = await ledger.execute(create as CommerceCommand);
            if (!created) throw new Error("The ledger did not confirm this order; see the notification for the reason.");
            let detail = "Pending approval.";
            if (receive && receiveLocation) {
              const approve = parseCommerceCommand({ request_id: await uuidV5(`${documentId}|approve`), action: "approve_document", reason: `Imported ${order.reference}: approved`, document_id: documentId, expected_revision: 1, allocations: [] });
              const approved = approve && created.documents[documentId]?.status === "pending" ? await ledger.execute(approve as CommerceCommand) : created;
              const current = approved?.documents[documentId];
              if (current && ["approved", "partially_received"].includes(current.status)) {
                const receiveCommand = parseCommerceCommand({ request_id: await uuidV5(`${documentId}|receive`), action: "receive_purchase_order", reason: `Imported ${order.reference}: received`, document_id: documentId, expected_revision: current.revision, lines: items.map(item => ({ line_id: item.line_id, location_id: receiveLocation.id, quantity: item.quantity })) });
                const received = receiveCommand ? await ledger.execute(receiveCommand as CommerceCommand) : null;
                detail = received ? `Received into ${text(receiveLocation.name)}.` : "Created and approved; receipt not confirmed.";
              } else detail = current?.status === "received" ? "Already received." : "Created; approval not confirmed.";
            }
            results.push({ line, item: order.label, result: "Created", detail });
          } catch (error) { results.push({ line, item: order.label, result: "Failed", detail: error instanceof Error ? error.message : "Request failed." }); }
          setRunning({ done: index + 1, total });
        }
      }
    } finally {
      setRunning(null); setOutcomes(results);
      const failed = results.filter(item => item.result === "Failed").length; const created = results.filter(item => item.result === "Created").length;
      toast(open, failed ? "error" : "success", failed ? `Import finished with ${failed} failed row${failed === 1 ? "" : "s"}` : "Import complete", `${created} created, ${results.length - created - failed} already present, ${failed} failed.`);
      void loadMasters(true);
    }
  };

  const previewRows = purchase ? orders.map(order => ({ line: order.lines.join(", "), label: order.label, status: order.status as PreparedRow["status"], message: order.message })) : rows.map(row => ({ line: String(row.line), label: row.label, status: row.status, message: row.message }));
  const template = TEMPLATES[kind];
  return <Stack spacing={2}>
    <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" } }}>
      {KINDS.map(item => <Card key={item} variant="outlined" sx={{ borderColor: kind === item ? "primary.main" : undefined, borderWidth: kind === item ? 2 : 1 }}><CardActionArea aria-pressed={kind === item} disabled={!!running} onClick={() => { setKind(item); reset(); }} sx={{ height: "100%" }}><CardContent>
        <Typography fontWeight={600}>{TEMPLATES[item].title}</Typography><Typography variant="caption" color="text.secondary">{TEMPLATES[item].description}</Typography>
      </CardContent></CardActionArea></Card>)}
    </Box>
    <Card><CardContent><Stack spacing={2}>
      <Typography variant="h6">Import {template.title.toLowerCase()}</Typography>
      <Box component="ol" sx={{ m: 0, pl: 2.5, color: "text.secondary", typography: "body2" }}>
        <li>Download the template. It has the exact header row and sample rows you can overwrite.</li>
        <li>Fill in one row per {purchase ? "order line" : "record"} in Excel or Google Sheets and save as <b>CSV</b>.</li>
        <li>Upload it. Nothing is saved until you review the preview and press Import.</li>
      </Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <Button variant="outlined" startIcon={<DownloadRoundedIcon />} onClick={() => download(`hmg-${kind.replace("_", "-")}-template.csv`, templateCsv(kind))}>Download template</Button>
        <Button variant="contained" startIcon={<UploadFileRoundedIcon />} disabled={!organizationId || preparing || !!running || (purchase && !ledger.enabled)} onClick={() => input.current?.click()}>Upload CSV</Button>
        <input ref={input} type="file" accept=".csv,text/csv" hidden aria-label={`Upload ${template.title} CSV`} onChange={event => void onFile(event.target.files?.[0])} />
        {fileName && <Chip label={fileName} onDelete={running ? undefined : reset} />}
      </Stack>
      {purchase && !ledger.enabled && <Alert severity="info">Purchase orders are saved through the stock ledger. Select an organization with the ledger active and wait for it to load.</Alert>}
      <Accordion disableGutters variant="outlined"><AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}><Typography variant="body2">Column guide ({template.columns.length} columns)</Typography></AccordionSummary><AccordionDetails>
        <Table size="small"><TableHead><TableRow><TableCell>Column</TableCell><TableCell>Required</TableCell><TableCell>What to enter</TableCell></TableRow></TableHead><TableBody>{template.columns.map(column => <TableRow key={column.key}><TableCell><code>{column.label}</code></TableCell><TableCell>{column.required ? "Yes" : "—"}</TableCell><TableCell>{column.help}</TableCell></TableRow>)}</TableBody></Table>
        {kind === "products" && <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>Opening stock is not part of the product import. After importing, record opening quantities through Stock adjustments or by importing received purchase orders.</Typography>}
      </AccordionDetails></Accordion>
      {preparing && <LinearProgress aria-label="Checking the file" />}
      {issues.map(issue => <Alert key={issue.message} severity={issue.message.startsWith("Ignored") ? "info" : "error"}>{issue.row ? `Row ${issue.row}: ` : ""}{issue.message}</Alert>)}
    </Stack></CardContent></Card>

    {previewRows.length > 0 && !outcomes.length && <Card><CardContent><Stack spacing={2}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1} alignItems={{ sm: "center" }}>
        <Typography variant="h6">Preview</Typography>
        <Stack direction="row" spacing={1}><Chip color="success" label={`${summary.ready} ready`} />{summary.skip > 0 && <Chip label={`${summary.skip} already exist`} />}{summary.error > 0 && <Chip color="error" label={`${summary.error} with errors`} />}</Stack>
      </Stack>
      {purchase && summary.ready > 0 && <Stack spacing={1}>
        <FormControlLabel control={<Checkbox checked={receive} onChange={event => setReceive(event.target.checked)} />} label="These are old orders that were already delivered: approve and receive them into stock" />
        {receive && <Autocomplete size="small" sx={{ maxWidth: 360 }} options={locations} value={receiveLocation} getOptionLabel={row => text(row.name)} isOptionEqualToValue={(a, b) => a.id === b.id} onChange={(_, row) => setReceiveLocation(row)} renderInput={params => <TextField {...params} label="Receive into location" required />} />}
        <Typography variant="caption" color={overCapacity ? "error" : "text.secondary"}>Ledger capacity: {ledgerUsed} of {LEDGER_EVENT_LIMIT} events used; this import needs {ledgerNeeded}.{overCapacity ? " Import fewer orders or skip receiving." : ""}</Typography>
      </Stack>}
      <Box sx={{ overflowX: "auto" }}><Table size="small" aria-label="Import preview"><TableHead><TableRow><TableCell>Row</TableCell><TableCell>Item</TableCell><TableCell>Status</TableCell><TableCell>Details</TableCell></TableRow></TableHead><TableBody>
        {previewRows.slice(page * 10, page * 10 + 10).map(row => <TableRow key={row.line + row.label}><TableCell>{row.line}</TableCell><TableCell>{row.label}</TableCell><TableCell><Chip size="small" color={row.status === "ready" ? "success" : row.status === "error" ? "error" : "default"} label={row.status === "ready" ? "Ready" : row.status === "error" ? "Error" : "Skip"} /></TableCell><TableCell>{row.message}</TableCell></TableRow>)}
      </TableBody></Table></Box>
      {previewRows.length > 10 && <TablePagination component="div" count={previewRows.length} page={page} rowsPerPage={10} rowsPerPageOptions={[10]} onPageChange={(_, value) => setPage(value)} />}
      {running && <Box><LinearProgress variant="determinate" value={running.total ? running.done / running.total * 100 : 0} aria-label="Import progress" /><Typography variant="caption">Importing {running.done} of {running.total}… keep this tab open.</Typography></Box>}
      <Stack direction="row" spacing={1.25} justifyContent="flex-end">
        <Button variant="outlined" disabled={!!running} onClick={reset}>Cancel</Button>
        <Button variant="contained" disabled={!!running || !summary.ready || overCapacity || (purchase && receive && !receiveLocation)} onClick={() => setConfirm(true)}>Import {summary.ready} {purchase ? `order${summary.ready === 1 ? "" : "s"}` : `row${summary.ready === 1 ? "" : "s"}`}</Button>
      </Stack>
    </Stack></CardContent></Card>}

    {outcomes.length > 0 && <Card><CardContent><Stack spacing={2}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}><Typography variant="h6">Import results</Typography>
        <Stack direction="row" spacing={1}><Button variant="outlined" startIcon={<DownloadRoundedIcon />} onClick={() => download(exportFilename(`import-results-${kind}`, "csv"), exportCsv([{ key: "line", label: "Row" }, { key: "item", label: "Item" }, { key: "result", label: "Result" }, { key: "detail", label: "Details" }], outcomes))}>Download results</Button><Button onClick={reset}>Import another file</Button></Stack></Stack>
      <Table size="small" aria-label="Import results"><TableHead><TableRow><TableCell>Row</TableCell><TableCell>Item</TableCell><TableCell>Result</TableCell><TableCell>Details</TableCell></TableRow></TableHead><TableBody>
        {outcomes.map(item => <TableRow key={item.line + item.item}><TableCell>{item.line}</TableCell><TableCell>{item.item}</TableCell><TableCell><Chip size="small" color={item.result === "Failed" ? "error" : item.result === "Created" ? "success" : "default"} label={item.result} /></TableCell><TableCell>{item.detail}</TableCell></TableRow>)}
      </TableBody></Table>
    </Stack></CardContent></Card>}

    <Dialog open={confirm} onClose={() => setConfirm(false)}><DialogTitle>Import {summary.ready} {template.title.toLowerCase()}?</DialogTitle><DialogContent><Typography>{purchase ? receive ? `Creates, approves and receives ${summary.ready} purchase orders into ${text(receiveLocation?.name)}. Stock increases by the imported quantities.` : `Creates ${summary.ready} pending purchase orders. No stock changes until they are received.` : `Creates ${summary.ready} new records. Existing records are never changed.`} Rows with errors are skipped. Re-uploading the same file is safe: already imported rows are not duplicated.</Typography></DialogContent>
      <DialogActions><Button variant="outlined" onClick={() => setConfirm(false)}>Back</Button><Button variant="contained" onClick={() => void run()}>Start import</Button></DialogActions></Dialog>
  </Stack>;
}

const thisYear = () => `${new Date().getFullYear()}-01-01`;
function ExportPanel({ organizationName, ledger, masters, loading, loadMasters }: { organizationName: string; ledger: ReturnType<typeof useCommerceLedger>; masters: Masters | null; loading: boolean; loadMasters: (force?: boolean) => Promise<Masters | null> }) {
  const { open } = useNotification();
  const [from, setFrom] = useState(thisYear());
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [preview, setPreview] = useState<{ kind: ExportKind; result: ExportResult } | null>(null);
  useEffect(() => { void loadMasters(); }, [loadMasters]);
  const build = (kind: ExportKind): ExportResult | null => {
    if (!ledger.state) { toast(open, "error", "Ledger not loaded", "Wait for the workflow to load, then try again."); return null; }
    if (!masters) { toast(open, "error", "Records not loaded", "Reload the records and try again."); return null; }
    const definition = EXPORTS.find(item => item.kind === kind)!;
    try { return buildExport(kind, { state: ledger.state, ...masters, from: definition.dated ? from : "", to: definition.dated ? to : "" }); }
    catch (error) { toast(open, "error", "Report failed", error instanceof Error ? error.message : "Try again."); return null; }
  };
  const withTotals = (result: ExportResult) => result.totals ? [...result.rows, { ...Object.fromEntries(result.columns.map(column => [column.key, ""])), [result.columns[0].key]: "TOTAL", ...result.totals }] : result.rows;
  const ready = !!ledger.state && !!masters;
  return <Stack spacing={2}>
    <Card><CardContent><Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
      <TextField size="small" label="From" type="date" value={from} onChange={event => setFrom(event.target.value)} InputLabelProps={{ shrink: true }} />
      <TextField size="small" label="To" type="date" value={to} onChange={event => setTo(event.target.value)} InputLabelProps={{ shrink: true }} />
      <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>The date range applies to registers, GST and dispatch/receipt reports. Stock, ageing and master data are as of today.</Typography>
      <Button variant="outlined" size="small" disabled={loading} onClick={() => void loadMasters(true)}>Reload data</Button>
    </Stack>{(loading || ledger.busy) && <LinearProgress sx={{ mt: 2 }} aria-label="Loading report data" />}</CardContent></Card>
    {!ledger.state && !ledger.busy && <Alert severity="info">Reports need the stock ledger. Select an organization with the ledger active.</Alert>}
    {(["Financial", "Operations", "Master data"] as const).map(group => <Box key={group}>
      <Typography sx={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", color: "text.disabled", mb: 1 }}>{group}</Typography>
      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3, 1fr)" } }}>
        {EXPORTS.filter(item => item.group === group).map(item => <Card key={item.kind} variant="outlined"><CardContent><Stack spacing={1.5} sx={{ height: "100%" }}>
          <Box flex={1}><Typography fontWeight={600}>{item.title}</Typography><Typography variant="body2" color="text.secondary">{item.description}</Typography></Box>
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined" startIcon={<VisibilityRoundedIcon />} disabled={!ready} onClick={() => { const result = build(item.kind); if (result) setPreview({ kind: item.kind, result }); }}>Preview</Button>
            <Button size="small" variant="contained" startIcon={<DownloadRoundedIcon />} disabled={!ready} aria-label={`Download ${item.title}`} onClick={() => { const result = build(item.kind); if (!result) return; download(exportFilename(`${organizationName}-${item.title}${item.dated ? `-${from}-to-${to}` : ""}`, "csv"), exportCsv(result.columns, withTotals(result))); toast(open, "success", `${item.title} downloaded`, `${result.rows.length} rows.`); }}>CSV</Button>
          </Stack>
        </Stack></CardContent></Card>)}
      </Box>
    </Box>)}
    <Dialog open={!!preview} onClose={() => setPreview(null)} fullWidth maxWidth="lg">
      {preview && <><DialogTitle>{preview.result.title} · {organizationName}</DialogTitle><DialogContent dividers><Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">{preview.result.note}</Typography>
        {preview.result.rows.length === 0 ? <Typography>No rows for this selection.</Typography> : <Box sx={{ overflowX: "auto" }}><Table size="small" aria-label={`${preview.result.title} preview`}><TableHead><TableRow>{preview.result.columns.map(column => <TableCell key={column.key}>{column.label}</TableCell>)}</TableRow></TableHead><TableBody>
          {withTotals(preview.result).slice(0, 100).map((row, index) => <TableRow key={index} sx={row[preview.result.columns[0].key] === "TOTAL" ? { "& td": { fontWeight: 700 } } : undefined}>{preview.result.columns.map(column => <TableCell key={column.key}>{row[column.key] || "—"}</TableCell>)}</TableRow>)}
        </TableBody></Table></Box>}
        {preview.result.rows.length > 100 && <Typography variant="caption">Showing the first 100 of {preview.result.rows.length} rows. The CSV contains all rows.</Typography>}
      </Stack></DialogContent><DialogActions sx={{ justifyContent: "space-between" }}>
        <RecordExportActions title={`${preview.result.title} · ${organizationName}`} columns={preview.result.columns} rows={withTotals(preview.result)} scopeLabel={preview.result.note} filename={`${organizationName}-${preview.result.title}`} />
        <Button onClick={() => setPreview(null)}>Close</Button>
      </DialogActions></>}
    </Dialog>
  </Stack>;
}
