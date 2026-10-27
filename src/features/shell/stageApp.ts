import type { ComponentType } from "react";
import type { Stage } from "../../lib/stage";
import type { Pillar } from "./Frame";

/** A pillar as a stage has it: its place in the navigation, and the page it shows there. */
export type StagePillar = Pillar & { page: () => Promise<ComponentType> };

/**
 * One stage's app: its shell, and its pillars in navigation order, home first.
 * Each stage's index.ts is one of these, so its folder says the whole app.
 */
export type StageApp = {
  Shell: ComponentType<{ pillars: readonly Pillar[] }>;
  pillars: readonly StagePillar[];
};

/** The three apps, by stage: src/app/index.ts, handed to the shell by the route tree. */
export type Stages = Record<Stage, StageApp>;
