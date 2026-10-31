import { Button } from "@sixthshift/design-system/button";
import { Input } from "@sixthshift/design-system/input";
import { ToggleGroup } from "@sixthshift/design-system/toggle-group";
import { Plus, Trash2, Undo2 } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { namesSaves } from "../../../../api/rpc/names";
import { useSave } from "../../../../app/hooks/useSave";
import { DECK_CREDIT, DECK_PLACES, type DeckCard, upNext } from "../../../../lib/nameDeck";
import type { DeckFilter, NamesView } from "../../../../lib/names";
import { newId } from "../../../../lib/outbox";
import type { Person } from "../../../../lib/people";
import { SwipeDeck } from "./SwipeDeck";

/**
 * The names game: a deck of names, one at a time, to like or pass on your own phone, and any either of
 * you adds. A name is a match only when you both like it, so nobody has to admit to the name the other
 * would hate. Only your own votes are ever shown to you. `seed` shuffles the deck for this person.
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
  const saveUnvote = useSave(namesSaves.unvoteName);
  const saveRemove = useSave(namesSaves.removeName);
  // The last name voted on, to undo; and one undone, dealt again first.
  const [last, setLast] = useState<string | null>(null);
  const [again, setAgain] = useState<string | null>(null);

  const cards = useMemo(() => {
    const deck = upNext(view, seed, filter);
    const i = again ? deck.findIndex((c) => c.name.toLowerCase() === again.toLowerCase()) : -1;
    return i > 0 ? [deck[i]!, ...deck.slice(0, i), ...deck.slice(i + 1)] : deck;
  }, [view, seed, filter, again]);
  const next = cards[0];
  const liked = view.names.filter((n) => n.mine === true);
  const passed = view.names.filter((n) => n.mine === false);

  function vote(card: DeckCard, yes: boolean) {
    if (card.id) saveVote({ id: card.id, liked: yes });
    else saveSwipe({ id: newId(), name: card.name, liked: yes });
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
          <SwipeDeck key={next.name} card={next} under={cards[1]} showSex={filter === "all"} onVote={(yes) => vote(next, yes)} />
        ) : (
          <p className="py-16 text-sm text-fg-subtle">You've voted on every name. Add some more.</p>
        )}
        {/* Kept in its place when there's nothing to undo, so the page doesn't jump. */}
        <Button variant="ghost" size="sm" onClick={undo} aria-label={last ? `Undo ${last}` : "Undo"} className={last ? "" : "invisible"}>
          <Undo2 aria-hidden size={16} /> Undo
        </Button>
      </div>

      <section
        aria-label="Matches"
        className="flex flex-col gap-2 rounded-lg bg-linear-to-br from-(--expecting-accent-soft-from) to-(--expecting-accent-soft-to) p-4"
      >
        <h2 className="text-sm font-semibold text-fg-strong">
          {view.matches.length === 0 ? "No matches yet" : `You both like ${view.matches.length === 1 ? "one name" : `${view.matches.length} names`}`}
        </h2>
        {view.matches.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {view.matches.map((m) => (
              <li key={m.id} className="rounded-full bg-bg-normal px-3 py-1 font-display text-lg text-fg-strong">
                {m.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-fg-normal">
            {view.together
              ? "When a name you like is one the other likes too, it shows up here."
              : `Once ${other?.name ?? "your partner"} joins on their own phone, names you both like show up here.`}
          </p>
        )}
      </section>

      <AddName />

      {liked.length + passed.length > 0 ? (
        <details className="group">
          <summary className="min-h-11 cursor-pointer text-sm text-fg-subtle underline">
            Your votes ({liked.length} liked, {passed.length} passed)
          </summary>
          <ul className="mt-2 divide-y divide-border-subtle">
            {[...liked, ...passed].map((n) => (
              <li key={n.id} className="flex items-center gap-2 py-2">
                <span className="flex-1 text-fg-strong">{n.name}</span>
                <span className="text-xs text-fg-subtle">{n.mine ? "Liked" : "Passed"}</span>
                <Button variant="ghost" size="sm" onClick={() => saveVote({ id: n.id, liked: !n.mine })}>
                  {n.mine ? "Pass instead" : "Like instead"}
                </Button>
                {n.deck ? null : (
                  <Button variant="ghost" size="sm" iconOnly aria-label={`Remove ${n.name} from the game`} onClick={() => saveRemove({ id: n.id })}>
                    <Trash2 aria-hidden size={16} />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      <p className="text-xs text-fg-subtle">
        Names from the registers of births of {DECK_PLACES.map((p) => p.place).join(", ")}: {DECK_CREDIT}.
      </p>
    </div>
  );
}

function AddName() {
  const [name, setName] = useState("");
  const add = useSave(namesSaves.addName);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (name.trim().length === 0) return;
    add({ id: newId(), name });
    setName("");
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Add a name you like"
        aria-label="A name to add"
        maxLength={60}
        className="flex-1"
      />
      <Button type="submit" variant="outline" iconOnly aria-label="Add name" disabled={name.trim().length === 0}>
        <Plus aria-hidden size={16} />
      </Button>
    </form>
  );
}
