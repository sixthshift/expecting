import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { builtInItems } from "../../src/content";
import { SQUARES } from "../../src/lib/bingo";

// A private entry leaves no trace in the space both phones share: no write
// path accepts its id, or the words the app would save for it. The rule is
// function middleware every server function runs through, so this runs each
// write path's input, as its page would send it, through that middleware.
let dir: string;
let middleware: typeof import("../../src/server/privacy/middleware");
let start: typeof import("../../src/start");
let db: typeof import("../../src/server/core/db");

beforeAll(async () => {
  dir = mkdtempSync(join(tmpdir(), "expecting-private-"));
  vi.stubEnv("DATA_DIR", dir);
  vi.resetModules();
  middleware = await import("../../src/server/privacy/middleware");
  start = await import("../../src/start");
  db = await import("../../src/server/core/db");
});

afterAll(() => {
  db.closeDb();
  rmSync(dir, { recursive: true, force: true });
  vi.unstubAllEnvs();
});

const UUID = "00000000-0000-4000-8000-000000000000";

/**
 * Every write path, by file and name, with its input carrying `x` in each
 * place a string goes; null for one that takes nothing. A new write path
 * fails "every write path is here" until it is added.
 */
const WRITES: Record<string, ((x: string) => unknown) | null> = {
  "checklist.ts:setTicked": (x) => ({ taskId: x, ticked: true }),
  "checklist.ts:addOwnTask": (x) => ({ id: UUID, title: x, week: 20 }),
  "checklist.ts:deleteOwnTask": (x) => ({ id: x }),
  "questions.ts:addQuestion": (x) => ({ id: UUID, text: x }),
  "questions.ts:markAsked": (x) => ({ id: UUID, answer: x }),
  "questions.ts:reopenQuestion": (x) => ({ id: x }),
  "questions.ts:deleteQuestion": (x) => ({ id: x }),
  "names.ts:addName": (x) => ({ id: UUID, name: x }),
  "names.ts:voteName": (x) => ({ id: x, liked: true }),
  "names.ts:swipeName": (x) => ({ id: UUID, name: x, liked: true }),
  "names.ts:unvoteName": (x) => ({ name: x }),
  "names.ts:superlikeName": (x) => ({ id: UUID, name: x, day: "2026-11-01" }),
  "names.ts:takeOffName": (x) => ({ id: x }),
  "facts.ts:saveAnswer": (x) => ({ key: "cover", answer: x }),
  "people.ts:becomePerson": (x) => ({ id: x }),
  "people.ts:addPerson": (x) => ({ name: x, role: "partner" }),
  "people.ts:forgetPerson": null,
  "extras.ts:setExtras": (x) => [{ id: x, on: true }],
  "settings.ts:saveSettings": (x) => ({ dueDate: x }),
  "settings.ts:finishOnboarding": null,
  "emergency.ts:saveEmergency": (x) => ({ carerPhone: x, notes: x }),
  "connections.ts:approveConnection": (x) => ({
    request: {
      response_type: "code",
      client_id: x,
      redirect_uri: "https://claude.ai/cb",
      code_challenge: "a".repeat(43),
      code_challenge_method: "S256",
      state: x,
    },
    personId: UUID,
  }),
  "connections.ts:disconnect": (x) => ({ id: x }),
  "quiet.ts:setQuiet": (x) => ({ kind: x }),
  "circle.ts:addCirclePerson": (x) => ({ id: UUID, name: x, note: x }),
  "circle.ts:renameCirclePerson": (x) => ({ id: UUID, name: x, note: x }),
  "circle.ts:setCirclePerson": (x) => ({ id: UUID, patch: { help: x } }),
  "circle.ts:deleteCirclePerson": (x) => ({ id: x }),
  "circle.ts:addGift": (x) => ({ id: UUID, personId: UUID, what: x }),
  "circle.ts:thankGift": (x) => ({ id: x, thanked: true }),
  "circle.ts:deleteGift": (x) => ({ id: x }),
  "circle.ts:setAnnouncement": (x) => ({ body: x }),
  "jobs.ts:pickJob": (x) => ({ jobId: x, pick: "me" }),
  "jobs.ts:unpickJob": (x) => ({ jobId: x }),
  "weekly.ts:answerWeekly": (x) => ({ week: 20, body: x }),
  "bingo.ts:dealCard": (x) => ({ squares: [x, ...SQUARES.slice(1, 24).map((s) => s.id)] }),
  "bingo.ts:markSquare": (x) => ({ squareId: x, day: "2026-11-01", note: x }),
  "bingo.ts:unmarkSquare": (x) => ({ squareId: x }),
  "quiet.ts:clearQuiet": null,
  "journal.ts:addNote": (x) => ({ id: UUID, day: "2026-10-30", time: null, body: x }),
  "journal.ts:editNote": (x) => ({ id: UUID, day: "2026-10-30", time: null, body: x, kind: "letter" }),
  "journal.ts:restoreNote": (x) => ({
    id: UUID,
    kind: "note",
    day: "2026-10-30",
    time: null,
    body: x,
    different: false,
    by: null,
    createdAt: "2026-10-30T00:00:00.000Z",
    editedBy: null,
    editedAt: null,
  }),
  "journal.ts:deleteNote": (x) => ({ id: x }),
  "journal.ts:addMovement": (x) => ({ id: UUID, day: "2026-10-30", time: "21:00", body: x, different: false }),
  "journal.ts:editMovement": (x) => ({ id: UUID, day: "2026-10-30", time: "21:00", body: x, different: true }),
  "journal.ts:restoreMovement": (x) => ({
    id: UUID,
    kind: "movement",
    day: "2026-10-30",
    time: "21:00",
    body: x,
    different: false,
    by: null,
    createdAt: "2026-10-30T00:00:00.000Z",
    editedBy: null,
    editedAt: null,
  }),
  "journal.ts:deleteMovement": (x) => ({ id: x }),
  "journal.ts:markJournalSeen": null,
  "firsts.ts:markFirst": (x) => ({ key: x, day: "2026-10-30" }),
  "firsts.ts:setFirstAside": (x) => ({ key: x }),
  "firsts.ts:unmarkFirst": (x) => ({ key: x }),
  "firsts.ts:setFirstWords": (x) => ({ key: "first-kick", body: x }),
  "feelings.ts:addFeeling": (x) => ({ id: UUID, day: "2026-10-30", time: null, step: "low", words: [], note: x }),
  "feelings.ts:changeFeeling": (x) => ({ id: UUID, day: "2026-10-30", time: null, step: "low", words: [], note: x }),
  "feelings.ts:deleteFeeling": (x) => ({ id: x }),
  "appetite.ts:addAppetite": (x) => ({ id: UUID, kind: "craving", day: "2026-10-30", time: "21:00", how: null, what: x, note: x }),
  "appetite.ts:editAppetite": (x) => ({ id: UUID, kind: "off", day: "2026-10-30", time: null, how: null, what: x, note: x }),
  "appetite.ts:restoreAppetite": (x) => ({
    id: UUID,
    kind: "craving",
    day: "2026-10-30",
    time: "21:00",
    how: null,
    what: x,
    note: x,
    by: null,
    createdAt: "2026-10-30T00:00:00.000Z",
    editedBy: null,
    editedAt: null,
  }),
  "appetite.ts:deleteAppetite": (x) => ({ id: x }),
  "files.ts:putUpload": (x) => upload(x),
  "photos.ts:addPhoto": (x) => ({ id: UUID, fileId: UUID, kind: "scan", day: "2026-10-30", time: "09:40", caption: x }),
  "photos.ts:editPhoto": (x) => ({ id: UUID, kind: "bump", day: "2026-10-30", time: null, caption: x }),
  "photos.ts:deletePhoto": (x) => ({ id: x }),
  "papers.ts:addPaper": (x) => ({
    id: UUID,
    kind: "result",
    title: x,
    itemId: null,
    day: "2026-10-30",
    note: x,
    handy: false,
    pages: [{ fileId: UUID, type: "application/pdf", name: x, size: 1 }],
  }),
  "papers.ts:editPaper": (x) => ({ id: UUID, kind: "letter", title: x, itemId: x, day: "2026-10-30", note: x, handy: true }),
  "papers.ts:deletePaper": (x) => ({ id: x }),
  "lists.ts:addList": (x) => ({ id: UUID, title: x }),
  "lists.ts:renameList": (x) => ({ id: UUID, title: x }),
  "lists.ts:deleteList": (x) => ({ id: x }),
  "lists.ts:addLine": (x) => ({ id: UUID, listId: x, title: x, section: x }),
  "lists.ts:changeLine": (x) => ({ id: UUID, title: x, section: x }),
  "lists.ts:deleteLine": (x) => ({ id: x }),
  "lists.ts:markLine": (x) => ({ lineId: x, state: "got", how: null, note: x }),
  "itsTime.ts:beginStart": (x) => ({ id: x, waters: true }),
  "itsTime.ts:setWaters": (x) => ({ startId: UUID, waters: x }),
  "itsTime.ts:leaveStart": (x) => ({ startId: x }),
  "itsTime.ts:endStart": (x) => ({ startId: UUID, ended: x }),
  "itsTime.ts:deleteStart": (x) => ({ id: x }),
  "itsTime.ts:beginContraction": (x) => ({ id: x, startId: UUID }),
  "itsTime.ts:endContraction": (x) => ({ id: x, startId: UUID, startedAt: "2026-11-20T02:00:00.000Z" }),
  "itsTime.ts:noteContraction": (x) => ({ id: UUID, note: x }),
  "itsTime.ts:deleteContraction": (x) => ({ id: x }),
  "itsTime.ts:tickStart": (x) => ({ startId: UUID, key: x, ticked: true }),
  "itsTime.ts:addStartLine": (x) => ({ id: UUID, title: x }),
  "itsTime.ts:deleteStartLine": (x) => ({ id: x }),
};

