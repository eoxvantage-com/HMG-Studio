import { Alert, Button, IconButton, LinearProgress, Stack, Tooltip } from "@mui/material";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import type { useCommerceLedger } from "../hooks/useCommerceLedger";
import type { CommerceCommand, CommerceState } from "../services/stockLedger";

type Ledger = ReturnType<typeof useCommerceLedger>;

/** Small reload control for page toolbars. */
export function RefreshWorkflowButton({ ledger }: { ledger: Ledger }) {
  return <Tooltip title="Reload from the ledger"><span>
    <IconButton aria-label="Refresh workflow" disabled={ledger.busy || !ledger.owner} onClick={() => void ledger.refresh()}><RefreshRoundedIcon /></IconButton>
  </span></Tooltip>;
}

/**
 * Only persistent states are shown inline (loading, locked, unresolved request).
 * Save results and rejections are toasts, recorded in the header bell.
 */
export function CommerceWorkflowStatus({ ledger, onRecovered, showRefresh = false }: {
  ledger: Ledger;
  onRecovered?: (state: CommerceState, command: CommerceCommand) => void;
  showRefresh?: boolean;
}) {
  return <Stack spacing={1}>
    {ledger.busy && <LinearProgress aria-label="Verifying the Taruvi workflow" />}
    {ledger.message && !ledger.enabled && !ledger.busy && <Alert severity="warning" action={<Button color="inherit" size="small" disabled={!ledger.owner} onClick={() => void ledger.refresh()}>Reload</Button>}>{ledger.message}</Alert>}
    {!ledger.enabled && !ledger.busy && !ledger.message && <Alert severity="info">Select an organization with its reconciled commerce ledger activated before saving transactions.</Alert>}
    {showRefresh && <Stack direction="row" justifyContent="flex-end"><Button variant="outlined" size="small" startIcon={<RefreshRoundedIcon />} disabled={ledger.busy || !ledger.owner} onClick={() => void ledger.refresh()}>Refresh workflow</Button></Stack>}
    {ledger.pending && <Alert severity="warning" action={<Button color="inherit" size="small" disabled={ledger.busy || ledger.storageBlocked} onClick={async () => {
        const pending = ledger.pending;
        if (!pending) return;
        const state = await ledger.execute(pending);
        if (state) onRecovered?.(state, pending);
      }}>Retry same request</Button>}>The last request's outcome is not confirmed yet. Its exact contents are kept in this tab; retry it instead of creating a new one.</Alert>}
  </Stack>;
}
