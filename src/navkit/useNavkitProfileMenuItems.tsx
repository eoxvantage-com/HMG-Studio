import { useMemo } from "react";
// Import the type without pulling Navkit's React 19 component sources into this React 18 app.
import type { ProfileMenuItem } from "@taruvi/navkit/src/types";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import { useNavigate } from "react-router";

// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

/**
 * Custom entries for the Navkit profile menu (avatar dropdown).
 * Items appear after dark mode and before Logout.
 *
 * @see docs/GETTING_STARTED.md#custom-profile-menu-items
 */
export function useNavkitProfileMenuItems(): ProfileMenuItem[] {
  const navigate = useNavigate();
  return useMemo(
    () => [
      { title: "Account preferences", icon: <ManageAccountsRoundedIcon />, callBackFunc: () => navigate("/settings/account") },
    ],
    [navigate],
  );
}
