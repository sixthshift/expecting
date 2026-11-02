// A task done in the Planner.

import { Check } from "lucide-react";
import type { StoryItem } from "../../../../lib/story/items";

export function DoneLine({ item }: { item: Extract<StoryItem, { kind: "done" }> }) {
  return (
    <p className="flex items-center gap-2 py-1 text-sm text-fg-subtle">
      <Check aria-hidden size={14} className="shrink-0" />
      <span>
        <span className="sr-only">Done: </span>
        {item.title}
      </span>
    </p>
  );
}
