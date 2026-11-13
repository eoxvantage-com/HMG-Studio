import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router";
import { Alert, Box, Button, Card, CardContent, Chip, Divider, Link, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Stack, Table, TableBody, TableCell, TableHead, TableRow, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line, LineChart, Pie, PieChart, ReferenceLine, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from "recharts";
import { taruviTokens } from "../../../themeOptions";
import { OperationsHealthRing, RING_TONE } from "../../components/dashboard/OperationsHealthRing";
import { SEVERITY_CHIP, SEVERITY_TEXT, STATUS_CHIP, STATUS_TEXT, formatMetric, type AlertSeverity, type Analysis, type AnalysisAlert } from "../../services/dashboardAnalysis";
import { shortNumber, statusLabel } from "../../services/commercePresentation";
import type { Dashboard } from "../../services/dashboard";

type Money = (value: string, compact?: boolean) => string;
const chart = taruviTokens.status;
const SERIES = [chart.chartPrimary, chart.resolved, chart.underReview, chart.delayedAlt, chart.onHoldAlt, chart.open, chart.inProgress];
const STATUS_SERIES: Record<string, string> = { pending: chart.underReview, approved: chart.inProgress, partially_fulfilled: chart.open, fulfilled: chart.resolved, rejected: chart.delayedAlt, partially_received: chart.open, received: chart.resolved };
const AXIS = { fontSize: 11, fill: "#000" };
const GRID = { stroke: "#e0e0e0", strokeDasharray: "3 3" };
const monthLabel = (month: string) => new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-IN", { month: "short", timeZone: "UTC" });
/** Long ledger numbers (SO-<uuid>) are shown in their short form. */
const tidy = (value: string) => value.replace(/\b([A-Z]{2,4}-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\b/gi, match => shortNumber(match));
const SEVERITY_ICON: Record<AlertSeverity, JSX.Element> = {
  critical: <ErrorRoundedIcon color="error" />, warning: <WarningAmberRoundedIcon color="warning" />, info: <InfoRoundedIcon color="info" />,
};
const RELATED: Record<string, string[]> = {
  orders: ["approval"], delivery: ["late_shipment"], returns: ["return_waiting"], purchasing: ["purchase_overdue"],
  stock: ["stock_shortfall", "out_of_stock", "low_stock"], alerts: [], fulfilment: [], inventory: ["ledger_capacity"],
};

function ChartCard({ title, subtitle, summary, children, empty }: { title: string; subtitle: string; summary: string; children: React.ReactNode; empty?: string }) {
  return <Card sx={{ minWidth: 0 }}><CardContent>
    <Typography variant="h5" component="h3">{title}</Typography>
    <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
    {empty ? <Box sx={{ height: 240, display: "grid", placeItems: "center", textAlign: "center", px: 2 }}><Typography variant="body2" color="text.secondary">{empty}</Typography></Box>
      : <Box role="img" aria-label={summary} sx={{ height: 260, mt: 2 }}>{children}</Box>}
  </CardContent></Card>;
}

function AlertRow({ alert, dense = false }: { alert: AnalysisAlert; dense?: boolean }) {
  return <ListItem disablePadding divider={!dense}>
    <ListItemButton component={RouterLink} to={alert.link} sx={{ py: dense ? .75 : 1.25 }}>
      <ListItemIcon sx={{ minWidth: 40 }}>{SEVERITY_ICON[alert.severity]}</ListItemIcon>
      <ListItemText primary={tidy(alert.title)} secondary={alert.detail} primaryTypographyProps={{ fontWeight: 600 }} />
      {!dense && <Chip size="small" label={SEVERITY_TEXT[alert.severity]} color={SEVERITY_CHIP[alert.severity]} sx={{ ml: 1 }} />}
    </ListItemButton>
  </ListItem>;
}

export function AnalysisTab({ analysis, dashboard, money, onShowAlerts }: { analysis: Analysis; dashboard: Dashboard; money: Money; onShowAlerts: () => void }) {
  const [selected, setSelected] = useState(analysis.segments[0]?.key ?? "orders");
  const segment = analysis.segments.find(s => s.key === selected) ?? analysis.segments[0];
  const related = analysis.alerts.filter(a => (RELATED[segment.key] ?? []).includes(a.kind));
  const trend = useMemo(() => analysis.trend.map(row => ({ month: monthLabel(row.month), revenue: Number(row.revenue), orders: row.orders, returned: row.units_returned })), [analysis.trend]);
  const pipeline = (dashboard.order_pipeline ?? []).map(row => ({ status: statusLabel(row.status), key: row.status, count: row.count }));
  const categories = dashboard.stock_by_category.filter(c => Number(c.value) > 0).map(c => ({ name: c.name, value: Number(c.value) }));
  const top = analysis.top_products.map(p => ({ name: p.name, revenue: Number(p.revenue), units: p.units }));
  const delivery = analysis.delivery;
  const moneyTick = (value: number) => money(String(value), true);
  return <Stack spacing={2.5}>
    <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "minmax(0,1fr)", lg: "minmax(0,7fr) minmax(0,5fr)" }, alignItems: "stretch" }}>
      <Card><CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box><Typography variant="h5" component="h2">Operations health</Typography><Typography variant="caption" color="text.secondary">Hover a segment to preview it, click to see details</Typography></Box>
          <Chip label={STATUS_TEXT[analysis.status]} color={STATUS_CHIP[analysis.status]} />
        </Stack>
        <OperationsHealthRing segments={analysis.segments} status={analysis.status} alertCount={analysis.alerts.length} selected={segment.key} onSelect={key => key === "alerts" && selected === "alerts" ? onShowAlerts() : setSelected(key)} money={money} />
        <Stack direction="row" spacing={2} justifyContent="center" useFlexGap flexWrap="wrap" aria-label="Status colours">
          {(["good", "watch", "risk", "none"] as const).map(status => <Stack key={status} direction="row" spacing={.75} alignItems="center"><Box sx={{ width: 12, height: 12, borderRadius: .5, bgcolor: RING_TONE[status] }} /><Typography variant="caption">{STATUS_TEXT[status]}</Typography></Stack>)}
        </Stack>
      </CardContent></Card>
      <Card aria-live="polite"><CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          <Typography variant="overline" color="primary" fontWeight={700}>{segment.label}</Typography>
          <Chip size="small" label={STATUS_TEXT[segment.status]} color={STATUS_CHIP[segment.status]} />
        </Stack>
        <Typography variant="h2" component="p" sx={{ fontVariantNumeric: "tabular-nums" }}>{formatMetric(segment.value, money)}</Typography>
        <Typography variant="body2" color="text.secondary">{segment.caption.toLowerCase().startsWith(segment.value.label.toLowerCase()) ? segment.caption.charAt(0).toUpperCase() + segment.caption.slice(1) : `${segment.value.label} · ${segment.caption}`}</Typography>
        <Divider sx={{ my: 2 }} />
        <Box component="dl" sx={{ m: 0, display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", rowGap: 1.25, columnGap: 2 }}>
          {segment.metrics.map(m => <Box key={m.label} sx={{ display: "contents" }}>
            <Typography component="dt" variant="body2" color="text.secondary">{m.label}</Typography>
            <Typography component="dd" variant="body2" fontWeight={600} sx={{ m: 0, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{formatMetric(m, money)}</Typography>
          </Box>)}
        </Box>
        {segment.key === "delivery" && <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" component="h3">Late orders · not shipped within {analysis.targets.delivery_days} days</Typography>
          {delivery.late.length ? <Table size="small" sx={{ mt: 1 }}><TableBody>{delivery.late.map(o => <TableRow key={o.id} hover>
            <TableCell sx={{ pl: 0 }}><Link component={RouterLink} to={`/orders/show/${o.id}?organization=${o.organization_id}`} fontWeight={600}>{shortNumber(o.number)}</Link><Typography variant="caption" display="block" color="text.secondary">{o.customer}</Typography></TableCell>
            <TableCell align="right"><Chip size="small" color={o.age_days > analysis.targets.delivery_days * 2 ? "error" : "warning"} label={`${o.age_days} days`} /></TableCell>
            <TableCell align="right" sx={{ pr: 0, fontVariantNumeric: "tabular-nums" }}>{money(o.total)}</TableCell>
          </TableRow>)}</TableBody></Table> : <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>No approved orders are past the target.</Typography>}
        </>}
        {segment.key === "fulfilment" && top.length > 0 && <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" component="h3">Most shipped by value</Typography>
          <Stack spacing={.75} sx={{ mt: 1 }}>{analysis.top_products.slice(0, 3).map(p => <Stack key={p.id} direction="row" justifyContent="space-between" spacing={2}><Link component={RouterLink} to={`/inventory/show/${p.id}`} variant="body2">{p.name}</Link><Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums" }}>{p.units} units · {money(p.revenue)}</Typography></Stack>)}</Stack>
        </>}
        {segment.key === "stock" && analysis.shortfalls.length > 0 && <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" component="h3">Short for pending orders</Typography>
          <Stack spacing={.75} sx={{ mt: 1 }}>{analysis.shortfalls.map(p => <Stack key={p.id} direction="row" justifyContent="space-between" spacing={2}><Link component={RouterLink} to={`/inventory/show/${p.id}`} variant="body2">{p.name}</Link><Typography variant="body2" color="error.main">{p.needed} needed · {p.free} free</Typography></Stack>)}</Stack>
        </>}
        {segment.key === "inventory" && analysis.capacity && <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" color="text.secondary">Stock ledger: {analysis.capacity.used} of {analysis.capacity.max} events used.</Typography>
        </>}
        {(segment.key === "alerts" ? analysis.alerts.slice(0, 5) : related.slice(0, 4)).length > 0 && <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" component="h3">{segment.key === "alerts" ? "Top alerts" : "Related alerts"}</Typography>
          <List dense disablePadding sx={{ mt: .5 }}>{(segment.key === "alerts" ? analysis.alerts.slice(0, 5) : related.slice(0, 4)).map((alert, index) => <AlertRow key={`${alert.kind}-${index}`} alert={alert} dense />)}</List>
        </>}
        <Stack direction="row" spacing={1} sx={{ mt: 2.5 }}>
          {segment.key === "alerts" ? <Button variant="contained" onClick={onShowAlerts}>View all alerts</Button>
            : <Button component={RouterLink} to={segment.link} variant="contained" endIcon={<ArrowOutwardRoundedIcon />}>Open {segment.label.toLowerCase()}</Button>}
        </Stack>
      </CardContent></Card>
    </Box>

    <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "minmax(0,1fr)", lg: "repeat(2,minmax(0,1fr))" } }}>
      <ChartCard title="Sales and returns by month" subtitle="Fulfilled order value by order date (bars) · units returned (line)"
        summary={`Monthly fulfilled sales: ${analysis.trend.map(r => `${monthLabel(r.month)} ${money(r.revenue, true)}, ${r.units_returned} units returned`).join("; ")}`}
        empty={analysis.trend.every(r => Number(r.revenue) === 0 && r.units_returned === 0) ? "No fulfilled sales or returns in the last six months." : undefined}>
        <ResponsiveContainer width="100%" height="100%"><ComposedChart data={trend} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid {...GRID} vertical={false} />
          <XAxis dataKey="month" tick={AXIS} tickLine={false} />
          <YAxis yAxisId="money" tick={AXIS} tickFormatter={moneyTick} width={72} />
          <YAxis yAxisId="units" orientation="right" tick={AXIS} allowDecimals={false} width={36} />
          <ChartTooltip formatter={(value, name) => name === "Fulfilled sales" ? money(String(value)) : `${value} units`} />
          <Legend wrapperStyle={{ fontSize: 12 }} iconSize={12} verticalAlign="top" align="right" />
          <Bar yAxisId="money" dataKey="revenue" name="Fulfilled sales" fill={chart.chartPrimary} radius={[4, 4, 0, 0]} maxBarSize={44} />
          <Line yAxisId="units" type="monotone" dataKey="returned" name="Units returned" stroke={chart.underReview} strokeWidth={2} dot={{ r: 3 }} />
        </ComposedChart></ResponsiveContainer>
      </ChartCard>
      <DeliveryCard analysis={analysis} />
      <ChartCard title="Orders by status" subtitle="All non-cancelled sales orders" summary={`Orders by status: ${pipeline.map(p => `${p.status} ${p.count}`).join(", ")}`} empty={pipeline.length ? undefined : "No sales orders yet."}>
        <ResponsiveContainer width="100%" height="100%"><BarChart data={pipeline} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid {...GRID} horizontal={false} />
          <XAxis type="number" tick={AXIS} allowDecimals={false} />
          <YAxis type="category" dataKey="status" tick={AXIS} width={110} />
          <ChartTooltip formatter={value => `${value} orders`} />
          <Bar dataKey="count" name="Orders" radius={[0, 4, 4, 0]} maxBarSize={28}>{pipeline.map(p => <Cell key={p.key} fill={STATUS_SERIES[p.key] ?? chart.chartPrimary} />)}</Bar>
        </BarChart></ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Stock value by category" subtitle={`At selling price · ${money(dashboard.inventory_value)} in total`} summary={`Stock value by category: ${categories.map(c => `${c.name} ${money(String(c.value), true)}`).join(", ")}`} empty={categories.length ? undefined : "No stock value recorded."}>
        <ResponsiveContainer width="100%" height="100%"><PieChart>
          <Pie data={categories} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={2}>{categories.map((c, i) => <Cell key={c.name} fill={SERIES[i % SERIES.length]} />)}</Pie>
          <ChartTooltip formatter={value => money(String(value))} />
          <Legend wrapperStyle={{ fontSize: 12 }} iconSize={12} layout="vertical" align="right" verticalAlign="middle" />
        </PieChart></ResponsiveContainer>
      </ChartCard>
    </Box>
    <ChartCard title="Top products by shipped value" subtitle="Units shipped × order price, all time" summary={`Top products: ${top.map(p => `${p.name} ${money(String(p.revenue), true)}`).join(", ")}`} empty={top.length ? undefined : "No shipped products yet."}>
      <ResponsiveContainer width="100%" height="100%"><BarChart data={top} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid {...GRID} horizontal={false} />
        <XAxis type="number" tick={AXIS} tickFormatter={moneyTick} />
        <YAxis type="category" dataKey="name" tick={AXIS} width={170} />
        <ChartTooltip formatter={(value, _name, item) => `${money(String(value))} · ${(item?.payload as { units?: number } | undefined)?.units ?? 0} units`} />
        <Bar dataKey="revenue" name="Shipped value" fill={chart.resolved} radius={[0, 4, 4, 0]} maxBarSize={26} />
      </BarChart></ResponsiveContainer>
    </ChartCard>
    <Typography variant="caption" color="text.secondary">{analysis.basis}</Typography>
  </Stack>;
}

function DeliveryCard({ analysis }: { analysis: Analysis }) {
  const [view, setView] = useState<"distribution" | "monthly">("distribution");
  const d = analysis.delivery;
  const target = analysis.targets.delivery_days;
  const monthly = analysis.trend.map(row => ({ month: monthLabel(row.month), days: row.avg_delivery_days == null ? null : Number(row.avg_delivery_days) }));
  const backfilled = d.sources?.backfill ?? 0;
  const stats = [["Average", d.average_days == null ? "Not available" : `${d.average_days} days`], ["Median", d.median_days == null ? "Not available" : `${d.median_days} days`], ["On time", d.on_time_rate == null ? "Not available" : `${d.on_time_rate}%`], ["Measured", `${d.samples} orders`]];
  return <Card sx={{ minWidth: 0 }}><CardContent>
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
      <Box><Typography variant="h5" component="h3">Days to deliver</Typography><Typography variant="caption" color="text.secondary">Order date to delivery · target {target} days</Typography></Box>
      {d.samples > 0 && <ToggleButtonGroup size="small" exclusive value={view} onChange={(_, next) => next && setView(next)} aria-label="Delivery chart view"><ToggleButton value="distribution">Distribution</ToggleButton><ToggleButton value="monthly">By month</ToggleButton></ToggleButtonGroup>}
    </Stack>
    {d.samples === 0 ? <Box sx={{ height: 240, display: "grid", placeItems: "center", textAlign: "center", px: 2 }}><Typography variant="body2" color="text.secondary">No delivery dates recorded yet{d.excluded ? `; ${d.excluded} shipped orders have no delivery date` : ""}.</Typography></Box> : <>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 1, mt: 2 }}>{stats.map(([label, value]) => <Box key={label}><Typography variant="caption" color="text.secondary">{label}</Typography><Typography variant="subtitle1" component="p" fontWeight={700} sx={{ fontVariantNumeric: "tabular-nums" }}>{value}</Typography></Box>)}</Box>
      <Box role="img" aria-label={view === "distribution" ? `Delivery time distribution: ${d.buckets.map(b => `${b.label}: ${b.count}`).join(", ")}` : `Average days to deliver by month: ${monthly.map(m => `${m.month} ${m.days ?? "no deliveries"}`).join(", ")}`} sx={{ height: 200, mt: 1 }}>
        <ResponsiveContainer width="100%" height="100%">{view === "distribution" ? <BarChart data={d.buckets} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid {...GRID} vertical={false} />
          <XAxis dataKey="label" tick={AXIS} tickLine={false} />
          <YAxis tick={AXIS} allowDecimals={false} width={32} />
          <ChartTooltip formatter={value => `${value} orders`} />
          <Bar dataKey="count" name="Orders" radius={[4, 4, 0, 0]} maxBarSize={48}>{d.buckets.map((b, i) => <Cell key={b.label} fill={i < 3 ? chart.resolved : i === 3 ? chart.underReview : chart.delayedAlt} />)}</Bar>
        </BarChart> : <LineChart data={monthly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid {...GRID} vertical={false} />
          <XAxis dataKey="month" tick={AXIS} tickLine={false} />
          <YAxis tick={AXIS} allowDecimals={false} width={32} domain={[0, (max: number) => Math.max(target + 2, Math.ceil(max) + 1)]} />
          <ChartTooltip formatter={value => `${value} days average`} />
          <ReferenceLine y={target} stroke={chart.delayedAlt} strokeDasharray="4 4" label={{ value: `Target ${target}`, fontSize: 11, position: "insideTopRight", fill: chart.delayedAlt }} />
          <Line type="monotone" dataKey="days" name="Average days" stroke={chart.chartPrimary} strokeWidth={2} dot={{ r: 4 }} connectNulls />
        </LineChart>}</ResponsiveContainer>
      </Box>
      {backfilled > 0 && <Typography variant="caption" color="text.secondary">{backfilled} of {d.samples} delivery dates were backfilled for history; new deliveries are measured as they are recorded.</Typography>}
    </>}
  </CardContent></Card>;
}

export function AlertsTab({ analysis }: { analysis: Analysis }) {
  const [filter, setFilter] = useState<"all" | AlertSeverity>("all");
  const shown = analysis.alerts.filter(a => filter === "all" || a.severity === filter);
  return <Card><CardContent>
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1.5}>
      <Box><Typography variant="h5" component="h2">Alerts</Typography><Typography variant="caption" color="text.secondary">Targets: ship within {analysis.targets.delivery_days} days · approve within {analysis.targets.approval_days} days · review returns within {analysis.targets.return_days} days</Typography></Box>
      <ToggleButtonGroup size="small" exclusive value={filter} onChange={(_, value) => value && setFilter(value)} aria-label="Filter alerts by severity">
        <ToggleButton value="all">All ({analysis.alerts.length})</ToggleButton>
        {(["critical", "warning", "info"] as const).map(s => <ToggleButton key={s} value={s}>{SEVERITY_TEXT[s]} ({analysis.alert_counts[s]})</ToggleButton>)}
      </ToggleButtonGroup>
    </Stack>
    {shown.length ? <List sx={{ mt: 1 }}>{shown.map((alert, index) => <AlertRow key={`${alert.kind}-${index}`} alert={alert} />)}</List>
      : <Stack alignItems="center" spacing={1} sx={{ py: 6 }}><CheckCircleRoundedIcon color="success" sx={{ fontSize: 40 }} /><Typography variant="h6">{filter === "all" ? "No open alerts" : `No ${SEVERITY_TEXT[filter].toLowerCase()} alerts`}</Typography><Typography variant="body2" color="text.secondary">Orders, stock, returns and purchasing are within target.</Typography></Stack>}
    {analysis.alerts.length >= 25 && <Alert severity="info" sx={{ mt: 2 }}>Showing the 25 most urgent alerts.</Alert>}
  </CardContent></Card>;
}
