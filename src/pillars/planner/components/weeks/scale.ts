// Where a week falls across the chart, and a bar's colour by where it stands:
// shared by the chart, its rows and its key.

import type { BarState } from "../../../../lib/planner/weeks";
import { WEEKS, type Week } from "../../../../lib/timeline";

export const SPAN = WEEKS.last - WEEKS.first + 1;
export const WEEK_LIST = Array.from({ length: SPAN }, (_, i) => i + WEEKS.first);
/** Where a week starts across the chart, as a percentage. */
export const x = (week: number) => `${((week - WEEKS.first) / SPAN) * 100}%`;
/** The middle of a week. */
export const mid = (week: number) => `calc(${x(week)} + ${100 / SPAN / 2}%)`;
export const width = (from: Week, to: Week) => `${((to - from + 1) / SPAN) * 100}%`;

/** A bar's colour by where it stands: open now is the brand, ahead a lighter one, late a warning, done quiet. */
export const TONE: Record<BarState, string> = {
  open: "bg-fg-brand",
  ahead: "bg-bg-brand-subtle border border-border-brand",
  late: "bg-bg-warning-subtle border border-border-warning",
  done: "bg-border-normal",
};
