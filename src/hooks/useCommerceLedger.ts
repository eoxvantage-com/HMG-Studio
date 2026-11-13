import { useCallback, useEffect, useRef, useState } from "react";
import { useCustomMutation, useNotification } from "@refinedev/core";
import { useSessionOwner } from "./useSessionOwner";
import { isDefinitiveLedgerRejection, LEDGER_FUNCTION, parseCommerceCommand, parseCommerceState, type CommerceCommand, type CommerceState } from "../services/stockLedger";
import { reportUuid } from "../services/operationalReports";
import { ledgerRejectionMessage } from "../services/commerceLedger";
import { toast } from "../providers/notificationProvider";

const SUCCESS: Record<string, string> = {
  create_order: "Sales order created", create_purchase_order: "Purchase order created", amend_document: "Changes saved",
  approve_document: "Approved", reject_document: "Rejected", cancel_document: "Cancelled",
  fulfill_order: "Fulfillment posted", receive_purchase_order: "Receipt posted",
  submit_return: "Return submitted", approve_return: "Return approved", reject_return: "Return rejected",
};
const successTitle = (action: string) => SUCCESS[action] ?? "Workflow saved";

/** One persisted immutable request per signed-in user / organization / browser tab. */
export function useCommerceLedger(organizationId: string, authorityEnabled = false) {
  const { owner } = useSessionOwner();
  const storageKey = authorityEnabled && owner && reportUuid(organizationId) ? `hmg-commerce-pending:${owner}:${organizationId}` : "";
  const currentScope = useRef({ key: storageKey, epoch: 0 });
  if (currentScope.current.key !== storageKey) currentScope.current = { key: storageKey, epoch: currentScope.current.epoch + 1 };
  const inFlight = useRef<{key:string;epoch:number} | null>(null);
  const verifiedScope = useRef<{key:string;epoch:number} | null>(null);
  const [loadedScope, setLoadedScope] = useState<{key:string;epoch:number}|null>(null);
  const { mutateAsync } = useCustomMutation();
  const { open } = useNotification();
  const [state, setState] = useState<CommerceState | null>(null);
  const [pending, setPending] = useState<CommerceCommand | null>(null);
  const [busy, setBusy] = useState(false);
  const [storageBlocked, setStorageBlocked] = useState(false);
  const [message, setMessage] = useState("");
  const execute = useCallback(async (command?: CommerceCommand): Promise<CommerceState | null> => {
    if (!storageKey || inFlight.current?.key === storageKey && inFlight.current?.epoch === currentScope.current.epoch || command && storageBlocked) return null;
    const epoch = currentScope.current.epoch;
    const flight = {key:storageKey,epoch};
    inFlight.current = flight; setBusy(true); setMessage("");
    try {
      if (command) {
        const validated = parseCommerceCommand(command);
        if (!validated) throw new Error("The command is invalid. No request was sent.");
        command = validated;
        const stored = sessionStorage.getItem(storageKey);
        if (!stored && (verifiedScope.current?.key !== storageKey || verifiedScope.current?.epoch !== epoch)) throw new Error("Refresh and verify the native workflow before submitting a new command.");
        if (stored && JSON.stringify(parseCommerceCommand(JSON.parse(stored))) !== JSON.stringify(validated)) throw new Error("A different request is unresolved. Reconcile that request before submitting another.");
        sessionStorage.setItem(storageKey, JSON.stringify(validated)); setPending(validated);
      }
      const result = await mutateAsync({ url: LEDGER_FUNCTION, method: "post", dataProviderName: "app", meta: { kind: "function", async: false }, values: { action: command ? "command" : "state", organization_id: organizationId, ...(command ? { command } : {}) }, successNotification: false, errorNotification: false });
      if (currentScope.current.key !== storageKey || currentScope.current.epoch !== epoch) return null;
      if (command && isDefinitiveLedgerRejection(result.data, command.request_id)) {
        // Nothing was written, so the request may be discarded and a corrected one sent.
        sessionStorage.removeItem(storageKey); setPending(null);
        const reason = ledgerRejectionMessage((result.data as { detail?: unknown }).detail, (result.data as { code?: unknown }).code);
        toast(open, "error", "Not saved", reason);
        // Reload the verified state so the page stays usable instead of locking.
        try {
          const fresh = await mutateAsync({ url: LEDGER_FUNCTION, method: "post", dataProviderName: "app", meta: { kind: "function", async: false }, values: { action: "state", organization_id: organizationId }, successNotification: false, errorNotification: false });
          const reloaded = parseCommerceState(fresh.data, organizationId);
          if (currentScope.current.key !== storageKey || currentScope.current.epoch !== epoch) return null;
          if (!reloaded) throw new Error();
          verifiedScope.current = {key:storageKey,epoch}; setLoadedScope({key:storageKey,epoch}); setState(reloaded.state);
        } catch {
          if (currentScope.current.key === storageKey && currentScope.current.epoch === epoch) {
            verifiedScope.current = null; setState(null); setMessage("The workflow could not be reloaded. Use Reload to try again.");
          }
        }
        return null;
      }
      const response = parseCommerceState(result.data, organizationId);
      if (!response) throw new Error("This organization's commerce workflow is unavailable or its response could not be verified. No success is assumed.");
      if (command && (response.code !== "COMMITTED" || response.request_id !== command.request_id || response.committed !== true)) throw new Error("The command outcome is unconfirmed.");
      if (command && ["create_order", "create_purchase_order"].includes(command.action) && !response.state.documents[command.request_id]) throw new Error("The saved document is missing from the verified response.");
      if (command?.action === "submit" && !response.state.stock_requests[command.request_id]) throw new Error("The submitted stock request is absent from the verified response.");
      if(command && ["approve","reject","reverse"].includes(command.action)) {
        const expected = command.action === "approve" ? ["posted", "reversed"] : command.action === "reject" ? ["rejected"] : ["reversed"];
        if(!expected.includes(response.state.stock_requests[command.target_request_id ?? ""]?.status ?? "")) throw new Error("The stock review outcome is absent from the verified response.");
      }
      if(command?.action === "register_bins" && command.bins?.some(bin=>!response.state.balances.some(row=>row.product_id===bin.product_id&&row.location_id===bin.location_id))) throw new Error("A registered bin is absent from the verified response.");
      verifiedScope.current = {key:storageKey,epoch}; setLoadedScope({key:storageKey,epoch}); setState(response.state);
      if (command) {
        sessionStorage.removeItem(storageKey); setPending(null);
        toast(open, "success", successTitle(command.action), "The ledger confirmed the complete operation.");
      }
      return response.state;
    } catch (error) {
      if (currentScope.current.key !== storageKey || currentScope.current.epoch !== epoch) return null;
      const reason = error instanceof Error ? error.message : "Unable to verify the workflow.";
      verifiedScope.current = null; setState(null); setMessage(reason + (command ? " Keep the request ID and retry the identical request; do not create a replacement." : ""));
      if (command) toast(open, "error", "Outcome not confirmed", `${reason} Use "Retry same request"; do not create a new one.`);
      return null;
    } finally {
      if (inFlight.current === flight) inFlight.current = null;
      if (currentScope.current.key === storageKey && currentScope.current.epoch === epoch) setBusy(false);
    }
  }, [storageKey, organizationId, mutateAsync, open, storageBlocked]);
  const executeRef = useRef(execute); executeRef.current = execute;
  useEffect(() => {
    verifiedScope.current = null; setLoadedScope({...currentScope.current}); setState(null); setPending(null); setMessage(""); setStorageBlocked(false); setBusy(false);
    if (!storageKey) return;
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        const restored = parseCommerceCommand(JSON.parse(raw));
        if (!restored) throw new Error();
        setPending(restored);
      }
    } catch { setStorageBlocked(true); setMessage("Pending-request storage is unreadable. Do not submit a new transaction; contact support."); return; }
    void executeRef.current();
  }, [storageKey]);
  const sameScope = !!storageKey && loadedScope?.key === storageKey && loadedScope?.epoch === currentScope.current.epoch;
  const visibleState = sameScope ? state : null;
  return { owner, state: visibleState, pending: sameScope ? pending : null, busy: sameScope && busy, message: sameScope ? message : "", storageBlocked: sameScope && storageBlocked, enabled: !!visibleState && !storageBlocked, execute, refresh: () => execute(), locked: !sameScope || busy || !!pending || storageBlocked || !visibleState };
}
