import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { ItemLink } from "../../../library/components/ItemLink";
import type { Facts } from "../../../settings/model/facts";
import { flagsFor } from "../../model/callNow";

/**
 * Call now, don't wait: the red flags in the Library's words, open until
 * folded. Not red: the danger colour is kept for a call your own tap has set
 * off. The why is a tap away, in the entries they come from.
 */
export function CallNow({ facts, home }: { facts: Facts; home: boolean }) {
  const [open, setOpen] = useState(true);
  const { call, tripleZero } = flagsFor(facts);
  return (
    <section aria-labelledby="call-now" className="flex flex-col rounded-xl border border-border-subtle bg-bg-normal px-4 py-2">
      <button
        type="button"
        id="call-now"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-11 items-center justify-between gap-2 text-left font-semibold text-fg-strong"
      >
        Call now, don't wait, if
        {open ? <ChevronDown aria-hidden size={18} /> : <ChevronRight aria-hidden size={18} />}
      </button>
      {open ? (
        <div className="flex flex-col gap-3 pb-3">
          <ul className="flex list-disc flex-col gap-1 pl-5 text-fg-normal">
            {call.map((f) => (
              <li key={f.key}>{f.text}</li>
            ))}
          </ul>
          <p className="font-semibold text-fg-strong">Call 000 and ask for an ambulance if</p>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-fg-normal">
            {tripleZero.map((f) => (
              <li key={f.key}>{f.text}</li>
            ))}
          </ul>
          {home ? <p className="text-sm text-fg-subtle">Your midwife is the first call; the birth suite is there too if you can't reach them.</p> : null}
          <ItemLink itemId="when-to-go-to-hospital" className="flex min-h-11 w-fit items-center gap-1 text-sm text-fg-subtle hover:text-fg-normal">
            When to go in, in full
            <ChevronRight aria-hidden size={16} />
          </ItemLink>
        </div>
      ) : null}
    </section>
  );
}
