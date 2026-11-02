// The endpoints at fixed /api/* URLs. They are server routes, so
// src/routes/tree.ts adds them to the route tree, on the server only. The app
// itself calls the server through ../rpc/, with one exception: an upload's
// bytes (./files.ts), which an <img> fetches by a plain URL, behind the gate.
// An MCP client (Claude) is the other outside caller: ./mcp.ts, and the OAuth
// endpoints it gets its token from (./oauth.ts).

import { filesRoute } from "./files";
import { healthRoute } from "./health";
import { mcpRoute } from "./mcp";
import { oauthRoutes } from "./oauth";

export const restRoutes = [healthRoute, filesRoute, mcpRoute, ...oauthRoutes] as const;
