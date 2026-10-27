// The three apps, by stage: everything in src/app/ is one of them. Which one
// the household is in is derived from its dates (src/lib/stage.ts); the URL
// never says. The route tree hands this to the shell (src/features/shell/),
// so nothing shared imports a stage.

import type { Stages } from "../features/shell/stageApp";
import { postpartum } from "./postpartum";
import { preconception } from "./preconception";
import { pregnancy } from "./pregnancy";

export const STAGES: Stages = { preconception, pregnancy, postpartum };
