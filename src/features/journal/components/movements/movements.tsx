// Movements in the Journal: when you felt the baby move, so you get to know
// their own pattern. Australian advice is to know the pattern, not to count
// kicks, so nothing here counts, scores or reassures. A movement felt as
// slower, weaker or stopped leads straight to the call, as `baby-movements`
// says: straight away, not tomorrow.

import { Button } from "@sixthshift/design-system/button";
import { Card } from "@sixthshift/design-system/card";
import { Checkbox } from "@sixthshift/design-system/checkbox";
import { DatePicker } from "@sixthshift/design-system/date-picker";
import type { ISOTime } from "@sixthshift/design-system/date-time";
import { FormField } from "@sixthshift/design-system/form-field";
import { Input } from "@sixthshift/design-system/input";
import { toast } from "@sixthshift/design-system/overlay";
import { TimePicker } from "@sixthshift/design-system/time-picker";
import { cn } from "@sixthshift/design-system/utils";
import { Link } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { journalSaves, useJournal } from "../../../../api/rpc/journal";
import { usePeople } from "../../../../api/rpc/people";
import { CallBirthSuite } from "../../../../app/components/layout/CallBirthSuite";
import { useSave } from "../../../../app/hooks/useSave";
import { formatDate, type ISODate, todayISO } from "../../../../lib/dates";
import { dayFraction, formatTime, type JournalEntry, movementPattern, newestFirst, PATTERN_DAYS, timeNow, toTime } from "../../../../lib/journal";
import { newId } from "../../../../lib/outbox";
import { ItemLink } from "../../../library/components/ItemLink";
import { when } from "../notes/notes";

type Draft = { day: ISODate; time: string; body: string; different: boolean };

/** The entry whose advice this follows, checked against Safer Baby. */
const ADVICE_ITEM = "baby-movements";

/** A movement: now unless you say otherwise, a few words if you want, and whether it felt different. */
function MovementForm({
  initial,
  submitLabel,
  onSave,
  onCancel,
}: {
  initial?: Draft;
  submitLabel: string;
  onSave: (draft: Draft) => void;
  onCancel?: () => void;
}) {
  const [body, setBody] = useState(initial?.body ?? "");
  const [different, setDifferent] = useState(initial?.different ?? false);
  // A new movement is now unless its day or time is changed; it's "now" as it's kept, not as the form opened.
  const [day, setDay] = useState<ISODate | null>(initial?.day ?? null);
  const [time, setTime] = useState<string | null>(initial?.time ?? null);
  const [choosing, setChoosing] = useState(Boolean(initial));
  const today = todayISO();

  function submit(event: FormEvent) {
    event.preventDefault();
    onSave({ day: choosing ? (day ?? today) : today, time: choosing ? (time ?? timeNow()) : timeNow(), body, different });
    if (!initial) {
      setBody("");
      setDifferent(false);
      setChoosing(false);
      setDay(null);
      setTime(null);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <Input value={body} onChange={(e) => setBody(e.target.value)} placeholder="A few words, if you want" aria-label="About the movement" maxLength={10_000} />
      {choosing ? (
        <div className="flex flex-wrap gap-3">
          <FormField label="Day">
            <DatePicker
              value={day ?? today}
              onChange={(d) => setDay((d as ISODate | undefined) ?? null)}
              segmentOrder="dmy"
              weekStartsOn={1}
              clearable={false}
              maxDate={today}
            />
          </FormField>
          <FormField label="Time">
            <TimePicker value={(time ?? undefined) as ISOTime | undefined} onChange={(t) => setTime(toTime(t))} clockFormat="12h" />
          </FormField>
        </div>
      ) : null}
      <Checkbox checked={different} onCheckedChange={setDifferent} label="Slower, weaker or stopped?" />
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" intent="brand" size={initial ? "sm" : "md"}>
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        {!choosing ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setDay(today);
              setTime(timeNow());
              setChoosing(true);
            }}
          >
            Today, now · Change
          </Button>
        ) : null}
      </div>
    </form>
  );
}

