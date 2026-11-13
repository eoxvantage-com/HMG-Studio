import { useState } from "react";
import { Link as RouterLink } from "react-router";
import { Alert, Badge, Box, Button, Divider, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Popover, Skeleton, Stack, Typography } from "@mui/material";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import { usePersonalNotifications } from "../services/notificationQueries";
import { clearActivity, markAllActivityRead, useActivityLog, type ActivityEntry } from "../services/activityLog";

const ICONS = {
  success: <CheckCircleRoundedIcon color="success" fontSize="small" />,
  error: <ErrorRoundedIcon color="error" fontSize="small" />,
  warning: <WarningAmberRoundedIcon color="warning" fontSize="small" />,
  info: <InfoRoundedIcon color="info" fontSize="small" />,
};
function ago(at: string) {
  const seconds = Math.max(0, Math.round((Date.now() - Date.parse(at)) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} h ago`;
  return new Date(at).toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" });
}
const SectionTitle = ({ children }: { children: string }) => <Typography sx={{ px: 2, pt: 1.5, pb: .5, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", color: "text.disabled" }}>{children}</Typography>;

function ActivityItem({ entry }: { entry: ActivityEntry }) {
  return <ListItem alignItems="flex-start" sx={{ py: .75, bgcolor: entry.read ? undefined : "action.hover" }}>
    <ListItemIcon sx={{ minWidth: 32, mt: .5 }}>{ICONS[entry.type] ?? ICONS.info}</ListItemIcon>
    <ListItemText primary={entry.title} secondary={<>{entry.detail && <Typography component="span" variant="body2" display="block" sx={{ overflowWrap: "anywhere" }}>{entry.detail}</Typography>}<Typography component="span" variant="caption" color="text.disabled">{ago(entry.at)}</Typography></>} />
  </ListItem>;
}

export function NotificationBell() {
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const unread = usePersonalNotifications({ status: "unread", pageSize: 1 });
  const preview = usePersonalNotifications({ pageSize: 5, enabled: !!anchor });
  const activity = useActivityLog();
  const unavailable = unread.failed || unread.identityUnavailable;
  const serverUnread = !unavailable && unread.page ? unread.page.total : 0;
  const count = serverUnread + activity.unread;
  const label = unavailable ? activity.unread ? `Notifications, ${activity.unread} new alerts` : "Notifications unavailable"
    : unread.page ? `Notifications, ${count} unread` : "Loading notifications";
  const close = () => { setAnchor(null); if (activity.unread) markAllActivityRead(); };
  return <>
    <IconButton aria-label={label} aria-haspopup="dialog" aria-expanded={!!anchor} aria-controls={anchor ? "notification-preview" : undefined} onClick={event => setAnchor(event.currentTarget)}>
      <Badge color="error" badgeContent={count || undefined} max={99}><NotificationsNoneRoundedIcon /></Badge>
    </IconButton>
    <Popover id="notification-preview" open={!!anchor} anchorEl={anchor} onClose={close} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }}>
      <Box role="dialog" aria-label="Notifications" sx={{ width: { xs: 320, sm: 400 }, maxWidth: "calc(100vw - 32px)", maxHeight: "70vh", overflowY: "auto" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}><Typography variant="h6">Notifications</Typography><IconButton aria-label="Close notifications" onClick={close}><CloseRoundedIcon /></IconButton></Stack><Divider />
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pr: 1 }}>
          <SectionTitle>Recent alerts</SectionTitle>
          {activity.entries.length > 0 && <Stack direction="row"><Button size="small" onClick={markAllActivityRead} disabled={!activity.unread}>Mark all read</Button><Button size="small" onClick={clearActivity}>Clear</Button></Stack>}
        </Stack>
        {activity.entries.length ? <List dense aria-label="Recent alerts">{activity.entries.slice(0, 15).map(entry => <ActivityItem key={entry.id} entry={entry} />)}</List>
          : <Typography sx={{ px: 2, pb: 2 }} variant="body2" color="text.secondary">Save results, errors and warnings from this browser appear here.</Typography>}
        <Divider />
        <SectionTitle>Inbox</SectionTitle>
        {preview.loading ? <Box aria-label="Loading notification preview" role="status" sx={{ p: 2 }}><Skeleton height={50} /><Skeleton height={50} /></Box> : preview.failed || preview.identityUnavailable ? <Alert severity="warning" sx={{ m: 2 }} action={<Button onClick={() => { void preview.refetch(); void unread.refetch(); }} disabled={!preview.owner}>Retry</Button>}>Notifications are unavailable.</Alert> : preview.page?.data.length ? <List aria-label="Recent notifications">{preview.page.data.map(row => <ListItem key={row.id} disablePadding><ListItemButton component={RouterLink} to={`/notifications/show/${row.id}`} onClick={close}><ListItemText primary={row.title} secondary={row.read_at ? "Read" : "Unread"} /></ListItemButton></ListItem>)}</List> : <Typography sx={{ px: 2, pb: 2 }} variant="body2" color="text.secondary">No notifications yet.</Typography>}
        <Divider /><Button component={RouterLink} to="/notifications" fullWidth onClick={close} sx={{ py: 1.5 }}>View all notifications</Button>
      </Box>
    </Popover>
  </>;
}
