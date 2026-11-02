import { useEmergencyQuery } from "../../../../../api/rpc/emergency";
import { useAnswersQuery } from "../../../../../api/rpc/facts";
import { useSettingsQuery } from "../../../../../api/rpc/settings";
import { todayISO } from "../../../../../lib/dates";
import { factsOf } from "../../../../../lib/facts";
import { patternOf } from "../../../../../lib/itsTime";
import { PapersToHand } from "../../../../../pillars/journal/components/entries/papers/PaperList";
import { useItsTimePage } from "../../contexts/ItsTimePageContext";
import { theyllAsk } from "../../model/theyllAsk";
import { Part } from "../Part";

/** When you ring, they'll ask: the call, already answered, in the order a midwife asks. The papers kept handy (the birth plan) are one tap from here, with no signal too. */
export function TheyllAsk() {
  const { start, home, me, carrying } = useItsTimePage();
  const { values } = useEmergencyQuery().data;
  const { data: facts } = useAnswersQuery({ select: factsOf });
  const { data: dueDate } = useSettingsQuery({ select: (s) => s.dueDate });
  const rows = theyllAsk({
    values,
    facts,
    carrying: carrying?.name ?? null,
    dueDate,
    today: todayISO(),
    start,
    pattern: start ? patternOf(start.contractions, new Date()) : null,
    holding: me?.role ?? null,
  });
  // On the night it's under the timer's numbers; before, it's here.
  const hospitalSaid = start ? undefined : values.hospitalSaid;
  return (
    <Part id="theyll-ask" title="When you ring, they'll ask">
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 rounded-xl border border-border-subtle bg-bg-normal px-4 py-1">
        {rows.map((r) => (
          <div key={r.key} className="col-span-2 grid grid-cols-subgrid border-border-subtle border-b py-2 last:border-b-0">
            <dt className="text-sm text-fg-subtle">{r.label}</dt>
            <dd className={r.key === "moving" ? "text-fg-subtle italic" : "whitespace-pre-line text-fg-strong"}>{r.value}</dd>
          </div>
        ))}
      </dl>
      {hospitalSaid ? (
        <p className="text-sm text-fg-normal">
          {home ? "Your midwife" : "Your hospital"} said: <span className="whitespace-pre-line">“{hospitalSaid}”</span>
        </p>
      ) : null}
      <PapersToHand />
    </Part>
  );
}