/**
 * A movement felt as slower, weaker or stopped: call now. Never "probably
 * fine". The birth suite's number if it's set, and Emergency info, where
 * the midwife's is too.
 */
export function MovementsChanged() {
  return (
    <div role="alert" className="flex flex-col gap-2 rounded-lg border border-border-warning bg-bg-warning-subtle p-4">
      <p className="font-semibold text-fg-strong">Call your midwife or birth unit now.</p>
      <p className="text-sm text-fg-normal">
        If your baby's movements slow down, weaken or stop, contact them straight away, not tomorrow. You are not wasting their time.
      </p>
      <div className="flex flex-col">
        <CallBirthSuite layout="button" />
        <Link to="/emergency" className="flex min-h-11 items-center text-sm text-fg-normal underline">
          Every number, in Emergency info
        </Link>
        <ItemLink itemId={ADVICE_ITEM} className="flex min-h-11 items-center text-sm text-fg-normal underline">
          Why movements matter
        </ItemLink>
      </div>
    </div>
  );
}

/**
 * A new movement. `onAdded` once it's kept (the capture sheet closes); one
 * felt as different keeps the call on screen until it's put away, so it
 * never closes on its own.
 */
export function AddMovement({ onAdded }: { onAdded?: () => void }) {
  const add = useSave(journalSaves.addMovement);
  const [changed, setChanged] = useState(false);

  if (changed) {
    return (
      <div className="flex flex-col gap-3">
        <MovementsChanged />
        <Button
          variant="outline"
          onClick={() => {
            setChanged(false);
            onAdded?.();
          }}
        >
          Done
        </Button>
      </div>
    );
  }

  return (
    <MovementForm
      submitLabel="Keep it"
      onSave={(draft) => {
        add({ id: newId(), ...draft });
        if (draft.different) setChanged(true);
        else onAdded?.();
      }}
    />
  );
}

/** A movement: when, its words if any, whether it felt different, and who felt it. */
export function Movement({ entry }: { entry: JournalEntry }) {
  const [editing, setEditing] = useState(false);
  // Changed to slower, weaker or stopped: the call, as when it's first kept, until put away.
  const [changed, setChanged] = useState(false);
  const edit = useSave(journalSaves.editMovement);
  const remove = useSave(journalSaves.deleteMovement);
  const restore = useSave(journalSaves.restoreMovement);
  const { data: people } = usePeople();
  const name = (id: string | null) => (id === null ? null : id === people.me?.id ? "You" : (people.people.find((p) => p.id === id)?.name ?? null));
  const time = entry.time ?? "00:00";

  function deleteIt() {
    remove({ id: entry.id });
    toast({ title: "Movement deleted", action: "Undo", onAction: () => restore({ ...entry, time }) });
  }

  if (editing) {
    return (
      <Card size="sm">
        <MovementForm
          initial={{ day: entry.day as ISODate, time, body: entry.body, different: entry.different }}
          submitLabel="Save"
          onSave={(draft) => {
            edit({ id: entry.id, ...draft });
            setEditing(false);
            if (draft.different && !entry.different) setChanged(true);
          }}
          onCancel={() => setEditing(false)}
        />
      </Card>
    );
  }

  if (changed) {
    return (
      <div className="flex flex-col gap-3">
        <MovementsChanged />
        <Button variant="outline" onClick={() => setChanged(false)}>
          Done
        </Button>
      </div>
    );
  }

  return (
    <Card size="sm">
      <p className="font-medium text-fg-strong">
        The baby moved
        {entry.different ? <span className="font-normal text-fg-normal"> · slower, weaker or stopped</span> : null}
      </p>
      {entry.body ? <p className="mt-1 whitespace-pre-wrap">{entry.body}</p> : null}
      <div className="mt-2 flex items-center gap-1 text-xs text-fg-subtle">
        <span className="flex-1">{[name(entry.by), when(entry.day, entry.time)].filter(Boolean).join(" · ")}</span>
        <Button variant="ghost" size="sm" iconOnly aria-label="Change this movement" onClick={() => setEditing(true)}>
          <Pencil aria-hidden size={16} />
        </Button>
        <Button variant="ghost" size="sm" iconOnly aria-label="Delete this movement" onClick={deleteIt}>
          <Trash2 aria-hidden size={16} />
        </Button>
      </div>
    </Card>
  );
}

