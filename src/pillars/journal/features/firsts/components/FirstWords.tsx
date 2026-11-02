import { Button } from "@sixthshift/design-system/button";
import { Textarea } from "@sixthshift/design-system/textarea";
import { useState } from "react";
import { firstsSaves } from "../../../../../api/rpc/firsts";
import { usePeopleQuery } from "../../../../../api/rpc/people";
import { useSave } from "../../../../../app/hooks/useSave";
import { type FirstMark, firstOf } from "../../../../../lib/firsts";

/** A first's question, and each of you's words: yours to write (with someone holding the phone), the other's to read. */
export function FirstWords({ mark, onDone }: { mark: FirstMark & { day: string }; onDone?: () => void }) {
  const { data: people } = usePeopleQuery();
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
