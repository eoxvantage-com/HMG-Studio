import { Client } from "@taruvi/sdk";

// Validate required environment variables
const requiredEnvVars = {
  TARUVI_SITE_URL: __TARUVI_SITE_URL__,
  TARUVI_APP_SLUG: __TARUVI_APP_SLUG__,
};

Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
        `Please check your .env.local file. See .env.example for required variables.`
    );
  }
});

/**
 * Taruvi Client instance configured with environment variables.
 * Only public site/app settings are injected through Vite. Browser requests
 * authenticate as the signed-in user; privileged API keys stay server-side.
 * Used for Navkit, DataProviders, and direct SDK operations.
 *
 * @example
 * // Use with Refine providers (recommended)
 * import { taruviDataProvider, taruviAuthProvider } from "./providers/refineProviders";
 *
 * @example
 * // Direct SDK usage (advanced)
 * import { taruviClient } from "./taruviClient";
 * const response = await taruviClient.httpClient.get("api/...");
 *
 * @see {@link https://docs.taruvi.com|Taruvi Documentation}
 */
export const taruviClient = (() => {
  try {
    return new Client({
      authMode: "session",
      appSlug: __TARUVI_APP_SLUG__,
      apiUrl: __TARUVI_SITE_URL__,
    });
  } catch (error) {
    console.error("Failed to initialize Taruvi Client:", error);
    throw new Error(
      "Taruvi configuration error. Please check your .env.local file. " +
        "See .env.example for required variables."
    );
  }
})();
