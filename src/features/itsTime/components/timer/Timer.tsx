import { Button } from "@sixthshift/design-system/button";
import { Input } from "@sixthshift/design-system/input";
import { ChevronRight, Undo2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { itsTimeSaves } from "../../../../api/rpc/itsTime";
import { useSave } from "../../../../app/hooks/useSave";
import { type Contraction, clock, lasted, patternOf, type Start, sayPattern, WORDS_MAX } from "../../../../lib/itsTime";
import { newId } from "../../../../lib/outbox";
import { ItemLink } from "../../../library/components/ItemLink";
import { useClock } from "../../hooks/useClock";
import { useWakeLock } from "../../hooks/useWakeLock";

/** How many of the last contractions are listed. */
const SHOWN = 6;

/** A few words you might add: how it felt, never a scale. */
const WORDS = ["Talking through it", "Had to stop"];

/**
 * The timer: one big button, tapped as one starts and again as it ends; under
 * it what the midwife asks (how often, start to start; how long; how many in
 * the last 10 minutes), and the last few. No verdict: what your hospital told
 * you sits under the numbers instead. Either phone taps, and the screen stays
 * on while a start is under way.
 */
export function Timer({ start, hospitalSaid }: { start: Start; hospitalSaid: string | undefined }) {
  const begin = useSave(itsTimeSaves.beginContraction);
  const end = useSave(itsTimeSaves.endContraction);
  const running = start.contractions.find((c) => c.endedAt === null) ?? null;
  const now = useClock(running ? 1_000 : 15_000);
  useWakeLock(true);
  const pattern = patternOf(start.contractions, now);
  const said = sayPattern(pattern);
  const last = [...start.contractions].reverse().slice(0, SHOWN);

  return (
    <section aria-labelledby="contractions" className="flex flex-col gap-3">
      <h2 id="contractions" className="text-sm font-semibold tracking-wide text-fg-subtle uppercase">
        Contractions
      </h2>
      <button
        type="button"
        onClick={() => (running ? end({ id: running.id }) : begin({ id: newId() }))}
        className={
          running
            ? "flex min-h-24 flex-col items-center justify-center rounded-2xl border-2 border-border-brand bg-bg-brand-subtle text-fg-on-brand-subtle"
            : "flex min-h-24 flex-col items-center justify-center rounded-2xl bg-bg-brand-strong text-fg-on-brand-strong hover:bg-bg-brand-strong-hovered"
        }
      >
        <span className="text-xl font-semibold">{running ? "It's ended" : "One's started"}</span>
        <span className="text-sm">{running ? `${secondsSince(running.startedAt, now)} s so far` : "Tap as it starts, and again as it ends"}</span>
      </button>

      {pattern.inHour > 0 ? (
        <p className="text-fg-strong">
          {said ? <>Last hour: {said} · </> : null}
          {pattern.inTen} in the last 10 min
        </p>
      ) : null}
      {hospitalSaid ? (
        <p className="text-sm text-fg-normal">
          Your hospital said: <span className="whitespace-pre-line">“{hospitalSaid}”</span>
        </p>
      ) : (
        <p className="text-sm text-fg-subtle">There's no single rule: your hospital's advice comes first. If you're not sure, ring them.</p>
      )}

      {last.length > 0 ? (
        <ol className="flex flex-col divide-y divide-border-subtle rounded-xl border border-border-subtle bg-bg-normal">
          {last.map((c, i) => (
            <Row key={c.id} contraction={c} newest={i === 0} />
          ))}
        </ol>
      ) : null}
      <ItemLink itemId="timing-contractions" className="flex min-h-11 w-fit items-center gap-1 text-sm text-fg-subtle hover:text-fg-normal">
        Timing contractions
        <ChevronRight aria-hidden size={16} />
      </ItemLink>
    </section>
  );
}

function secondsSince(iso: string, now: Date): number {
  return Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 1000));
}

/** One contraction: when, how long, its words; the newest can be undone, tapped by mistake. */
function Row({ contraction: c, newest }: { contraction: Contraction; newest: boolean }) {
  const [wording, setWording] = useState(false);
  const [words, setWords] = useState(c.note ?? "");
  const note = useSave(itsTimeSaves.noteContraction);
  const undo = useSave(itsTimeSaves.deleteContraction);

  function submit(e: FormEvent) {
    e.preventDefault();
    note({ id: c.id, note: words });
    setWording(false);
  }

  return (
    <li className="flex flex-col gap-2 px-4 py-2">
      <div className="flex min-h-11 items-center gap-3">
        <span className="w-20 font-medium text-fg-strong tabular-nums">{clock(c.startedAt)}</span>
        <span className="w-20 text-fg-normal tabular-nums">{lasted(c) ?? "going"}</span>
        <button type="button" onClick={() => setWording((w) => !w)} className="min-h-11 flex-1 truncate text-left text-sm text-fg-subtle">
          {c.note ?? "Add a word"}
        </button>
        {newest ? (
          <Button variant="ghost" size="sm" aria-label="Undo this one" onClick={() => undo({ id: c.id })}>
            <Undo2 aria-hidden size={16} /> Undo
          </Button>
        ) : null}
      </div>
      {wording ? (
        <form onSubmit={submit} className="flex flex-col gap-2 pb-2">
          <div className="flex flex-wrap gap-2">
            {WORDS.map((w) => (
              <Button
                key={w}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  note({ id: c.id, note: w });
                  setWords(w);
                  setWording(false);
                }}
              >
                {w}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={words} onChange={(e) => setWords(e.target.value)} maxLength={WORDS_MAX} aria-label="A few words" className="flex-1" />
            <Button type="submit" size="sm" intent="brand">
              Save
            </Button>
          </div>
        </form>
      ) : null}
    </li>
  );
}
