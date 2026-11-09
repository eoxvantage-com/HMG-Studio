import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { Avatar, Box, Button, Divider, Drawer, IconButton, InputAdornment, List, ListItemButton, ListItemIcon, ListItemText, TextField, Typography } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import WarehouseRoundedIcon from "@mui/icons-material/WarehouseRounded";
import PeopleOutlineRoundedIcon from "@mui/icons-material/PeopleOutlineRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import ExtensionRoundedIcon from "@mui/icons-material/ExtensionRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import { useGetIdentity, useLogout, useWarnAboutChange } from "@refinedev/core";
import type { TaruviUser } from "../../providers/refineProviders";
import { ERP_MODULES } from "../../erp/modules";
import { taruviTokens } from "../../../themeOptions";
import "./sidenav.css";

export const ERP_SIDEBAR_WIDTH = taruviTokens.size.sidebarExpanded;
export const ERP_OPEN_NAVIGATION = "hmg:open-navigation";
const groups = ["Workspace", "Catalog", "Stock", "Insights", "Admin", "Integrations"];
const shell = taruviTokens.workspace;
const shellStyles = {
  width: ERP_SIDEBAR_WIDTH,
  maxWidth: "100vw",
  boxSizing: "border-box" as const,
  boxShadow: "none",
  bgcolor: shell.sidebar,
  color: shell.sidebarText,
  backgroundImage: "none",
  borderColor: shell.sidebarBorder,
  "& .MuiDivider-root": { borderColor: shell.sidebarBorder },
  "& .MuiListItemButton-root": {
    color: shell.sidebarText,
    "&:hover": { bgcolor: shell.sidebarHover },
    "&.Mui-selected": {
      bgcolor: shell.sidebarSelected,
      color: shell.sidebarText,
      boxShadow: `inset 3px 0 0 ${shell.sidebarAccent}`,
      "&:hover": { bgcolor: shell.sidebarSelected },
      "& .MuiListItemIcon-root": { color: shell.sidebarAccent },
      "& .MuiListItemText-primary": { fontWeight: 700 },
    },
  },
  "& .MuiListItemIcon-root, & .MuiListItemText-secondary": { color: shell.sidebarMuted },
  "& .MuiIconButton-root": { color: shell.sidebarText, "&:hover": { bgcolor: shell.sidebarHover } },
  "& a:focus-visible, & button:focus-visible, & [tabindex]:focus-visible": { outline: `2px solid ${shell.sidebarAccent}`, outlineOffset: -2 },
};

function ModuleIcon({ module }: { module: (typeof ERP_MODULES)[number] }) {
  const text = `${module.key} ${module.label}`.toLowerCase();
  if (module.kind === "dashboard") return <DashboardRoundedIcon />;
  if (text.includes("warehouse")) return <WarehouseRoundedIcon />;
  if (text.includes("location")) return <LocationOnRoundedIcon />;
  if (text.includes("categor")) return <CategoryRoundedIcon />;
  if (text.includes("customer") || text.includes("supplier") || text.includes("user")) return <PeopleOutlineRoundedIcon />;
  if (text.includes("order")) return <ShoppingCartRoundedIcon />;
  if (module.group === "Stock") return <SwapHorizRoundedIcon />;
  if (module.group === "Insights") return <AssessmentRoundedIcon />;
  if (module.group === "Admin") return <SettingsRoundedIcon />;
  if (module.group === "Integrations") return <ExtensionRoundedIcon />;
  return <Inventory2RoundedIcon />;
}

