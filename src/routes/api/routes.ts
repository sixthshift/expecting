// The server routes (/api/*), added to the tree on the server only.

import { healthRoute } from "./health";
import { loginRoute, logoutRoute } from "./login";

export const apiRoutes = [healthRoute, loginRoute, logoutRoute] as const;
