// A week's question, answered by both of you.

import { MessagesSquare } from "lucide-react";
import type { StoryItem } from "../../../../lib/story/items";

import { usePersonName } from "./parts";

/** A week's question, once both of you have answered: the question, then each answer and whose, the first given first. */
export function QuestionLine({ item }: { item: Extract<StoryItem, { kind: "question" }> }) {
  const name = usePersonName();
  return (
    <div className="py-1">
      <p className="flex items-start gap-2 font-medium text-fg-strong">
        <MessagesSquare aria-hidden size={16} className="mt-1 shrink-0 text-fg-brand" />
        <span>
          <span className="sr-only">The week's question: </span>
          {item.pair.question}
        </span>
      </p>
      {item.pair.answers.map((a) => (
        <p key={a.by} className="mt-1 ml-6 border-l-2 border-border-brand pl-3 whitespace-pre-line text-fg-normal">
          {a.body}
          <span className="text-sm text-fg-subtle"> — {name(a.by)}</span>
        </p>
      ))}
    </div>
  );
}
