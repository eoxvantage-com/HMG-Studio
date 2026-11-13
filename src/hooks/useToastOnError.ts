import { useEffect, useRef } from "react";
import { useNotification } from "@refinedev/core";
import { toast } from "../providers/notificationProvider";

/** Shows a validation or save error as a top-right toast (and in the bell) whenever it appears or changes. */
export function useToastOnError(message: string, title = "Not saved") {
  const { open } = useNotification();
  const openRef = useRef(open); openRef.current = open;
  useEffect(() => { if (message) toast(openRef.current, "error", title, message); }, [message, title]);
}
