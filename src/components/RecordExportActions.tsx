import { useRef, useState } from "react";
import { useGetIdentity, useNotification } from "@refinedev/core";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import { exportCsv, exportFilename, exportMatrix, type ExportColumn } from "../services/recordExport";

type Props = { title: string; columns: readonly ExportColumn[]; rows: readonly Record<string, unknown>[]; scopeLabel: string; filename: string };

/** Snapshot export: never fetches extra records or claims a full filtered export. */
export function RecordExportActions({ title, columns, rows, scopeLabel, filename }: Props) {
  const { open } = useNotification();
  const identity = useGetIdentity<{ id: string }>();
  const owner = !identity.isLoading && !identity.isFetching && !identity.isError && typeof identity.data?.id === "string" ? identity.data.id : "";
  const initialOwner = useRef("");
  if (owner && !initialOwner.current) initialOwner.current = owner;
  // A different principal must remount/refetch the page, not export old query rows.
  const allowed = !!owner && owner === initialOwner.current;
  const [preview, setPreview] = useState<{ matrix: string[][]; generated: string; title: string; scope: string } | null>(null);
  const failure = (error: unknown) => open?.({ type: "error", message: "Export unavailable", description: error instanceof Error ? error.message : "Please try again." });
  const download = () => {
    if (!allowed) return;
    let url: string | undefined;
    try {
      url = URL.createObjectURL(new Blob([exportCsv(columns, rows)], { type: "text/csv;charset=utf-8" }));
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = exportFilename(filename, "csv");
      document.body.appendChild(anchor); anchor.click(); anchor.remove();
      open?.({ type: "success", message: "Export prepared", description: `${rows.length} records — ${scopeLabel}.` });
    } catch (error) { failure(error); }
    finally { if (url) { const objectUrl = url; window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000); } }
  };
  const show = () => { if (!allowed) return; try { setPreview({ matrix: exportMatrix(columns, rows), generated: new Date().toISOString(), title, scope: scopeLabel }); } catch (error) { failure(error); } };
  return <>
    <Stack direction="row" flexWrap="wrap" gap={1}>
      <Button variant="outlined" startIcon={<DownloadRoundedIcon />} disabled={!allowed || !rows.length} onClick={download}>Export CSV</Button>
      <Button variant="outlined" startIcon={<PrintRoundedIcon />} disabled={!allowed || !rows.length} onClick={show}>Print / PDF</Button>
    </Stack>
    {preview && allowed && <Dialog open fullScreen onClose={() => setPreview(null)} aria-labelledby="export-preview-title">
      <DialogTitle id="export-preview-title">Document preview</DialogTitle>
      <DialogContent>
        <Alert severity="info">{preview.scope}. This is a record snapshot, not an issued invoice or proof of payment. Use your print dialog to save as PDF.</Alert>
        <Box className="hmg-export-document" sx={{ py: 3 }}>
          <Box component="img" src="/brand/hmg-stones-logo.webp" alt="HMG Stones" sx={{ width: 110, height: "auto", mb: 2 }} />
          <Typography variant="h2">{preview.title}</Typography>
          <Typography>HMG-Studio · {preview.scope} · {preview.matrix.length - 1} records</Typography>
          <Typography variant="caption">Generated {preview.generated} · Record snapshot — not an issued invoice</Typography>
          <Box sx={{ overflowX: "auto", mt: 3 }}><Table size="small">
            {preview.matrix.length === 2 ? <TableBody>{preview.matrix[0].map((label, index) => <TableRow key={index}><TableCell component="th" scope="row">{label}</TableCell><TableCell sx={{ overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>{preview.matrix[1][index]}</TableCell></TableRow>)}</TableBody> : <>
              <TableHead><TableRow>{preview.matrix[0].map((value, index) => <TableCell key={index}>{value}</TableCell>)}</TableRow></TableHead>
              <TableBody>{preview.matrix.slice(1).map((row, index) => <TableRow key={index}>{row.map((value, column) => <TableCell key={column} sx={{ overflowWrap: "anywhere" }}>{value}</TableCell>)}</TableRow>)}</TableBody>
            </>}
          </Table></Box>
        </Box>
        <style>{`@media print { body * { visibility: hidden !important; } .hmg-export-document, .hmg-export-document * { visibility: visible !important; } .MuiDialog-root, .MuiDialog-container, .MuiDialog-paper, .MuiDialogContent-root { position: static !important; overflow: visible !important; height: auto !important; max-height: none !important; } .hmg-export-document { position: absolute; left: 0; top: 0; width: 100%; } .hmg-export-document thead { display: table-header-group; } .hmg-export-document tr { break-inside: avoid; } }`}</style>
      </DialogContent>
      <DialogActions><Button onClick={() => setPreview(null)}>Close</Button><Button variant="contained" startIcon={<PrintRoundedIcon />} onClick={() => window.print()}>Print / Save PDF</Button></DialogActions>
    </Dialog>}
  </>;
}
