import { describe, expect, it } from "vitest";
import { decodeCategory } from "./catalog";
const row = { id: "id", organization_id: "org", name: "Granite", description: null, slug: "granite", is_active: true };
describe("catalog committed-response boundary", () => {
  it("accepts only verified committed records", () => {
    expect(decodeCategory({ ok: true, verified: true, record: row })).toEqual(row);
  });
  it("does not trust an unverified success", () => {
    expect(() => decodeCategory({ ok: true, record: row })).toThrow(/confirmed/);
  });
  it("redacts arbitrary backend failures", () => {
    expect(() => decodeCategory({ ok: false, code: "WRITE_UNCONFIRMED", message: "secret" })).toThrow(/Check saved record/);
  });
  it("rejects incomplete records", () => {
    expect(() => decodeCategory({ ok: true, verified: true, record: { id: "id" } })).toThrow(/confirmed/);
  });
});
