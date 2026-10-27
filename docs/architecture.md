# Architecture

How expecting is built. What it is and why: [intent.md](intent.md). Running it: [development.md](development.md).

## Built so far

The timeline (the whole app: weeks, the ruler, and views for to do, nobody tells you and questions), built-in content, own tasks, questions for appointments, the due and birth dates, and the shared password. Not yet: the rest of the store (appointments, scans and photos, contacts, symptoms, names), our own items, hiding built-in items, the PWA manifest, the service worker, offline reads and writes. Everything below is the intended shape; where it isn't built, it says so.

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
- Every request passes one request middleware. Pages without a session redirect to `/login`, and everything else gets a 401. The login form is a plain form post to `/api/login`, which sets the cookie itself.
- Without `EXPECTING_PASSWORD_HASH` the dev server runs open; a production server refuses to start.

Open, and it decides the PWA: a service worker and installing to the home screen need HTTPS, which plain `http://<lan-host>:9966` is not. Tailscale (`tailscale serve` gives HTTPS on a `*.ts.net` name) is the easiest way to get both. Also open: whether expecting is reachable outside the LAN, and how — a VPN such as Tailscale, or public through the reverse proxy. The password is needed either way; a public route raises the bar for everything else.

## The timeline is the app

There are no pages per kind of thing. The app is one scroll of weeks, from "before" through pregnancy weeks 1–42 to 12 weeks after the birth, and it opens at this week (`src/components/timeline/`).

- **Weeks are bands.** The current week is open, with the gestation line, what has slipped, and what is still running from earlier weeks. Every other week is folded to one line of what's in it (`2 new · 1 to do`) until opened. Each item appears once, in the week it starts. The rules are in `src/lib/timelineView.ts`, tested apart from the screen.
- **The ruler moves along it.** It's a vertical rail on the desktop and a scrubber along the bottom edge on a phone. Both are one `Ruler` component and an ARIA slider: drag or tap to scrub; arrows step a week, Page Up/Down four, Home/End the ends. Each week shows a dot when something starts and amber when a task there has slipped. "Now" is marked, and so is the week in view (the last week whose top has passed a reading line under the sticky bar).
- **Views, not pages.** **Everything**, **To do**, **Nobody tells you** and **Questions** fold the same timeline down to what you came for, in the URL as `?view=`. The current week is always present, so switching views never loses your place in time. Open questions sit at the current week; asked ones land in the week they were asked.
- **Adding happens where it belongs.** An own task is added inside its week. A question is added at the current week, in Questions.
- `?at=28` opens at another week. Settings is the one other page, from the rail or the gear.
- **Adaptive:** both sizes get a designed layout. Desktop has the rail and a sticky week number in a gutter beside each week. A phone has the scrubber under the thumb and the week number above each week. Item bodies keep a readable line length at every size.
- Tap targets are at least 44px. No hover-only interactions. Safe areas are respected.
- e2e loads every page at both sizes (`phone` and `desktop` projects).

## Theme

Expecting has its own theme, not the design system's Linen. It's built from a reference palette: `#9DC3E2` blue, `#9DD2D8` aqua, `#FADCE4` blush, `#FFB5CC` pink, `#E2B9DB` lilac.

- **Palette** (`src/theme/palette.css`): a 50–950 scale per family, generated by `bun run palette` from `scripts/palette.ts`. The reference colours sit exactly on the step their lightness puts them; the rest of each scale is built around them in OKLCH. The families are sky, lagoon, blossom (pink), lilac, mist (the neutral), sea (success), peach (warning) and cherry (danger). Steps 600 and darker carry text, and a test holds them to AA contrast on white; the pastels themselves can't.
- **Three themes**, chosen by one question in Settings (boy, girl, or don't know / keeping it a surprise):
  - **Sky** (`sky.css`): a boy. Blue brand, sky-to-aqua accent.
  - **Blossom** (`blossom.css`): a girl. Pink brand, pink-to-lilac accent.
  - **Dawn** (`dawn.css`): don't know or surprise, and the default. Lilac brand, blue-to-pink accent.
- Each theme sets every semantic token the design system reads, in light mode only (there's no dark mode yet). Each also sets Expecting's own `--expecting-accent-*` pair, which paints a thin gradient stripe along the top of the current week. The page is white in every theme; colour comes in accents (the brand, the stripe, the ruler), never as a fill. Neutral, success, warning, danger, the corner scale and the type stacks are shared.
- `data-expecting-theme` on `<html>` picks the theme (`src/lib/theme.ts`). The answer is stored on the household (`baby`). The browser remembers the last theme in `localStorage`, and an inline script in `<head>` applies it before paint, so a reload doesn't flash Dawn.
- The three are separate files on purpose, so each can be judged on its own. If they turn out to differ only in brand, they can merge into one theme with named brands, which the design system supports through `data-brand`.

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
