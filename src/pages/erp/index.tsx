import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useCan, useCanWithoutCache, useCreate, useCustomMutation, useDataProvider, useNotification, useOne, useUpdate, useWarnAboutChange, type CrudFilters } from "@refinedev/core";
import { useAutocomplete, useDataGrid } from "@refinedev/mui";
import { Controller, useForm, useWatch, type Control } from "react-hook-form";
import { Link as RouterLink, useLocation, useNavigate, useParams } from "react-router";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Accordion, AccordionDetails, AccordionSummary, Alert, Autocomplete, Box, Breadcrumbs, Button, Card, CardContent, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, InputAdornment, Link, MenuItem, Skeleton, Stack, TextField, Tooltip, Typography } from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { ModuleRecordOverview } from "../../components/ErpBusinessOverview";
import { RecordExportActions } from "../../components/RecordExportActions";
import { moduleListFields, moduleSearchFields, businessSections, presentationValue, statusPresentation } from "../../services/erpPresentation";
import { inventoryMetrics, primaryProductRelation } from "../../services/inventory";
import { useRecordNames, recordIds } from "../../hooks/useRecordNames";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import FolderOpenRoundedIcon from "@mui/icons-material/FolderOpenRounded";
import { PageContainer } from "../../components/PageContainer";
import { NativeManagementPage } from "./platform";
import { ReportsWorkspace } from "./reports";
import { ApprovalsPage } from "./approvals";
import { NotificationsPage } from "./notifications";
import { PurchaseOrderWorkspace } from "./purchaseOrderWorkspace";
import { OrderCreateWorkspace, ReturnCreateWorkspace } from "./commerceCreate";
import { InventoryList, InventoryRelated, ProductOverview } from "./inventory";
import { ERP_MODULES, getErpModule, type ErpModule } from "../../erp/modules";
import { buildErpFilters, displayValue, editableFields, erpResources, ERP_QUERY_OPTIONS, fieldLabel, getErpResource, initialValues, labelField, listFields, logicalResource, normalizeValues, relationFor, verifyReadback, visibleFields, writeBlocker, type ErpField, type ErpRecord, type ErpResource } from "../../services/erp";

type ReferenceContext = { label: (field: string, value: unknown) => string; record: (field: string, value: unknown) => ErpRecord | undefined };
type ReferenceGroup = { resource: string; ids: string[] };
function ReferenceBatch({ groups, index = 0, values = {}, children }: { groups: ReferenceGroup[]; index?: number; values?: Record<string, ErpRecord>; children: (values: Record<string, ErpRecord>) => ReactNode }) {
  const group = groups[index];
  const names = useRecordNames(group.resource, group.ids);
  const next = { ...values, ...Object.fromEntries(names.rows.map(row => [`${group.resource}:${row.id}`, row])) };
  return index + 1 < groups.length ? <ReferenceBatch groups={groups} index={index + 1} values={next}>{children}</ReferenceBatch> : <>{children(next)}</>;
}
/** Resolve only displayed business FKs; native user identities remain unavailable, never queried as datatables. */
function RecordReferences({ resource, rows, fields, children }: { resource: ErpResource; rows: ErpRecord[]; fields: ErpField[]; children: (context: ReferenceContext) => ReactNode }) {
  const relations = (resource.schema.foreignKeys ?? []).filter(relation => relation.fields.length === 1 && fields.some(field => field.name === relation.fields[0]));
  const groups = Object.entries(relations.reduce<Record<string, string[]>>((all, relation) => {
    const name = logicalResource(relation.reference.resource);
    if (!getErpResource(name)?.liveVerified) return all;
    all[name] = [...new Set([...(all[name] ?? []), ...recordIds(rows, relation.fields[0])])].sort();
    return all;
  }, {})).filter(([, ids]) => ids.length > 0).map(([name, ids]) => ({ resource: name, ids })).sort((a, b) => a.resource.localeCompare(b.resource));
  const render = (values: Record<string, ErpRecord>) => {
    const find = (field: string, value: unknown) => {
      const relation = relations.find(item => item.fields[0] === field);
      return relation ? values[`${logicalResource(relation.reference.resource)}:${String(value)}`] : undefined;
    };
    return children({ record: find, label: (field, value) => {
      if (value === null || value === undefined || value === "") return "Not assigned";
      const relation = relations.find(item => item.fields[0] === field);
      const target = relation && getErpResource(relation.reference.resource);
      const row = find(field, value);
      const nameField = target ? labelField(target) : undefined;
      const label = nameField && nameField !== "id" ? row?.[nameField] : undefined;
      return typeof label === "string" && label.trim() ? label : "Name unavailable";
    } });
  };
  return groups.length ? <ReferenceBatch key={groups.map(group => group.resource).join("|")} groups={groups}>{render}</ReferenceBatch> : <>{render({})}</>;
}
function rowCurrency(row: ErpRecord, references: ReferenceContext): string | undefined {
  const currency = row.currency ?? references.record("order_id", row.order_id)?.currency ?? references.record("purchase_order_id", row.purchase_order_id)?.currency;
  return typeof currency === "string" && /^[A-Z]{3}$/.test(currency) ? currency : undefined;
}
function recordValue(resource: ErpResource, field: ErpField, row: ErpRecord, references: ReferenceContext): string {
  if (resource.name === "products" && field.name === "stock") return inventoryMetrics(row).stock?.toLocaleString() ?? "Not available";
  return presentationValue(resource, field, row[field.name], { currency: rowCurrency(row, references), referenceLabel: references.label });
}
function exportValues(resource: ErpResource, fields: ErpField[], row: ErpRecord, references: ReferenceContext): ErpRecord {
  return { id: row.id, ...Object.fromEntries(fields.map(field => [field.name, recordValue(resource, field, row, references)])) };
}

