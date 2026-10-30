import { useItems } from "../../hooks/useItems";
import { ItemList } from "../ItemList";

/** What an item links to, as your Library has them: one hidden by an answer or an extra that's off isn't offered. */
export function Related({ ids }: { ids: readonly string[] }) {
  const items = useItems();
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
