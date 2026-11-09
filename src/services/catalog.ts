export type Category = { id: string; organization_id: string; name: string; description: string | null; slug: string; is_active: boolean; created_at?: string | null };
export const CATALOG_FUNCTION = "hmg-categories-v1";
export const CATALOG_FUNCTION_META = { kind: "function", async: false } as const;
const messages: Record<string, string> = {
  VALIDATION_ERROR: "Check the category name and description.",
  FORBIDDEN: "You do not have access to this organization or operation.",
  UNAUTHENTICATED: "Your session is unavailable. Sign in again.",
  CONFLICT: "This request conflicts with a saved category. Check saved record before continuing.",
  NOT_FOUND: "No saved record was found. Keep this request open and check again before starting another create.",
  VALIDATION_UNAVAILABLE: "Category validation is unavailable. No category was created.",
  LOAD_FAILED: "Category lookup failed. No category was created.",
};
export class CatalogError extends Error {
  constructor(public code: string) {
    super(messages[code] ?? "Save could not be confirmed. Use Check saved record before creating another category.");
  }
}
export function decodeCategory(value: unknown): Category {
  if (!value || typeof value !== "object") throw new CatalogError("INVALID_RESPONSE");
  const envelope = value as Record<string, unknown>;
  if (envelope.ok !== true || envelope.verified !== true) {
    throw new CatalogError(typeof envelope.code === "string" ? envelope.code : "INVALID_RESPONSE");
  }
  const row = envelope.record as Record<string, unknown> | undefined;
  if (!row || ["id", "organization_id", "name", "slug"].some(key => typeof row[key] !== "string" || !row[key]) ||
      typeof row.is_active !== "boolean" || (row.description !== null && typeof row.description !== "string")) {
    throw new CatalogError("INVALID_RESPONSE");
  }
  return { id: row.id as string, organization_id: row.organization_id as string, name: row.name as string,
    slug: row.slug as string, description: row.description as string | null, is_active: row.is_active,
    ...(typeof row.created_at === "string" || row.created_at === null ? { created_at: row.created_at } : {}) };
}