type Action = "list" | "create" | "edit" | "show";
const emptyFilters: CrudFilters = [];
const PRODUCT_COMMAND = "hmg-product-master-v1";
const PRODUCT_COMMAND_META = { kind: "function", async: false } as const;
function productEnvelope(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object") throw new Error("Product response unavailable");
  const result = value as Record<string, unknown>;
  if (result.ok !== true || result.verified !== true) throw new Error("Product operation could not be confirmed");
  return result;
}
function productRecord(value: unknown): ErpRecord {
  const record = productEnvelope(value).record;
  if (!record || typeof record !== "object" || typeof (record as ErpRecord).id !== "string") throw new Error("Product readback unavailable");
  return record as ErpRecord;
}
function Loading({ label }: { label: string }) {
  return <Box role="status" aria-label={label}><Skeleton height={48} /><Skeleton variant="rounded" height={260} /></Box>;
}
function Breadcrumb({ module, action }: { module: ErpModule; action?: string }) {
  return <Breadcrumbs><Link component={RouterLink} to="/">Workspace</Link>{action ? <Link component={RouterLink} to={module.path}>{module.label}</Link> : <Typography>{module.label}</Typography>}{action && <Typography>{action}</Typography>}</Breadcrumbs>;
}
function Status({ field, value }: { field: ErpField; value: unknown }) {
  const status = statusPresentation(field.name, value);
  return <Chip size="small" label={status?.label ?? displayValue(field, value)} color={status?.color ?? "default"} />;
}

function FieldValue({ field, value }: { field: ErpField; value: unknown }) {
  return field.name === "status" || field.name === "is_active" || field.name.endsWith("_status")
    ? <Status field={field} value={value} />
    : <Tooltip title={displayValue(field, value)}><span>{displayValue(field, value)}</span></Tooltip>;
}
function MasterActions({ resource, module }: { resource: ErpResource; module: ErpModule }) {
  if (resource.name === "purchase_orders") return <Button component={RouterLink} to={`${module.path}/create`} variant="contained" startIcon={<AddRoundedIcon />}>Create purchase order</Button>;
  if (resource.name === "orders") return <Button component={RouterLink} to={`${module.path}/create`} variant="contained" startIcon={<AddRoundedIcon />}>Create order</Button>;
  if (resource.name === "return_orders") return <Button component={RouterLink} to={`${module.path}/create`} variant="contained" startIcon={<AddRoundedIcon />}>Create return</Button>;
  if (resource.name === "products") return <Button component={RouterLink} to={`${module.path}/create`} variant="contained" startIcon={<AddRoundedIcon />}>Add product</Button>;
  if (!editableFields(resource, "create").length) return null;
  return <Button component={RouterLink} to={`${module.path}/create`} variant="contained" startIcon={<AddRoundedIcon />}>Create record</Button>;
}

