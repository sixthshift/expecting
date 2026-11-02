import { Button } from "@sixthshift/design-system/button";
import { ToggleGroup } from "@sixthshift/design-system/toggle-group";
import { Undo2 } from "lucide-react";
import { useMemo, useState } from "react";
import { namesSaves } from "../../../../../../api/rpc/names";
import { useSave } from "../../../../../../app/hooks/useSave";
import { todayISO } from "../../../../../../lib/dates";
import { DECK_CREDIT, DECK_PLACES, type DeckCard, upNext } from "../../../../../../lib/nameDeck";
import { type DeckFilter, type NamesView, superlikeLeft } from "../../../../../../lib/names";
import { newId } from "../../../../../../lib/outbox";
import type { Person } from "../../../../../../lib/people";
import { Shortlist } from "../shortlist/Shortlist";
import { AddName } from "./AddName";
import { SwipeDeck, type Vote } from "./SwipeDeck";

/**
 * The names game: a deck of names, one at a time, to like or pass on your own phone, and any either of
 * you adds. A name goes on the shortlist only when you both like it, so nobody has to admit to the name
 * the other would hate; or when one of you superlikes it, once a day, to say "this one". You never see
 * a list of your own votes, or the other's: just keep swiping. `seed` shuffles the deck for this person.
 */
export function NamesGame({
  view,
  other,
  seed,
  filter,
  onFilter,
}: {
  view: NamesView;
  other: Person | null;
  seed: string;
  filter: DeckFilter;
  /** Choosing girls', boys' or all; none when you know which it is. */
  onFilter: ((filter: DeckFilter) => void) | undefined;
}) {
  const saveVote = useSave(namesSaves.voteName);
  const saveSwipe = useSave(namesSaves.swipeName);
  const saveSuper = useSave(namesSaves.superlikeName);
  const saveUnvote = useSave(namesSaves.unvoteName);
  // The last name voted on, to undo; and one undone, dealt again first.
  const [last, setLast] = useState<string | null>(null);
  const [again, setAgain] = useState<string | null>(null);

  const cards = useMemo(() => {
    const deck = upNext(view, seed, filter);
    const i = again ? deck.findIndex((c) => c.name.toLowerCase() === again.toLowerCase()) : -1;
    return i > 0 ? [deck[i]!, ...deck.slice(0, i), ...deck.slice(i + 1)] : deck;
  }, [view, seed, filter, again]);
  const next = cards[0];
  const superLeft = superlikeLeft(view, todayISO());

  function vote(card: DeckCard, how: Vote) {
    if (how === "super") saveSuper({ id: card.id ?? newId(), name: card.name, day: todayISO() });
    else if (card.id) saveVote({ id: card.id, liked: how === "like" });
    else saveSwipe({ id: newId(), name: card.name, liked: how === "like" });
    setLast(card.name);
    setAgain(null);
  }
  function undo() {
    if (!last) return;
    saveUnvote({ name: last });
    setAgain(last);
    setLast(null);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-4">
        {onFilter ? (
          <ToggleGroup
            type="single"
            appearance="segmented"
            variant="outline"
            size="sm"
            aria-label="Names to show"
            value={filter}
            onValueChange={(value) => onFilter(value === "girls" || value === "boys" ? value : "all")}
            options={[
              { value: "all", label: "All" },
              { value: "girls", label: "Girls" },
              { value: "boys", label: "Boys" },
            ]}
          />
        ) : null}
        {next ? (
          <SwipeDeck key={next.name} card={next} under={cards[1]} showSex={filter === "all"} superLeft={superLeft} onVote={(how) => vote(next, how)} />
        ) : (
          <p className="py-16 text-sm text-fg-subtle">You've voted on every name. Add some more.</p>
        )}
        {/* Kept in its place when there's nothing to undo, so the page doesn't jump. */}
        <Button variant="ghost" size="sm" onClick={undo} aria-label={last ? `Undo ${last}` : "Undo"} className={last ? "" : "invisible"}>
          <Undo2 aria-hidden size={16} /> Undo
        </Button>
      </div>

      <Shortlist view={view} other={other} />

      <AddName />

      <p className="text-xs text-fg-subtle">
        Names from the registers of births of {DECK_PLACES.map((p) => p.place).join(", ")}: {DECK_CREDIT}.
      </p>
    </div>
  );
}
