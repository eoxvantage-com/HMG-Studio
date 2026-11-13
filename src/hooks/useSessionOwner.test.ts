import { describe, expect, it } from "vitest";
import { sessionOwnerId } from "./useSessionOwner";

describe("sessionOwnerId", () => {
  it("accepts UUID, numeric and string ids", () => {
    expect(sessionOwnerId({ id: "4f7ff492-8af6-4059-ae61-ce13fe3d4b20" })).toBe("4f7ff492-8af6-4059-ae61-ce13fe3d4b20");
    expect(sessionOwnerId({ id: 42 })).toBe("42");
    expect(sessionOwnerId({ id: " pradeep " })).toBe("pradeep");
  });
  it("falls back to username and unwraps a data envelope", () => {
    expect(sessionOwnerId({ username: "pradeep+taruvi" })).toBe("pradeep+taruvi");
    expect(sessionOwnerId({ data: { id: "abc" } })).toBe("abc");
  });
  it("returns empty for missing or invalid identity", () => {
    expect(sessionOwnerId(null)).toBe("");
    expect(sessionOwnerId(undefined)).toBe("");
    expect(sessionOwnerId({ id: Number.NaN })).toBe("");
    expect(sessionOwnerId({ id: "" })).toBe("");
  });
});
