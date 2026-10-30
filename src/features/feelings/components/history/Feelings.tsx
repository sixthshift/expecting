// How you're feeling, kept: the Journal's section. Check in again at any
// time; the last four weeks as rows of dots, a row each, the dot's strength
// the step (no line chart: a line going down reads as a grade); under your own
// row the words you used most; and a day's check-ins, your own with their
// words, which only you can change or delete.

import { Button } from "@sixthshift/design-system/button";
import { Card } from "@sixthshift/design-system/card";
import { toast } from "@sixthshift/design-system/overlay";
import { cn } from "@sixthshift/design-system/utils";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { feelingsSaves, useFeelings } from "../../../../api/rpc/feelings";
import { usePeople } from "../../../../api/rpc/people";
import { useSave } from "../../../../app/hooks/useSave";
import { addDays, formatDate, type ISODate, todayISO } from "../../../../lib/dates";
import { type Feeling, feelingsOf, isOwn, type OwnFeeling, STEP_LABEL, type Step, stepsByDay, wordsUsed } from "../../../../lib/feelings";
import { formatTime } from "../../../../lib/journal";
import { CheckInNow } from "../checkIn/CheckInNow";
import { Face } from "../Face";
import { MoreWords } from "../MoreWords";
import { StepPicker } from "../StepPicker";

/** How many days the dots look back. */
const DAYS = 28;

/** A dot's strength: the step, from faint to full, in the brand's colour. Never red or green. */
const STRENGTH: Record<Step, string> = { rough: "opacity-25", low: "opacity-45", okay: "opacity-65", good: "opacity-85", great: "opacity-100" };

function dayLabel(day: ISODate, today: ISODate): string {
  return day === today ? "Today" : formatDate(day, { weekday: "short", day: "numeric", month: "short" });
}

export function FeelingsSection() {
  const { data: people } = usePeople();
  const { data: feelings } = useFeelings();
  const today = todayISO();
  const [day, setDay] = useState<ISODate>(today);
  const me = people.me;
  const mine = me ? feelingsOf(feelings.filter(isOwn), me.id) : [];
  const words = wordsUsed(mine, addDays(today, 1 - DAYS)).slice(0, 5);
  // You first, then the other.
  const rows = [...people.people].sort((a, b) => Number(b.id === me?.id) - Number(a.id === me?.id));
  const onDay = feelings.filter((f) => f.day === day);

  return (
    <section aria-labelledby="feelings" className="flex max-w-2xl flex-col gap-4">
      <h2 id="feelings" className="text-lg font-display font-semibold text-fg-strong">
        How you're feeling
      </h2>

      {me ? (
        <Card size="sm">
          <CheckInNow me={me} onKept={() => setDay(today)} />
        </Card>
      ) : (
        <p className="text-sm text-fg-subtle">Say who's holding this phone, in Settings, to check in.</p>
      )}

      {feelings.length > 0 ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-fg-subtle">The last four weeks, a dot a day, fuller on better days. Tap a day to see it.</p>
          {rows.map((person) => {
            const steps = stepsByDay(feelings, person.id, today, DAYS);
            const own = person.id === me?.id;
            return (
              <div key={person.id} className="flex flex-col gap-1.5">
                <p className="text-sm font-medium text-fg-strong">{own ? "You" : person.name}</p>
                <fieldset className="grid grid-cols-14 gap-1" aria-label={own ? "Your last four weeks" : `${person.name}'s last four weeks`}>
                  {steps.map(({ day: d, step }) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDay(d)}
                      aria-label={`${dayLabel(d, today)}: ${step ? STEP_LABEL[step] : "no check-in"}`}
                      aria-pressed={d === day}
                      className={cn("flex aspect-square min-h-5 items-center justify-center rounded-md", d === day && "bg-bg-subtle ring-1 ring-border-strong")}
                    >
                      {step ? (
                        <span className={cn("size-3 rounded-full bg-fg-brand", STRENGTH[step])} />
                      ) : (
                        <span className="size-2 rounded-full border border-border-normal" />
                      )}
                    </button>
                  ))}
                </fieldset>
                {own && words.length > 0 ? (
                  <p className="text-xs text-fg-subtle">Your words: {words.map((w) => `${w.word}, ${w.days} ${w.days === 1 ? "day" : "days"}`).join(" · ")}</p>
                ) : null}
              </div>
            );
          })}

          <section aria-labelledby="feelings-day" className="flex flex-col gap-2">
            <h3 id="feelings-day" className="text-sm font-semibold text-fg-strong">
              {dayLabel(day, today)}
            </h3>
            {onDay.length === 0 ? <p className="text-sm text-fg-subtle">No check-ins that day.</p> : null}
            {feelingsOf(onDay, me?.id ?? "")
              .concat(onDay.filter((f) => f.by !== me?.id))
              .map((f) => (
                <CheckedIn key={f.id} feeling={f} />
              ))}
          </section>
        </div>
      ) : null}
    </section>
  );
}

