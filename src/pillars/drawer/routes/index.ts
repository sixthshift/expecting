import { bingo } from "../features/bingo/routes/bingo";
import { people } from "../features/circle/routes/people";
import { jobs } from "../features/jobs/routes/jobs";
import { names } from "../features/names/routes/names";
import { drawer } from "./drawer";
import { drawerIndex } from "./drawerIndex";

/** The Drawer's addresses: the Drawer, then the names game, your people, who does what and bingo, each a page of its own. */
export const drawerRoutes = drawer.addChildren([drawerIndex, names, people, jobs, bingo]);
