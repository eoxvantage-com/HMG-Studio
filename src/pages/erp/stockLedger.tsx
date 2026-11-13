import { useEffect, useMemo, useState } from "react";
import { useList, type CrudFilters } from "@refinedev/core";
import { Alert, Autocomplete, Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField, Typography } from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import AddLocationAltRoundedIcon from "@mui/icons-material/AddLocationAltRounded";
import type { useCommerceLedger } from "../../hooks/useCommerceLedger";
import { ERP_QUERY_OPTIONS, type ErpRecord } from "../../services/erp";
import { newCommerceCommand, type CommerceCommand } from "../../services/stockLedger";
import { reportUuid } from "../../services/operationalReports";
import { useToastOnError } from "../../hooks/useToastOnError";

type Props = { organizationId: string; ledger: ReturnType<typeof useCommerceLedger>; kind: "movement" | "adjustment"; queueOnly?: boolean; onDirtyChange?: (dirty: boolean) => void };
type ReviewAction = "approve" | "reject" | "reverse";
type Review = { action: ReviewAction; target: string };
const text = (value: unknown) => typeof value === "string" ? value : "";
const STATUS_COLOR: Record<string, "warning" | "success" | "error" | "default"> = { pending: "warning", posted: "success", rejected: "error", reversed: "default" };
const STATUS_LABEL: Record<string, string> = { pending: "Pending", posted: "Posted", rejected: "Rejected", reversed: "Reversed" };
const REVIEW_COPY: Record<ReviewAction, { title: string; button: string; note: string; effect: string; color: "primary" | "error" }> = {
  approve: { title: "Approve and post this request?", button: "Approve and post", note: "Approved after review", effect: "Stock is posted now. The server rechecks quantities and reservations first.", color: "primary" },
  reject: { title: "Reject this request?", button: "Reject request", note: "Rejected after review", effect: "No stock changes. The request stays in the history as rejected.", color: "error" },
  reverse: { title: "Reverse this posted request?", button: "Reverse request", note: "Reversed: entered in error", effect: "A balancing entry is added. The original posting stays in the history.", color: "error" },
};

/** One parent-owned session/retry controller for every commerce and stock command. */
export function StockLedgerWorkspace(props: Props) { return <StockLedgerInner key={`${props.ledger.owner}:${props.organizationId}:${props.kind}`} {...props} />; }

