// This week's page: the top of the Journal, already partly written before
// anything is kept. The week, its note's title and the baby this week (from
// the week notes); around now, the firsts whose weeks take this one in, each
// an invitation with its question, answered in your own words; the Keep row;
// and what's kept this week, as the diary draws it. Then the places
// Expecting has made ready, and what's already happened that can still be
// kept. Nothing about the baby while something has happened.

import { Button } from "@sixthshift/design-system/button";
import { Card } from "@sixthshift/design-system/card";
import { Modal } from "@sixthshift/design-system/modal";
import { Textarea } from "@sixthshift/design-system/textarea";
import { Camera, FileText, Star } from "lucide-react";
import { type ReactNode, useState } from "react";
import { firstsSaves } from "../../../../../api/rpc/firsts";
import { usePeopleQuery } from "../../../../../api/rpc/people";
import { useSave } from "../../../../../app/hooks/useSave";
import { weekNotes } from "../../../../../content";
import { babyLead, noteFor, sizeLabel } from "../../../../../content/weeks";
import { type ISODate, todayISO } from "../../../../../lib/dates";
import type { FirstDef } from "../../../../../lib/firsts";
import type { Place } from "../../../../../lib/places";
import type { StoryDay } from "../../../../../lib/story";
import { type Week, weekLabel } from "../../../../../lib/timeline";
import { CaptureSheet } from "../../../../capture/components/CaptureSheet";
import { useOnThisPhone } from "../../../hooks/useOnThisPhone";
import { DayField } from "../../entries/firsts/DayField";
import { AddPhoto } from "../../entries/photos/AddPhoto";
import { Days } from "../../story/Story";

/** A first that's around now: what, its question, and your words for it; kept, it's marked today (or the day you say). */
function AroundNowFirst({ first, week, onNotYet, past = false }: { first: FirstDef; week: Week; onNotYet?: () => void; past?: boolean }) {
  const { data: people } = usePeopleQuery();
  const mark = useSave(firstsSaves.markFirst);
  const setWords = useSave(firstsSaves.setFirstWords);
  // One that's already happened is written at once, on the day it was.
  const [writing, setWriting] = useState(past);
  const [body, setBody] = useState("");
  const [day, setDay] = useState<ISODate>(todayISO());
  const [choosingDay, setChoosingDay] = useState(past);

  function keep() {
    mark({ key: first.key, day });
    if (body.trim() && people.me) setWords({ key: first.key, body });
  }

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-border-brand bg-bg-normal p-4">
      <p className="flex items-center gap-2 font-display text-lg font-semibold text-fg-strong">
        <Star aria-hidden size={18} className="text-fg-brand" />
        {first.title}
      </p>
      <p className="text-fg-normal">{first.question}</p>
      {writing ? (
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            keep();
          }}
        >
          {people.me ? (
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              aria-label={`Your words: ${first.question}`}
              placeholder="In your own words"
              autosize
              rows={2}
              maxLength={10_000}
              autoFocus={!past}
            />
          ) : null}
          {choosingDay ? <DayField value={day} onChange={setDay} /> : null}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" intent="brand" size="sm">
              Keep it
            </Button>
            {choosingDay ? null : (
              <Button type="button" variant="ghost" size="sm" onClick={() => setChoosingDay(true)}>
                It was another day
              </Button>
            )}
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button intent="brand" size="sm" onClick={() => setWriting(true)}>
            {people.me ? "Write it" : "Mark it"}
          </Button>
          {onNotYet ? (
            <Button variant="ghost" size="sm" onClick={onNotYet} aria-label={`Not yet: ${first.title}`}>
              Not yet
            </Button>
          ) : null}
        </div>
      )}
      <span className="sr-only">
        Usually {weekLabel(first.weeks[0]).toLowerCase()} to {first.weeks[1]}, around now: week {week}.
      </span>
    </li>
  );
}

