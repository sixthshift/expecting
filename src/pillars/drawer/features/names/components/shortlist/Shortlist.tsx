import { namesSaves } from "../../../../../../api/rpc/names";
import { useSave } from "../../../../../../app/hooks/useSave";
import type { NamesView } from "../../../../../../lib/names";
import type { Person } from "../../../../../../lib/people";
import { ShortlistName } from "./ShortlistName";

/** The shortlist: the names you both like, or one of you superliked, and how a name gets on it while it's empty. */
export function Shortlist({ view, other }: { view: NamesView; other: Person | null }) {
  const saveTakeOff = useSave(namesSaves.takeOffName);
  return (
    <section
      aria-label="Shortlist"
      className="flex flex-col gap-2 rounded-lg bg-linear-to-br from-(--expecting-accent-soft-from) to-(--expecting-accent-soft-to) p-4"
    >
      <h2 className="text-sm font-semibold text-fg-strong">
        {view.shortlist.length === 0
          ? "The shortlist is empty"
          : `The shortlist: ${view.shortlist.length === 1 ? "one name" : `${view.shortlist.length} names`}`}
      </h2>
      {view.shortlist.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {view.shortlist.map((n) => (
            <ShortlistName key={n.id} name={n} onTakeOff={() => saveTakeOff({ id: n.id })} />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-fg-normal">
          {view.together
            ? "A name goes on when you both like it, or when one of you superlikes it."
            : `Once ${other?.name ?? "your partner"} joins on their own phone, names you both like go on here. A superlike puts one on now.`}
        </p>
      )}
    </section>
  );
}
