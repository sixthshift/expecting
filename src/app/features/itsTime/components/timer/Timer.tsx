import { ChevronRight } from "lucide-react";
import { useEmergencyQuery } from "../../../../../api/rpc/emergency";
import { itsTimeSaves } from "../../../../../api/rpc/itsTime";
import { patternOf, type Start, sayPattern } from "../../../../../lib/itsTime";
import { newId } from "../../../../../lib/outbox";
import { ItemLink } from "../../../../../pillars/library/components/itemLink/ItemLink";
import { useSave } from "../../../../hooks/useSave";
import { useClock } from "../../hooks/useClock";
import { useWakeLock } from "../../hooks/useWakeLock";
import { Part } from "../Part";
import { ContractionRow } from "./ContractionRow";

/** How many of the last contractions are listed. */
const SHOWN = 6;

/**
 * The timer: one big button, tapped as one starts and again as it ends; under
 * it what the midwife asks (how often, start to start; how long; how many in
 * the last 10 minutes), and the last few. No verdict: what your hospital told
 * you sits under the numbers instead. Either phone taps, and the screen stays
 * on while a start is under way.
 */
export function Timer({ start }: { start: Start }) {
  const { hospitalSaid } = useEmergencyQuery().data.values;
  const begin = useSave(itsTimeSaves.beginContraction);
  const end = useSave(itsTimeSaves.endContraction);
  const running = start.contractions.find((c) => c.endedAt === null) ?? null;
  const now = useClock(running ? 1_000 : 15_000);
  useWakeLock(true);
  const pattern = patternOf(start.contractions, now);
  const said = sayPattern(pattern);
  const last = [...start.contractions].reverse().slice(0, SHOWN);

  return (
    <Part id="contractions" title="Contractions">
      <button
        type="button"
        onClick={() => (running ? end({ id: running.id, startId: start.id, startedAt: running.startedAt }) : begin({ id: newId(), startId: start.id }))}
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
            <ContractionRow key={c.id} contraction={c} newest={i === 0} />
          ))}
        </ol>
      ) : null}
      <ItemLink itemId="timing-contractions" className="flex min-h-11 w-fit items-center gap-1 text-sm text-fg-subtle hover:text-fg-normal">
        Timing contractions
        <ChevronRight aria-hidden size={16} />
      </ItemLink>
    </Part>
  );
}

function secondsSince(iso: string, now: Date): number {
  return Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 1000));
}
