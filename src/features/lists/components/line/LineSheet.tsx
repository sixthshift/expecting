import { Button } from "@sixthshift/design-system/button";
import { Input } from "@sixthshift/design-system/input";
import { Modal } from "@sixthshift/design-system/modal";
import { ToggleGroup } from "@sixthshift/design-system/toggle-group";
import { ChevronRight } from "lucide-react";
import { type FormEvent, useState } from "react";
import { listsSaves } from "../../../../api/rpc/lists";
import { useSave } from "../../../../app/hooks/useSave";
import type { Line } from "../../../../content/schema";
import { HOWS, type How, LINE_STATES, type LineState, type Mark, wordsFor } from "../../../../lib/lists";
import { ItemLink } from "../../../library/components/ItemLink";

const NONE = "none";

/**
 * A line opened: its state in its list's words, how it was got once it is,
 * and a few words. One of your own can be renamed or deleted; a built-in one
 * links to its entry for the why.
 */
export function LineSheet({ line, mark, onClose }: { line: Line; mark: Mark | undefined; onClose: () => void }) {
  const words = wordsFor(line.listId);
  const [state, setState] = useState<LineState | null>(mark?.state ?? null);
  const [how, setHow] = useState<How | null>(mark?.how ?? null);
  const [note, setNote] = useState(mark?.note ?? "");
  const [title, setTitle] = useState(line.title);
  const markLine = useSave(listsSaves.markLine);
  const changeLine = useSave(listsSaves.changeLine);
  const deleteLine = useSave(listsSaves.deleteLine);
  const own = line.origin === "own";

  function submit(event: FormEvent) {
    event.preventDefault();
    if (own && title.trim().length > 0 && title.trim() !== line.title) changeLine({ id: line.id, title, section: line.section });
    const next = { state, how: state === "got" ? how : null, note: note.trim() || null };
    if (next.state !== (mark?.state ?? null) || next.how !== (mark?.how ?? null) || next.note !== (mark?.note ?? null)) markLine({ lineId: line.id, ...next });
    onClose();
  }

  function remove() {
    deleteLine({ id: line.id });
    onClose();
  }

  return (
    <Modal size="sm" align="top" closable onOpenChange={(open) => (open ? null : onClose())} aria-label={line.title}>
      <Modal.Header>
        <h2 className="font-display text-lg font-semibold text-fg-strong">{line.title}</h2>
      </Modal.Header>
      <Modal.Body className="px-6 pb-6">
        <form onSubmit={submit} className="flex flex-col gap-4">
          {own ? <Input value={title} onChange={(e) => setTitle(e.target.value)} aria-label="What it is" maxLength={200} /> : null}
          <ToggleGroup
            type="single"
            appearance="separate"
            variant="outline"
            intent="brand"
            aria-label="Where it's up to"
            className="flex-wrap"
            value={state ?? NONE}
            onValueChange={(value) => setState(value === "" || value === NONE ? null : (value as LineState))}
            options={[{ value: NONE, label: words.none }, ...LINE_STATES.map((s) => ({ value: s, label: words[s] }))]}
          />
          {state === "got" ? (
            <ToggleGroup
              type="single"
              appearance="separate"
              variant="outline"
              size="sm"
              aria-label="How"
              className="flex-wrap"
              value={how ?? ""}
              onValueChange={(value) => setHow(value === "" ? null : (value as How))}
              options={Object.entries(HOWS).map(([value, label]) => ({ value, label }))}
            />
          ) : null}
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="A few words, if you want: newborn size, Mum's lending hers"
            aria-label="A few words"
            maxLength={500}
          />
          {line.itemId ? (
            <ItemLink itemId={line.itemId} className="flex min-h-11 w-fit items-center gap-1 text-sm text-fg-subtle hover:text-fg-normal">
              Why, and what to look for
              <ChevronRight aria-hidden size={16} />
            </ItemLink>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" intent="brand" size="sm">
              Save
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            {own ? (
              <Button type="button" variant="ghost" intent="danger" size="sm" className="ml-auto" onClick={remove}>
                Delete
              </Button>
            ) : null}
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}
