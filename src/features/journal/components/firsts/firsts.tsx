// The firsts: marked on their day by either of you, each with its question
// answered in your own words, side by side. Suggested from what's kept only
// as a question to confirm, with a day you can move, or put aside: a first
// is yours to claim. See docs/plan-journal.md.

import { Button } from "@sixthshift/design-system/button";
import { Card } from "@sixthshift/design-system/card";
import { DatePicker } from "@sixthshift/design-system/date-picker";
import { FormField } from "@sixthshift/design-system/form-field";
import { Modal } from "@sixthshift/design-system/modal";
import { Textarea } from "@sixthshift/design-system/textarea";
import { Star } from "lucide-react";
import { useState } from "react";
import { firstsSaves, useFirsts } from "../../../../api/rpc/firsts";
import { usePeople } from "../../../../api/rpc/people";
import { useSettings } from "../../../../api/rpc/settings";
import { useSave } from "../../../../app/hooks/useSave";
import { formatDate, type ISODate, todayISO } from "../../../../lib/dates";
import { type FirstKey, type FirstMark, firstOf, firstsOffered, isMarked, type Suggestion } from "../../../../lib/firsts";

/** "Tue 14 Jul". */
function dayOf(day: string): string {
  return formatDate(day as ISODate, { weekday: "short", day: "numeric", month: "short" });
}

/** A first's question, and each of you's words: yours to write (with someone holding the phone), the other's to read. */
export function FirstWords({ mark, onDone }: { mark: FirstMark & { day: string }; onDone?: () => void }) {
  const { data: people } = usePeople();
  const setWords = useSave(firstsSaves.setFirstWords);
  const me = people.me;
  const mine = mark.words.find((w) => w.by === me?.id)?.body ?? "";
  const [body, setBody] = useState(mine);
  const theirs = mark.words.filter((w) => w.by !== me?.id);
  const name = (id: string) => people.people.find((p) => p.id === id)?.name ?? "One of you";
  const { question } = firstOf(mark.key);

  return (
    <div className="flex flex-col gap-3">
      <p className="font-medium text-fg-strong">{question}</p>
      {theirs.map((w) => (
        <blockquote key={w.by} className="border-l-2 border-border-brand pl-3">
          <p className="whitespace-pre-wrap text-fg-normal">{w.body}</p>
          <footer className="text-xs text-fg-subtle">{name(w.by)}</footer>
        </blockquote>
      ))}
      {me ? (
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setWords({ key: mark.key, body });
            onDone?.();
          }}
        >
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} aria-label={`Your words: ${question}`} autosize rows={2} maxLength={10_000} />
          <div className="flex gap-2">
            <Button type="submit" intent="brand" size="sm">
              {mine ? "Save" : "Keep your words"}
            </Button>
            {onDone ? (
              <Button type="button" variant="ghost" size="sm" onClick={onDone}>
                Not now
              </Button>
            ) : null}
          </div>
        </form>
      ) : (
        <p className="text-sm text-fg-subtle">Say who's holding this phone, in Settings, to answer in your own words.</p>
      )}
    </div>
  );
}

/** A day, today at the latest. */
export function DayField({ value, onChange }: { value: ISODate; onChange: (day: ISODate) => void }) {
  const today = todayISO();
  return (
    <FormField label="When">
      <DatePicker
        value={value}
        onChange={(d) => onChange((d as ISODate | undefined) ?? today)}
        segmentOrder="dmy"
        weekStartsOn={1}
        clearable={false}
        maxDate={today}
      />
    </FormField>
  );
}

/**
 * Mark a first: which (those not yet marked, in their order), when (today
 * unless changed), then its question. `onAdded` once done, with its key.
 */
export function MarkFirst({ onAdded }: { onAdded?: (key: FirstKey) => void }) {
  const { data: firsts } = useFirsts();
  const { data: settings } = useSettings();
  const mark = useSave(firstsSaves.markFirst);
  const [chosen, setChosen] = useState<FirstKey | null>(null);
  const [day, setDay] = useState<ISODate>(todayISO());
  const [marked, setMarked] = useState<FirstKey | null>(null);
  const kept = firsts.find((f) => f.key === marked);
  const left = firstsOffered(settings.baby !== "unknown").filter((f) => !firsts.some((m) => m.key === f.key && isMarked(m)));

  if (kept && isMarked(kept)) return <FirstWords mark={kept} onDone={() => onAdded?.(kept.key)} />;

  if (chosen) {
    return (
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          mark({ key: chosen, day });
          setMarked(chosen);
        }}
      >
        <p className="font-medium text-fg-strong">{firstOf(chosen).title}</p>
        <DayField value={day} onChange={setDay} />
        <div className="flex gap-2">
          <Button type="submit" intent="brand">
            Mark it
          </Button>
          <Button type="button" variant="ghost" onClick={() => setChosen(null)}>
            Another
          </Button>
        </div>
      </form>
    );
  }

  if (left.length === 0) return <p className="text-sm text-fg-subtle">Every first is marked.</p>;
  return (
    <ul className="flex flex-col gap-1" aria-label="Which first">
      {left.map((f) => (
        <li key={f.key}>
          <button
            type="button"
            onClick={() => setChosen(f.key)}
            className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-left text-fg-normal hover:bg-bg-normal-hovered"
          >
            <Star aria-hidden size={18} className="text-fg-brand" />
            {f.title}
          </button>
        </li>
      ))}
    </ul>
  );
}

