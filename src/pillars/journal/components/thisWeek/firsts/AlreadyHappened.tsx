// What's already happened that can still be kept: the firsts whose weeks
// are past, each kept on the day it was.

import { Star } from "lucide-react";
import { useState } from "react";
import type { FirstDef } from "../../../../../lib/journal/firsts";
import type { Week } from "../../../../../lib/timeline";
import { AroundNowFirst } from "./AroundNowFirst";

/** Some of this has already happened: the firsts whose weeks are past, to keep on the day they were. */
export function AlreadyHappened({ firsts, week }: { firsts: readonly FirstDef[]; week: Week }) {
  const [open, setOpen] = useState(false);
  if (firsts.length === 0) return null;
  return (
    <section aria-labelledby="already" className="flex flex-col gap-3">
      <h3 id="already" className="text-sm font-semibold text-fg-strong">
        Already happened
      </h3>
      <p className="text-sm text-fg-normal">Some of this has already happened. You can still keep it, on the day it was.</p>
      {open ? (
        <ul className="flex flex-col gap-3">
          {firsts.map((f) => (
            <AroundNowFirst key={f.key} first={f} week={week} past />
          ))}
        </ul>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {firsts.map((f) => (
            <li key={f.key}>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex min-h-9 items-center gap-1.5 rounded-full border border-border-subtle px-3 text-sm text-fg-normal hover:bg-bg-normal-hovered"
              >
                <Star aria-hidden size={14} className="text-fg-subtle" />
                {f.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
