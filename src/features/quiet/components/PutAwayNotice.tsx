import { cn } from "@sixthshift/design-system/utils";

/**
 * What a page says in place of its things while Expecting is quiet: they're
 * put away (the to-do list is put aside), not deleted. `subject` is what's
 * put away, as the sentence starts ("The lists"); `are` when it's plural.
 */
export function PutAwayNotice({ subject, are = false, aside = false, className }: { subject: string; are?: boolean; aside?: boolean; className?: string }) {
  return (
    <p className={cn("text-sm text-fg-subtle", className)}>
      {subject} {are ? "are" : "is"} put {aside ? "aside" : "away"} while Expecting is quiet. Nothing is deleted.
    </p>
  );
}
