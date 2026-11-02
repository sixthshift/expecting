import { getRouteApi } from "@tanstack/react-router";
import { useMemo } from "react";
import { useFirsts } from "../../../api/rpc/firsts";
import { usePeople } from "../../../api/rpc/people";
import { usePosition, useSettings } from "../../../api/rpc/settings";
import { useKeepSame } from "../../../app/hooks/useKeepSame";
import { todayISO } from "../../../lib/dates";
import { suggestFirsts } from "../../../lib/firsts";
import { type NowCard, nowCards } from "../../../lib/journalNow";
import { hasRecap, recapOf } from "../../../lib/recap";
import { type Pattern, patternsKept, type StoryItem } from "../../../lib/story";
import { useTasks } from "../../tasks/hooks/useTasks";
import { useOnThisPhone } from "./useOnThisPhone";
import { useSeenThisVisit } from "./useSeenThisVisit";

const route = getRouteApi("/app/journal");

/** The Journal's highlights: what matters now, and the patterns there's enough for. */
export type HighlightsData = {
  cards: NowCard[];
  patterns: Pattern[];
  /** The firsts a Now card already asks about: around now leaves them out. */
  suggested: readonly string[];
  /** Whether it has anything: an empty column would leave its column blank. */
  shown: boolean;
  onRecapOpened: (key: string) => void;
};

/** What the "+" just kept, by its id (a first by its key), as a line of the story. */
function keptLine(items: readonly StoryItem[], id: string | undefined): StoryItem | null {
  if (!id) return null;
  return items.find((i) => i.key === id || i.key === `first-${id}` || (i.kind === "movements" && i.entries.some((e) => e.id === id))) ?? null;
}

/**
 * The highlights, worked out from the story (`items`). While something has
 * happened (`quiet`), no Now cards and only feelings' pattern. Opening the
 * Journal marks it seen, for whoever's holding the phone, quiet or not.
 */
export function useHighlights(items: StoryItem[], quiet: boolean): HighlightsData {
  const { kept } = route.useSearch();
  const { data: settings } = useSettings();
  const { data: people } = usePeople();
  const { data: firsts } = useFirsts();
  const tasks = useTasks();
  const position = usePosition();
  const lastSeen = useSeenThisVisit();
  const [opened, setOpened] = useOnThisPhone("expecting:recaps-opened");
  const today = todayISO();
  const { dueDate } = settings;

  const cards = nowCards({
    items,
    kept: keptLine(items, kept),
    seen: lastSeen,
    me: people.me,
    people: people.people,
    suggestions: suggestFirsts({ items, marks: firsts, tasks, people: people.people, quiet }),
    today,
    position,
    dueDate,
    quiet,
    recapsOpened: opened,
    recapHas: (span) => (dueDate ? hasRecap(recapOf({ span, dueDate, items })) : false),
  });
  const patterns = patternsKept({ items, today, dueDate, me: people.me?.id ?? null, quiet });
  // Kept the same while nothing in them changed, so the page's context (and the memo week so far) doesn't change with every save.
  const same = useKeepSame({ cards, patterns, suggested: cards.flatMap((c) => (c.kind === "first" ? [c.suggestion.key] : [])) });

  return useMemo(() => ({ ...same, shown: same.cards.length > 0 || same.patterns.length > 0, onRecapOpened: setOpened }), [same, setOpened]);
}
