import { useEffect, useMemo, useRef, useState } from "react";
import { useList, type CrudFilters, type CrudSorting } from "@refinedev/core";
import { Link } from "react-router";
import { QRCode } from "antd";
import JsBarcode from "jsbarcode";
import { useTheme } from "@mui/material/styles";
import { Alert as MAlert, Autocomplete as MAutocomplete, Box as MBox, Breadcrumbs as MBreadcrumbs, Button as MButton, Card as MCard, CardContent as MCardContent, Chip as MChip, IconButton as MIconButton, InputAdornment as MInputAdornment, LinearProgress as MLinearProgress, Link as MLink, MenuItem as MMenuItem, Skeleton as MSkeleton, Stack as MStack, Table as MTable, TableBody as MTableBody, TableCell as MTableCell, TableHead as MTableHead, TablePagination as MTablePagination, TableRow as MTableRow, TableSortLabel as MTableSortLabel, TextField as MTextField, Tooltip as MTooltip, Typography as MTypography } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import ImageNotSupportedRoundedIcon from "@mui/icons-material/ImageNotSupportedRounded";
import { RecordExportActions } from "../../components/RecordExportActions";
import { ProductThumb } from "../../components/ProductThumb";
import { useRecordNames as useNames, recordIds as idsFor } from "../../hooks/useRecordNames";
import { useInventoryAuthority } from "../../hooks/useInventoryAuthority";
import { PrivateProductImage } from "../../components/PrivateProductImage";
import type { ErpModule } from "../../erp/modules";
import { ERP_QUERY_OPTIONS, displayValue, getErpResource, writeBlocker, type ErpRecord, type ErpResource } from "../../services/erp";
import { presentationValue } from "../../services/erpPresentation";
import { formatMoney } from "../../services/commercePresentation";
import { barcodeIdentity, finiteNumber, inventoryFilters, inventoryMetrics, inventoryAuthorityRecord, money, productImageUrl, stockLocationChart } from "../../services/inventory";

const text = (value: unknown) => typeof value === "string" && value.trim() ? value : "Not available";
const ORG_PAGE = { mode: "server" as const, currentPage: 1, pageSize: 100 };
const isTestOrganization = (row: ErpRecord) => typeof row.settings === "object" && row.settings !== null && (row.settings as Record<string, unknown>).dataset_kind === "test";

function stockState(stock: number | null, minimum: number | null): { label: string; color: "success" | "warning" | "error" | "default" } {
  if (stock === null) return { label: "Not tracked", color: "default" };
  if (stock <= 0) return { label: "Out of stock", color: "error" };
  if (minimum !== null && stock <= minimum) return { label: "Low stock", color: "warning" };
  return { label: "In stock", color: "success" };
}

