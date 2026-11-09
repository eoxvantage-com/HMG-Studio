import { Alert, Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { activityProperties, reportDefinition } from "../services/structuredData";
import { fieldLabel } from "../services/erp";

const sensitive = /secret|password|token|authorization|api[_-]?key/i;
function safeText(value: unknown): string {
  try {
    const text = JSON.stringify(value, (key, item) => {
      if (sensitive.test(key)) return "[redacted]";
      if (item && typeof item === "object" && !Array.isArray(item) && typeof item.field === "string" && sensitive.test(item.field)) return { field: item.field, value: "[redacted]" };
      return item;
    }, 2) ?? "Not recorded";
    return text.length > 8000 ? `${text.slice(0, 8000)}\n[Display truncated]` : text;
  } catch { return "Unable to display value"; }
}
const unavailable = "Unavailable or invalid configuration";

/** Read-only presentation of the parent record; no extra queries or execution. */
export function StructuredRecordDetails({ resource, record }: { resource: string; record: Record<string, unknown> }) {
  if (resource === "saved_reports") {
    const definition = reportDefinition(record);
    return <Card><CardContent><Stack spacing={2}>
      <Typography variant="h5" component="h3">Report definition</Typography>
      <Typography color="text.secondary">Saved configuration only. This view does not execute the report.</Typography>
      <Typography variant="subtitle2">Columns</Typography>
      {definition.columns === null ? <Typography>{unavailable}</Typography> : !definition.columns.length ? <Typography>No columns configured</Typography> : <Stack direction="row" flexWrap="wrap" gap={1}>{definition.columns.map((column, i) => <Chip key={`${column}:${i}`} label={fieldLabel(column)} />)}</Stack>}
      <Typography variant="subtitle2">Filters</Typography>
      {definition.filters === null ? <Typography>{unavailable}</Typography> : !definition.filters.length ? <Typography>No filters configured</Typography> : <Stack spacing={1}>{definition.filters.map((filter, i) => <Box component="pre" key={i} sx={{ m: 0, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{safeText(filter)}</Box>)}</Stack>}
      <Typography variant="subtitle2">Sort order</Typography>
      <Typography>{definition.sort ? `${fieldLabel(String(definition.sort.field))} · ${definition.sort.direction === "asc" ? "Ascending" : "Descending"}` : unavailable}</Typography>
    </Stack></CardContent></Card>;
  }
  if (resource === "activity_logs") {
    const properties = activityProperties(record);
    const entries = Object.entries(properties ?? {}).filter(([key]) => !sensitive.test(key));
    return <Card><CardContent><Stack spacing={2}>
      <Typography variant="h5" component="h3">Activity context</Typography>
      {properties?.synthetic === true && <Alert severity="info">Synthetic fixture — not evidence of a real business event.</Alert>}
      {properties === null ? <Typography>{unavailable}</Typography> : entries.length === 0 ? <Typography>No activity properties recorded</Typography> : entries.map(([key, value]) => <Box key={key}><Typography variant="subtitle2">{fieldLabel(key)}</Typography><Typography component="div" sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{typeof value === "string" ? value.length > 8000 ? `${value.slice(0, 8000)} [Display truncated]` : value : safeText(value)}</Typography></Box>)}
    </Stack></CardContent></Card>;
  }
  return null;
}
