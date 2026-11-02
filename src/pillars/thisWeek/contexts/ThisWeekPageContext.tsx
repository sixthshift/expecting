import { getRouteApi } from "@tanstack/react-router";
import { createContext, type ReactNode, use, useMemo } from "react";
import { useNow, usePosition, useSettingsQuery } from "../../../api/rpc/settings";
import { weekNotes } from "../../../content";
import { noteFor, type WeekNote } from "../../../content/weeks";
import { type ISODate, todayISO } from "../../../lib/dates";
import type { Position, Week } from "../../../lib/timeline";

/**
 * This week's context: the week shown and where you are, worked out once for
 * every part. What only one part needs, that part works out (the day reads,
 * the week's heads-up, what's worth knowing, what's best done, what was kept).
 */
export type ThisWeekPage = {
  /** The week shown: this one, or the one peeked at (`?at=`); null until there's a due date. */
  week: Week | null;
  /** This week; null until there's a due date. */
  now: Week | null;
  /** Looking at a week other than this one. */
  peeking: boolean;
  /** Where you are today; null until there's a due date. */
  position: Position | null;
  dueDate: ISODate | null;
  today: ISODate;
  /** The week's note: now, the one in force (carried on until the next); a peek, only that week's own. */
  note: WeekNote | null;
};

const PageContext = createContext<ThisWeekPage | null>(null);

const route = getRouteApi("/app/");

/**
 * This week's context: the week shown, whether it's a peek, where you are and
 * the week's note, worked out once. It holds no data of its own: the queries
 * stay in the query cache, read through their hooks by the parts that need them.
 */
export function ThisWeekPageProvider({ children }: { children: ReactNode }) {
  const { data: settings } = useSettingsQuery();
  const position = usePosition();
  const now = useNow();
  const today = todayISO();
  const { at } = route.useSearch();
  const { dueDate } = settings;
  // The week shown: this one, or the one peeked at (only once there is a this week).
  const week = now === null ? null : (at ?? now);
  const peeking = week !== now;
  // Now, the note in force carries on until the next; a peek shows only that week's own.
  const inForce = week === null ? null : noteFor(weekNotes, week);
  const note = peeking && inForce?.week !== week ? null : inForce;

  const page = useMemo(() => ({ week, now, peeking, position, dueDate, today, note }), [week, now, peeking, position, dueDate, today, note]);

  return <PageContext value={page}>{children}</PageContext>;
}

/** The week This week shows, inside `ThisWeekPageProvider`. */
export function useThisWeekPage(): ThisWeekPage {
  const page = use(PageContext);
  if (!page) throw new Error("useThisWeekPage must be called inside ThisWeekPageProvider");
  return page;
}
