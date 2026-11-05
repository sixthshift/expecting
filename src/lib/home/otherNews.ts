// The other of you, in a line on Home: what they've kept since yesterday,
// newest first, said as what they did ("felt the baby move", "felt good").
// Expecting is shared, and this is where a phone shows it. Never a count or a
// comparison between you; only what's been happening. Pure, so tested apart.

import { addDays, type ISODate } from "../dates";
import { STEP_LABEL } from "../journal/feelings";
import type { StoryItem } from "../journal/story/items";

/** How many things the line names before it stops. */
const MOST = 3;

/** One thing kept, as what they did; null for what isn't news between you (a task ticked has no one's name; what she ate is hers). */
function said(item: StoryItem): string | null {
  switch (item.kind) {
    case "movements":
      return "felt the baby move";
    case "feeling":
      return `felt ${STEP_LABEL[item.feeling.step].toLowerCase()}`;
    case "note":
      return "kept a note";
    case "letter":
      return "wrote to the baby";
    case "photo":
      return "added a photo";
    case "paper":
      return "kept a paper";
    case "first":
      return "kept a first";
    case "question":
      return "answered the week's question";
    case "bingo":
      return "got bingo";
    default:
      return null;
  }
}

/** What `other` has kept today and yesterday, newest first, each kind once, at most three: ["felt the baby move", "felt good"]. */
export function otherNews(items: readonly StoryItem[], other: string, today: ISODate): string[] {
  const since = addDays(today, -1);
  const news: string[] = [];
  // The story is newest first already.
  for (const item of items) {
    if (item.by !== other || item.day < since || item.day > today) continue;
    const line = said(item);
    if (line && !news.includes(line)) news.push(line);
    if (news.length === MOST) break;
  }
  return news;
}

/** The line itself: "felt the baby move, felt good and added a photo". */
export function newsLine(news: readonly string[]): string {
  if (news.length <= 1) return news[0] ?? "";
  return `${news.slice(0, -1).join(", ")} and ${news.at(-1)}`;
}
