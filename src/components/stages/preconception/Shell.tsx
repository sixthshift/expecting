import { BookOpen, ListChecks, Sprout } from "lucide-react";
import { Frame, type Pillar } from "../../shell/Frame";

/**
 * Getting ready: no weeks to follow yet, so no timeline, and nothing to keep
 * or time. What to do before a pregnancy, the Library, and the Planner.
 */
export const PILLARS: readonly Pillar[] = [
  { to: "/", label: "Getting ready", icon: Sprout },
  { to: "/library", label: "Library", icon: BookOpen },
  { to: "/planner", label: "Planner", icon: ListChecks },
];

export function PreconceptionShell() {
  return <Frame pillars={PILLARS} />;
}
