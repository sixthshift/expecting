import { useNow, useSettingsQuery } from "../../../api/rpc/settings";
import { type ChapterLine, contents, young } from "../../../lib/chapters";
import type { StoryItem } from "../../../lib/story/items";

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
