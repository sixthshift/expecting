import type { Shown } from "../../hooks/useCollectionCards";
import { CollectionCard } from "./CollectionCard";

/** A group of cards under its heading, or nothing. */
export function Group({ title, shown }: { title: string; shown: readonly Shown[] }) {
  if (shown.length === 0) return null;
  return (
    <section aria-label={title} className="flex flex-col gap-3">
      <h2 className="font-display text-lg font-semibold text-fg-strong">{title}</h2>
      {shown.map((s) => (
        <CollectionCard key={s.key} shown={s} />
      ))}
    </section>
  );
}
