// Expecting as an MCP server: what Claude is told about it, and its tools,
// a file for each pillar or part (tools/), for one request, speaking for the
// person the connection was allowed as.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Grant } from "../../db/models/connections/repo";
import { VERSION } from "../../lib/version";
import { getDb } from "../../server/core/db";
import { toolsOf } from "./answer";
import type { Context } from "./context";
import { INSTRUCTIONS } from "./instructions";
import { drawerTools } from "./tools/drawer";
import { emergencyTools } from "./tools/emergency";
import { itsTimeTools } from "./tools/itsTime";
import { journalTools } from "./tools/journal";
import { libraryTools } from "./tools/library";
import { plannerTools } from "./tools/planner";
import { removeTools } from "./tools/remove";
import { thisWeekTools } from "./tools/thisWeek";

export function mcpServer(grant: Grant): McpServer {
  const server = new McpServer({ name: "expecting", title: "Expecting", version: VERSION }, { instructions: INSTRUCTIONS });
  // Read fresh by each tool call: the moment is the call's, not the request's start.
  const tools = toolsOf(server, (): Context => ({ db: getDb(), personId: grant.personId, now: new Date() }));
  thisWeekTools(tools);
  libraryTools(tools);
  plannerTools(tools);
  journalTools(tools);
  drawerTools(tools);
  itsTimeTools(tools);
  emergencyTools(tools);
  removeTools(tools);
  return server;
}
