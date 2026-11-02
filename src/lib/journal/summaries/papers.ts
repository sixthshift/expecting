import type { ISODate } from "../../dates";
import { placeInSentence } from "../../labels";
import type { Paper } from "../papers";
import { anyLately, count, type Summary } from "./summary";

/** Papers: how many, and the latest. Null with none. (The handy ones are drawn as they are, to open.) */
export function papersSummary(papers: readonly Paper[], today: ISODate, dueDate: ISODate | null): Summary | null {
  if (papers.length === 0) return null;
  const latest = [...papers].sort((a, b) => a.day.localeCompare(b.day)).at(-1)!;
  return {
    headline: count(papers.length, "paper", "papers"),
    lines: [`The latest: ${latest.title}, ${placeInSentence(latest.day as ISODate, dueDate)}.`],
    lately: anyLately(
      papers.map((p) => p.createdAt.slice(0, 10)),
      today
    ),
  };
}
