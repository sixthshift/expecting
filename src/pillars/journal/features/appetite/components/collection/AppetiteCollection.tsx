import { useAppetiteQuery } from "../../../../../../api/rpc/appetite";
import { newestFirst } from "../../../../../../lib/journal/journal";
import { useShowAll } from "../../../../hooks/useShowAll";
import { AppetiteItem } from "../AppetiteItem";
import { Cravings } from "./cravings/Cravings";
import { SicknessWeeks } from "./sickness/SicknessWeeks";

/** How many entries are listed before "Show all". */
const LISTED = 8;

/**
 * The sickness and cravings collection in full: sickness since when as weeks of
 * days, what's been craved and gone off, then each entry. New ones come in
 * through the "+"; the collection is there only once one is kept, and never while
 * something has happened (the Journal folds them away then).
 */
export function AppetiteCollection() {
  const { data: entries } = useAppetiteQuery();
  const { shown, more } = useShowAll(newestFirst(entries), LISTED);

  return (
    <section aria-labelledby="appetite" className="flex flex-col gap-4">
      <h2 id="appetite" className="text-lg font-display font-semibold text-fg-strong">
        Sickness and cravings
      </h2>
      <p className="text-sm text-fg-subtle">When it comes and what you crave, so you can answer “since when?”, and laugh about it later.</p>
      <SicknessWeeks />
      <Cravings />
      {shown.map((entry) => (
        <AppetiteItem key={entry.id} entry={entry} />
      ))}
      {more}
    </section>
  );
}
