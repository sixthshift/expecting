// Connecting Claude (or another MCP client) to Expecting, by OAuth: what an
// authorisation request must carry, as /connect reads it from its address.

import { z } from "zod";

/** Where an MCP client talks to Expecting. */
export const MCP_PATH = "/api/mcp";
/** The authorisation page: behind the password, like every page. */
export const CONNECT_PATH = "/connect";

/** An authorisation request (OAuth 2.1, PKCE with S256 only). `state` and `scope` pass through; `resource` is ours, so it is not checked. */
export const authorisation = z.object({
  response_type: z.literal("code"),
  client_id: z.string().min(1).max(100),
  redirect_uri: z.url().max(2000),
  code_challenge: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
  code_challenge_method: z.literal("S256"),
  state: z.string().max(2000).optional(),
  scope: z.string().max(500).optional(),
  resource: z.string().max(2000).optional(),
});
export type Authorisation = z.infer<typeof authorisation>;

/** A client may be sent back only over HTTPS, or to this machine (a local client's listener). */
export function redirectAllowed(uri: string): boolean {
  let url: URL;
  try {
    url = new URL(uri);
  } catch {
    return false;
  }
  if (url.hash) return false;
  if (url.protocol === "https:") return true;
  return url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
}

/** The address to send the client back to, with what it gets (a code, or an error) and its state. */
export function sendBack(redirectUri: string, params: Record<string, string>, state: string | undefined): string {
  const url = new URL(redirectUri);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  if (state !== undefined) url.searchParams.set("state", state);
  return url.toString();
}
