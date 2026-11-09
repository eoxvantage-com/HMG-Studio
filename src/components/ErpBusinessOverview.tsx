import { Alert, Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { fieldLabel, logicalResource, type ErpRecord, type ErpResource } from "../services/erp";
import { businessSections, presentationValue, statusPresentation } from "../services/erpPresentation";
import { StructuredRecordDetails } from "./StructuredRecordDetails";

export type ModuleRecordOverviewProps = {
  resource: ErpResource;
  record: ErpRecord;
  referenceLabel?: (field: string, value: unknown) => string;
  /** Parent currency must be resolved by the query owner; never inferred from locale. */
  context?: { currency?: string };
};

// These are persisted parent fields, not derived totals over an incomplete related page.
const summaryFields: Record<string, string[]> = {
  orders: ["total", "amount_paid", "payment_status"],
  purchase_orders: ["total", "status", "expected_date"],
  return_orders: ["refund_amount", "status", "type"],
  customers: ["credit_limit", "currency", "is_active"],
  suppliers: ["rating", "payment_terms", "is_active"],
  product_locations: ["capacity", "warehouse_id", "is_active"],
  warehouses: ["capacity", "currency", "is_active"],
  stock_adjustments: ["quantity_before", "adjustment_quantity", "quantity_after"],
  stock_transfers: ["status", "shipping_method", "estimated_arrival"],
  work_orders: ["quantity", "quantity_produced", "status"],
  order_payments: ["amount", "method", "paid_at"],
  shipments: ["status", "cost", "shipped_at"],
};

/** Loaded-record presentation only. Queries, mutations, actions and related data belong to the route owner. */
export function ModuleRecordOverview({ resource, record, referenceLabel, context }: ModuleRecordOverviewProps) {
  const name = logicalResource(resource.name);
  const currency = typeof record.currency === "string" && record.currency.trim() ? record.currency : context?.currency;
  const presentationContext = { currency, referenceLabel };
  const sections = businessSections(resource);
  const summary = (summaryFields[name] ?? []).flatMap(field => resource.schema.fields.filter(definition => definition.name === field));
  return <Stack spacing={2}>
    {summary.length > 0 && <Card component="section" aria-label="At a glance"><CardContent>
      <Typography component="h3" variant="h5" gutterBottom>At a glance</Typography>
      <Box component="dl" sx={{ m: 0, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" }, gap: 2 }}>
        {summary.map(field => {
          const status = statusPresentation(field.name, record[field.name]);
          return <Box key={field.name} sx={{ minWidth: 0 }}>
            <Typography component="dt" variant="body2" color="text.secondary">{fieldLabel(field.name)}</Typography>
            <Box component="dd" sx={{ m: 0, overflowWrap: "anywhere" }}>
              {status ? <Chip size="small" label={status.label} color={status.color} /> : <Typography component="span" variant="h5">{presentationValue(resource, field, record[field.name], presentationContext)}</Typography>}
            </Box>
          </Box>;
        })}
      </Box>
    </CardContent></Card>}
    {name === "return_orders" && <Alert severity="info">The recorded refund amount is part of this return document. It does not confirm that a refund was executed.</Alert>}
    {name === "order_payments" && <Alert severity="info">This view displays a recorded payment entry; it does not execute or verify an external payment.</Alert>}
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" }, gap: 2, alignItems: "start" }}>
      {sections.map(section => <Card component="section" key={section.id} aria-label={section.title}>
        <CardContent>
          <Typography component="h3" variant="h5" gutterBottom>{section.title}</Typography>
          <Box component="dl" sx={{ m: 0, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
            {section.fields.map(field => {
              const status = statusPresentation(field.name, record[field.name]);
              return <Box key={field.name} sx={{ minWidth: 0, gridColumn: ["notes", "description", "customer_address"].includes(field.name) ? "1 / -1" : undefined }}>
                <Typography component="dt" variant="body2" color="text.secondary">{fieldLabel(field.name)}</Typography>
                <Box component="dd" sx={{ m: 0, overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>
                  {status ? <Chip size="small" label={status.label} color={status.color} /> : <Typography component="span">{presentationValue(resource, field, record[field.name], presentationContext)}</Typography>}
                </Box>
              </Box>;
            })}
          </Box>
        </CardContent>
      </Card>)}
    </Box>
    <StructuredRecordDetails resource={name} record={record} />
  </Stack>;
}
