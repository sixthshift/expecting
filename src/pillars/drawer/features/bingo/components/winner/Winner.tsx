import { PartyPopper } from "lucide-react";
import { type Card, type Standing, standing } from "../../../../../../lib/bingo";
import type { ISODate } from "../../../../../../lib/dates";
import { dayMonth } from "../../../../../../lib/labels";

/** A bingo said: yours, theirs, and who got there first (a day apiece; the same day is a tie). */
export function Winner({ mine, theirs, other }: { mine: Card | null; theirs: Card | null; other: string }) {
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
