// The story as it's drawn: its lines under their weeks and days, every week
// of the pregnancy on its spine, a week with nothing kept a faint line.

import type { ISODate } from "../dates";
import { type Place, placeOf } from "../journal";
import type { Week } from "../timeline";

import { byNewest, type StoryItem } from "./items";

/** A day of the story. */
export type StoryDay = { day: ISODate; items: StoryItem[] };

/** A week of the story (or before or after the pregnancy, or with no due date a month), its days newest first. */
export type StoryGroup = { kind: "group"; key: string; place: Place | null; month: string | null; days: StoryDay[] };

/** A week, or a run of weeks, with nothing kept: one faint line ("Week 26", "Weeks 9–13"), never marked as missing. */
export type EmptyWeeks = { kind: "empty"; key: string; from: Week; to: Week };

/** What the story draws, in order: a week (or a month) with what's kept in it, or weeks with nothing. */
export type StoryPart = StoryGroup | EmptyWeeks;

/** The story as it's drawn for a search or a kind: its weeks with something kept, and a run of empty weeks between them as one line. */
export function storyGroups(items: readonly StoryItem[], dueDate: ISODate | null): StoryPart[] {
  const groups: StoryGroup[] = [];
  for (const item of [...items].sort(byNewest)) {
    const place = dueDate ? placeOf(item.day, dueDate) : null;
    const month = dueDate ? null : item.day.slice(0, 7);
    const key = String(place ?? month);
    let group = groups.at(-1);
    if (group?.key !== key) {
      group = { kind: "group", key, place, month, days: [] };
      groups.push(group);
    }
    const day = group.days.at(-1);
    if (day?.day === item.day) day.items.push(item);
    else group.days.push({ day: item.day, items: [item] });
  }
  const out: StoryPart[] = [];
  for (const [i, group] of groups.entries()) {
    const prev = groups[i - 1];
    if (prev && typeof prev.place === "number" && typeof group.place === "number" && prev.place - group.place > 1) {
      out.push({ kind: "empty", key: `empty-${prev.place - 1}`, from: group.place + 1, to: prev.place - 1 });
    }
    out.push(group);
  }
  return out;
}

/**
 * The story as a spine of weeks: every week from the latest (at least
 * `now`) back to the first, each with what's kept in it, or empty: the
 * pregnancy's own weeks, never a blank slot. After week 42 first, before the pregnancy
 * last. Without a due date, the months as kept.
 */
export function storySpine(items: readonly StoryItem[], dueDate: ISODate | null, now: Week | null): StoryPart[] {
  const groups = storyGroups(items, dueDate).filter((g): g is StoryGroup => g.kind === "group");
  if (!dueDate) return groups;
  const byWeek = new Map(groups.flatMap((g) => (typeof g.place === "number" ? [[g.place, g] as const] : [])));
  const last = Math.max(now ?? 0, ...byWeek.keys());
  const out: StoryPart[] = groups.filter((g) => g.place === "after");
  for (let week = last; week >= 1; week--) {
    out.push(byWeek.get(week) ?? { kind: "empty", key: `empty-${week}`, from: week, to: week });
  }
  return [...out, ...groups.filter((g) => g.place === "before")];
}
