import { Button } from "@sixthshift/design-system/button";
import { Check, MessageCircleQuestion, Plus } from "lucide-react";
import { questionsSaves, useQuestions } from "../../../../../api/rpc/questions";
import { useSave } from "../../../../../app/hooks/useSave";
import { newId } from "../../../../../lib/outbox";

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
