type Row = Record<string, unknown>;
const object = (value: unknown): value is Row => value !== null && typeof value === "object" && !Array.isArray(value);

function withinBudget(value: unknown): boolean {
  let nodes = 0; let characters = 0;
  const seen = new WeakSet<object>();
  function visit(item: unknown, depth: number): boolean {
    if (++nodes > 2000 || depth > 20) return false;
    if (typeof item === "string") { characters += item.length; return characters <= 100_000; }
    if (item === null || typeof item === "boolean") return true;
    if (typeof item === "number") return Number.isFinite(item);
    if (typeof item !== "object" || seen.has(item)) return false;
    seen.add(item);
    const entries = Object.entries(item);
    return entries.length <= 100 && entries.every(([key, child]) => { characters += key.length; return characters <= 100_000 && visit(child, depth + 1); });
  }
  return visit(value, 0);
}

// Legacy `any` fields are physical TEXT. New nullable typed fields take
// precedence; malformed typed values must never silently fall back to stale data.
function decoded(row: Row, typed: string, legacy: string): unknown {
  const value = row[typed] ?? row[legacy];
  if (typeof value !== "string") return withinBudget(value) ? value : undefined;
  if (value.length > 100_000) return undefined;
  try { const parsed: unknown = JSON.parse(value); return withinBudget(parsed) ? parsed : undefined; } catch { return undefined; }
}

export function reportDefinition(row: Row) {
  const columns = decoded(row, "columns_json", "columns");
  const filterValue = decoded(row, "filters_json", "filters");
  const filters = row.filters_json != null ? object(filterValue) ? filterValue.items : undefined : filterValue;
  const sort = decoded(row, "sort_json", "sort");
  return {
    columns: Array.isArray(columns) && columns.every(item => typeof item === "string") ? columns as string[] : null,
    filters: Array.isArray(filters) && filters.every(object) ? filters as Row[] : null,
    sort: object(sort) && typeof sort.field === "string" && typeof sort.direction === "string" && ["asc", "desc"].includes(sort.direction) ? sort : null,
  };
}

export function activityProperties(row: Row): Row | null {
  const value = decoded(row, "properties_json", "properties");
  return object(value) ? value : null;
}
