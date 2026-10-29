import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { todayISO } from "../../lib/dates";
import { householdQuery } from "../household/load";
import { workOut } from "../household/workOut";
import { ItemList } from "./ItemList";

/** What an item links to, as the household's Library has them: one hidden by an answer or an extra that's off isn't offered. */
export function Related({ ids }: { ids: readonly string[] }) {
  const { data: state } = useSuspenseQuery(householdQuery);
  const today = todayISO();
  const { items } = useMemo(() => workOut(state, today), [state, today]);
  const related = ids.flatMap((id) => items.filter((i) => i.id === id));
  if (related.length === 0) return null;
  return (
    <section aria-labelledby="related" className="flex flex-col gap-2">
      <h2 id="related" className="text-lg font-display font-semibold text-fg-strong">
        Related
      </h2>
      <ItemList items={related} />
    </section>
  );
}
