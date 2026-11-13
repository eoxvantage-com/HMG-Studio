import { createHash, webcrypto } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { prepareProductImage, productImageUri, privateProductImagePath } from "./productMedia";

const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 1, 2, 3]);
const org = "22222222-2222-4222-8222-222222222222";
const product = "11111111-1111-4111-8111-111111111111";
beforeEach(() => vi.stubGlobal("crypto", webcrypto));
afterEach(() => vi.unstubAllGlobals());

describe("product image upload preparation", () => {
  it("prepares a bounded raster and derives the server content-addressed URI", async () => {
    const file = new File([png], "Marble.png", { type: "image/png" });
    const image = await prepareProductImage(file);
    const hash = createHash("sha256").update(png).digest("hex");
    expect(image.file).toBe(file);
    expect(image.upload).toEqual({ content_type: "image/png", content_base64: Buffer.from(png).toString("base64") });
    expect(image.sha256).toBe(hash);
    expect(productImageUri(image, org, product)).toBe(`storage://products/hmg-products/${org}/${product}/${hash}.png`);
  });
  it("uses jpg for JPEG and canonical UUID casing", async () => {
    const image = await prepareProductImage(new File([new Uint8Array([255, 216, 255, 1])], "photo.jpeg", { type: "image/jpeg" }));
    expect(productImageUri(image, org.toUpperCase(), product)).toMatch(/\.jpg$/);
  });
  it.each([
    ["empty", new Uint8Array(), "image/png"],
    ["oversized", new Uint8Array(2 * 1024 * 1024 + 1), "image/png"],
    ["SVG", new TextEncoder().encode("<svg/>"), "image/svg+xml"],
    ["mismatched content", new TextEncoder().encode("<svg/>"), "image/png"],
  ])("rejects %s before an upload", async (_label, bytes, mime) => {
    await expect(prepareProductImage(new File([new Uint8Array(bytes as Uint8Array).buffer], "photo", { type: mime as string }))).rejects.toThrow();
  });
  it("rejects injected identifiers in the expected path", async () => {
    const image = await prepareProductImage(new File([png], "photo.png", { type: "image/png" }));
    expect(() => productImageUri(image, "../other", product)).toThrow();
  });
});

describe("private product image reference validation", () => {
  it("allows both migrated catalogue and new product images", () => {
    expect(privateProductImagePath(`storage://images/hmg-catalogue/${"a".repeat(64)}.jpeg`)).toEqual({ bucket: "images", path: `hmg-catalogue/${"a".repeat(64)}.jpeg` });
    expect(privateProductImagePath(`storage://products/hmg-products/${org}/${product}/${"a".repeat(64)}.png`)).toEqual({ bucket: "products", path: `hmg-products/${org}/${product}/${"a".repeat(64)}.png` });
  });
  it.each([`storage://images/hmg-products/${org}/${product}/${"a".repeat(64)}.png`, "storage://products/../secret", "https://example.com/image.png"])("rejects unapproved source %s", source => {
    expect(privateProductImagePath(source)).toBeNull();
  });
});

describe("approved migrated catalogue prefix", () => {
  const prefix = "migration-b6cc3e51248d4cfe91f8dfcfc8fcea41/hmg-catalogue";
  it("accepts the exact audited products migration prefix", () => {
    expect(privateProductImagePath(`storage://products/${prefix}/${"a".repeat(64)}.jpg`)).toEqual({bucket:"products",path:`${prefix}/${"a".repeat(64)}.jpg`});
  });
  it.each([
    `storage://images/${prefix}/${"a".repeat(64)}.jpg`,
    `storage://products/migration-${"a".repeat(32)}/hmg-catalogue/${"a".repeat(64)}.jpg`,
    `storage://products/${prefix}/../${"a".repeat(64)}.jpg`,
    `storage://products/${prefix}/%2e%2e/${"a".repeat(64)}.jpg`,
    `storage://products/${prefix}/${"a".repeat(64)}.svg`,
    `storage://products/${prefix}/${"a".repeat(64)}.jpg?token=abc`,
  ])("rejects unapproved migration path %s", source => expect(privateProductImagePath(source)).toBeNull());
});
