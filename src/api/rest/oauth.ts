import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "../../routes/root";
import { authorizationServer, preflight, protectedResource, register, revoke, token } from "../../server/oauth/endpoints";

// How an MCP client finds out how to connect, registers, and gets and drops
// tokens (src/server/oauth/endpoints.ts). Open, like /api/health: the
// authorising is /connect, behind the password.

export const protectedResourceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/.well-known/oauth-protected-resource",
  server: { handlers: { GET: ({ request }) => protectedResource(request), OPTIONS: () => preflight() } },
});

/** The same, at the address RFC 9728 derives from /api/mcp. */
export const mcpResourceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/.well-known/oauth-protected-resource/api/mcp",
  server: { handlers: { GET: ({ request }) => protectedResource(request), OPTIONS: () => preflight() } },
});

export const authorizationServerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/.well-known/oauth-authorization-server",
  server: { handlers: { GET: ({ request }) => authorizationServer(request), OPTIONS: () => preflight() } },
});

export const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/api/oauth/register",
  server: { handlers: { POST: ({ request }) => register(request), OPTIONS: () => preflight() } },
});

export const tokenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/api/oauth/token",
  server: { handlers: { POST: ({ request }) => token(request), OPTIONS: () => preflight() } },
});

export const revokeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/api/oauth/revoke",
  server: { handlers: { POST: ({ request }) => revoke(request), OPTIONS: () => preflight() } },
});

export const oauthRoutes = [protectedResourceRoute, mcpResourceRoute, authorizationServerRoute, registerRoute, tokenRoute, revokeRoute] as const;
