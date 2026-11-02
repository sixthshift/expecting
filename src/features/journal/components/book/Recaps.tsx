import { Button } from "@sixthshift/design-system/button";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useNow } from "../../../../api/rpc/settings";
import { type RecapSpan, recapsSoFar } from "../../../../lib/journalNow";
import { hasRecap } from "../../../../lib/recap";
import type { StoryItem } from "../../../../lib/story/items";
import { RecapViewer, useRecap } from "./Recap";

/** A recap so far, opened from the whole pregnancy's line; none with nothing in it. */
function RecapButton({ span, items }: { span: RecapSpan; items: readonly StoryItem[] }) {
  const recap = useRecap(span, items);
  const [open, setOpen] = useState(false);
  if (!recap || !hasRecap(recap)) return null;
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        {span.title}, kept
      </Button>
      {open ? <RecapViewer recap={recap} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

/** Under the whole pregnancy's line: each recap there is so far, and the book. */
export function Recaps({ items }: { items: readonly StoryItem[] }) {
  const now = useNow();
  return (
    <div className="flex flex-wrap items-center gap-2">
      {recapsSoFar(now).map((span) => (
        <RecapButton key={span.key} span={span} items={items} />
      ))}
      <Link to="/journal/book" className="flex min-h-9 items-center px-2 text-sm font-medium text-fg-brand underline">
        The book
      </Link>
    </div>
  );
}
