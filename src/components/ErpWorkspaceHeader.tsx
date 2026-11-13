import { Box, Breadcrumbs, IconButton, Link as MuiLink, Stack, Tooltip, Typography } from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import { Link, useLocation } from "react-router";
import { ERP_MODULES } from "../erp/modules";
import { ERP_OPEN_NAVIGATION } from "./sidenav/MuiSidenav";
import { taruviTokens } from "../../themeOptions";
import { NotificationBell } from "./NotificationBell";

export function ErpWorkspaceHeader() {
  const { pathname } = useLocation();
  const module = ERP_MODULES.find(item => pathname === item.path || (item.path !== "/" && pathname.startsWith(`${item.path}/`)));
  const label = pathname === "/settings/account" ? "Account preferences" : module?.label || "Workspace";
  return <Box component="header" sx={{ minHeight: taruviTokens.size.navHeight, px: { xs: 1.5, md: 3 }, py: .5, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, bgcolor: "background.paper", borderBottom: 1, borderColor: "divider", position: "sticky", top: 0, zIndex: 1100 }}>
    <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
      <IconButton aria-label="Open navigation" onClick={() => window.dispatchEvent(new Event(ERP_OPEN_NAVIGATION))} sx={{ display: { xs: "inline-flex", md: "none" } }}><MenuRoundedIcon /></IconButton>
      <Breadcrumbs separator="›" aria-label="Workspace breadcrumb"><MuiLink component={Link} to="/" underline="hover" color="text.secondary">Workspace</MuiLink><Typography variant="caption" color="text.primary">{label}</Typography></Breadcrumbs>
    </Stack>
    <Stack direction="row" alignItems="center" spacing={1}>
      <NotificationBell />
      <Tooltip title="Account preferences"><IconButton component={Link} to="/settings/account" aria-label="Account preferences"><AccountCircleRoundedIcon fontSize="small" /></IconButton></Tooltip>
    </Stack>
  </Box>;
}