function RecordList({ resource, module, parentFilters = emptyFilters, related = false, active = true, onCount }: { resource: ErpResource; module: ErpModule; parentFilters?: CrudFilters; related?: boolean; active?: boolean; onCount?: (count: number | undefined) => void }) {
  const [search, setSearch] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const filterField = resource.schema.fields.find(field => field.name === "is_active") ?? resource.schema.fields.find(field => field.name === "status") ?? resource.schema.fields.find(field => field.name === "code" || field.name === "sku") ?? resource.schema.fields.find(field => field.name === "id")!;
  const permanent = useMemo<CrudFilters>(() => [...parentFilters, ...(resource.schema.fields.some(field => field.name === "deleted_at") ? [{ field: "deleted_at", operator: "null" as const, value: true }] : [])], [parentFilters, resource]);
  const sorters = useMemo(() => [{ field: labelField(resource), order: "asc" as const }], [resource]);
  const { dataGridProps, tableQuery, result, setFilters, setCurrentPage } = useDataGrid<ErpRecord>({ resource: resource.name, pagination: { pageSize: 10, mode: "server" }, filters: { permanent }, sorters: { initial: sorters }, syncWithLocation: false, queryOptions: ERP_QUERY_OPTIONS });
  useEffect(() => {
    const timer = window.setTimeout(() => { setCurrentPage(1); setFilters([...buildErpFilters(resource, "", filterField.name, filterValue), ...(search.trim() ? moduleSearchFields(resource).length ? [{ operator: "or" as const, value: moduleSearchFields(resource).map(field => ({ field, operator: "contains" as const, value: search.trim() })) }] : [{ field: "id", operator: "eq" as const, value: search.trim() }] : [])], "replace"); }, 350);
    return () => window.clearTimeout(timer);
  }, [search, filterValue, resource, filterField.name, setFilters, setCurrentPage]);
  useEffect(() => { onCount?.(tableQuery.isError || tableQuery.isLoading ? undefined : result.total); }, [result.total, tableQuery.isError, tableQuery.isLoading, onCount]);
  const selectedFields = moduleListFields(resource);
  const targetModule = related ? ERP_MODULES.find(item => item.resource === resource.name) : module;
  const columnsFor = (references: ReferenceContext): GridColDef<ErpRecord>[] => {
    const primary = labelField(resource);
    const selected = selectedFields;
    return [...selected.map(field => ({ field: field.name, headerName: fieldLabel(field.name), flex: field.name === primary ? 1.5 : 1, minWidth: 135,
      align: ["number", "integer"].includes(field.type) ? "right" as const : "left" as const,
      headerAlign: ["number", "integer"].includes(field.type) ? "right" as const : "left" as const,
      renderCell: ({ row, value }: { row: ErpRecord; value?: unknown }) => field.name === primary && !!targetModule
        ? <Link component={RouterLink} to={`${targetModule!.path}/show/${encodeURIComponent(row.id)}`}>{displayValue(field, value)}</Link>
        : field.name === "is_active" || field.name === "status" || field.name.endsWith("_status") ? <Status field={field} value={value} /> : <span>{recordValue(resource, field, row, references)}</span>,
    })), ...(targetModule ? [{ field: "actions", headerName: "Actions", width: 90, sortable: false, filterable: false, align: "right" as const, headerAlign: "right" as const,
      renderCell: ({ row }: { row: ErpRecord }) => <Button component={RouterLink} to={`${targetModule.path}/show/${encodeURIComponent(row.id)}`} size="small" aria-label={`View ${String(row[primary] ?? row.id)}`}>View</Button>,
    }] : [])];
  };
  const emptyTitle = search.trim() ? "No results found" : filterValue ? "No matching items" : `No ${module.label.toLowerCase()} yet`;
  const filterOptions = filterField.type === "boolean" ? [{ value: "true", label: "Active" }, { value: "false", label: "Inactive" }] : filterField.constraints?.enum?.map(value => ({ value: String(value), label: String(value) }));
  const blocker = writeBlocker(resource);
  if (!active) return null;
  return <RecordReferences resource={resource} rows={tableQuery.isError || tableQuery.isLoading ? [] : result.data} fields={[...selectedFields, ...resource.schema.fields.filter(field => ["order_id", "purchase_order_id"].includes(field.name))]}>{references => <Stack spacing={3}>
    {!related && <><Breadcrumb module={module} /><Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between"><Box><Typography variant="h2">{module.label}</Typography><Typography color="text.secondary">{module.description}</Typography></Box><MasterActions resource={resource} module={module} /></Stack>{blocker && <Alert severity="info">{blocker}</Alert>}</>}
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
      <TextField label={`Search ${module.label.toLowerCase()}`} value={search} onChange={event => setSearch(event.target.value)} sx={{ width: { xs: "100%", sm: 320 } }} slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment> } }} />
      <TextField select={!!filterOptions} label={`Filter ${fieldLabel(filterField.name).toLowerCase()}`} value={filterValue} onChange={event => setFilterValue(event.target.value)} sx={{ minWidth: 180 }}>{filterOptions && [<MenuItem key="all" value="">All</MenuItem>, ...filterOptions.map(option => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)]}</TextField>
      <Button startIcon={<RefreshRoundedIcon />} onClick={() => tableQuery.refetch()} disabled={tableQuery.isFetching}>Refresh</Button>
      {!tableQuery.isFetching && !tableQuery.isError && result.data.length > 0 && <RecordExportActions title={module.label} columns={selectedFields.map(field => ({ key: field.name, label: fieldLabel(field.name) }))} rows={result.data.map(row => exportValues(resource, selectedFields, row, references))} scopeLabel="Current visible page only; active filters applied" filename={`${resource.name}-current-page`} />}
    </Stack>
    {(search || filterValue) && <Stack direction="row" flexWrap="wrap" gap={1}>{search && <Chip variant="outlined" label={`Search: ${search}`} onDelete={() => setSearch("")} />}{filterValue && <><Chip variant="outlined" color="primary" label={`${fieldLabel(filterField.name)}: ${filterOptions?.find(option => option.value === filterValue)?.label ?? filterValue}`} onDelete={() => setFilterValue("")} /><Button size="small" onClick={() => setFilterValue("")}>Clear all filters</Button></>}</Stack>}
    {tableQuery.isLoading ? <Loading label={`Loading ${module.label.toLowerCase()}`} /> : tableQuery.isError
      ? <Alert severity="error" action={<Button onClick={() => tableQuery.refetch()}>Try again</Button>}><Typography>Unable to load {module.label.toLowerCase()}</Typography><Typography variant="body2">The server could not return these records. Check your access or try again. No data has been changed.</Typography></Alert>
      : <Box sx={{ width: "100%" }}><DataGrid {...dataGridProps} rowCount={result.total ?? 0} columns={columnsFor(references)} autoHeight pageSizeOptions={[10, 20, 50, 100]} disableRowSelectionOnClick disableColumnFilter loading={tableQuery.isFetching}
        slots={{ noRowsOverlay: () => <Stack alignItems="center" justifyContent="center" sx={{ height: "100%", p: 3 }}><FolderOpenRoundedIcon color="disabled" /><Typography variant="h6">{emptyTitle}</Typography><Typography color="text.secondary">{search || filterValue ? "Try adjusting your search or filters." : "No records are available in your current scope."}</Typography>{search ? <Button onClick={() => setSearch("")}>Clear search</Button> : filterValue ? <Button onClick={() => setFilterValue("")}>Clear all filters</Button> : !related && <MasterActions resource={resource} module={module} />}</Stack> }}
        sx={{ minHeight: !result.data.length ? 330 : undefined }} /></Box>}
  </Stack>}</RecordReferences>;
}

