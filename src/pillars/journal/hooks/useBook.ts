import { usePeopleQuery } from "../../../api/rpc/people";
import { useNow, useSettingsQuery } from "../../../api/rpc/settings";
import { formatDate } from "../../../lib/dates";
import { type ChapterLine, contents, young } from "../../../lib/journal/chapters";
import type { StoryItem } from "../../../lib/journal/story/items";

/**
 * The book, already begun: its chapters and how each stands, and whether
 * it's shown as a cover (while the Journal is young, or there's no due date
 * to write its weeks in) or as one line at the top.
 */
export function useBook(items: readonly StoryItem[]): { chapters: ChapterLine[]; cover: boolean } {
  const { data: dueDate } = useSettingsQuery({ select: (s) => s.dueDate });
  const now = useNow();
  return { chapters: contents({ items, dueDate, now }), cover: !dueDate || young(items) };
}

/** What the book's cover says under its title: "Sam & Jason" (whoever's carrying first), and "Due July 2027". */
export function useCover(): { names: string | null; due: string | null } {
  const { data: people } = usePeopleQuery();
  const { data: dueDate } = useSettingsQuery({ select: (s) => s.dueDate });
  const names = [...people.people].sort((a, b) => Number(b.role === "carrying") - Number(a.role === "carrying")).map((p) => p.name);
  return {
    names: names.length > 0 ? names.join(" & ") : null,
    due: dueDate ? `Due ${formatDate(dueDate, { month: "long", year: "numeric" })}` : null,
  };
}
