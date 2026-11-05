import { dayReads } from "../../../content";
import { type DayRead, readsOut } from "../../../content/days";
import type { WeekNote as Note } from "../../../content/weeks";
import { gestationLabel } from "../../../lib/timeline";
import { useItems } from "../../library/hooks/useItems";
import { useHomePage } from "../contexts/HomePageContext";

/** A day of the week: the note on its first (+0), a read on each after. */
export type Day = { day: number; note: Note; read?: never } | { day: number; read: DayRead; note?: never };

/**
 * The week, day by day, as a phone's carousel (`DayByDay`) and a desktop's
 * tabs (`DayTabs`) both draw it: the week's note is its first day (+0), and a
 * read follows each day after, out a day at a time (`readsOut`). `opening` is
 * the one to open on: today's, the newest, in this week; the note in a week
 * peeked at. `when` names a day ("30+1 · Yesterday"); `short` is just its
 * gestation, or the note's week. `titles` are the Library's entries as
 * tailored for you, so a read's link to one you'd not see is left off.
 */
export function useWeekDays() {
  const { week, note, peeking, position } = useHomePage();
  const items = useItems();
  // The week's reads out so far, oldest first: up to today in this one, all of a week gone, none of one to come.
  const reads = week === null || !position ? [] : readsOut(dayReads, week, position.gestationDays);
  // Today's day of the week, 0–6, or null when it isn't this week.
  const today = peeking || !position ? null : position.gestationDays - position.week * 7;
  const days: Day[] = [...(note ? [{ day: 0, note }] : []), ...reads.map((read) => ({ day: read.day, read }))];
  // The note says the baby's size: off where the heading already does.
  const showSize = note?.week !== week;
  const titles = new Map(items.map((i) => [i.id, i.title]));

  const short = (day: number) =>
    // A note carried on from an earlier week (none of this week's own) is named for its week.
    week === null ? "" : day === 0 && note && note.week !== week ? `Week ${note.week}` : gestationLabel(week * 7 + day);
  const when = (day: number) => {
    const label = short(day);
    if (today === null) return label;
    if (day === today) return `${label} · Today`;
    if (day === today - 1) return `${label} · Yesterday`;
    return label;
  };

  return { week, days, today, opening: today === null ? 0 : days.length - 1, showSize, titles, short, when };
}
