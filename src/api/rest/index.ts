// The endpoints at fixed /api/* URLs. They are server routes, so
// src/routes/tree.ts adds them to the route tree, on the server only. The app
// itself calls the server through ../rpc/, with two exceptions, behind the
// gate: an upload's bytes (./files.ts), which an <img> fetches by a plain URL,
// and an appointment's calendar file (./calendar.ts), which a phone hands to
// its calendar only from a plain URL.
// An MCP client (Claude) is the other outside caller: ./mcp.ts, and the OAuth
// endpoints it gets its token from (./oauth.ts).

import { calendarRoute } from "./calendar";
import { filesRoute } from "./files";
import { healthRoute } from "./health";
import { mcpRoute } from "./mcp";
import { oauthRoutes } from "./oauth";

export const restRoutes = [healthRoute, filesRoute, calendarRoute, mcpRoute, ...oauthRoutes] as const;
