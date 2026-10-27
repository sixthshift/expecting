// The three apps, by stage. Which one the household is in is derived from its
// dates (src/lib/stage.ts); the URL never says.

import type { Stage } from "../lib/stage";
import { postpartum } from "./postpartum";
import { preconception } from "./preconception";
import { pregnancy } from "./pregnancy";
import type { StageApp } from "./stageApp";

export const STAGES: Record<Stage, StageApp> = { preconception, pregnancy, postpartum };
