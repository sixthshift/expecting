import { cn } from "@sixthshift/design-system/utils";
import { STEP_LABEL, type Step } from "../../../../../../lib/journal/feelings";

/** A dot's strength, as in the Journal: faint to full, in the brand's colour, and fainter still here so the line stays quiet. */
const STRENGTH: Record<Step, string> = { rough: "opacity-30", low: "opacity-40", okay: "opacity-55", good: "opacity-70", great: "opacity-85" };

/** How each of you felt that week: one faint dot each, nothing louder. */
export function Felt({ steps }: { steps: Step[] }) {
  return (
    <span className="flex shrink-0 items-center gap-1 pr-3">
      <span className="sr-only">Felt: {steps.map((s) => STEP_LABEL[s]).join(", ")}</span>
      {steps.map((step, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: one dot a person, in a fixed order.
        <span key={i} aria-hidden className={cn("size-2 rounded-full bg-fg-brand", STRENGTH[step])} />
      ))}
    </span>
  );
}