type InputProps = { field: ErpField; resource: ErpResource; control: Control<Record<string, unknown>>; disabled: boolean; organizationId?: string };
function ReferenceInput({ field, resource, control, disabled, organizationId }: InputProps) {
  const currentValue = useWatch({ control, name: field.name });
  const relation = relationFor(resource, field.name)!;
  const name = logicalResource(relation.reference.resource);
  const isUser = name === "auth_user";
  const target = getErpResource(name);
  const searchField = isUser ? "email" : target ? labelField(target) : "id";
  const needsOrganization = !!target?.schema.fields.some(item => item.name === "organization_id");
  const filters = useMemo<CrudFilters>(() => [...(needsOrganization && organizationId ? [{ field: "organization_id", operator: "eq" as const, value: organizationId }] : []), ...(name === "products" ? [{ field: "deleted_at", operator: "null" as const, value: true }] : [])], [needsOrganization, organizationId, name]);
  const referenceDisabled = disabled || (!isUser && !target?.liveVerified) || (needsOrganization && !organizationId);
  const { autocompleteProps, query } = useAutocomplete<ErpRecord>({ resource: isUser ? "users" : name, dataProviderName: isUser ? "user" : "default", filters, defaultValue: !referenceDisabled && typeof currentValue === "string" && currentValue ? currentValue : undefined, pagination: { pageSize: 10, mode: "server" }, onSearch: text => text ? [{ field: searchField, operator: searchField === "id" ? "eq" : "contains", value: text }] : [], queryOptions: { ...ERP_QUERY_OPTIONS, enabled: !referenceDisabled } });
  return <Controller name={field.name} control={control} render={({ field: input, fieldState }) => {
    const selected = autocompleteProps.options.find(option => option.id === input.value) ?? (input.value ? { id: String(input.value), [searchField]: String(input.value) } : null);
    return <Autocomplete {...autocompleteProps} filterOptions={options => options} value={selected} onChange={(_, value) => input.onChange(value?.id ?? null)} onBlur={input.onBlur} disabled={referenceDisabled}
      getOptionLabel={option => String(option[searchField] ?? option.id)} isOptionEqualToValue={(a, b) => a.id === b.id}
      renderInput={params => <TextField {...params} inputRef={input.ref} label={fieldLabel(field.name)} required={field.constraints?.required} error={!!fieldState.error || query.isError} helperText={query.isError ? "Unable to load permitted options. Try again later." : fieldState.error?.message ?? (!isUser && !target?.liveVerified ? "Related live schema is not verified." : needsOrganization && !organizationId ? "Choose an organization first." : "Search permitted records.")} />} />;
  }} />;
}
function SchemaInput({ field, resource, control, disabled, organizationId }: InputProps) {
  if (relationFor(resource, field.name)) return <ReferenceInput {...{ field, resource, control, disabled, organizationId }} />;
  const isBoolean = field.type === "boolean";
  const productChoiceLabels: Record<string, Record<string, string>> = {
    barcode_type: { code128: "Code 128", ean13: "EAN-13", upca: "UPC-A", ean8: "EAN-8", code39: "Code 39" },
    type: { standard: "Standard", kit: "Kit", assembly: "Assembly" },
    tracking_type: { none: "No tracking", batch: "Batch tracking", serial: "Serial number tracking" },
  };
  const options = isBoolean ? [{ value: "true", label: "Yes" }, { value: "false", label: "No" }] : field.constraints?.enum?.map(value => ({ value: String(value), label: resource.name === "products" ? productChoiceLabels[field.name]?.[String(value)] ?? String(value) : String(value) }));
  const type = ["integer", "number"].includes(field.type) ? "number" : field.type === "date" ? "date" : field.type === "datetime" ? "datetime-local" : field.name.includes("email") ? "email" : field.name.includes("phone") ? "tel" : field.name === "website" ? "url" : "text";
  return <Controller name={field.name} control={control} render={({ field: input, fieldState }) => <TextField fullWidth {...input} value={isBoolean && typeof input.value === "boolean" ? String(input.value) : input.value ?? ""} onChange={event => input.onChange(isBoolean ? event.target.value === "" ? null : event.target.value === "true" : event.target.value)}
    label={fieldLabel(field.name)} type={type} required={field.constraints?.required} disabled={disabled} select={!!options} multiline={["description", "notes", "address", "billing_address", "shipping_address"].includes(field.name)} minRows={field.name.includes("description") || field.name === "notes" ? 3 : undefined}
    error={!!fieldState.error} helperText={fieldState.error?.message ?? (resource.name === "products" && field.name === "reorder_point" || resource.name === "products" && field.name === "reorder_quantity" ? "Leave blank to disable automatic replenishment." : field.type === "number" ? "Use a decimal value. Server validation is authoritative." : undefined)}
    slotProps={{ htmlInput: { maxLength: field.constraints?.maxLength, min: field.constraints?.minimum, max: field.constraints?.maximum, step: field.type === "integer" ? 1 : field.type === "number" ? "any" : undefined, inputMode: field.type === "number" ? "decimal" : undefined }, inputLabel: ["date", "datetime"].includes(field.type) ? { shrink: true } : undefined }}>
    {options && [!field.constraints?.required && <MenuItem key="empty" value="">{resource.name === "products" && field.name === "barcode_type" ? "Detect automatically" : "Not specified"}</MenuItem>, ...options.map(option => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)]}
  </TextField>} />;
}

const productFormSections = [
  { title: "Basic information", fields: ["organization_id", "name", "sku", "type", "barcode", "barcode_type", "description"] },
  { title: "Pricing", fields: ["currency", "purchase_price", "price"] },
  { title: "Replenishment and classification", fields: ["min_stock", "reorder_point", "reorder_quantity", "category_id", "location_id", "tracking_type", "is_active"] },
  { title: "Notes", fields: ["notes"] },
] as const;

