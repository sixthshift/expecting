import type { Step } from "../../../lib/feelings";

/** How far each step's mouth bends: down for rough, flat for okay, up for great. */
const BEND: Record<Step, number> = { rough: -4, low: -1.5, okay: 0, good: 1.5, great: 4 };

/** A step as a face, drawn as a line icon (lucide's grid and stroke), so all five are one family. */
export function Face({ step, size = 28 }: { step: Step; size?: number }) {
  const bend = BEND[step];
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="9" x2="9.01" y1="9" y2="9" />
      <line x1="15" x2="15.01" y1="9" y2="9" />
      <path d={`M8 ${15.5 - bend / 2} Q12 ${15.5 + bend} 16 ${15.5 - bend / 2}`} />
    </svg>
  );
}
