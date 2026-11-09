import { describe, expect, it, vi } from "vitest";
import { exportMatrix, exportCsv, exportFilename } from "./recordExport";

describe("scoped record exports", () => {
  const columns = [{ key: "name", label: "Name" }, { key: "amount", label: "Amount" }];
  it("exports only explicitly mapped fields and preserves zero", () => {
    expect(exportMatrix(columns, [{ name: "Slab", amount: 0, hidden: "private" }])).toEqual([["Name", "Amount"], ["Slab", "0"]]);
  });
  it("quotes commas, quotes and newlines and neutralizes spreadsheet formulas", () => {
    expect(exportCsv(columns, [{ name: 'A,"B"\nC', amount: " \t=1+2" }])).toBe('\uFEFF"Name","Amount"\r\n"A,""B""\nC","\' \t=1+2"\r\n');
  });
  it("blocks credential fields and structured payloads, not just visible labels", () => {
    expect(exportMatrix([{ key: "api_key", label: "Name" }, { key: "data", label: "Data" }], [{ api_key: "secret", data: { token: "secret" } }])).toEqual([["Name", "Data"], ["[redacted]", "[structured value omitted]"]]);
  });
  it("rejects oversized exports instead of silently truncating", () => {
    expect(() => exportMatrix(columns, Array.from({ length: 1001 }, () => ({})))).toThrow(/1000/);
    expect(() => exportMatrix(columns, [{ name: "a".repeat(20001) }])).toThrow(/too large/);
    const value = vi.fn(() => "a".repeat(20000));
    const rows = Array.from({ length: 1000 }, () => Object.defineProperty({}, "name", { get: value }));
    expect(() => exportMatrix(columns, rows)).toThrow(/too large/);
    expect(value.mock.calls.length).toBeLessThan(102);
  });
  it("neutralizes formula headers and control prefixes", () => {
    expect(exportMatrix([{ key: "name", label: "+SUM(1)" }], [{ name: "\r@SUM(1)" }])).toEqual([["'+SUM(1)"], ["'\r@SUM(1)"]]);
  });
  it("uses safe local filenames", () => {
    expect(exportFilename("../../HMG Orders?", "csv")).toBe("HMG-Orders.csv");
  });
});
