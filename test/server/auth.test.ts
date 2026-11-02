import { existsSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { InviteRepo, normaliseCode, SessionRepo } from "../../src/db/models/auth/repo";
import { PeopleRepo } from "../../src/db/models/people/repo";
import { safeNext } from "../../src/lib/next";
import { readSessionCookie, sessionCookieOptions } from "../../src/server/auth/cookie";
import { isOpenFunction, isOpenPath } from "../../src/server/auth/gate";
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
  test("by path, only the login page, joining and resetting by a code, and the health check", () => {
    expect(isOpenPath("/login")).toBe(true);
    expect(isOpenPath("/join")).toBe(true);
    expect(isOpenPath("/reset")).toBe(true);
    expect(isOpenPath("/password")).toBe(false);
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
  const sam = () => new PeopleRepo(db()).add("Sam", "carrying").id;

  test("a created session is its person's, and ends", () => {
    const repo = new SessionRepo(db());
    const id = sam();
    const token = repo.create(id);
    expect(repo.check(token)).toBe(id);
    expect(repo.check("not-a-token")).toBeNull();
    repo.end(token);
    expect(repo.check(token)).toBeNull();
  });

  test("the database holds a hash, not the token", () => {
    const token = new SessionRepo(db()).create(sam());
    const row = db().query<{ token_hash: string }, []>("SELECT token_hash FROM session").get();
    expect(row!.token_hash).not.toContain(token);
    expect(row!.token_hash).toMatch(/^[0-9a-f]{64}$/);
  });

  test("a session unused for over 400 days has expired", () => {
    const repo = new SessionRepo(db());
    const id = sam();
    const token = repo.create(id, new Date("2026-01-01T00:00:00Z"));
    expect(repo.check(token, new Date("2026-12-01T00:00:00Z"))).toBe(id);
    // Used on 1 Dec, so it lives 400 days from then.
    expect(repo.check(token, new Date("2027-12-01T00:00:00Z"))).toBe(id);
    expect(repo.check(token, new Date("2029-02-01T00:00:00Z"))).toBeNull();
  });

  test("logging out everywhere ends a person's sessions, but the one kept, and not the other's", () => {
    const repo = new SessionRepo(db());
    const id = sam();
    const jason = new PeopleRepo(db()).add("Jason", "partner").id;
    const [here, there, his] = [repo.create(id), repo.create(id), repo.create(jason)];
    repo.endAllFor(id, here);
    expect([repo.check(here), repo.check(there), repo.check(his)]).toEqual([id, null, jason]);
    repo.endAllFor(id);
    expect(repo.check(here)).toBeNull();
  });

  test("a person removed takes their sessions with them", () => {
    const repo = new SessionRepo(db());
    const id = sam();
    const token = repo.create(id);
    db().run("DELETE FROM person WHERE id = ?", [id]);
    expect(repo.check(token)).toBeNull();
  });
});

describe("invites", () => {
  const db = useTestDb();
  const now = new Date("2026-11-02T09:00:00Z");
  const days = (n: number) => new Date(now.getTime() + n * 86_400_000);

  test("a code is twelve characters in threes, easy to read off a screen and type", () => {
    const sam = new PeopleRepo(db()).add("Sam", "carrying").id;
    const { code } = new InviteRepo(db()).create("join", sam, null, now);
    expect(code).toMatch(/^[0-9A-HJKMNP-TV-Z]{3}(-[0-9A-HJKMNP-TV-Z]{3}){3}$/);
    expect(normaliseCode(code.toLowerCase().replaceAll("-", " "))).toBe(code);
    expect(normaliseCode("o1l-")).toBe("011");
  });

  test("an invite to join lives a week, and works once", () => {
    const repo = new InviteRepo(db());
    const sam = new PeopleRepo(db()).add("Sam", "carrying").id;
    const { code, expiresAt } = repo.create("join", sam, null, now);
    expect(expiresAt).toBe(days(7).toISOString());
    expect(repo.find(code, "join", days(6))).toEqual({ kind: "join", personId: null, by: sam, expiresAt });
    expect(repo.find(code, "reset", now)).toBeNull();
    expect(repo.find(code, "join", days(8))).toBeNull();
    repo.use(code.toLowerCase());
    expect(repo.find(code, "join", now)).toBeNull();
  });

  test("one at a time: a new invite ends the last", () => {
    const repo = new InviteRepo(db());
    const sam = new PeopleRepo(db()).add("Sam", "carrying").id;
    const first = repo.create("join", sam, null, now);
    const second = repo.create("join", sam, null, now);
    expect(repo.find(first.code, "join", now)).toBeNull();
    expect(repo.find(second.code, "join", now)).not.toBeNull();
  });

  test("a reset is for one person, lives a day, and only its code is kept", () => {
    const repo = new InviteRepo(db());
    const people = new PeopleRepo(db());
    const sam = people.add("Sam", "carrying").id;
    const jason = people.add("Jason", "partner").id;
    const { code } = repo.create("reset", sam, jason, now);
    expect(repo.find(code, "reset", now)?.personId).toBe(jason);
    expect(repo.find(code, "reset", days(2))).toBeNull();
    const row = db().query<{ code_hash: string }, []>("SELECT code_hash FROM invite").get();
    expect(row!.code_hash).toMatch(/^[0-9a-f]{64}$/);
  });
});
