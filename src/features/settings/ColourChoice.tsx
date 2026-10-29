import { cn } from "@sixthshift/design-system/utils";
import { Check } from "lucide-react";
import { applyTheme, BABY, type Baby, THEMES } from "../../lib/theme";

/**
 * Boy, girl, or don't know, as the three themes themselves: each choice is
 * drawn in its own colours (`data-expecting-theme` on the swatch), so you see
 * what you're choosing. Shown at once; the save follows.
 */
export function ColourChoice({ value, onChoose }: { value: Baby; onChoose: (baby: Baby) => Promise<void> }) {
  return (
    <div role="radiogroup" aria-label="Boy or girl?" className="grid grid-cols-3 gap-2 sm:gap-3">
      {(Object.keys(BABY) as Baby[]).map((baby) => {
        const chosen = baby === value;
        return (
          <label
            key={baby}
            data-expecting-theme={THEMES[baby]}
            className={cn(
              "relative flex cursor-pointer flex-col gap-2 rounded-xl border bg-bg-normal p-2 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-(--focus-ring) sm:p-3",
              chosen ? "border-border-brand ring-1 ring-border-brand" : "border-border-subtle hover:border-border-brand-hovered"
            )}
          >
            <input
              type="radio"
              name="baby"
              value={baby}
              checked={chosen}
              onChange={() => {
                applyTheme(THEMES[baby]);
                void onChoose(baby);
              }}
              // Over the whole card, unseen: the card is what's tapped.
              className="absolute inset-0 z-10 cursor-pointer appearance-none opacity-0"
            />
            <span aria-hidden className="relative h-12 rounded-lg bg-linear-to-br from-(--expecting-accent-from) to-(--expecting-accent-to) sm:h-16">
              {chosen ? (
                <span className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-bg-normal text-fg-brand">
                  <Check size={14} strokeWidth={3} />
                </span>
              ) : null}
            </span>
            <span className="text-center text-xs leading-tight font-medium text-fg-strong sm:text-sm">{BABY[baby]}</span>
          </label>
        );
      })}
    </div>
  );
}
