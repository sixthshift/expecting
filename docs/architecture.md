# Architecture

How expecting is built. What it is and why: [intent.md](intent.md). Running it: [development.md](development.md).

## Built so far

The five pillars (the timeline, the Library, the Planner, and placeholders for the Journal and Toolkit), built-in content in Markdoc tailored by the household's answers, onboarding, who's holding each phone, own tasks, questions for appointments, the due and birth dates, and the shared password. Not yet: the rest of the store (appointments, scans and photos, contacts, symptoms, names), our own items, hiding built-in items, the PWA manifest, the service worker, offline reads and writes. Everything below is the intended shape; where it isn't built, it says so.

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
- Chosen over **no auth** (garnish's choice), because this data is personal and the app is meant to be reachable from a phone at the hospital. Chosen over **two accounts**, because nothing needs to be private from the other parent.
- Login attempts are rate limited: ten failures in fifteen minutes locks that client out, in memory.
- Sessions are rows holding the SHA-256 of the cookie's token, so a copy of the database is not a login. A session lives 400 days from its last use.
- Every request passes one request middleware. Pages without a session redirect to `/login`, and everything else gets a 401. The login form is a plain form post to `/api/login`, which sets the cookie itself.
- Without `EXPECTING_PASSWORD_HASH` the dev server runs open; a production server refuses to start.

### Who's holding the phone

- The household's people are rows (`person`: a name, and `carrying` or `partner`). A device says which one it is once, and remembers it in a `expecting_person` cookie (`src/server/functions/people.ts`).
- That cookie is not authentication: anyone past the password can say they are anyone. It is how Expecting can say who logged something and speak to each of you.
- It is separate from the session cookie, so it works on a dev server running open, and logging out doesn't forget who you are.

Open, and it decides the PWA: a service worker and installing to the home screen need HTTPS, which plain `http://<lan-host>:9966` is not. Tailscale (`tailscale serve` gives HTTPS on a `*.ts.net` name) is the easiest way to get both. Also open: whether expecting is reachable outside the LAN, and how — a VPN such as Tailscale, or public through the reverse proxy. The password is needed either way; a public route raises the bar for everything else.

## Stages

Expecting is three apps over one household: getting ready, the pregnancy, and the baby's here. Each is a folder, `src/app/<stage>/`, whose `index.ts` lists its whole app: its shell, and its pillars in navigation order with the page each shows. Its own home is at `/`.

| Stage | When | Pillars | Home |
|---|---|---|---|
| **preconception** | No due date, and the stage answer is "trying" | Getting ready, Library, Planner | What's best done before (`stages/preconception/Home.tsx`), and "we're expecting" |
| **pregnancy** | A due date, or expecting without one yet | Timeline, Library, Planner, Journal, Toolkit | The timeline |
| **postpartum** | A birth date, or 42 weeks done with none | This week, Library, Planner, Journal, Toolkit | This week (`stages/postpartum/Home.tsx`); the Toolkit is the newborn's |

- **Derived, never stored** (`src/lib/stage.ts`), like the current week. Entering a due date or a birth date is what moves the household on; clearing the birth date moves it back.
- **The URL never says the stage.** One route tree, one path per pillar: `/journal` is the Journal for wherever the household is. The stage is a fact about the household, like this week, and a bookmark made in week 39 still works after the birth.
- **Pages are partitioned by stage; parts and data are not.** A page that differs by stage lives in its stage's folder (the pregnancy's Journal and the newborn's are different screens). The parts they're built from (`src/components/`), the pages every stage shares (`src/features/`: the Library, the Planner, settings), the store and the rules in `src/lib/` are shared: an entry from week 39 is still yours after the birth. When a shared page diverges, its stage's `index.ts` points at a page in its own folder instead.
- **One route, a page per stage.** Each pillar route's component is `stagePage("/journal")` (`src/app/stagePage.tsx`): it finds that pillar in the household's stage, loads only its page, and sends a stage without it home. The navigation and the pages are one list, so they can't disagree.
- `AppShell` (the `app` route's component) keeps what every stage shares, the theme and the content context, and draws the stage's `Shell` with its pillars. The shells share their chrome, `Frame` (`src/app/Frame.tsx`); each is where that stage's own things around the pillars go.
- Only the pregnancy has the timeline; an item's page links to its week only there.

## Code layout

```
src/
  app/          the three apps: <stage>/ (index.ts, Shell, its own pages), and what they share (AppShell, Frame, stagePage, useApp, useAction)
  features/     pages every stage shares: library, planner, settings, onboarding, auth
  components/   the parts pages are built from: TaskRow, ItemCard, questions, the timeline
  lib/          pure rules and types: no React, no router, no store
  content/      the built-in items, bundled
  routes/       definitions only: root.tsx, tree.ts, search.ts, api/
  db/ server/   server only
```

Biome holds the boundaries (`noRestrictedImports` in `biome.json`): only `db/`, `server/` and the API routes import the store; nothing imports `routes/` (a page reads its route through `getRouteApi`); `lib/` and `content/` import no React, router or server; `features/` and `components/` never import a stage; and no stage imports another. `src/app/` is the apps, not file-based routing: routes are code, in `src/routes/tree.ts`.

## The pillars

In the pregnancy, the app is five pillars in its frame: a sidebar on a desktop, a tab bar on a phone.

| Pillar | Route | Holds |
|---|---|---|
| **Timeline** | `/` | The weeks: the thread the other four meet on |
| **Library** | `/library`, `/library/<id>` | Everything Expecting knows: a "nobody tells you" shelf, a shelf per topic, search (`?q=`), each item on its own page |
| **Planner** | `/planner` | To do, grouped by when it matters (`src/lib/planner.ts`), and the questions for the next appointment |
| **Journal** | `/journal` | What happens, kept. *Placeholder: says what is coming.* |
| **Toolkit** | `/toolkit` | Things to use in the moment. *Placeholder.* |

- **One load for all of them.** The `app` route loads the household, the checklist, the people and the questions once; `useApp()` (`src/app/useApp.ts`) tailors the items and tasks and places "now". Moving between pillars is instant, and they never disagree. A change goes through `useAction` (`src/app/useAction.ts`): it saves, then reloads that one load, so every pillar sees it.
- **The frame provides what content renders against** (the answers, now, the questions already on your list), so a Markdoc tag works the same on the timeline and in the Library.
- **Settings sits in the frame too**; onboarding and login don't.
- **Each thing lives in one pillar and meets the others on the timeline.** A task is the Planner's, and shows in its week; an asked question is the Planner's, and lands in the week it was asked; an item is the Library's, and appears in the week it starts.

## The timeline

One scroll of weeks, from "before" through pregnancy weeks 1–42 to 12 weeks after the birth, opened at this week (`src/components/timeline/`). It has no views: what used to be views are the Planner and the Library's shelves.

- **Weeks are bands.** The current week is open, with the gestation line, what has slipped, what is still running from earlier weeks, and a link to the questions waiting for the next appointment. Every other week is folded to one line of what's in it (`2 new · 1 to do`) until opened. Each item appears once, in the week it starts. The rules are in `src/lib/timelineView.ts`, tested apart from the screen.
- **The ruler moves along it.** It's a vertical rail down the right edge on the desktop and a scrubber just above the tab bar on a phone (`--tab-bar` holds the bar's height). Both are one `Ruler` component and an ARIA slider: drag or tap to scrub; arrows step a week, Page Up/Down four, Home/End the ends. Each week shows a dot when something starts and amber when a task there has slipped. "Now" is marked, and so is the week in view (the last week whose top has passed a reading line under the sticky bar).
- **Adding happens where it belongs.** An own task is added inside its week, or in the Planner for this week. A question is added in the Planner.
- `?at=28` opens at another week; an item's page links to its week this way.

## Adaptive

- Both sizes get a designed layout. Desktop: the pillars in a sidebar on the left; on the timeline, the ruler in its own column on the right and a sticky week number beside each week; the Planner in two columns. Phone: the tab bar under the thumb, settings behind a gear at the top of each pillar, the scrubber above the tab bar. Item bodies keep a readable line length at every size.
- Tap targets are at least 44px. No hover-only interactions. Safe areas are respected.
- e2e loads every page at both sizes (`phone` and `desktop` projects).

## Theme

Expecting has its own theme, not the design system's Linen. It's built from a reference palette: `#9DC3E2` blue, `#9DD2D8` aqua, `#FADCE4` blush, `#FFB5CC` pink, `#E2B9DB` lilac.

- **Palette** (`src/theme/palette.css`): a 50–950 scale per family, generated by `bun run palette` from `scripts/palette.ts`. The reference colours sit exactly on the step their lightness puts them; the rest of each scale is built around them in OKLCH. The families are sky, lagoon, blossom (pink), lilac, mist (the neutral), sea (success), peach (warning) and cherry (danger). Steps 600 and darker carry text, and a test holds them to AA contrast on white; the pastels themselves can't.
- **The sheet** (`docs/palette.html`): every family and the three themes, drawn from the CSS the app ships, to open in a browser. `bun run palette` writes it after the palette (`scripts/palette-sheet.ts`).
- **Three themes**, chosen by one question in Settings (boy, girl, or don't know / keeping it a surprise):
  - **Baby Blue** (`baby-blue.css`): a boy. Blue brand, sky-to-aqua accent.
  - **Baby Pink** (`baby-pink.css`): a girl. Pink brand, pink-to-lilac accent.
  - **Baby Purple** (`baby-purple.css`): don't know or surprise, and the default. Lilac brand, blue-to-pink accent.
- Each theme sets every semantic token the design system reads, in light mode only (there's no dark mode yet). Each also sets Expecting's own `--expecting-accent-*` pair, for the gradients in progress bars (onboarding, an item's window of weeks). The page is white with at most a temperature (`--expecting-page`): a cool white in Baby Blue, a warm white in Baby Pink, plain white in Baby Purple. Colour comes in accents (the brand, the progress bars, the ruler), never as a fill. Never as a border on one side of a box, either: a card is outlined all round or not at all. Neutral, success, warning, danger, the corner scale and the type stacks are shared.
- `data-expecting-theme` on `<html>` picks the theme (`src/lib/theme.ts`). The answer is stored on the household (`baby`). The browser remembers the last theme in `localStorage`, and an inline script in `<head>` applies it before paint, so a reload doesn't flash Baby Purple.
- The three are separate files on purpose, so each can be judged on its own. If they turn out to differ only in brand, they can merge into one theme with named brands, which the design system supports through `data-brand`.

## PWA

- **Installable.** A web app manifest, icons, and Apple metas, as garnish.
- **Service worker.** Hand-written, no Workbox, emitted by a small Vite plugin, as garnish.
- **Offline reads.** Built-in content is bundled with the app, so every week reads offline. The app shell and the last-fetched data are cached. Hospital Wi-Fi is unreliable, and the hospital bag checklist has to open there.
- **Offline writes.** Ticking a task or adding a note while offline is queued and sent on reconnect, using garnish's outbox pattern. Photo uploads need a connection.

## Onboarding

- `/welcome` asks the first-run questions, one to a screen (`src/features/onboarding/`). The home route sends anyone there who still has a step: a new household gets all of them, a new phone only "who's this?".
- Which steps a device sees is a pure function of what is known (`src/lib/onboarding.ts`): who, then the stage (expecting, or getting ready), then the due date and the baby's colours when expecting, then every `asked: onboarding` question in `content/profile.yaml`, then where Expecting will open.
- Each answer is saved as it's given, so a reload resumes. A household with a due date from before onboarding existed counts as onboarded.
- Getting ready with no due date opens the timeline at the getting-ready band; entering a due date later moves it into the pregnancy.

## Tailoring

- `content/profile.yaml` holds the questions. The household's answers are a JSON object of question id to answer id on the household row: adding a question is a content change, not a migration. Settings shows every question, built from the file.
- An item's `when:` hides it on a definite answer; `{% if equals($cover, "yes") %}` tailors a passage. An unanswered question hides nothing, so the `{% else %}` branch is the general wording.
- `src/content/profile.ts` has the rules (`applies`), tested apart from the screen.

## Content

- Built-in items live in the repo under `content/`, one Markdoc file per item, with frontmatter for weeks, category, `when`, source, last checked and linked tasks.
- Bodies are Markdoc: Markdown plus declared tags (`src/content/markdoc.ts`), each drawn by a component in `src/components/content/`. `{% ask %}` is a suggested question, added to your list in one tap; `{% window %}` draws an item's weeks against today. Every tag, attribute, `$question` and answer is checked as the content loads.
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
- the household: the due date, the birth date, the baby's colours, the answers to the profile questions, and when onboarding finished
- the household's people
- sessions

The current week is derived from the due date and the birth date on read, never stored.

## Backups

`DATA_DIR` holds the database and the uploads, and nothing else. Back up the volume with the host's existing backup. A backup is only trusted once a restore has been tested.

Open: which host — Castle or Tower — and so which backup job covers it.