export function InventoryList({ resource, module }: { resource: ErpResource; module: ErpModule }) {
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const [active, setActive] = useState("");
  const [category, setCategory] = useState<ErpRecord | null>(null);
  const [categoryInput, setCategoryInput] = useState("");
  const [categoryTerm, setCategoryTerm] = useState("");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [sorters, setSorters] = useState<CrudSorting>([{ field: "name", order: "asc" }]);
  useEffect(() => { const timer = window.setTimeout(() => { setPage(1); setTerm(search); }, 350); return () => window.clearTimeout(timer); }, [search]);
  useEffect(() => { const timer = window.setTimeout(() => setCategoryTerm(categoryInput.trim()), 300); return () => window.clearTimeout(timer); }, [categoryInput]);
  // Business workspaces only: organizations labelled as test data stay out of the catalogue.
  const organizations = useList<ErpRecord>({ resource: "organizations", pagination: ORG_PAGE, queryOptions: ERP_QUERY_OPTIONS, errorNotification: false });
  const businessOrgs = useMemo(() => (organizations.query.isError ? [] : organizations.result.data).filter(row => row.is_active !== false && !row.deleted_at && !isTestOrganization(row)).map(row => row.id), [organizations.result.data, organizations.query.isError]);
  const orgsReady = !organizations.query.isLoading && !organizations.query.isError;
  const filters = useMemo<CrudFilters>(() => [...inventoryFilters(term, active), ...(category ? [{ field: "category_id", operator: "eq" as const, value: category.id }] : []), ...(orgsReady && businessOrgs.length ? [{ field: "organization_id", operator: "in" as const, value: businessOrgs }] : [])], [term, active, category, orgsReady, businessOrgs]);
  const categoryFilters = useMemo<CrudFilters>(() => [{ field: "deleted_at", operator: "null", value: true }, ...(categoryTerm ? [{ field: "name", operator: "contains" as const, value: categoryTerm }] : []), ...(businessOrgs.length ? [{ field: "organization_id", operator: "in" as const, value: businessOrgs }] : [])], [categoryTerm, businessOrgs]);
  const categoryOptions = useList<ErpRecord>({ resource: "product_categories", filters: categoryFilters, pagination: { mode: "server", currentPage: 1, pageSize: 10 }, queryOptions: { ...ERP_QUERY_OPTIONS, enabled: orgsReady }, errorNotification: false });
  // Refine owns the sole products request; it waits for the workspace scope.
  const { result, query } = useList<ErpRecord>({ resource: "products", filters, sorters, pagination: { currentPage: page, pageSize: size, mode: "server" }, queryOptions: { ...ERP_QUERY_OPTIONS, enabled: !organizations.query.isLoading }, errorNotification: false });
  const rawRows = query.isError ? [] : result.data;
  const authority = useInventoryAuthority(idsFor(rawRows, "organization_id"));
  const rows = rawRows.map(row => inventoryAuthorityRecord(row, authority.authorities[String(row.organization_id)]));
  const categories = useNames("product_categories", idsFor(rows, "category_id"));
  const locations = useNames("product_locations", idsFor(rows, "location_id"));
  const blocker = writeBlocker(resource, "create");
  const sortField = String(sorters[0]?.field ?? "name"); const sortOrder = sorters[0]?.order === "desc" ? "desc" : "asc";
  const sortBy = (field: string) => { setPage(1); setSorters([{ field, order: sortField === field && sortOrder === "asc" ? "desc" : "asc" }]); };
  const sellingLabel = (row: ErpRecord) => presentationValue(resource, { name: "selling_price", type: "number" }, row.selling_price, { currency: typeof row.currency === "string" ? row.currency : undefined });
  const clearAll = () => { setPage(1); setSearch(""); setActive(""); setCategory(null); setCategoryInput(""); };
  const filtered = !!(term.trim() || active || category);
  const empty = term.trim() ? "No results found" : filtered ? "No matching items" : "No products yet";
  return <MStack spacing={3}>
    <MBreadcrumbs><MLink component={Link} to="/">Workspace</MLink><MTypography color="text.primary" fontWeight={600}>Inventory</MTypography></MBreadcrumbs>
    <MStack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ md: "center" }} spacing={2}>
      <MBox><MTypography variant="h2">Inventory</MTypography><MTypography color="text.secondary">Stone catalogue, live stock and prices across your HMG Stones workspaces.</MTypography></MBox>
      <MStack direction="row" spacing={1}>
        <MTooltip title="Refresh"><span><MIconButton aria-label="Refresh" disabled={query.isFetching} onClick={() => { authority.refresh(); void query.refetch(); }}><RefreshRoundedIcon /></MIconButton></span></MTooltip>
        <MButton component={Link} to={`${module.path}/create`} variant="contained" startIcon={<AddRoundedIcon />}>Add product</MButton>
      </MStack>
    </MStack>
    {blocker && <MAlert severity="info">{blocker}</MAlert>}
    <MCard><MCardContent><MStack spacing={2}>
      <MStack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
        <MTextField size="small" label="Search products" placeholder="Name, SKU or barcode" value={search} onChange={event => setSearch(event.target.value)} sx={{ minWidth: 280 }} InputProps={{ startAdornment: <MInputAdornment position="start"><SearchRoundedIcon fontSize="small" /></MInputAdornment> }} />
        <MAutocomplete size="small" sx={{ minWidth: 220 }} options={categoryOptions.result.data} value={category} filterOptions={items => items} loading={categoryOptions.query.isFetching}
          getOptionLabel={row => text(row.name)} isOptionEqualToValue={(a, b) => a.id === b.id} onInputChange={(_, value, why) => { if (why === "input") setCategoryInput(value); }} onChange={(_, row) => { setPage(1); setCategory(row); }}
          renderInput={params => <MTextField {...params} label="Category" />} />
        <MTextField size="small" select label="Status" value={active} inputProps={{ "aria-label": "Filter active" }} sx={{ minWidth: 160 }} onChange={event => { setPage(1); setActive(event.target.value); }}>
          <MMenuItem value="">All statuses</MMenuItem><MMenuItem value="true">Active</MMenuItem><MMenuItem value="false">Inactive (catalogue)</MMenuItem>
        </MTextField>
        <MBox flex={1} />
        {!query.isFetching && !query.isError && rows.length > 0 && <RecordExportActions title="Inventory" columns={[{ key: "product", label: "Product / SKU / Category" }, { key: "location", label: "Location" }, { key: "stock", label: "On-hand stock" }, { key: "selling", label: "Selling price" }, { key: "status", label: "Status" }]} rows={rows.map(row => ({ product: `${text(row.name)} / ${text(row.sku)} / ${categories.label(row.category_id)}`, location: locations.label(row.location_id), stock: inventoryMetrics(row).stock?.toLocaleString() ?? "Not available", selling: sellingLabel(row), status: row.is_active === true ? "Active" : row.is_active === false ? "Inactive" : "Unknown" }))} scopeLabel="Current visible inventory page only; active filters applied" filename="inventory-current-page" />}
      </MStack>
      {filtered && <MStack direction="row" spacing={1} flexWrap="wrap" useFlexGap>{term.trim() && <MChip label={`Search: ${search}`} onDelete={() => setSearch("")} />}{category && <MChip label={`Category: ${text(category.name)}`} onDelete={() => { setPage(1); setCategory(null); }} />}{active && <MChip label={`Status: ${active === "true" ? "Active" : "Inactive"}`} onDelete={() => { setPage(1); setActive(""); }} />}<MButton size="small" onClick={clearAll}>Clear all filters</MButton></MStack>}
      {query.isFetching && !query.isLoading && <MLinearProgress aria-label="Refreshing products" />}
      {query.isError ? <MAlert severity="error" action={<MButton color="inherit" size="small" onClick={() => query.refetch()}>Try again</MButton>}><MTypography fontWeight={600}>Unable to load products</MTypography>Check your access or try again. No data has been changed.</MAlert> : <MBox sx={{ overflowX: "auto" }}>
        <MTable size="small" aria-label="Products">
          <MTableHead><MTableRow>
            <MTableCell sortDirection={sortField === "name" ? sortOrder : false}><MTableSortLabel active={sortField === "name"} direction={sortField === "name" ? sortOrder : "asc"} onClick={() => sortBy("name")}>Product</MTableSortLabel></MTableCell>
            <MTableCell>Category</MTableCell>
            <MTableCell align="right">On hand</MTableCell>
            <MTableCell align="right" sortDirection={sortField === "selling_price" ? sortOrder : false}><MTableSortLabel active={sortField === "selling_price"} direction={sortField === "selling_price" ? sortOrder : "asc"} onClick={() => sortBy("selling_price")}>Selling price</MTableSortLabel></MTableCell>
            <MTableCell>Status</MTableCell>
            <MTableCell align="right">Actions</MTableCell>
          </MTableRow></MTableHead>
          <MTableBody>
            {query.isLoading && [0, 1, 2, 3, 4].map(index => <MTableRow key={index}>{[0, 1, 2, 3, 4, 5].map(cell => <MTableCell key={cell}><MSkeleton /></MTableCell>)}</MTableRow>)}
            {!query.isLoading && rows.map(row => {
              const metrics = inventoryMetrics(row); const state = stockState(metrics.stock, finiteNumber(row.min_stock));
              return <MTableRow key={row.id} hover>
                <MTableCell><MStack direction="row" spacing={1.5} alignItems="center"><ProductThumb source={row.image} alt={text(row.name)} /><MBox sx={{ minWidth: 0 }}><MLink component={Link} to={`${module.path}/show/${encodeURIComponent(row.id)}`} underline="hover" fontWeight={600}>{text(row.name)}</MLink><MTypography variant="caption" color="text.secondary" display="block">{text(row.sku)}</MTypography></MBox></MStack></MTableCell>
                <MTableCell>{categories.label(row.category_id)}</MTableCell>
                <MTableCell align="right"><MTypography variant="body2" fontWeight={600} sx={{ fontVariantNumeric: "tabular-nums" }}>{metrics.stock?.toLocaleString() ?? "—"}</MTypography>{metrics.stock !== null && <MChip size="small" variant="outlined" color={state.color} label={state.label} sx={{ mt: .5 }} />}</MTableCell>
                <MTableCell align="right" sx={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{metrics.selling === null ? "—" : formatMoney(metrics.selling, typeof row.currency === "string" ? row.currency : "INR")}</MTableCell>
                <MTableCell><MChip size="small" color={row.is_active === true ? "success" : "default"} label={row.is_active === true ? "Active" : row.is_active === false ? "Catalogue" : "Unknown"} /></MTableCell>
                <MTableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                  <MTooltip title="View"><MIconButton size="small" component={Link} to={`${module.path}/show/${encodeURIComponent(row.id)}`} aria-label={`View ${text(row.name)}`}><VisibilityRoundedIcon fontSize="small" /></MIconButton></MTooltip>
                  {!blocker && <MTooltip title="Edit"><MIconButton size="small" component={Link} to={`${module.path}/edit/${encodeURIComponent(row.id)}`} aria-label={`Edit ${text(row.name)}`}><EditRoundedIcon fontSize="small" /></MIconButton></MTooltip>}
                </MTableCell>
              </MTableRow>;
            })}
          </MTableBody>
        </MTable>
        {!query.isLoading && !rows.length && <MStack alignItems="center" spacing={1} sx={{ py: 5 }}><Inventory2RoundedIcon color="disabled" sx={{ fontSize: 40 }} /><MTypography variant="h6">{empty}</MTypography><MTypography color="text.secondary">{filtered ? "Try adjusting your search or filters." : "Add your first product to start tracking stock."}</MTypography>{filtered ? <MButton onClick={clearAll}>Clear all filters</MButton> : <MButton component={Link} to={`${module.path}/create`} variant="contained" startIcon={<AddRoundedIcon />}>Add product</MButton>}</MStack>}
      </MBox>}
      {result.total === undefined && !query.isError && !query.isLoading && <MAlert severity="warning">Total count unavailable; pagination cannot be confirmed.</MAlert>}
      {result.total !== undefined && !query.isError && <MTablePagination component="div" count={result.total} page={page - 1} rowsPerPage={size} rowsPerPageOptions={[10, 20, 50, 100]} onPageChange={(_, value) => setPage(value + 1)} onRowsPerPageChange={event => { setPage(1); setSize(Number(event.target.value)); }} labelDisplayedRows={({ from, to, count }) => `${from}–${to} of ${count} products`} />}
    </MStack></MCardContent></MCard>
  </MStack>;
}

