import { Check, MessageCircleQuestion, Plus } from "lucide-react";
import { addQuestion } from "../../../server/functions/questions";
import { useAction } from "../../household/useAction";
import { useContentContext } from "./context";

/** `{% ask "…" /%}`: a question worth asking at an appointment, added to your list in one tap. */
export function Ask({ primary: text }: { primary: string }) {
  const { openQuestions } = useContentContext();
  const [add, saving] = useAction(() => addQuestion({ data: { text } }));
  const onList = openQuestions.includes(text);

  return (
    <div className="mt-3 flex items-start gap-3 rounded-lg border border-border-subtle bg-bg-normal p-3">
      <MessageCircleQuestion aria-hidden size={18} className="mt-0.5 shrink-0 text-fg-brand" />
      <p className="flex-1 text-sm text-fg-normal">{text}</p>
      {onList ? (
        <span className="flex shrink-0 items-center gap-1 text-xs text-fg-subtle">
          <Check aria-hidden size={14} /> On your list
        </span>
      ) : (
        <button
          type="button"
          onClick={add}
          disabled={saving}
          aria-label={`Add to your questions: ${text}`}
          className="flex min-h-9 shrink-0 items-center gap-1 rounded-full border border-border-normal px-3 text-xs font-medium hover:bg-bg-normal-hovered disabled:opacity-60"
        >
          <Plus aria-hidden size={14} /> Ask
        </button>
      )}
    </div>
  );
}
