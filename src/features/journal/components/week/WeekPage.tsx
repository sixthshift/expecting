// This week's page: the top of the Journal, already partly written before
// anything is kept. The week, its note's title and the baby this week (from
// the week notes); around now, the firsts whose weeks take this one in, each
// an invitation with its question, answered in your own words; the Keep row;
// and what's kept this week, as the diary draws it. Then still to come in
// your story. Nothing about the baby while something has happened.

import { Button } from "@sixthshift/design-system/button";
import { Textarea } from "@sixthshift/design-system/textarea";
import { Star } from "lucide-react";
import { type ReactNode, useState } from "react";
import { firstsSaves } from "../../../../api/rpc/firsts";
import { usePeople } from "../../../../api/rpc/people";
import { useSave } from "../../../../app/hooks/useSave";
import { weekNotes } from "../../../../content";
import { babyLead, noteFor, sizeLabel } from "../../../../content/weeks";
import { type ISODate, todayISO } from "../../../../lib/dates";
import type { FirstDef } from "../../../../lib/firsts";
import type { StoryDay } from "../../../../lib/story";
import { type Week, weekLabel } from "../../../../lib/timeline";
import { useOnThisPhone } from "../../hooks/useOnThisPhone";
import { DayField } from "../firsts/firsts";
import { Days } from "../story/Story";

/** A first that's around now: what, its question, and your words for it; kept, it's marked today (or the day you say). */
function AroundNowFirst({ first, week, onNotYet }: { first: FirstDef; week: Week; onNotYet: () => void }) {
  const { data: people } = usePeople();
  const mark = useSave(firstsSaves.markFirst);
  const setWords = useSave(firstsSaves.setFirstWords);
  const [writing, setWriting] = useState(false);
  const [body, setBody] = useState("");
  const [day, setDay] = useState<ISODate>(todayISO());
  const [choosingDay, setChoosingDay] = useState(false);

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
              autoFocus
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
          <Button variant="ghost" size="sm" onClick={onNotYet} aria-label={`Not yet: ${first.title}`}>
            Not yet
          </Button>
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
export function WeekPage({
  week,
  quiet,
  around,
  days,
  keep,
}: {
  week: Week;
  quiet: boolean;
  around: readonly FirstDef[];
  days: readonly StoryDay[];
  keep: ReactNode;
}) {
  const [notYet, putOff] = useOnThisPhone("expecting:first-not-yet");
  const note = noteFor(weekNotes, week);
  const shown = around.filter((f) => !notYet.includes(`${f.key}@${week}`));
  const size = sizeLine(week);

  return (
    <section aria-label="This week" className="flex flex-col gap-5">
      <header className="flex flex-col gap-2 rounded-2xl bg-linear-to-br from-(--expecting-accent-soft-from) to-(--expecting-accent-soft-to) p-5">
        <p className="text-sm font-medium tracking-wide text-fg-subtle uppercase">This week</p>
        <h2 className="flex flex-wrap items-baseline gap-x-3">
          <span className="font-display text-4xl font-semibold text-fg-strong">{weekLabel(week)}</span>
          {note && !quiet ? <span className="font-display text-xl text-fg-normal">{note.title}</span> : null}
        </h2>
        {note && !quiet ? <p className="max-w-prose text-fg-normal">{babyLead(note)}</p> : null}
        {size && !quiet ? <p className="text-sm text-fg-subtle">{size}</p> : null}
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

/** Still to come in your story: the next firsts, and the weeks they usually come in. */
export function StillToCome({ firsts }: { firsts: readonly FirstDef[] }) {
  if (firsts.length === 0) return null;
  return (
    <section aria-labelledby="to-come" className="flex flex-col gap-2">
      <h3 id="to-come" className="text-sm font-semibold text-fg-strong">
        Still to come in your story
      </h3>
      <ol className="flex flex-col">
        {firsts.map((f) => (
          <li key={f.key} className="flex items-baseline gap-3 py-1">
            <span className="w-20 shrink-0 text-sm text-fg-subtle tabular-nums">
              Wk {f.weeks[0]}–{f.weeks[1]}
            </span>
            <span className="flex items-center gap-2 text-fg-normal">
              <Star aria-hidden size={14} className="text-fg-subtle" />
              {f.title}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