function MasterForm({ resource, module, action, record }: { resource: ErpResource; module: ErpModule; action: "create" | "edit"; record?: ErpRecord }) {
  const fields = useMemo(() => editableFields(resource, action), [resource, action]);
  const defaults = useMemo(() => {
    const values = initialValues(fields, record);
    // The source create form asks for these values rather than silently
    // accepting database defaults of zero. Existing records keep their value.
    if (resource.name === "products" && action === "create") { values.price = ""; values.min_stock = ""; }
    return values;
  }, [fields, record, resource.name, action]);
  const { control, handleSubmit, setValue, formState: { isDirty, isSubmitting } } = useForm<Record<string, unknown>>({ defaultValues: defaults });
  const selectedOrganization = useWatch({ control, name: "organization_id" });
  const organizationId = record?.organization_id ? String(record.organization_id) : selectedOrganization ? String(selectedOrganization) : undefined;
  const previousOrganization = useRef(organizationId);
  useEffect(() => {
    if (previousOrganization.current !== organizationId) {
      for (const field of fields) {
        const target = relationFor(resource, field.name)?.reference.resource;
        if (target && getErpResource(target)?.schema.fields.some(item => item.name === "organization_id")) setValue(field.name, null, { shouldDirty: true });
      }
      previousOrganization.current = organizationId;
    }
  }, [organizationId, fields, resource, setValue]);
  const { can } = useCanWithoutCache();
  const blocker = writeBlocker(resource, action === "create" ? "create" : "update");
  const create = useCreate<ErpRecord, never, Record<string, unknown>>();
  const update = useUpdate<ErpRecord, never, Record<string, unknown>>();
  const provider = useDataProvider();
  const command = useCustomMutation();
  const navigate = useNavigate();
  const { open } = useNotification();
  const { setWarnWhen } = useWarnAboutChange();
  const [message, setMessage] = useState("");
  const [uncertain, setUncertain] = useState(false);
  const [checking, setChecking] = useState(false);
  const [discard, setDiscard] = useState(false);
  const submitted = useRef<{ id: string; values: Record<string, unknown> }>();
  const inFlight = useRef(false);
  const busy = isSubmitting || checking || create.mutation.isPending || update.mutation.isPending;
  useEffect(() => { setWarnWhen?.(isDirty || uncertain); return () => setWarnWhen?.(false); }, [isDirty, uncertain, setWarnWhen]);
  const readback = async (verifiedRow?: ErpRecord) => {
    const request = submitted.current;
    if (!request) return;
    const data = verifiedRow ?? (resource.name === "products"
      ? productRecord((await command.mutateAsync({ url: PRODUCT_COMMAND, method: "post", dataProviderName: "app", meta: PRODUCT_COMMAND_META,
        values: { action: "readback", organization_id: request.values.organization_id, request_id: request.id }, successNotification: false, errorNotification: false })).data)
      : (await provider().getOne<ErpRecord>({ resource: resource.name, id: request.id })).data);
    verifyReadback(resource, request.id, { ...request.values, ...(resource.name === "products" && request.values.price !== undefined ? { selling_price: request.values.price } : {}) }, data);
    if (resource.name === "products" && data.deleted_at) throw new Error("Product was removed");
    setWarnWhen?.(false);
    open?.({ type: "success", message: "Record saved", description: "The saved fields were verified from a fresh Taruvi read." });
    navigate(`${module.path}/show/${encodeURIComponent(request.id)}`);
  };
  const save = async (raw: Record<string, unknown>) => {
    if (inFlight.current || uncertain || blocker) return;
    setMessage("");
    let values: Record<string, unknown>;
    try { values = normalizeValues(fields, raw); } catch (error) { setMessage(error instanceof Error ? error.message : "Check the form fields."); return; }
    const id = record?.id ?? crypto.randomUUID();
    inFlight.current = true;
    try {
      const proposed = { ...(record ?? {}), ...values, id };
      const decision = await can?.({ resource: `datatable:${resource.name}`, action: action === "create" ? "create" : "update", params: proposed });
      if (!decision?.can) { setMessage("You do not have permission to save these values in the selected organization. No write was sent."); return; }
      submitted.current = { id, values: record?.organization_id ? { ...values, organization_id: record.organization_id } : values };
      if (resource.name === "products") {
        const { organization_id, ...attributes } = submitted.current.values;
        const response = await command.mutateAsync({ url: PRODUCT_COMMAND, method: "post", dataProviderName: "app", meta: PRODUCT_COMMAND_META,
          values: { action: action === "create" ? "create" : "update", organization_id, request_id: id, values: attributes }, successNotification: false, errorNotification: false });
        await readback(productRecord(response.data));
        return;
      }
      if (action === "create") await create.mutateAsync({ resource: resource.name, values: { id, ...values }, successNotification: false, errorNotification: false });
      else await update.mutateAsync({ resource: resource.name, id, values, mutationMode: "pessimistic", successNotification: false, errorNotification: false });
      await readback();
    } catch {
      if (submitted.current) {
        setUncertain(true);
        setMessage("Save could not be confirmed. Keep this request open and check the saved record before submitting again.");
      } else setMessage("Unable to verify your permission to save. No write was sent. Try again later.");
    } finally { inFlight.current = false; }
  };
  const checkSaved = async () => {
    if (inFlight.current) return;
    inFlight.current = true; setChecking(true);
    try { await readback(); } catch { setMessage("Save could not be confirmed. No second write was sent. Check again or contact your administrator with the request ID."); }
    finally { inFlight.current = false; setChecking(false); }
  };
  const cancel = () => { if (isDirty || uncertain) setDiscard(true); else navigate(module.path); };
  return <>
    <Stack spacing={3} component="form" onSubmit={handleSubmit(save)} noValidate>
      <Breadcrumb module={module} action={action === "create" ? "Create" : "Edit"} /><Typography variant="h2">{action === "create" ? "Create" : "Edit"} {resource.name === "products" ? "product" : module.label.toLowerCase()}</Typography>
      <Alert severity="info">{resource.name === "products" ? "Product catalogue details only. Opening stock, variants, suppliers and images require a verified server workflow and cannot be saved from this form. No stock balance will change here." : "Master data only. This form cannot change stock balances, post payments, approve transactions or change workflow status."}</Alert>
      {blocker && <Alert severity="warning">{blocker}</Alert>}
      {message && <Alert severity="error">{message}</Alert>}
      {uncertain && <Alert severity="warning">A write may have committed. Do not create a duplicate.<Typography variant="caption" component="p">Request ID: {submitted.current?.id}</Typography></Alert>}
      {resource.name === "products" ? productFormSections.map(section => {
        const sectionFields = section.fields.map(name => fields.find(field => field.name === name)).filter((field): field is ErpField => !!field);
        return sectionFields.length ? <Card key={section.title}><CardContent><Stack spacing={2}><Typography variant="h6">{section.title}</Typography>{sectionFields.map(field => <SchemaInput key={field.name} {...{ field, resource, control, organizationId }} disabled={busy || uncertain} />)}</Stack></CardContent></Card> : null;
      }) : <Card><CardContent><Stack spacing={2}><Typography variant="h6">Record details</Typography>{fields.map(field => <SchemaInput key={field.name} {...{ field, resource, control, organizationId }} disabled={busy || uncertain || !!blocker} />)}</Stack></CardContent></Card>}
      <Stack direction="row" justifyContent="flex-end" spacing={1.25}><Button variant="outlined" onClick={cancel} disabled={busy}>Cancel</Button>{uncertain ? <Button variant="contained" onClick={checkSaved} disabled={busy} startIcon={busy ? <CircularProgress size={16} /> : undefined}>Check saved record</Button> : <Button type="submit" variant="contained" disabled={busy || !!blocker} startIcon={busy ? <CircularProgress size={16} /> : undefined}>Save record</Button>}</Stack>
    </Stack>
    <Dialog open={discard} onClose={() => setDiscard(false)} aria-labelledby="erp-discard-title"><DialogTitle id="erp-discard-title">Discard record draft?</DialogTitle><DialogContent><DialogContentText>{uncertain ? "A save may already have committed. Closing this draft will not undo that save; keep the request ID for verification. " : "Unsaved record changes will be lost. "}This action cannot be undone.</DialogContentText></DialogContent><DialogActions><Button onClick={() => setDiscard(false)}>Keep draft</Button><Button color="error" onClick={() => { setWarnWhen?.(false); navigate(module.path); }}>Discard draft</Button></DialogActions></Dialog>
  </>;
}

