import { useState } from "react";
import { usePeopleQuery } from "../../../api/rpc/people";
import type { StoryItem } from "../../../lib/story/items";
import { storyMatches } from "../../../lib/story/search";

/**
 * Looking through the story: the words (held on the page, not in the
 * address: what you look for is yours), the lines that have them, by what
 * they say or whose they are, and whether a search is on. `onSearch` runs as
 * the first word is typed (the story then shows the days).
 */
export function useStorySearch(items: readonly StoryItem[], onSearch: () => void) {
  const [words, setWords] = useState("");
  const { data: people } = usePeopleQuery();
  const name = (id: string | null) => (id === null ? null : (people.people.find((p) => p.id === id)?.name ?? null));
  const searching = words.trim().length > 0;
  return {
    words,
    searching,
    found: searching ? items.filter((i) => storyMatches(i, words, name)) : [],
    look: (next: string) => {
      setWords(next);
      if (next.trim()) onSearch();
    },
  };
}
