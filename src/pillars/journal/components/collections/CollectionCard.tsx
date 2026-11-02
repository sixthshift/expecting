import { Card } from "@sixthshift/design-system/card";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { MovementPattern } from "../../features/movements/components/collection/MovementPattern";
import type { Shown } from "../../hooks/useCollectionCards";

/** One card: its name, its answer large, the lines behind it, and the way to all of it. */
export function CollectionCard({ shown }: { shown: Shown }) {
  const { key, title, collection, more, summary } = shown;
  return (
    <Card>
      <section aria-labelledby={`collection-${key}`} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h3 id={`collection-${key}`} className="text-sm font-semibold text-fg-subtle">
            {title}
          </h3>
          <p className="font-display text-2xl font-semibold text-fg-strong">{summary.headline}</p>
        </div>
        {summary.lines.length > 0 ? (
          <ul className="flex flex-col gap-1 text-sm text-fg-normal">
            {summary.lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : null}
        {key === "movements" && summary.lately ? <MovementPattern /> : null}
        <Link
          to="/journal/collections/$name"
          params={{ name: collection }}
          className="flex min-h-10 items-center gap-1 self-start text-sm font-medium text-fg-brand hover:underline"
        >
          {more}
          <ChevronRight aria-hidden size={16} />
        </Link>
      </section>
    </Card>
  );
}
