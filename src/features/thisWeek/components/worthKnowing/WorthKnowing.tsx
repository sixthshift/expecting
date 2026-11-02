import { useState } from "react";
import { worthKnowing } from "../../../../lib/library";
import { ItemList } from "../../../library/components/itemList/ItemList";
import { useItems } from "../../../library/hooks/useItems";
import { useThisWeekPage } from "../../contexts/ThisWeekPageContext";

/** How many are shown before "Show all": the highest stakes, enough to read without the list taking the page. */
const FIRST = 5;

/** What's worth knowing as a week starts (`worthKnowing` in src/lib/library.ts): the first few, then the rest on asking. */
export function WorthKnowing() {
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
        {peeking ? "Worth knowing that week" : "Worth knowing this week"}
      </h2>
      <ItemList items={shown} />
      {items.length > shown.length ? (
        <button type="button" onClick={() => setAll(true)} className="flex min-h-11 w-fit items-center text-sm font-medium text-fg-brand hover:underline">
          Show all {items.length}
        </button>
      ) : null}
    </section>
  );
}
