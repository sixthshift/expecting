import { Button } from "@sixthshift/design-system/button";
import { Modal } from "@sixthshift/design-system/modal";
import { Star } from "lucide-react";
import { useState } from "react";
import { useFirsts } from "../../../../../../api/rpc/firsts";
import { type FirstMark, firstOf, isMarked } from "../../../../../../lib/firsts";
import { dayOf } from "../../../../model/dates";
import { FirstSheet } from "../../../entries/firsts/FirstSheet";
import { MarkFirst } from "../../../entries/firsts/MarkFirst";

/** A first in the story: a star, what, when, and the first words kept for it. Opened to change. */
function FirstLine({ mark }: { mark: FirstMark & { day: string } }) {
  const [open, setOpen] = useState(false);
  const words = mark.words[0]?.body;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-start gap-3 rounded-md px-2 py-2 text-left hover:bg-bg-normal-hovered focus-visible:ring-2 focus-visible:ring-border-focus"
      >
        <Star aria-hidden size={18} className="mt-0.5 shrink-0 fill-current text-fg-brand" />
        <span className="flex flex-col">
          <span className="font-medium text-fg-strong">{firstOf(mark.key).title}</span>
          {words ? (
            <span className="line-clamp-2 text-sm text-fg-normal">{words}</span>
          ) : (
            <span className="text-sm text-fg-subtle">{firstOf(mark.key).question}</span>
          )}
        </span>
      </button>
      {open ? <FirstSheet mark={mark} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

/** The Firsts lens: every one marked, in the order they came, and a way to mark another. */
export function FirstsLens() {
  const { data: firsts } = useFirsts();
  const [marking, setMarking] = useState(false);
  const marked = firsts.filter(isMarked).sort((a, b) => a.day.localeCompare(b.day));
  return (
    <section aria-labelledby="firsts" className="flex max-w-2xl flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 id="firsts" className="font-display text-lg font-semibold text-fg-strong">
          Firsts
        </h2>
        <Button variant="outline" size="sm" onClick={() => setMarking(true)}>
          Mark a first
        </Button>
      </div>
      <ol className="flex flex-col">
        {marked.map((m) => (
          <li key={m.key} className="flex items-start gap-3">
            <span className="w-20 shrink-0 pt-2 text-xs text-fg-subtle">{dayOf(m.day)}</span>
            <span className="flex-1">
              <FirstLine mark={m} />
            </span>
          </li>
        ))}
      </ol>
      {marking ? (
        <Modal size="sm" align="top" closable onOpenChange={(open) => (open ? null : setMarking(false))} aria-label="Mark a first">
          <Modal.Header>
            <h2 className="font-display text-lg font-semibold text-fg-strong">Mark a first</h2>
          </Modal.Header>
          <Modal.Body className="px-6 pb-6">
            <MarkFirst onAdded={() => setMarking(false)} />
          </Modal.Body>
        </Modal>
      ) : null}
    </section>
  );
}
