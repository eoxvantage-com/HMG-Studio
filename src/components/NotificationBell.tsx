import { useState } from "react";
import { Link as RouterLink } from "react-router";
import { Alert, Badge, Box, Button, Divider, IconButton, List, ListItem, ListItemButton, ListItemText, Popover, Skeleton, Stack, Typography } from "@mui/material";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { usePersonalNotifications } from "../services/notificationQueries";

export function NotificationBell() {
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const unread = usePersonalNotifications({ status: "unread", pageSize: 1 });
  const preview = usePersonalNotifications({ pageSize: 5, enabled: !!anchor });
  const unavailable = unread.failed || unread.identityUnavailable;
  const label = unavailable ? "Notifications unavailable" : unread.page ? `Notifications, ${unread.page.total} unread` : "Loading notifications";
  return <>
    <IconButton aria-label={label} aria-haspopup="dialog" aria-expanded={!!anchor} aria-controls={anchor ? "notification-preview" : undefined} onClick={event => setAnchor(event.currentTarget)}>
      <Badge color="error" badgeContent={!unavailable && unread.page ? unread.page.total : undefined} max={99}><NotificationsNoneRoundedIcon /></Badge>
    </IconButton>
    <Popover id="notification-preview" open={!!anchor} anchorEl={anchor} onClose={() => setAnchor(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }}>
      <Box role="dialog" aria-label="Notifications" sx={{ width: { xs: 300, sm: 380 }, maxWidth: "calc(100vw - 32px)" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}><Typography variant="h6">Notifications</Typography><IconButton aria-label="Close notifications" onClick={() => setAnchor(null)}><CloseRoundedIcon /></IconButton></Stack><Divider />
        {preview.loading ? <Box aria-label="Loading notification preview" role="status" sx={{ p: 2 }}><Skeleton height={50} /><Skeleton height={50} /></Box> : preview.failed || preview.identityUnavailable ? <Alert severity="warning" sx={{ m: 2 }} action={<Button onClick={() => { void preview.refetch(); void unread.refetch(); }} disabled={!preview.owner}>Retry</Button>}>Notifications are unavailable.</Alert> : preview.page?.data.length ? <List aria-label="Recent notifications">{preview.page.data.map(row => <ListItem key={row.id} disablePadding><ListItemButton component={RouterLink} to={`/notifications/show/${row.id}`} onClick={() => setAnchor(null)}><ListItemText primary={row.title} secondary={row.read_at ? "Read" : "Unread"} /></ListItemButton></ListItem>)}</List> : <Typography sx={{ p: 3 }} color="text.secondary">No notifications yet.</Typography>}
        <Divider /><Button component={RouterLink} to="/notifications" fullWidth onClick={() => setAnchor(null)} sx={{ py: 1.5 }}>View all notifications</Button>
      </Box>
    </Popover>
  </>;
}
