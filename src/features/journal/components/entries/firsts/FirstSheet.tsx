// The firsts: marked on their day by either of you, each with its question
// answered in your own words, side by side. Suggested from what's kept only
// as a question to confirm, with a day you can move, or put aside: a first
// is yours to claim. See docs/product/journal.md.

import { Button } from "@sixthshift/design-system/button";
import { Modal } from "@sixthshift/design-system/modal";
import { Star } from "lucide-react";
import { firstsSaves } from "../../../../../api/rpc/firsts";
import { useSave } from "../../../../../app/hooks/useSave";
import type { ISODate } from "../../../../../lib/dates";
import { type FirstMark, firstOf } from "../../../../../lib/firsts";
import { DayField } from "./DayField";
import { FirstWords } from "./FirstWords";

/** A marked first, opened: its day to move, both your words, and a way to take it off. */
export function FirstSheet({ mark, onClose }: { mark: FirstMark & { day: string }; onClose: () => void }) {
  const move = useSave(firstsSaves.markFirst);
  const unmark = useSave(firstsSaves.unmarkFirst);
  return (
    <Modal size="sm" align="top" closable onOpenChange={(open) => (open ? null : onClose())} aria-label={firstOf(mark.key).title}>
      <Modal.Header>
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-fg-strong">
          <Star aria-hidden size={18} className="text-fg-brand" />
          {firstOf(mark.key).title}
        </h2>
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-4 px-6 pb-6">
        <DayField value={mark.day as ISODate} onChange={(day) => move({ key: mark.key, day })} />
        <FirstWords mark={mark} />
        <Button
          variant="ghost"
          size="sm"
          className="self-start text-fg-subtle"
          onClick={() => {
            unmark({ key: mark.key });
            onClose();
          }}
        >
          Take it off
        </Button>
      </Modal.Body>
    </Modal>
  );
}
