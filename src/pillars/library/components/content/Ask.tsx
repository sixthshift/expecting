import { cn } from "@sixthshift/design-system/utils";
import { Check, MessageCircleQuestion, Plus } from "lucide-react";
import { isBuiltInItemId, isPrivateItem } from "../../../../content";
import { useAsk } from "../../../planner/features/questions/hooks/useAsk";
import { useEntryHere } from "../../contexts/LibraryItemPageContext";
import { useContentContext } from "./context";

/** `{% ask "…" /%}`: a question worth asking at an appointment, added for the next one in one tap (with none booked, it's added first), remembering the entry it's on. */
export function Ask({ primary: text, className }: { primary: string; className?: string }) {
  const { openQuestions } = useContentContext();
  const here = useEntryHere();
  // Never a private one's: the server refuses it, and it would be a trace.
  const itemId = here !== undefined && isBuiltInItemId(here) && !isPrivateItem(here) ? here : undefined;
  const { ask, sheet } = useAsk();
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
          onClick={() => ask(text, itemId)}
          aria-label={`Add to your questions: ${text}`}
          className="flex min-h-9 shrink-0 items-center gap-1 rounded-full border border-border-normal px-3 text-xs font-medium hover:bg-bg-normal-hovered disabled:opacity-60"
        >
          <Plus aria-hidden size={14} /> Ask
        </button>
      )}
      {sheet}
    </div>
  );
}
