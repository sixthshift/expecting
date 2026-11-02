import { Button } from "@sixthshift/design-system/button";
import { Input } from "@sixthshift/design-system/input";
import { Undo2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { itsTimeSaves } from "../../../../api/rpc/itsTime";
import { useSave } from "../../../../app/hooks/useSave";
import { type Contraction, clock, lasted, WORDS_MAX } from "../../../../lib/itsTime";

/** A few words you might add: how it felt, never a scale. */
const WORDS = ["Talking through it", "Had to stop"];

/** One contraction: when, how long, its words; the newest can be undone, tapped by mistake. */
export function ContractionRow({ contraction: c, newest }: { contraction: Contraction; newest: boolean }) {
  const [wording, setWording] = useState(false);
  const [words, setWords] = useState(c.note ?? "");
  const note = useSave(itsTimeSaves.noteContraction);
  const undo = useSave(itsTimeSaves.deleteContraction);

  function submit(e: FormEvent) {
    e.preventDefault();
    note({ id: c.id, note: words });
    setWording(false);
  }

  return (
    <li className="flex flex-col gap-2 px-4 py-2">
      <div className="flex min-h-11 items-center gap-3">
        <span className="w-20 font-medium text-fg-strong tabular-nums">{clock(c.startedAt)}</span>
        <span className="w-20 text-fg-normal tabular-nums">{lasted(c) ?? "going"}</span>
        <button type="button" onClick={() => setWording((w) => !w)} className="min-h-11 flex-1 truncate text-left text-sm text-fg-subtle">
          {c.note ?? "Add a word"}
        </button>
        {newest ? (
          <Button variant="ghost" size="sm" aria-label="Undo this one" onClick={() => undo({ id: c.id })}>
            <Undo2 aria-hidden size={16} /> Undo
          </Button>
        ) : null}
      </div>
      {wording ? (
        <form onSubmit={submit} className="flex flex-col gap-2 pb-2">
          <div className="flex flex-wrap gap-2">
            {WORDS.map((w) => (
              <Button
                key={w}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  note({ id: c.id, note: w });
                  setWords(w);
                  setWording(false);
                }}
              >
                {w}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={words} onChange={(e) => setWords(e.target.value)} maxLength={WORDS_MAX} aria-label="A few words" className="flex-1" />
            <Button type="submit" size="sm" intent="brand">
              Save
            </Button>
          </div>
        </form>
      ) : null}
    </li>
  );
}
