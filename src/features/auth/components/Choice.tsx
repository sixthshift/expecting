import { cn } from "@sixthshift/design-system/utils";
import { Check } from "lucide-react";
import type { ReactNode } from "react";

/** One big answer, pressed or not: which of you you are, on the login and set-up screens. */
export function Choice({ chosen, onClick, children }: { chosen: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={chosen}
      onClick={onClick}
      className={cn(
        "flex min-h-14 w-full items-center gap-3 rounded-xl border bg-bg-normal px-4 py-3 text-left text-base transition-colors hover:border-border-brand-hovered",
        chosen ? "border-border-brand bg-bg-brand-subtle text-fg-on-brand-subtle" : "border-border-normal text-fg-strong"
      )}
    >
      <span className="flex-1">{children}</span>
      {chosen ? <Check aria-hidden size={18} className="text-fg-brand" /> : null}
    </button>
  );
}
