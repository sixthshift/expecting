import { Button } from "@sixthshift/design-system/button";
import { Star, X } from "lucide-react";
import { useState } from "react";
import type { Shortlisted } from "../../../../../../lib/names";

/** A name on the shortlist: starred if a superlike put it there; taken off with a second tap to be sure, as it doesn't come back round. */
export function ShortlistName({ name, onTakeOff }: { name: Shortlisted; onTakeOff: () => void }) {
  const [sure, setSure] = useState(false);
  return (
    <li className="flex items-center gap-1 rounded-full bg-bg-normal py-1 pr-1 pl-3">
      <span className="font-display text-lg text-fg-strong">{name.name}</span>
      {name.star ? <Star role="img" aria-label="Superliked" size={14} className="fill-current text-fg-brand" /> : null}
      {sure ? (
        <>
          <Button variant="ghost" size="sm" onClick={onTakeOff}>
            Take off
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSure(false)}>
            Keep
          </Button>
        </>
      ) : (
        <Button variant="ghost" size="sm" iconOnly aria-label={`Take ${name.name} off the shortlist`} onClick={() => setSure(true)}>
          <X aria-hidden size={14} />
        </Button>
      )}
    </li>
  );
}
