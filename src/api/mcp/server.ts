// Expecting as an MCP server: what Claude is told about it, and its tools,
// for one request, speaking for the person the connection was allowed as.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Grant } from "../../db/models/connections/repo";
import { VERSION } from "../../lib/version";
import { getDb } from "../../server/core/db";
import type { Context } from "./context";
import { fileTools } from "./files";
import { readTools } from "./read";
import { writeTools } from "./write";

/** The principles every part of Expecting keeps (docs/intent.md), for Claude to keep too. */
const INSTRUCTIONS = `Expecting is a pregnancy companion shared by two parents in Australia. It runs the admin: what to book, claim, buy and decide, and when, by pregnancy week (1–42, from the due date). Start with this_week.

- You act as the person this connection was allowed as; what you keep is kept as them, and the other parent sees it.
- Be directive about bookings, claims and purchases; never about her body.
- Not medical advice. For anything worrying, find the symptom in the Library (search_library) and say who it says to call. Reduced or changed movements, bleeding, or fluids not staying down: call the hospital's birth suite or 000 now.
- Results and papers: describe what is written if asked; never call a value normal or abnormal. That is for whoever ordered it.
- Australian: metric, en-AU spelling, Medicare and Services Australia.`;

export function mcpServer(grant: Grant): McpServer {
  const server = new McpServer({ name: "expecting", title: "Expecting", version: VERSION }, { instructions: INSTRUCTIONS });
  // Read fresh by each tool call: the moment is the call's, not the request's start.
  const ctx = (): Context => ({ db: getDb(), personId: grant.personId, now: new Date() });
  readTools(server, ctx);
  writeTools(server, ctx);
  fileTools(server, ctx);
  return server;
}