/** A marked first, opened: its day to move, both your words, and a way to take it off. */
export function FirstSheet({ mark, onClose }: { mark: FirstMark & { day: string }; onClose: () => void }) {
  const move = useSave(firstsSaves.markFirst);
  const unmark = useSave(firstsSaves.unmarkFirst);
  return (
    <Modal size="sm" align="top" closable onOpenChange={(open) => (open ? null : onClose())} aria-label={firstOf(mark.key).title}>
      <Modal.Header>
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-fg-strong">
          <Star aria-hidden size={18} className="text-fg-brand" />
          {firstOf(mark.key).title}
        </h2>
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-4 px-6 pb-6">
        <DayField value={mark.day as ISODate} onChange={(day) => move({ key: mark.key, day })} />
        <FirstWords mark={mark} />
        <Button
          variant="ghost"
          size="sm"
          className="self-start text-fg-subtle"
          onClick={() => {
            unmark({ key: mark.key });
            onClose();
          }}
        >
          Take it off
        </Button>
      </Modal.Body>
    </Modal>
  );
}

/** A first in the story: a star, what, when, and the first words kept for it. Opened to change. */
export function FirstLine({ mark }: { mark: FirstMark & { day: string } }) {
  const [open, setOpen] = useState(false);
  const words = mark.words[0]?.body;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-start gap-3 rounded-md px-2 py-2 text-left hover:bg-bg-normal-hovered focus-visible:ring-2 focus-visible:ring-border-focus"
      >
        <Star aria-hidden size={18} className="mt-0.5 shrink-0 fill-current text-fg-brand" />
        <span className="flex flex-col">
          <span className="font-medium text-fg-strong">{firstOf(mark.key).title}</span>
          {words ? (
            <span className="line-clamp-2 text-sm text-fg-normal">{words}</span>
          ) : (
            <span className="text-sm text-fg-subtle">{firstOf(mark.key).question}</span>
          )}
        </span>
      </button>
      {open ? <FirstSheet mark={mark} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

/**
 * A first suggested by what's kept: was this it? Yes marks it on that day,
 * Another day lets you say when, Not this puts it aside for good. Once
 * marked, its question.
 */
export function SuggestedFirst({ suggestion }: { suggestion: Suggestion }) {
  const { data: firsts } = useFirsts();
  const mark = useSave(firstsSaves.markFirst);
  const aside = useSave(firstsSaves.setFirstAside);
  const [choosing, setChoosing] = useState(false);
  const [day, setDay] = useState<ISODate>(suggestion.day);
  const [done, setDone] = useState(false);
  const kept = firsts.find((f) => f.key === suggestion.key);
  const { title } = firstOf(suggestion.key);

  if (done) return null;
  if (kept && isMarked(kept)) {
    return (
      <Card size="sm" className="flex flex-col gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-fg-strong">
          <Star aria-hidden size={16} className="fill-current text-fg-brand" /> {title}, {dayOf(kept.day)}
        </p>
        <FirstWords mark={kept} onDone={() => setDone(true)} />
      </Card>
    );
  }
  return (
    <Card size="sm" className="flex flex-col gap-3">
      <p className="text-sm text-fg-normal">
        {suggestion.why}, {dayOf(suggestion.day)}.
      </p>
      <p className="flex items-center gap-2 font-medium text-fg-strong">
        <Star aria-hidden size={16} className="text-fg-brand" /> {title}?
      </p>
      {choosing ? <DayField value={day} onChange={setDay} /> : null}
      <div className="flex flex-wrap gap-2">
        <Button intent="brand" size="sm" onClick={() => mark({ key: suggestion.key, day })}>
          {choosing ? "Mark it" : "Yes, mark it"}
        </Button>
        {choosing ? null : (
          <Button variant="outline" size="sm" onClick={() => setChoosing(true)}>
            Another day
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={() => aside({ key: suggestion.key })}>
          Not this
        </Button>
      </div>
    </Card>
  );
}

/** The Firsts lens: every one marked, in the order they came, and a way to mark another. */
export function FirstsLens() {
  const { data: firsts } = useFirsts();
  const [marking, setMarking] = useState(false);
  const marked = firsts.filter(isMarked).sort((a, b) => a.day.localeCompare(b.day));
  return (
    <section aria-labelledby="firsts" className="flex max-w-2xl flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 id="firsts" className="font-display text-lg font-semibold text-fg-strong">
          Firsts
        </h2>
        <Button variant="outline" size="sm" onClick={() => setMarking(true)}>
          Mark a first
        </Button>
      </div>
      <ol className="flex flex-col">
        {marked.map((m) => (
          <li key={m.key} className="flex items-start gap-3">
            <span className="w-20 shrink-0 pt-2 text-xs text-fg-subtle">{dayOf(m.day)}</span>
            <span className="flex-1">
              <FirstLine mark={m} />
            </span>
          </li>
        ))}
      </ol>
      {marking ? (
        <Modal size="sm" align="top" closable onOpenChange={(open) => (open ? null : setMarking(false))} aria-label="Mark a first">
          <Modal.Header>
            <h2 className="font-display text-lg font-semibold text-fg-strong">Mark a first</h2>
          </Modal.Header>
          <Modal.Body className="px-6 pb-6">
            <MarkFirst onAdded={() => setMarking(false)} />
          </Modal.Body>
        </Modal>
      ) : null}
    </section>
  );
}
