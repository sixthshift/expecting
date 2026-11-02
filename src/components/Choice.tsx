import { cn } from "@sixthshift/design-system/utils";
import { Check } from "lucide-react";
import type { ReactNode } from "react";

/**
 * One big answer, pressed or not, a tap to choose: which of you you are (the
 * login and set-up screens), an answer in onboarding. `busy` marks the one
 * being saved while the rest are `disabled`.
 */
export function Choice({
  chosen,
  onClick,
  disabled = false,
  busy = false,
  children,
}: {
  chosen: boolean;
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={chosen}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex min-h-14 w-full items-center gap-3 rounded-xl border bg-bg-normal px-4 py-3 text-left text-base transition-colors hover:border-border-brand-hovered disabled:cursor-wait",
        chosen ? "border-border-brand bg-bg-brand-subtle text-fg-on-brand-subtle" : "border-border-normal text-fg-strong",
        busy && "border-border-brand"
      )}
    >
      <span className="flex-1">{children}</span>
      {chosen ? <Check aria-hidden size={18} className="text-fg-brand" /> : null}
    </button>
  );
}
