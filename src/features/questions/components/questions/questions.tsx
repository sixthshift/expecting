// Questions for the next appointment: the form and the open ones in the
// Planner, asked ones in the week they were asked, and the count waiting.
// Each says where it came from (a Library entry, linked) and whose it is.

import { Button } from "@sixthshift/design-system/button";
import { Card } from "@sixthshift/design-system/card";
import { Textarea } from "@sixthshift/design-system/textarea";
import { Link } from "@tanstack/react-router";
import { ChevronRight, MessageCircleQuestion, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { usePeople } from "../../../../api/rpc/people";
import { questionsSaves, useQuestions } from "../../../../api/rpc/questions";
import { useSave } from "../../../../app/hooks/useSave";
import { builtInItems } from "../../../../content";
import { formatDate, todayISO } from "../../../../lib/dates";
import { newId } from "../../../../lib/outbox";
import { whoseBy } from "../../../../lib/people";
import type { Question } from "../../../../lib/questions";
import { ItemLink } from "../../../library/components/ItemLink";

/** A question for the next appointment. `onAdded` once it's on the list (the capture sheet closes). */
export function AddQuestion({ onAdded }: { onAdded?: () => void }) {
  const [text, setText] = useState("");
  const add = useSave(questionsSaves.addQuestion);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (text.trim().length === 0) return;
    add({ id: newId(), text });
    setText("");
    onAdded?.();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What do you want to ask?"
        aria-label="New question"
        autosize
        rows={2}
        maxLength={1000}
      />
      <Button type="submit" intent="brand" disabled={text.trim().length === 0} className="self-start">
        Add question
      </Button>
    </form>
  );
}

export function OpenQuestion({ question }: { question: Question }) {
  const [answering, setAnswering] = useState(false);
  const [answer, setAnswer] = useState(question.answer ?? "");
  const markAsked = useSave(questionsSaves.markAsked);

  function save(event: FormEvent) {
    event.preventDefault();
    markAsked({ id: question.id, answer });
  }

  return (
    <Card size="sm">
      <div className="flex items-start gap-2">
        <p className="flex-1 whitespace-pre-wrap">{question.text}</p>
        <DeleteButton id={question.id} text={question.text} />
      </div>
      <Source question={question} />
      {answering ? (
        <form onSubmit={save} className="mt-2 flex flex-col gap-2">
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="What did they say? (optional)"
            aria-label="Answer"
            autosize
            rows={2}
          />
          <div className="flex gap-2">
            <Button type="submit" intent="brand" size="sm">
              Save as asked
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setAnswering(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" size="sm" className="mt-2" onClick={() => setAnswering(true)}>
          Asked it
        </Button>
      )}
    </Card>
  );
}

export function AskedQuestion({ question }: { question: Question }) {
  const reopen = useSave(questionsSaves.reopenQuestion);
  return (
    <Card size="sm">
      <div className="flex items-start gap-2">
        <p className="flex-1 font-medium whitespace-pre-wrap">{question.text}</p>
        <DeleteButton id={question.id} text={question.text} />
      </div>
      <Source question={question} />
      {question.answer ? <p className="mt-1 whitespace-pre-wrap text-fg-normal">{question.answer}</p> : null}
      <div className="mt-2 flex items-center justify-between gap-2 text-xs text-fg-subtle">
        <span>Asked {formatDate(todayISO(new Date(question.askedAt!)), { day: "numeric", month: "short", year: "numeric" })}</span>
        <Button variant="ghost" size="sm" onClick={() => reopen({ id: question.id })}>
          Ask again
        </Button>
      </div>
    </Card>
  );
}

/** "from *Anaemia and low iron* · Sam's": the entry it was asked from, and whose it is; nothing when neither is known. */
function Source({ question }: { question: Question }) {
  const { me, people } = usePeople().data;
  // A private entry never sends one (src/server/privacy/); this only makes sure none is drawn.
  const item = question.itemId ? builtInItems.find((i) => i.id === question.itemId && !i.private) : undefined;
  const whose = whoseBy(question.by, me, people);
  if (!item && !whose) return null;
  return (
    <p className="mt-1 text-xs text-fg-subtle">
      {item ? (
        <>
          from{" "}
          <ItemLink itemId={item.id} className="italic underline hover:text-fg-normal">
            {item.title}
          </ItemLink>
        </>
      ) : null}
      {item && whose ? " · " : null}
      {whose}
    </p>
  );
}

function DeleteButton({ id, text }: { id: string; text: string }) {
  const remove = useSave(questionsSaves.deleteQuestion);
  return (
    <Button variant="ghost" size="sm" iconOnly aria-label={`Delete "${text}"`} onClick={() => remove({ id })}>
      <Trash2 aria-hidden size={16} />
    </Button>
  );
}

/**
 * On a Library entry: the questions asked from it, open ones waiting for the
 * next appointment and asked ones with what you were told. Never under a
 * private entry, which nothing can point at.
 */
export function QuestionsAbout({ itemId }: { itemId: string }) {
  const { data: about } = useQuestions({ select: (questions) => questions.filter((q) => q.itemId === itemId) });
  if (about.length === 0) return null;
  const open = about.filter((q) => !q.askedAt);
  // Most recently asked first.
  const asked = about.filter((q) => q.askedAt).sort((a, b) => b.askedAt!.localeCompare(a.askedAt!));
  return (
    <section aria-labelledby="your-questions" className="flex flex-col gap-2">
      <h2 id="your-questions" className="text-sm font-semibold text-fg-strong">
        Your questions
      </h2>
      <ul className="flex flex-col gap-2">
        {open.map((q) => (
          <li key={q.id} className="rounded-lg border border-border-subtle p-3 text-sm">
            <p className="whitespace-pre-wrap text-fg-normal">{q.text}</p>
            <Link to="/planner" hash="questions" className="mt-1 inline-flex items-center gap-1 text-xs text-fg-subtle hover:text-fg-normal">
              On your list for the next appointment <ChevronRight aria-hidden size={14} />
            </Link>
          </li>
        ))}
        {asked.map((q) => (
          <li key={q.id} className="rounded-lg border border-border-subtle p-3 text-sm">
            <p className="whitespace-pre-wrap font-medium text-fg-normal">{q.text}</p>
            <p className="mt-1 whitespace-pre-wrap text-fg-normal">
              <span className="text-fg-subtle">You asked on {formatDate(todayISO(new Date(q.askedAt!)), { day: "numeric", month: "short" })}</span>
              {q.answer ? `: ${q.answer}` : "."}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Questions waiting for the next appointment: they live in the Planner. */
export function QuestionsWaiting({ count }: { count: number }) {
  return (
    <Link to="/planner" hash="questions" className="flex min-h-11 items-center gap-2 self-start text-sm text-fg-subtle hover:text-fg-normal">
      <MessageCircleQuestion aria-hidden size={16} className="text-fg-brand" />
      {count === 1 ? "1 question" : `${count} questions`} for the next appointment
      <ChevronRight aria-hidden size={16} />
    </Link>
  );
}