/** One check-in: whose, when and the step; your own with its words and what you wrote, to change or delete. */
function CheckedIn({ feeling }: { feeling: Feeling | OwnFeeling }) {
  const { data: people } = usePeople();
  const [editing, setEditing] = useState(false);
  const change = useSave(feelingsSaves.changeFeeling);
  const remove = useSave(feelingsSaves.deleteFeeling);
  const add = useSave(feelingsSaves.addFeeling);
  const who = feeling.by === people.me?.id ? "You" : (people.people.find((p) => p.id === feeling.by)?.name ?? "");
  const line = [who, feeling.time ? formatTime(feeling.time) : null].filter(Boolean).join(" · ");

  if (!isOwn(feeling)) {
    return (
      <div className="flex items-center gap-2 text-sm text-fg-normal">
        <span className="text-fg-subtle">
          <Face step={feeling.step} size={20} />
        </span>
        <span className="font-medium">{STEP_LABEL[feeling.step]}</span>
        <span className="text-xs text-fg-subtle">{line}</span>
      </div>
    );
  }

  function deleteIt(f: OwnFeeling) {
    remove({ id: f.id });
    // Undone by keeping it again, under the same id.
    toast({
      title: "Check-in deleted",
      action: "Undo",
      onAction: () => add({ id: f.id, day: f.day, time: f.time, step: f.step, words: f.words, note: f.note }),
    });
  }

  if (editing) {
    return (
      <Card size="sm">
        <div className="flex flex-col gap-3">
          <StepPicker
            label="How were you?"
            value={feeling.step}
            onChoose={(step) => change({ id: feeling.id, day: feeling.day, time: feeling.time, step, words: feeling.words, note: feeling.note })}
          />
          <MoreWords
            feeling={feeling}
            onDone={(more) => {
              change({ id: feeling.id, day: feeling.day, time: feeling.time, step: feeling.step, ...more });
              setEditing(false);
            }}
          />
        </div>
      </Card>
    );
  }

  return (
    <Card size="sm">
      <div className="flex items-center gap-2 text-sm text-fg-normal">
        <span className="text-fg-brand">
          <Face step={feeling.step} size={20} />
        </span>
        <span className="font-medium">{STEP_LABEL[feeling.step]}</span>
        <span className="flex-1 text-xs text-fg-subtle">{line}</span>
        <Button variant="ghost" size="sm" iconOnly aria-label="Change this check-in" onClick={() => setEditing(true)}>
          <Pencil aria-hidden size={16} />
        </Button>
        <Button variant="ghost" size="sm" iconOnly aria-label="Delete this check-in" onClick={() => deleteIt(feeling)}>
          <Trash2 aria-hidden size={16} />
        </Button>
      </div>
      {feeling.words.length > 0 ? <p className="mt-1 text-sm text-fg-normal">{feeling.words.join(", ")}</p> : null}
      {feeling.note ? <p className="mt-1 whitespace-pre-wrap text-sm text-fg-normal">{feeling.note}</p> : null}
    </Card>
  );
}