/** An upload as a phone sends it: a form, with `x` as its name and its file's. */
function upload(x: string): FormData {
  const form = new FormData();
  form.set("id", UUID);
  form.set("name", x);
  form.set("original", new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], x, { type: "image/jpeg" }));
  return form;
}

/** The session's own: choosing the password and logging in, which save only a hash and must never be refused. */
const SESSION = ["session.ts:choosePassword", "session.ts:login", "session.ts:logout"];

const RPC = "src/api/rpc";

test("every write path is here", () => {
  const found = readdirSync(RPC).flatMap((file) =>
    Array.from(readFileSync(join(RPC, file), "utf8").matchAll(/export const (\w+) = createServerFn\(\{ method: "POST" \}\)/g), (m) => `${file}:${m[1]}`)
  );
  expect(found.sort()).toEqual([...Object.keys(WRITES), ...SESSION].sort());
});

test("every server function passes the rule: it is registered for all of them", async () => {
  const options = await start.startInstance.getOptions();
  expect(options.functionMiddleware).toContain(middleware.privateFunctionMiddleware);
});

/** Run `data` through the middleware as a call to a function in `file` would. Resolves to the refusal, or null if it went on. */
async function call(file: string, data: unknown): Promise<Response | null> {
  const server = (middleware.privateFunctionMiddleware.options as { server: (opts: unknown) => unknown }).server;
  let went = false;
  try {
    await server({
      data,
      serverFnMeta: { filename: `${RPC}/${file}` },
      next: () => {
        went = true;
        return {};
      },
    });
  } catch (refused) {
    if (refused instanceof Response) return refused;
    throw refused;
  }
  expect(went).toBe(true);
  return null;
}

const secret = builtInItems.filter((i) => i.private);
const names = secret.flatMap((i) => [i.id, i.title, i.ask, `About ${i.title.toLowerCase()}`].filter((n): n is string => n !== null));

describe("no write path accepts a private entry", () => {
  test("there are private entries to keep", () => {
    expect(secret.length).toBeGreaterThanOrEqual(3);
  });

  const cases = Object.entries(WRITES).flatMap(([path, input]) => (input ? names.map((name) => [path, name, input] as const) : []));

  test.each(cases)("%s refuses %j", async (path, name, input) => {
    const refused = await call(path.split(":")[0]!, input(name));
    expect(refused?.status).toBe(400);
  });

  test("however deep it sits", async () => {
    expect((await call("questions.ts", { text: { nested: [secret[0]!.id] } }))?.status).toBe(400);
  });

  test("an ordinary save goes through", async () => {
    for (const [path, input] of Object.entries(WRITES)) {
      expect(await call(path.split(":")[0]!, input ? input("Ask about the glucose test") : undefined), path).toBeNull();
    }
  });

  test("the session's own are never refused: a password is only ever a hash", async () => {
    expect(await call("session.ts", { password: secret[0]!.title })).toBeNull();
  });
});
