// Connecting Claude: a client registers itself, /connect lets it in as one of
// you, the code it is sent back with becomes a token that answers at
// /api/mcp, and Settings lists it and disconnects it.
import { createHash } from "node:crypto";
import { expect, test } from "./fixtures";

const CALLBACK = "http://127.0.0.1:5555/callback";
const verifier = "e2e-verifier-".padEnd(48, "x");
const challenge = createHash("sha256").update(verifier).digest("base64url");

test("connect Claude, call a tool as Jason, then disconnect it", async ({ page, open }) => {
  const client = await (await page.request.post("/api/oauth/register", { data: { client_name: "Claude", redirect_uris: [CALLBACK] } })).json();

  // Where the browser is sent back: Claude's listener, here a page that says it arrived.
  let back: URL | null = null;
  await page.route(`${CALLBACK}**`, (route) => {
    back = new URL(route.request().url());
    return route.fulfill({ contentType: "text/html", body: "<h1>Back in Claude</h1>" });
  });

  const query = new URLSearchParams({
    response_type: "code",
    client_id: client.client_id,
    redirect_uri: CALLBACK,
    code_challenge: challenge,
    code_challenge_method: "S256",
    state: "1234",
  });
  await open(`/connect?${query}`);
  await expect(page.getByRole("heading", { name: "Connect Claude" })).toBeVisible();
  await page.getByRole("button", { name: "Allow" }).click();
  await expect(page.getByRole("heading", { name: "Back in Claude" })).toBeVisible();
  expect(back!.searchParams.get("state")).toBe("1234");

  const tokens = await (
    await page.request.post("/api/oauth/token", {
      form: {
        grant_type: "authorization_code",
        client_id: client.client_id,
        code: back!.searchParams.get("code")!,
        redirect_uri: CALLBACK,
        code_verifier: verifier,
      },
    })
  ).json();
  const call = () =>
    page.request.post("/api/mcp", {
      headers: { authorization: `Bearer ${tokens.access_token}`, accept: "application/json, text/event-stream" },
      data: { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "this_week", arguments: {} } },
    });
  const answered = await (await call()).json();
  expect(JSON.parse(answered.result.content[0].text)).toMatchObject({ you: "Jason" });

  await open("/settings");
  const claude = page.getByRole("region", { name: "Claude" });
  await expect(claude.getByText("Claude, as Jason")).toBeVisible();
  await claude.getByRole("button", { name: "Disconnect" }).click();
  await expect(claude.getByText("Claude, as Jason")).toHaveCount(0);
  await expect.poll(async () => (await call()).status()).toBe(401);
});
