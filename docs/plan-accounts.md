# Two accounts

Expecting today has one shared password and, separately, a cookie in which each phone says who is holding it (`docs/architecture.md`, Access). The cookie is not authentication: anyone past the password can be either of you. This plan makes the two of you two accounts, so who's holding the phone is who logged in.

## Why

- **What's meant to be per person becomes really so.** The words of how you're feeling, your names-game votes before the other has voted, and who does what before both have answered are each kept from the other's phone today, but switching to the other person ("Someone else is using it") shows them all. With accounts, they're private for real.
- **"Jason did this" becomes true.** Who answered, who logged a movement, and whose task it is: each is said by whoever logged in, not by whoever a phone claims to be.
- **Recovery without wiping.** Today a forgotten password means a new database. With two accounts, each of you can let the other back in.

Why not before: the docs chose one password because nothing you keep needs hiding from the other parent. That still holds for the shared space; what changes is the handful of things already designed as one person's own.

## The shape

- **Two members at most, one in each role.** `carrying` (the one who's pregnant, or will be) and `partner`, as now (`src/lib/people.ts`). The database refuses a third person or a second in a role, not just the onboarding screen.
- **Either of you can be first, and one is a whole setup.** A single parent, a partner who never joins, or a partner running the admin for a pregnant person who doesn't want another app: each is one member, in either role. Nothing assumes the person holding the phone is the one who's pregnant; her body's parts and her tasks read as hers ("the one who's pregnant's" until she has a name), as they already do for the partner before they've joined.
- **No primary.** The two accounts can do the same things, each letting the other back in. Who set it up is only who came first.
- **No usernames.** The login screen shows your names; tap yours, then your password. With one member, it asks for the password under the name.
- **Not now: guests.** Someone who helps but isn't a parent (a birth support, a doula, later grandparents) would be a narrow, read-mostly thing such as a link to It's time and Emergency info, not a third account. Out of this plan.
- **Names are shown before login.** Accepted: it's self-hosted, and the names are all that's shown.

## Getting in

- **First visit** (a new instance, nobody yet): `/login` is "Set up Expecting". It asks which of you you are, the one who's pregnant (or will be) or the partner, then your name and a password (8 or more), and logs you in, on to onboarding's due date. Whoever reaches it first sets it up, accepted as the shared password's first visit is today, for the same reason.
- **Then the other place is closed.** The login screen shows only who's here; there is no place left on it to claim. The other joins only by invite: in Settings, the member makes one, a link (`/join?code=…`, the code shown under it to type) to send, alive 7 days, used once, one at a time; making a new one ends the old. Opening it asks the other's name and password, for the remaining role, and logs that phone in. Inviting is offered, never required.
- **Logging in:** tap your name, your password, and a session for that person, as today: a 400-day cookie, only its SHA-256 stored.
- **Rate limited per person and client:** ten failures in fifteen minutes locks that client out of that person, so guessing at one of you doesn't lock out the other.

## Looking after it (Settings, under who you are)

- **Change your password:** your current one, then the new one. Your other sessions end; this phone stays in.
- **Log out everywhere:** ends all your sessions, this phone's too.
- **Let the other back in:** makes a reset link for them, alive a day, used once. Opening it asks for their new password; using it ends all their sessions. The same shape as an invite, so it's one table.
- **Log out**, as today. "Someone else is using it" goes: on a shared phone, someone else logs out and the other logs in.

## Logins off

`EXPECTING_LOGIN=off` stops asking for passwords, not who you are: `/login` is the names to tap, and tapping one starts a session with no password. Before anyone is set up it asks only the name and role. Invites still work, with no password asked. So every request knows its person the same way, on or off, and the `expecting_person` cookie goes.

`/connect` still refuses with logins off, as today.

## What changes in the code

- **Schema** (migration `036_accounts.sql`):
  - `person` gains `password_hash` (null with logins off, until one is chosen) and `password_set_at`, and a unique index on `role`.
  - `session` gains `person_id`, not null, `REFERENCES person(id) ON DELETE CASCADE`.
  - A new `invite` table: the code's SHA-256, its kind (`join` or `reset`), the person it resets (for a reset), who made it, when, and when it ends.
  - The `password` table goes. Existing data: the shared password's hash is copied into each existing person's `password_hash`, marked as still the shared one (`password_set_at` null), so each of you logs in with the old password under your own name and is then asked to choose your own before going on. Existing sessions are deleted (they have no person), so both phones log in once more. This moves the data across; there is no alias, shim or second path in the code.
- **Repos:** `PasswordRepo` goes; `PeopleRepo` gains `setPassword` and `verify`; `SessionRepo.create(personId)` and `check(token)` returns the person (or null) in place of a boolean, plus `endAllFor(personId, except?)`; `InviteRepo` (in `auth`).
- **Who you are:** `personId()` (`src/server/core/person.ts`) reads the session's person, not a cookie. Its twenty callers in `src/api/rpc/` are unchanged.
- **Session functions** (`src/api/rpc/session.ts`, the open file): `getAccess` adds the members' names and ids, for the login screen; `setUp`, `login(personId, password)`, `join(code, name, password)`, `resetWith(code, password)`, `logout`. The signed-in ones (`changePassword`, `logOutEverywhere`, `invite`, `resetLink`) go in `src/api/rpc/people.ts`, behind the gate. `src/server/privacy/` already exempts the session's functions; the new ones in `people.ts` carry only passwords and codes, but go on `test/server/private.test.ts`'s list.
- **People:** `addPerson`, `becomePerson` and `forgetPerson` go; `getPeople` stays.
- **Onboarding:** the "who" step goes (`src/lib/onboarding.ts` loses `known`): logging in or joining has said it. Onboarding is the due date onward, as for the first phone today; the second phone joins straight into the app.
- **MCP:** `approveConnection` (`src/api/rpc/connections.ts`) takes the person from the session, not from its input, so a connection is always by whoever approved it.
- **Pages:** `/login` (names, then password; set-up when empty), `/join` and `/reset` (open paths, each a code then a form), Settings' account section in place of `Session.tsx`'s switch.
- **Words:** the role's fallback name says "the one who's pregnant" or "the partner" everywhere (`whose()` says "The birth parent's" today). "There are no accounts" leaves onboarding and the docs.
- **Docs:** `docs/architecture.md`, Access and Who's holding the phone, rewritten as built; CLAUDE.md's Auth constraint; this plan deleted once it's folded in.

## Steps

1. Schema, migration (with the existing data carried over) and repos, with their tests (`test/db/`).
2. The gate and `personId()` from the session; the session functions; the rate limit per person; `approveConnection` from the session.
3. `/login` (set-up, names, password), logins off as names only.
4. Invites and resets: `/join`, `/reset`, Settings' account section; the person cookie, the "who" step and the old switch removed.
5. e2e: the fixture logs in as a named person (each test's `person`); specs for set-up, joining by invite, a reset, a third person refused, per-person privacy on the wire (`e2e/mood.spec.ts` as the other person, now refused).
6. Docs folded in, this plan deleted.

## Decided

- Either role can set up first, there's no primary, and the second place is claimed only by invite.
- An invite is a link, with its code shown under it to type.
- After the move from the shared password, each of you must choose your own before going on.
