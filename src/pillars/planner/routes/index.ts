import { listsRoutes } from "../features/lists/routes";
import { weeks } from "../features/weeks/routes/weeks";
import { planner } from "./planner";
import { plannerIndex } from "./plannerIndex";

/** The Planner's addresses: what to do, the lists, and the chart across the weeks. */
export const plannerRoutes = planner.addChildren([plannerIndex, listsRoutes, weeks]);