function ProductCodes({ record }: { record: ErpRecord }) {
  const identity = barcodeIdentity(record);
  const svg = useRef<SVGSVGElement>(null);
  const [barcodeError, setBarcodeError] = useState(false);
  const [qrMode, setQrMode] = useState("sku");
  useEffect(() => {
    setBarcodeError(false);
    if (!svg.current || !identity.format) return;
    try { JsBarcode(svg.current, identity.value, { format: identity.format, displayValue: true, height: 52, margin: 8, width: 1.5 }); }
    catch { setBarcodeError(true); }
  }, [identity.value, identity.format]);
  const qr = qrMode === "sku" ? typeof record.sku === "string" ? record.sku : "" : `${window.location.origin}/inventory/show/${encodeURIComponent(record.id)}`;
  return <MCard className="inventory-codes"><MCardContent><MStack spacing={1.5}>
    <MTypography variant="h6">Product identity</MTypography>
    <MTypography variant="body2" fontWeight={600}>{identity.preview ? "SKU barcode preview — not a saved physical barcode" : "Stored barcode"}</MTypography>
    {identity.format && !barcodeError ? <svg ref={svg} role="img" aria-label={`${identity.preview ? "SKU preview" : "Barcode"}: ${identity.value}`} style={{ maxWidth: "100%" }} /> : <MAlert severity="info">{identity.value ? `Barcode format is unavailable or unsupported; stored value: ${identity.value}` : "No barcode or SKU available."}</MAlert>}
    <MTextField className="inventory-no-print" size="small" select label="QR code content" value={qrMode} onChange={event => setQrMode(event.target.value)}><MMenuItem value="sku">QR: SKU</MMenuItem><MMenuItem value="link">QR: Product link</MMenuItem></MTextField>
    {qr && qr.length <= 1024 ? <div aria-label={`QR code for ${qrMode === "sku" ? "SKU" : "product link"}`}><QRCode type="svg" value={qr} size={144} bordered={false} /></div> : <MTypography>QR content unavailable</MTypography>}
    <MTypography variant="caption" color="text.secondary">{qrMode === "link" ? "Product link requires an authorized app session." : "Encodes the SKU only."} Preview and print do not save or assign a code.</MTypography>
    <MButton className="inventory-no-print" variant="outlined" startIcon={<PrintRoundedIcon />} onClick={() => window.print()}>Print product identity</MButton>
  </MStack></MCardContent>
    <style>{`@media print { body * { visibility: hidden !important; } body:not(:has(.hmg-export-document)) .inventory-codes, body:not(:has(.hmg-export-document)) .inventory-codes * { visibility: visible !important; } .inventory-codes { position: absolute; inset: 0 auto auto 0; width: 100%; box-shadow: none; } .inventory-no-print, .inventory-no-print * { display: none !important; } }`}</style>
  </MCard>;
}

