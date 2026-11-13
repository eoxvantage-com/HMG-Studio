import { useEffect, useMemo, useRef, useState } from "react";
import { useDataProvider, useList, type CrudFilters } from "@refinedev/core";
import { useSessionOwner } from "../../hooks/useSessionOwner";
import { Link as RouterLink } from "react-router";
import { Alert, Autocomplete, Box, Breadcrumbs, Button, Card, CardContent, Chip, CircularProgress, LinearProgress, Link, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField, Typography } from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { PageContainer } from "../../components/PageContainer";
import { RecordExportActions } from "../../components/RecordExportActions";
import { ERP_QUERY_OPTIONS, type ErpRecord } from "../../services/erp";
import { REPORT_DEFINITIONS, reportUuid, type ReportKind, type ReportRequest, type ReportResult } from "../../services/operationalReports";
import { generateScopedOperationalReport } from "../../services/ledgerOperationalReports";
import { LEDGER_FUNCTION } from "../../services/stockLedger";
import { isTestOrganization } from "../../services/commerceLedger";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import { useDefaultOrganization } from "../../hooks/useDefaultOrganization";

const organizationSorters = [{ field: "name", order: "asc" as const }];
const organizationPagination = { mode: "server" as const, currentPage: 1, pageSize: 10 };
type Organization = { id: string; name: string; owner: string };
function initialDates() {
  const today = new Date();
  return { from: new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 6, 1)).toISOString().slice(0, 10), to: today.toISOString().slice(0, 10) };
}
/** Generated bounded read projection. Saved definitions remain a separate, non-executing metadata route. */
export function ReportsWorkspace() {
  const session = useSessionOwner();
  const identity = session.identity;
  // Reports deliberately hide generated results while identity is re-verified.
  const owner = identity.isFetching ? "" : session.owner;
  const provider = useDataProvider();
  const [kind, setKind] = useState<ReportKind>("orders");
  const [dates, setDates] = useState(initialDates);
  const [currency, setCurrency] = useState("INR");
  const [status, setStatus] = useState("");
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [orgSearch, setOrgSearch] = useState("");
  const [orgTerm, setOrgTerm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [output, setOutput] = useState<{ owner: string; key: string; scope: string; result: ReportResult } | null>(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const generation = useRef(0);
  useEffect(() => { const timer = window.setTimeout(() => setOrgTerm(orgSearch.trim()), 350); return () => window.clearTimeout(timer); }, [orgSearch]);
  const orgFilters = useMemo<CrudFilters>(() => orgTerm ? [{ field: "name", operator: "contains", value: orgTerm }] : [], [orgTerm]);
  const orgMeta = useMemo(() => ({ reportLookupOwner: owner }), [owner]);
  const organizations = useList<ErpRecord>({ resource: "organizations", filters: orgFilters, sorters: organizationSorters, pagination: organizationPagination, meta: orgMeta, queryOptions: { ...ERP_QUERY_OPTIONS, enabled: !!owner }, errorNotification: false });
  const options = !owner || organizations.query.isLoading || organizations.query.isFetching || organizations.query.isError ? [] : organizations.result.data.filter(row => !isTestOrganization(row) && reportUuid(row.id) && typeof row.name === "string" && !!row.name.trim()).map(row => ({ id: row.id, name: row.name as string, owner }));
  const selected = organization?.owner === owner && owner ? organization : null;
  useDefaultOrganization(selected?.id ?? "", options.map(option => option.id), id => { const match = options.find(option => option.id === id); if (match) setOrganization(match); }, !!owner && !orgTerm && !organizations.query.isLoading && !organizations.query.isFetching && !organizations.query.isError);
  const request = useMemo<ReportRequest>(() => ({ kind, organizationId: selected?.id ?? "", from: dates.from, to: dates.to, currency, status }), [kind, selected?.id, dates.from, dates.to, currency, status]);
  const key = JSON.stringify(request);
  const live = useRef({ owner, key }); live.current = { owner, key };
  useEffect(() => { generation.current++; setOutput(null); setError(""); setBusy(false); setPage(0); }, [owner, key]);
  useEffect(() => () => { generation.current++; }, []);
  const visible = owner && output?.owner === owner && output.key === key && !busy ? output : null;
  const generate = async () => {
    if (!owner || !selected || busy) return;
    const token = ++generation.current; const capturedOwner = owner; const capturedKey = key;
    const current = () => generation.current === token && live.current.owner === capturedOwner && live.current.key === capturedKey;
    setOutput(null); setError(""); setBusy(true); setPage(0);
    try {
      const result = await generateScopedOperationalReport(request, {
        read: params => provider().getList<ErpRecord>(params),
        organization: async id => (await provider().getOne<ErpRecord>({ resource: "organizations", id })).data,
        ledger: async id => {
          const custom = provider("app").custom;
          if (!custom) throw new Error("Ledger function provider is unavailable.");
          return (await custom({ url: LEDGER_FUNCTION, method: "post", payload: { action: "state", organization_id: id }, meta: { kind: "function", async: false } })).data;
        },
      }, current);
      if (current()) setOutput({ owner: capturedOwner, key: capturedKey, result, scope: `${selected.name} · ${dates.from} to ${dates.to} · ${status ? status : "all statuses"} · ${currency || (kind === "stock_adjustments" ? "quantities only" : "each currency separately")}` });
    } catch (reason) {
      if (current()) setError(`Unable to generate a complete report. ${reason instanceof Error ? reason.message : "Check access and filters, then try again."}`);
    } finally { if (current()) setBusy(false); }
  };
  const monetaryFilter = kind === "orders" || kind === "purchase_orders";
  const groups = visible?.result.groups ?? [];
  const maximum = Math.max(1, ...groups.map(group => group.count));
  return <PageContainer><Stack spacing={3}>
    <Breadcrumbs><Link component={RouterLink} to="/">Workspace</Link><Typography>Reports</Typography></Breadcrumbs>
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "flex-start" }} spacing={2}><Box><Typography variant="h2">Reports</Typography><Typography color="text.secondary">Pick a report and period, then generate it. You can export the result as CSV or PDF.</Typography></Box><Stack direction="row" spacing={1}><Button component={RouterLink} to="/import-export" variant="outlined" startIcon={<FileDownloadRoundedIcon />}>Financial exports</Button><Button component={RouterLink} to="/reports?view=definitions" variant="outlined">Saved definitions</Button></Stack></Stack>
    <Card><CardContent><Stack spacing={2}>
      <Typography variant="h5" component="h3">Choose a report</Typography>
      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))", xl: "repeat(3, minmax(0, 1fr))" } }}>
        <TextField select label="Report type" value={kind} onChange={event => { const value = event.target.value as ReportKind; setKind(value); setStatus(""); setCurrency(value === "orders" || value === "purchase_orders" ? "INR" : ""); }}>{Object.entries(REPORT_DEFINITIONS).map(([value, definition]) => <MenuItem value={value} key={value}>{definition.title}</MenuItem>)}</TextField>
        <Autocomplete value={selected} options={options} filterOptions={items => items} isOptionEqualToValue={(a, b) => a.id === b.id && a.owner === b.owner} getOptionLabel={item => item.name} disabled={!owner} loading={organizations.query.isFetching} onInputChange={(_, value, reason) => { if (reason === "input") setOrgSearch(value); }} onChange={(_, value) => setOrganization(value)} noOptionsText={organizations.query.isError ? "Unable to load permitted organizations" : "No permitted organizations found"} renderInput={params => <TextField {...params} label="Organization" required helperText="Organization to report on" error={organizations.query.isError} />} />
        <TextField label="From date" type="date" value={dates.from} onChange={event => setDates(current => ({ ...current, from: event.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField label="To date" type="date" value={dates.to} onChange={event => setDates(current => ({ ...current, to: event.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField label="Currency" value={currency} disabled={!monetaryFilter} onChange={event => setCurrency(event.target.value.toUpperCase())} helperText={monetaryFilter ? "For example INR. Leave blank to total each currency separately." : kind === "order_payments" ? "Amounts are totalled per currency." : "Not used for stock reports."} />
        <TextField label={REPORT_DEFINITIONS[kind].group === "status" ? "Status" : "Type"} value={status} onChange={event => setStatus(event.target.value)} helperText="Optional. Leave blank to include all." />
      </Box>
      <Stack direction="row" spacing={2} alignItems="center"><Button variant="contained" startIcon={busy ? <CircularProgress size={16} color="inherit" /> : <PlayArrowRoundedIcon />} sx={{ alignSelf: "flex-start" }} disabled={!owner || !selected || busy || !dates.from || !dates.to} onClick={() => void generate()}>Generate report</Button><Typography variant="caption" color="text.secondary">Up to 500 records per report.</Typography></Stack>
    </Stack></CardContent></Card>
    {!owner && <Alert severity="info">Sign in again to generate reports.</Alert>}
    {busy && <Box role="status" aria-label="Generating report"><LinearProgress /><Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Collecting records…</Typography></Box>}
    {error && <Alert severity="error">{error}</Alert>}
    {visible && <>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between"><Box><Typography variant="h3">{visible.result.title}</Typography><Typography variant="body2">{visible.scope}</Typography><Typography variant="caption" color="text.secondary">Generated {new Date(visible.result.generatedAt).toLocaleString()}. Totals are recorded document values, not payments received.</Typography></Box><Chip icon={<AssessmentRoundedIcon />} label={`${visible.result.count} records`} sx={{ alignSelf: "flex-start" }} /></Stack>
      {visible.result.warnings.map((warning, index) => <Alert key={index} severity="warning">{warning}</Alert>)}
      {visible.result.summaries.length > 0 && <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" } }}>{visible.result.summaries.map((summary, index) => <Card key={index}><CardContent><Typography variant="body2" color="text.secondary">{summary.label}</Typography><Typography variant="h4" component="p" sx={{ mt: 1, fontVariantNumeric: "tabular-nums" }}>{summary.value}</Typography></CardContent></Card>)}</Box>}
      {groups.length > 0 && <Card><CardContent><Typography variant="h5" component="h3">{REPORT_DEFINITIONS[kind].group === "status" ? "Status distribution" : "Type distribution"}</Typography>{groups.length > 12 && <Typography variant="caption" color="text.secondary">Largest 12 of {groups.length} groups. All records are in the table below.</Typography>}<Stack spacing={1.5} sx={{ mt: 2 }}>{groups.slice(0, 12).map(group => <Box key={group.label}><Stack direction="row" justifyContent="space-between"><Typography>{group.label}</Typography><Typography>{group.count}</Typography></Stack><LinearProgress variant="determinate" value={group.count / maximum * 100} aria-label={`${group.label}: ${group.count} records; relative to largest group`} /></Box>)}</Stack></CardContent></Card>}
      {visible.result.count === 0 ? <Alert severity="info">No records match. Change the period or filters and generate again.</Alert> : <>
        <RecordExportActions key={`${visible.owner}:${visible.result.generatedAt}`} title={visible.result.title} columns={visible.result.columns} rows={visible.result.rows} scopeLabel={visible.scope} filename={`${kind}-${dates.from}-${dates.to}`} />
        <Card><Box sx={{ overflowX: "auto" }}><Table size="small" aria-label="Generated report records"><TableHead><TableRow>{visible.result.columns.map(column => <TableCell key={column.key}>{column.label}</TableCell>)}</TableRow></TableHead><TableBody>{visible.result.rows.slice(page * size, page * size + size).map((row, index) => <TableRow hover key={page * size + index}>{visible.result.columns.map(column => <TableCell key={column.key} sx={{ overflowWrap: "anywhere", maxWidth: 300 }}>{row[column.key]}</TableCell>)}</TableRow>)}</TableBody></Table></Box><TablePagination component="div" count={visible.result.count} page={page} rowsPerPage={size} rowsPerPageOptions={[10, 20, 50, 100]} onPageChange={(_, value) => setPage(value)} onRowsPerPageChange={event => { setSize(Number(event.target.value)); setPage(0); }} labelRowsPerPage="Rows per page" /></Card>
        <Typography variant="caption" color="text.secondary">Exports include every record in this report, not just the page shown.</Typography>
      </>}
    </>}
    {!visible && !busy && !error && owner && <Card variant="outlined"><CardContent><Stack alignItems="center" spacing={1} sx={{ py: 4, textAlign: "center" }}><AssessmentRoundedIcon color="disabled" sx={{ fontSize: 48 }} /><Typography variant="h6">No report generated yet</Typography><Typography variant="body2" color="text.secondary">Choose a report type, organization and period, then select Generate report.</Typography></Stack></CardContent></Card>}
  </Stack></PageContainer>;
}
