import type { ISODate } from "../../dates";
import { dayInSentence, placeInSentence } from "../../labels";
import { bumpWeeks, type Photo } from "../photos";
import { anyLately, count, type Summary } from "./summary";

/** Photos: how many, the bump week by week, the scans, and the last. Null with none. */
export function photosSummary(photos: readonly Photo[], today: ISODate, dueDate: ISODate | null): Summary | null {
  const kept = photos.filter((p) => p.day <= today).sort((a, b) => a.day.localeCompare(b.day));
  if (kept.length === 0) return null;
  const lines: string[] = [];
  const bump = bumpWeeks(kept, dueDate);
  if (bump.length > 1) lines.push(`The bump in ${bump.length} weeks, from week ${bump[0]!.week} to week ${bump.at(-1)!.week}.`);
  else if (bump.length === 1) lines.push(`The bump in week ${bump[0]!.week}.`);
  const scans = kept.filter((p) => p.kind === "scan");
  if (scans.length > 0)
    lines.push(`${scans.length === 1 ? "A scan" : `${scans.length} scans`}: ${scans.map((p) => placeInSentence(p.day as ISODate, dueDate)).join(", ")}.`);
  lines.push(`Last kept ${dayInSentence(kept.at(-1)!.day as ISODate, today)}.`);
  return {
    headline: count(kept.length, "photo", "photos"),
    lines,
    lately: anyLately(
      kept.map((p) => p.day),
      today
    ),
  };
}
