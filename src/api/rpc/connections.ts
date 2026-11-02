// Claude, or another MCP client, connected to Expecting (src/api/rest/mcp.ts).
// /connect is where a client is let in: it asks who the request is from and
// whether to allow it, and approving it sends the client back with a code.
// Settings lists what's connected, and disconnects one.

import { queryOptions, type UseSuspenseQueryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ConnectionsRepo } from "../../db/models/connections/repo";
import { PeopleRepo } from "../../db/models/people/repo";
import { authorisation, sendBack } from "../../lib/connect";
import { save } from "../../lib/outbox";
import { loginOn } from "../../server/auth/gate";
import { getDb } from "../../server/core/db";

/** What /connect can say about a request: who's asking, or why it can't go ahead (and so no sending back). */
export type ConnectRequest = { ok: true; clientName: string } | { ok: false; why: "login-off" | "unknown-client" | "bad-redirect" };

function judge(clientId: string, redirectUri: string): ConnectRequest {
  if (!loginOn()) return { ok: false, why: "login-off" };
  const client = new ConnectionsRepo(getDb()).client(clientId);
  if (!client) return { ok: false, why: "unknown-client" };
  if (!client.redirectUris.includes(redirectUri)) return { ok: false, why: "bad-redirect" };
  return { ok: true, clientName: client.name };
}

/** Who is asking to connect, if the request can go ahead. */
export const getConnectRequest = createServerFn({ method: "GET" })
  .validator(z.object({ clientId: z.string().max(100), redirectUri: z.string().max(2000) }).strict())
  .handler(({ data }) => judge(data.clientId, data.redirectUri));

/** Let the client in as `personId`: where to send the browser, with its code. */
export const approveConnection = createServerFn({ method: "POST" })
  .validator(z.object({ request: authorisation, personId: z.uuid() }).strict())
  .handler(({ data: { request, personId } }) => {
    const judged = judge(request.client_id, request.redirect_uri);
    if (!judged.ok) throw new Error(`Can't connect: ${judged.why}`);
    if (!new PeopleRepo(getDb()).get(personId)) throw new Error("No such person");
    const code = new ConnectionsRepo(getDb()).approve(request.client_id, personId, request.code_challenge, request.redirect_uri);
    return { to: sendBack(request.redirect_uri, { code }, request.state) };
  });

export const listConnections = createServerFn({ method: "GET" }).handler(() => new ConnectionsRepo(getDb()).list());

export const disconnect = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid() }).strict())
  .handler(({ data }) => new ConnectionsRepo(getDb()).disconnect(data.id));

export type Connections = Awaited<ReturnType<typeof listConnections>>;
export const connectionsQuery = queryOptions({ queryKey: ["connections"], queryFn: () => listConnections() });

export function connectRequestQuery(clientId: string, redirectUri: string) {
  return queryOptions({ queryKey: ["connect", clientId, redirectUri], queryFn: () => getConnectRequest({ data: { clientId, redirectUri } }) });
}

/** Disconnecting, through the outbox (src/app/model/outbox.ts). Approving isn't: it needs the server there and then. */
export const connectionsSaves = {
  disconnect: save({
    key: "disconnect",
    query: connectionsQuery.queryKey,
    send: (data: { id: string }) => disconnect({ data }),
    apply: (connections: Connections, { id }) => connections.filter((c) => c.id !== id),
  }),
};

/** connectionsQuery as useSuspenseQuery returns it; `options` (`select`, …) override its defaults. */
export function useConnections<TData = Connections>(options?: Omit<UseSuspenseQueryOptions<Connections, Error, TData, string[]>, "queryKey" | "queryFn">) {
  return useSuspenseQuery({ ...connectionsQuery, ...options } as UseSuspenseQueryOptions<Connections, Error, TData, string[]>);
}
