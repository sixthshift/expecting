import { cn } from "@sixthshift/design-system/utils";

/**
 * How far along, as a thin bar in the accent: onboarding's steps, Settings'
 * answers. `className` sizes and colours the track, for the surface it's on.
 */
export function ProgressBar({ label, value, min = 0, max, className }: { label: string; value: number; min?: number; max: number; className?: string }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn("overflow-hidden rounded-full", className)}
    >
      <div
        className="h-full rounded-full bg-linear-to-r from-(--expecting-accent-from) to-(--expecting-accent-to) motion-safe:transition-[width] motion-safe:duration-500"
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  );
}
