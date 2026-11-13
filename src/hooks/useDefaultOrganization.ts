import { useEffect, useRef } from "react";

const KEY = "hmg-active-organization";
export function rememberedOrganization(): string {
  try { return localStorage.getItem(KEY) ?? ""; } catch { return ""; }
}
export function rememberOrganization(id: string) {
  try { if (id) localStorage.setItem(KEY, id); } catch { /* blocked storage: selection still works for this page */ }
}

/**
 * Selects an organization automatically so pages load data straight away:
 * the last organization the user picked (if still allowed), otherwise the
 * first allowed one. The user can still change it; the choice is remembered
 * across pages.
 */
export function useDefaultOrganization(current: string, candidates: string[], select: (id: string) => void, ready = true) {
  const selectRef = useRef(select); selectRef.current = select;
  const key = candidates.join("|");
  useEffect(() => {
    if (current || !ready || !candidates.length) return;
    const saved = rememberedOrganization();
    selectRef.current(candidates.includes(saved) ? saved : candidates[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, ready, key]);
  useEffect(() => { if (current) rememberOrganization(current); }, [current]);
}
