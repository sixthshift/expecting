// How a tool answers: words for Claude to read. Most answers are JSON, which
// it reads as easily as prose and can't misread; a Library entry or a week's
// note is Markdown.

import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export function answer(value: unknown): CallToolResult {
  return { content: [{ type: "text", text: typeof value === "string" ? value : JSON.stringify(value, null, 1) }] };
}

/** A refusal Claude sees as one, with why. */
export function refuse(why: string): CallToolResult {
  return { content: [{ type: "text", text: why }], isError: true };
}