function ProductMedia({ record }: { record: ErpRecord }) {
  const url = productImageUrl(record.image) ?? productImageUrl(record.thumbnail);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [url]);
  const privateImage = typeof record.image === "string" && record.image.startsWith("storage://");
  return <MCard><MCardContent>
    {privateImage ? <ProductThumb source={record.image} alt={text(record.name)} fill />
      : url && !failed ? <MBox component="img" src={url} alt={text(record.name)} onError={() => setFailed(true)} loading="lazy" referrerPolicy="no-referrer" sx={{ width: "100%", height: 280, objectFit: "contain", borderRadius: 2, bgcolor: "action.hover" }} />
        : <MStack alignItems="center" justifyContent="center" spacing={1} sx={{ height: 200, bgcolor: "action.hover", borderRadius: 2 }}><ImageNotSupportedRoundedIcon color="disabled" fontSize="large" /><MTypography variant="body2" color="text.secondary">{failed ? "Product image could not be loaded" : "No verified product image available"}</MTypography></MStack>}
  </MCardContent></MCard>;
}

function DetailGrid({ items }: { items: { label: string; value: string; wide?: boolean }[] }) {
  return <MBox sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
    {items.map(item => <MBox key={item.label} sx={{ gridColumn: item.wide ? "1 / -1" : undefined, minWidth: 0 }}><MTypography variant="caption" color="text.secondary">{item.label}</MTypography><MTypography variant="body2" sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{item.value}</MTypography></MBox>)}
  </MBox>;
}

