// A bingo or a full house.

import { PartyPopper } from "lucide-react";
import type { StoryItem } from "../../../../lib/story/items";

import { usePersonName } from "./parts";

/** A bingo or a full house on someone's card, on the day it came. */
export function BingoLine({ item }: { item: Extract<StoryItem, { kind: "bingo" }> }) {
  const who = usePersonName()(item.moment.personId);
  return (
    <p className="flex items-center gap-2 py-1 font-medium text-fg-strong">
      <PartyPopper aria-hidden size={16} className="shrink-0 text-fg-brand" />
      {item.moment.kind === "full" ? `${who === "You" ? "Your" : `${who}'s`} full house at pregnancy bingo` : `${who} got bingo!`}
    </p>
  );
}
