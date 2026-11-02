// A check-in: how, and your own words only on your phone.

import { isOwn, STEP_LABEL } from "../../../../lib/feelings";
import type { StoryItem } from "../../../../lib/story/items";
import { Face } from "../../../feelings/components/Face";

import { By, useOther } from "./parts";

export function FeelingLine({ item }: { item: Extract<StoryItem, { kind: "feeling" }> }) {
  const other = useOther();
  const { feeling } = item;
  const words = isOwn(feeling) ? [...feeling.words, feeling.note].filter(Boolean).join(", ") : null;
  return (
    <p className="flex items-center gap-2 py-1 text-fg-normal">
      <span className="text-fg-brand">
        <Face step={feeling.step} size={16} />
      </span>
      <span>
        Felt {STEP_LABEL[feeling.step].toLowerCase()}
        {words ? <span>: {words}</span> : null}
        <By name={other(feeling.by)} />
      </span>
    </p>
  );
}
