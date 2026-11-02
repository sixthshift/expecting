import { Button } from "@sixthshift/design-system/button";
import { useState } from "react";
import { useJournalQuery } from "../../../../../api/rpc/journal";
import { newestFirst } from "../../../../../lib/journal";
import { Movement } from "../../entries/movements/Movement";
import { MovementPattern } from "./MovementPattern";

/** How many movements are listed before "Show all". */
const LISTED = 8;

/**
 * The Journal's Movements record at full size: the pattern, then each, newest first. New
 * ones come in through the "+"; the record is
 * there only once one is kept, and never while something has happened (the
 * Journal folds them away then).
 */
export function MovementsCollection() {
  const { data: journal } = useJournalQuery();
  const [all, setAll] = useState(false);
  const movements = newestFirst(journal.filter((e) => e.kind === "movement"));
  const listed = all ? movements : movements.slice(0, LISTED);

  return (
    <section aria-labelledby="movements" className="flex flex-col gap-4">
      <h2 id="movements" className="text-lg font-display font-semibold text-fg-strong">
        Movements
      </h2>
      <p className="text-sm text-fg-subtle">
        Get to know your baby's own pattern. There's no number to reach: what matters is a change. Either of you can keep one.
      </p>
      <MovementPattern />
      {listed.map((entry) => (
        <Movement key={entry.id} entry={entry} />
      ))}
      {movements.length > listed.length ? (
        <Button variant="ghost" size="sm" className="self-start" onClick={() => setAll(true)}>
          Show all {movements.length}
        </Button>
      ) : null}
    </section>
  );
}
