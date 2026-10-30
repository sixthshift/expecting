import { cn } from "@sixthshift/design-system/utils";
import { useId } from "react";
import { STEP_LABEL, STEPS, type Step } from "../../../lib/feelings";
import { Face } from "./Face";

/** The five steps as faces with their words, lowest first; one tap chooses. No numbers and no red or green: a low day is not an alarm. */
export function StepPicker({ value, onChoose, label }: { value: Step | null; onChoose: (step: Step) => void; label: string }) {
  const name = useId();
  return (
    <fieldset className="grid grid-cols-5 gap-1">
      <legend className="sr-only">{label}</legend>
      {STEPS.map((step) => {
        const chosen = step === value;
        return (
          <label
            key={step}
            className={cn(
              "flex min-h-11 cursor-pointer flex-col items-center gap-1 rounded-lg px-1 py-2 text-xs transition-colors has-focus-visible:outline-2 has-focus-visible:outline-(--focus-ring)",
              chosen ? "bg-bg-brand-subtle font-medium text-fg-on-brand-subtle" : "text-fg-normal hover:bg-bg-subtle"
            )}
          >
            <input type="radio" name={name} value={step} checked={chosen} onChange={() => onChoose(step)} className="sr-only" />
            <span className={chosen ? "text-fg-brand" : "text-fg-subtle"}>
              <Face step={step} />
            </span>
            {STEP_LABEL[step]}
          </label>
        );
      })}
    </fieldset>
  );
}
