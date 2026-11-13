import { useEffect, useMemo, useState } from "react";
import { useGetIdentity } from "@refinedev/core";
import { Avatar, Box, ButtonBase, CircularProgress, IconButton, InputAdornment, Popover, Stack, TextField, Tooltip, Typography } from "@mui/material";
import AppsRoundedIcon from "@mui/icons-material/AppsRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { taruviTokens } from "../../themeOptions";
import { taruviClient } from "../taruviClient";

export type LauncherApp = { slug: string; name: string; url: string; icon: string | null };
type Identity = { username?: string };

/** Only https links to Taruvi-hosted frontends are offered as app destinations. */
export function safeAppUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

/** Normalizes the platform's user app list (same source as the Navkit app launcher). */
export function parseLauncherApps(payload: unknown): LauncherApp[] {
  const rows = (payload as { data?: unknown })?.data;
  if (!Array.isArray(rows)) return [];
  return rows.flatMap(row => {
    const app = row as Record<string, unknown>;
    const url = safeAppUrl(app.url);
    const name = typeof app.display_name === "string" && app.display_name.trim() ? app.display_name : typeof app.name === "string" ? app.name : "";
    if (!url || !name || typeof app.slug !== "string") return [];
    return [{ slug: app.slug, name, url, icon: safeAppUrl(app.icon) }];
  });
}

/** Header "Apps" drawer: switch between the HMG Stones apps on this Taruvi site. */
export function AppSwitcher() {
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const [search, setSearch] = useState("");
  const identity = useGetIdentity<Identity>();
  const username = identity.data?.username;
  const [apps, setApps] = useState<{ owner: string; data: LauncherApp[] | null; failed: boolean } | null>(null);
  // Loaded on first open, once per signed-in user.
  useEffect(() => {
    if (!anchor || !username || apps?.owner === username) return;
    let active = true;
    taruviClient.httpClient.get(`api/users/${encodeURIComponent(username)}/apps/`)
      .then(payload => { if (active) setApps({ owner: username, data: parseLauncherApps(payload as unknown), failed: false }); })
      .catch(() => { if (active) setApps({ owner: username, data: null, failed: true }); });
    return () => { active = false; };
  }, [anchor, username, apps?.owner]);
  const loaded = apps && apps.owner === username ? apps : null;
  const shown = useMemo(() => (loaded?.data ?? []).filter(app => app.name.toLowerCase().includes(search.trim().toLowerCase())), [loaded?.data, search]);
  const current = __TARUVI_APP_SLUG__;
  return <>
    <Tooltip title="Apps"><IconButton aria-label="Apps" aria-haspopup="dialog" aria-expanded={!!anchor} onClick={event => setAnchor(event.currentTarget)}><AppsRoundedIcon /></IconButton></Tooltip>
    <Popover open={!!anchor} anchorEl={anchor} onClose={() => setAnchor(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }}>
      <Box role="dialog" aria-label="Apps" sx={{ width: { xs: 300, sm: 380 }, maxWidth: "calc(100vw - 32px)", p: 2 }}>
        <TextField fullWidth size="small" placeholder="Search for apps" value={search} onChange={event => setSearch(event.target.value)} slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }, htmlInput: { "aria-label": "Search for apps" } }} />
        {identity.isLoading || (username && !loaded) ? <Stack alignItems="center" sx={{ py: 3 }}><CircularProgress size={24} aria-label="Loading apps" /></Stack>
          : !username || loaded?.failed ? <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>Apps are unavailable right now.</Typography>
            : !shown.length ? <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>{search ? "No matching apps" : "No apps available"}</Typography>
              : <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 1, mt: 2 }}>
                {shown.map(app => {
                  const here = app.slug === current;
                  return <ButtonBase key={app.slug} component="a" href={app.url} aria-current={here ? "page" : undefined} onClick={() => setAnchor(null)}
                    sx={{ flexDirection: "column", gap: 1, p: 1.5, borderRadius: 2, textAlign: "center", border: 1, borderColor: here ? "primary.main" : "transparent", "&:hover, &:focus-visible": { bgcolor: "action.hover" } }}>
                    {app.icon ? <Avatar src={app.icon} alt="" variant="rounded" sx={{ width: 44, height: 44, bgcolor: "#fff" }} />
                      : <Avatar variant="rounded" sx={{ width: 44, height: 44, bgcolor: taruviTokens.status.chartPrimary, fontWeight: 700 }}>{app.name.charAt(0)}</Avatar>}
                    <Typography variant="caption" sx={{ lineHeight: 1.3, overflowWrap: "anywhere" }}>{app.name}</Typography>
                    {here && <Typography variant="caption" color="primary" sx={{ fontSize: 10, mt: -.5 }}>Current</Typography>}
                  </ButtonBase>;
                })}
              </Box>}
      </Box>
    </Popover>
  </>;
}
