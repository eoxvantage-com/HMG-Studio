import { useMemo } from "react";
import { useGetIdentity, useList } from "@refinedev/core";
import { ERP_QUERY_OPTIONS } from "./erp";
import { notificationFilters, validNotificationIdentity, validateNotificationPage, type NotificationFilter, type NotificationRecord } from "./notifications";

const sorters = [{ field: "created_at", order: "desc" as const }, { field: "id", order: "desc" as const }];
/** Paged MUI inbox/cards, not DataGrid: useList is intentional here. */
export function usePersonalNotifications(options: NotificationFilter & { page?: number; pageSize?: number; enabled?: boolean } = {}) {
  const { data: identity, isLoading: identityLoading, isError: identityError } = useGetIdentity<{ id: string }>();
  const owner = validNotificationIdentity(identity?.id) ? identity.id : undefined;
  const enabled = !!owner && options.enabled !== false && !identityError;
  const { search, status, type, id } = options;
  const validId = id === undefined || validNotificationIdentity(id);
  const filters = useMemo(() => owner ? notificationFilters(owner, { search, status, type, id: validId ? id : undefined }) : [], [owner, validId, search, status, type, id]);
  const pagination = useMemo(() => ({ currentPage: options.page ?? 1, pageSize: options.pageSize ?? 10, mode: "server" as const }), [options.page, options.pageSize]);
  const { result, query } = useList<NotificationRecord>({ resource: "notifications", filters, sorters, pagination,
    queryOptions: { ...ERP_QUERY_OPTIONS, enabled: enabled && validId, placeholderData: undefined }, errorNotification: false });
  let page: { data: NotificationRecord[]; total: number } | undefined;
  let invalid = !validId;
  if (enabled && query.isSuccess && !query.isError && owner) {
    try {
      page = validateNotificationPage(result, owner);
      if (id && page.data.some(row => row.id !== id)) { page = undefined; invalid = true; }
    } catch { invalid = true; }
  }
  // React Query refetch bypasses enabled. Guard the imperative path too.
  const canFetch = enabled && validId;
  return { ...query, refetch: () => canFetch ? query.refetch() : Promise.resolve(undefined), canFetch, page, owner, identityLoading, identityUnavailable: !identityLoading && (!owner || identityError), failed: query.isError || invalid,
    loading: identityLoading || (enabled && query.isLoading) };
}
