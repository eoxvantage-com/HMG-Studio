import { useMemo, useState } from "react";
import { useList } from "@refinedev/core";
import { Link as RouterLink } from "react-router";
import { Alert, Autocomplete, Box, Breadcrumbs, Button, Card, CardContent, Chip, IconButton, InputAdornment, LinearProgress, Link, MenuItem, Skeleton, Stack, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField, Tooltip, Typography } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddShoppingCartRoundedIcon from "@mui/icons-material/AddShoppingCartRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import { PageContainer } from "../../components/PageContainer";
import { ProductThumb } from "../../components/ProductThumb";
import { RecordExportActions } from "../../components/RecordExportActions";
import { CommerceWorkflowStatus, RefreshWorkflowButton } from "../../components/CommerceWorkflowStatus";
import { useSessionOwner } from "../../hooks/useSessionOwner";
import { useDefaultOrganization } from "../../hooks/useDefaultOrganization";
import { useCommerceLedger } from "../../hooks/useCommerceLedger";
import { useOrganizationRecords } from "../../services/recordFetch";
import { ERP_QUERY_OPTIONS, type ErpRecord } from "../../services/erp";
import { reportUuid } from "../../services/operationalReports";
import { hasCommerceAuthority, isTestOrganization } from "../../services/commerceLedger";
import { formatDate, formatMoney, shortNumber, statusColor, statusLabel } from "../../services/commercePresentation";
import { locationSummary, replenishment, reservations, stockLevels } from "../../services/stockInsights";

export type StockView = "levels" | "reservations" | "replenishment";
const COPY: Record<StockView, { title: string; subtitle: string }> = {
  levels: { title: "Stock by warehouse", subtitle: "Live on-hand, reserved and free stock in every yard and rack, from the stock ledger." },
  reservations: { title: "Reservations", subtitle: "Stock held for approved customer orders that has not shipped yet." },
  replenishment: { title: "Replenishment", subtitle: "Products at or below their reorder point, after counting stock already on order." },
};
const text = (value: unknown) => typeof value === "string" ? value : "";

export function StockInsights({ view }: { view: StockView }) {
  const { owner } = useSessionOwner();
  return <StockInsightsInner key={owner} view={view} />;
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "error" | "warning" }) {
  return <Card><CardContent><Typography variant="body2" color="text.secondary">{label}</Typography><Typography variant="h3" component="p" sx={{ mt: 1, fontVariantNumeric: "tabular-nums", color: tone ? `${tone}.main` : undefined }}>{value}</Typography></CardContent></Card>;
}