function MasterDelete({ resource, record, onDeleted }: { resource: ErpResource; record: ErpRecord; onDeleted: () => void }) {
  const { data: access } = useCan({ resource: `datatable:${resource.name}`, action: "delete", params: record });
  const { can } = useCanWithoutCache();
  const command = useCustomMutation();
  const update = useUpdate<ErpRecord, never, Record<string, unknown>>();
  const provider = useDataProvider();
  const { open } = useNotification();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [message, setMessage] = useState("");
  const inFlight = useRef(false);
  const deletionTime = useRef<string>();
  const noun = resource.name === "products" ? "product" : resource.name === "customers" ? "customer" : "supplier";
  const title = noun[0].toUpperCase() + noun.slice(1);
  const scope = resource.name === "products" ? "active catalogue" : `active ${noun} list`;
  const blocked = !["products", "customers", "suppliers"].includes(resource.name) || !!writeBlocker(resource, "delete") || !!record.deleted_at;
  const remove = async (checkOnly = false) => {
    if (blocked || inFlight.current || (uncertain && !checkOnly)) return;
    inFlight.current = true; setBusy(true); setMessage("");
    let sent = false;
    try {
      const decision = await can?.({ resource: `datatable:${resource.name}`, action: checkOnly ? "read" : "delete", params: record });
      if (!decision?.can) { setMessage(checkOnly ? "You do not have permission to check this record. No second delete was sent." : "You do not have permission to delete this record. No write was sent."); return; }
      const checkRecord = async () => {
        const { data: saved } = await provider().getOne<ErpRecord>({ resource: resource.name, id: record.id });
        verifyReadback(resource, record.id, { organization_id: record.organization_id, is_active: false }, saved);
        if (typeof saved.deleted_at !== "string" || !saved.deleted_at || !Number.isFinite(Date.parse(saved.deleted_at)) ||
          (deletionTime.current && Date.parse(saved.deleted_at) !== Date.parse(deletionTime.current))) throw new Error("Deletion unconfirmed");
      };
      if (checkOnly) await checkRecord();
      else if (resource.name === "products") {
        sent = true;
        const response = await command.mutateAsync({ url: PRODUCT_COMMAND, method: "post", dataProviderName: "app", meta: PRODUCT_COMMAND_META,
          values: { action: "delete", organization_id: record.organization_id, request_id: record.id }, successNotification: false, errorNotification: false });
        const envelope = productEnvelope(response.data);
        if (envelope.deleted !== true || envelope.id !== record.id) throw new Error("Deletion unconfirmed");
      } else {
        const values = { deleted_at: new Date().toISOString(), is_active: false };
        const updateAccess = await can?.({ resource: `datatable:${resource.name}`, action: "update", params: { ...record, ...values } });
        if (!updateAccess?.can) { setMessage("You do not have permission to update this record. No write was sent."); return; }
        deletionTime.current = values.deleted_at;
        sent = true;
        await update.mutateAsync({ resource: resource.name, id: record.id, values, mutationMode: "pessimistic", invalidates: ["list", "many"], successNotification: false, errorNotification: false });
        const readAccess = await can?.({ resource: `datatable:${resource.name}`, action: "read", params: record });
        if (!readAccess?.can) throw new Error("Readback permission unavailable");
        await checkRecord();
      }
      setConfirm(false); setUncertain(false);
      open?.({ type: "success", message: `${title} removed`, description: `Removed from the ${scope}. Linked history is retained.` });
      onDeleted();
    } catch {
      if (sent) setUncertain(true);
      setMessage(sent || checkOnly ? "Deletion could not be confirmed. Check the saved record; no second delete will be sent." : "Permission could not be checked. No write was sent.");
    } finally { inFlight.current = false; setBusy(false); }
  };
  if (blocked || !access?.can) return null;
  return <><Button color="error" variant="outlined" onClick={() => setConfirm(true)}>Delete {noun}</Button>
    <Dialog open={confirm} onClose={() => { if (!busy) setConfirm(false); }} aria-labelledby="master-delete-title">
      <DialogTitle id="master-delete-title">Delete {String(record.name ?? noun)}?</DialogTitle>
      <DialogContent><DialogContentText>This removes {String(record.name ?? `this ${noun}`)} from the {scope}. Linked history is retained and stock balances are not changed. This action cannot be undone.</DialogContentText>{message && <Alert severity="error">{message}</Alert>}</DialogContent>
      <DialogActions><Button disabled={busy} onClick={() => setConfirm(false)}>Cancel</Button><Button color="error" disabled={busy} startIcon={busy ? <CircularProgress size={16} /> : undefined} onClick={() => void remove(uncertain)}>{uncertain ? "Check saved record" : `Delete ${noun}`}</Button></DialogActions>
    </Dialog></>;
}

