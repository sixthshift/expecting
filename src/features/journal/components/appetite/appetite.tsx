// Sickness and cravings in the Journal: being sick, a craving, or something
// gone off, kept by either of you in a tap or two. Shown back so you can
// answer the midwife's "since when?" (the weeks as rows of days), and for fun
// later (what you craved, how often). Never a score and never advice about
// her body: can't keep fluids down is a call, as `severe-vomiting` says, and
// craving things that aren't food is worth mentioning, as
// `food-cravings-and-aversions` says. See docs/plan-cravings-sickness.md.

import { Button } from "@sixthshift/design-system/button";
import { Card } from "@sixthshift/design-system/card";
import { DatePicker } from "@sixthshift/design-system/date-picker";
import type { ISOTime } from "@sixthshift/design-system/date-time";
import { FormField } from "@sixthshift/design-system/form-field";
import { Input } from "@sixthshift/design-system/input";
import { toast } from "@sixthshift/design-system/overlay";
import { TimePicker } from "@sixthshift/design-system/time-picker";
import { ToggleGroup } from "@sixthshift/design-system/toggle-group";
import { cn } from "@sixthshift/design-system/utils";
import { Link } from "@tanstack/react-router";
import { Check, MessageCircleQuestion, Pencil, Plus, Trash2 } from "lucide-react";
import { type FormEvent, useId, useState } from "react";
import { appetiteSaves, useAppetite } from "../../../../api/rpc/appetite";
import { usePeople } from "../../../../api/rpc/people";
import { questionsSaves, useQuestions } from "../../../../api/rpc/questions";
import { useSettings } from "../../../../api/rpc/settings";
import { CallBirthSuite } from "../../../../app/components/layout/CallBirthSuite";
import { useSave } from "../../../../app/hooks/useSave";
import {
  type AppetiteEntry,
  type AppetiteKind,
  cravingChips,
  describe,
  HOW_LABEL,
  HOWS,
  type How,
  inputOf,
  latestFirst,
  notFood,
  notFoodQuestion,
  OFTEN,
  oftenQuestion,
  type SickWeek,
  sicknessSince,
  sicknessWeeks,
  sickOften,
  type Tally,
  tally,
} from "../../../../lib/appetite";
import { formatDate, type ISODate, todayISO } from "../../../../lib/dates";
import { placeOf, timeNow, toTime } from "../../../../lib/journal";
import { newId } from "../../../../lib/outbox";
import { weekLabel } from "../../../../lib/timeline";
import { ItemLink } from "../../../library/components/ItemLink";
import { when } from "../notes/notes";

/** The entries whose words this follows, each checked against its source. */
const SEVERE = "severe-vomiting";
const CRAVINGS = "food-cravings-and-aversions";

/** A day's strength, worst fullest, in the brand's colour: never red. Can't keep fluids down is also ringed. */
const STRENGTH: Record<How, string> = {
  queasy: "opacity-35",
  vomited: "opacity-75",
  fluids: "opacity-100 ring-2 ring-fg-brand ring-offset-1 ring-offset-bg-normal",
};

/** What a sickness tap says under it, so the three are told apart at 3 am. */
const HOW_HINT: Record<How, string> = { queasy: "Nausea", vomited: "Vomited", fluids: "Even water comes up" };

/** "8 Sep", or "8 Sep 2025" in another year. */
function shortDate(day: ISODate, today: ISODate): string {
  return formatDate(day, { day: "numeric", month: "short", ...(day.slice(0, 4) === today.slice(0, 4) ? {} : { year: "numeric" }) });
}

/** "Tue 8 Sep, week 6": a day, and its week when there's a due date. */
function dayAndWeek(day: ISODate, dueDate: ISODate | null): string {
  const date = formatDate(day, { weekday: "short", day: "numeric", month: "short" });
  const place = dueDate ? placeOf(day, dueDate) : null;
  return typeof place === "number" ? `${date}, ${weekLabel(place).toLowerCase()}` : date;
}

/**
 * Can't keep fluids down: call now, from `severe-vomiting`'s checked words.
 * The birth suite's number if it's set, and Emergency info, where the
 * midwife's and the GP's are too. Never "probably fine".
 */
