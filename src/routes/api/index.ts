// The server routes (/api/*), added to the tree on the server only.

import { healthRoute } from "./health";

export const apiRoutes = [healthRoute] as const;
