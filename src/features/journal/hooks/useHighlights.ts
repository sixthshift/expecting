import { getRouteApi } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAppetite } from "../../../api/rpc/appetite";
import { useChecklist } from "../../../api/rpc/checklist";
import { useFeelings } from "../../../api/rpc/feelings";
import { useFirsts } from "../../../api/rpc/firsts";
import { journalSeenSaves, useJournal, useJournalSeen } from "../../../api/rpc/journal";
import { usePeople } from "../../../api/rpc/people";
import { usePhotos } from "../../../api/rpc/photos";
import { useQuiet } from "../../../api/rpc/quiet";
import { usePosition, useSettings } from "../../../api/rpc/settings";
import { useSave } from "../../../app/hooks/useSave";
import { todayISO } from "../../../lib/dates";
import { suggestFirsts } from "../../../lib/firsts";
import { type NowCard, nowCards } from "../../../lib/journalNow";
import { hasRecap, recapOf } from "../../../lib/recap";
import { type Pattern, patternsKept, type StoryItem } from "../../../lib/story";
import { useOnThisPhone } from "./useOnThisPhone";
import { useStory } from "./useStory";

const route = getRouteApi("/app/journal");

/** The Journal's highlights: what matters now, and the patterns there's enough for. */
export type HighlightsData = {
  cards: NowCard[];
  patterns: Pattern[];
  /** The firsts a Now card already asks about: around now leaves them out. */
  suggested: ReadonlySet<string>;
  /** Whether it has anything: an empty column would leave its column blank. */
  shown: boolean;
  onRecapOpened: (key: string) => void;
};

/** What the "+" just kept, by its id (a first by its key), as a line of the story. */
function keptLine(items: readonly StoryItem[], id: string | undefined): StoryItem | null {
  if (!id) return null;
  return items.find((i) => i.key === id || i.key === `first-${id}` || (i.kind === "movements" && i.entries.some((e) => e.id === id))) ?? null;
}

/** The highlights, worked out from everything kept. Opening the Journal marks it seen, for whoever's holding the phone. */
export function useHighlights(): HighlightsData {
  const items = useStory();
  const { kept } = route.useSearch();
  const { data: quiet } = useQuiet();
  const { data: settings } = useSettings();
  const { data: people } = usePeople();
  const { data: journal } = useJournal();
  const { data: appetite } = useAppetite();
  const { data: feelings } = useFeelings();
  const { data: photos } = usePhotos();
  const { data: firsts } = useFirsts();
  const { data: checklist } = useChecklist();
  const { data: seen } = useJournalSeen();
  const position = usePosition();
  const markSeen = useSave(journalSeenSaves.markJournalSeen);
  // When you last looked, as it was when you came in: this visit marks it, and the card stays for this visit.
  const [lastSeen] = useState(seen);
  const [opened, setOpened] = useOnThisPhone("expecting:recaps-opened");
  const today = todayISO();
  const isQuiet = Boolean(quiet);
  const { dueDate } = settings;

  // Once a visit, for whoever's holding the phone: `markSeen` is a new function each render.
  const me = people.me?.id;
  // biome-ignore lint/correctness/useExhaustiveDependencies: marked once as the page opens (and as who's holding it changes), not on every render.
  useEffect(() => {
    if (me) markSeen(undefined);
  }, [me]);

  const cards = nowCards({
    items,
    kept: keptLine(items, kept),
    seen: lastSeen,
    me: people.me,
    people: people.people,
    suggestions: suggestFirsts({ marks: firsts, journal, photos, appetite, ticks: checklist.ticks, people: people.people, quiet: isQuiet }),
    today,
    position,
    dueDate,
    quiet: isQuiet,
    recapsOpened: opened,
    recapHas: (span) => (dueDate ? hasRecap(recapOf({ span, dueDate, firsts, photos, appetite, journal, items })) : false),
  });
  const patterns = patternsKept({ journal, appetite, feelings, photos, today, dueDate, me: people.me?.id ?? null, quiet: isQuiet });
  const suggested = new Set(cards.flatMap((c) => (c.kind === "first" ? [c.suggestion.key] : [])));

  return { cards, patterns, suggested, shown: cards.length > 0 || patterns.length > 0, onRecapOpened: setOpened };
}
