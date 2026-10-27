// Questions for the next appointment, as they appear on the timeline: the open
// ones and the form at the current week, asked ones in the week they were asked.

import { Button } from "@sixthshift/design-system/button";
import { Card } from "@sixthshift/design-system/card";
import { Textarea } from "@sixthshift/design-system/textarea";
import { useRouter } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { formatDate, type ISODate } from "../lib/dates";
import type { Question } from "../lib/questions";
import { addQuestion, deleteQuestion, markAsked, reopenQuestion } from "../server/functions/questions";

function useRefresh() {
  const router = useRouter();
  return () => router.invalidate();
}

export function AddQuestion() {
  const refresh = useRefresh();
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (text.trim().length === 0) return;
    setSaving(true);
    try {
      await addQuestion({ data: { text } });
      setText("");
      await refresh();
    } finally {
      setSaving(false);
    }
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
      <Button type="submit" intent="brand" loading={saving} disabled={text.trim().length === 0} className="self-start">
        Add question
      </Button>
    </form>
  );
}

export function OpenQuestion({ question }: { question: Question }) {
  const refresh = useRefresh();
  const [answering, setAnswering] = useState(false);
  const [answer, setAnswer] = useState(question.answer ?? "");

  async function save(event: FormEvent) {
    event.preventDefault();
    await markAsked({ data: { id: question.id, answer } });
    await refresh();
  }

  return (
    <Card size="sm">
      <div className="flex items-start gap-2">
        <p className="flex-1 whitespace-pre-wrap">{question.text}</p>
        <DeleteButton id={question.id} text={question.text} />
      </div>
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
  const refresh = useRefresh();
  return (
    <Card size="sm">
      <div className="flex items-start gap-2">
        <p className="flex-1 font-medium whitespace-pre-wrap">{question.text}</p>
        <DeleteButton id={question.id} text={question.text} />
      </div>
      {question.answer ? <p className="mt-1 whitespace-pre-wrap text-fg-normal">{question.answer}</p> : null}
      <div className="mt-2 flex items-center justify-between gap-2 text-xs text-fg-subtle">
        <span>Asked {formatDate(question.askedAt!.slice(0, 10) as ISODate, { day: "numeric", month: "short", year: "numeric" })}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            await reopenQuestion({ data: { id: question.id } });
            await refresh();
          }}
        >
          Ask again
        </Button>
      </div>
    </Card>
  );
}

function DeleteButton({ id, text }: { id: string; text: string }) {
  const refresh = useRefresh();
  return (
    <Button
      variant="ghost"
      size="sm"
      iconOnly
      aria-label={`Delete "${text}"`}
      onClick={async () => {
        await deleteQuestion({ data: { id } });
        await refresh();
      }}
    >
      <Trash2 aria-hidden size={16} />
    </Button>
  );
}
