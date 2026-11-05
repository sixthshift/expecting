import type { Shown } from "../../hooks/useCollectionCards";
import { CollectionCard } from "./CollectionCard";

/** A group of cards under its heading, or nothing: one under another on a phone, side by side on a desktop. */
export function Group({ title, shown }: { title: string; shown: readonly Shown[] }) {
  if (shown.length === 0) return null;
  return (
    <section aria-label={title} className="flex flex-col gap-3">
      <h2 className="font-display text-lg font-semibold text-fg-strong">{title}</h2>
      <div className="flex flex-col gap-3 desktop:grid desktop:grid-cols-2 desktop:items-start desktop:gap-4 desktop:2xl:grid-cols-3">
        {shown.map((s) => (
          <CollectionCard key={s.key} shown={s} />
        ))}
      </div>
    </section>
  );
}
