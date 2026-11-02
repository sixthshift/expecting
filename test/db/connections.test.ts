import { describe, expect, test } from "vitest";
import { ConnectionsRepo, REFRESH_MS } from "../../src/db/models/connections/repo";
import { PeopleRepo } from "../../src/db/models/people/repo";
import { useTestDb } from "./helpers";

const db = useTestDb();
const now = new Date("2026-11-01T10:00:00Z");
const later = (ms: number) => new Date(now.getTime() + ms);
const yes = () => true;

function setUp() {
  const repo = new ConnectionsRepo(db());
  const jason = new PeopleRepo(db()).add("Jason", "partner", now);
  const client = repo.register("Claude", ["https://claude.ai/api/mcp/auth_callback"], now);
  const code = repo.approve(client.id, jason.id, "challenge", client.redirectUris[0]!, now);
  return { repo, jason, client, code, redirect: client.redirectUris[0]! };
}

describe("a code", () => {
  test("swaps once for tokens that speak for whoever allowed it", () => {
    const { repo, jason, client, code, redirect } = setUp();
    const tokens = repo.redeem(code, client.id, redirect, yes, now);
    expect(tokens).not.toBeNull();
    expect(repo.check(tokens!.accessToken, now)?.personId).toBe(jason.id);
    expect(repo.redeem(code, client.id, redirect, yes, now)).toBeNull();
  });

  test("is refused for another client, another address, a wrong verifier, or after a minute, and is spent either way", () => {
    for (const attempt of [
      (s: ReturnType<typeof setUp>) => s.repo.redeem(s.code, "someone-else", s.redirect, yes, now),
      (s: ReturnType<typeof setUp>) => s.repo.redeem(s.code, s.client.id, "https://evil.example/cb", yes, now),
      (s: ReturnType<typeof setUp>) => s.repo.redeem(s.code, s.client.id, s.redirect, (c) => c === "other", now),
      (s: ReturnType<typeof setUp>) => s.repo.redeem(s.code, s.client.id, s.redirect, yes, later(61_000)),
    ]) {
      const s = setUp();
      expect(attempt(s)).toBeNull();
      expect(s.repo.redeem(s.code, s.client.id, s.redirect, yes, now)).toBeNull();
    }
  });
});

describe("tokens", () => {
  test("an access token lasts a day; a refresh token swaps once for new ones", () => {
    const { repo, client, code, redirect } = setUp();
    const first = repo.redeem(code, client.id, redirect, yes, now)!;
    expect(repo.check(first.accessToken, later(86_400_001))).toBeNull();
    expect(repo.check(first.refreshToken, now)).toBeNull();
    const second = repo.refresh(first.refreshToken, client.id, later(86_400_001))!;
    expect(repo.check(second.accessToken, later(86_400_001))).not.toBeNull();
    expect(repo.refresh(first.refreshToken, client.id, now)).toBeNull();
    expect(repo.refresh(second.refreshToken, "someone-else", now)).toBeNull();
    expect(repo.refresh(second.refreshToken, client.id, later(86_400_001 + REFRESH_MS + 1))).toBeNull();
  });

  test("revoking one drops it; disconnecting drops them all and the connection", () => {
    const { repo, client, code, redirect } = setUp();
    const tokens = repo.redeem(code, client.id, redirect, yes, now)!;
    repo.revoke(tokens.accessToken);
    expect(repo.check(tokens.accessToken, now)).toBeNull();
    const again = repo.refresh(tokens.refreshToken, client.id, now)!;
    const [connection] = repo.list();
    expect(connection).toMatchObject({ clientName: "Claude", personName: "Jason" });
    repo.disconnect(connection!.id);
    expect(repo.check(again.accessToken, now)).toBeNull();
    expect(repo.refresh(again.refreshToken, client.id, now)).toBeNull();
    expect(repo.list()).toEqual([]);
  });
});

test("pruning forgets a client nobody connected after a day, and keeps one in use", () => {
  const { repo, client } = setUp();
  const idle = repo.register("Someone", ["https://example.com/cb"], now);
  repo.prune(later(86_400_001));
  expect(repo.client(idle.id)).toBeNull();
  expect(repo.client(client.id)).not.toBeNull();
});