export function ProductOverview({ record }: { record: ErpRecord }) {
  const authority = useInventoryAuthority(idsFor([record], "organization_id"));
  const projected = inventoryAuthorityRecord(record, authority.authorities[String(record.organization_id)]);
  const metrics = inventoryMetrics(projected);
  const categories = useNames("product_categories", idsFor([record], "category_id"));
  const locations = useNames("product_locations", idsFor([record], "location_id"));
  const minimum = finiteNumber(record.min_stock);
  const stockStatus = metrics.stock === null ? "Stock not confirmed" : metrics.stock <= 0 ? "Out of stock" : minimum !== null && metrics.stock <= minimum ? "Low stock" : "In stock";
  const stockTone = metrics.stock === null ? undefined : metrics.stock <= 0 ? "error.main" : minimum !== null && metrics.stock <= minimum ? "warning.main" : "success.main";
  const tiles: [string, string, string, string | undefined][] = [
    ["On-hand stock", metrics.stock?.toLocaleString() ?? "Not available", record.has_variants === true ? "Variant totals require a verified aggregate" : stockStatus, stockTone],
    ["Selling price", money(metrics.selling, record.currency), "Per unit", undefined],
    ["Purchase cost", money(metrics.purchase, record.currency), "Per unit", undefined],
    ["Indicative selling value", money(metrics.value, record.currency), "On hand × selling price", undefined],
  ];
  return <MStack spacing={3}>
    <MTypography variant="caption" color="text.secondary">{projected.stock_projection === "ledger_v2" ? "Stock from the verified ledger" : projected.stock_projection === "legacy" ? "Legacy native stock" : "Stock authority unavailable"}</MTypography>
    {metrics.catalogue && projected.stock_projection !== "ledger_v2" && <MAlert severity="info">Catalogue reference: this website catalogue entry is not a physical slab record. Verify prices and quantities before operational use.</MAlert>}
    <MBox sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", xl: "repeat(4, 1fr)" } }}>
      {tiles.map(([title, value, note, tone]) => <MCard key={title}><MCardContent><MTypography variant="body2" color="text.secondary">{title}</MTypography><MTypography variant="h3" component="p" sx={{ my: 1, fontVariantNumeric: "tabular-nums", color: tone }}>{value}</MTypography><MTypography variant="caption" color="text.secondary">{note}</MTypography></MCardContent></MCard>)}
    </MBox>
    <MBox sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, alignItems: "start" }}>
      <MStack spacing={3}>
        <MCard><MCardContent><MStack spacing={2}><MTypography variant="h6">Product overview</MTypography><DetailGrid items={[
          { label: "SKU", value: text(record.sku) }, { label: "Category", value: categories.label(record.category_id) },
          { label: "Default location", value: locations.label(record.location_id) }, { label: "Product type", value: text(record.type) },
          { label: "Tracking", value: text(record.tracking_type) }, { label: "Variants", value: record.has_variants === true ? "Variant managed" : record.has_variants === false ? "No variants" : "Not available" },
          { label: "Description", value: text(record.description), wide: true }, { label: "Notes", value: text(record.notes), wide: true },
        ]} /></MStack></MCardContent></MCard>
        <MCard><MCardContent><MStack spacing={2}><MTypography variant="h6">Pricing and replenishment</MTypography><DetailGrid items={[
          { label: "Currency", value: text(record.currency) }, { label: "Indicative gross margin", value: metrics.margin === null ? "Not available" : `${metrics.margin.toFixed(1)}%` },
          ...["min_stock", "max_stock", "reorder_point", "reorder_quantity"].map(field => ({ label: ({ min_stock: "Minimum stock", max_stock: "Maximum stock", reorder_point: "Reorder point", reorder_quantity: "Reorder quantity" } as Record<string, string>)[field], value: finiteNumber(record[field])?.toLocaleString() ?? "Not available" })),
          { label: "Last updated", value: displayValue({ name: "updated_at", type: "datetime" }, record.updated_at) },
        ]} /><MTypography variant="caption" color="text.secondary">On-hand stock includes reserved slabs. See Stock by location below, or Stock by warehouse, for free quantities.</MTypography></MStack></MCardContent></MCard>
      </MStack>
      <MStack spacing={3}><ProductMedia record={record} /><ProductCodes record={record} /></MStack>
    </MBox>
  </MStack>;
}

