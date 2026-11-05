import { listsRoutes } from "../features/lists/routes";
import { weeks } from "../features/weeks/routes/weeks";
import { appointments } from "./appointments";
import { planner } from "./planner";
import { plannerIndex } from "./plannerIndex";
import { questions } from "./questions";

/** The Planner's addresses: what to do, the lists, the appointments, the questions, and the chart across the weeks. */
export const plannerRoutes = planner.addChildren([plannerIndex, listsRoutes, appointments, questions, weeks]);
