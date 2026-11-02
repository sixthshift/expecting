import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { builtInItems } from "../../src/content";

// /api/mcp as Claude calls it: JSON-RPC over HTTP with a bearer token got by
// connecting, against a real database in a temp DATA_DIR.
let dir: string;
let mcp: typeof import("../../src/api/rest/mcp");
let db: typeof import("../../src/server/core/db");
let token: string;
let personId: string;

const PRIVATE = builtInItems.find((i) => i.private)!;

beforeAll(async () => {
  dir = mkdtempSync(join(tmpdir(), "expecting-mcp-"));
  vi.stubEnv("DATA_DIR", dir);
  vi.resetModules();
  mcp = await import("../../src/api/rest/mcp");
  db = await import("../../src/server/core/db");
  const { ConnectionsRepo } = await import("../../src/db/models/connections/repo");
  const { PeopleRepo } = await import("../../src/db/models/people/repo");
  const { SettingsRepo } = await import("../../src/db/models/settings/repo");
  personId = new PeopleRepo(db.getDb()).add("Sam", "carrying").id;
  const due = new Date(Date.now() + 12 * 7 * 86_400_000).toISOString().slice(0, 10);
  new SettingsRepo(db.getDb()).update({ dueDate: due as never });
  const repo = new ConnectionsRepo(db.getDb());
  const client = repo.register("Claude", ["https://claude.ai/cb"]);
  const code = repo.approve(client.id, personId, "c", "https://claude.ai/cb");
  token = repo.redeem(code, client.id, "https://claude.ai/cb", () => true)!.accessToken;
});

afterAll(() => {
  db.closeDb();
  rmSync(dir, { recursive: true, force: true });
  vi.unstubAllEnvs();
});

let next = 1;
async function rpc(method: string, params: unknown = {}, bearer = token) {
  const response = await mcp.handleMcp(
    new Request("https://expecting.example/api/mcp", {
      method: "POST",
      headers: { authorization: `Bearer ${bearer}`, "content-type": "application/json", accept: "application/json, text/event-stream" },
      body: JSON.stringify({ jsonrpc: "2.0", id: next++, method, params }),
    })
  );
  return { status: response.status, headers: response.headers, body: response.status === 200 ? await response.json() : null };
}

async function call(name: string, args: Record<string, unknown> = {}) {
  const { body } = await rpc("tools/call", { name, arguments: args });
  const result = body.result as { content: { type: string; text?: string }[]; isError?: boolean };
  return { ...result, text: result.content.find((c) => c.type === "text")?.text ?? "" };
}

test("without a live token, a 401 saying where to find out how to connect", async () => {
  const { status, headers } = await rpc("tools/list", {}, "nonsense");
  expect(status).toBe(401);
  expect(headers.get("www-authenticate")).toContain('resource_metadata="https://expecting.example/.well-known/oauth-protected-resource/api/mcp"');
});

test("initialises with Expecting's instructions, and lists its tools", async () => {
  const init = await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "1" } });
  expect(init.body.result.serverInfo.name).toBe("expecting");
  expect(init.body.result.instructions).toContain("never about her body");
  const { body } = await rpc("tools/list");
  const names = body.result.tools.map((t: { name: string }) => t.name);
  expect(names).toEqual(expect.arrayContaining(["this_week", "tasks", "search_library", "read_library", "journal", "add_note", "log_movement", "get_paper"]));
});

describe("reading", () => {
  test("this week says where you are, the note, and what to do", async () => {
    const week = JSON.parse((await call("this_week")).text);
    expect(week).toMatchObject({ you: "Sam", week: 28 });
    expect(week.note).toContain("## The baby");
    expect(Array.isArray(week.toDoNow)).toBe(true);
  });

  test("the Library finds and reads entries, never a private one", async () => {
    const found = JSON.parse((await call("search_library", { query: "whooping cough" })).text);
    expect(found.length).toBeGreaterThan(0);
    const entry = await call("read_library", { id: found[0].id });
    expect(entry.text).toContain(`# ${found[0].title}`);
    expect(entry.text).not.toContain("{%");
    expect((await call("read_library", { id: PRIVATE.id })).isError).toBe(true);
    const words = PRIVATE.title.split(" ").slice(0, 2).join(" ");
    expect(JSON.parse((await call("search_library", { query: words })).text).map((e: { id: string }) => e.id)).not.toContain(PRIVATE.id);
  });
});

describe("keeping", () => {
  test("a note is kept as the person connected, and shows in the Journal", async () => {
    expect((await call("add_note", { text: "First proper kick tonight" })).isError).toBeFalsy();
    await call("log_movement", { text: "Lots after dinner" });
    await call("log_feeling", { step: "good", words: ["excited"] });
    const story = JSON.parse((await call("journal")).text);
    expect(story.find((e: { kind: string }) => e.kind === "note")).toMatchObject({ by: "Sam", text: "First proper kick tonight", week: 28 });
    expect(story.find((e: { kind: string }) => e.kind === "feeling")).toMatchObject({ step: "good", words: ["excited"] });
  });

  test("a task is ticked, and an unknown one refused", async () => {
    const [task] = JSON.parse((await call("tasks", { show: "all" })).text);
    await call("tick_task", { task: task.id });
    expect(JSON.parse((await call("tasks", { show: "done" })).text).map((t: { id: string }) => t.id)).toContain(task.id);
    expect((await call("tick_task", { task: "no-such-task" })).isError).toBe(true);
  });

  test("nothing that names a private entry is kept", async () => {
    const refused = await call("add_question", { text: `About ${PRIVATE.id}` });
    expect(refused.isError).toBe(true);
    expect(JSON.parse((await call("questions")).text)).toEqual([]);
  });
});
