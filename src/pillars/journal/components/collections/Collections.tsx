// The collections, all at once: everything kept, grouped by what it is, each
// said as a short answer and the lines behind it (`src/lib/journal/summaries/`),
// and opened in full. What's going on now first, what's over under Earlier;
// the papers kept handy at the top, to open at triage; and what an
// appointment asks about as text, to paste into a message or a form. Only
// the collections with something in: never what's missing. While something
// has happened, the folded ones aren't here, as in the story.

import { Button } from "@sixthshift/design-system/button";
import { toast } from "@sixthshift/design-system/overlay";
import { Copy } from "lucide-react";
import { usePapersQuery } from "../../../../api/rpc/papers";
import { useNow } from "../../../../api/rpc/settings";
import { useQuietKind } from "../../../../app/features/quiet/hooks/useQuietKind";
import { formatDate, todayISO } from "../../../../lib/dates";
import { ordered } from "../../../../lib/journal/papers";
import { summariesText } from "../../../../lib/journal/summaries/text";
import { weekLabel } from "../../../../lib/timeline";
import { PaperList } from "../../features/papers/components/PaperList";
import { useCollectionCards } from "../../hooks/useCollectionCards";
import { Group } from "./Group";

export function Collections() {
  const quiet = useQuietKind();
  const { data: papers } = usePapersQuery();
  const now = useNow();
  const shown = useCollectionCards();
  const handy = ordered(papers.filter((p) => p.handy));
  const today = todayISO();

  if (shown.length === 0) {
    return <p className="max-w-prose text-fg-subtle">What you keep is gathered here by what it is, each with a short answer at the top.</p>;
  }

  const asked = shown.filter((s) => s.forAppointments);
  async function copy() {
    const heading = `Kept, ${formatDate(today, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}${now !== null && !quiet ? `, ${weekLabel(now).toLowerCase()}` : ""}`;
    const text = summariesText({ heading, summaries: asked.map((s) => ({ title: s.title, summary: s.summary })), papers: ordered(papers).map((p) => p.title) });
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied", children: "Ready to paste into a message or a form." });
    } catch {
      toast({ title: "Couldn't copy", children: "This browser didn't allow it." });
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-prose text-fg-subtle">Everything kept, by what it is: for an appointment, a call to the hospital, or a look back.</p>
        {asked.length > 0 || papers.length > 0 ? (
          <Button variant="outline" size="sm" onClick={copy}>
            <Copy aria-hidden size={16} />
            Copy as text
          </Button>
        ) : null}
      </div>

      {handy.length > 0 ? (
        <section aria-label="To hand" className="flex flex-col gap-3">
          <h2 className="font-display text-lg font-semibold text-fg-strong">To hand</h2>
          <div className="rounded-xl border border-border-subtle bg-bg-normal p-1">
            <PaperList papers={handy} label="Papers kept handy" />
          </div>
        </section>
      ) : null}

      <Group title="Lately" shown={shown.filter((s) => s.summary.lately)} />
      <Group title="Earlier" shown={shown.filter((s) => !s.summary.lately)} />
    </div>
  );
}