export function TooSick() {
  return (
    <div role="alert" className="flex flex-col gap-2 rounded-lg border border-border-warning bg-bg-warning-subtle p-4">
      <p className="font-semibold text-fg-strong">Call your doctor, midwife or hospital now.</p>
      <p className="text-sm text-fg-normal">
        If you can't keep fluids down at all, go to your local emergency department: they can give you fluids through a drip. There is treatment, and you
        deserve to be heard.
      </p>
      <div className="flex flex-col">
        <CallBirthSuite layout="button" />
        <Link to="/emergency" className="flex min-h-11 items-center text-sm text-fg-normal underline">
          Every number, in Emergency info
        </Link>
        <ItemLink itemId={SEVERE} className="flex min-h-11 items-center text-sm text-fg-normal underline">
          When sickness is more than morning sickness
        </ItemLink>
      </div>
    </div>
  );
}

/** A question for the next appointment, added to the Planner's list in one tap; once there, it says so. */
export function AskAtAppointment({ text }: { text: string }) {
  const { data: questions } = useQuestions();
  const add = useSave(questionsSaves.addQuestion);
  const onList = questions.some((q) => q.askedAt === null && q.text === text);

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border-subtle bg-bg-normal p-3">
      <MessageCircleQuestion aria-hidden size={18} className="mt-0.5 shrink-0 text-fg-brand" />
      <p className="flex-1 text-sm text-fg-normal">{text}</p>
      {onList ? (
        <span className="flex shrink-0 items-center gap-1 text-xs text-fg-subtle">
          <Check aria-hidden size={14} /> On your list
        </span>
      ) : (
        <Button variant="outline" size="sm" onClick={() => add({ id: newId(), text })} aria-label={`Add to your questions: ${text}`}>
          <Plus aria-hidden size={14} /> Ask
        </Button>
      )}
    </div>
  );
}

/** Craving something that isn't food: worth mentioning, as `food-cravings-and-aversions` says. Quiet: not an alert and not a call. */
export function NotFood({ what }: { what: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-bg-subtle p-3 text-sm">
      <p className="text-fg-normal">
        Craving things that aren't food, like ice, chalk or clay, is worth mentioning to your midwife or doctor: it's been linked to low iron.
      </p>
      <AskAtAppointment text={notFoodQuestion(what)} />
      <ItemLink itemId={CRAVINGS} className="flex min-h-11 items-center text-fg-normal underline">
        About cravings
      </ItemLink>
    </div>
  );
}

/** Queasy, threw up, can't keep fluids down: three large taps, worst last. */
function HowPicker({ value, onChoose }: { value: How | null; onChoose: (how: How) => void }) {
  const name = useId();
  return (
    <fieldset className="grid grid-cols-3 gap-2">
      <legend className="sr-only">How bad?</legend>
      {HOWS.map((how) => {
        const chosen = how === value;
        return (
          <label
            key={how}
            className={cn(
              "flex min-h-16 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border px-2 py-2 text-center text-sm transition-colors has-focus-visible:outline-2 has-focus-visible:outline-(--focus-ring)",
              chosen ? "border-border-brand bg-bg-brand-subtle font-medium text-fg-on-brand-subtle" : "border-border-subtle text-fg-normal hover:bg-bg-subtle"
            )}
          >
            <input type="radio" name={name} value={how} checked={chosen} onChange={() => onChoose(how)} className="sr-only" />
            <span>{HOW_LABEL[how]}</span>
            <span className="text-xs font-normal text-fg-subtle">{HOW_HINT[how]}</span>
          </label>
        );
      })}
    </fieldset>
  );
}

/** A day and a time, for one kept after the fact. */
function WhenFields({ day, time, onDay, onTime }: { day: ISODate; time: string; onDay: (d: ISODate) => void; onTime: (t: string) => void }) {
  const today = todayISO();
  return (
    <div className="flex flex-wrap gap-3">
      <FormField label="Day">
        <DatePicker value={day} onChange={(d) => (d ? onDay(d as ISODate) : null)} segmentOrder="dmy" weekStartsOn={1} clearable={false} maxDate={today} />
      </FormField>
      <FormField label="Time">
        <TimePicker value={time as ISOTime} onChange={(t) => onTime(toTime(t) ?? time)} clockFormat="12h" />
      </FormField>
    </div>
  );
}

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
  const { data: entries } = useAppetite();
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

const KIND_OPTIONS = [
  { value: "craving", label: "Craving" },
  { value: "off", label: "Gone off" },
];

/**
 * A craving, or something gone off: what, then Keep. What's been craved
 * before is a chip under the box, so the second pickle is one tap. A craving
 * for something that isn't food keeps the quiet word about it on screen
 * until Done.
 */
