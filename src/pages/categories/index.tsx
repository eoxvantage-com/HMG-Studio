import { useEffect, useMemo, useRef, useState } from "react";
import { useCan, useCustomMutation, useNotification, useWarnAboutChange, type CrudFilters } from "@refinedev/core";
import { useAutocomplete, useDataGrid } from "@refinedev/mui";
import { Controller, useForm } from "react-hook-form";
import { Link as RouterLink } from "react-router";
import {
  Alert, Autocomplete, Box, Breadcrumbs, Button, Card, CardContent, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  IconButton, InputAdornment, Link, MenuItem, Skeleton, Stack, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import TableRowsRoundedIcon from "@mui/icons-material/TableRowsRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import { PageContainer } from "../../components/PageContainer";
import { RecordExportActions } from "../../components/RecordExportActions";
import { useBusinessOrganizations } from "../../hooks/useBusinessOrganizations";
import { toast } from "../../providers/notificationProvider";
import type { ExportColumn } from "../../services/recordExport";
import { CATALOG_FUNCTION, CATALOG_FUNCTION_META, CatalogError, decodeCategory, type Category } from "../../services/catalog";

const queryOptions = { retry: false, refetchOnWindowFocus: false, refetchOnReconnect: false };
const sorters = [{ field: "name", order: "asc" as const }];
const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric", timeZone: "UTC" });
type Organization = { id: string; name: string; settings?: unknown };
type CategoryValues = { name: string; description: string; organization: Organization | null };
const organizationSearch = (value: string): CrudFilters => value ? [{ field: "name", operator: "contains", value }] : [];
const exportColumns: ExportColumn[] = [
  { key: "name", label: "Category" }, { key: "description", label: "Description" }, { key: "slug", label: "Identifier" },
  { key: "is_active", label: "Status" }, { key: "created_at", label: "Created" },
];
const created = (value: string | null | undefined) => value && Number.isFinite(Date.parse(value)) ? dateFormat.format(new Date(value)) : "—";
const isTest = (row: Organization) => typeof row.settings === "object" && row.settings !== null && (row.settings as Record<string, unknown>).dataset_kind === "test";

function CreateCategory({ close, saved }: { close: () => void; saved: () => void }) {
  const { control, handleSubmit, getValues, formState: { errors, isDirty, isSubmitting } } = useForm<CategoryValues>({ defaultValues: { name: "", description: "", organization: null } });
  const { autocompleteProps, query, onSearch } = useAutocomplete<Organization>({ resource: "organizations", pagination: { pageSize: 10 }, onSearch: organizationSearch, queryOptions });
  useEffect(() => () => { (onSearch as typeof onSearch & { cancel?: () => void }).cancel?.(); }, [onSearch]);
  const { mutateAsync, mutation } = useCustomMutation();
  const { open } = useNotification();
  const { setWarnWhen } = useWarnAboutChange();
  const requestId = useRef(crypto.randomUUID());
  const inFlight = useRef(false);
  const submitted = useRef<CategoryValues | null>(null);
  const [message, setMessage] = useState(""); const [uncertain, setUncertain] = useState(false); const [discard, setDiscard] = useState(false);
  const busy = isSubmitting || mutation.isPending;
  useEffect(() => { setWarnWhen?.(isDirty || uncertain); return () => setWarnWhen?.(false); }, [isDirty, uncertain, setWarnWhen]);
  const execute = async (action: "create" | "readback", values: CategoryValues) => {
    if (inFlight.current || !values.organization) return;
    inFlight.current = true; setMessage(""); if (action === "create") submitted.current = values;
    try {
      const response = await mutateAsync({ url: CATALOG_FUNCTION, method: "post", dataProviderName: "app", meta: CATALOG_FUNCTION_META,
        values: { action, organization_id: values.organization.id, request_id: requestId.current, ...(action === "create" ? { values: { name: values.name, description: values.description } } : {}) },
        successNotification: false, errorNotification: false });
      const record = decodeCategory(response.data); const expected = submitted.current ?? values;
      if (record.id !== requestId.current || record.organization_id !== expected.organization?.id || record.name !== expected.name.trim() || record.description !== (expected.description.trim() || null) || record.is_active !== true) throw new CatalogError("READBACK_FAILED");
      setWarnWhen?.(false); toast(open, "success", "Category saved", `${record.name} is ready to use on products.`); saved();
    } catch (error) {
      const failure = error instanceof CatalogError ? error : new CatalogError("WRITE_UNCONFIRMED"); setMessage(failure.message);
      toast(open, "error", "Category not saved", failure.message);
      if (!["VALIDATION_ERROR", "FORBIDDEN", "UNAUTHENTICATED", "VALIDATION_UNAVAILABLE", "LOAD_FAILED"].includes(failure.code)) setUncertain(true);
    } finally { inFlight.current = false; }
  };
  const cancel = () => { if (busy) return; if (isDirty || uncertain) setDiscard(true); else close(); };
  const options = (autocompleteProps.options as Organization[]).filter(option => !isTest(option));
  return <>
    <Dialog open onClose={cancel} fullWidth maxWidth="sm" aria-labelledby="create-category-title">
      <DialogTitle id="create-category-title">Create category</DialogTitle>
      <DialogContent dividers>
        <Stack component="form" id="create-category" spacing={2} noValidate onSubmit={handleSubmit(values => uncertain ? undefined : execute("create", values))}>
          <DialogContentText>New categories are active immediately and can be chosen on products.</DialogContentText>
          {message && <Alert severity="error">{message}</Alert>}
          <Controller name="organization" control={control} rules={{ required: "Choose an organization." }} render={({ field }) => <Autocomplete {...autocompleteProps} options={options} filterOptions={items => items} value={field.value} disabled={busy || uncertain}
            getOptionLabel={option => option.name} isOptionEqualToValue={(a, b) => a.id === b.id} onChange={(_, value) => field.onChange(value)} onBlur={field.onBlur}
            renderInput={params => <TextField {...params} inputRef={field.ref} label="Organization" required error={!!errors.organization || query.isError} helperText={query.isError ? "Unable to load organizations. Close and try again." : errors.organization?.message} />} />} />
          <Controller name="name" control={control} rules={{ required: "Enter a category name.", validate: value => !!value.trim() || "Enter a category name.", maxLength: { value: 255, message: "Use 255 characters or fewer." } }}
            render={({ field }) => <TextField {...field} label="Category name" required autoFocus disabled={busy || uncertain} error={!!errors.name} helperText={errors.name?.message} inputProps={{ maxLength: 255 }} placeholder="e.g. Marble, Quartzite, Counter Basin" />} />
          <Controller name="description" control={control} render={({ field }) => <TextField {...field} label="Description" multiline minRows={3} disabled={busy || uncertain} />} />
          {uncertain && <Alert severity="warning">The save outcome is uncertain. Do not create a second category; check this request first.<Typography variant="caption" display="block">Request: {requestId.current}</Typography></Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" disabled={busy} onClick={cancel}>Cancel</Button>
        {uncertain ? <Button variant="contained" disabled={busy} startIcon={busy ? <CircularProgress size={16} /> : undefined} onClick={() => void execute("readback", submitted.current ?? getValues())}>Check saved record</Button>
          : <Button variant="contained" type="submit" form="create-category" disabled={busy} startIcon={busy ? <CircularProgress size={16} /> : undefined}>Save category</Button>}
      </DialogActions>
    </Dialog>
    <Dialog open={discard} onClose={() => setDiscard(false)} aria-labelledby="discard-category-title"><DialogTitle id="discard-category-title">Discard category draft?</DialogTitle>
      <DialogContent><DialogContentText>{uncertain ? "A save may already have committed. Closing this draft does not undo it; keep the request ID and verify before creating another category. " : "Unsaved category fields will be lost. "}This action cannot be undone.</DialogContentText></DialogContent>
      <DialogActions><Button variant="outlined" onClick={() => setDiscard(false)}>Keep draft</Button><Button variant="contained" color="error" onClick={close}>Discard draft</Button></DialogActions>
    </Dialog>
  </>;
}

export function Categories() {
  const [view, setView] = useState<"cards" | "table">("cards"); const [search, setSearch] = useState(""); const [status, setStatus] = useState(""); const [creating, setCreating] = useState(false);
  const { data: executeAccess } = useCan({ resource: `function:${CATALOG_FUNCTION}`, action: "execute" });
  const business = useBusinessOrganizations();
  const permanent = useMemo<CrudFilters>(() => [{ field: "deleted_at", operator: "null", value: true }, ...(business.ids.length ? [{ field: "organization_id", operator: "in" as const, value: business.ids }] : [])], [business.ids]);
  const { dataGridProps, tableQuery, result, setFilters, setCurrentPage, setPageSize } = useDataGrid<Category>({ resource: "product_categories", pagination: { pageSize: 12, mode: "server" }, filters: { permanent }, sorters: { initial: sorters }, syncWithLocation: false, queryOptions: { ...queryOptions, enabled: business.ready } });
  useEffect(() => { const timer = window.setTimeout(() => { const filters: CrudFilters = []; if (search.trim()) filters.push({ field: "name", operator: "contains", value: search.trim() }); if (status) filters.push({ field: "is_active", operator: "eq", value: status === "active" }); setFilters(filters, "replace"); setCurrentPage(1); }, 350); return () => window.clearTimeout(timer); }, [search, status, setFilters, setCurrentPage]);
  const filtered = !!(search.trim() || status);
  const emptyTitle = search.trim() ? "No results found" : status ? "No matching items" : "No categories yet";
  const page = dataGridProps.paginationModel?.page ?? 0; const size = dataGridProps.paginationModel?.pageSize ?? 12;
  const rows = result.data.map(row => ({ ...row, description: row.description || "—", is_active: row.is_active ? "Active" : "Inactive", created_at: created(row.created_at) }));
  const loading = tableQuery.isLoading || !business.ready;
  return <PageContainer><Stack spacing={3}>
    <Breadcrumbs><Link component={RouterLink} to="/">Workspace</Link><Typography color="text.primary" fontWeight={600}>Categories</Typography></Breadcrumbs>
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2}>
      <Box><Typography variant="h2">Categories</Typography><Typography color="text.secondary">Stone families used to group products: marble, granite, onyx, basins and more.</Typography></Box>
      {executeAccess?.can && <Button variant="contained" startIcon={<AddRoundedIcon />} aria-label="Create category" onClick={() => setCreating(true)}>Create category</Button>}
    </Stack>
    <Card><CardContent><Stack spacing={2}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
        <TextField size="small" label="Search categories" value={search} onChange={event => setSearch(event.target.value)} sx={{ minWidth: 280 }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }} />
        <TextField size="small" select label="Status" value={status} onChange={event => setStatus(event.target.value)} sx={{ minWidth: 160 }}><MenuItem value="">All statuses</MenuItem><MenuItem value="active">Active</MenuItem><MenuItem value="inactive">Inactive</MenuItem></TextField>
        <ToggleButtonGroup size="small" exclusive value={view} onChange={(_, value) => value && setView(value)} aria-label="Display">
          <ToggleButton value="cards" aria-label="Cards"><GridViewRoundedIcon fontSize="small" /></ToggleButton><ToggleButton value="table" aria-label="Table"><TableRowsRoundedIcon fontSize="small" /></ToggleButton>
        </ToggleButtonGroup>
        <Box flex={1} />
        {!tableQuery.isFetching && result.data.length > 0 && <RecordExportActions title="Product categories" columns={view === "table" ? exportColumns : exportColumns.filter(column => column.key !== "created_at")} rows={rows} scopeLabel="Current category page only" filename="HMG-categories-current-page" />}
        <Tooltip title="Refresh"><span><IconButton aria-label="Refresh" disabled={tableQuery.isFetching} onClick={() => void tableQuery.refetch()}><RefreshRoundedIcon /></IconButton></span></Tooltip>
      </Stack>
      {filtered && <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>{search.trim() && <Chip label={`Search: ${search}`} onDelete={() => setSearch("")} />}{status && <Chip label={`Status: ${status === "active" ? "Active" : "Inactive"}`} onDelete={() => setStatus("")} />}<Button size="small" onClick={() => { setSearch(""); setStatus(""); }}>Clear filters</Button></Stack>}
      {loading ? <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" } }} role="status" aria-label="Loading categories">{[0, 1, 2, 3].map(index => <Skeleton key={index} variant="rounded" height={110} />)}</Box>
        : tableQuery.isError ? <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => void tableQuery.refetch()}>Try again</Button>}><Typography fontWeight={600}>Unable to load categories</Typography>Check your access or try again. No data has been changed.</Alert>
          : !result.data.length ? <Stack alignItems="center" spacing={1} sx={{ py: 5 }}><CategoryRoundedIcon color="disabled" sx={{ fontSize: 40 }} /><Typography variant="h6">{emptyTitle}</Typography><Typography color="text.secondary">{filtered ? "Change your search or filters to see more categories." : "Create your first category to start grouping products."}</Typography>{filtered ? <Button onClick={() => { setSearch(""); setStatus(""); }}>Clear filters</Button> : executeAccess?.can && <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setCreating(true)}>Create category</Button>}</Stack>
            : view === "cards" ? <Box aria-busy={tableQuery.isFetching} sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3, 1fr)", xl: "repeat(4, 1fr)" } }}>
              {result.data.map(category => <Card key={category.id} variant="outlined"><CardContent><Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}><Typography variant="h6" component="h3" sx={{ overflowWrap: "anywhere", fontSize: 16 }}>{category.name}</Typography><Chip size="small" color={category.is_active ? "success" : "default"} label={category.is_active ? "Active" : "Inactive"} /></Stack>
                <Typography variant="body2" color="text.secondary">{category.description || "No description"}</Typography>
                <Typography variant="caption" color="text.disabled">Identifier: {category.slug || "—"} · Created {created(category.created_at)}</Typography>
              </Stack></CardContent></Card>)}
            </Box>
              : <Box sx={{ overflowX: "auto" }}><Table size="small" aria-label="Categories"><TableHead><TableRow><TableCell>Category</TableCell><TableCell>Description</TableCell><TableCell>Identifier</TableCell><TableCell>Status</TableCell><TableCell>Created</TableCell></TableRow></TableHead><TableBody>
                {result.data.map(category => <TableRow key={category.id} hover><TableCell sx={{ fontWeight: 600 }}>{category.name}</TableCell><TableCell>{category.description || "—"}</TableCell><TableCell>{category.slug || "—"}</TableCell><TableCell><Chip size="small" color={category.is_active ? "success" : "default"} label={category.is_active ? "Active" : "Inactive"} /></TableCell><TableCell>{created(category.created_at)}</TableCell></TableRow>)}
              </TableBody></Table></Box>}
      {!tableQuery.isError && (result.total ?? 0) > 0 && <TablePagination component="div" count={result.total ?? 0} page={page} rowsPerPage={size} rowsPerPageOptions={[12, 24, 48, 96]} onPageChange={(_, value) => setCurrentPage(value + 1)} onRowsPerPageChange={event => { setPageSize(Number(event.target.value)); setCurrentPage(1); }} labelDisplayedRows={({ from, to, count }) => `${from}–${to} of ${count} categories`} />}
      <Typography variant="caption" color="text.secondary">Editing and deleting categories is not available yet.</Typography>
    </Stack></CardContent></Card>
    {creating && <CreateCategory close={() => setCreating(false)} saved={() => { setCreating(false); void tableQuery.refetch(); }} />}
  </Stack></PageContainer>;
}
