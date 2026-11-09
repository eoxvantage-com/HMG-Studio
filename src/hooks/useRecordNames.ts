import { useMemo } from "react";
import { useList, type CrudFilters } from "@refinedev/core";
import { ERP_QUERY_OPTIONS, getErpResource, labelField, type ErpRecord } from "../services/erp";

export const recordIds = (rows: ErpRecord[], field: string) => [...new Set(rows.map(row => row[field]).filter((id): id is string => typeof id === "string" && !!id))].sort();

/** One bounded name request per visible page/reference type. Native identities are not datatables. */
export function useRecordNames(resource: string, ids: string[]) {
  const key = [...new Set(ids)].sort().join("|");
  const count = key ? key.split("|").length : 0;
  const target = getErpResource(resource);
  const enabled = !!target?.liveVerified && count > 0 && count <= 100;
  const filters = useMemo<CrudFilters>(() => [{ field: "id", operator: "in", value: key ? key.split("|") : [] }], [key]);
  const { result, query } = useList<ErpRecord>({ resource, filters, pagination: { currentPage: 1, pageSize: Math.max(1, Math.min(count, 100)), mode: "server" }, queryOptions: { ...ERP_QUERY_OPTIONS, enabled }, errorNotification: false });
  const requested = new Set(key ? key.split("|") : []);
  const rows = enabled && !query.isError && !query.isLoading ? result.data.filter(row => requested.has(row.id)) : [];
  const field = target ? labelField(target) : "name";
  return { rows, label: (id: unknown) => {
    if (typeof id !== "string" || !id) return "Not assigned";
    const value = rows.find(row => row.id === id)?.[field];
    return typeof value === "string" && value.trim() ? value : enabled && query.isLoading ? "Loading..." : "Name unavailable";
  } };
}
