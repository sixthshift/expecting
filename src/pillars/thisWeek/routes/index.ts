import { timeline } from "../features/timeline/routes/timeline";
import { thisWeek } from "./thisWeek";

/** This week's addresses: home, and the whole pregnancy beside it (`/timeline`, not under it). */
export const thisWeekRoutes = [thisWeek, timeline] as const;
