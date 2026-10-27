# Architecture

How expecting is built. What it is and why: [intent.md](intent.md). Running it: [development.md](development.md).

## Built so far

The timeline, built-in content, the checklist (built-in and own tasks), questions for appointments, the due and birth dates, and the shared password. Not yet: the rest of the store (appointments, scans and photos, contacts, symptoms, names), our own items, hiding built-in items, the PWA manifest, the service worker, offline reads and writes. Everything below is the intended shape; where it isn't built, it says so.

Expecting has the same shape as garnish. Where this file says "as garnish", garnish's `docs/architecture.md` is the reference.

## Shape

- One Bun process. TanStack Start on Nitro's Bun preset serves the app, server functions and `/api/*` routes.
- One SQLite file, `DATA_DIR/expecting.db`, through Drizzle.
- One directory of uploads, `DATA_DIR/uploads/`, for scans and photos.
- One Docker container, with `DATA_DIR` on a mounted volume. That volume is everything worth backing up.

```
phone (PWA) ──server fns / HTTP──▶ TanStack Start (Nitro, Bun) ──▶ bun:sqlite ──▶ expecting.db
                                                              └──▶ uploads/      (DATA_DIR volume)
content/ (in the repo, bundled at build) ──▶ built-in items
```

## Access: one shared password

- No users, no accounts. One password, set as an environment variable and stored only as a hash.
- Logging in sets a long-lived, HTTP-only session cookie, so a phone stays logged in for months.
- Chosen over **no auth** (garnish's choice), because this data is personal and the app is meant to be reachable from a phone at the hospital. Chosen over **two accounts**, because nothing in the app differs per parent. Favourites on baby names are the one exception, and a "whose favourite" field covers it.
- Login attempts are rate limited: ten failures in fifteen minutes locks that client out, in memory.
- Sessions are rows holding the SHA-256 of the cookie's token, so a copy of the database is not a login. A session lives 400 days from its last use.
- Every request passes one request middleware. Pages without a session redirect to `/login`, and everything else gets a 401. The login form is a plain form post to `/api/login`, so it works before any script loads.
- Without `EXPECTING_PASSWORD_HASH` the dev server runs open; a production server refuses to start.

Open, and it decides the PWA: a service worker and installing to the home screen need HTTPS, which plain `http://<lan-host>:9966` is not. Tailscale (`tailscale serve` gives HTTPS on a `*.ts.net` name) is the easiest way to get both. Also open: whether expecting is reachable outside the LAN, and how — a VPN such as Tailscale, or public through the reverse proxy. The password is needed either way; a public route raises the bar for everything else.

## Adaptive, phone and desktop alike

Expecting is used on both. Each size gets a layout designed for it, not a phone column stretched or centred on a big screen.

- **Phone** (below `lg`, 1024px): one column. A bottom tab bar within thumb reach: **This week**, **Weeks**, **Checklist**, **Questions**, **Settings**. As the store grows, Questions becomes **Store** and Settings folds into **More**.
- **Desktop** (`lg` and up): the same tabs as a rail down the left. Screens split into a main column and a 20rem side panel (`Columns` in `src/components/Page.tsx`). The panel holds what needs doing now (slipped tasks, your own tasks this week, the form to add to a list) and stays in view while the main column scrolls. On a phone the same panel comes first, above the main column.
- **Weeks** shows two trimesters side by side on desktop.
- **Reading width:** item bodies are capped at a readable line length (`max-w-prose`) at every size. The page itself is not capped to a phone's width.
- Tap targets are at least 44px. No hover-only interactions; hover is decoration only.
- Safe areas are respected, so nothing sits under the notch or the home indicator.
- e2e loads every page at both sizes (`phone` and `desktop` projects).

## PWA

- **Installable.** A web app manifest, icons, and Apple metas, as garnish.
- **Service worker.** Hand-written, no Workbox, emitted by a small Vite plugin, as garnish.
- **Offline reads.** Built-in content is bundled with the app, so every week reads offline. The app shell and the last-fetched data are cached. Hospital Wi-Fi is unreliable, and the hospital bag checklist has to open there.
- **Offline writes.** Ticking a task or adding a note while offline is queued and sent on reconnect, using garnish's outbox pattern. Photo uploads need a connection.

## Content

- Built-in items live in the repo under `content/`, one Markdown file per item, with frontmatter for weeks, category, source, last checked and linked tasks.
- They are validated with zod when the content module loads, and `bun run test` loads it, so a malformed item fails the gate, not the page.
- Each item's weeks are a phase and a range of weeks within it (`before`, pregnancy 1–42, postpartum 1–12), the same `Slot` that `src/lib/timeline.ts` derives the current week as.
- Each item and each linked task has a stable id in its frontmatter. Ticks and hides in the database point at that id, so editing an item's wording never loses state.
- Chosen over **content in the database**, because built-in content is reviewed like code: diffs, history, and a build that refuses bad data.

Our own items are rows in the database with the same fields. One read path merges the two, so screens never ask where an item came from.

## Data

The database holds only what we create:

- our own items and their tasks
- task state: ticked, and when — for built-in and own tasks alike
- hidden built-in items
- appointments, questions, contacts, symptoms, baby names
- photo records; the files themselves are in `uploads/`
- settings: the due date and the birth date
- sessions

The current week is derived from the due date and the birth date on read, never stored.

## Backups

`DATA_DIR` holds the database and the uploads, and nothing else. Back up the volume with the host's existing backup. A backup is only trusted once a restore has been tested.

Open: which host — Castle or Tower — and so which backup job covers it.
