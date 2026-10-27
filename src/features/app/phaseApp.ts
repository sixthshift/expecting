import type { ComponentType } from "react";
import type { PlannerPlan } from "../../lib/planner";
import type { Phase } from "../../lib/timeline";
import type { Pillar } from "./PillarLayout";

/** A pillar as a phase has it: its place in the navigation, and the page it shows there. */
export type PhasePillar = Pillar & { page: () => Promise<ComponentType> };

/**
 * One phase's app: its layout, its pillars in navigation order (home first),
 * and what it has that shared pages may offer a way to. Each phase's index.ts
 * is one of these, so its folder says the whole app. Shared code asks these,
 * never which phase it is.
 */
export type PhaseApp = {
  Layout: ComponentType<{ pillars: readonly Pillar[] }>;
  pillars: readonly PhasePillar[];
  /** Whether its home is the timeline, so a week can be linked to (`/?at=28`). */
  timeline: boolean;
  /** How its Planner plans: the shared page, tuned to the phase. */
  planner: PlannerPlan & {
    /** The heading over open tasks an earlier phase left behind, when this one leaves them. */
    behind?: string;
    /** The heading over the questions: who they're for. */
    questionsFor: string;
  };
};

/** The three apps, by phase: src/app/index.ts, handed to App by the route tree. */
export type Phases = Record<Phase, PhaseApp>;
