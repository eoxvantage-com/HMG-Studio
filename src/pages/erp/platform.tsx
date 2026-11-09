import { useEffect, useMemo, useState } from "react";
import { useList, useOne, type CrudFilters } from "@refinedev/core";
import { useDataGrid } from "@refinedev/mui";
import type { RoleData } from "@taruvi/sdk";
import type { TaruviUser } from "../../providers/refineProviders";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Alert, Box, Breadcrumbs, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, LinearProgress, Link, MenuItem, Skeleton, Stack, Tab, Tabs, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { PageContainer } from "../../components/PageContainer";
import { ERP_QUERY_OPTIONS } from "../../services/erp";

const userSorters = [{ field: "username", order: "asc" as const }];
// Directory grouping only; Taruvi still enforces authorization server-side.
const teamFilters: CrudFilters = [{ field: "roles", operator: "eq", value: "hmg-studio-hmg-team" }];
const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric", timeZone: "UTC" });
const date = (value?: string) => value && Number.isFinite(Date.parse(value)) ? dateFormatter.format(new Date(value)) : "—";
function NativeLoading({ label }: { label: string }) {
  return <Box role="status" aria-label={label}><Skeleton height={45} /><Skeleton variant="rounded" height={260} /></Box>;
}
function NativeError({ label, retry }: { label: string; retry: () => void }) {
  return <Alert severity="error" action={<Button onClick={retry}>Try again</Button>}><Typography>Unable to load {label}</Typography><Typography variant="body2">Your role may not permit this native management API. No changes have been made.</Typography></Alert>;
}
function UserDetail({ username, close }: { username: string; close: () => void }) {
  // Native /users/{username}/ does not resolve the UUID returned by the list.
  const { result: user, query } = useOne<TaruviUser>({ resource: "users", dataProviderName: "user", id: encodeURIComponent(username), queryOptions: ERP_QUERY_OPTIONS, errorNotification: false });
  const [tab, setTab] = useState("profile");
  return <Dialog open onClose={close} fullWidth maxWidth="md" aria-labelledby="native-user-title"><DialogTitle id="native-user-title">User details</DialogTitle><DialogContent>
    {query.isLoading ? <NativeLoading label="Loading user details" /> : query.isError || !user || user.username !== username ? <Alert severity="error" action={<Button onClick={() => query.refetch()}>Try again</Button>}><Typography>Unable to load user details</Typography><Typography variant="body2">This account is unavailable or your access has changed. No changes have been made.</Typography></Alert> : <Stack spacing={3}>
      <Breadcrumbs><Typography>Users</Typography><Typography>{user.username}</Typography></Breadcrumbs>
      <Stack direction="row" spacing={2} alignItems="center"><Typography variant="h2">{user.full_name || [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username}</Typography><Chip label={user.is_active ? "Active" : "Inactive"} color={user.is_active ? "success" : "default"} size="small" /></Stack>
      <Typography variant="body2" color="text.secondary">{user.username} · Joined {date(user.date_joined)} · Last sign-in {date(user.last_login)}</Typography>
      <Tabs value={tab} onChange={(_, value) => setTab(value)} aria-label="User details"><Tab value="profile" label="Profile" /><Tab value="roles" label={`Roles (${Array.isArray(user.roles) ? user.roles.length : "not returned"})`} /></Tabs>
      {tab === "profile" ? <Card><CardContent><Stack spacing={2}><Box><Typography variant="overline">Email</Typography><Typography>{user.email || "—"}</Typography></Box><Box><Typography variant="overline">Platform access</Typography><Typography>{user.is_staff ? "Staff" : "Standard user"}</Typography></Box></Stack></CardContent></Card>
        : Array.isArray(user.roles) ? user.roles.length ? <Stack spacing={2}>{user.roles.map((role, index) => <Card key={`${role.app_slug}:${role.slug}:${index}`}><CardContent><Typography variant="h6">{role.name}</Typography><Typography variant="body2" color="text.secondary">{role.app_slug} · {role.source} · {role.slug}</Typography></CardContent></Card>)}</Stack> : <Alert severity="info">No roles were returned for this user.</Alert> : <Alert severity="info">Role assignments were not included in the native response.</Alert>}
    </Stack>}
  </DialogContent><DialogActions><Button onClick={close}>Close</Button></DialogActions></Dialog>;
}
function UsersList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<string>();
  const { dataGridProps, result, tableQuery, setFilters, setCurrentPage } = useDataGrid<TaruviUser>({ resource: "users", dataProviderName: "user", filters: { permanent: teamFilters }, pagination: { mode: "server", pageSize: 10 }, sorters: { initial: userSorters }, syncWithLocation: false, queryOptions: ERP_QUERY_OPTIONS, errorNotification: false });
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const filters: CrudFilters = [];
      if (search.trim()) filters.push({ field: "search", operator: "eq", value: search.trim() });
      if (status) filters.push({ field: "is_active", operator: "eq", value: status === "active" });
      setCurrentPage(1); setFilters(filters, "replace");
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search, status, setFilters, setCurrentPage]);
  const columns = useMemo<GridColDef<TaruviUser>[]>(() => [
    { field: "username", headerName: "Username", flex: 1, minWidth: 160 },
    { field: "full_name", headerName: "Name", flex: 1, minWidth: 150, sortable: false, renderCell: ({ row }) => row.full_name || [row.first_name, row.last_name].filter(Boolean).join(" ") || "—" },
    { field: "email", headerName: "Email", flex: 1.5, minWidth: 200 },
    { field: "is_active", headerName: "Status", width: 120, renderCell: ({ value }) => <Chip size="small" label={value ? "Active" : "Inactive"} color={value ? "success" : "default"} /> },
    { field: "date_joined", headerName: "Joined", width: 145, valueFormatter: value => date(value) },
    { field: "actions", headerName: "Actions", align: "right", headerAlign: "right", width: 95, sortable: false, renderCell: ({ row }) => <Button size="small" aria-label={`View ${row.username}`} disabled={!row.username} onClick={() => setSelected(row.username)}>View</Button> },
  ], []);
  const emptyTitle = search.trim() ? "No results found" : status ? "No matching items" : "No users yet";
  return <Stack spacing={3}>
    <Alert severity="info">Live Taruvi accounts assigned to HMG Team. Other apps and validation accounts are not included in this directory. Taruvi may omit staff administrators from this endpoint; their membership is managed in Taruvi Console. Account creation, password resets and role changes are managed there.</Alert>
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}><TextField label="Search users" value={search} onChange={event => setSearch(event.target.value)} sx={{ width: { xs: "100%", sm: 320 } }} slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment> } }} /><TextField select label="Status" value={status} onChange={event => setStatus(event.target.value)} sx={{ minWidth: 180 }}><MenuItem value="">All users</MenuItem><MenuItem value="active">Active</MenuItem><MenuItem value="inactive">Inactive</MenuItem></TextField><Button startIcon={<RefreshRoundedIcon />} onClick={() => tableQuery.refetch()} disabled={tableQuery.isFetching}>Refresh</Button></Stack>
    {(search || status) && <Stack direction="row" gap={1} flexWrap="wrap">{search && <Chip variant="outlined" label={`Search: ${search}`} onDelete={() => setSearch("")} />}{status && <><Chip variant="outlined" color="primary" label={`Status: ${status}`} onDelete={() => setStatus("")} /><Button size="small" onClick={() => setStatus("")}>Clear all filters</Button></>}</Stack>}
    {tableQuery.isLoading ? <NativeLoading label="Loading users" /> : tableQuery.isError ? <NativeError label="users" retry={() => tableQuery.refetch()} /> : <Box sx={{ width: "100%" }}><DataGrid {...dataGridProps} rowCount={result.total ?? 0} columns={columns} autoHeight disableColumnFilter disableRowSelectionOnClick pageSizeOptions={[10, 20, 50, 100]} loading={tableQuery.isFetching}
      slots={{ noRowsOverlay: () => <Stack justifyContent="center" alignItems="center" spacing={1} sx={{ height: "100%", p: 3 }}><Typography variant="h6">{emptyTitle}</Typography><Typography color="text.secondary">{search || status ? "Adjust your search or status filter." : "No native users were returned for your current access."}</Typography>{search ? <Button onClick={() => setSearch("")}>Clear search</Button> : status ? <Button onClick={() => setStatus("")}>Clear all filters</Button> : <Button onClick={() => tableQuery.refetch()}>Refresh directory</Button>}</Stack> }} sx={{ minHeight: !result.data.length ? 330 : undefined }} /></Box>}
    {selected && <UserDetail key={selected} username={selected} close={() => setSelected(undefined)} />}
  </Stack>;
}
function RolesList() {
  // Installed appDataProvider calls App.roles().execute() without query arguments.
  // Do not simulate unsupported server filtering, sorting or pagination locally.
  const { result, query } = useList<RoleData>({ resource: "roles", dataProviderName: "app", pagination: { mode: "off" }, queryOptions: ERP_QUERY_OPTIONS, errorNotification: false });
  return <Stack spacing={3}>
    <Alert severity="info">The native roles endpoint does not support server-side search, filters or pagination. This is the returned role list, not a locally filtered or paginated copy. Role and permission changes are unavailable.</Alert>
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}><TextField label="Search roles" disabled helperText="Unavailable in the native endpoint" sx={{ width: { xs: "100%", sm: 320 } }} /><TextField label="Role filter" disabled value="All returned roles" /><Button startIcon={<RefreshRoundedIcon />} onClick={() => query.refetch()} disabled={query.isFetching}>Refresh</Button></Stack>
    {query.isFetching && !query.isLoading && <LinearProgress aria-label="Refreshing roles" />}
    {query.isLoading ? <NativeLoading label="Loading roles" /> : query.isError || !Array.isArray(result.data) ? <NativeError label="roles" retry={() => query.refetch()} /> : !result.data.length ? <Stack alignItems="center" spacing={1} sx={{ py: 5 }}><Typography variant="h6">No roles yet</Typography><Typography color="text.secondary">No roles were returned for this app and your current access.</Typography><Button onClick={() => query.refetch()}>Refresh roles</Button></Stack>
      : <Card><Box sx={{ overflowX: "auto" }}><Table aria-label="Native app roles"><TableHead><TableRow><TableCell>Role</TableCell><TableCell>Slug</TableCell><TableCell>Description</TableCell><TableCell>Returned permissions</TableCell><TableCell>Updated</TableCell></TableRow></TableHead><TableBody>{result.data.map(role => <TableRow key={role.id}><TableCell>{role.name}</TableCell><TableCell>{role.slug || "—"}</TableCell><TableCell>{role.description || "—"}</TableCell><TableCell>{Array.isArray(role.permissions) ? role.permissions.length ? <Stack direction="row" gap={1} flexWrap="wrap">{role.permissions.map(permission => <Chip key={permission} size="small" label={permission} variant="outlined" />)}</Stack> : "None returned" : "Not provided"}</TableCell><TableCell>{date(role.updated_at)}</TableCell></TableRow>)}</TableBody></Table></Box><Typography variant="caption" component="p" sx={{ p: 2 }}>Returned {result.data.length} roles{typeof result.total === "number" && result.total !== result.data.length ? `; server reports ${result.total}. Additional results are not exposed by this provider.` : ""}</Typography></Card>}
  </Stack>;
}
export function NativeManagementPage({ kind }: { kind: "users" | "roles" }) {
  const title = kind === "users" ? "Users" : "Roles & Permissions";
  return <PageContainer><Stack spacing={3}><Breadcrumbs><Link component={RouterLink} to="/">Workspace</Link><Typography>{title}</Typography></Breadcrumbs><Box><Typography variant="h2">{title}</Typography><Typography color="text.secondary">Native Taruvi identity and app access. No separate identity tables.</Typography></Box>{kind === "users" ? <UsersList /> : <RolesList />}</Stack></PageContainer>;
}
