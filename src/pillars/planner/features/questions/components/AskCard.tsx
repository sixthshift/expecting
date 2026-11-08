import { Button } from "@sixthshift/design-system/button";
import { cn } from "@sixthshift/design-system/utils";
import { Check, MessageCircleQuestion, Plus } from "lucide-react";
import { useContentContext } from "../../../../library/components/content/context";
import { useAsk } from "../hooks/useAsk";

/**
 * A question worth asking, from the Library or the Journal, added for the
 * next appointment in one tap (with none booked, it's added first),
 * remembering `itemId` if it came from an entry; once on your list, it says so.
 */
export function AskCard({ text, itemId, className }: { text: string; itemId?: string; className?: string }) {
  const { openQuestions } = useContentContext();
  const { ask, sheet } = useAsk();

  return (
    <div className={cn("flex items-start gap-3 rounded-lg border border-border-subtle bg-bg-normal p-3", className)}>
      <MessageCircleQuestion aria-hidden size={18} className="mt-0.5 shrink-0 text-fg-brand" />
      <p className="flex-1 text-sm text-fg-normal">{text}</p>
      {openQuestions.includes(text) ? (
        <span className="flex shrink-0 items-center gap-1 text-xs text-fg-subtle">
          <Check aria-hidden size={14} /> On your list
        </span>
      ) : (
        <Button variant="outline" size="sm" onClick={() => ask(text, itemId)} aria-label={`Add to your questions: ${text}`}>
          <Plus aria-hidden size={14} /> Ask
        </Button>
      )}
      {sheet}
    </div>
  );
}
