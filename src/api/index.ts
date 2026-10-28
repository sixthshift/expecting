// The endpoints for callers outside the app, at fixed /api/* URLs. They are
// server routes, so src/routes/tree.tsx adds them to the route tree, on the
// server only. The app itself calls the server through src/rpc/.

import { healthRoute } from "./health";

export const apiRoutes = [healthRoute] as const;
