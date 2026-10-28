// The three apps, by phase: everything in src/app/ is one of them. Which one
// the household is in is derived from its dates (src/lib/phase.ts); the URL
// never says. The route tree hands this to App (src/features/app/),
// so nothing shared imports a phase.

import type { Phases } from "../app/phaseApp";
import { postpartum } from "./postpartum";
import { preconception } from "./preconception";
import { pregnancy } from "./pregnancy";

export const PHASES: Phases = { preconception, pregnancy, postpartum };