function StockLedgerInner({ organizationId, ledger, kind, queueOnly = false, onDirtyChange }: Props) {
  const [productId, setProductId] = useState("");
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [registerLocation, setRegisterLocation] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [search, setSearch] = useState("");
  const [dirty, setDirty] = useState(false);
  const [confirm, setConfirm] = useState<CommerceCommand | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [error, setError] = useState("");
  useToastOnError(error, "Stock request not saved");
  const [status, setStatus] = useState("pending");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const state = ledger.enabled && ledger.state?.organization_id === organizationId ? ledger.state : null;
  const locked = ledger.locked || !state;
  const dialogOpen = !!confirm || !!review;
  useEffect(() => { onDirtyChange?.(dirty || dialogOpen); return () => onDirtyChange?.(false); }, [dirty, dialogOpen, onDirtyChange]);

  const filters = useMemo<CrudFilters>(() => [{ field: "organization_id", operator: "eq", value: organizationId }, { field: "is_active", operator: "eq", value: true }, { field: "deleted_at", operator: "null", value: true }], [organizationId]);
  const productFilters = useMemo<CrudFilters>(() => [...filters, { field: "type", operator: "eq", value: "standard" }, { field: "tracking_type", operator: "eq", value: "none" }, ...(search.trim() ? [{ field: "name", operator: "contains" as const, value: search.trim() }] : [])], [filters, search]);
  const meta = useMemo(() => ({ lookupOwner: ledger.owner }), [ledger.owner]);
  const products = useList<ErpRecord>({ resource: "products", filters: productFilters, pagination: { mode: "server", currentPage: 1, pageSize: 100 }, meta, queryOptions: { ...ERP_QUERY_OPTIONS, enabled: !!state }, errorNotification: false });
  const locations = useList<ErpRecord>({ resource: "product_locations", filters, pagination: { mode: "server", currentPage: 1, pageSize: 100 }, meta, queryOptions: { ...ERP_QUERY_OPTIONS, enabled: !!state }, errorNotification: false });
  const productOptions = state && !products.query.isError ? products.result.data.filter(row => row.organization_id === organizationId && row.is_active === true && row.deleted_at === null && row.type === "standard" && row.tracking_type === "none" && row.has_variants === false && reportUuid(row.id)) : [];
  const locationOptions = state && !locations.query.isError ? locations.result.data.filter(row => row.organization_id === organizationId && row.is_active === true && row.deleted_at === null && reportUuid(row.id)) : [];
  const lookupFailed = products.query.isError || locations.query.isError || (locations.result.total ?? 0) > 100;
  const bins = state?.balances.filter(bin => bin.product_id === productId) ?? [];
  const availableLocations = locationOptions.filter(location => bins.some(bin => bin.location_id === location.id));
  const emptyLocations = locationOptions.filter(location => !bins.some(bin => bin.location_id === location.id));
  const name = (id: unknown) => text(productOptions.find(row => row.id === id)?.name) || `Product ID ${text(id)}`;
  const place = (id: unknown) => text(locationOptions.find(row => row.id === id)?.name) || `Location ID ${text(id)}`;
  const sourceBin = bins.find(bin => bin.location_id === source);
  const noun = kind === "movement" ? "transfer" : "adjustment";

  const clear = () => { setDirty(false); setConfirm(null); setReason(""); setAmount(""); setError(""); };
  const change = (setter: (value: string) => void, value: string) => { setter(value); setDirty(true); };
  const fail = (failure: unknown) => setError(failure instanceof Error ? failure.message : "Check the request fields.");

  const stage = (action: "submit" | "register_bins") => {
    try {
      if (locked) throw new Error("Refresh the workflow before continuing.");
      if (!reason.trim()) throw new Error("Enter a reason for this request.");
      if (lookupFailed || products.query.isFetching || locations.query.isFetching || !productOptions.some(row => row.id === productId)) throw new Error("Choose an active standard product and wait for locations to load.");
      if (action === "register_bins") {
        if (!emptyLocations.some(row => row.id === registerLocation)) throw new Error("Choose a location where this product is not yet stocked.");
        setConfirm(newCommerceCommand({ action, reason: reason.trim(), bins: [{ product_id: productId, location_id: registerLocation }] }));
      } else {
        const quantity = Number(amount);
        if (!Number.isInteger(quantity) || quantity === 0 || Math.abs(quantity) > 2147483647) throw new Error("Enter a whole quantity other than zero.");
        if (!sourceBin || !availableLocations.some(row => row.id === source)) throw new Error(kind === "movement" ? "Choose the location to move stock from." : "Choose the location to adjust.");
        if (kind === "movement" && (quantity < 1 || destination === source || !availableLocations.some(row => row.id === destination))) throw new Error("Choose a different destination and a positive quantity.");
        if ((kind === "movement" ? quantity : -quantity) > sourceBin.quantity - sourceBin.reserved) throw new Error("This request exceeds available stock after reservations.");
        const line = kind === "movement" ? { product_id: productId, source, destination, quantity } : { product_id: productId, location_id: source, delta: quantity };
        setConfirm(newCommerceCommand({ action, kind, reason: reason.trim(), lines: [line] }));
      }
      setError("");
    } catch (failure) { fail(failure); }
  };

  const openReview = (action: ReviewAction, target: string) => {
    const request = state?.stock_requests[target];
    if (locked || !request || request.command.kind !== kind || request.command.action !== "submit" || (action === "reverse" ? request.status !== "posted" : request.status !== "pending")) { fail(new Error("This request is not eligible for the selected action.")); return; }
    setError(""); setReviewNote(REVIEW_COPY[action].note); setReview({ action, target });
  };

  const submitConfirm = async () => { if (!confirm) return; const result = await ledger.execute(confirm); if (result) clear(); else setConfirm(null); };
  const submitReview = async () => {
    if (!review || !reviewNote.trim()) return;
    const result = await ledger.execute(newCommerceCommand({ action: review.action, target_request_id: review.target, reason: reviewNote.trim() }));
    setReview(null);
    if (result) setReviewNote("");
  };

  const requests = Object.entries(state?.stock_requests ?? {}).filter(([, request]) => request.command.action === "submit" && request.command.kind === kind && (!status || request.status === status));
  useEffect(() => setPage(0), [status, state?.head]);
  const lineSummary = (command: CommerceCommand) => (command.lines ?? []).map((raw, index) => {
    const line = raw as Record<string, unknown>;
    return <Typography key={index} variant="body2">{name(line.product_id)}: {command.kind === "movement" ? `${place(line.source)} → ${place(line.destination)}, ${line.quantity} units` : `${place(line.location_id)}, ${Number(line.delta) > 0 ? "+" : ""}${line.delta} units`}</Typography>;
  });
  const confirmSummary = (command: CommerceCommand) => command.action === "register_bins"
    ? <Typography variant="body2">Add {place(command.bins?.[0]?.location_id)} as a stock location for {name(command.bins?.[0]?.product_id)}. It starts at zero; record stock with a receipt or an approved adjustment.</Typography>
    : lineSummary(command);
  const reviewTarget = review ? state?.stock_requests[review.target] : undefined;

  return <Stack spacing={2.5}>
    <Box>
      <Typography variant="h3">{kind === "movement" ? "Stock movements" : "Stock adjustments"}</Typography>
      <Typography variant="body2" color="text.secondary">{kind === "movement" ? "Move stock between locations." : "Correct counted stock up or down."} Requests post only after approval, and reserved stock is protected.</Typography>
    </Box>
    {!state && <Alert severity="warning">Select an organization with an active ledger and refresh. Your draft is kept while posting is unavailable.</Alert>}
    {lookupFailed && <Alert severity="error">Products or locations could not be loaded completely. Narrow the product search or refresh.</Alert>}
    {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}

    <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", lg: queueOnly ? "1fr" : "minmax(320px, 5fr) 7fr" }, alignItems: "start" }}>
      {!queueOnly && <Card><CardContent><Stack spacing={2}>
        <Typography variant="h6" component="h4">New {noun} request</Typography>
        <Autocomplete options={productOptions} value={productOptions.find(row => row.id === productId) ?? null} disabled={locked || dialogOpen} loading={products.query.isFetching} filterOptions={items => items} getOptionLabel={row => `${text(row.name)} · ${text(row.sku)}`} isOptionEqualToValue={(a, b) => a.id === b.id} onInputChange={(_, value, why) => { if (why === "input") setSearch(value); }} onChange={(_, row) => { change(setProductId, row?.id ?? ""); setSource(""); setDestination(""); setRegisterLocation(""); }} renderInput={params => <TextField {...params} label="Product" helperText="Search active standard products." />} />
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: kind === "movement" ? "1fr 1fr" : "1fr" } }}>
          <Autocomplete options={availableLocations} value={availableLocations.find(row => row.id === source) ?? null} disabled={locked || !productId || dialogOpen} getOptionLabel={row => text(row.name)} isOptionEqualToValue={(a, b) => a.id === b.id} onChange={(_, row) => change(setSource, row?.id ?? "")} renderInput={params => <TextField {...params} label={kind === "movement" ? "Source location" : "Location"} helperText={sourceBin ? `${(sourceBin.quantity - sourceBin.reserved).toLocaleString()} available` : " "} />} />
          {kind === "movement" && <Autocomplete options={availableLocations.filter(row => row.id !== source)} value={availableLocations.find(row => row.id === destination) ?? null} disabled={locked || !productId || dialogOpen} getOptionLabel={row => text(row.name)} isOptionEqualToValue={(a, b) => a.id === b.id} onChange={(_, row) => change(setDestination, row?.id ?? "")} renderInput={params => <TextField {...params} label="Destination location" helperText=" " />} />}
        </Box>
        <TextField label={kind === "movement" ? "Quantity" : "Adjustment quantity"} type="number" value={amount} disabled={locked || dialogOpen} slotProps={{ htmlInput: { step: 1 } }} onChange={event => change(setAmount, event.target.value)} helperText={kind === "adjustment" ? "Positive adds stock; negative removes it." : "Whole units only."} />
        <TextField label="Reason" value={reason} required multiline minRows={2} disabled={locked || dialogOpen} slotProps={{ htmlInput: { maxLength: 2000 } }} onChange={event => change(setReason, event.target.value)} helperText="Shown to the approver and kept in the history." />
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button disabled={ledger.busy || !!ledger.pending} onClick={clear}>Clear draft</Button>
          <Button variant="contained" startIcon={<SendRoundedIcon />} disabled={locked || dialogOpen} onClick={() => stage("submit")}>Review request</Button>
        </Stack>
        {productId && <>
          <Divider />
          <Typography variant="subtitle2" component="h5">Stock for {name(productId)}</Typography>
          {bins.length ? <Table size="small" aria-label="Verified stock balances"><TableHead><TableRow><TableCell>Location</TableCell><TableCell align="right">On hand</TableCell><TableCell align="right">Reserved</TableCell><TableCell align="right">Available</TableCell></TableRow></TableHead>
            <TableBody>{bins.map(bin => <TableRow key={bin.location_id}><TableCell>{place(bin.location_id)}</TableCell><TableCell align="right">{bin.quantity}</TableCell><TableCell align="right">{bin.reserved}</TableCell><TableCell align="right">{bin.quantity - bin.reserved}</TableCell></TableRow>)}</TableBody></Table>
            : <Typography variant="body2" color="text.secondary">This product has no stock locations yet. Add one below.</Typography>}
          <Typography variant="subtitle2" component="h5">Add a stock location</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "flex-start" }}>
            <Autocomplete sx={{ flex: 1 }} options={emptyLocations} value={emptyLocations.find(row => row.id === registerLocation) ?? null} disabled={locked || dialogOpen} getOptionLabel={row => text(row.name)} isOptionEqualToValue={(a, b) => a.id === b.id} onChange={(_, row) => change(setRegisterLocation, row?.id ?? "")} renderInput={params => <TextField {...params} label="Register location" helperText="Starts at zero stock." />} />
            <Button variant="outlined" startIcon={<AddLocationAltRoundedIcon />} disabled={locked || dialogOpen} onClick={() => stage("register_bins")}>Register empty bin</Button>
          </Stack>
        </>}
      </Stack></CardContent></Card>}

      <Card><CardContent><Stack spacing={2}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1.5}>
          <Typography variant="h6" component="h4">{kind === "movement" ? "Transfer requests" : "Adjustment requests"}</Typography>
          <TextField select size="small" label="Request status" value={status} onChange={event => setStatus(event.target.value)} sx={{ minWidth: 180 }}><MenuItem value="">All statuses</MenuItem>{["pending", "posted", "rejected", "reversed"].map(value => <MenuItem key={value} value={value}>{STATUS_LABEL[value]}</MenuItem>)}</TextField>
        </Stack>
        {!state ? <Typography variant="body2" color="text.secondary">Requests appear once the ledger is loaded.</Typography>
          : !requests.length ? <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>{status ? `No ${STATUS_LABEL[status]?.toLowerCase()} ${noun} requests.` : `No ${noun} requests yet.`}</Typography>
            : <Box sx={{ overflowX: "auto" }}><Table size="small" aria-label={`${noun} requests`}>
              <TableHead><TableRow><TableCell>Reason</TableCell><TableCell>Details</TableCell><TableCell>Status</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
              <TableBody>{requests.slice(page * size, (page + 1) * size).map(([id, request]) => <TableRow key={id} hover>
                <TableCell sx={{ maxWidth: 240 }}><Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>{request.command.reason}</Typography><Typography variant="caption" color="text.secondary">Ref {id.slice(0, 8)}</Typography></TableCell>
                <TableCell>{lineSummary(request.command)}</TableCell>
                <TableCell><Chip size="small" label={STATUS_LABEL[request.status] ?? request.status} color={STATUS_COLOR[request.status] ?? "default"} /></TableCell>
                <TableCell align="right"><Stack direction="row" spacing={1} justifyContent="flex-end">
                  {request.status === "pending" && <><Button size="small" variant="contained" disabled={locked || dialogOpen} onClick={() => openReview("approve", id)}>Approve</Button><Button size="small" color="error" disabled={locked || dialogOpen} onClick={() => openReview("reject", id)}>Reject</Button></>}
                  {request.status === "posted" && <Button size="small" color="error" disabled={locked || dialogOpen} onClick={() => openReview("reverse", id)}>Reverse</Button>}
                </Stack></TableCell>
              </TableRow>)}</TableBody>
            </Table></Box>}
        {requests.length > 0 && <TablePagination component="div" count={requests.length} page={page} rowsPerPage={size} rowsPerPageOptions={[10, 20, 50]} onPageChange={(_, value) => setPage(value)} onRowsPerPageChange={event => { setPage(0); setSize(Number(event.target.value)); }} />}
      </Stack></CardContent></Card>
    </Box>

    <Dialog open={!!confirm} onClose={() => { if (!ledger.busy) setConfirm(null); }} fullWidth maxWidth="sm">
      <DialogTitle>{confirm?.action === "register_bins" ? "Register this stock location?" : `Submit this ${noun} request?`}</DialogTitle>
      <DialogContent><Stack spacing={1.5}>
        {confirm && confirmSummary(confirm)}
        <Typography variant="body2"><strong>Reason:</strong> {confirm?.reason}</Typography>
        <DialogContentText variant="body2">{confirm?.action === "submit" ? "This creates a pending request. No stock moves until it is approved." : "No stock quantity is added."}</DialogContentText>
      </Stack></DialogContent>
      <DialogActions><Button disabled={ledger.busy} onClick={() => setConfirm(null)}>Cancel</Button><Button variant="contained" disabled={locked} onClick={() => void submitConfirm()}>{confirm?.action === "register_bins" ? "Register bin" : "Submit request"}</Button></DialogActions>
    </Dialog>

    <Dialog open={!!review} onClose={() => { if (!ledger.busy) setReview(null); }} fullWidth maxWidth="sm">
      <DialogTitle>{review ? REVIEW_COPY[review.action].title : ""}</DialogTitle>
      <DialogContent><Stack spacing={1.5}>
        {reviewTarget && <><Typography variant="body2"><strong>Request:</strong> {reviewTarget.command.reason}</Typography>{lineSummary(reviewTarget.command)}</>}
        {review && <DialogContentText variant="body2">{REVIEW_COPY[review.action].effect}</DialogContentText>}
        <TextField label="Review note" value={reviewNote} required autoFocus multiline minRows={2} slotProps={{ htmlInput: { maxLength: 2000 } }} onChange={event => setReviewNote(event.target.value)} error={!reviewNote.trim()} helperText={reviewNote.trim() ? "Kept in the history with this decision." : "A note is required."} />
      </Stack></DialogContent>
      <DialogActions><Button disabled={ledger.busy} onClick={() => setReview(null)}>Cancel</Button><Button variant="contained" color={review ? REVIEW_COPY[review.action].color : "primary"} disabled={locked || !reviewNote.trim()} onClick={() => void submitReview()}>{review ? REVIEW_COPY[review.action].button : ""}</Button></DialogActions>
    </Dialog>
  </Stack>;
}
