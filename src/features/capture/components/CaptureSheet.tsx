// The capture sheet: what to add, then its form, in the same sheet. Each
// form is its pillar's own, reused: the Journal's note, movement, sickness and
// craving, photo, paper, first, the check-in, the Planner's appointment,
// question and task.
// Once kept, the sheet closes and a toast says where it went, with the way to
// it; you stay on the page you were on. Kept from the Journal itself, there's
// no toast: the Journal shows what was just kept (`?kept=`). Opened with
// something shared from another app, it offers only what that can become, and
// its form starts with it.

import { Button } from "@sixthshift/design-system/button";
import { Modal } from "@sixthshift/design-system/modal";
import { toast } from "@sixthshift/design-system/overlay";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { useJournalQuery } from "../../../api/rpc/journal";
import { usePeopleQuery } from "../../../api/rpc/people";
import { useQuietQuery } from "../../../api/rpc/quiet";
import { useNow } from "../../../api/rpc/settings";
import type { FirstKey } from "../../../lib/firsts";
import { movementsOffered } from "../../../lib/journal";
import type { Shared } from "../../../pwa/share";
import { type Capture, CHOICE, captureChoices, FILED_IN, sharedChoices } from "../model/choices";
import { CaptureForm } from "./CaptureForm";
import { ChoiceList } from "./ChoiceList";

/**
 * `initial`: open on that one's form (a place made ready, a task that keeps something). `letter`: a note
 * starts as a letter to the baby; `first`: a first starts at that one. `shared`: what another app shared, to
 * keep. `onKept` once something is kept, before the sheet closes.
 */
export function CaptureSheet({
  initial = null,
  letter,
  first,
  shared,
  onKept,
  onClose,
}: {
  initial?: Capture | null;
  letter?: boolean;
  first?: FirstKey;
  shared?: Shared;
  onKept?: () => void;
  onClose: () => void;
}) {
  const { data: people } = usePeopleQuery();
  const { data: quiet } = useQuietQuery();
  const { data: journal } = useJournalQuery();
  const now = useNow();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const offered = captureChoices({
    holding: Boolean(people.me),
    quiet: Boolean(quiet),
    movements: movementsOffered({ now, quiet: Boolean(quiet), entries: journal }),
  });
  const choices = shared ? sharedChoices({ types: shared.files.map((f) => f.type), text: Boolean(shared.text) }, offered) : offered;
  // Shared, and only one thing it can be: straight to its form.
  const [chosen, setChosen] = useState<Capture | null>(initial ?? (choices.length === 1 ? choices[0]! : null));
  const files = shared?.files.length ? shared.files : undefined;
  const text = shared?.text ?? undefined;

  /** Kept: close, and say what was kept and where it went, with the way there unless you're there. */
  function filed(capture: Capture) {
    const { pillar, to, kept } = FILED_IN[capture];
    onKept?.();
    onClose();
    toast({ title: kept, children: `In the ${pillar}`, ...(pathname === to ? {} : { action: "See it", onAction: () => navigate({ to }) }) });
  }

  return (
    <Modal size="sm" align="top" closable onOpenChange={(open) => (open ? null : onClose())}>
      <Modal.Header>
        <h2 className="flex items-center gap-1 font-display text-lg font-semibold text-fg-strong">
          {chosen && choices.length > 1 ? (
            <Button variant="ghost" size="sm" iconOnly aria-label="Back to what to add" onClick={() => setChosen(null)} className="-ml-2">
              <ChevronLeft aria-hidden size={18} />
            </Button>
          ) : null}
          {chosen ? CHOICE[chosen].label : shared ? "Keep what was shared" : "Add"}
        </h2>
      </Modal.Header>
      <Modal.Body className="px-6 pb-6">
        {chosen === null ? (
          <ChoiceList choices={choices} onChoose={setChosen} />
        ) : (
          <CaptureForm capture={chosen} me={people.me} now={now} text={text} files={files} letter={letter} first={first} onFiled={filed} />
        )}
      </Modal.Body>
    </Modal>
  );
}
