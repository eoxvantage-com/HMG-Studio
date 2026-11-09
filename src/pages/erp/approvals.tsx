import { useState, type ReactNode } from "react";
import type { CrudFilters } from "@refinedev/core";
import { Alert, Box, Breadcrumbs, Link, Stack, Tab, Tabs, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router";
import { PageContainer } from "../../components/PageContainer";
import type { ErpModule } from "../../erp/modules";
import { getErpResource, type ErpResource } from "../../services/erp";

type Queue = { module: ErpModule; filters: CrudFilters };
// Source module 17: document status is NOT approval status. Adjustment requests
// have their own pending/approved/rejected status, unlike the other documents.
const queues: Queue[] = [
  ["orders", "Sales orders", "approval_status"],
  ["purchase_orders", "Purchase orders", "approval_status"],
  ["stock_transfers", "Stock transfers", "approval_status"],
  ["stock_adjustment_requests", "Stock adjustment requests", "status"],
].map<Queue>(([resource, label, field]) => ({
  module: { key: resource, label, path: "/approvals", resource, group: "Workspace", kind: "workflow", description: "Pending approval records" },
  filters: [{ field, operator: "eq", value: "pending" }],
}));

export function ApprovalsPage({ renderList }: {
  renderList: (resource: ErpResource, module: ErpModule, filters: CrudFilters) => ReactNode;
}) {
  const [selected, setSelected] = useState(0);
  const queue = queues[selected];
  const resource = getErpResource(queue.module.resource);
  return <PageContainer><Stack spacing={3}>
    <Breadcrumbs><Link component={RouterLink} to="/">Workspace</Link><Typography>Approvals</Typography></Breadcrumbs>
    <Typography variant="h2">Approvals</Typography>
    <Alert severity="info">Read-only pending approval records visible to your current role. This is not a reviewer-assigned queue. My requests, reviewer eligibility, approval and rejection commands remain unavailable until their backend contracts are verified. No stock or money changes can be made here.</Alert>
    <Tabs value={selected} onChange={(_, value: number) => setSelected(value)} variant="scrollable" scrollButtons="auto" aria-label="Approval document types">
      {queues.map((entry, index) => <Tab key={entry.module.key} label={entry.module.label} id={`approval-tab-${index}`} aria-controls={`approval-panel-${index}`} />)}
    </Tabs>
    <Box role="tabpanel" id={`approval-panel-${selected}`} aria-labelledby={`approval-tab-${selected}`}>
      {!resource?.liveVerified ? <Alert severity="warning">The live schema for this queue has not been verified. No request was sent.</Alert>
        : renderList(resource, queue.module, queue.filters)}
    </Box>
  </Stack></PageContainer>;
}
