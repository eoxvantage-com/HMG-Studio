import { describe, expect, it } from "vitest";
import { darkThemeOptions, lightThemeOptions, taruviTokens } from "../../../themeOptions";
import { getContrastRatio } from "@mui/material/styles";
describe("compact ERP design tokens", () => {
  it("uses the customer-aligned olive and ivory workspace palette", () => {
    expect(taruviTokens.button.primaryDefault).toBe("#4B563F");
    expect(taruviTokens.surface.bg).toBe("#F6F3ED");
    expect(taruviTokens.workspace.sidebar).toBe("#FDFCF9");
  });
  it("uses the full sidebar and compact title-case action design", () => {
    expect(taruviTokens.size.sidebarExpanded).toBe(220);
    expect(taruviTokens.size.navHeight).toBe(48);
    expect((lightThemeOptions.typography as { button: { textTransform: string } }).button.textTransform).toBe("none");
    expect(taruviTokens.spacing.cardPadding).toBe(20);
  });
  it("keeps normal text and semantic status labels at AA contrast", () => {
    for (const color of [taruviTokens.text.primary, taruviTokens.text.secondary, taruviTokens.text.muted]) {
      expect(getContrastRatio(color, taruviTokens.surface.paper)).toBeGreaterThanOrEqual(4.5);
      expect(getContrastRatio(color, taruviTokens.surface.bg)).toBeGreaterThanOrEqual(4.5);
    }
    for (const color of [taruviTokens.button.primaryDefault, taruviTokens.status.complete, taruviTokens.status.review, taruviTokens.error[600]]) {
      expect(getContrastRatio(color, taruviTokens.text.onDark)).toBeGreaterThanOrEqual(4.5);
    }
  });
  it("provides global visible keyboard focus and a reduced-motion override in both themes", () => {
    for (const theme of [lightThemeOptions, darkThemeOptions]) {
      const css = theme.components?.MuiCssBaseline?.styleOverrides as Record<string, unknown>;
      expect(css["a:focus-visible, button:focus-visible, [tabindex]:focus-visible"]).toBeTruthy();
      expect(css["@media (prefers-reduced-motion: reduce)"]).toBeTruthy();
    }
  });
  it("keeps navy navigation text, active states and stone accents readable", () => {
    const shell = taruviTokens.workspace;
    for (const background of [shell.sidebar, shell.sidebarHover, shell.sidebarSelected]) {
      for (const foreground of [shell.sidebarText, shell.sidebarMuted]) {
        expect(getContrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
      }
      expect(getContrastRatio(shell.sidebarAccent, background)).toBeGreaterThanOrEqual(3);
    }
    expect(getContrastRatio(shell.stoneText, shell.stone)).toBeGreaterThanOrEqual(4.5);
  });
});
