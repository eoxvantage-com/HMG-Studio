import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router";
import { Alert, Box, Breadcrumbs, Button, Card, CardContent, Chip, InputAdornment, LinearProgress, Link, MenuItem, Skeleton, Stack, TablePagination, TextField, Typography } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import { PageContainer } from "../../components/PageContainer";
import { RecordExportActions } from "../../components/RecordExportActions";
import { usePersonalNotifications } from "../../services/notificationQueries";
import { safeNotificationPath, type NotificationRecord } from "../../services/notifications";
import { displayValue } from "../../services/erp";

type Action = "list" | "show" | "create" | "edit";
function NotificationCard({ row, detail }: { row: NotificationRecord; detail?: boolean }) {
  const path = safeNotificationPath(row.action_url);
  return <Card component="article" variant="outlined"><CardContent><Stack spacing={1.5}>
    <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" spacing={1}>
      <Typography variant={detail ? "h2" : "h6"}>{detail ? row.title : <Link component={RouterLink} to={`/notifications/show/${row.id}`} underline="hover" color="text.primary">{row.title}</Link>}</Typography>
      <Stack direction="row" spacing={1}><Chip label={row.read_at ? "Read" : "Unread"} color={row.read_at ? "default" : "info"} size="small" /><Chip label={row.priority} variant="outlined" size="small" /></Stack>
    </Stack>
    <Typography color="text.secondary" variant="caption">{row.type} · {displayValue({ name: "created_at", type: "datetime" }, row.created_at)}</Typography>
    <Typography sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{row.message}</Typography>
    {path && <Box><Button component={RouterLink} to={path} variant="outlined">Open related record</Button></Box>}
  </Stack></CardContent></Card>;
}
export function NotificationsPage({ action = "list", id }: { action?: Action; id?: string }) {
  const [search, setSearch] = useState(""); const [debounced, setDebounced] = useState("");
  const [status, setStatus] = useState<"all" | "read" | "unread">("all"); const [type, setType] = useState(""); const [debouncedType, setDebouncedType] = useState("");
  const [page, setPage] = useState(1); const [pageSize, setPageSize] = useState(10);
  const mutationRoute = action === "create" || action === "edit";
  useEffect(() => { const timer = window.setTimeout(() => { setDebounced(search); setDebouncedType(type); setPage(1); }, 350); return () => window.clearTimeout(timer); }, [search, type]);
  const detail = action === "show";
  const inbox = usePersonalNotifications({ search: detail ? "" : debounced, status: detail ? "all" : status, type: detail ? "" : debouncedType,
    page: detail ? 1 : page, pageSize: detail ? 1 : pageSize, id: detail ? id ?? "" : undefined, enabled: !mutationRoute });
  const empty = debounced.trim() ? "No results found" : status !== "all" || debouncedType.trim() ? "No matching notifications" : action === "show" ? "Notification not found" : "No notifications yet";
  const clear = () => { setSearch(""); setType(""); setStatus("all"); setPage(1); };
  return <PageContainer><Stack spacing={3}>
    <Breadcrumbs><Link component={RouterLink} to="/">Workspace</Link>{action === "list" ? <Typography>Notifications</Typography> : <Link component={RouterLink} to="/notifications">Notifications</Link>}{action !== "list" && <Typography>{action === "show" ? "Detail" : "Unavailable action"}</Typography>}</Breadcrumbs>
    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}><Box><Typography variant="h2">{action === "show" ? "Notification details" : "Notifications"}</Typography><Typography color="text.secondary">Your operational updates, stock alerts and workflow notices.</Typography></Box>{!mutationRoute && <Button startIcon={<RefreshRoundedIcon />} onClick={() => inbox.refetch()} disabled={!inbox.owner || inbox.isFetching}>Refresh</Button>}</Stack>
    <Alert severity="info">Notification changes are unavailable until backend ownership and persistence checks pass. Opening a message does not mark it as read.</Alert>
    {mutationRoute ? <Button component={RouterLink} to="/notifications">Back to notifications</Button> : <>
      {action === "list" && <><Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField label="Search notifications" value={search} onChange={event => setSearch(event.target.value)} slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment> } }} />
        <TextField select label="Read status" value={status} onChange={event => { setStatus(event.target.value as typeof status); setPage(1); }} sx={{ minWidth: 160 }}><MenuItem value="all">All</MenuItem><MenuItem value="unread">Unread</MenuItem><MenuItem value="read">Read</MenuItem></TextField>
        <TextField label="Notification type" value={type} onChange={event => setType(event.target.value)} helperText="Exact type, e.g. info or warning" />
      </Stack><Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" aria-label="Active notification filters">{search.trim() && <Chip label={`Search: ${search}`} onDelete={() => setSearch("")} />}{status !== "all" && <Chip label={status === "read" ? "Read" : "Unread"} onDelete={() => { setStatus("all"); setPage(1); }} />}{type.trim() && <Chip label={`Type: ${type}`} onDelete={() => setType("")} />}</Stack></>}
      {inbox.loading ? <Box role="status" aria-label="Loading notifications"><Skeleton variant="rounded" height={100} /><Skeleton height={100} /></Box> : inbox.identityUnavailable ? <Alert severity="warning">Unable to identify your account. Sign in again to view personal notifications.</Alert> : inbox.failed ? <Alert severity="error" action={<Button onClick={() => inbox.refetch()}>Try again</Button>}>Unable to load notifications</Alert> : inbox.page && <>
        {inbox.isFetching && <LinearProgress aria-label="Refreshing notifications" />}
        {!inbox.isFetching && inbox.page.data.length > 0 && <RecordExportActions title="Personal notifications" filename="HMG-personal-notifications" scopeLabel={detail ? "Current notification only" : "Current personal inbox page only"} columns={[{ key: "title", label: "Title" }, { key: "message", label: "Message" }, { key: "type", label: "Type" }, { key: "priority", label: "Priority" }, { key: "status", label: "Read status" }, { key: "created_at", label: "Created" }]} rows={inbox.page.data.map(row => ({ title: row.title, message: row.message, type: row.type, priority: row.priority, status: row.read_at ? "Read" : "Unread", created_at: displayValue({ name: "created_at", type: "datetime" }, row.created_at) }))} />}
        {inbox.page.data.length ? <Stack spacing={2}>{inbox.page.data.map(row => <NotificationCard key={row.id} row={row} detail={action === "show"} />)}</Stack> : <Card><CardContent><Stack alignItems="center" spacing={2} sx={{ py: 4 }}><NotificationsNoneRoundedIcon color="disabled" fontSize="large" /><Typography variant="h6">{empty}</Typography><Typography color="text.secondary">{empty === "No notifications yet" ? "New updates for your account will appear here." : "Check your filters or return to the inbox."}</Typography>{action === "list" && <Button onClick={clear}>Clear filters</Button>}</Stack></CardContent></Card>}
        {action === "list" && <TablePagination component="div" count={inbox.page.total} page={page - 1} rowsPerPage={pageSize} rowsPerPageOptions={[10, 20, 50, 100]} onPageChange={(_, value) => setPage(value + 1)} onRowsPerPageChange={event => { setPageSize(Number(event.target.value)); setPage(1); }} />}
      </>}
    </>}
  </Stack></PageContainer>;
}
