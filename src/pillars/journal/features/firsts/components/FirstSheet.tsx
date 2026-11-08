// The firsts: marked on their day by either of you, each with its question
// answered in your own words, side by side. Suggested from what's kept only
// as a question to confirm, with a day you can move, or put aside: a first
// is yours to claim. See docs/product/journal.md.

import { Button } from "@sixthshift/design-system/button";
import { Star } from "lucide-react";
import { firstsSaves } from "../../../../../api/rpc/firsts";
import { DetailSheet } from "../../../../../app/components/DetailSheet";
import { useSave } from "../../../../../app/hooks/useSave";
import type { ISODate } from "../../../../../lib/dates";
import { type FirstMark, firstOf } from "../../../../../lib/journal/firsts";
import { DayField } from "../../../components/WhenFields";
import { FirstWords } from "./FirstWords";

/** A marked first, opened: its day to move, both your words, and a way to take it off. */
export function FirstSheet({ mark, onClose }: { mark: FirstMark & { day: string }; onClose: () => void }) {
  const move = useSave(firstsSaves.markFirst);
  const unmark = useSave(firstsSaves.unmarkFirst);
  return (
    <DetailSheet
      title={
        <span className="flex items-center gap-2">
          <Star aria-hidden size={18} className="text-fg-brand" />
          {firstOf(mark.key).title}
        </span>
      }
      label={firstOf(mark.key).title}
      onClose={onClose}
      className="flex flex-col gap-4"
    >
      <DayField label="When" value={mark.day as ISODate} onChange={(day) => move({ key: mark.key, day })} />
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
    </DetailSheet>
  );
}