/** "Today", "Tue 27 Oct". */
function dayLabel(day: ISODate, today: ISODate): string {
  return day === today ? "Today" : formatDate(day, { weekday: "short", day: "numeric", month: "short" });
}

/**
 * The last fortnight's movements, a row a day, each a dot at its time of
 * day, so the baby's rhythm shows. No totals and no line for what's usual;
 * one felt as different is ringed, never red.
 */
export function MovementPattern() {
  const { data: journal } = useJournal();
  const today = todayISO();
  const days = movementPattern(journal, today);
  if (days.length === 0) return null;

  return (
    <figure className="flex flex-col gap-1">
      <figcaption className="text-sm text-fg-subtle">The last {PATTERN_DAYS / 7} weeks, a dot for each movement kept, at its time of day.</figcaption>
      <ol className="flex flex-col gap-1">
        {days.map((d) => (
          <li key={d.day} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs text-fg-subtle">{dayLabel(d.day, today)}</span>
            <span className="sr-only">{d.moved.map((m) => formatTime(m.time) + (m.different ? ", slower, weaker or stopped" : "")).join("; ")}</span>
            <span aria-hidden className="relative h-4 flex-1 rounded-full bg-bg-subtle">
              {d.moved.map((m) => (
                <span
                  key={m.id}
                  style={{ left: `${dayFraction(m.time) * 100}%` }}
                  className={cn(
                    "absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full",
                    m.different ? "bg-bg-normal ring-2 ring-fg-brand" : "bg-fg-brand"
                  )}
                />
              ))}
            </span>
          </li>
        ))}
      </ol>
      <div aria-hidden className="flex gap-3 text-xs text-fg-subtle">
        <span className="w-24 shrink-0" />
        <span className="flex flex-1 justify-between">
          <span>Midnight</span>
          <span>Midday</span>
          <span>Midnight</span>
        </span>
      </div>
    </figure>
  );
}

/** How many movements are listed before "Show all". */
const LISTED = 8;

/**
 * The Journal's movements: a new one (from week 16, never while something
 * has happened), the pattern, then each, newest first. Not drawn until
 * they're offered or one is kept. While something has happened, what was
 * kept is folded away behind one quiet line, opened only when asked: never
 * the baby's last movements on every visit, and never deleted.
 */
export function MovementsSection({ offered, quiet }: { offered: boolean; quiet: boolean }) {
  const { data: journal } = useJournal();
  const [all, setAll] = useState(false);
  const [unfolded, setUnfolded] = useState(false);
  const movements = newestFirst(journal.filter((e) => e.kind === "movement"));
  if (!offered && movements.length === 0) return null;
  const listed = all ? movements : movements.slice(0, LISTED);

  if (quiet && !unfolded) {
    return (
      <Button variant="ghost" size="sm" className="self-start text-fg-subtle" onClick={() => setUnfolded(true)}>
        The movements you kept
      </Button>
    );
  }

  return (
    <section aria-labelledby="movements" className="flex max-w-2xl flex-col gap-4">
      <h2 id="movements" className="text-lg font-display font-semibold text-fg-strong">
        Movements
      </h2>
      {offered ? (
        <>
          <p className="text-sm text-fg-subtle">
            Get to know your baby's own pattern. There's no number to reach: what matters is a change. Either of you can keep one.
          </p>
          <Card size="sm">
            <AddMovement />
          </Card>
        </>
      ) : null}
      <MovementPattern />
      {listed.map((entry) => (
        <Movement key={entry.id} entry={entry} />
      ))}
      {movements.length > listed.length ? (
        <Button variant="ghost" size="sm" className="self-start" onClick={() => setAll(true)}>
          Show all {movements.length}
        </Button>
      ) : null}
    </section>
  );
}
