import { Button } from "@sixthshift/design-system/button";
import { Undo2 } from "lucide-react";
import { useState } from "react";
import { jobsSaves } from "../../../../api/rpc/jobs";
import { useSave } from "../../../../app/hooks/useSave";
import { JOB_GROUPS, JOBS, type Job, type Pick } from "../../../../lib/jobs";

/**
 * The jobs you haven't answered, one at a time: who'll do it, you, the other
 * or both of you. The last answer can be taken back, dealing it again.
 */
export function JobDeck({ deck, other }: { deck: readonly Job[]; other: string }) {
  const pick = useSave(jobsSaves.pickJob);
  const unpick = useSave(jobsSaves.unpickJob);
  const [last, setLast] = useState<Job | null>(null);
  const job = deck[0];

  function answer(p: Pick) {
    if (!job) return;
    pick({ jobId: job.id, pick: p });
    setLast(job);
  }

  function undo() {
    if (!last) return;
    unpick({ jobId: last.id });
    setLast(null);
  }

  return (
    <section aria-label="To answer" className="flex flex-col gap-3">
      {job ? (
        <article
          aria-label={job.title}
          className="flex flex-col gap-4 rounded-xl border border-border-subtle bg-linear-to-br from-(--expecting-accent-soft-from) to-(--expecting-accent-soft-to) p-5"
        >
          <span className="text-xs font-semibold tracking-wide text-fg-normal uppercase">
            {JOB_GROUPS[job.group]} · {JOBS.length - deck.length + 1} of {JOBS.length}
          </span>
          <h2 className="font-display text-2xl font-semibold text-fg-strong">{job.title}</h2>
          <p className="text-sm text-fg-normal">Who'll do it?</p>
          <div className="grid grid-cols-3 gap-2">
            <Button intent="brand" variant="outline" onClick={() => answer("me")}>
              Me
            </Button>
            <Button intent="brand" variant="outline" onClick={() => answer("you")}>
              {other}
            </Button>
            <Button intent="brand" variant="outline" onClick={() => answer("together")}>
              Together
            </Button>
          </div>
        </article>
      ) : (
        <p className="text-sm text-fg-normal">You've answered every job. Change any of them below.</p>
      )}
      {last ? (
        <Button variant="ghost" size="sm" className="w-fit" onClick={undo}>
          <Undo2 aria-hidden size={16} /> Undo {last.title.toLowerCase()}
        </Button>
      ) : null}
    </section>
  );
}
