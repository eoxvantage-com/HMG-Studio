import type { CrudFilters } from "@refinedev/core";
import { ERP_MODULES } from "../erp/modules";

export type NotificationRecord = {
  id: string; user_id: string; title: string; message: string; type: string;
  priority: string; read_at?: string | null; created_at?: string | null;
  action_url?: string | null; [key: string]: unknown;
};
export type NotificationFilter = { search?: string; status?: "all" | "unread" | "read"; type?: string; id?: string };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const validNotificationIdentity = (value: unknown): value is string => typeof value === "string" && uuid.test(value);
export function notificationFilters(owner: string, options: NotificationFilter = {}): CrudFilters {
  if (!validNotificationIdentity(owner)) throw new Error("A verified account is required.");
  const result: CrudFilters = [{ field: "user_id", operator: "eq", value: owner }];
  if (options.search?.trim()) result.push({ field: "title", operator: "contains", value: options.search.trim() });
  if (options.status === "unread" || options.status === "read") result.push({ field: "read_at", operator: options.status === "unread" ? "null" : "nnull", value: true });
  if (options.type?.trim()) result.push({ field: "type", operator: "eq", value: options.type.trim() });
  if (options.id) {
    if (!uuid.test(options.id)) throw new Error("Invalid notification identifier.");
    result.push({ field: "id", operator: "eq", value: options.id });
  }
  return result;
}
export function validateNotificationPage(value: unknown, owner: string): { data: NotificationRecord[]; total: number } {
  const fail = (): never => { throw new Error("Notification response could not be verified."); };
  if (!value || typeof value !== "object") return fail();
  const page = value as { data?: unknown; total?: unknown };
  if (!Array.isArray(page.data) || typeof page.total !== "number" || !Number.isSafeInteger(page.total) || page.total < page.data.length || page.total < 0) return fail();
  const ids = new Set<string>();
  for (const entry of page.data) {
    if (!entry || typeof entry !== "object") return fail();
    const row = entry as NotificationRecord;
    if (!validNotificationIdentity(row.id) || row.user_id !== owner || ids.has(row.id)) return fail();
    if (![row.title, row.message, row.type, row.priority].every(item => typeof item === "string")) return fail();
    if ([row.read_at, row.created_at].some(item => item != null && (typeof item !== "string" || !Number.isFinite(Date.parse(item))))) return fail();
    ids.add(row.id);
  }
  return { data: page.data as NotificationRecord[], total: page.total };
}
/** Only known read destinations; never interpret arbitrary notification URLs. */
export function safeNotificationPath(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.startsWith("/") || /[%\\?#\s]/.test(value) || value.includes("..") || value.startsWith("//")) return undefined;
  if (ERP_MODULES.some(module => module.path === value)) return value;
  const detail = value.match(/^(\/[^/]+)\/show\/([0-9a-f-]+)$/i);
  if (detail && uuid.test(detail[2]) && ERP_MODULES.some(module => module.resource && module.path === detail[1] && module.key !== "categories")) return value;
  return undefined;
}
