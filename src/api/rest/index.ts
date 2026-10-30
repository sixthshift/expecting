// The endpoints at fixed /api/* URLs. They are server routes, so
// src/routes/tree.ts adds them to the route tree, on the server only. The app
// itself calls the server through ../rpc/, with one exception: an upload's
// bytes (./files.ts), which an <img> fetches by a plain URL, behind the gate.

import { filesRoute } from "./files";
import { healthRoute } from "./health";

export const restRoutes = [healthRoute, filesRoute] as const;
