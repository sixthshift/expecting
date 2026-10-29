import { cn } from "@sixthshift/design-system/utils";
import { Check } from "lucide-react";
import { useState } from "react";

/** Big answers, one tap each: choosing one is answering. */
export function Choices({
  options,
  value,
  onChoose,
}: {
  options: { value: string; label: string }[];
  value?: string;
  onChoose: (value: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-3">
      {options.map((o) => {
        const chosen = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            disabled={busy !== null}
            aria-pressed={chosen}
            onClick={async () => {
              setBusy(o.value);
              try {
                await onChoose(o.value);
              } finally {
                setBusy(null);
              }
            }}
            className={cn(
              "flex min-h-14 w-full items-center gap-3 rounded-xl border bg-bg-normal px-4 py-3 text-left text-base transition-colors hover:border-border-brand-hovered disabled:cursor-wait",
              chosen ? "border-border-brand bg-bg-brand-subtle text-fg-on-brand-subtle" : "border-border-normal text-fg-strong",
              busy === o.value && "border-border-brand"
            )}
          >
            <span className="flex-1">{o.label}</span>
            {chosen ? <Check aria-hidden size={18} className="text-fg-brand" /> : null}
          </button>
        );
      })}
    </div>
  );
}

export function SkipButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="min-h-11 self-start text-sm text-fg-subtle underline hover:text-fg-normal">
      Skip for now
    </button>
  );
}
