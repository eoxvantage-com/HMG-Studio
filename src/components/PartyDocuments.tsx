import { Link as RouterLink } from "react-router";
import { Box, Card, CardContent, Chip, LinearProgress, Link, Stack, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import { useList } from "@refinedev/core";
import { useCommerceLedger } from "../hooks/useCommerceLedger";
import { hasCommerceAuthority } from "../services/commerceLedger";
import { formatDate, formatMoney, shortNumber, statusColor, statusLabel } from "../services/commercePresentation";
import type { ErpRecord } from "../services/erp";

const OUTSTANDING = ["approved", "partially_fulfilled", "fulfilled"];
/** A customer's sales orders or a supplier's purchase orders, straight from the ledger. */
export function PartyDocuments({ record, kind }: { record: ErpRecord; kind: "customers" | "suppliers" }) {
  const organizationId = typeof record.organization_id === "string" ? record.organization_id : "";
  const organization = useList<ErpRecord>({ resource: "organizations", filters: [{ field: "id", operator: "eq", value: organizationId }], pagination: { mode: "server", currentPage: 1, pageSize: 1 }, queryOptions: { enabled: !!organizationId, retry: false }, errorNotification: false });
  const org = organization.result.data.find(row => row.id === organizationId);
  const ledger = useCommerceLedger(organizationId, !!org && hasCommerceAuthority(org));
  if (!ledger.state && !ledger.busy) return null;
  const sales = kind === "customers";
  const documents = Object.values(ledger.state?.documents ?? {}).filter(doc => sales ? doc.kind === "sales_order" && doc.draft.customer_id === record.id : doc.kind === "purchase_order" && doc.draft.supplier_id === record.id)
    .sort((a, b) => b.draft.order_date.localeCompare(a.draft.order_date));
  const live = documents.filter(doc => !["cancelled", "rejected"].includes(doc.status));
  const currency = documents[0]?.draft.currency ?? (typeof record.currency === "string" ? record.currency : "INR");
  const total = live.reduce((sum, doc) => sum + Number(doc.total), 0);
  const open = sales ? live.filter(doc => OUTSTANDING.includes(doc.status)).reduce((sum, doc) => sum + Number(doc.total), 0) : live.filter(doc => ["pending", "approved", "partially_received"].includes(doc.status)).reduce((sum, doc) => sum + Number(doc.total), 0);
  const path = sales ? "/orders" : "/purchase-orders";
  return <Card><CardContent><Stack spacing={2}>
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
      <Typography variant="h6">{sales ? "Sales orders" : "Purchase orders"} ({documents.length})</Typography>
      <Stack direction="row" spacing={3}>
        <Box><Typography variant="caption" color="text.secondary">{sales ? "Total ordered" : "Total purchased"}</Typography><Typography fontWeight={600}>{formatMoney(total, currency)}</Typography></Box>
        <Box><Typography variant="caption" color="text.secondary">{sales ? "Outstanding (no payments recorded)" : "Open / not yet received"}</Typography><Typography fontWeight={600} color={open > 0 ? "warning.main" : undefined}>{formatMoney(open, currency)}</Typography></Box>
      </Stack>
    </Stack>
    {ledger.busy && <LinearProgress aria-label="Loading orders" />}
    {documents.length ? <Box sx={{ overflowX: "auto" }}><Table size="small" aria-label={sales ? "Customer orders" : "Supplier purchase orders"}><TableHead><TableRow><TableCell>Number</TableCell><TableCell>Date</TableCell><TableCell>Status</TableCell><TableCell align="right">Total</TableCell></TableRow></TableHead><TableBody>
      {documents.slice(0, 10).map(doc => <TableRow key={doc.id} hover><TableCell><Tooltip title={doc.number}><Link component={RouterLink} to={`${path}/show/${doc.id}?organization=${organizationId}`} underline="hover" fontWeight={600}>{shortNumber(doc.number)}</Link></Tooltip></TableCell><TableCell>{formatDate(doc.draft.order_date)}</TableCell><TableCell><Chip size="small" label={statusLabel(doc.status)} color={statusColor(doc.status)} /></TableCell><TableCell align="right">{formatMoney(doc.total, doc.draft.currency)}</TableCell></TableRow>)}
    </TableBody></Table>{documents.length > 10 && <Typography variant="caption" color="text.secondary">Showing the latest 10 of {documents.length}.</Typography>}</Box>
      : !ledger.busy && <Typography variant="body2" color="text.secondary">No {sales ? "orders for this customer" : "purchase orders with this supplier"} yet.</Typography>}
  </Stack></CardContent></Card>;
}
