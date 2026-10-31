import { Button } from "@sixthshift/design-system/button";
import { useState } from "react";
import { itsTimeSaves } from "../../../../api/rpc/itsTime";
import { useSave } from "../../../../app/hooks/useSave";
import { clock, lasted, type Night, WATERS_LABEL } from "../../../../lib/itsTime";

/**
 * The night opened from the Journal: its times, then its contractions, read
 * only; and the way to take it off, the start and its contractions with it.
 */
export function NightDetail({ night, onDeleted }: { night: Night; onDeleted: () => void }) {
  const { start, falseStarts } = night;
  const remove = useSave(itsTimeSaves.deleteStart);
  const [asking, setAsking] = useState(false);
  const times: [string, string | null][] = [
    ["Started", clock(start.startedAt)],
    ["Waters broke", start.watersAt ? `${clock(start.watersAt)}${start.waters ? `, ${WATERS_LABEL[start.waters].toLowerCase()}` : ""}` : null],
    ["Left", start.leftAt ? clock(start.leftAt) : null],
    ["There", start.endedAt ? clock(start.endedAt) : null],
  ];
  return (
    <div className="flex flex-col gap-4">
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        {times.flatMap(([label, value]) =>
          value
            ? [
                <dt key={`${label}-t`} className="text-sm text-fg-subtle">
                  {label}
                </dt>,
                <dd key={`${label}-d`} className="text-fg-strong">
                  {value}
                </dd>,
              ]
            : []
        )}
      </dl>
      {start.contractions.length > 0 ? (
        <section aria-label="Contractions" className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-fg-normal">Contractions</h3>
          <ol className="flex flex-col text-sm">
            {start.contractions.map((c) => (
              <li key={c.id} className="flex gap-3 py-0.5 tabular-nums">
                <span className="w-16 text-fg-strong">{clock(c.startedAt)}</span>
                <span className="w-20 text-fg-normal">{lasted(c) ?? ""}</span>
                {c.note ? <span className="text-fg-subtle">{c.note}</span> : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}
      {falseStarts.length > 0 ? (
        <p className="text-sm text-fg-subtle">
          {falseStarts.length === 1 ? "A false start before it" : `${falseStarts.length} false starts before it`}, kept in It's time.
        </p>
      ) : null}
      {asking ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-fg-normal">Take the night off, contractions and all?</span>
          <Button
            size="sm"
            intent="danger"
            onClick={() => {
              remove({ id: start.id });
              onDeleted();
            }}
          >
            Delete
          </Button>
          <Button size="sm" variant="outline" onClick={() => setAsking(false)}>
            Keep it
          </Button>
        </div>
      ) : (
        <Button size="sm" variant="ghost" className="w-fit" onClick={() => setAsking(true)}>
          Delete
        </Button>
      )}
    </div>
  );
}
