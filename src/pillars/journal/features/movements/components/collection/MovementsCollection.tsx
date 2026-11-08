import { useJournalQuery } from "../../../../../../api/rpc/journal";
import { newestFirst } from "../../../../../../lib/journal/journal";
import { useShowAll } from "../../../../hooks/useShowAll";
import { Movement } from "../Movement";
import { MovementPattern } from "./MovementPattern";

/** How many movements are listed before "Show all". */
const LISTED = 8;

/**
 * The movements collection in full: the pattern, then each, newest first. New
 * ones come in through the "+"; the collection is
 * there only once one is kept, and never while something has happened (the
 * Journal folds them away then).
 */
export function MovementsCollection() {
  const { data: journal } = useJournalQuery();
  const { shown, more } = useShowAll(newestFirst(journal.filter((e) => e.kind === "movement")), LISTED);

  return (
    <section aria-labelledby="movements" className="flex flex-col gap-4">
      <h2 id="movements" className="text-lg font-display font-semibold text-fg-strong">
        Movements
      </h2>
      <p className="text-sm text-fg-subtle">
        Get to know your baby's own pattern. There's no number to reach: what matters is a change. Either of you can keep one.
      </p>
      <MovementPattern />
      {shown.map((entry) => (
        <Movement key={entry.id} entry={entry} />
      ))}
      {more}
    </section>
  );
}