/** Accessible page-scoped bars; the stock table below remains the exact-value fallback. */
function LocationStockChart({ rows, total, label }: { rows: ErpRecord[]; total: number | undefined; label: (id: unknown) => string }) {
  const theme = useTheme();
  const chart = stockLocationChart(rows, total);
  const max = Math.max(1, ...chart.points.map(point => Math.abs(point.quantity)));
  const signed = chart.points.some(point => point.quantity < 0);
  const origin = signed ? 250 : 0;
  const width = signed ? 250 : 500;
  const summary = chart.points.map(point => `${label(point.location)}: ${point.quantity.toLocaleString()}`).join("; ");
  return <MCard variant="outlined"><MCardContent><MStack spacing={1.5}>
    <MBox><MTypography variant="subtitle1" component="h4">{chart.complete ? "All accessible recorded locations" : "Locations on this page"}</MTypography>
      <MTypography variant="caption" color="text.secondary">On-hand quantity per location. Exact values are in the table below.</MTypography></MBox>
    {chart.omitted > 0 && <MTypography variant="body2" color="text.secondary">Some location quantities cannot be charted; see the table for unavailable or duplicate records.</MTypography>}
    {chart.points.length > 0 ? <div role="img" aria-label={`Location quantities: ${summary}`}>
      {chart.points.map(point => {
        const bar = Math.abs(point.quantity) / max * width;
        return <MBox key={point.id} sx={{ mt: 1.5 }}>
          <MStack direction="row" justifyContent="space-between" spacing={2}><MTypography variant="body2" sx={{ overflowWrap: "anywhere" }}>{label(point.location)}</MTypography><MTypography variant="body2" fontWeight={600} sx={{ flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{point.quantity.toLocaleString()}</MTypography></MStack>
          <svg aria-hidden="true" viewBox="0 0 500 16" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 16, marginTop: 4 }}>
            <rect x={0} y={2} width={500} height={12} rx={6} fill={theme.palette.action.hover} />
            {signed && <line x1={origin} x2={origin} y1={0} y2={16} stroke={theme.palette.divider} />}
            <rect x={point.quantity < 0 ? origin - bar : origin} y={2} width={bar} height={12} rx={6} fill={point.quantity < 0 ? theme.palette.error.main : theme.palette.primary.main} />
          </svg>
        </MBox>;
      })}
    </div> : <MTypography variant="body2">No valid quantities available to chart.</MTypography>}
  </MStack></MCardContent></MCard>;
}

