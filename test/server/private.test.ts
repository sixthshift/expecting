import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { builtInItems } from "../../src/content";

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
  "checklist.ts:addOwnTask": (x) => ({ title: x, week: 20 }),
  "checklist.ts:deleteOwnTask": (x) => ({ id: x }),
  "questions.ts:addQuestion": (x) => ({ text: x }),
  "questions.ts:markAsked": (x) => ({ id: UUID, answer: x }),
  "questions.ts:reopenQuestion": (x) => ({ id: x }),
  "questions.ts:deleteQuestion": (x) => ({ id: x }),
  "names.ts:addName": (x) => ({ name: x }),
  "names.ts:voteName": (x) => ({ id: x, liked: true }),
  "names.ts:removeName": (x) => ({ id: x }),
  "facts.ts:saveAnswer": (x) => ({ key: "cover", answer: x }),
  "people.ts:becomePerson": (x) => ({ id: x }),
  "people.ts:addPerson": (x) => ({ name: x, role: "partner" }),
  "people.ts:forgetPerson": null,
  "extras.ts:setExtras": (x) => [{ id: x, on: true }],
  "settings.ts:saveSettings": (x) => ({ dueDate: x }),
  "settings.ts:finishOnboarding": null,
  "emergency.ts:saveEmergency": (x) => ({ carerPhone: x, notes: x }),
};

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
