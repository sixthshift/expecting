// One line of the story, by its kind: each kind's line is its own file
// beside this one.

import type { StoryItem } from "../../../../lib/story/items";
import { AppetiteLine } from "./AppetiteLine";
import { BingoLine } from "./BingoLine";
import { DoneLine } from "./DoneLine";
import { FeelingLine } from "./FeelingLine";
import { FirstLine } from "./FirstLine";
import { MovedLine } from "./MovedLine";
import { NightLine } from "./NightLine";
import { NoteLine } from "./NoteLine";
import { PaperLine } from "./PaperLine";
import { QuestionLine } from "./QuestionLine";

/** One line of the story, but a photo (a day's are drawn together) or sickness and cravings (a day's are grouped). */
export function StoryLine({ item }: { item: StoryItem }) {
  switch (item.kind) {
    case "note":
    case "letter":
      return <NoteLine item={item} />;
    case "movements":
      return <MovedLine item={item} />;
    case "appetite":
      return <AppetiteLine entries={[item.entry]} />;
    case "paper":
      return <PaperLine item={item} />;
    case "feeling":
      return <FeelingLine item={item} />;
    case "first":
      return <FirstLine item={item} />;
    case "done":
      return <DoneLine item={item} />;
    case "night":
      return <NightLine item={item} />;
    case "question":
      return <QuestionLine item={item} />;
    case "bingo":
      return <BingoLine item={item} />;
    case "photo":
      return null;
  }
}
