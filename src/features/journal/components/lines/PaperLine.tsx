import { FileText } from "lucide-react";
import { useState } from "react";
import { PAPER_KIND_LABEL } from "../../../../lib/papers";
import type { StoryItem } from "../../../../lib/story/items";
import { PaperViewer } from "../entries/papers/PaperViewer";

import { Opens } from "./parts";

export function PaperLine({ item }: { item: Extract<StoryItem, { kind: "paper" }> }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Opens label={`Open: ${item.paper.title}`} onOpen={() => setOpen(true)}>
        <span className="flex items-center gap-2 text-fg-normal">
          <FileText aria-hidden size={16} className="text-fg-brand" />
          <span className="text-fg-strong">{item.paper.title}</span>
          <span className="text-sm text-fg-subtle">{PAPER_KIND_LABEL[item.paper.kind]}</span>
        </span>
      </Opens>
      {open ? <PaperViewer id={item.paper.id} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
