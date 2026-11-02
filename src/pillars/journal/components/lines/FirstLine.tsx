import { Star } from "lucide-react";
import { useState } from "react";
import { firstOf } from "../../../../lib/firsts";
import type { StoryItem } from "../../../../lib/story/items";
import { FirstSheet } from "../entries/firsts/FirstSheet";

import { Opens, usePersonName } from "./parts";

export function FirstLine({ item }: { item: Extract<StoryItem, { kind: "first" }> }) {
  const [open, setOpen] = useState(false);
  const name = usePersonName();
  const { title, question } = firstOf(item.mark.key);
  return (
    <>
      <Opens label={`Open: ${title}`} onOpen={() => setOpen(true)}>
        <span className="flex items-center gap-2 font-display text-lg font-semibold text-fg-strong">
          <Star aria-hidden size={18} className="fill-current text-fg-brand" />
          {title}
        </span>
        {item.mark.words.length > 0 ? (
          item.mark.words.map((w) => (
            <span key={w.by} className="mt-1 block border-l-2 border-border-brand pl-3 text-fg-normal">
              {w.body}
              <span className="text-sm text-fg-subtle"> — {name(w.by)}</span>
            </span>
          ))
        ) : (
          <span className="mt-0.5 block text-sm text-fg-subtle">{question}</span>
        )}
      </Opens>
      {open ? <FirstSheet mark={item.mark} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
