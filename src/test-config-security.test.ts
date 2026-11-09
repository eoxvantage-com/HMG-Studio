// @vitest-environment node
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { resolveConfig } from "vite";
import { expect, it } from "vitest";
import testConfig from "../vitest.config";

it("does not load credential-like variables from .env files into the test runtime", async () => {
  const root = mkdtempSync(join(tmpdir(), "hmg-vitest-env-"));
  try {
    writeFileSync(join(root, ".env"), "VITE_HMG_TEST_CREDENTIAL=FAKE_ENV_SENTINEL\n");
    const config = await resolveConfig({ ...testConfig, root, configFile: false }, "serve", "test");
    expect(config.env).not.toHaveProperty("VITE_HMG_TEST_CREDENTIAL");
    expect(config.envDir).toBe(false);
  } finally {
    // Only remove the exact temporary directory created above, never a computed parent.
    if (dirname(resolve(root)) !== resolve(tmpdir())) throw new Error("Unexpected temp path");
    rmSync(root, { recursive: true });
  }
});
