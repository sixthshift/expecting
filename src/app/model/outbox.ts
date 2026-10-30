// The outbox: every save (src/lib/outbox.ts; the list is ./saves.ts) goes
// through it, online or not, as a TanStack Query mutation.
//
//   made       it shows at once (its `apply` on the query it changes), and is
//              written to this phone (./outboxStore.ts) before it is sent
//   waiting    one at a time, in the order made (one scope); with no
//              connection it pauses, and goes when there is one; with one that
//              goes nowhere it tries again, a little later each time
//   fetched    while it waits, it is applied over every answer fetched for its
//              query: the service worker's kept answer is from before it
//   reopened   saves left waiting when the app closed are put back in the
//              queue (restoreOutbox, before the app's first queries), shown
//              again, and sent
//   sent       taken off this phone; once nothing waits, every query refetches
//   refused    taken off this phone, and put back on screen by a refetch, with
//              a toast; a 401 keeps it, to go once logged in again
//
// There is no "offline" on screen: a save shows as made, and gets there.

import { toast } from "@sixthshift/design-system/overlay";
import { hashKey, hydrate, MutationCache, onlineManager, QueryCache, type QueryClient, type QueryKey } from "@tanstack/react-query";
import { isLoggedOut, sendAgain, sendAgainIn } from "../../lib/errors";
import type { Made } from "../../lib/outbox";
import { loggedOut } from "./loggedOut";
import { type Entry, forget, keep, nextSeq, waitingEntries } from "./outboxStore";
import { type AnySave, SAVES } from "./saves";

/** One queue: saves go in the order made, so an untick never arrives before its tick. */
const SCOPE = { id: "outbox" };

/** A save as its mutation carries it. */
export type Waiting<Input = unknown> = { id: string; made: Made; input: Input };

const byKey = new Map(SAVES.map((save) => [save.key, save]));

function saveOf(mutation: { options: { mutationKey?: QueryKey } }): AnySave | undefined {
  const key = mutation.options.mutationKey?.[0];
  return typeof key === "string" ? byKey.get(key) : undefined;
}

/** Saves not yet sent, oldest first, but for `except`. */
function waiting(client: QueryClient, except?: object): { save: AnySave; waiting: Waiting }[] {
  return client
    .getMutationCache()
    .getAll()
    .filter((m) => m !== except && m.state.status === "pending")
    .flatMap((m) => {
      const save = saveOf(m);
      return save ? [{ save, waiting: m.state.variables as Waiting }] : [];
    });
}

/** `data`, as fetched for `queryKey`, with every save still waiting for it applied over it. */
function replay(client: QueryClient, queryKey: QueryKey, data: unknown): unknown {
  const hash = hashKey(queryKey);
  let next = data;
  for (const { save, waiting: w } of waiting(client)) if (hashKey(save.query) === hash) next = save.apply(next, w.input, w.made);
  return next;
}

/** Put `save` on screen: on its query's data, if there is any yet; a fetch applies it when it comes. */
function show(client: QueryClient, save: AnySave, w: Waiting) {
  client.setQueryData(save.query, (data: unknown) => (data === undefined ? data : save.apply(data, w.input, w.made)));
}

/** The query client's two caches, with the outbox in them: `client` is the client they belong to. */
export function outboxCaches(client: () => QueryClient) {
  return {
    queryCache: new QueryCache({
      onSuccess: (data, query) => {
        const next = replay(client(), query.queryKey, data);
        if (next !== data) client().setQueryData(query.queryKey, next);
      },
    }),
    mutationCache: new MutationCache({
      onMutate: async (variables, mutation) => {
        const save = saveOf(mutation);
        if (!save) return;
        const w = variables as Waiting;
        show(client(), save, w);
        await keep({ id: w.id, key: save.key, input: w.input, made: w.made, seq: nextSeq() });
      },
      onSuccess: async (_data, variables, _context, mutation) => {
        if (!saveOf(mutation)) return;
        await forget((variables as Waiting).id);
        if (waiting(client(), mutation).length === 0) void client().invalidateQueries();
      },
      onError: async (error, variables, _context, mutation) => {
        if (!saveOf(mutation)) return;
        // Kept on the phone: sent once logged in again.
        if (isLoggedOut(error)) return loggedOut();
        await forget((variables as Waiting).id);
        toast({ intent: "danger", title: "That didn't save", children: "Expecting couldn't save a change, so it's back as it was." });
        void client().invalidateQueries();
      },
    }),
  };
}

/** Each save's mutation: sent by its server function, one at a time, through any number of dropped connections. */
export function queueSaves(client: QueryClient): void {
  for (const save of SAVES) {
    client.setMutationDefaults([save.key], {
      mutationFn: (w: Waiting) => save.send(w.input, w.made),
      scope: SCOPE,
      // Waits, paused, while the phone says it's offline.
      networkMode: "online",
      retry: sendAgain,
      retryDelay: sendAgainIn,
    });
  }
  // Query only hears the phone go offline or come back: one opened offline would otherwise start out "online".
  if (typeof navigator !== "undefined" && typeof navigator.onLine === "boolean") onlineManager.setOnline(navigator.onLine);
}

let restoring: Promise<void> | undefined;

/** Saves left waiting when the app last closed: back in the queue, on screen, and on their way. Once a page; awaited before the app's queries. */
export function restoreOutbox(client: QueryClient): Promise<void> {
  restoring ??= restore(client);
  return restoring;
}

async function restore(client: QueryClient) {
  const known = new Set(waiting(client).map((w) => w.waiting.id));
  const left: Entry[] = [];
  for (const entry of await waitingEntries()) {
    if (known.has(entry.id)) continue;
    // A save this build no longer has: nothing can send it.
    if (!byKey.has(entry.key)) void forget(entry.id);
    else left.push(entry);
  }
  if (left.length === 0) return;
  hydrate(client, {
    queries: [],
    mutations: left.map((entry) => ({
      mutationKey: [entry.key],
      scope: SCOPE,
      state: {
        status: "pending",
        isPaused: true,
        variables: { id: entry.id, made: entry.made, input: entry.input } satisfies Waiting,
        context: undefined,
        data: undefined,
        error: null,
        failureCount: 0,
        failureReason: null,
        submittedAt: entry.seq,
      },
    })),
  });
  for (const { save, waiting: w } of waiting(client)) if (left.some((e) => e.id === w.id)) show(client, save, w);
  void client.resumePausedMutations();
}
