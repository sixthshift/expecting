import { Button } from "@sixthshift/design-system/button";
import { Input } from "@sixthshift/design-system/input";
import { useState } from "react";
import { appetiteSaves, useAppetiteQuery } from "../../../../../api/rpc/appetite";
import { useSave } from "../../../../../app/hooks/useSave";
import { type AppetiteEntry, type How, inputOf } from "../../../../../lib/appetite";
import { type ISODate, todayISO } from "../../../../../lib/dates";
import { timeNow } from "../../../../../lib/journal";
import { newId } from "../../../../../lib/outbox";
import { when } from "../../../model/dates";
import { HowPicker, WhenFields } from "./AppetiteFields";
import { TooSick } from "./TooSick";

/** After the tap, if you want: a few words, and when, for one kept after the fact. Done keeps them. */
function MoreAboutIt({ entry, onDone }: { entry: AppetiteEntry; onDone: (more: { day: string; time: string; note: string | null }) => void }) {
  const [note, setNote] = useState(entry.note ?? "");
  const [day, setDay] = useState<ISODate>(entry.day as ISODate);
  const [time, setTime] = useState(entry.time ?? timeNow());
  const [choosing, setChoosing] = useState(false);

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        onDone({ day, time, note: note.trim() || null });
      }}
    >
      <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="A few words, if you want" aria-label="About it" maxLength={10_000} />
      {choosing ? <WhenFields day={day} time={time} onDay={setDay} onTime={setTime} /> : null}
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" intent="brand" size="sm">
          Done
        </Button>
        {!choosing ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => setChoosing(true)}>
            {when(day, time)} · Change
          </Button>
        ) : null}
      </div>
    </form>
  );
}

/**
 * Sick or queasy: one tap keeps it, now. Then a few words and when, if you
 * want, and Done (`onAdded`: the capture sheet closes). Can't keep fluids
 * down keeps the call on screen, and the sheet open, until Done.
 */
export function AddSickness({ onAdded }: { onAdded?: (id: string) => void }) {
  const { data: entries } = useAppetiteQuery();
  const add = useSave(appetiteSaves.addAppetite);
  const edit = useSave(appetiteSaves.editAppetite);
  // The one just kept here, open for its words until done.
  const [justMade, setJustMade] = useState<string | null>(null);
  const made = entries.find((e) => e.id === justMade);

  function choose(how: How) {
    if (made) {
      edit({ ...inputOf(made), how });
      return;
    }
    const id = newId();
    add({ id, kind: "sick", day: todayISO(), time: timeNow(), how, what: null, note: null });
    setJustMade(id);
  }

  return (
    <div className="flex flex-col gap-3">
      <HowPicker value={made?.how ?? null} onChoose={choose} />
      {made ? (
        <>
          <p className="text-sm text-fg-subtle">Kept. Anything else, if you want.</p>
          <MoreAboutIt
            key={made.id}
            entry={made}
            onDone={(more) => {
              edit({ ...inputOf(made), ...more });
              setJustMade(null);
              onAdded?.(made.id);
            }}
          />
        </>
      ) : null}
      {made?.how === "fluids" ? <TooSick /> : null}
    </div>
  );
}
