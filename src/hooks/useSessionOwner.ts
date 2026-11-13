import { useGetIdentity } from "@refinedev/core";

type IdentityPayload = { id?: unknown; username?: unknown; data?: { id?: unknown; username?: unknown } } | null | undefined;

/**
 * Stable per-user scope key for lookups, pending-command storage and remount keys.
 *
 * The key is a cache/isolation scope, not an authorization boundary: every read
 * and command is still authorized server-side for the signed-in caller.
 *
 * - Accepts any non-empty id (UUID, integer or string) and falls back to username.
 * - Unwraps a `{ data: {...} }` envelope if the provider returns one.
 * - Keeps the settled id during background refetches so workspaces do not
 *   blank their organization lists or remount (and lose drafts) on refetch.
 *   A different signed-in user yields a different key, which still remounts.
 */
export function sessionOwnerId(payload: IdentityPayload): string {
  const user = payload && typeof payload === "object" && payload.data && typeof payload.data === "object" && payload.id === undefined ? payload.data : payload;
  const raw = user?.id ?? user?.username;
  if (typeof raw === "string") return raw.trim();
  if (typeof raw === "number" && Number.isFinite(raw)) return String(raw);
  return "";
}

export function useSessionOwner() {
  const identity = useGetIdentity<IdentityPayload>();
  const owner = !identity.isLoading && !identity.isError ? sessionOwnerId(identity.data) : "";
  return { identity, owner };
}
