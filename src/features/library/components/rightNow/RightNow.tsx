import { Badge } from "@sixthshift/design-system/badge";
import { Link } from "@tanstack/react-router";
import type { Item } from "../../../../content/schema";
import { rightNow, type Standing, standingLabel } from "../../../../lib/library";
import type { Week } from "../../../../lib/timeline";

const intent: Record<Standing["kind"], "warning" | "brand" | "neutral"> = { closing: "warning", left: "brand", open: "neutral" };

/**
 * Right now, at week N: what's open this week, soonest-closing first
 * (src/lib/library.ts), each with why it matters and where its window stands.
 */
export function RightNow({ items, now }: { items: readonly Item[]; now: Week }) {
  const open = rightNow(items, now);
  if (open.length === 0) return null;

  return (
    <section aria-labelledby="right-now" className="flex flex-col gap-3">
      <h2 id="right-now" className="text-lg font-display font-semibold text-fg-strong">
        Right now, at week {now}
      </h2>
      {/* One column on a phone, two on a desktop: the gaps are the lines between. */}
      <ul className="grid gap-px overflow-hidden rounded-xl border border-border-subtle bg-border-subtle lg:grid-cols-2">
        {open.map(({ item, standing }) => (
          <li key={item.id} className="bg-bg-normal lg:last:odd:col-span-2">
            <Link to="/library/$itemId" params={{ itemId: item.id }} className="flex h-full flex-col items-start gap-1 px-4 py-3 hover:bg-bg-normal-hovered">
              <Badge size="sm" variant="soft" intent={intent[standing.kind]}>
                {standingLabel(standing, now)}
              </Badge>
              <span className="text-fg-strong">{item.title}</span>
              {item.summary ? <span className="text-sm text-fg-normal">{item.summary}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
