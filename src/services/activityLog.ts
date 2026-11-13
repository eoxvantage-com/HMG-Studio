import { useSyncExternalStore } from "react";

/** Recent toast notifications, kept so the header bell can show what happened. */
export type ActivityType = "success" | "error" | "warning" | "info";
export type ActivityEntry = { id: string; type: ActivityType; title: string; detail?: string; at: string; read: boolean };

const KEY = "hmg-activity-log";
const MAX = 50;
const listeners = new Set<() => void>();
let entries: ActivityEntry[] = load();

function load(): ActivityEntry[] {
  try {
    const raw = typeof localStorage === "undefined" ? null : localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(item => item && typeof item.id === "string" && typeof item.title === "string").slice(0, MAX) : [];
  } catch { return []; }
}
function commit(next: ActivityEntry[]) {
  entries = next.slice(0, MAX);
  try { localStorage.setItem(KEY, JSON.stringify(entries)); } catch { /* storage full or blocked: keep in memory */ }
  listeners.forEach(listener => listener());
}

export function recordActivity(type: ActivityType, title: string, detail?: string) {
  const clean = title.trim();
  if (!clean) return;
  const last = entries[0];
  // Collapse an identical message repeated within a few seconds (e.g. re-renders, retries).
  if (last && last.title === clean && last.detail === detail && Date.now() - Date.parse(last.at) < 4000) return;
  commit([{ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, type, title: clean, detail: detail?.trim() || undefined, at: new Date().toISOString(), read: false }, ...entries]);
}
export const markAllActivityRead = () => commit(entries.map(entry => ({ ...entry, read: true })));
export const clearActivity = () => commit([]);

const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export function useActivityLog() {
  const list = useSyncExternalStore(subscribe, () => entries, () => entries);
  return { entries: list, unread: list.filter(entry => !entry.read).length };
}
/** Test helper. */
export const resetActivityLogForTests = () => { entries = []; listeners.forEach(listener => listener()); };
