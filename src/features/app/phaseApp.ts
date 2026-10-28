import type { ComponentType } from "react";
import type { LibraryPlan } from "../../lib/library";
import type { PlannerPlan } from "../../lib/planner";
import type { Phase } from "../../lib/timeline";
import type { Pillar } from "./PillarLayout";

/**
 * One phase's app: its layout, its pillars in navigation order (home first),
 * and what it has that shared pages may offer a way to. Each phase's index.ts
 * is one of these; its pages are its routes (src/routes/<phase>/). Shared code
 * asks these, never which phase it is.
 */
export type PhaseApp = {
  Layout: ComponentType<{ pillars: readonly Pillar[] }>;
  pillars: readonly Pillar[];
  /** Where its timeline is, when it has one, so a week can be linked to (`/pregnancy/timeline?at=28`). */
  timeline: "/pregnancy/timeline" | null;
  /** How its Planner plans: the shared page, tuned to the phase. */
  planner: PlannerPlan & {
    /** The heading over open tasks an earlier phase left behind, when this one leaves them. */
    behind?: string;
    /** The heading over the questions: who they're for. */
    questionsFor: string;
  };
  /** How its Library arranges its shelves: the shared page, tuned to the phase. */
  library: LibraryPlan & {
    /** The search box's prompt: what people come here to ask in this phase. */
    search: string;
  };
};

/** The three apps, by phase: src/features/phases/index.ts, handed to App by the route tree. */
export type Phases = Record<Phase, PhaseApp>;
