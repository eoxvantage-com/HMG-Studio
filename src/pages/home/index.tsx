import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router";
import { Accordion, AccordionDetails, AccordionSummary, Alert, Badge, Box, Button, Card, CardActionArea, CardContent, Chip, IconButton, LinearProgress, Link, MenuItem, Skeleton, Stack, Tab, Table, TableBody, TableCell, TableHead, TableRow, Tabs, TextField, Tooltip, Typography } from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { PageContainer } from "../../components/PageContainer";
import type { Dashboard } from "../../services/dashboard";
import { DASHBOARD_REFRESH_MS, useDashboard } from "../../hooks/useDashboard";
import { AlertsTab, AnalysisTab } from "./analysis";
import { getDashboardRate, type DashboardCurrency, type DashboardRate } from "../../services/dashboardCurrency";
import { shortNumber, statusColor, statusLabel } from "../../services/commercePresentation";

const TABS = ["overview", "analysis", "alerts"] as const;
type DashboardTab = typeof TABS[number];
const timeFormat = new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric", timeZone: "UTC" });
const monthLabel = (month: string) => new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-IN", { month: "short", year: "numeric", timeZone: "UTC" });

function PanelHeading({ title, subtitle, href, action }: { title: string; subtitle?: string; href?: string; action?: string }) {
  return <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
    <Box><Typography variant="h5" component="h2">{title}</Typography>{subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}</Box>
    {href && <Link component={RouterLink} to={href} underline="hover" variant="body2" sx={{ flexShrink: 0, display: "inline-flex", alignItems: "center", minHeight: 32 }}>{action}<ArrowOutwardRoundedIcon sx={{ fontSize: 16, ml: .5 }} /></Link>}
  </Stack>;
}
function Kpi({ label, value, context, href, tone }: { label: string; value: string; context: string; href: string; tone?: "error" | "success" }) {
  return <Card><CardActionArea component={RouterLink} to={href} aria-label={`${label}: ${value}. ${context}`} sx={{ height: "100%", "&:focus-visible": { outlineOffset: -3 } }}><CardContent>
    <Stack direction="row" justifyContent="space-between" alignItems="center"><Typography variant="body2" color="text.secondary">{label}</Typography><ChevronRightRoundedIcon fontSize="small" color="disabled" /></Stack>
    <Typography variant="h2" component="p" sx={{ my: 1.25, fontVariantNumeric: "tabular-nums", color: tone ? `${tone}.main` : undefined }}>{value}</Typography>
    <Typography variant="caption" color="text.secondary">{context}</Typography>
  </CardContent></CardActionArea></Card>;
}

function AnalysisUnavailable({ retry }: { retry: () => void }) {
  return <Alert severity="warning" action={<Button color="inherit" onClick={retry}>Retry</Button>}>Analysis is unavailable right now. The server could not compute it from the current records, so nothing is shown instead of estimates.</Alert>;
}

