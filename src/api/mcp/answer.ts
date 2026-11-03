// How a tool is registered and how it answers: words for Claude to read. Most
// answers are JSON, which it reads as easily as prose and can't misread; a
// Library entry or a week's note is Markdown.
//
// A tool that reads is `read`; one that keeps or changes something is `keep`,
// and like a server function's input, its arguments pass refusePrivate first
// (src/server/privacy/guard.ts): nothing that names a private entry is saved.

import type { McpServer, ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ZodRawShapeCompat } from "@modelcontextprotocol/sdk/server/zod-compat.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { refusePrivate } from "../../server/privacy/guard";
import type { Context } from "./context";

export function answer(value: unknown): CallToolResult {
  return { content: [{ type: "text", text: typeof value === "string" ? value : JSON.stringify(value, null, 1) }] };
}

/** A refusal Claude sees as one, with why. */
export function refuse(why: string): CallToolResult {
  return { content: [{ type: "text", text: why }], isError: true };
}

type Config<Args extends ZodRawShapeCompat> = { title: string; description: string; inputSchema?: Args };

/** What each pillar's tools are registered with: the server, and the context each call reads fresh. */
export type Tools = {
  ctx: () => Context;
  read<Args extends ZodRawShapeCompat>(name: string, config: Config<Args>, run: ToolCallback<Args>): void;
  /** `destructive` for one that takes something away. */
  keep<Args extends ZodRawShapeCompat>(name: string, config: Config<Args>, run: ToolCallback<Args>, destructive?: boolean): void;
};

export function toolsOf(server: McpServer, ctx: () => Context): Tools {
  return {
    ctx,
    read(name, config, run) {
      server.registerTool(name, { ...config, annotations: { readOnlyHint: true, openWorldHint: false } }, run);
    },
    keep(name, config, run, destructive = false) {
      const call = run as unknown as (args: unknown, extra: unknown) => CallToolResult | Promise<CallToolResult>;
      const guarded = ((args: unknown, extra: unknown) =>
        refusePrivate(args) ? refuse("That stays private, so it isn't kept.") : call(args, extra)) as unknown as typeof run;
      server.registerTool(name, { ...config, annotations: { readOnlyHint: false, destructiveHint: destructive, openWorldHint: false } }, guarded);
    },
  };
}