type RelatedColumn = { key: string; label: string; numeric?: boolean; render: (row: ErpRecord) => string };

/** Mounted only for an expanded related section; page-level quantities are never summed as totals. */
export function InventoryRelated({ kind, record, onCount }: { kind: "stock" | "suppliers"; record: ErpRecord; onCount: (total: number | undefined) => void }) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const authority = useInventoryAuthority(kind === "stock" ? idsFor([record], "organization_id") : []);
  const source = authority.authorities[String(record.organization_id)];
  const nativeEnabled = kind === "suppliers" || source?.kind === "legacy";

  const filters = useMemo<CrudFilters>(() => [{ field: "product_id", operator: "eq", value: record.id }], [record.id]);
  const sorters = useMemo<CrudSorting>(() => [{ field: "id", order: "asc" }], []);
  const { result: nativeResult, query: nativeQuery } = useList<ErpRecord>({ resource: kind === "stock" ? "product_location_stocks" : "product_supplier", filters, sorters, pagination: { currentPage: page, pageSize: size, mode: "server" }, queryOptions: { ...ERP_QUERY_OPTIONS, enabled: nativeEnabled }, errorNotification: false });
  const ledgerRows: ErpRecord[] = source?.kind === "ledger" ? source.balances.filter(bin => bin.product_id === record.id).map(bin => ({ id: bin.location_id, product_id: bin.product_id, location_id: bin.location_id, quantity: bin.quantity, reserved: bin.reserved })) : [];
  const ledger = kind === "stock" && source?.kind === "ledger" && inventoryAuthorityRecord(record, source).stock_projection === "ledger_v2";
  const result = ledger ? { data: ledgerRows.slice((page - 1) * size, page * size), total: ledgerRows.length } : nativeResult;
  const query = nativeEnabled ? nativeQuery : { isLoading: authority.loading, isFetching: authority.loading, isError: !authority.loading && !ledger, refetch: authority.refresh };
  const rows = query.isError || query.isLoading ? [] : result.data;
  const refs = useNames(kind === "stock" ? "product_locations" : "suppliers", idsFor(rows, kind === "stock" ? "location_id" : "supplier_id"));
  const warehouses = useNames("warehouses", kind === "stock" ? idsFor(refs.rows, "warehouse_id") : []);
  useEffect(() => onCount(query.isLoading || query.isError ? undefined : result.total), [query.isLoading, query.isError, result.total, onCount]);
  const count = (value: unknown) => finiteNumber(value)?.toLocaleString() ?? "Not available";
  const cost = (row: ErpRecord) => {
    const currency = refs.rows.find(supplier => supplier.id === row.supplier_id)?.currency;
    return presentationValue(getErpResource("product_supplier")!, { name: "cost_price", type: "number" }, row.cost_price, { currency: typeof currency === "string" ? currency : undefined });
  };
  const warehouseOf = (row: ErpRecord) => warehouses.label(refs.rows.find(location => location.id === row.location_id)?.warehouse_id);
  const columns: RelatedColumn[] = kind === "stock" ? [
    { key: "warehouse", label: "Warehouse", render: warehouseOf },
    { key: "location", label: "Location", render: row => refs.label(row.location_id) },
    { key: "quantity", label: "On hand", numeric: true, render: row => count(row.quantity) },
    ...(ledger ? [
      { key: "reserved", label: "Reserved", numeric: true, render: (row: ErpRecord) => count(row.reserved) },
      { key: "available", label: "Available", numeric: true, render: (row: ErpRecord) => { const on = finiteNumber(row.quantity); const held = finiteNumber(row.reserved); return on === null || held === null ? "Not available" : (on - held).toLocaleString(); } },
    ] : []),
  ] : [
    { key: "supplier", label: "Supplier", render: row => refs.label(row.supplier_id) },
    { key: "sku", label: "Supplier SKU", render: row => text(row.supplier_sku) },
    { key: "cost", label: "Cost", numeric: true, render: cost },
    { key: "lead", label: "Lead time (days)", numeric: true, render: row => count(row.lead_time_days) },
    { key: "minimum", label: "Minimum order", numeric: true, render: row => count(row.minimum_order_quantity) },
    { key: "primary", label: "Primary", render: row => row.is_primary === true ? "Yes" : row.is_primary === false ? "No" : "Not available" },
  ];
  const exportRows = rows.map(row => Object.fromEntries(columns.map(column => [column.key, column.render(row)])));
  const noun = kind === "stock" ? "location stock" : "supplier links";
  return <MStack spacing={2}>
    <MTypography variant="body2" color="text.secondary">{kind === "stock" ? (ledger ? "Live ledger quantities by location. Reserved stock is held for approved sales orders." : "Recorded product quantities by warehouse and location. Variant stock is separate.") : "Linked suppliers and recorded purchasing terms."}</MTypography>
    {kind === "stock" && !query.isLoading && !query.isFetching && !query.isError && rows.length > 0 && <LocationStockChart rows={rows} total={result.total} label={refs.label} />}
    {!query.isFetching && !query.isError && rows.length > 0 && <RecordExportActions title={kind === "stock" ? "Stock by location" : "Supplier terms"} columns={columns.map(({ key, label }) => ({ key, label }))} rows={exportRows} scopeLabel={`Current visible ${kind === "stock" ? "location-stock" : "supplier"} page only; product constrained`} filename={`product-${kind}-current-page`} />}
    {query.isLoading ? <MStack spacing={1} aria-label={`Loading ${noun}`}>{[0, 1, 2].map(index => <MSkeleton key={index} variant="rounded" height={36} />)}</MStack>
      : query.isError ? <MAlert severity="error" action={<MButton color="inherit" size="small" onClick={() => query.refetch()}>Try again</MButton>}>{`Unable to load ${kind}`}</MAlert>
        : <MCard variant="outlined" sx={{ position: "relative" }}>
          {query.isFetching && <MLinearProgress sx={{ position: "absolute", top: 0, left: 0, right: 0 }} />}
          <MBox sx={{ overflowX: "auto" }}><MTable size="small" aria-label={kind === "stock" ? "Stock by location" : "Supplier terms"}>
            <MTableHead><MTableRow>{columns.map(column => <MTableCell key={column.key} align={column.numeric ? "right" : "left"}>{column.label}</MTableCell>)}</MTableRow></MTableHead>
            <MTableBody>{rows.length === 0 ? <MTableRow><MTableCell colSpan={columns.length}><MTypography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>{`No ${noun} recorded`}</MTypography></MTableCell></MTableRow>
              : rows.map(row => <MTableRow key={String(row.id)} hover>{columns.map(column => <MTableCell key={column.key} align={column.numeric ? "right" : "left"} sx={{ fontVariantNumeric: column.numeric ? "tabular-nums" : undefined }}>{column.render(row)}</MTableCell>)}</MTableRow>)}</MTableBody>
          </MTable></MBox>
          {result.total !== undefined && result.total > 0 && <MTablePagination component="div" count={result.total} page={page - 1} rowsPerPage={size} rowsPerPageOptions={[10, 20, 50, 100]} onPageChange={(_, next) => setPage(next + 1)} onRowsPerPageChange={event => { setSize(Number(event.target.value)); setPage(1); }} />}
        </MCard>}
  </MStack>;
}
