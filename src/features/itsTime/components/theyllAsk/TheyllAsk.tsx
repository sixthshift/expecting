import { PapersToHand } from "../../../journal/components/entries/papers/PaperList";
import type { AskRow } from "../../model/theyllAsk";
import { Part } from "../CallButton";

/** When you ring, they'll ask: the call, already answered, in the order a midwife asks. The papers kept handy (the birth plan) are one tap from here, with no signal too. */
export function TheyllAsk({ rows, hospitalSaid, home }: { rows: readonly AskRow[]; hospitalSaid: string | undefined; home: boolean }) {
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
