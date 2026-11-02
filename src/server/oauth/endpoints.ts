// The OAuth 2.1 endpoints an MCP client finds and uses on its own: the two
// metadata documents, dynamic registration, the token endpoint and
// revocation. All open (they are how a token is got); the authorising itself
// is the page /connect, behind the password. Clients are public: no secret,
// PKCE instead. Bearer tokens, never cookies, so any origin may call.

import { z } from "zod";
import { ConnectionsRepo } from "../../db/models/connections/repo";
import { CONNECT_PATH, MCP_PATH, redirectAllowed } from "../../lib/connect";
import { getDb } from "../core/db";
import { publicOrigin } from "./origin";

export const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
  "access-control-allow-headers": "authorization, content-type, mcp-protocol-version, mcp-session-id, last-event-id",
  "access-control-expose-headers": "www-authenticate, mcp-session-id",
};

function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return Response.json(body, { status, headers: { ...CORS, "cache-control": "no-store", ...headers } });
}

function oauthError(error: string, description: string, status = 400): Response {
  return json({ error, error_description: description }, status);
}

/** An answer to a CORS preflight. */
export function preflight(): Response {
  return new Response(null, { status: 204, headers: CORS });
}

/** Where the protected resource's metadata is, for a 401 to point at (RFC 9728). */
export function resourceMetadataUrl(request: Request): string {
  return `${publicOrigin(request)}/.well-known/oauth-protected-resource${MCP_PATH}`;
}

/** GET /.well-known/oauth-protected-resource[/api/mcp]: what /api/mcp is and who authorises it. */
export function protectedResource(request: Request): Response {
  const origin = publicOrigin(request);
  return json({ resource: `${origin}${MCP_PATH}`, authorization_servers: [origin], bearer_methods_supported: ["header"], resource_name: "Expecting" });
}

/** GET /.well-known/oauth-authorization-server: where to register, authorise and swap codes (RFC 8414). */
export function authorizationServer(request: Request): Response {
  const origin = publicOrigin(request);
  return json({
    issuer: origin,
    authorization_endpoint: `${origin}${CONNECT_PATH}`,
    token_endpoint: `${origin}/api/oauth/token`,
    registration_endpoint: `${origin}/api/oauth/register`,
    revocation_endpoint: `${origin}/api/oauth/revoke`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none"],
    revocation_endpoint_auth_methods_supported: ["none"],
  });
}

const registration = z.object({
  client_name: z.string().trim().min(1).max(100).optional(),
  redirect_uris: z.array(z.string().max(2000)).min(1).max(10),
});

/** POST /api/oauth/register: a client registers itself (RFC 7591). Every one is public, whatever it asked for. */
export async function register(request: Request, now: Date = new Date()): Promise<Response> {
  const parsed = registration.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return oauthError("invalid_client_metadata", "Needs redirect_uris");
  const { client_name, redirect_uris } = parsed.data;
  if (!redirect_uris.every(redirectAllowed)) return oauthError("invalid_redirect_uri", "Redirects go over HTTPS, or to this machine");
  const repo = new ConnectionsRepo(getDb());
  repo.prune(now);
  const client = repo.register(client_name ?? "An assistant", redirect_uris, now);
  return json(
    {
      client_id: client.id,
      client_id_issued_at: Math.floor(now.getTime() / 1000),
      client_name: client.name,
      redirect_uris: client.redirectUris,
      token_endpoint_auth_method: "none",
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
    },
    201
  );
}

/** Whether `verifier` answers `challenge`: its SHA-256, base64url (PKCE S256). */
export function pkceMatches(verifier: string, challenge: string): boolean {
  if (!/^[A-Za-z0-9._~-]{43,128}$/.test(verifier)) return false;
  return new Bun.CryptoHasher("sha256").update(verifier).digest("base64url") === challenge;
}

/** The form a token or revocation request sends, with a client id from Basic auth if it came that way. */
async function form(request: Request): Promise<URLSearchParams> {
  const params = new URLSearchParams(await request.text().catch(() => ""));
  const basic = request.headers.get("authorization")?.match(/^Basic\s+(.+)$/i)?.[1];
  if (basic && !params.has("client_id")) {
    const id = decodeURIComponent(atob(basic).split(":")[0] ?? "");
    if (id) params.set("client_id", id);
  }
  return params;
}

/** POST /api/oauth/token: a code, with its verifier, or a refresh token, for new tokens. */
export async function token(request: Request, now: Date = new Date()): Promise<Response> {
  const params = await form(request);
  const clientId = params.get("client_id") ?? "";
  const repo = new ConnectionsRepo(getDb());
  if (!repo.client(clientId)) return oauthError("invalid_client", "Unknown client", 401);
  let tokens: ReturnType<ConnectionsRepo["redeem"]>;
  switch (params.get("grant_type")) {
    case "authorization_code": {
      const verifier = params.get("code_verifier") ?? "";
      tokens = repo.redeem(params.get("code") ?? "", clientId, params.get("redirect_uri") ?? "", (challenge) => pkceMatches(verifier, challenge), now);
      break;
    }
    case "refresh_token":
      tokens = repo.refresh(params.get("refresh_token") ?? "", clientId, now);
      break;
    default:
      return oauthError("unsupported_grant_type", "A code or a refresh token");
  }
  if (!tokens) return oauthError("invalid_grant", "That has expired or was already used: connect again");
  return json({ access_token: tokens.accessToken, token_type: "Bearer", expires_in: tokens.expiresIn, refresh_token: tokens.refreshToken });
}

/** POST /api/oauth/revoke: drop a token (RFC 7009). Always a 200, known or not. */
export async function revoke(request: Request): Promise<Response> {
  const t = (await form(request)).get("token");
  if (t) new ConnectionsRepo(getDb()).revoke(t);
  return new Response(null, { status: 200, headers: CORS });
}
