import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";

// The gate against a real database in a temp DATA_DIR. The database is
// opened once, so the module is loaded fresh after the env is set.
let dir: string;
let gateModule: typeof import("../../src/server/auth/gate");
let db: typeof import("../../src/server/core/db");
let SessionRepo: typeof import("../../src/db/models/auth/repo").SessionRepo;

beforeAll(async () => {
  dir = mkdtempSync(join(tmpdir(), "expecting-gate-"));
  vi.stubEnv("DATA_DIR", dir);
  vi.resetModules();
  gateModule = await import("../../src/server/auth/gate");
  db = await import("../../src/server/core/db");
  ({ SessionRepo } = await import("../../src/db/models/auth/repo"));
});

afterAll(() => {
  db.closeDb();
  rmSync(dir, { recursive: true, force: true });
  vi.unstubAllEnvs();
});

const PEOPLE = "src/api/rpc/people.ts";
const SESSION = "src/api/rpc/session.ts";

function request(path: string, init: RequestInit = {}) {
  return new Request(`http://expecting.lan${path}`, init);
}

describe("without a session", () => {
  test("a page goes to log in, remembering where it was going", () => {
    const response = gateModule.gate(request("/settings", { headers: { accept: "text/html" } }));
    expect(response?.status).toBe(302);
    expect(response?.headers.get("location")).toBe("http://expecting.lan/login?next=%2Fsettings");
  });

  test("an API call is refused", () => {
    expect(gateModule.gate(request("/api/anything", { method: "POST" }))?.status).toBe(401);
  });

  test("an upload's bytes are refused, as an <img> asks for them or a download", () => {
    const id = "11111111-1111-4111-8111-111111111111";
    expect(gateModule.gate(request(`/api/files/${id}/thumb`, { headers: { accept: "image/avif,image/webp,*/*" } }))?.status).toBe(401);
    expect(gateModule.gate(request(`/api/files/${id}/original?download`))?.status).toBe(401);
  });

  test("the login page and the health check are open", () => {
    expect(gateModule.gate(request("/login", { headers: { accept: "text/html" } }))).toBeNull();
    expect(gateModule.gate(request("/api/health"))).toBeNull();
  });

  test("a server function call passes the path check, then only the session's functions answer", () => {
    const call = request("/api/rpc/abc", { method: "POST" });
    expect(gateModule.gate(call)).toBeNull();
    expect(gateModule.refuseFunction(call, SESSION)).toBeNull();
    expect(gateModule.refuseFunction(call, PEOPLE)?.status).toBe(401);
  });
});

test("with a session, every server function answers", () => {
  const token = new SessionRepo(db.getDb()).create();
  const call = request("/api/rpc/abc", { method: "POST", headers: { cookie: `expecting_session=${token}` } });
  expect(gateModule.refuseFunction(call, PEOPLE)).toBeNull();
  expect(gateModule.gate(request("/settings", { headers: { accept: "text/html", cookie: `expecting_session=${token}` } }))).toBeNull();
});
