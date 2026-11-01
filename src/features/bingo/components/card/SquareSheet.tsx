import { Button } from "@sixthshift/design-system/button";
import { DatePicker } from "@sixthshift/design-system/date-picker";
import { FormField } from "@sixthshift/design-system/form-field";
import { Input } from "@sixthshift/design-system/input";
import { Modal } from "@sixthshift/design-system/modal";
import { type FormEvent, useState } from "react";
import { bingoSaves } from "../../../../api/rpc/bingo";
import { useSave } from "../../../../app/hooks/useSave";
import { type Card, squareOf } from "../../../../lib/bingo";
import { formatDate, type ISODate, todayISO } from "../../../../lib/dates";

/**
 * A square opened. On your own card: when it happened (today unless changed)
 * and a few words, kept, changed or taken back, and whether it's on the
 * other's card too. On theirs: when they marked it, and their words.
 */
export function SquareSheet({
  squareId,
  card,
  own,
  other,
  onClose,
}: {
  squareId: string;
  card: Card;
  own: boolean;
  other: { name: string; card: Card | null };
  onClose: () => void;
}) {
  const was = card.marks.find((m) => m.squareId === squareId);
  const today = todayISO();
  const [day, setDay] = useState<ISODate>(was?.day ?? today);
  const [note, setNote] = useState(was?.note ?? "");
  const mark = useSave(bingoSaves.markSquare);
  const unmark = useSave(bingoSaves.unmarkSquare);
  const text = squareOf(squareId)?.text ?? squareId;
  const onTheirs = own && other.card?.squares.includes(squareId);
  const theyMarked = other.card?.marks.some((m) => m.squareId === squareId);

  function submit(event: FormEvent) {
    event.preventDefault();
    mark({ squareId, day, note: note.trim() || null });
    onClose();
  }

  return (
    <Modal size="sm" align="top" closable onOpenChange={(open) => (open ? null : onClose())} aria-label={text}>
      <Modal.Header>
        <h2 className="font-display text-xl font-semibold text-fg-strong">{text}</h2>
      </Modal.Header>
      <Modal.Body className="px-6 pb-6">
        {own ? (
          <form onSubmit={submit} className="flex flex-col gap-4">
            <FormField label="When it happened">
              <DatePicker
                value={day}
                onChange={(d) => setDay((d as ISODate | undefined) ?? today)}
                segmentOrder="dmy"
                weekStartsOn={1}
                clearable={false}
                maxDate={today}
              />
            </FormField>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="A few words: who, where" aria-label="A few words" maxLength={200} />
            {onTheirs ? (
              <p className="text-sm text-fg-normal">
                It's on {other.name}'s card too{theyMarked ? ", and they've marked it." : ": they can mark theirs."}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" intent="brand">
                {was ? "Save" : "It happened"}
              </Button>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              {was ? (
                <Button
                  type="button"
                  variant="ghost"
                  intent="danger"
                  className="ml-auto"
                  onClick={() => {
                    unmark({ squareId });
                    onClose();
                  }}
                >
                  Unmark
                </Button>
              ) : null}
            </div>
          </form>
        ) : was ? (
          <p className="text-fg-normal">
            Marked {formatDate(was.day, { weekday: "short", day: "numeric", month: "short" })}
            {was.note ? `: “${was.note}”` : "."}
          </p>
        ) : (
          <p className="text-fg-subtle">Not yet.</p>
        )}
      </Modal.Body>
    </Modal>
  );
}
