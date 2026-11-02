import { type ISODate, todayISO } from "../../../../../../../lib/dates";
import type { Tally } from "../../../../../../../lib/journal/appetite";
import { placeOf } from "../../../../../../../lib/journal/journal";
import { shortDate } from "../../../../../../../lib/labels";
import { weekLabel } from "../../../../../../../lib/timeline";

/** "Pickles · 14 times · from week 14". */
export function TallyList({ title, tallies, dueDate, times }: { title: string; tallies: Tally[]; dueDate: ISODate | null; times: boolean }) {
  const today = todayISO();
  if (tallies.length === 0) return null;
  const from = (day: ISODate) => {
    const place = dueDate ? placeOf(day, dueDate) : null;
    return typeof place === "number" ? `from ${weekLabel(place).toLowerCase()}` : `from ${shortDate(day, today)}`;
  };
  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-sm font-semibold text-fg-strong">{title}</h3>
      <ul className="flex flex-col">
        {tallies.map((t) => (
          <li key={t.what.trim().toLocaleLowerCase("en-AU")} className="flex items-baseline gap-2 py-1 text-sm">
            <span className="font-medium text-fg-strong">{t.what.trim()}</span>
            <span className="text-fg-subtle">{[times ? (t.times === 1 ? "once" : `${t.times} times`) : null, from(t.first)].filter(Boolean).join(" · ")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
