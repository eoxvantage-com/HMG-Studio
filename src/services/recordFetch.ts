import { useCallback, useEffect, useRef, useState } from "react";
import { useDataProvider } from "@refinedev/core";
import type { ErpRecord } from "./erp";

type Provider = ReturnType<typeof useDataProvider>;
/** Complete organization-scoped read (bounded); fails instead of returning a partial list. */
export async function fetchAll(provider: Provider, resource: string, organizationId: string, limit = 2000): Promise<ErpRecord[]> {
  const rows: ErpRecord[] = [];
  for (let page = 1; page <= Math.ceil(limit / 100); page++) {
    const response = await provider().getList<ErpRecord>({ resource, filters: [{ field: "organization_id", operator: "eq", value: organizationId }, { field: "deleted_at", operator: "null", value: true }], pagination: { currentPage: page, pageSize: 100, mode: "server" }, sorters: [{ field: "id", order: "asc" }] });
    rows.push(...response.data.filter(row => row.organization_id === organizationId));
    if (response.data.length < 100) return rows;
  }
  throw new Error(`More than ${limit.toLocaleString()} ${resource.replace(/_/g, " ")}; narrow the scope.`);
}

export type OrgRecords = { products: ErpRecord[]; locations: ErpRecord[]; categories: ErpRecord[]; suppliers: ErpRecord[] };
/** Loads the reference lists an organization's stock screens need. */
export function useOrganizationRecords(organizationId: string) {
  const provider = useDataProvider();
  const providerRef = useRef(provider); providerRef.current = provider;
  const [state, setState] = useState<{ org: string; data?: OrgRecords; error?: string; loading: boolean }>({ org: "", loading: false });
  const load = useCallback(async () => {
    if (!organizationId) return;
    setState({ org: organizationId, loading: true });
    try {
      const [products, locations, categories, suppliers] = await Promise.all(["products", "product_locations", "product_categories", "suppliers"].map(resource => fetchAll(providerRef.current, resource, organizationId)));
      setState({ org: organizationId, loading: false, data: { products, locations, categories, suppliers } });
    } catch (error) { setState({ org: organizationId, loading: false, error: error instanceof Error ? error.message : "Records could not be loaded." }); }
  }, [organizationId]);
  useEffect(() => { void load(); }, [load]);
  const current = state.org === organizationId ? state : { org: organizationId, loading: !!organizationId };
  return { data: current.data, error: current.error, loading: current.loading, reload: load };
}
