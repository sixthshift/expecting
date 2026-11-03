import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { builtInItems } from "../../src/content";
import { todayISO } from "../../src/lib/dates";

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
  expect([...names].sort()).toEqual(
    [
      "about_us",
      "add_appointment",
      "add_line",
      "add_note",
      "add_question",
      "add_task",
      "appointments",
      "change_appointment",
      "emergency_info",
      "get_paper",
      "its_time",
      "journal",
      "lists",
      "log_craving",
      "log_feeling",
      "log_movement",
      "log_sickness",
      "mark_first",
      "mark_line",
      "mark_question_asked",
      "questions",
      "read_library",
      "remove",
      "search_library",
      "tasks",
      "this_week",
      "tick_task",
      "week",
      "whats_new",
      "your_people",
    ].sort()
  );
  const remove = body.result.tools.find((t: { name: string }) => t.name === "remove");
  expect(remove.annotations.destructiveHint).toBe(true);
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

describe("reading, for an assistant", () => {
  test("about us gives the people, the answers in words and the extras on", async () => {
    const { FactsRepo } = await import("../../src/db/models/facts/repo");
    const { ExtrasRepo } = await import("../../src/db/models/extras/repo");
    new FactsRepo(db.getDb()).answer({ question: "firstBaby", about: null, value: "yes", answeredBy: personId });
    new ExtrasRepo(db.getDb()).set({ id: "food-safety", on: true, changedBy: personId });
    const about = JSON.parse((await call("about_us")).text);
    expect(about.people).toEqual([{ name: "Sam", role: "carrying", you: true }]);
    expect(about.answers).toContainEqual({ question: "Is this your first baby?", answer: "Yes" });
    expect(about.extras.map((e: { name: string }) => e.name)).toContain("Food and drink");
  });

  test("a task's window comes as days too", async () => {
    const [task] = JSON.parse((await call("tasks", { show: "all" })).text);
    expect(task.opensOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(task.dueBy >= task.opensOn).toBe(true);
    const week = JSON.parse((await call("week", { week: 30 })).text);
    expect(week.days.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test("the Library takes a question asked in a sentence", async () => {
    const found = JSON.parse((await call("search_library", { query: "can I get the whooping cough vaccine while pregnant?" })).text);
    expect(found.length).toBeGreaterThan(0);
    expect(found.slice(0, 3).some((e: { title: string }) => /whooping cough/i.test(e.title))).toBe(true);
  });

  test("It's time is your own plan, and your people are there to write to", async () => {
    const plan = JSON.parse((await call("its_time")).text);
    expect(plan.call.ringNowIf.length).toBeGreaterThan(0);
    expect(plan.underWay).toBeNull();
    const people = JSON.parse((await call("your_people")).text);
    expect(people).toEqual({ people: [], gifts: [], announcement: null });
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

  test("an appointment is kept, read with its week, and changed; an unknown one refused", async () => {
    const today = todayISO();
    const { id } = JSON.parse((await call("add_appointment", { title: "Midwife", day: today, time: "10:30" })).text);
    expect(JSON.parse((await call("appointments")).text)).toEqual([
      { id, title: "Midwife", day: today, week: 28, time: "10:30", place: null, notes: null, by: "Sam" },
    ]);
    await call("change_appointment", { id, title: "Midwife", day: today, time: null, place: "Clinic" });
    expect(JSON.parse((await call("appointments")).text)[0]).toMatchObject({ time: null, place: "Clinic" });
    const nobody = await call("change_appointment", { id: crypto.randomUUID(), title: "GP", day: today });
    expect(nobody.isError).toBe(true);
  });

  test("nothing that names a private entry is kept", async () => {
    const refused = await call("add_question", { text: `About ${PRIVATE.id}` });
    expect(refused.isError).toBe(true);
    expect(JSON.parse((await call("questions")).text)).toEqual([]);
  });

  test("a changed appointment keeps what wasn't given", async () => {
    const today = todayISO();
    const { id } = JSON.parse((await call("add_appointment", { title: "GP", day: today, time: "09:00", place: "Clinic" })).text);
    await call("change_appointment", { id, time: "11:15" });
    const kept = JSON.parse((await call("appointments")).text).find((a: { id: string }) => a.id === id);
    expect(kept).toMatchObject({ title: "GP", day: today, time: "11:15", place: "Clinic" });
  });

  test("a question isn't kept twice, and an unknown one isn't marked asked", async () => {
    const first = JSON.parse((await call("add_question", { text: "Is my iron OK?" })).text);
    const again = JSON.parse((await call("add_question", { text: "is my iron ok" })).text);
    expect(again).toEqual({ alreadyKept: "question", id: first.id });
    expect((await call("mark_question_asked", { id: crypto.randomUUID(), answer: "Fine" })).isError).toBe(true);
    await call("mark_question_asked", { id: first.id, answer: "Keep taking it" });
    expect(JSON.parse((await call("questions", { show: "asked", query: "iron" })).text)).toEqual([
      expect.objectContaining({ id: first.id, answer: "Keep taking it" }),
    ]);
    expect(JSON.parse((await call("questions", { show: "open", query: "iron" })).text)).toEqual([]);
  });

  test("a line is added to a list and marked; an unknown section or line refused", async () => {
    const { kept, id } = JSON.parse((await call("add_line", { list: "bag", title: "Lip balm", section: "for-her" })).text);
    expect(kept).toBe("line");
    expect((await call("add_line", { list: "bag", title: "Socks", section: "nowhere" })).isError).toBe(true);
    await call("mark_line", { line: id, state: "got", how: "bought", note: "The good one" });
    await call("mark_line", { line: id, state: "got" });
    const bag = JSON.parse((await call("lists", { list: "bag" })).text);
    const line = bag.sections.flatMap((s: { lines: unknown[] }) => s.lines).find((l: { id: string }) => l.id === id);
    expect(line).toMatchObject({ title: "Lip balm", state: "got", note: "The good one" });
    expect((await call("mark_line", { line: "no-such-line", state: "got" })).isError).toBe(true);
  });

  test("the Journal is found by words and days, and what's new since a day is in one place", async () => {
    await call("add_note", { text: "Midwife said the iron looks fine", day: "2020-01-05" });
    const found = JSON.parse((await call("journal", { query: "midwife iron" })).text);
    expect(found).toEqual([expect.objectContaining({ kind: "note", day: "2020-01-05" })]);
    expect(JSON.parse((await call("journal", { query: "midwife", to: "2019-12-31" })).text)).toEqual([]);
    const news = JSON.parse((await call("whats_new", { since: todayISO() })).text);
    expect(news.journal.map((e: { text: string }) => e.text)).toContain("Midwife said the iron looks fine");
    expect(news.questions.map((q: { text: string }) => q.text)).toContain("Is my iron OK?");
    expect(news.ticked.length).toBeGreaterThan(0);
    expect(news.lines.length).toBeGreaterThan(0);
  });

  test("what was kept wrong is removed, saying what it was; the other's feeling never is", async () => {
    const { id } = JSON.parse((await call("add_note", { text: "Kept on the wrong day" })).text);
    const removed = JSON.parse((await call("remove", { what: "note", id })).text);
    expect(removed).toMatchObject({ removed: "note", was: { text: "Kept on the wrong day" } });
    expect((await call("remove", { what: "note", id })).isError).toBe(true);
    expect((await call("remove", { what: "task", id: "no-such-task" })).isError).toBe(true);

    const { PeopleRepo } = await import("../../src/db/models/people/repo");
    const { FeelingsRepo } = await import("../../src/db/models/feelings/repo");
    const other = new PeopleRepo(db.getDb()).add("Alex", "partner").id;
    const theirs = new FeelingsRepo(db.getDb()).add({ id: crypto.randomUUID(), day: todayISO(), time: null, step: "low", words: [], note: null }, other);
    expect((await call("remove", { what: "feeling", id: theirs.id })).isError).toBe(true);
    expect(new FeelingsRepo(db.getDb()).list(other).some((f) => f.id === theirs.id)).toBe(true);
  });
});
