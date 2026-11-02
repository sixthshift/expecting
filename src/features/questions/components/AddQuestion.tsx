import { Button } from "@sixthshift/design-system/button";
import { Textarea } from "@sixthshift/design-system/textarea";
import { type FormEvent, useState } from "react";
import { questionsSaves } from "../../../api/rpc/questions";
import { useSave } from "../../../app/hooks/useSave";
import { newId } from "../../../lib/outbox";

/** A question for the next appointment. `text`: its words to start (shared from another app). `onAdded` once it's on the list (the capture sheet closes). */
export function AddQuestion({ text: start, onAdded }: { text?: string; onAdded?: () => void }) {
  const [text, setText] = useState(start?.slice(0, 1000) ?? "");
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
