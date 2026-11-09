import { defineConfig } from "vitest/config";

// Deliberately independent of vite.config.ts: tests must never load real .env
// credentials. Test cases provide fake public configuration explicitly.
export default defineConfig({
  envDir: false,
  envPrefix: [],
  esbuild: { jsx: "automatic" },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    clearMocks: true,
    restoreMocks: true,
    // Keep the adapter and app on one router module instance in Node tests.
    server: { deps: { inline: ["@refinedev/react-router", "@refinedev/mui"] } },
  },
});