/** Navigation visibility is not an authorization grant. Routes retain native data permissions. */
export function MuiSidenav() {
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const { data: user } = useGetIdentity<TaruviUser>();
  const { mutate: logout } = useLogout();
  const { warnWhen, setWarnWhen } = useWarnAboutChange();
  useEffect(() => {
    const open = () => setMobileOpen(true);
    window.addEventListener(ERP_OPEN_NAVIGATION, open);
    return () => window.removeEventListener(ERP_OPEN_NAVIGATION, open);
  }, []);
  useEffect(() => { setMobileOpen(false); }, [pathname]);
  const filtered = ERP_MODULES.filter(module => `${module.label} ${module.group}`.toLowerCase().includes(search.trim().toLowerCase()));
  const displayName = user?.first_name || user?.username || "My account";
  function handleLogout() {
    if (warnWhen && !window.confirm("You have unsaved changes. Leave and log out?")) return;
    setWarnWhen(false);
    logout();
  }
  const content = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ px: 2.5, py: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box><Box component="img" src="/brand/hmg-stones-logo.webp" alt="HMG Stones" sx={{ width: 91, height: 62, objectFit: "contain", display: "block", mb: 1 }} /><Typography variant="caption" sx={{ color: shell.sidebarMuted }}>Stone operations</Typography></Box>
        <IconButton aria-label="Close navigation" onClick={() => setMobileOpen(false)} sx={{ display: { xs: "inline-flex", md: "none" } }}><CloseRoundedIcon fontSize="small" /></IconButton>
      </Box>
      <Divider />
      <Box sx={{ px: 1.5, py: 2 }}><TextField fullWidth placeholder="Search modules..." value={search} onChange={event => setSearch(event.target.value)} inputProps={{ "aria-label": "Search modules" }} sx={{ "& .MuiOutlinedInput-root": { bgcolor: shell.sidebarHover, color: shell.sidebarText, "& fieldset": { borderColor: shell.sidebarBorder }, "&:hover fieldset, &.Mui-focused fieldset": { borderColor: shell.sidebarAccent } }, "& input::placeholder": { color: shell.sidebarMuted, opacity: 1 } }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: 18, color: shell.sidebarMuted }} /></InputAdornment> }} /></Box>
      <Box component="nav" aria-label="ERP modules" sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: 1.25, pb: 2, scrollbarColor: `${shell.sidebarBorder} ${shell.sidebar}`, scrollbarWidth: "thin" }}>
        {groups.map(group => {
          const modules = filtered.filter(module => module.group === group);
          if (!modules.length) return null;
          return <Box key={group} sx={{ mb: 1.5 }}><Typography variant="caption" component="h2" sx={{ px: 1.25, pt: 1, pb: .75, color: shell.sidebarMuted, fontWeight: 600, letterSpacing: taruviTokens.letterSpacing.subheading }}>{group}</Typography><List disablePadding>
            {modules.map(module => {
              const selected = pathname === module.path || (module.path !== "/" && pathname.startsWith(`${module.path}/`));
              return <ListItemButton component={Link} to={module.path} key={module.key} selected={selected} aria-current={selected ? "page" : undefined} onClick={() => setMobileOpen(false)} sx={{ mb: .25 }}>
                <ListItemIcon sx={{ minWidth: 30, "& svg": { fontSize: 18 } }}><ModuleIcon module={module} /></ListItemIcon><ListItemText primary={module.label} primaryTypographyProps={{ fontSize: taruviTokens.fontSize.p3 }} />
              </ListItemButton>;
            })}
          </List></Box>;
        })}
        {!filtered.length && <Box sx={{ px: 1, py: 2 }}><Typography variant="body2">No modules found</Typography><Button variant="text" onClick={() => setSearch("")} aria-label="Clear module search" sx={{ mt: 1, color: shell.sidebarAccent }}>Clear search</Button></Box>}
      </Box>
      <Divider />
      <Box sx={{ p: 1.25 }}>
        <ListItemButton component={Link} to="/settings/account" aria-label="Account preferences"><Avatar sx={{ width: 30, height: 30, mr: 1, fontSize: 12, bgcolor: shell.stone, color: shell.stoneText }}>{displayName.slice(0, 1).toUpperCase()}</Avatar><ListItemText primary={displayName} secondary="Account preferences" primaryTypographyProps={{ noWrap: true }} secondaryTypographyProps={{ fontSize: taruviTokens.fontSize.label }} /></ListItemButton>
        <ListItemButton onClick={handleLogout}><ListItemIcon sx={{ minWidth: 28 }}><LogoutRoundedIcon sx={{ fontSize: 17 }} /></ListItemIcon><ListItemText primary="Log out" /></ListItemButton>
      </Box>
    </Box>
  );
  return <>
    <Drawer variant="permanent" sx={{ display: { xs: "none", md: "block" }, "& .MuiDrawer-paper": { ...shellStyles, top: 0, height: "100dvh" } }}>{content}</Drawer>
    <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": shellStyles }}>{mobileOpen ? content : null}</Drawer>
  </>;
}
