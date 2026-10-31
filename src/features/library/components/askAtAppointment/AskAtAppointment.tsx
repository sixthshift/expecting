// On an entry: "Ask at my next appointment". A sheet with the questions the
// entry suggests and a box for your own words; what's added remembers the
// entry it came from. Never on a private entry. See
// docs/plan-appointment-questions.md.

import { Button } from "@sixthshift/design-system/button";
import { Modal } from "@sixthshift/design-system/modal";
import { toast } from "@sixthshift/design-system/overlay";
import { Textarea } from "@sixthshift/design-system/textarea";
import { Check, MessageCircleQuestion } from "lucide-react";
import { type FormEvent, useState } from "react";
import { questionsSaves } from "../../../../api/rpc/questions";
import { useSave } from "../../../../app/hooks/useSave";
import type { Item, ItemPage } from "../../../../content/schema";
import { newId } from "../../../../lib/outbox";
import { canAskFrom, suggestionsFor } from "../../model/suggestions";
import { useContentContext } from "../content/context";

/** The action, and its sheet once opened. */
export function AskAtAppointment({ item, page }: { item: Item; page: Pick<ItemPage, "appointment"> }) {
  const [open, setOpen] = useState(false);
  if (!canAskFrom(item)) return null;
  return (
    <>
      <Button variant="outline" className="self-start" onClick={() => setOpen(true)}>
        <MessageCircleQuestion aria-hidden size={16} /> Ask at my next appointment
      </Button>
      {open ? <AskSheet item={item} suggestions={suggestionsFor(item, page)} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function AskSheet({ item, suggestions, onClose }: { item: Item; suggestions: string[]; onClose: () => void }) {
  const { openQuestions } = useContentContext();
  const [text, setText] = useState("");
  const add = useSave(questionsSaves.addQuestion);
  const onList = text.trim().length > 0 && openQuestions.includes(text.trim());

  function submit(event: FormEvent) {
    event.preventDefault();
    if (text.trim().length === 0 || onList) return;
    add({ id: newId(), text, itemId: item.id });
    toast({ title: "Added to your questions" });
    onClose();
  }

  return (
    <Modal size="sm" align="top" closable onOpenChange={(o) => (o ? null : onClose())} aria-label="Ask at your next appointment">
      <Modal.Header>
        <h2 className="font-display text-lg font-semibold text-fg-strong">Ask at your next appointment</h2>
      </Modal.Header>
      <Modal.Body className="px-6 pb-6">
        <form onSubmit={submit} className="flex flex-col gap-4">
          {suggestions.length > 0 ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-fg-subtle">Suggested</p>
              <ul className="flex flex-col gap-2">
                {suggestions.map((s) => (
                  <li key={s}>
                    {openQuestions.includes(s) ? (
                      <p className="flex min-h-11 items-center gap-2 rounded-lg border border-border-subtle px-3 text-sm text-fg-subtle">
                        <span className="flex-1">{s}</span>
                        <span className="flex shrink-0 items-center gap-1 text-xs">
                          <Check aria-hidden size={14} /> On your list
                        </span>
                      </p>
                    ) : (
                      // Taken into the box, to send as it is or change first.
                      <button
                        type="button"
                        onClick={() => setText(s)}
                        aria-pressed={text === s}
                        className="flex min-h-11 w-full items-center rounded-lg border border-border-normal px-3 text-left text-sm text-fg-normal hover:bg-bg-normal-hovered aria-pressed:border-border-brand"
                      >
                        {s}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={suggestions.length > 0 ? "Or in your own words…" : "What do you want to ask?"}
            aria-label="Your question"
            autosize
            rows={2}
            maxLength={1000}
          />
          {onList ? <p className="text-xs text-fg-subtle">That one's already on your list.</p> : null}
          <Button type="submit" intent="brand" disabled={text.trim().length === 0 || onList} className="self-end">
            Add to my questions
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
}
