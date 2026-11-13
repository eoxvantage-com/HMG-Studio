import { useEffect, useRef, useState } from "react";
import { useDataProvider } from "@refinedev/core";
import { useSessionOwner } from "./useSessionOwner";
import { readInventoryAuthority, type InventoryAuthority } from "../services/inventory";
import { reportUuid } from "../services/operationalReports";
import { LEDGER_FUNCTION } from "../services/stockLedger";
import type { ErpRecord } from "../services/erp";

/** Read-only, identity-scoped projection for the visible product page. */
export function useInventoryAuthority(organizationIds: string[]) {
  const { owner } = useSessionOwner();
  const provider = useDataProvider();
  const ids = [...new Set(organizationIds)].filter(reportUuid).sort().join("|");
  const key = owner ? `${owner}:${ids}` : "";
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ key: string; attempt: number; data: Record<string, InventoryAuthority> }>({ key: "", attempt: -1, data: {} });
  const providerRef = useRef(provider); providerRef.current = provider;
  useEffect(() => {
    let active = true;
    if (!owner || !ids) return;
    const dataProvider = providerRef.current();
    void readInventoryAuthority(ids.split("|"), async requested => {
      const response = await dataProvider.getList<ErpRecord>({ resource: "organizations", filters: [{ field: "id", operator: "in", value: requested }], pagination: { currentPage: 1, pageSize: requested.length, mode: "server" } });
      return response.data;
    }, async organization => {
      const app = providerRef.current("app");
      if (!app.custom) throw new Error("Function provider unavailable");
      const response = await app.custom({ url: LEDGER_FUNCTION, method: "post", payload: { action: "state", organization_id: organization }, meta: { kind: "function", async: false } });
      return response.data;
    }).then(data => { if (active) setResult({ key, attempt, data }); });
    return () => { active = false; };
  }, [key, owner, ids, attempt]);
  const ready = !!owner && result.key === key && result.attempt === attempt;
  return { authorities: ready ? result.data : {}, loading: !!owner && !!ids && !ready, refresh: () => setAttempt(value => value + 1) };
}
