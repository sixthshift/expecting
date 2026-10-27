import type { ComponentType } from "react";
import type { Phase } from "../../lib/timeline";
import type { Pillar } from "./PillarLayout";

/** A pillar as a phase has it: its place in the navigation, and the page it shows there. */
export type PhasePillar = Pillar & { page: () => Promise<ComponentType> };

/**
 * One phase's app: its layout, and its pillars in navigation order, home first.
 * Each phase's index.ts is one of these, so its folder says the whole app.
 */
export type PhaseApp = {
  Layout: ComponentType<{ pillars: readonly Pillar[] }>;
  pillars: readonly PhasePillar[];
};

/** The three apps, by phase: src/app/index.ts, handed to App by the route tree. */
export type Phases = Record<Phase, PhaseApp>;
