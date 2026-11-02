import { addDays, type ISODate } from "../../dates";
import { type AppetiteEntry, tally } from "../appetite";
import { LATELY_DAYS, list, type Summary } from "./summary";

/** "3 times", "twice", "once". */
function times(n: number): string {
  return n === 1 ? "once" : n === 2 ? "twice" : `${n} times`;
}

/** How many cravings are named before "and N more". */
const CRAVINGS_NAMED = 6;

/** Cravings and what's gone off: each by how often, most first; its answer, the most craved. Null with neither kept. */
export function cravingsSummary(appetite: readonly AppetiteEntry[], today: ISODate): Summary | null {
  const craved = tally(appetite, "craving");
  const off = tally(appetite, "off");
  if (craved.length === 0 && off.length === 0) return null;
  const say = (t: { what: string; times: number }) => (t.times > 1 ? `${t.what.trim()} (${times(t.times)})` : t.what.trim());
  const lines: string[] = [];
  if (craved.length > 0) {
    const named = craved.slice(0, CRAVINGS_NAMED).map(say);
    const more = craved.length - named.length;
    lines.push(`Craved: ${list(more > 0 ? [...named, `${more} more`] : named)}.`);
  }
  if (off.length > 0) lines.push(`Gone off: ${list(off.map(say))}.`);
  // The most craved, all of them when they tie: "Ice and pickles".
  const most = craved.filter((t) => t.times === craved[0]?.times).slice(0, 3);
  const headline =
    most.length > 0
      ? list(most.map((t, i) => (i === 0 ? t.what.trim().replace(/^./, (c) => c.toUpperCase()) : t.what.trim().toLowerCase())))
      : `Gone off ${off[0]!.what.trim().toLowerCase()}`;
  const lately = appetite.some((e) => e.kind !== "sick" && e.day >= addDays(today, 1 - LATELY_DAYS) && e.day <= today);
  return { headline, lines, lately };
}
