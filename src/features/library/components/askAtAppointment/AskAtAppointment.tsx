// On an entry: "Ask at my next appointment". A sheet with the questions the
// entry suggests and a box for your own words; what's added remembers the
// entry it came from. Never on a private entry. See
// docs/product/planner.md.

import { Button } from "@sixthshift/design-system/button";
import { MessageCircleQuestion } from "lucide-react";
import { useState } from "react";
import { useEntry } from "../../contexts/LibraryItemPageContext";
import { canAskFrom } from "../../model/suggestions";
import { AskSheet } from "./AskSheet";

/** The action, and its sheet once opened. */
export function AskAtAppointment() {
  const { item } = useEntry();
  const [open, setOpen] = useState(false);
  if (!canAskFrom(item)) return null;
  return (
    <>
      <Button variant="outline" className="self-start" onClick={() => setOpen(true)}>
        <MessageCircleQuestion aria-hidden size={16} /> Ask at my next appointment
      </Button>
      {open ? <AskSheet onClose={() => setOpen(false)} /> : null}
    </>
  );
}
