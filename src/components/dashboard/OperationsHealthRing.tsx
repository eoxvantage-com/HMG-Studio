import { useState, type KeyboardEvent } from "react";
import { Box, Tooltip } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { taruviTokens } from "../../../themeOptions";
import { STATUS_TEXT, formatMetric, type AnalysisSegment, type SegmentStatus } from "../../services/dashboardAnalysis";

/** Chart palette (UI_Guidelines section 7), shared by the ring and its legend. */
export const RING_TONE: Record<SegmentStatus, string> = {
  good: taruviTokens.status.resolved, watch: taruviTokens.status.underReview, risk: taruviTokens.status.delayedAlt, none: "#bdbdbd",
};

type Props = {
  segments: AnalysisSegment[];
  status: SegmentStatus;
  alertCount: number;
  selected: string;
  onSelect: (key: string) => void;
  money: (value: string, compact?: boolean) => string;
  title?: string;
};

const W = 680, H = 470, CX = W / 2, CY = H / 2, R = 128, STROKE = 26, LABEL_R = 196, GAP = 3;
const rad = (deg: number) => (deg * Math.PI) / 180;
const point = (r: number, deg: number) => ({ x: CX + r * Math.cos(rad(deg)), y: CY + r * Math.sin(rad(deg)) });
function arc(r: number, start: number, end: number) {
  const a = point(r, start), b = point(r, end);
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${r} ${r} 0 ${end - start > 180 ? 1 : 0} 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
}

/**
 * Radial operations summary. Each arc is one server-computed segment, coloured by
 * its server-assigned status. Hover previews a segment; click or Enter selects it.
 */
export function OperationsHealthRing({ segments, status, alertCount, selected, onSelect, money, title = "HMG Stones" }: Props) {
  const theme = useTheme();
  const [hovered, setHovered] = useState<string | null>(null);
  const tone = RING_TONE;
  const step = 360 / Math.max(1, segments.length);
  const focus = segments.find(s => s.key === (hovered ?? selected));
  const keyed = (key: string) => (event: KeyboardEvent<SVGGElement>) => {
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(key); }
  };
  return <Box sx={{ width: "100%", maxWidth: W, mx: "auto" }}>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="group" aria-label={`Operations health: ${STATUS_TEXT[status]}. ${alertCount} open alerts. Choose a segment for details.`} style={{ display: "block", overflow: "visible" }}>
      <circle cx={CX} cy={CY} r={R} fill="none" stroke={theme.palette.action.hover} strokeWidth={STROKE} />
      <circle cx={CX} cy={CY} r={R - 34} fill="none" stroke={theme.palette.divider} strokeWidth={1} strokeDasharray="2 6" aria-hidden="true" />
      {segments.map((segment, index) => {
        const start = -90 + index * step + GAP / 2;
        const end = start + step - GAP;
        const mid = (start + end) / 2;
        const active = segment.key === selected;
        const hot = segment.key === hovered;
        const dimmed = (hovered ?? selected) !== segment.key && hovered !== null;
        const labelPoint = point(LABEL_R, mid);
        const cos = Math.cos(rad(mid));
        const anchor = cos > 0.25 ? "start" : cos < -0.25 ? "end" : "middle";
        const lift = Math.sin(rad(mid)) < -0.5 ? -26 : Math.sin(rad(mid)) > 0.5 ? 6 : -10;
        const value = formatMetric(segment.value, money, true);
        return <Tooltip key={segment.key} arrow placement="top" title={`${segment.label}: ${value} ${segment.caption} · ${STATUS_TEXT[segment.status]}. Click for details.`}>
          <g role="button" tabIndex={0} aria-pressed={active} aria-label={`${segment.label}: ${value} ${segment.caption}. ${STATUS_TEXT[segment.status]}`}
            onMouseEnter={() => setHovered(segment.key)} onMouseLeave={() => setHovered(null)} onFocus={() => setHovered(segment.key)} onBlur={() => setHovered(null)}
            onClick={() => onSelect(segment.key)} onKeyDown={keyed(segment.key)} style={{ cursor: "pointer", outline: "none" }}>
            <path d={arc(R, start, end)} fill="none" stroke="transparent" strokeWidth={STROKE + 40} />
            <path d={arc(R, start, end)} fill="none" stroke={tone[segment.status]} strokeWidth={hot || active ? STROKE + 8 : STROKE}
              strokeLinecap="butt" opacity={dimmed ? 0.4 : 1} style={{ transition: "stroke-width 150ms, opacity 150ms" }} />
            {active && <path d={arc(R + STROKE / 2 + 9, start, end)} fill="none" stroke={theme.palette.primary.main} strokeWidth={3} strokeLinecap="round" />}
            <text x={labelPoint.x} y={labelPoint.y + lift} textAnchor={anchor} style={{ fontFamily: theme.typography.fontFamily, pointerEvents: "none" }} opacity={dimmed ? 0.55 : 1}>
              <tspan x={labelPoint.x} fontSize={11} fontWeight={600} letterSpacing=".06em" fill={active ? theme.palette.primary.main : theme.palette.text.secondary}>{segment.label.toUpperCase()}</tspan>
              <tspan x={labelPoint.x} dy={20} fontSize={18} fontWeight={700} fill={theme.palette.text.primary}>{value}</tspan>
              <tspan x={labelPoint.x} dy={16} fontSize={11} fill={theme.palette.text.secondary}>{segment.caption}</tspan>
            </text>
          </g>
        </Tooltip>;
      })}
      <g aria-hidden="true" style={{ fontFamily: theme.typography.fontFamily, pointerEvents: "none" }}>
        <circle cx={CX} cy={CY} r={R - 46} fill={theme.palette.background.paper} />
        {focus && hovered ? <>
          <text x={CX} y={CY - 30} textAnchor="middle" fontSize={11} fontWeight={600} letterSpacing=".06em" fill={theme.palette.text.secondary}>{focus.label.toUpperCase()}</text>
          <text x={CX} y={CY + 2} textAnchor="middle" fontSize={formatMetric(focus.value, money, true).length > 9 ? 17 : 24} fontWeight={700} fill={theme.palette.text.primary}>{formatMetric(focus.value, money, true)}</text>
          <text x={CX} y={CY + 22} textAnchor="middle" fontSize={11} fill={theme.palette.text.secondary}>{focus.caption}</text>
          <text x={CX} y={CY + 44} textAnchor="middle" fontSize={12} fontWeight={600} fill={tone[focus.status]}>{STATUS_TEXT[focus.status]}</text>
        </> : <>
          <text x={CX} y={CY - 30} textAnchor="middle" fontSize={11} fontWeight={600} letterSpacing=".06em" fill={theme.palette.text.secondary}>OPERATIONS</text>
          <text x={CX} y={CY} textAnchor="middle" fontSize={20} fontWeight={700} fill={theme.palette.text.primary}>{title}</text>
          <text x={CX} y={CY + 22} textAnchor="middle" fontSize={13} fontWeight={600} fill={tone[status]}>{STATUS_TEXT[status]}</text>
          <text x={CX} y={CY + 42} textAnchor="middle" fontSize={11} fill={theme.palette.text.secondary}>{alertCount === 1 ? "1 open alert" : `${alertCount} open alerts`}</text>
        </>}
      </g>
    </svg>
  </Box>;
}
