import { describe, expect, it } from "vitest";
import { reportDefinition, activityProperties } from "./structuredData";

describe("structured ERP values", () => {
  it("prefers native typed values, including an intentionally empty filter list", () => {
    expect(reportDefinition({ columns_json: ["sku"], filters_json: { items: [] }, sort_json: { field: "sku", direction: "asc" }, columns: '["name"]', filters: '[{"field":"stock"}]' })).toEqual({ columns: ["sku"], filters: [], sort: { field: "sku", direction: "asc" } });
  });
  it("reads legacy JSON without evaluating text", () => {
    expect(reportDefinition({ columns: '["name"]', filters: "[]", sort: '{"field":"name","direction":"desc"}' }).columns).toEqual(["name"]);
    expect(activityProperties({ properties: '{"synthetic":true}' })).toEqual({ synthetic: true });
  });
  it("does not silently replace malformed typed values with legacy data", () => {
    expect(reportDefinition({ columns_json: [4], columns: '["name"]', filters_json: [], sort_json: "invalid" })).toEqual({ columns: null, filters: null, sort: null });
  });
  it("rejects malformed and oversized payloads without throwing", () => {
    expect(activityProperties({ properties: "bad" })).toBeNull();
    expect(activityProperties({ properties_json: [] })).toBeNull();
    expect(activityProperties({ properties: '"' + "x".repeat(100001) + '"' })).toBeNull();
    expect(reportDefinition({}).columns).toBeNull();
    expect(reportDefinition({ sort_json: { field: "name", direction: ["asc"] } }).sort).toBeNull();
    expect(reportDefinition({ columns_json: Array(101).fill("name") }).columns).toBeNull();
    expect(activityProperties({ properties_json: { large: "x".repeat(100001) } })).toBeNull();
  });
});
