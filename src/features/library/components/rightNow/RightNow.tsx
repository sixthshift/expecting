import { Badge } from "@sixthshift/design-system/badge";
import { useState } from "react";
import type { Item } from "../../../../content/schema";
import { rightNow, type Standing, standingLabel } from "../../../../lib/library";
import type { Week } from "../../../../lib/timeline";
import { ItemLink } from "../ItemLink";

const intent: Record<Standing["kind"], "warning" | "brand" | "neutral"> = { closing: "warning", left: "brand", open: "neutral" };

/** How many are shown before "Show all": the soonest-closing, enough to act on without the list taking the page. */
const FIRST = 4;

/**
 * Right now, at week N: what's open this week, soonest-closing first
 * (src/lib/library.ts), each with why it matters and where its window stands.
 * The first few, then the rest on asking.
 */
export function RightNow({ items, now }: { items: readonly Item[]; now: Week }) {
  const [all, setAll] = useState(false);
  const open = rightNow(items, now);
  if (open.length === 0) return null;
  const shown = all ? open : open.slice(0, FIRST);

  return (
    <section aria-labelledby="right-now" className="flex flex-col gap-3">
      <h2 id="right-now" className="text-lg font-display font-semibold text-fg-strong">
        Right now, at week {now}
      </h2>
      {/* One column on a phone, two on a desktop: the gaps are the lines between. */}
      <ul className="grid gap-px overflow-hidden rounded-xl border border-border-subtle bg-border-subtle lg:grid-cols-2">
        {shown.map(({ item, standing }) => (
          <li key={item.id} className="bg-bg-normal lg:last:odd:col-span-2">
            <ItemLink itemId={item.id} className="flex h-full flex-col items-start gap-1 px-4 py-3 hover:bg-bg-normal-hovered">
              <Badge size="sm" variant="soft" intent={intent[standing.kind]}>
                {standingLabel(standing, now)}
              </Badge>
              <span className="text-fg-strong">{item.title}</span>
              {item.summary ? <span className="text-sm text-fg-normal">{item.summary}</span> : null}
            </ItemLink>
          </li>
        ))}
      </ul>
      {open.length > shown.length ? (
        <button type="button" onClick={() => setAll(true)} className="flex min-h-11 w-fit items-center text-sm font-medium text-fg-brand hover:underline">
          Show all {open.length}
        </button>
      ) : null}
    </section>
  );
}
