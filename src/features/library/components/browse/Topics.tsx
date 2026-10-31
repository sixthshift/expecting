import { Link } from "@tanstack/react-router";
import type { Item } from "../../../../content/schema";
import { topicsIn } from "../../../../lib/library";

/** Every topic, in its usual order, with how many entries it has: each opens on its own. */
export function Topics({ items }: { items: readonly Item[] }) {
  return (
    <section aria-labelledby="by-topic" className="flex flex-col gap-3">
      <h2 id="by-topic" className="text-lg font-display font-semibold text-fg-strong">
        Browse by topic
      </h2>
      {/* The lines between cells are each cell's own 1px ring, so a short last row ends in the page, not in a grey cell. */}
      <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border-subtle bg-bg-normal sm:grid-cols-3 lg:grid-cols-4">
        {topicsIn(items).map(({ topic, title, count }) => (
          <li key={topic} className="bg-bg-normal shadow-[0_0_0_1px_var(--border-subtle)]">
            <Link to="/library" search={{ topic }} className="flex min-h-12 items-center justify-between gap-2 px-4 py-3 hover:bg-bg-normal-hovered">
              <span className="text-fg-strong">{title}</span>
              <span className="text-xs text-fg-subtle">{count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
