import { Button } from "@sixthshift/design-system/button";
import { ToggleGroup } from "@sixthshift/design-system/toggle-group";
import { getRouteApi } from "@tanstack/react-router";
import { PartyPopper, Shuffle } from "lucide-react";
import { bingoSaves, useBingoQuery } from "../../../api/rpc/bingo";
import { usePeopleQuery } from "../../../api/rpc/people";
import { useSave } from "../../../app/hooks/useSave";
import { type Card, deal, type Standing, standing, standingLine } from "../../../lib/bingo";
import type { ISODate } from "../../../lib/dates";
import { dayMonth } from "../../../lib/labels";
import { OTHER_ONE, otherOf } from "../../../lib/people";
import { DrawerFrame } from "../../drawer/components/frame/DrawerFrame";
import { BingoGrid } from "../components/card/BingoGrid";

const route = getRouteApi("/app/drawer/bingo");

/**
 * Pregnancy bingo: your card, or the other's (`?card=theirs`), each with
 * where it's up to; a bingo said, and who got there first. Your card is dealt
 * here, and dealt again until something's marked. With its extra off, it
 * says so; while something has happened, it's put away.
 */
export function BingoPage() {
  const { data: bingo } = useBingoQuery();
  const { me, people } = usePeopleQuery().data;
  const dealCard = useSave(bingoSaves.dealCard);
  const navigate = route.useNavigate();
  const showing = route.useSearch().card ?? "mine";
  const them = otherOf(people, me);
  const mine = bingo.cards.find((c) => c.personId === me?.id) ?? null;
  const theirs = them ? (bingo.cards.find((c) => c.personId === them.id) ?? null) : null;
  const other = them?.name ?? OTHER_ONE;
  const card = showing === "theirs" ? theirs : mine;

  return (
    <DrawerFrame title="Pregnancy bingo" width="2xl" putAway={{ subject: "Bingo" }} extras={["pregnancy-bingo"]}>
      {!me ? (
        <p className="text-sm text-fg-normal">Say who's holding this phone, and you'll be dealt a card.</p>
      ) : (
        <div className="flex flex-col gap-5">
          <p className="text-fg-subtle">Mark a square when it happens. Five in a row, a column or a diagonal is bingo; the centre's free.</p>
          <Winner mine={mine} theirs={theirs} other={other} />
          {them ? (
            <ToggleGroup
              type="single"
              appearance="separate"
              variant="outline"
              intent="brand"
              aria-label="Whose card"
              value={showing}
              onValueChange={(v) => (v ? navigate({ search: { card: v === "theirs" ? "theirs" : undefined }, replace: true, resetScroll: false }) : null)}
              options={[
                { value: "mine", label: mine ? `You · ${standingLine(standing(mine))}` : "You" },
                { value: "theirs", label: theirs ? `${other} · ${standingLine(standing(theirs))}` : other },
              ]}
            />
          ) : null}
          {card ? (
            <>
              <BingoGrid
                card={card}
                owner={other}
                own={showing !== "theirs"}
                other={showing === "theirs" ? { name: "you", card: mine } : { name: other, card: theirs }}
              />
              {showing !== "theirs" && card.marks.length === 0 ? (
                <Button variant="ghost" size="sm" className="w-fit" onClick={() => dealCard({ squares: deal() })}>
                  <Shuffle aria-hidden size={16} /> Deal again
                </Button>
              ) : null}
            </>
          ) : showing === "theirs" ? (
            <p className="text-sm text-fg-subtle">{other} hasn't been dealt a card yet. They deal theirs when they open bingo on their phone.</p>
          ) : (
            <Button intent="brand" className="w-fit" onClick={() => dealCard({ squares: deal() })}>
              <Shuffle aria-hidden size={16} /> Deal my card
            </Button>
          )}
        </div>
      )}
    </DrawerFrame>
  );
}

/** A bingo said: yours, theirs, and who got there first (a day apiece; the same day is a tie). */
function Winner({ mine, theirs, other }: { mine: Card | null; theirs: Card | null; other: string }) {
  const me: Standing | null = mine ? standing(mine) : null;
  const them: Standing | null = theirs ? standing(theirs) : null;
  const myDay = me?.bingoOn ?? null;
  const theirDay = them?.bingoOn ?? null;
  if (!myDay && !theirDay) {
    if (me?.closest === 1) return <p className="text-sm font-medium text-fg-brand">One away from bingo!</p>;
    return null;
  }
  const first = myDay && (!theirDay || myDay < theirDay) ? "you" : theirDay && (!myDay || theirDay < myDay) ? "them" : "tie";
  return (
    <section
      aria-label="Bingo"
      className="flex items-start gap-3 rounded-xl bg-linear-to-br from-(--expecting-accent-soft-from) to-(--expecting-accent-soft-to) p-4"
    >
      <PartyPopper aria-hidden size={24} className="mt-0.5 shrink-0 animate-bounce text-fg-brand motion-reduce:animate-none" />
      <div className="flex flex-col gap-0.5">
        <p className="font-display text-xl font-semibold text-fg-strong">
          {first === "you" ? "Bingo! You got there first." : first === "them" ? `Bingo! ${other} got there first.` : "Bingo, both of you, the same day!"}
        </p>
        <p className="text-sm text-fg-normal">
          {[myDay ? `You: ${dayMonth(myDay as ISODate)}` : null, theirDay ? `${other}: ${dayMonth(theirDay as ISODate)}` : null].filter(Boolean).join(" · ")}
          {me?.full ? " · You've a full house!" : them?.full ? ` · ${other} has a full house!` : " · Keep going for a full house."}
        </p>
      </div>
    </section>
  );
}
