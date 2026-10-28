import type { Step } from "../../lib/onboarding";

/** Where a step lives: `/onboarding/due`, or a profile question's `/onboarding/q/cover`. */
export function stepHref(step: Step): string {
  return step.startsWith("q:") ? `/onboarding/q/${encodeURIComponent(step.slice(2))}` : `/onboarding/${step}`;
}

/** The step a path is, the other way: `/onboarding/q/cover` is `q:cover`. */
export function stepAt(pathname: string): Step | undefined {
  const [, onboarding, step, id] = pathname.replace(/\/$/, "").split("/");
  if (onboarding !== "onboarding" || !step) return undefined;
  if (step === "q") return id ? `q:${decodeURIComponent(id)}` : undefined;
  return step as Step;
}
