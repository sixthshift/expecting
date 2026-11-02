import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createRoute } from "@tanstack/react-router";
import { MCP_PATH } from "../../lib/connect";
import { rootRoute } from "../../routes/root";
import { grantOf } from "../../server/auth/gate";
import { CORS, preflight, resourceMetadataUrl } from "../../server/oauth/endpoints";
import { mcpServer } from "../mcp/server";

/**
 * /api/mcp: Expecting for Claude (src/api/mcp/). Streamable HTTP, stateless:
 * a server and a transport per request, answered as JSON, nothing kept
 * between. Judged by its bearer token, never the cookie: without a live one,
 * a 401 pointing at how to get one (RFC 9728).
 */
export async function handleMcp(request: Request): Promise<Response> {
  const grant = grantOf(request);
  if (!grant) {
    return Response.json(
      { error: "invalid_token", error_description: "Connect first" },
      { status: 401, headers: { ...CORS, "www-authenticate": `Bearer resource_metadata="${resourceMetadataUrl(request)}"` } }
    );
  }
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  const server = mcpServer(grant);
  await server.connect(transport);
  const response = await transport.handleRequest(request);
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(CORS)) headers.set(key, value);
  return new Response(response.body, { status: response.status, headers });
}

export const mcpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: MCP_PATH,
  server: {
    handlers: {
      POST: ({ request }) => handleMcp(request),
      GET: ({ request }) => handleMcp(request),
      DELETE: ({ request }) => handleMcp(request),
      OPTIONS: () => preflight(),
    },
  },
});