function StockInsightsInner({ view }: { view: StockView }) {
  const { owner } = useSessionOwner();
  const [organizationId, setOrganizationId] = useState("");
  const meta = useMemo(() => ({ lookupOwner: owner }), [owner]);
  const organizations = useList<ErpRecord>({ resource: "organizations", pagination: { mode: "server", currentPage: 1, pageSize: 100 }, meta, queryOptions: { ...ERP_QUERY_OPTIONS, enabled: !!owner }, errorNotification: false });
  const options = (organizations.query.isError ? [] : organizations.result.data).filter(row => row.is_active !== false && !row.deleted_at && reportUuid(row.id) && text(row.name) && hasCommerceAuthority(row) && !isTestOrganization(row));
  useDefaultOrganization(organizationId, options.map(row => row.id), setOrganizationId, !organizations.query.isLoading);
  const organization = options.find(row => row.id === organizationId);
  const currency = text(organization?.default_currency) || text(organization?.currency) || "INR";
  const ledger = useCommerceLedger(organizationId, !!organization);
  const records = useOrganizationRecords(organizationId);
  const [search, setSearch] = useState(""); const [location, setLocation] = useState(""); const [page, setPage] = useState(0); const [size, setSize] = useState(20);
  const money = (value: number) => formatMoney(value, currency);
  const loading = ledger.busy || records.loading || (!ledger.state && !ledger.message && !!organizationId);
  const data = ledger.state && records.data ? { state: ledger.state, ...records.data } : null;
  const term = search.trim().toLowerCase();

  const levels = useMemo(() => data ? stockLevels(data.state, data.products, data.locations) : [], [data?.state, data?.products, data?.locations]);
  const held = useMemo(() => data ? reservations(data.state, data.locations) : [], [data?.state, data?.locations]);
  const reorder = useMemo(() => data ? replenishment(data.state, data.products, data.suppliers) : [], [data?.state, data?.products, data?.suppliers]);
  const visibleLevels = levels.filter(row => (!location || row.locationId === location) && (!term || `${row.name} ${row.sku}`.toLowerCase().includes(term)));
  const visibleHeld = held.filter(row => !term || `${row.number} ${row.customer} ${row.product}`.toLowerCase().includes(term));
  const visibleReorder = reorder.filter(row => !term || `${row.name} ${row.sku} ${row.supplier}`.toLowerCase().includes(term));
  const count = view === "levels" ? visibleLevels.length : view === "reservations" ? visibleHeld.length : visibleReorder.length;
  const pageOf = <T,>(rows: T[]) => rows.slice(page * size, page * size + size);
  const resetPage = () => setPage(0);
  const copy = COPY[view];

  return <PageContainer><Stack spacing={3}>
    <Breadcrumbs><Link component={RouterLink} to="/">Workspace</Link><Typography color="text.primary" fontWeight={600}>{copy.title}</Typography></Breadcrumbs>
    <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ md: "center" }} spacing={2}>
      <Box><Typography variant="h2">{copy.title}</Typography><Typography color="text.secondary">{copy.subtitle}</Typography></Box>
      <Stack direction="row" spacing={1} alignItems="center">
        <Autocomplete size="small" sx={{ width: 280 }} options={options} value={organization ?? null} disableClearable={!!organization} getOptionLabel={row => text(row.name)} isOptionEqualToValue={(a, b) => a.id === b.id} onChange={(_, row) => { setOrganizationId(row?.id ?? ""); resetPage(); }} renderInput={params => <TextField {...params} label="Organization" />} />
        <RefreshWorkflowButton ledger={{ ...ledger, refresh: () => { void records.reload(); return ledger.refresh(); } }} />
      </Stack>
    </Stack>
    <CommerceWorkflowStatus ledger={ledger} />
    {records.error && <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => void records.reload()}>Try again</Button>}>{records.error}</Alert>}

    {view === "levels" && <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr 1fr", lg: "repeat(4, 1fr)" } }}>
      {loading || !data ? [0, 1, 2, 3].map(index => <Skeleton key={index} variant="rounded" height={104} />) : <>
        <Stat label="On hand" value={levels.reduce((sum, row) => sum + row.onHand, 0).toLocaleString()} />
        <Stat label="Reserved for orders" value={levels.reduce((sum, row) => sum + row.reserved, 0).toLocaleString()} />
        <Stat label="Value at cost" value={money(levels.reduce((sum, row) => sum + row.costValue, 0))} />
        <Stat label="Value at selling price" value={money(levels.reduce((sum, row) => sum + row.sellValue, 0))} />
      </>}
    </Box>}
    {view === "levels" && data && <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3, 1fr)" } }}>
      {locationSummary(levels).map(item => <Card key={item.id} variant="outlined" sx={{ borderColor: location === item.id ? "primary.main" : undefined }}><CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center"><Typography fontWeight={600}>{item.location}</Typography><Button size="small" onClick={() => { setLocation(location === item.id ? "" : item.id); resetPage(); }}>{location === item.id ? "Show all" : "Filter"}</Button></Stack>
        <Typography variant="body2" color="text.secondary">{item.products} products · {item.onHand.toLocaleString()} on hand · {item.reserved.toLocaleString()} reserved</Typography>
        <Typography variant="h6" sx={{ mt: 1 }}>{money(item.sellValue)}</Typography>
      </CardContent></Card>)}
    </Box>}
    {view === "reservations" && data && <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr 1fr", lg: "repeat(3, 1fr)" } }}>
      <Stat label="Orders holding stock" value={String(new Set(held.map(row => row.documentId)).size)} />
      <Stat label="Units reserved, not shipped" value={held.reduce((sum, row) => sum + row.remaining, 0).toLocaleString()} />
      <Stat label="Value waiting to ship" value={money(held.reduce((sum, row) => sum + row.value, 0))} />
    </Box>}
    {view === "replenishment" && data && <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr 1fr", lg: "repeat(3, 1fr)" } }}>
      <Stat label="Out of stock" value={String(reorder.filter(row => row.status === "out").length)} tone={reorder.some(row => row.status === "out") ? "error" : undefined} />
      <Stat label="Below reorder point" value={String(reorder.filter(row => row.status === "below").length)} tone={reorder.some(row => row.status === "below") ? "warning" : undefined} />
      <Stat label="Suggested order value (cost)" value={money(reorder.reduce((sum, row) => sum + row.suggested * row.cost, 0))} />
    </Box>}

    <Card><CardContent><Stack spacing={2}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
        <TextField size="small" label={view === "reservations" ? "Search orders or products" : "Search products"} value={search} onChange={event => { setSearch(event.target.value); resetPage(); }} sx={{ minWidth: 280 }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }} />
        {view === "levels" && <TextField size="small" select label="Location" value={location} onChange={event => { setLocation(event.target.value); resetPage(); }} sx={{ minWidth: 220 }}><MenuItem value="">All locations</MenuItem>{(records.data?.locations ?? []).map(row => <MenuItem key={row.id} value={row.id}>{text(row.name)}</MenuItem>)}</TextField>}
        <Box flex={1} />
        {data && count > 0 && <RecordExportActions title={copy.title} filename={copy.title}
          scopeLabel={`${text(organization?.name)} · live ledger snapshot${term ? ` · search "${search}"` : ""}${location ? " · one location" : ""}`}
          columns={view === "levels" ? [{ key: "sku", label: "SKU" }, { key: "name", label: "Product" }, { key: "location", label: "Location" }, { key: "onHand", label: "On hand" }, { key: "reserved", label: "Reserved" }, { key: "free", label: "Free" }, { key: "sellValue", label: "Value at selling price" }]
            : view === "reservations" ? [{ key: "number", label: "Order" }, { key: "customer", label: "Customer" }, { key: "orderDate", label: "Order date" }, { key: "product", label: "Product" }, { key: "location", label: "Location" }, { key: "remaining", label: "Reserved, not shipped" }, { key: "value", label: "Value" }]
              : [{ key: "sku", label: "SKU" }, { key: "name", label: "Product" }, { key: "free", label: "Free" }, { key: "onOrder", label: "On order" }, { key: "point", label: "Reorder point" }, { key: "suggested", label: "Suggested order" }, { key: "supplier", label: "Last supplier" }]}
          rows={view === "levels" ? visibleLevels.map(row => ({ ...row, sellValue: row.sellValue.toFixed(2) })) : view === "reservations" ? visibleHeld.map(row => ({ ...row, value: row.value.toFixed(2) })) : visibleReorder} />}
      </Stack>
      {(search || location) && <Stack direction="row" spacing={1}>{search && <Chip label={`Search: ${search}`} onDelete={() => setSearch("")} />}{location && <Chip label={`Location: ${text(records.data?.locations.find(row => row.id === location)?.name)}`} onDelete={() => setLocation("")} />}</Stack>}
      {loading && <LinearProgress aria-label="Loading stock" />}
      <Box sx={{ overflowX: "auto" }}>
        {view === "levels" && <Table size="small" aria-label="Stock levels"><TableHead><TableRow><TableCell>Product</TableCell><TableCell>Location</TableCell><TableCell align="right">On hand</TableCell><TableCell align="right">Reserved</TableCell><TableCell align="right">Free</TableCell><TableCell align="right">Value (selling)</TableCell></TableRow></TableHead><TableBody>
          {pageOf(visibleLevels).map(row => <TableRow key={`${row.productId}:${row.locationId}`} hover>
            <TableCell><Stack direction="row" spacing={1.5} alignItems="center"><ProductThumb source={row.image} alt={row.name} size={36} /><Box><Link component={RouterLink} to={`/inventory/show/${row.productId}`} underline="hover" fontWeight={600}>{row.name}</Link><Typography variant="caption" color="text.secondary" display="block">{row.sku}</Typography></Box></Stack></TableCell>
            <TableCell>{row.location}</TableCell><TableCell align="right">{row.onHand}</TableCell><TableCell align="right">{row.reserved || "—"}</TableCell>
            <TableCell align="right"><Typography variant="body2" fontWeight={600} color={row.free <= 0 ? "error.main" : undefined}>{row.free}</Typography></TableCell>
            <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>{money(row.sellValue)}</TableCell>
          </TableRow>)}
        </TableBody></Table>}
        {view === "reservations" && <Table size="small" aria-label="Reservations"><TableHead><TableRow><TableCell>Order</TableCell><TableCell>Customer</TableCell><TableCell>Product</TableCell><TableCell>Location</TableCell><TableCell align="right">Reserved</TableCell><TableCell align="right">Shipped</TableCell><TableCell align="right">To ship</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead><TableBody>
          {pageOf(visibleHeld).map(row => <TableRow key={`${row.documentId}:${row.productId}:${row.location}`} hover>
            <TableCell><Tooltip title={row.number}><Link component={RouterLink} to={`/orders/show/${row.documentId}?organization=${organizationId}`} underline="hover" fontWeight={600}>{shortNumber(row.number)}</Link></Tooltip><Typography variant="caption" display="block" color="text.secondary">{formatDate(row.orderDate)} · <Chip component="span" size="small" label={statusLabel(row.status)} color={statusColor(row.status)} sx={{ height: 18 }} /></Typography></TableCell>
            <TableCell>{row.customer}</TableCell><TableCell>{row.product}</TableCell><TableCell>{row.location}</TableCell>
            <TableCell align="right">{row.reserved}</TableCell><TableCell align="right">{row.shipped || "—"}</TableCell><TableCell align="right"><b>{row.remaining}</b></TableCell>
            <TableCell align="right"><Tooltip title="Open the order to post the shipment"><IconButton size="small" component={RouterLink} to={`/orders/show/${row.documentId}?organization=${organizationId}`} aria-label={`Ship ${row.number}`}><LocalShippingRoundedIcon fontSize="small" /></IconButton></Tooltip></TableCell>
          </TableRow>)}
        </TableBody></Table>}
        {view === "replenishment" && <Table size="small" aria-label="Replenishment"><TableHead><TableRow><TableCell>Product</TableCell><TableCell>Status</TableCell><TableCell align="right">Free</TableCell><TableCell align="right">On order</TableCell><TableCell align="right">Reorder point</TableCell><TableCell align="right">Suggested order</TableCell><TableCell>Last supplier</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead><TableBody>
          {pageOf(visibleReorder).map(row => <TableRow key={row.productId} hover>
            <TableCell><Stack direction="row" spacing={1.5} alignItems="center"><ProductThumb source={row.image} alt={row.name} size={36} /><Box><Link component={RouterLink} to={`/inventory/show/${row.productId}`} underline="hover" fontWeight={600}>{row.name}</Link><Typography variant="caption" color="text.secondary" display="block">{row.sku}</Typography></Box></Stack></TableCell>
            <TableCell><Chip size="small" color={row.status === "out" ? "error" : "warning"} label={row.status === "out" ? "Out of stock" : "Below reorder point"} /></TableCell>
            <TableCell align="right">{row.free}</TableCell><TableCell align="right">{row.onOrder || "—"}</TableCell><TableCell align="right">{row.point}</TableCell>
            <TableCell align="right"><b>{row.suggested}</b><Typography variant="caption" display="block" color="text.secondary">{row.cost ? money(row.suggested * row.cost) : "No cost"}</Typography></TableCell>
            <TableCell>{row.supplier || "—"}</TableCell>
            <TableCell align="right"><Tooltip title="Create a purchase order"><IconButton size="small" component={RouterLink} to="/purchase-orders/create" aria-label={`Order ${row.name}`}><AddShoppingCartRoundedIcon fontSize="small" /></IconButton></Tooltip></TableCell>
          </TableRow>)}
        </TableBody></Table>}
        {!loading && data && count === 0 && <Stack alignItems="center" spacing={1} sx={{ py: 5 }}><Inventory2RoundedIcon color="disabled" sx={{ fontSize: 40 }} /><Typography variant="h6">{term || location ? "No matching items" : view === "levels" ? "No stock recorded yet" : view === "reservations" ? "Nothing is reserved" : "Everything is above its reorder point"}</Typography><Typography color="text.secondary">{term || location ? "Try adjusting your search or filters." : view === "replenishment" ? "Set minimum stock or a reorder point on products to get reorder suggestions." : view === "reservations" ? "Approving a sales order reserves its stock here until it ships." : "Receive a purchase order or post a stock adjustment to add stock."}</Typography></Stack>}
      </Box>
      {count > size && <TablePagination component="div" count={count} page={page} rowsPerPage={size} rowsPerPageOptions={[10, 20, 50, 100]} onPageChange={(_, value) => setPage(value)} onRowsPerPageChange={event => { setSize(Number(event.target.value)); resetPage(); }} />}
      {data && <Typography variant="caption" color="text.secondary">Live snapshot of the complete ledger (sequence {data.state.sequence}); search and filters apply to that snapshot.</Typography>}
    </Stack></CardContent></Card>
  </Stack></PageContainer>;
}
