import type { PropsWithChildren } from "react";
import { useMemo } from "react";
import { ConfigProvider } from "antd";
import enUS from "antd/locale/en_US";
import { useTheme } from "@mui/material/styles";

/** Scoped adapter: one token authority, no global reset or parallel toast provider. */
export function HmgAntProvider({ children }: PropsWithChildren) {
  const mui = useTheme();
  const theme = useMemo(() => ({ token: {
    colorPrimary: mui.palette.primary.main, colorSuccess: mui.palette.success.main,
    colorWarning: mui.palette.warning.main, colorError: mui.palette.error.main,
    colorText: mui.palette.text.primary, colorTextSecondary: mui.palette.text.secondary,
    colorBgContainer: mui.palette.background.paper, colorBgLayout: mui.palette.background.default,
    colorBorder: mui.palette.divider, fontFamily: mui.typography.fontFamily,
    borderRadius: 8, controlHeight: 44, motion: false,
  } }), [mui]);
  return <ConfigProvider locale={enUS} theme={theme}>{children}</ConfigProvider>;
}