function Detail({ resource, module, id, edit }: { resource: ErpResource; module: ErpModule; id: string; edit: boolean }) {
  const { result: record, query } = useOne<ErpRecord>({ resource: resource.name, id, queryOptions: ERP_QUERY_OPTIONS });
  const { data: access } = useCan({ resource: `datatable:${resource.name}`, action: "update", params: { id } });
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showMoreRelations, setShowMoreRelations] = useState(false);
  const related = useMemo(() => {
    const items = erpResources.flatMap(item => item.liveVerified ? (item.schema.foreignKeys ?? []).filter(relation => logicalResource(relation.reference.resource) === resource.name && relation.fields.length === 1).map(relation => ({ resource: item, field: relation.fields[0] })) : []);
    const priority = ["product_location_stocks", "product_supplier", "product_variants", "product_components", "supplier_price_history", "stock_adjustments"];
    return resource.name === "products" ? items.sort((a, b) => (priority.includes(a.resource.name) ? priority.indexOf(a.resource.name) : 100) - (priority.includes(b.resource.name) ? priority.indexOf(b.resource.name) : 100)) : items;
  }, [resource]);
  const [counts, setCounts] = useState<Record<string, number | undefined>>({});
  if (query.isLoading) return <Loading label={`Loading ${module.label.toLowerCase()} record`} />;
  if (query.isError || !record) return <Stack spacing={2}><Breadcrumb module={module} action="Record" /><Alert severity="error" action={<Button onClick={() => query.refetch()}>Try again</Button>}>Unable to load this record. Check your access or return to the list.</Alert><Button component={RouterLink} to={module.path}>Back to {module.label.toLowerCase()}</Button></Stack>;
  if (["products", "customers", "suppliers"].includes(resource.name) && record.deleted_at) return <Stack spacing={3}><Breadcrumb module={module} action="Removed record" /><Typography variant="h2">{String(record.name ?? "Product")} - Removed</Typography><Alert severity="info">Removed from the active list. Linked history is retained. This record cannot be edited.</Alert><Button component={RouterLink} to={module.path}>Back to list</Button></Stack>;
  if (edit) return editableFields(resource, "edit").length ? <MasterForm key={id} {...{ resource, module, record }} action="edit" /> : <Blocked module={module} resource={resource} />;
  const status = resource.schema.fields.find(field => field.name === "status" || field.name === "is_active");
  const title = String(record[labelField(resource)] ?? record.id);
  const overviewFields = resource.name === "products"
    ? visibleFields(resource).filter(field => ["name", "sku", "is_active", "category_id", "location_id", "type", "tracking_type", "has_variants", "description", "notes", "currency", "stock", "selling_price", "purchase_price", "min_stock", "max_stock", "reorder_point", "reorder_quantity", "updated_at"].includes(field.name))
    : businessSections(resource).flatMap(section => section.fields);
  const scalarFields = [...new Map(overviewFields.filter(field => !["any", "object", "array"].includes(field.type) && !["id", "organization_id"].includes(field.name)).map(field => [field.name, field])).values()];
  const referenceFields = scalarFields.filter(field => relationFor(resource, field.name));
  return <RecordReferences resource={resource} rows={[record]} fields={referenceFields}>{references => <Stack spacing={3}>
    <Breadcrumb module={module} action={title} />
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}><Stack direction="row" alignItems="center" spacing={2}><Typography variant="h2">{title}</Typography>{status && <Status field={status} value={record[status.name]} />}</Stack><Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">{!writeBlocker(resource, "update") && access?.can && <Button component={RouterLink} to={`${module.path}/edit/${encodeURIComponent(id)}`} startIcon={<EditRoundedIcon />} variant="contained">Edit</Button>}<MasterDelete resource={resource} record={record} onDeleted={() => { void query.refetch(); }} /><Button startIcon={<RefreshRoundedIcon />} onClick={() => query.refetch()} disabled={query.isFetching}>Refresh</Button><Button component={RouterLink} to={module.path}>Back to list</Button></Stack></Stack>
    <Typography variant="body2" color="text.secondary">Record {id}{record.created_at ? ` - Created ${displayValue({ name: "created_at", type: "datetime" }, record.created_at)}` : ""}</Typography>
    {writeBlocker(resource, "update") && <Alert severity="info">{writeBlocker(resource, "update")}</Alert>}
    <Box component="section" aria-label="Record overview">
      {resource.name === "products" ? <ProductOverview record={record} /> : <ModuleRecordOverview resource={resource} record={record} referenceLabel={references.label} context={{ currency: rowCurrency(record, references) }} />}
    </Box>
    {!query.isFetching && <RecordExportActions title={`${module.label}: ${title}`} columns={scalarFields.map(field => ({ key: field.name, label: fieldLabel(field.name) }))} rows={[exportValues(resource, scalarFields, record, references)]} scopeLabel="Current record only; related sections are not included" filename={`${resource.name}-${id}`} />}
    {related.length > 0 && <Box component="section" aria-labelledby="related-records-heading"><Typography variant="h3" id="related-records-heading" sx={{ mb: 2 }}>Related records</Typography><Typography color="text.secondary" sx={{ mb: 2 }}>Expand a section to load permitted records. Counts remain unknown until loaded.</Typography>
      {related.map(item => {
        if (resource.name === "products" && !showMoreRelations && !primaryProductRelation(record, item.resource.name, item.field)) return null;
        const key = `${item.resource.name}:${item.field}`;
        const label = `${item.resource.name === "product_location_stocks" ? "Stock by location" : item.resource.name === "product_supplier" ? "Suppliers" : item.resource.title}${related.filter(other => other.resource.name === item.resource.name).length > 1 ? ` - ${fieldLabel(item.field)}` : ""}`;
        const onCount = (total: number | undefined) => setCounts(current => current[key] === total ? current : { ...current, [key]: total });
        const open = expanded[key] === true;
        return <Accordion key={key} expanded={open} onChange={(_, value) => { setExpanded(current => ({ ...current, [key]: value })); if (!value) onCount(undefined); }} disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} id={`relation-${item.resource.name}-${item.field}-heading`} aria-controls={`relation-${item.resource.name}-${item.field}-content`}><Typography fontWeight={600}>{label} ({counts[key] ?? "Count unknown"})</Typography></AccordionSummary>
          <AccordionDetails id={`relation-${item.resource.name}-${item.field}-content`}>
            {open && (resource.name === "products" && ["product_location_stocks", "product_supplier"].includes(item.resource.name)
              ? <InventoryRelated kind={item.resource.name === "product_supplier" ? "suppliers" : "stock"} record={record} onCount={onCount} />
              : <RelatedRecords {...item} parentId={id} active onCount={onCount} />)}
          </AccordionDetails>
        </Accordion>;
      })}
      {resource.name === "products" && related.some(item => !primaryProductRelation(record, item.resource.name, item.field)) && <Button variant="text" aria-expanded={showMoreRelations} onClick={() => {
        if (showMoreRelations) {
          setExpanded(current => Object.fromEntries(Object.entries(current).filter(([key]) => related.some(item => `${item.resource.name}:${item.field}` === key && primaryProductRelation(record, item.resource.name, item.field)))));
          setCounts({});
        }
        setShowMoreRelations(value => !value);
      }}>{showMoreRelations ? "Less related data" : "More related data"}</Button>}
    </Box>}
  </Stack>}</RecordReferences>;

}
function RelatedRecords({ resource, field, parentId, active, onCount }: { resource: ErpResource; field: string; parentId: string; active: boolean; onCount: (total: number | undefined) => void }) {
  const permanent = useMemo<CrudFilters>(() => [{ field, operator: "eq", value: parentId }], [field, parentId]);
  const registered = ERP_MODULES.find(item => item.resource === resource.name);
  const module: ErpModule = registered ?? { key: resource.name, label: resource.title, path: "", group: "Workspace", kind: "data", description: "Related records" };
  return active ? <RecordList {...{ resource, module, onCount }} parentFilters={permanent} related /> : null;
}
function Blocked({ module, resource }: { module: ErpModule; resource: ErpResource }) {
  return <Stack spacing={3}><Breadcrumb module={module} /><Typography variant="h2">{module.label}</Typography><Alert severity="warning">{writeBlocker(resource)}</Alert><Button component={RouterLink} to={module.path}>View records</Button></Stack>;
}
export function ErpModulePage({ moduleKey, action: requestedAction }: { moduleKey: string; action?: Action }) {
  const module = getErpModule(moduleKey);
  const location = useLocation();
  const { id } = useParams();
  const action = requestedAction ?? (location.pathname.endsWith("/create") ? "create" : location.pathname.includes("/edit/") ? "edit" : location.pathname.includes("/show/") ? "show" : "list");
  const resource = useMemo(() => getErpResource(module?.resource), [module?.resource]);
  if (moduleKey === "reports" && action === "list" && new URLSearchParams(location.search).get("view") !== "definitions") return <ReportsWorkspace />;
  if (moduleKey === "users" || moduleKey === "roles") return <NativeManagementPage kind={moduleKey} />;
  if (moduleKey === "notifications") return <NotificationsPage action={action} id={id} />;
  if (moduleKey === "approvals") return <ApprovalsPage renderList={(queueResource, queueModule, filters) => <RecordList key={queueResource.name} resource={queueResource} module={queueModule} parentFilters={filters} related />} />;
  if (!module) return <PageContainer><Alert severity="error">Module not found.</Alert></PageContainer>;
  if (!resource || !resource.liveVerified) return <PageContainer><Stack spacing={3}><Breadcrumb module={module} /><Typography variant="h2">{module.label}</Typography><Typography>{module.description}</Typography><Alert severity="info">The live schema or native service has not been verified for this module. No business requests are sent from this page yet.</Alert><Typography variant="body2">This module remains in scope. Its workflow will become available after the backend contract and permissions are confirmed.</Typography><Button component={RouterLink} to="/">Back to dashboard</Button></Stack></PageContainer>;
  if (resource.name === "purchase_orders" && action === "create") return <PurchaseOrderWorkspace />;
  if (resource.name === "orders" && action === "create") return <OrderCreateWorkspace />;
  if (resource.name === "return_orders" && action === "create") return <ReturnCreateWorkspace />;
  return <PageContainer>{action === "create" ? editableFields(resource, "create").length ? <MasterForm {...{ module, resource }} action="create" /> : <Blocked {...{ module, resource }} /> : (action === "edit" || action === "show") && id ? <Detail key={`${resource.name}:${id}:${action}`} {...{ module, resource, id }} edit={action === "edit"} /> : resource.name === "products" ? <InventoryList {...{ resource, module }} /> : <RecordList key={resource.name} {...{ resource, module }} />}</PageContainer>;
}
