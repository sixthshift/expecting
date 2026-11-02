import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, expect, test, vi } from "vitest";

// The gate with EXPECTING_LOGIN=off, against a real database in a temp
// DATA_DIR. It reads both once, so the module is loaded fresh after the env
// is set, in a file of its own.
let dir: string;
let gateModule: typeof import("../../src/server/auth/gate");
let db: typeof import("../../src/server/core/db");

beforeAll(async () => {
  dir = mkdtempSync(join(tmpdir(), "expecting-gate-open-"));
  vi.stubEnv("DATA_DIR", dir);
  vi.stubEnv("EXPECTING_LOGIN", "off");
  vi.resetModules();
  gateModule = await import("../../src/server/auth/gate");
  db = await import("../../src/server/core/db");
});

afterAll(() => {
  db.closeDb();
  rmSync(dir, { recursive: true, force: true });
  vi.unstubAllEnvs();
});

function request(path: string, init: RequestInit = {}) {
  return new Request(`http://expecting.lan${path}`, init);
}

test("logins off stops asking for passwords, not who you are: without a session, it's still to /login", () => {
  expect(gateModule.loginOn()).toBe(false);
  expect(gateModule.gate(request("/settings", { headers: { accept: "text/html" } }))?.headers.get("location")).toBe(
    "http://expecting.lan/login?next=%2Fsettings"
  );
  expect(gateModule.gate(request("/login", { headers: { accept: "text/html" } }))).toBeNull();
  expect(gateModule.gate(request("/api/anything", { method: "POST" }))?.status).toBe(401);
  expect(gateModule.refuseFunction(request("/api/rpc/abc", { method: "POST" }), "src/api/rpc/people.ts")?.status).toBe(401);
});
