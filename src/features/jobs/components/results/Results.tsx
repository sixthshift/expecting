import { Button } from "@sixthshift/design-system/button";
import { jobsSaves } from "../../../../api/rpc/jobs";
import { useSave } from "../../../../app/hooks/useSave";
import { type Outcome, type Pick, said } from "../../../../lib/jobs";

/** An answer mid-sentence: "you", their name, or "together". */
function inLine(pick: Pick, other: string): string {
  const word = said(pick, other);
  return pick === "you" ? word : word.toLowerCase();
}

/**
 * The jobs you've both answered: settled (who, in a word) and to talk about
 * (what each of you said). Changing one takes your answer back and deals it
 * again.
 */
export function Results({ outcomes, other }: { outcomes: readonly Outcome[]; other: string }) {
  const unpick = useSave(jobsSaves.unpickJob);
  const talk = outcomes.filter((o) => !o.agreed);
  const settled = outcomes.filter((o) => o.agreed);
  const change = (o: Outcome) => (
    <Button variant="ghost" size="sm" className="shrink-0" aria-label={`Change: ${o.job.title}`} onClick={() => unpick({ jobId: o.job.id })}>
      Change
    </Button>
  );

  return (
    <div className="flex flex-col gap-5">
      {talk.length > 0 ? (
        <section aria-label="To talk about" className="flex flex-col">
          <h2 className="mb-1 text-sm font-semibold text-fg-normal">To talk about</h2>
          {talk.map((o) =>
            o.agreed ? null : (
              <div key={o.job.id} className="flex min-h-11 items-center gap-3 border-b border-border-subtle py-1 last:border-b-0">
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-fg-strong">{o.job.title}</span>
                  <span className="text-xs text-fg-subtle">
                    You said {inLine(o.mine, other)}; {other} said {inLine(o.theirs, other)}
                  </span>
                </span>
                {change(o)}
              </div>
            )
          )}
        </section>
      ) : null}
      {settled.length > 0 ? (
        <section aria-label="Settled" className="flex flex-col">
          <h2 className="mb-1 text-sm font-semibold text-fg-normal">Settled</h2>
          {settled.map((o) =>
            o.agreed ? (
              <div key={o.job.id} className="flex min-h-11 items-center gap-3 border-b border-border-subtle py-1 last:border-b-0">
                <span className="flex-1 text-fg-strong">{o.job.title}</span>
                <span className="text-sm text-fg-normal">{said(o.who, other)}</span>
                {change(o)}
              </div>
            ) : null
          )}
        </section>
      ) : null}
    </div>
  );
}
