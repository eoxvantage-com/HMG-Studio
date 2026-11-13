import { useMemo } from "react";
import type { NotificationProvider, OpenNotificationParams } from "@refinedev/core";
import { useNotificationProvider } from "@refinedev/mui";
import { recordActivity } from "../services/activityLog";

/**
 * Refine's MUI notification provider (top-right toasts) plus a record of each
 * message for the header bell. Not a second toast system: every toast still
 * goes through Refine's provider.
 */
export function useRecordingNotificationProvider(): NotificationProvider {
  const base = useNotificationProvider();
  return useMemo(() => ({
    ...base,
    open: (params: OpenNotificationParams) => {
      if (params.type !== "progress") {
        const title = params.description || params.message;
        recordActivity(params.type, title, params.description ? params.message : undefined);
      }
      base.open(params);
    },
  }), [base]);
}

type Notify = ((params: OpenNotificationParams) => void) | undefined;
/** Open a toast with a bold title and an optional detail line (Refine MUI renders `description` as the title). */
export function toast(open: Notify, type: "success" | "error", title: string, detail?: string) {
  open?.({ type, description: title, message: detail ?? "" });
}