export function AddCraving({ onAdded }: { onAdded?: (id: string) => void }) {
  const { data: entries } = useAppetite();
  const add = useSave(appetiteSaves.addAppetite);
  const [kind, setKind] = useState<"craving" | "off">("craving");
  const [what, setWhat] = useState("");
  // A craving for something that isn't food, just kept: the word about it, until Done.
  const [notFoodKept, setNotFoodKept] = useState<{ id: string; what: string } | null>(null);
  const chips = cravingChips(entries, kind);

  function keep(text: string) {
    if (text.trim().length === 0) return;
    const id = newId();
    add({ id, kind, day: todayISO(), time: timeNow(), how: null, what: text, note: null });
    setWhat("");
    if (kind === "craving" && notFood(text)) setNotFoodKept({ id, what: text.trim() });
    else onAdded?.(id);
  }

  if (notFoodKept) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-fg-normal">Kept: {notFoodKept.what}.</p>
        <NotFood what={notFoodKept.what} />
        <Button
          variant="outline"
          onClick={() => {
            setNotFoodKept(null);
            onAdded?.(notFoodKept.id);
          }}
        >
          Done
        </Button>
      </div>
    );
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    keep(what);
  }

  const label = kind === "craving" ? "What are you craving?" : "What have you gone off?";
  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <ToggleGroup
        type="single"
        appearance="segmented"
        size="sm"
        variant="outline"
        intent="brand"
        aria-label="Craving or gone off"
        className="self-start"
        value={kind}
        onValueChange={(value) => setKind(value as "craving" | "off")}
        options={KIND_OPTIONS}
      />
      <Input
        value={what}
        onChange={(e) => setWhat(e.target.value)}
        placeholder={kind === "craving" ? "Pickles, ice, hot chips…" : "Coffee, onions…"}
        aria-label={label}
        maxLength={200}
      />
      {chips.length > 0 ? (
        <div className="flex flex-col gap-1">
          <p className="text-xs text-fg-subtle">Again? One tap keeps it.</p>
          <ul className="flex flex-wrap gap-2">
            {chips.map((chip) => (
              <li key={chip}>
                <Button type="button" variant="outline" size="sm" onClick={() => keep(chip)} aria-label={`Keep ${chip.trim()} again`}>
                  {chip.trim()}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <Button type="submit" intent="brand" disabled={what.trim().length === 0} className="self-start">
        Keep it
      </Button>
    </form>
  );
}

/** A week's row label: "Week 9", "Before the pregnancy", or with no due date the days: "24–30 Oct". */
function weekName(w: SickWeek, today: ISODate): string {
  if (w.place === "before") return "Before";
  if (w.place === "after") return "After 42";
  if (typeof w.place === "number") return weekLabel(w.place);
  // "24–30 Oct", or "29 Sep – 5 Oct" across a month.
  return w.start.slice(0, 7) === w.end.slice(0, 7)
    ? `${Number(w.start.slice(8))}–${shortDate(w.end, today)}`
    : `${shortDate(w.start, today)} – ${shortDate(w.end, today)}`;
}

/** "Today, 3:10 am" mid-sentence: "today, 3:10 am"; a date stays as it is. */
function lastSaid(said: string): string {
  return said.startsWith("Today") ? `t${said.slice(1)}` : said;
}

/** How many weeks show before "Show every week". */
const WEEKS_SHOWN = 8;

/**
 * Sickness, since when: the first day and the last, then the weeks as rows,
 * newest first, a cell a day, each day's worst at its strength (never red).
 * How often, and whether it's easing, are shown, not said. Above them, if
 * she's been sick often lately, one quiet line and a question to take along.
 */
export function SicknessWeeks() {
  const { data: entries } = useAppetite();
  const { data: settings } = useSettings();
  const [all, setAll] = useState(false);
  const today = todayISO();
  const since = sicknessSince(entries);
  if (!since) return null;
  const weeks = sicknessWeeks(entries, today, settings.dueDate);
  const shown = all ? weeks : weeks.slice(0, WEEKS_SHOWN);
  const often = sickOften(entries, today);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-fg-normal">
        <span className="font-medium text-fg-strong">Since {dayAndWeek(since.first, settings.dueDate)}.</span> Last:{" "}
        {lastSaid(when(since.last.day, since.last.time))}, {HOW_LABEL[since.last.how ?? "queasy"].toLowerCase()}.
      </p>
      {often ? (
        <div className="flex flex-col gap-2 rounded-lg bg-bg-subtle p-3 text-sm">
          <p className="text-fg-normal">
            Threw up on {often} of the last {OFTEN.days} days. Being sick often is worth a call to your midwife or doctor: there is treatment.
          </p>
          <AskAtAppointment text={oftenQuestion(often, shortDate(since.first, today))} />
          <ItemLink itemId={SEVERE} className="flex min-h-11 items-center text-fg-normal underline">
            When sickness is more than morning sickness
          </ItemLink>
        </div>
      ) : null}
      <figure className="flex flex-col gap-1">
        <figcaption className="text-sm text-fg-subtle">
          Each week a row, a square a day: fuller the worse it was, ringed when fluids wouldn't stay down.
        </figcaption>
        <ol className="flex flex-col gap-1">
          {shown.map((w) => (
            <li key={w.start} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-xs text-fg-subtle">{weekName(w, today)}</span>
              <span className="sr-only">
                {w.sickDays === 0
                  ? "none kept"
                  : w.days
                      .filter((d) => d.worst)
                      .map((d) => `${formatDate(d.day, { weekday: "short", day: "numeric", month: "short" })}: ${HOW_LABEL[d.worst!].toLowerCase()}`)
                      .join("; ")}
              </span>
              <span aria-hidden className="grid flex-1 grid-cols-7 gap-1">
                {w.days.map((d) => (
                  <span key={d.day} className={cn("flex h-5 items-center justify-center rounded-sm", d.ahead ? "bg-transparent" : "bg-bg-subtle")}>
                    {d.worst ? <span className={cn("size-3 rounded-full bg-fg-brand", STRENGTH[d.worst])} /> : null}
                  </span>
                ))}
              </span>
              <span className="w-14 shrink-0 text-right text-xs text-fg-subtle">
                {w.sickDays === 0 ? "–" : w.sickDays === 1 ? "1 day" : `${w.sickDays} days`}
              </span>
            </li>
          ))}
        </ol>
      </figure>
      {weeks.length > shown.length ? (
        <Button variant="ghost" size="sm" className="self-start" onClick={() => setAll(true)}>
          Show every week
        </Button>
      ) : null}
    </div>
  );
}

/** "Pickles · 14 times · from week 14". */
function TallyList({ title, tallies, dueDate, times }: { title: string; tallies: Tally[]; dueDate: ISODate | null; times: boolean }) {
  const today = todayISO();
  if (tallies.length === 0) return null;
  const from = (day: ISODate) => {
    const place = dueDate ? placeOf(day, dueDate) : null;
    return typeof place === "number" ? `from ${weekLabel(place).toLowerCase()}` : `from ${shortDate(day, today)}`;
  };
  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-sm font-semibold text-fg-strong">{title}</h3>
      <ul className="flex flex-col">
        {tallies.map((t) => (
          <li key={t.what.trim().toLocaleLowerCase("en-AU")} className="flex items-baseline gap-2 py-1 text-sm">
            <span className="font-medium text-fg-strong">{t.what.trim()}</span>
            <span className="text-fg-subtle">{[times ? (t.times === 1 ? "once" : `${t.times} times`) : null, from(t.first)].filter(Boolean).join(" · ")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** What you've craved, most first, and what you've gone off: the fun part, for later. */
export function Cravings() {
  const { data: entries } = useAppetite();
  const { data: settings } = useSettings();
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:gap-12">
      <TallyList title="What you've craved" tallies={tally(entries, "craving")} dueDate={settings.dueDate} times />
      <TallyList title="Gone off" tallies={tally(entries, "off")} dueDate={settings.dueDate} times={false} />
    </div>
  );
}

/** Changing an entry: how bad, or what, a few words, and when. */
function EntryForm({ entry, onSave, onCancel }: { entry: AppetiteEntry; onSave: (changed: AppetiteEntry) => void; onCancel: () => void }) {
  const [how, setHow] = useState<How>(entry.how ?? "queasy");
  const [kind, setKind] = useState<AppetiteKind>(entry.kind);
  const [what, setWhat] = useState(entry.what ?? "");
  const [note, setNote] = useState(entry.note ?? "");
  const [day, setDay] = useState<ISODate>(entry.day as ISODate);
  const [time, setTime] = useState(entry.time ?? "12:00");
  const sick = kind === "sick";

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (!sick && what.trim().length === 0) return;
        onSave({ ...entry, kind, day, time, how: sick ? how : null, what: sick ? null : what, note: note.trim() || null });
      }}
    >
      {sick ? (
        <HowPicker value={how} onChoose={setHow} />
      ) : (
        <>
          <ToggleGroup
            type="single"
            appearance="segmented"
            size="sm"
            variant="outline"
            intent="brand"
            aria-label="Craving or gone off"
            className="self-start"
            value={kind}
            onValueChange={(value) => setKind(value as AppetiteKind)}
            options={KIND_OPTIONS}
          />
          <Input value={what} onChange={(e) => setWhat(e.target.value)} aria-label="What" maxLength={200} />
        </>
      )}
      <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="A few words, if you want" aria-label="About it" maxLength={10_000} />
      <WhenFields day={day} time={time} onDay={setDay} onTime={setTime} />
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" intent="brand" size="sm" disabled={!sick && what.trim().length === 0}>
          Save
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

/** One kept: what it was, its words, who kept it and when; changed or deleted by either of you. */
export function AppetiteItem({ entry }: { entry: AppetiteEntry }) {
  const [editing, setEditing] = useState(false);
  // Changed to can't keep fluids down: the call, as when it's first kept, until put away.
  const [tooSick, setTooSick] = useState(false);
  const edit = useSave(appetiteSaves.editAppetite);
  const remove = useSave(appetiteSaves.deleteAppetite);
  const restore = useSave(appetiteSaves.restoreAppetite);
  const { data: people } = usePeople();
  const name = (id: string | null) => (id === null ? null : id === people.me?.id ? "You" : (people.people.find((p) => p.id === id)?.name ?? null));

  function deleteIt() {
    remove({ id: entry.id });
    toast({ title: "Deleted", action: "Undo", onAction: () => restore(entry) });
  }

  if (editing) {
    return (
      <Card size="sm">
        <EntryForm
          entry={entry}
          onSave={(changed) => {
            edit(inputOf(changed));
            setEditing(false);
            if (changed.how === "fluids" && entry.how !== "fluids") setTooSick(true);
          }}
          onCancel={() => setEditing(false)}
        />
      </Card>
    );
  }

  if (tooSick) {
    return (
      <div className="flex flex-col gap-3">
        <TooSick />
        <Button variant="outline" onClick={() => setTooSick(false)}>
          Done
        </Button>
      </div>
    );
  }

  return (
    <Card size="sm">
      <p className="font-medium text-fg-strong">{describe(entry)}</p>
      {entry.note ? <p className="mt-1 whitespace-pre-wrap">{entry.note}</p> : null}
      <div className="mt-2 flex items-center gap-1 text-xs text-fg-subtle">
        <span className="flex-1">{[name(entry.by), when(entry.day, entry.time)].filter(Boolean).join(" · ")}</span>
        <Button variant="ghost" size="sm" iconOnly aria-label="Change this" onClick={() => setEditing(true)}>
          <Pencil aria-hidden size={16} />
        </Button>
        <Button variant="ghost" size="sm" iconOnly aria-label="Delete this" onClick={deleteIt}>
          <Trash2 aria-hidden size={16} />
        </Button>
      </div>
    </Card>
  );
}

/** How many entries are listed before "Show all". */
const LISTED = 8;

/**
 * The Journal's Sickness & cravings lens: sickness since when as weeks of
 * days, what's been craved and gone off, then each entry. New ones come in
 * through the "+"; the lens is there only once one is kept, and never while
 * something has happened (the Journal folds them away then).
 */
export function AppetiteLens() {
  const { data: entries } = useAppetite();
  const [all, setAll] = useState(false);
  const listed = latestFirst(entries);
  const shown = all ? listed : listed.slice(0, LISTED);

  return (
    <section aria-labelledby="appetite" className="flex max-w-2xl flex-col gap-4">
      <h2 id="appetite" className="text-lg font-display font-semibold text-fg-strong">
        Sickness and cravings
      </h2>
      <p className="text-sm text-fg-subtle">When it comes and what you crave, so you can answer “since when?”, and laugh about it later.</p>
      <SicknessWeeks />
      <Cravings />
      {shown.map((entry) => (
        <AppetiteItem key={entry.id} entry={entry} />
      ))}
      {listed.length > shown.length ? (
        <Button variant="ghost" size="sm" className="self-start" onClick={() => setAll(true)}>
          Show all {listed.length}
        </Button>
      ) : null}
    </section>
  );
}
