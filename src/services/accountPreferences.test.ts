import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";

async function service() {
  expect(existsSync("src/services/accountPreferences.ts"), "Account preferences adapter is missing").toBe(true);
  return import("./accountPreferences");
}

const preferences = { date_format: "YYYY-MM-DD", time_format: "24h", timezone: "UTC" };

describe("native account preference contract", () => {
  it("accepts only a verified success and projects the three supported fields", async () => {
    const { decodePreferences } = await service();
    expect(decodePreferences({ ok: true, verified: true, preferences: { ...preferences, secret: "omit" } })).toEqual(preferences);
  });
  it.each([{}, { ok: true, preferences }, { ok: true, verified: true, preferences: {} }, { result: { ok: true, verified: true, preferences } }])(
    "rejects incomplete or unexpected envelopes instead of inventing defaults", async (data) => {
      const { decodePreferences } = await service();
      expect(() => decodePreferences(data)).toThrow();
    },
  );
  it("returns a safe recovery message for uncertain writes, never a false success", async () => {
    const { decodePreferences } = await service();
    expect(() => decodePreferences({ ok: false, code: "READBACK_FAILED", message: "PRIVATE_TOKEN" })).toThrow(/Reload/);
    expect(() => decodePreferences({ ok: false, code: "UPDATE_UNCONFIRMED" })).toThrow(/Reload/);
  });
  it("sends only changed supported fields, preserving unrelated preferences", async () => {
    const { preferenceChanges } = await service();
    expect(preferenceChanges(preferences, { ...preferences, timezone: "Asia/Kolkata" })).toEqual({ timezone: "Asia/Kolkata" });
    expect(preferenceChanges(preferences, preferences)).toEqual({});
  });
});
