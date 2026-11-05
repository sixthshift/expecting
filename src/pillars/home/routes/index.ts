import { timeline } from "../features/timeline/routes/timeline";
import { home } from "./home";

/** This week's addresses: home, and the whole pregnancy beside it (`/timeline`, not under it). */
export const homeRoutes = [home, timeline] as const;
