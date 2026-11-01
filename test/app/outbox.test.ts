import { MutationObserver, onlineManager, QueryClient } from "@tanstack/react-query";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { questionsQuery } from "../../src/api/rpc/questions";
import { markKept } from "../../src/app/model/kept";
import { outboxCaches, queueSaves, type Waiting } from "../../src/app/model/outbox";
import { sendAgain } from "../../src/lib/errors";
import type { Question } from "../../src/lib/questions";

const toast = vi.hoisted(() => vi.fn());
vi.mock("@sixthshift/design-system/overlay", () => ({ toast }));

// The outbox (src/app/model/outbox.ts) over a query client, with no React and
// no IndexedDB: the questions' saves, sent by a stand-in for the server.

type Sent = { id: string; text: string };

let client: QueryClient;
let server: Question[];
let send: ReturnType<typeof vi.fn<(w: Waiting<Sent>) => Promise<unknown>>>;

beforeEach(() => {
  server = [];
  send = vi.fn(async (w: Waiting<Sent>) => {
    server.push({ id: w.input.id, text: w.input.text, answer: null, askedAt: null, itemId: null, by: null, createdAt: w.made.at });
  });
  client = new QueryClient({ ...outboxCaches(() => client), defaultOptions: { queries: { retry: false, networkMode: "offlineFirst" } } });
  queueSaves(client);
  // As queueSaves has it, but sent to the stand-in, without waiting between tries.
  client.setMutationDefaults(["addQuestion"], { mutationFn: send, scope: { id: "outbox" }, networkMode: "online", retry: sendAgain, retryDelay: 1 });
  client.mount();
  toast.mockClear();
});

afterEach(() => {
  client.unmount();
  onlineManager.setOnline(true);
});

/** Fetch the questions as the server has them now (or as the worker kept them: the same, to the page). */
function fetchQuestions() {
  return client.fetchQuery({ queryKey: questionsQuery.queryKey, queryFn: () => structuredClone(server), staleTime: 0 });
}

function add(id: string, text: string) {
  void new MutationObserver<unknown, Error, Waiting<Sent>>(client, { mutationKey: ["addQuestion"] })
    .mutate({ id, made: { at: "2026-10-30T07:30:00.000Z", by: null }, input: { id, text } })
    .catch(() => {});
}

/** Fetch the questions as the service worker kept them, asked for at `asked`: `then`, not the server's now. */
function fetchKept(then: Question[], asked: number) {
  return client.fetchQuery({
    queryKey: questionsQuery.queryKey,
    queryFn: () => {
      const data = structuredClone(then);
      markKept(data, asked);
      return data;
    },
    staleTime: 0,
  });
}

const shown = () => client.getQueryData<Question[]>(questionsQuery.queryKey)?.map((q) => q.text);
const settled = () => vi.waitFor(() => expect(client.isMutating()).toBe(0));

test("offline, a save shows at once, stays shown over what's fetched, and goes once there's a connection", async () => {
  await fetchQuestions();
  onlineManager.setOnline(false);
  add("11111111-1111-4111-8111-111111111111", "Is the RSV vaccine free?");
  await vi.waitFor(() => expect(shown()).toEqual(["Is the RSV vaccine free?"]));

  await fetchQuestions();
  expect(shown()).toEqual(["Is the RSV vaccine free?"]);
  expect(send).not.toHaveBeenCalled();

  onlineManager.setOnline(true);
  await settled();
  expect(send).toHaveBeenCalledTimes(1);
  expect(server.map((q) => q.createdAt)).toEqual(["2026-10-30T07:30:00.000Z"]);
  await fetchQuestions();
  expect(shown()).toEqual(["Is the RSV vaccine free?"]);
});

test("saves go one at a time, in the order made", async () => {
  onlineManager.setOnline(false);
  add("11111111-1111-4111-8111-111111111111", "First");
  add("22222222-2222-4222-8222-222222222222", "Second");
  add("33333333-3333-4333-8333-333333333333", "Third");
  onlineManager.setOnline(true);
  await settled();
  expect(server.map((q) => q.text)).toEqual(["First", "Second", "Third"]);
});

test("with a connection that goes nowhere, a save is sent again until it gets through", async () => {
  send.mockRejectedValueOnce(new TypeError("Failed to fetch")).mockRejectedValueOnce(new TypeError("Load failed"));
  add("11111111-1111-4111-8111-111111111111", "Is the RSV vaccine free?");
  await settled();
  expect(send).toHaveBeenCalledTimes(3);
  expect(server.map((q) => q.text)).toEqual(["Is the RSV vaccine free?"]);
  expect(toast).not.toHaveBeenCalled();
});

test("a save the server turns away is taken back, and says so", async () => {
  await fetchQuestions();
  send.mockRejectedValueOnce(Response.json({ error: "That stays private, so it isn't saved" }, { status: 400 }));
  add("11111111-1111-4111-8111-111111111111", "About family violence");
  await settled();
  expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "That didn't save" }));
  await fetchQuestions();
  expect(shown()).toEqual([]);
});

test("a save that landed stays shown over an answer the worker kept from before it, and not over the network's", async () => {
  await fetchQuestions();
  const before = Date.now() - 1;
  add("11111111-1111-4111-8111-111111111111", "Is the RSV vaccine free?");
  await settled();
  expect(server.map((q) => q.text)).toEqual(["Is the RSV vaccine free?"]);

  // The connection drops as the page looks again: the worker answers with its copy, from before the save landed.
  await fetchKept([], before);
  expect(shown()).toEqual(["Is the RSV vaccine free?"]);

  // A copy asked for after it landed already has it, or has it gone for a reason.
  await fetchKept([], Date.now() + 1);
  expect(shown()).toEqual([]);

  // The network's answer is the server's: the other phone took it away.
  server = [];
  await fetchQuestions();
  expect(shown()).toEqual([]);
});
