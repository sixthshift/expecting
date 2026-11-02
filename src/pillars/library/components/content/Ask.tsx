import { cn } from "@sixthshift/design-system/utils";
import { useParams } from "@tanstack/react-router";
import { Check, MessageCircleQuestion, Plus } from "lucide-react";
import { questionsSaves } from "../../../../api/rpc/questions";
import { useSave } from "../../../../app/hooks/useSave";
import { isBuiltInItemId, isPrivateItem } from "../../../../content";
import { newId } from "../../../../lib/outbox";
import { useContentContext } from "./context";

/** `{% ask "…" /%}`: a question worth asking at an appointment, added to your list in one tap, remembering the entry it's on. */
export function Ask({ primary: text, className }: { primary: string; className?: string }) {
  const { openQuestions } = useContentContext();
  const here = useParams({ strict: false }).itemId;
  // Never a private one's: the server refuses it, and it would be a trace.
  const itemId = here !== undefined && isBuiltInItemId(here) && !isPrivateItem(here) ? here : undefined;
  const add = useSave(questionsSaves.addQuestion);
  const onList = openQuestions.includes(text);

  return (
    <div className={cn("mt-3 flex items-start gap-3 rounded-lg border border-border-subtle bg-bg-normal p-3", className)}>
      <MessageCircleQuestion aria-hidden size={18} className="mt-0.5 shrink-0 text-fg-brand" />
      <p className="flex-1 text-sm text-fg-normal">{text}</p>
      {onList ? (
        <span className="flex shrink-0 items-center gap-1 text-xs text-fg-subtle">
          <Check aria-hidden size={14} /> On your list
        </span>
      ) : (
        <button
          type="button"
          onClick={() => add({ id: newId(), text, itemId })}
          aria-label={`Add to your questions: ${text}`}
          className="flex min-h-9 shrink-0 items-center gap-1 rounded-full border border-border-normal px-3 text-xs font-medium hover:bg-bg-normal-hovered disabled:opacity-60"
        >
          <Plus aria-hidden size={14} /> Ask
        </button>
      )}
    </div>
  );
}
