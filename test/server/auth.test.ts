import { existsSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { PasswordRepo, SessionRepo } from "../../src/db/models/auth/repo";
import { readSessionCookie, sessionCookieOptions } from "../../src/server/auth/cookie";
import { isOpenFunction, isOpenPath, safeNext } from "../../src/server/auth/gate";
import { hashPassword, LoginLimiter, loginRequired, verifyPassword } from "../../src/server/auth/password";
import { useTestDb } from "../db/helpers";

test("a password's hash checks the password and nothing else, salted afresh each time", async () => {
  const hash = await hashPassword("correct horse");
  expect(hash).toMatch(/^\$argon2id\$/);
  expect(await verifyPassword("correct horse", hash)).toBe(true);
  expect(await verifyPassword("wrong horse", hash)).toBe(false);
  expect(await hashPassword("correct horse")).not.toBe(hash);
});

test("logins are on unless EXPECTING_LOGIN is off, and a value that is neither is refused", () => {
  expect(loginRequired({})).toBe(true);
  expect(loginRequired({ EXPECTING_LOGIN: "on" })).toBe(true);
  expect(loginRequired({ EXPECTING_LOGIN: " OFF " })).toBe(false);
  expect(() => loginRequired({ EXPECTING_LOGIN: "false" })).toThrow(/on or off/);
});

test("ten failures lock a client out until they age out", () => {
  const limiter = new LoginLimiter(10, 60_000);
  for (let i = 0; i < 10; i++) limiter.fail("a", 1000 + i);
  expect(limiter.locked("a", 2000)).toBe(true);
  expect(limiter.locked("b", 2000)).toBe(false);
  expect(limiter.locked("a", 1000 + 60_000 + 5)).toBe(false);
});

test.each([
  [undefined, "/"],
  ["/checklist", "/checklist"],
  ["/week/28?x=1", "/week/28?x=1"],
  ["https://evil.example", "/"],
  ["//evil.example", "/"],
  ["/\\evil.example", "/"],
])("after login, %s goes to %s", (next, expected) => {
  expect(safeNext(next)).toBe(expected);
});

test("the cookie round-trips and is Secure only over HTTPS", () => {
  const plain = new Request("http://expecting.lan/api/rpc/login");
  const proxied = new Request("http://expecting.lan/api/rpc/login", { headers: { "x-forwarded-proto": "https" } });
  expect(sessionCookieOptions(plain).secure).toBe(false);
  expect(sessionCookieOptions(proxied).secure).toBe(true);
  expect(sessionCookieOptions(plain).httpOnly).toBe(true);
  expect(readSessionCookie(new Request("http://x/", { headers: { cookie: "a=1; expecting_session=abc%3D; b=2" } }))).toBe("abc=");
});

describe("what is open without a session", () => {
  test("by path, only the login page and the health check", () => {
    expect(isOpenPath("/login")).toBe(true);
    expect(isOpenPath("/api/health")).toBe(true);
    expect(isOpenPath("/api/login")).toBe(false);
    expect(isOpenPath("/settings")).toBe(false);
  });

  test("by file, only the session's server functions", () => {
    expect(isOpenFunction("src/api/rpc/session.ts")).toBe(true);
    expect(isOpenFunction("src/api/rpc/people.ts")).toBe(false);
  });

  test("the open file is where login and logout are defined", () => {
    // A move or rename that forgets the gate would lock everyone out; this catches it first.
    expect(existsSync(new URL("../../src/api/rpc/session.ts", import.meta.url))).toBe(true);
  });
});

describe("sessions", () => {
  const db = useTestDb();

  test("a created session checks out, and ends", () => {
    const repo = new SessionRepo(db());
    const token = repo.create();
    expect(repo.check(token)).toBe(true);
    expect(repo.check("not-a-token")).toBe(false);
    repo.end(token);
    expect(repo.check(token)).toBe(false);
  });

  test("the database holds a hash, not the token", () => {
    const token = new SessionRepo(db()).create();
    const row = db().query<{ token_hash: string }, []>("SELECT token_hash FROM session").get();
    expect(row!.token_hash).not.toContain(token);
    expect(row!.token_hash).toMatch(/^[0-9a-f]{64}$/);
  });

  test("a session unused for over 400 days has expired", () => {
    const repo = new SessionRepo(db());
    const token = repo.create(new Date("2026-01-01T00:00:00Z"));
    expect(repo.check(token, new Date("2026-12-01T00:00:00Z"))).toBe(true);
    // Used on 1 Dec, so it lives 400 days from then.
    expect(repo.check(token, new Date("2027-12-01T00:00:00Z"))).toBe(true);
    expect(repo.check(token, new Date("2029-02-01T00:00:00Z"))).toBe(false);
  });
});

describe("the password", () => {
  const db = useTestDb();

  test("is unset in a new database", () => {
    expect(new PasswordRepo(db()).hash()).toBeNull();
  });

  test("is chosen once: whoever is first keeps it", () => {
    const repo = new PasswordRepo(db());
    expect(repo.choose("$argon2id$first")).toBe(true);
    expect(repo.choose("$argon2id$second")).toBe(false);
    expect(repo.hash()).toBe("$argon2id$first");
  });
});
