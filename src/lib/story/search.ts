// Looking through the story: the words each line can be found by.

import { describe as describeAppetite } from "../appetite";
import { isOwn, STEP_LABEL } from "../feelings";
import { firstOf } from "../firsts";
import { nightLine } from "../itsTime";
import { PAPER_KIND_LABEL } from "../papers";
import { PHOTO_KIND_LABEL } from "../photos";

import type { StoryItem } from "./items";

/** Who a line names: `name` gives a person's name from their id. */
type Namer = (id: string | null) => string | null;

/** The words a line can be found by. */
function storyText(item: StoryItem, name: Namer = () => null): string {
  const words = ((): (string | null)[] => {
    switch (item.kind) {
      case "note":
      case "letter":
        return [item.entry.body, item.kind === "letter" ? "letter" : "note"];
      case "movements":
        return ["moving movement kick", ...item.entries.map((e) => e.body)];
      case "appetite":
        return [describeAppetite(item.entry), item.entry.note, item.entry.kind === "off" ? "gone off" : item.entry.kind];
      case "photo":
        return [PHOTO_KIND_LABEL[item.photo.kind], item.photo.caption, "photo"];
      case "paper":
        return [item.paper.title, PAPER_KIND_LABEL[item.paper.kind], item.paper.note, "paper"];
      case "feeling":
        return [STEP_LABEL[item.feeling.step], ...(isOwn(item.feeling) ? [...item.feeling.words, item.feeling.note] : []), "feeling"];
      case "first":
        return [firstOf(item.mark.key).title, ...item.mark.words.map((w) => w.body), "first"];
      case "done":
        return [item.title, "done"];
      case "night":
        return [nightLine(item.night), "it started labour"];
      case "question":
        return [item.pair.question, ...item.pair.answers.map((a) => a.body), "question"];
      case "bingo":
        return [item.moment.kind === "full" ? "full house" : "bingo", "bingo"];
    }
  })();
  return [...words, name(item.by)].filter(Boolean).join(" ").toLocaleLowerCase("en-AU");
}

/** Whether a line has every word of `query`, in any case. An empty query matches all. */
export function storyMatches(item: StoryItem, query: string, name?: Namer): boolean {
  const text = storyText(item, name);
  return query
    .toLocaleLowerCase("en-AU")
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => text.includes(w));
}
