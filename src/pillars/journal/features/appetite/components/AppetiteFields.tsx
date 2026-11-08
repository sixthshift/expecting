import { cn } from "@sixthshift/design-system/utils";
import { useId } from "react";
import { HOW_LABEL, HOWS, type How } from "../../../../../lib/journal/appetite";

/** What a sickness tap says under it, so the three are told apart at 3 am. */
const HOW_HINT: Record<How, string> = { queasy: "Nausea", vomited: "Vomited", fluids: "Even water comes up" };

/** Queasy, threw up, can't keep fluids down: three large taps, worst last. */
export function HowPicker({ value, onChoose }: { value: How | null; onChoose: (how: How) => void }) {
  const name = useId();
  return (
    <fieldset className="grid grid-cols-3 gap-2">
      <legend className="sr-only">How bad?</legend>
      {HOWS.map((how) => {
        const chosen = how === value;
        return (
          <label
            key={how}
            className={cn(
              "flex min-h-16 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border px-2 py-2 text-center text-sm transition-colors has-focus-visible:outline-2 has-focus-visible:outline-focus-ring",
              chosen ? "border-border-brand bg-bg-brand-subtle font-medium text-fg-on-brand-subtle" : "border-border-subtle text-fg-normal hover:bg-bg-subtle"
            )}
          >
            <input type="radio" name={name} value={how} checked={chosen} onChange={() => onChoose(how)} className="sr-only" />
            <span>{HOW_LABEL[how]}</span>
            <span className="text-xs font-normal text-fg-subtle">{HOW_HINT[how]}</span>
          </label>
        );
      })}
    </fieldset>
  );
}

export const KIND_OPTIONS = [
  { value: "craving", label: "Craving" },
  { value: "off", label: "Gone off" },
];
