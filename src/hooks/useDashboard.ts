import { useCustom } from "@refinedev/core";
import { parseDashboard, type Dashboard } from "../services/dashboard";

/** Live refresh interval for the dashboard while the tab is visible. */
export const DASHBOARD_REFRESH_MS = 45_000;
const meta = { kind: "function", async: false } as const;
// One stable request shape so the dashboard page and the bell share one cached query.
const config = { payload: { currency: "INR", dataset: "all" } };

/**
 * Reads the server-computed dashboard (hmg-dashboard-v1). Values come only from
 * the connected Taruvi database and ledger; nothing is generated in the browser.
 */
export function useDashboard({ enabled = true, live = false }: { enabled?: boolean; live?: boolean } = {}) {
  const { result, query } = useCustom<Dashboard>({
    url: "hmg-dashboard-v1", method: "post", dataProviderName: "app", meta, config, errorNotification: false,
    queryOptions: { enabled, retry: false, refetchOnWindowFocus: true, staleTime: 30_000, refetchInterval: live ? DASHBOARD_REFRESH_MS : false, refetchIntervalInBackground: false },
  });
  const projection = parseDashboard(result?.data);
  const dashboard = projection?.currency === "INR" && projection.dataset === "all" ? projection : null;
  return { dashboard, query, updatedAt: query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null };
}
