import { useState } from "react";
import { worthKnowing } from "../../../../lib/library/thisWeek";
import { ItemList } from "../../../library/components/itemList/ItemList";
import { useItems } from "../../../library/hooks/useItems";
import { useThisWeekPage } from "../../contexts/ThisWeekPageContext";
import { whichWeek } from "../../model/labels";

/** How many are shown before "Show all": the highest stakes, enough to read without the list taking the page. */
const FIRST = 5;

/** What's worth knowing as a week starts (`worthKnowing` in src/lib/library/thisWeek.ts): the first few, then the rest on asking. `brief`, by their titles (`ItemList`). */
export function WorthKnowing({ brief = false }: { brief?: boolean }) {
  const { week, peeking } = useThisWeekPage();
  const [all, setAll] = useState(false);
  // What starts this week and belongs to it; what's any time is in the Library.
  const tailored = useItems();
  const items = week === null ? [] : worthKnowing(tailored, week);
  if (items.length === 0) return null;
  const shown = all ? items : items.slice(0, FIRST);

  return (
    <section aria-labelledby="worth-knowing" className="flex flex-col gap-2">
      <h2 id="worth-knowing" className="text-lg font-display font-semibold text-fg-strong">
        {`Worth knowing ${whichWeek(peeking)}`}
      </h2>
      <ItemList items={shown} brief={brief} />
      {items.length > shown.length ? (
        <button type="button" onClick={() => setAll(true)} className="flex min-h-11 w-fit items-center text-sm font-medium text-fg-brand hover:underline">
          Show all {items.length}
        </button>
      ) : null}
    </section>
  );
}
