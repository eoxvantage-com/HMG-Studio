import { useMemo } from "react";
import { useList } from "@refinedev/core";
import { ERP_QUERY_OPTIONS, type ErpRecord } from "../services/erp";
import { isTestOrganization } from "../services/commerceLedger";

/** Active organizations that are not labelled as test data; lists scope to these so QA rows stay out of the way. */
export function useBusinessOrganizations(enabled = true) {
  const organizations = useList<ErpRecord>({ resource: "organizations", pagination: { mode: "server", currentPage: 1, pageSize: 100 }, queryOptions: { ...ERP_QUERY_OPTIONS, enabled }, errorNotification: false });
  const ids = useMemo(() => organizations.query.isError ? [] : organizations.result.data.filter(row => row.is_active !== false && !row.deleted_at && !isTestOrganization(row)).map(row => row.id), [organizations.result.data, organizations.query.isError]);
  return { ids, ready: !enabled || !organizations.query.isLoading, failed: organizations.query.isError };
}
