export type ExportColumn = { key: string; label: string };
const sensitive = /password|secret|token|credential|authorization|api.?key|private.?key|session|cookie/i;

function cell(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "object") return "[structured value omitted]";
  const text = String(value);
  if (text.length > 20_000) throw new Error("An export cell is too large. Narrow the selection.");
  // CSV escaping alone does not stop Excel/LibreOffice formula interpretation.
  return /^[\s\u0000-\u001f]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text) ? `'${text}` : text;
}

/** The caller supplies only columns displayed to the authenticated user. */
export function exportMatrix(columns: readonly ExportColumn[], rows: readonly Record<string, unknown>[]): string[][] {
  if (rows.length > 1000 || columns.length > 100) throw new Error("Export limit is 1000 rows and 100 columns. Narrow the selection.");
  let characters = 0;
  const bounded = (value: unknown) => {
    const text = cell(value); characters += text.length;
    if (characters > 2_000_000) throw new Error("Export is too large. Narrow the selection.");
    return text;
  };
  return [columns.map(column => bounded(column.label)), ...rows.map(row => columns.map(column => bounded(sensitive.test(column.key) || sensitive.test(column.label) ? "[redacted]" : row[column.key])))];
}

export function exportCsv(columns: readonly ExportColumn[], rows: readonly Record<string, unknown>[]): string {
  return "\uFEFF" + exportMatrix(columns, rows).map(row => row.map(value => `"${value.replace(/"/g, '""')}"`).join(",")).join("\r\n") + "\r\n";
}

export function exportFilename(title: string, extension: "csv"): string {
  return (title.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "HMG-export") + "." + extension;
}
