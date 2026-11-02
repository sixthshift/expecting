# Plan: Expecting as an MCP server

Claude (the phone app, claude.ai, Desktop, Claude Code) connects to Expecting
and works in it as one of you: reads the week, the to do, the Library and the
Journal, and keeps what the "+" keeps. Decided 2026-11-01:

- **Reach: everywhere, by OAuth.** claude.ai and the phone app connect from
  Anthropic's cloud, so an Expecting that offers this is reachable from the
  internet over HTTPS (Tailscale Funnel, or the reverse proxy). That settles
  the open question in `architecture.md` for whoever turns it on.
- **Scope: read, and every capture** but photos and papers going up (no bytes
  in through MCP): notes and letters, movements, sickness and cravings,
  feelings, firsts, questions, tasks (add, tick).
- **Papers: pages included.** Claude may fetch a paper's pages and a photo,
  as images. Expecting still never reads them; Claude does, when asked, and
  the server's instructions tell it not to call anything normal.

## Shape

```
Claude ──OAuth 2.1 (DCR, PKCE)──▶ /.well-known/*, /api/oauth/{register,token,revoke}
       └──browser──▶ /connect (behind the gate: log in, say who, allow) ──▶ code
Claude ──Bearer──▶ /api/mcp (Streamable HTTP, stateless, JSON) ──▶ repos ──▶ expecting.db
```

- **One endpoint, `/api/mcp`**, a server route (`src/api/rest/mcp.ts`), the
  SDK's `WebStandardStreamableHTTPServerTransport`, stateless (a fresh server
  per request, no session id) with JSON responses. The tools are
  `src/api/mcp/`, one file per domain, calling the repos directly.
- **The gate:** `/api/mcp` is judged by its bearer token, never the cookie;
  the metadata, `register`, `token` and `revoke` are open (they are how a
  token is got). Everything else unchanged.
- **Authorising is a page, `/connect`,** behind the gate like any page, so
  it is the password that lets Claude in: logged out, `/login` comes first
  and sends you back. It asks who is connecting (a person, as the phone
  does) and to allow it, and its server function (`approveConnection`,
  `src/api/rpc/connections.ts`) returns the redirect with the code. With
  `EXPECTING_LOGIN=off` it refuses: no password, nothing to stand behind a
  public address.
- **Tokens like sessions:** stored as SHA-256 only. A code lives a minute;
  an access token a day; a refresh token 400 days from its last use,
  rotated on each use. A grant names its client and its person, so every
  save is by that person, stamped now.
- **Settings lists the connections** (the client's name, who, last used) and
  disconnects one: its tokens go.
- **Private entries are absent.** Not in search, not readable by id, and
  every write passes `refusePrivate` like a server function's input.
- **Tailoring is shared:** `tailorItems` and `tailorTasks` move from their
  hooks into `src/lib/tailor.ts` so the tools see what the app shows.

## Tools

Read: `this_week` (where you are, the note, today's read, to do now),
`week` (any week's note and what's on it), `tasks`, `search_library`,
`read_library`, `journal` (newest first, by week or kind), `questions`,
`emergency_info`, `lists`, `get_paper` and `get_photo` (images).

Write: `tick_task`, `add_task`, `add_question`, `mark_question_asked`,
`add_note` (or a letter), `log_movement`, `log_sickness`, `log_craving`,
`log_feeling`, `mark_first`.

The server's `instructions` carry the principles: directive about bookings,
claims and purchases, never about her body; not medical advice, and anything
worrying goes to the triage entry's who-to-call; papers and photos are
described when asked, never judged.

## Steps

1. Tailoring to `lib/`; the store (`035_connections.sql`, `connections`
   domain) and the OAuth endpoints, the gate. Tests for PKCE, rotation,
   expiry, revocation, the gate.
2. `/connect` and Settings' connections.
3. `/api/mcp` and the read tools.
4. The write tools, through `refusePrivate`; `test/server/private.test.ts`
   lists them.
5. Papers and photos as images.
6. Docs: `docs/product/connect.md`, architecture's Access, development's
   "Connecting Claude", CLAUDE.md's constraints; this plan folded in and
   deleted.