export const Home = () => {
  const [currency, setCurrency] = useState<DashboardCurrency>("INR");
  // One HMG Stones workspace: the dashboard combines every active business organization.
  // Live: refetches every 45 seconds while the tab is visible, and on focus.
  const { dashboard: d, query, updatedAt } = useDashboard({ live: true });
  const [params, setParams] = useSearchParams();
  const tab: DashboardTab = TABS.includes(params.get("tab") as DashboardTab) ? params.get("tab") as DashboardTab : "overview";
  const selectTab = (next: DashboardTab) => setParams(current => { const copy = new URLSearchParams(current); if (next === "overview") copy.delete("tab"); else copy.set("tab", next); return copy; }, { replace: true });
  const [fx, setFx] = useState<{ currency: DashboardCurrency; status: "loading" | "ready" | "error"; value?: DashboardRate }>({ currency: "INR", status: "ready" });
  const [rateAttempt, setRateAttempt] = useState(0);
  const canConvert = Boolean(d) && !query.isError && !query.isLoading;
  useEffect(() => {
    if (currency === "INR" || !canConvert) return;
    const controller = new AbortController(); let active = true;
    setFx({ currency, status: "loading" });
    void getDashboardRate(currency, controller.signal).then(value => { if (active) setFx({ currency, status: "ready", value }); }).catch(() => { if (active) setFx({ currency, status: "error" }); });
    // Refresh public data while open; a failed refresh never keeps stale amounts.
    const refresh = setTimeout(() => { setFx({ currency, status: "loading" }); setRateAttempt(n => n + 1); }, 300_000);
    return () => { active = false; controller.abort(); clearTimeout(refresh); };
  }, [currency, canConvert, rateAttempt]);
  const currentFx = fx.currency === currency ? fx : null;
  const rate = currency === "INR" ? 1 : currentFx?.status === "ready" ? currentFx.value?.rate : undefined;
  const moneyFormat = useMemo(() => new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }), [currency]);
  const compactMoneyFormat = useMemo(() => new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 1, notation: "compact" }), [currency]);
  const money = (value: string | number, compact = false) => {
    const converted = rate === undefined ? NaN : Number(value) * rate;
    return Number.isFinite(converted) ? (compact ? compactMoneyFormat : moneyFormat).format(converted) : "Amount unavailable";
  };
  const title = <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }}>
    <Box><Typography variant="h2" component="h1">Dashboard</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>HMG Stones · stock, orders and money owed{d?.generated_at ? ` · as of ${dateFormat.format(new Date(d.generated_at))}` : ""}</Typography></Box>
    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
      <TextField select size="small" label="Display currency" value={currency} onChange={e => { if (["INR", "USD", "EUR"].includes(e.target.value)) { const next = e.target.value as DashboardCurrency; setFx({ currency: next, status: "loading" }); setCurrency(next); } }} sx={{ minWidth: 150 }}>{["INR", "USD", "EUR"].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}</TextField>
      {updatedAt && !query.isError && <Tooltip title={`Live data from the Taruvi database. Refreshes every ${DASHBOARD_REFRESH_MS / 1000} seconds while this tab is open.`}><Chip size="small" variant="outlined" icon={<Box component="span" sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "success.main", ml: 1, animation: query.isFetching ? "hmgPulse 1s ease-in-out infinite" : "none", "@keyframes hmgPulse": { "50%": { opacity: .3 } } }} />} label={`Live · updated ${timeFormat.format(updatedAt)}`} /></Tooltip>}
      <Tooltip title="Refresh"><span><IconButton aria-label="Refresh" onClick={() => void query.refetch()} disabled={query.isFetching}><RefreshRoundedIcon /></IconButton></span></Tooltip>
      <Button component={RouterLink} to="/inventory/create" variant="outlined" startIcon={<AddRoundedIcon />}>Add product</Button>
      <Button component={RouterLink} to="/orders/create" variant="contained" startIcon={<AddRoundedIcon />}>New order</Button>
    </Stack>
  </Stack>;
  if (query.isLoading) return <PageContainer><Stack spacing={3}>{title}<Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", xl: "repeat(4,1fr)" } }}>{[0, 1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={120} />)}</Box><Skeleton variant="rounded" height={280} /></Stack></PageContainer>;
  if (query.isError || !d?.ok) return <PageContainer><Stack spacing={3}>{title}<Alert severity="warning" action={<Button onClick={() => void query.refetch()}>Retry</Button>}>Dashboard data unavailable</Alert><Typography color="text.secondary">Taruvi could not return the complete authorized projection. No totals have been substituted. You can still open modules from the sidebar.</Typography></Stack></PageContainer>;
  const analysisAlerts = d.analysis ? d.analysis.alert_counts.critical + d.analysis.alert_counts.warning : 0;
  const ledgerSales = d.sales_basis === "fulfilled_order_value";
  const fulfilled = d.fulfilled_value ?? d.revenue_month;
  const tiles = [
    { label: "Total Products", value: String(d.product_count), context: `${d.category_count} categories · ${d.location_count} locations`, href: "/inventory" },
    { label: "Inventory Value", value: money(d.inventory_value, true), context: `At selling price · ${currency}`, href: "/inventory" },
    { label: ledgerSales ? "Fulfilled Order Value" : "Shipped order value", value: money(fulfilled, true), context: `${d.fulfilled_value !== undefined ? `${d.fulfilled_count ?? 0} orders, all time · ` : ""}${money(d.revenue_month, true)} this month`, href: "/orders" },
    { label: "Open orders", value: String(d.open_orders ?? d.pending_orders), context: `${d.pending_orders} awaiting approval · ${d.order_count} orders in total`, href: "/approvals" },
  ];
  const peak = Math.max(0, ...(d.monthly_sales ?? []).map(m => Number(m.revenue))) || 1;
  const orderLink = (o: Dashboard["recent_orders"][number]) => `/orders/show/${o.id}${o.organization_id ? `?organization=${o.organization_id}` : ""}`;
  return <PageContainer><Stack spacing={2.5}>
    {title}
    {currency !== "INR" && <Box aria-live="polite">
      {currentFx?.status === "ready" ? <Alert severity="info">Showing {currency} · Reference date {currentFx.value?.date}. Indicative conversion only, not an accounting rate. Source: <Link href="https://frankfurter.dev/" target="_blank" rel="noopener noreferrer">Frankfurter (ECB)</Link>. Counts and records remain unchanged.</Alert>
        : currentFx?.status === "error" ? <Alert severity="warning" action={<Button onClick={() => { setFx({ currency, status: "loading" }); setRateAttempt(n => n + 1); }}>Retry rate</Button>}>{currency} reference rate unavailable. Amounts are unavailable; counts and records remain unchanged.</Alert>
          : <Alert severity="info" aria-busy="true">Loading the {currency} reference rate. Amounts are unavailable until it loads.</Alert>}
    </Box>}
    {query.isFetching && <LinearProgress aria-label="Refreshing dashboard" />}
    <Tabs value={tab} onChange={(_, next: DashboardTab) => selectTab(next)} aria-label="Dashboard views" sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Tab value="overview" label="Overview" />
      <Tab value="analysis" label="Analysis" />
      <Tab value="alerts" label={<Badge color="error" badgeContent={analysisAlerts || undefined} max={99} sx={{ "& .MuiBadge-badge": { right: -14, top: 2 } }}>Alerts</Badge>} sx={{ pr: analysisAlerts ? 3.5 : undefined }} />
    </Tabs>
    {tab === "analysis" && (d.analysis ? <AnalysisTab analysis={d.analysis} dashboard={d} money={money} onShowAlerts={() => selectTab("alerts")} /> : <AnalysisUnavailable retry={() => void query.refetch()} />)}
    {tab === "alerts" && (d.analysis ? <AlertsTab analysis={d.analysis} /> : <AnalysisUnavailable retry={() => void query.refetch()} />)}
    {tab === "overview" && <>
    <Box aria-label="Key performance indicators" sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "minmax(0,1fr)", sm: "repeat(2,minmax(0,1fr))", xl: "repeat(4,minmax(0,1fr))" } }}>
      {[tiles[0], tiles[1], tiles[3], tiles[2]].map(tile => <Kpi key={tile.label} {...tile} />)}
    </Box>
    <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "minmax(0,1fr)", lg: "minmax(0,3fr) minmax(0,2fr)" } }}>
      <Card sx={{ minWidth: 0 }}><CardContent><PanelHeading title="Recent Orders" subtitle={`${d.recent_orders.length} of ${d.order_count} orders`} href="/orders" action="All orders" />
        <Box sx={{ overflowX: "auto" }}><Table size="small"><TableHead><TableRow><TableCell>Order</TableCell><TableCell>Customer</TableCell><TableCell>Status</TableCell><TableCell>Date</TableCell><TableCell align="right">Total</TableCell></TableRow></TableHead><TableBody>
          {d.recent_orders.map(o => <TableRow key={o.id} hover><TableCell><Tooltip title={o.order_number}><Link component={RouterLink} to={orderLink(o)} fontWeight={600} underline="hover">{shortNumber(o.order_number)}</Link></Tooltip></TableCell><TableCell sx={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.customer_name || "—"}</TableCell><TableCell><Chip size="small" label={statusLabel(o.status)} color={statusColor(o.status)} /></TableCell><TableCell sx={{ whiteSpace: "nowrap" }}>{o.order_date ? dateFormat.format(new Date(o.order_date)) : "—"}</TableCell><TableCell align="right" sx={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{money(o.total)}</TableCell></TableRow>)}
          {!d.recent_orders.length && <TableRow><TableCell colSpan={5}>No orders in the INR ledger yet.</TableCell></TableRow>}
        </TableBody></Table></Box>
      </CardContent></Card>
      <Card><CardContent><PanelHeading title="Financial watch" subtitle="Based on order values; payments are not recorded yet" href="/reports" action="Reports" />
        <Stack spacing={2}>
          <Box><Typography variant="caption" color="text.secondary">Outstanding order balances</Typography><Typography variant="h4" component="p" sx={{ fontVariantNumeric: "tabular-nums" }}>{d.receivables === null ? "Not available" : money(d.receivables)}</Typography><Typography variant="caption" color="text.secondary">{d.receivables_reason ?? (d.receivables === null ? "" : `Non-cancelled orders less payments · ${currency}`)}</Typography></Box>
          {(d.order_pipeline ?? []).length > 0 && <Box><Typography variant="caption" color="text.secondary">Order pipeline</Typography><Stack spacing={1} sx={{ mt: 1 }}>{d.order_pipeline!.map(row => <Stack key={row.status} direction="row" justifyContent="space-between" alignItems="center" spacing={2}><Chip label={statusLabel(row.status)} color={statusColor(row.status)} size="small" /><Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums" }}>{row.count} · {money(row.value)}</Typography></Stack>)}</Stack></Box>}
        </Stack>
      </CardContent></Card>
    </Box>
    <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "minmax(0,1fr)", lg: "repeat(2,minmax(0,1fr))" } }}>
      {d.monthly_sales && <Card><CardContent><PanelHeading title={ledgerSales ? "Monthly fulfilled sales" : "Monthly shipped / delivered sales"} subtitle={`Last six months · by order date · ${currency}`} />
        <Stack spacing={1.75}>{d.monthly_sales.map(row => <Box key={row.month}><Stack direction="row" justifyContent="space-between" spacing={2}><Typography variant="body2">{monthLabel(row.month)}</Typography><Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums" }}>{row.count} orders · {money(row.revenue)}</Typography></Stack><LinearProgress aria-label={`${row.month} shipped sales relative to peak month`} variant="determinate" value={Math.max(0, Math.min(100, 100 * Number(row.revenue) / peak))} sx={{ mt: .75, height: 8, borderRadius: 4 }} /></Box>)}</Stack>
      </CardContent></Card>}
      <Card><CardContent><PanelHeading title="Stock Value by Category" subtitle={`At selling price · ${money(d.inventory_value)} in total`} href="/inventory" action="View inventory" />
        <Stack spacing={1.75}>{d.stock_by_category.filter(c => Number(c.value) > 0).map(c => <Box key={c.name}><Stack direction="row" justifyContent="space-between" spacing={1}><Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>{c.name}</Typography><Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{money(c.value)}</Typography></Stack><LinearProgress aria-label={`${c.name} share of stock value`} variant="determinate" value={Number(d.inventory_value) > 0 ? Math.max(0, Math.min(100, Number(c.value) / Number(d.inventory_value) * 100)) : 0} sx={{ mt: .75, height: 8, borderRadius: 4 }} /></Box>)}
          {!d.stock_by_category.some(c => Number(c.value) > 0) && <Typography color="text.secondary">No stock value available.</Typography>}</Stack>
      </CardContent></Card>
    </Box>
    <Card><CardContent><PanelHeading title="Replenishment" subtitle={d.low_stock_count ? `${d.low_stock_count} products at or below minimum stock` : "Based on current stock and minimum quantities"} href="/inventory" action="Open inventory" />
      {!d.low_stock.length ? <Stack alignItems="center" sx={{ py: 3 }}><Typography color="text.secondary">{d.product_count ? "All products are well stocked" : "No products in the INR ledger yet"}</Typography></Stack>
        : <Box sx={{ overflowX: "auto" }}><Table size="small"><TableHead><TableRow><TableCell>Product</TableCell><TableCell>SKU</TableCell><TableCell align="right">Stock</TableCell><TableCell align="right">Minimum</TableCell><TableCell align="right">Action</TableCell></TableRow></TableHead><TableBody>{d.low_stock.map(p => <TableRow key={p.id} hover><TableCell>{p.name}</TableCell><TableCell>{p.sku}</TableCell><TableCell align="right" sx={{ color: Number(p.stock) <= 0 ? "error.main" : undefined, fontWeight: 600 }}>{p.stock}</TableCell><TableCell align="right">{p.minimum}</TableCell><TableCell align="right"><Link component={RouterLink} to={`/inventory/show/${p.id}`}>View product</Link></TableCell></TableRow>)}</TableBody></Table></Box>}
    </CardContent></Card>
    <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "minmax(0,1fr)", lg: "repeat(2,minmax(0,1fr))" } }}>
      {d.catalogue_quality && <Card><CardContent><PanelHeading title="Catalogue readiness" href="/inventory" action="Review catalogue" />
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "repeat(2,minmax(0,1fr))" }}>{[["Catalogue records", d.catalogue_quality.total], ["Inactive references", d.catalogue_quality.inactive], ["Without selling price", d.catalogue_quality.missing_selling_price], ["Without image", d.catalogue_quality.missing_image]].map(([label, value]) => <Box key={String(label)}><Typography variant="caption" color="text.secondary">{label}</Typography><Typography variant="h5" component="p" sx={{ color: label !== "Catalogue records" && label !== "Inactive references" && Number(value) > 0 ? "warning.main" : undefined }}>{value}</Typography></Box>)}</Box>
        <Typography variant="caption" color="text.secondary">Includes inactive reference products. This checks recorded fields, not image-file availability.</Typography>
      </CardContent></Card>}
      <Card><CardContent><PanelHeading title="Quick actions" />
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", sm: "repeat(2,minmax(0,1fr))" }, gap: 1.5 }}>
          {[["New sales order", "/orders/create"], ["New purchase order", "/purchase-orders/create"], ["Add product", "/inventory/create"], ["Stock adjustment", "/stock-adjustments"], ["Stock transfer", "/stock-transfers"], ["Approvals queue", "/approvals"]].map(([label, href]) => <Button key={href} component={RouterLink} to={href} variant="outlined" endIcon={<ArrowOutwardRoundedIcon />} sx={{ justifyContent: "space-between", minHeight: 44, textAlign: "left" }}>{label}</Button>)}
        </Box>
      </CardContent></Card>
    </Box>
    <Accordion disableGutters><AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}><Typography variant="h6">Recent Products</Typography><Chip size="small" label={d.recent_products.length} sx={{ ml: 1 }} /></AccordionSummary><AccordionDetails><Box sx={{ overflowX: "auto" }}><Table size="small"><TableHead><TableRow><TableCell>SKU</TableCell><TableCell>Product</TableCell><TableCell align="right">Stock</TableCell></TableRow></TableHead><TableBody>{d.recent_products.map(p => <TableRow key={p.id}><TableCell>{p.sku}</TableCell><TableCell><Link component={RouterLink} to={`/inventory/show/${p.id}`}>{p.name}</Link></TableCell><TableCell align="right">{p.stock}</TableCell></TableRow>)}{!d.recent_products.length && <TableRow><TableCell colSpan={3}>No recent products in the INR ledger yet.</TableCell></TableRow>}</TableBody></Table></Box></AccordionDetails></Accordion>
    <Accordion disableGutters><AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}><Typography variant="body2">How these numbers are calculated</Typography></AccordionSummary><AccordionDetails><Stack spacing={1}>{d.scope && <Typography variant="caption" color="text.secondary">{d.scope}</Typography>}{d.limitations?.map(item => <Typography key={item} variant="caption" color="text.secondary">{item}</Typography>)}</Stack></AccordionDetails></Accordion>
    </>}
  </Stack></PageContainer>;
};
