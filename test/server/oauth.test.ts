import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";

// The OAuth endpoints against a real database in a temp DATA_DIR, through a
// whole connection: register, approve (as /connect does), swap, refresh.
let dir: string;
let oauth: typeof import("../../src/server/oauth/endpoints");
let db: typeof import("../../src/server/core/db");
let gate: typeof import("../../src/server/auth/gate");
let ConnectionsRepo: typeof import("../../src/db/models/connections/repo").ConnectionsRepo;
let PeopleRepo: typeof import("../../src/db/models/people/repo").PeopleRepo;

beforeAll(async () => {
  dir = mkdtempSync(join(tmpdir(), "expecting-oauth-"));
  vi.stubEnv("DATA_DIR", dir);
  vi.resetModules();
  oauth = await import("../../src/server/oauth/endpoints");
  db = await import("../../src/server/core/db");
  gate = await import("../../src/server/auth/gate");
  ({ ConnectionsRepo } = await import("../../src/db/models/connections/repo"));
  ({ PeopleRepo } = await import("../../src/db/models/people/repo"));
});

afterAll(() => {
  db.closeDb();
  rmSync(dir, { recursive: true, force: true });
  vi.unstubAllEnvs();
});

const ORIGIN = "https://expecting.example.ts.net";
const CALLBACK = "https://claude.ai/api/mcp/auth_callback";
const verifier = "a".repeat(43);
const challenge = new Bun.CryptoHasher("sha256").update(verifier).digest("base64url");

function post(path: string, body: string, type = "application/x-www-form-urlencoded") {
  return new Request(`${ORIGIN}${path}`, { method: "POST", headers: { "content-type": type }, body });
}

test("the metadata says where to register, authorise and swap, at the public address", async () => {
  const request = new Request("http://10.0.0.2:9966/.well-known/oauth-authorization-server", {
    headers: { "x-forwarded-proto": "https", "x-forwarded-host": "expecting.example.ts.net" },
  });
  const server = await oauth.authorizationServer(request).json();
  expect(server).toMatchObject({
    issuer: ORIGIN,
    authorization_endpoint: `${ORIGIN}/connect`,
    token_endpoint: `${ORIGIN}/api/oauth/token`,
    code_challenge_methods_supported: ["S256"],
  });
  const resource = await oauth.protectedResource(request).json();
  expect(resource).toMatchObject({ resource: `${ORIGIN}/api/mcp`, authorization_servers: [ORIGIN] });
});

describe("registering", () => {
  test("refuses an address that isn't HTTPS or this machine", async () => {
    const response = await oauth.register(post("/api/oauth/register", JSON.stringify({ redirect_uris: ["http://evil.example/cb"] }), "application/json"));
    expect(response.status).toBe(400);
    const local = await oauth.register(post("/api/oauth/register", JSON.stringify({ redirect_uris: ["http://localhost:33418/callback"] }), "application/json"));
    expect(local.status).toBe(201);
  });
});

test("a whole connection: register, approve, swap the code with its verifier, call, refresh", async () => {
  const registered = await (
    await oauth.register(post("/api/oauth/register", JSON.stringify({ client_name: "Claude", redirect_uris: [CALLBACK] }), "application/json"))
  ).json();
  const person = new PeopleRepo(db.getDb()).add("Sam", "carrying");
  const code = new ConnectionsRepo(db.getDb()).approve(registered.client_id, person.id, challenge, CALLBACK);

  const wrong = await oauth.token(
    post(
      "/api/oauth/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: registered.client_id,
        code,
        redirect_uri: CALLBACK,
        code_verifier: "b".repeat(43),
      }).toString()
    )
  );
  expect(wrong.status).toBe(400);

  const again = new ConnectionsRepo(db.getDb()).approve(registered.client_id, person.id, challenge, CALLBACK);
  const swapped = await oauth.token(
    post(
      "/api/oauth/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: registered.client_id,
        code: again,
        redirect_uri: CALLBACK,
        code_verifier: verifier,
      }).toString()
    )
  );
  expect(swapped.status).toBe(200);
  const tokens = await swapped.json();
  expect(tokens).toMatchObject({ token_type: "Bearer", expires_in: 86_400 });

  const call = new Request(`${ORIGIN}/api/mcp`, { method: "POST", headers: { authorization: `Bearer ${tokens.access_token}` } });
  expect(gate.gate(call)).toBeNull();
  expect(gate.grantOf(call)?.personId).toBe(person.id);
  expect(gate.grantOf(new Request(`${ORIGIN}/api/mcp`, { method: "POST", headers: { authorization: "Bearer nonsense" } }))).toBeNull();

  const refreshed = await oauth.token(
    post(
      "/api/oauth/token",
      new URLSearchParams({ grant_type: "refresh_token", client_id: registered.client_id, refresh_token: tokens.refresh_token }).toString()
    )
  );
  expect(refreshed.status).toBe(200);
  expect(gate.grantOf(call)).not.toBeNull();

  await oauth.revoke(post("/api/oauth/revoke", new URLSearchParams({ token: tokens.access_token }).toString()));
  expect(gate.grantOf(call)).toBeNull();
});

test("the OAuth endpoints are open; the rest of /api still isn't", () => {
  for (const path of ["/.well-known/oauth-authorization-server", "/.well-known/oauth-protected-resource/api/mcp", "/api/oauth/token", "/api/oauth/register"]) {
    expect(gate.gate(new Request(`${ORIGIN}${path}`, { method: "POST" }))).toBeNull();
  }
  expect(gate.gate(new Request(`${ORIGIN}/api/oauth/other`, { method: "POST" }))?.status).toBe(401);
});