/** "About 1.6 cm from head to bottom: about the size of a blueberry." */
function sizeLine(week: Week): string | null {
  const note = noteFor(weekNotes, week);
  if (!note?.size || note.week !== week) return null;
  const label = sizeLabel(note.size);
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}.`;
}

/** This week's page. `keep` is the Keep row, drawn under the invitations. */
export function WeekPage({ week, around, days, keep }: { week: Week; around: readonly FirstDef[]; days: readonly StoryDay[]; keep: ReactNode }) {
  const [notYet, putOff] = useOnThisPhone("expecting:first-not-yet");
  const note = noteFor(weekNotes, week);
  const shown = around.filter((f) => !notYet.includes(`${f.key}@${week}`));
  const size = sizeLine(week);

  return (
    <section aria-label="This week" className="flex flex-col gap-5">
      <header className="flex flex-col gap-2 rounded-xl bg-linear-to-br from-(--expecting-accent-soft-from) to-(--expecting-accent-soft-to) p-5">
        <p className="text-sm font-medium tracking-wide text-fg-subtle uppercase">This week</p>
        <h2 className="flex flex-wrap items-baseline gap-x-3">
          <span className="font-display text-4xl font-semibold text-fg-strong">{weekLabel(week)}</span>
          {note ? <span className="font-display text-xl text-fg-normal">{note.title}</span> : null}
        </h2>
        {note ? <p className="max-w-prose text-fg-normal">{babyLead(note)}</p> : null}
        {size ? <p className="text-sm text-fg-subtle">{size}</p> : null}
      </header>

      {shown.length > 0 ? (
        <section aria-labelledby="around-now" className="flex flex-col gap-3">
          <h3 id="around-now" className="text-sm font-semibold text-fg-strong">
            Around now
          </h3>
          <ul className="flex flex-col gap-3">
            {shown.map((f) => (
              <AroundNowFirst key={f.key} first={f} week={week} onNotYet={() => putOff(`${f.key}@${week}`)} />
            ))}
          </ul>
        </section>
      ) : null}

      {keep}

      {days.length > 0 ? <Days days={days} /> : null}
    </section>
  );
}

/** A place Expecting has made ready: its sentence, and the place itself as the way in, an empty card waiting to be filled. */
function PlaceReady({ place }: { place: Place }) {
  const [open, setOpen] = useState(false);
  return (
    <li>
      <Card variant="placeholder" onClick={() => setOpen(true)} className="flex items-center gap-4">
        <span aria-hidden className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-bg-subtle text-fg-subtle">
          {place.kind === "paper" ? <FileText size={20} /> : <Camera size={20} />}
        </span>
        <span className="text-fg-normal">{place.says}</span>
      </Card>
      {open && place.kind === "paper" ? <CaptureSheet initial="paper" onClose={() => setOpen(false)} /> : null}
      {open && place.kind !== "paper" ? (
        <Modal
          size="sm"
          align="top"
          closable
          onOpenChange={(o) => (o ? null : setOpen(false))}
          aria-label={place.kind === "bump" ? "A bump photo" : "The scan"}
        >
          <Modal.Header>
            <h2 className="font-display text-lg font-semibold text-fg-strong">{place.kind === "bump" ? "A bump photo" : "The scan"}</h2>
          </Modal.Header>
          <Modal.Body className="px-6 pb-6">
            <AddPhoto kind={place.kind === "bump" ? "bump" : "scan"} onAdded={() => setOpen(false)} />
          </Modal.Body>
        </Modal>
      ) : null}
    </li>
  );
}

/** The places ready now, each said once, quietly. */
export function Places({ places }: { places: readonly Place[] }) {
  if (places.length === 0) return null;
  return (
    <ul aria-label="Ready for you" className="flex flex-col gap-3">
      {places.map((p) => (
        <PlaceReady key={p.key} place={p} />
      ))}
    </ul>
  );
}

/** Some of this has already happened: the firsts whose weeks are past, to keep on the day they were. */
export function AlreadyHappened({ firsts, week }: { firsts: readonly FirstDef[]; week: Week }) {
  const [open, setOpen] = useState(false);
  if (firsts.length === 0) return null;
  return (
    <section aria-labelledby="already" className="flex flex-col gap-3">
      <h3 id="already" className="text-sm font-semibold text-fg-strong">
        Already happened
      </h3>
      <p className="text-sm text-fg-normal">Some of this has already happened. You can still keep it, on the day it was.</p>
      {open ? (
        <ul className="flex flex-col gap-3">
          {firsts.map((f) => (
            <AroundNowFirst key={f.key} first={f} week={week} past />
          ))}
        </ul>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {firsts.map((f) => (
            <li key={f.key}>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex min-h-9 items-center gap-1.5 rounded-full border border-border-subtle px-3 text-sm text-fg-normal hover:bg-bg-normal-hovered"
              >
                <Star aria-hidden size={14} className="text-fg-subtle" />
                {f.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
