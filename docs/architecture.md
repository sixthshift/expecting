# Architecture

How expecting is built. What it is and why: [intent.md](intent.md). Running it: [development.md](development.md).

## Built so far

The pregnancy's six pillars (This week, the timeline, the Library, the Planner, and placeholders for the Journal and the Drawer), built-in content in Markdoc tailored by the household's answers, onboarding, who's holding each phone, own tasks, questions for appointments, the due date, and the shared password. Getting ready and the weeks after the birth are out of the first version ([One app, the pregnancy](#one-app-the-pregnancy)). Not yet: the rest of the store (appointments, scans and photos, contacts, symptoms, names), our own items, hiding built-in items, the PWA manifest, the service worker, offline reads and writes. Everything below is the intended shape; where it isn't built, it says so.

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
- Every request passes request middleware, which judges it by path: pages without a session redirect to `/login`, other `/api/*` calls get a 401, and only `/login` and `/api/health` are open.
- Server functions answer under `/api/rpc/`, each at a generated id, so request middleware lets those calls on, and function middleware judges each one by the file it is defined in: without a session, only `src/api/rpc/session.ts` answers. That file holds `login` and `logout`, ordinary server functions like the rest, so the app has one way of calling the server, and `src/api/rest/` is left for callers that aren't the app.
- Without `EXPECTING_PASSWORD_HASH` the dev server runs open; a production server refuses to start.

### Who's holding the phone

- The household's people are rows (`person`: a name, and `carrying` or `partner`). A device says which one it is once, and remembers it in a `expecting_person` cookie (`src/api/rpc/people.ts`).
- That cookie is not authentication: anyone past the password can say they are anyone. It is how Expecting can say who logged something and speak to each of you.
- It is separate from the session cookie, so it works on a dev server running open, and logging out doesn't forget who you are.

Open, and it decides the PWA: a service worker and installing to the home screen need HTTPS, which plain `http://<lan-host>:9966` is not. Tailscale (`tailscale serve` gives HTTPS on a `*.ts.net` name) is the easiest way to get both. Also open: whether expecting is reachable outside the LAN, and how — a VPN such as Tailscale, or public through the reverse proxy. The password is needed either way; a public route raises the bar for everything else.

## One app, the pregnancy

The first version of Expecting is the pregnancy alone: weeks 1–42, from the due date. Getting ready before a pregnancy and the weeks after the birth were built as apps of their own (preconception and postpartum, each a phase with its own pillars) and taken out to keep the first version small. The code has no phases now: no phase type, no phase in the URL, no birth date.

- **The URL is the page.** Home is `/`, and each pillar sits at its own path: `/timeline`, `/library`, `/library/<id>`, `/planner`, `/journal`, `/drawer`, and `/settings` beside them. The navigation is `PILLARS` (`src/features/app/pillars.ts`), typed against the route tree, so a pillar can't point at a page that isn't there.
- `App` (`src/features/app/App.tsx`, the `app` route's component) keeps the theme and the content context, and draws the pillars in `PillarLayout` (`src/features/app/PillarLayout.tsx`), the sidebar and tab bar.
- **Naming.** "Shell" means only what TanStack Start means by it: the HTML document (`shellComponent`, our `Document`) and SPA shell mode. The component around the pillars is `App`; what's drawn around them is a layout.
- **When the other phases come back,** the pregnancy's week stops being the whole timeline: a slot becomes a phase and a week, and the content's folders say which phase an item is in. Git history has both apps as they were.

## Code layout

```
src/
  features/     a folder per domain: its pages and its parts (app, home, timeline, library, planner, journal, household, weeks, tasks, questions, settings, onboarding, auth)
  components/   generic parts with no domain: Page, DateForm, Coming
  lib/          pure rules and types: no React, no router, no store
  content/      the built-in items, bundled
  routes/       the pages' routes, definitions only: root.tsx, a file per route, onboarding/, tree.ts (the shape), search.ts
  api/          everything that answers at /api
    rest/       the server routes: fixed URLs for callers outside the app (/api/health)
    rpc/        the server functions: what the app calls, run on the server (/api/rpc/<id>)
  db/ server/   server only: the store, auth, boot
```

Biome holds the boundaries (`noRestrictedImports` in `biome.json`): only `db/`, `server/` and `api/` import the store or `server/`, and nothing else imports `api/rest/`, so the browser reaches the server only through `api/rpc/`; nothing imports `routes/` (a page reads its route through `getRouteApi`); and `lib/` and `content/` import no React, router or server. Routes are code, a file per route in `src/routes/`, put together in `tree.ts`.

## The pillars

The app is six pillars in its frame: a sidebar on a desktop, a tab bar on a phone.

| Pillar | Route | Holds |
|---|---|---|
| **This week** | `/` | Home: where you are as its heading (the week, the baby's size, how far along), To do now (the most urgent few, `src/features/tasks/ToDoNow.tsx`), the week's note (the one in force: its own, or the latest before it), what Expecting needs to know, what's worth knowing this week, Coming up (the next eight weeks after To do now's two, `comingUp` in `src/lib/todo.ts`) and the questions waiting. Desktop: the week on the left, the doing on the right. |
| **Timeline** | `/timeline`, `?at=28` | Every week: the thread the others meet on |
| **Library** | `/library`, `/library/<id>` | Everything Expecting knows: a "nobody tells you" shelf, then a shelf per topic (`src/lib/library.ts`), search (`?q=`), each item on its own page |
| **Planner** | `/planner` | To do, grouped by when it matters (`src/lib/planner.ts`), and the questions for the next appointment |
| **Journal** | `/journal` | What happens, kept. *Placeholder: says what is coming.* |
| **Drawer** | `/drawer` | The handy things: baby names, the bump booth, the contraction timer, the hospital bag. *Placeholder: says what is coming.* |

- **One load for all of them.** The `app` route loads the household, the checklist, the people and the questions once; `useApp()` (`src/features/household/useApp.ts`) tailors the items and tasks and places "now". Moving between pillars is instant, and they never disagree. A change goes through `useAction` (`src/features/household/useAction.ts`): it saves, then reloads that one load, so every pillar sees it.
- **The frame provides what content renders against** (the answers, now, the questions already on your list), so a Markdoc tag works the same on the timeline and in the Library.
- **Settings sits in the frame too**; onboarding and login don't.
- **A week's note reads as whoever holds the phone:** the baby, then your body or the partner's part, with a toggle to read it as the other (`src/features/weeks/WeekNote.tsx`).
- **Each thing lives in one pillar and meets the others on the timeline.** A task is the Planner's, and shows in its week; an asked question is the Planner's, and lands in the week it was asked; an item is the Library's, and appears in the week it starts.

## The timeline

One scroll of weeks, pregnancy weeks 1–42 under their trimesters, opened at this week (`src/features/timeline/`). It has no views: what used to be views are the Planner and the Library's shelves.

- **Weeks are bands.** The current week is open, with the gestation line, what has slipped, what is still running from earlier weeks, and a link to the questions waiting for the next appointment. Every other week is folded to one line of what's in it (`2 new · 1 to do`) until opened. Each item appears once, in the week it starts. The rules are in `src/lib/timelineView.ts`, tested apart from the screen.
- **The ruler moves along it.** It's a vertical rail down the right edge on the desktop and a scrubber just above the tab bar on a phone (`--tab-bar` holds the bar's height). Both are one `Ruler` component and an ARIA slider: drag or tap to scrub; arrows step a week, Page Up/Down four, Home/End the ends. Each week shows a dot when something starts and amber when a task there has slipped. "Now" is marked, and so is the week in view (the last week whose top has passed a reading line under the sticky bar).
- **Expecting knows what to do; you don't fill it in.** The weeks carry no add box. An own task, for the odd thing Expecting couldn't know, is added at the foot of the Planner's To do, for this week, and shows on its week like any other. A question is added in the Planner.
- `?at=28` opens at another week; an item's page links to its week this way.

## Adaptive

- Both sizes get a designed layout. Desktop: the pillars in a sidebar on the left; on the timeline, the ruler in its own column on the right and a sticky week number beside each week; the Planner in two columns. Phone: the tab bar under the thumb, settings behind a gear at the top of each pillar, the scrubber above the tab bar. Item bodies keep a readable line length at every size.
- Tap targets are at least 44px. No hover-only interactions. Safe areas are respected.
- e2e loads every page at both sizes (`phone` and `desktop` projects).

## Theme

Expecting has its own theme, not the design system's Linen. It's built from a reference palette: `#9DC3E2` blue, `#9DD2D8` aqua, `#FADCE4` blush, `#FFB5CC` pink, `#E2B9DB` lilac.

- **Palette** (`src/styles/theme/palette.css`): a 50–950 scale per family, generated by `bun run palette` from `scripts/palette.ts`. The reference colours sit exactly on the step their lightness puts them; the rest of each scale is built around them in OKLCH. The families are sky, lagoon, blossom (pink), lilac, mist (the neutral), sea (success), peach (warning) and cherry (danger). Steps 600 and darker carry text, and a test holds them to AA contrast on white; the pastels themselves can't.
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

- `/onboarding` asks the first-run questions, one to a screen and each at its own URL (`/onboarding/due`, `/onboarding/q/cover`; routes in `src/routes/onboarding/`, screens in `src/features/onboarding/steps/`), so the phone's back gesture goes back a question. The frame sends anyone there who still has a step: a new household gets all of them, a new phone only "who's this?".
- After an answer, `/onboarding?after=due` goes on to the next step still to ask, worked out afresh (`stepAfter`), since what's left can change: the other phone may have finished onboarding meanwhile. A URL for a step that isn't asked goes to the one that is.
- Which steps a device sees is a pure function of what is known (`src/lib/onboarding.ts`): who, then the due date and the baby's colours, then every `asked: onboarding` question in `content/facts.yaml` (once for each of you where it is about each, and only where its `when` fits the answers so far), then where Expecting will open.
- Each answer is saved as it's given, so a reload resumes. A household with a due date from before onboarding existed counts as onboarded.
- With the due date skipped, This week asks for it, and every week is still readable on the timeline.

## Tailoring

- `content/facts.yaml` holds the questions; `src/content/facts.ts` reads them and has the rules (`applies`, `checkWhen`), and `src/lib/facts.ts` what the answers become (`factsOf`, `questionsDue`, `timeTask`), both tested apart from the screen. Settings shows every question, built from the file.
- An item's `when:` hides it on a definite answer; `{% if equals($cover, "yes") %}` tailors a passage. An unanswered question hides nothing, and neither does `unsure`, so nothing is written against it (`checkWhen` refuses it) and the `{% else %}` branch is the general wording.

### Facts

The answers are what Expecting knows about the household, asked as the pregnancy unfolds, not a profile filled in once.

- **Questions are content** in `content/facts.yaml`, so a new one is not a migration. Each has:
  - `type`: `choice` (its `answers`) or `date`. *Not built: `text`, until a question needs it.*
  - `about`: `household`, or `each`, asked once for each of you and worded with your name (`Does {name} work?`; "the partner" before they've joined). A fact's key is the id, or the id and whose: `cover`, `work.partner`; content writes the same, `when: { work.partner: [employee] }`, `$work.partner`.
  - `when:`, the rule items use, so a question waits on another answer: a previous caesarean is asked only when this isn't the first baby. In a question about each of you, a bare `work` is the same person's.
  - `asked: onboarding`, to be asked up front, and `week`, when This week asks it.
- **Answers are rows,** in the `answer` table (`src/db/models/facts/`): the question, whose it is (`household`, `carrying` or `partner`), the value, who answered and when. A new answer is a new row and the latest counts, so a fact keeps its history. A skip ("Not now", or Skip for now in onboarding) or a clear is a row with no value.
- **The history decides when to ask again** (`questionsDue`). A question comes up on This week (`src/features/facts/AskNow.tsx`, three at a time) once its `week` has come, while it is unknown or `unsure`. Answered or skipped before its week, it comes back at its week; since then, only four weeks after (`ASK_AGAIN_AFTER`), so "not sure" isn't asked every week.
- **Who answered** puts who's who to use: settings says "Jason answered, 3 Oct".
- **A task can be timed from a fact** (`timeTask`): `deadline: { before: leaveStart, weeks: 10, week: 30 }` is notice to the employer 10 weeks before leave begins, whose leave by the task's `who` (the earlier of the two for one you do together), and best by moves up to meet it. Until the date is known, `week` stands in. This is what makes the plan a schedule.
- **Facts are not records.** A fact changes what Expecting tells you to do; a record is something you look up. The birth suite's number is a contact, and a planned caesarean's date is an appointment, even where a fact (`birth: caesarean`) points at it. Without this line, the facts grow into the whole store.
- The code's word is **facts**. The screens say "About you", "Expecting needs to know", or ask the question itself.

## Content

- Built-in items live in the repo as `content/items/<id>.md`, one Markdoc file per item, with frontmatter for weeks, category, `when`, source, last checked and linked tasks. `content/facts.yaml`, the questions it is tailored by, sits beside the folder.
- **The file's name is its id:** a file outside `items/` or named for another id fails the gate.
- Bodies are Markdoc: Markdown plus declared tags (`src/content/markdoc.ts`), each drawn by a component in `src/features/library/content/`. `{% ask %}` is a suggested question, added to your list in one tap; `{% window %}` draws an item's weeks against today. Every tag, attribute, `$question` and answer is checked as the content loads.
- **This week** is its own shape, `content/weeks/<week>.md`, named for the week (`28`): a title, the baby's size (length head to bottom in cm, weight in g, and something that size), and three parts, each a `##` heading in this order: The baby, Your body, For the partner (`src/content/weeks.ts`). Each part is Markdoc like an item's body. The note sits at the top of its week on the timeline, and its title on the week when folded.
- They are validated with zod when the content module loads, and `bun run test` loads it, so a malformed item fails the gate, not the page.
- Each item's weeks are a range within 1–42, the same `Week` that `src/lib/timeline.ts` derives the current week as.
- **A linked task has a window and an owner:** `opens` (defaults to the item's first week), `due` (best by, defaults to its last), an optional hard `deadline` (on or after `due`, by week 42, from the item's source), and `who` (`carrying`, `partner` or `together`, the default). `src/lib/todo.ts` orders the open ones into To do now; `whose()` in `src/lib/people.ts` names the owner for the phone holding it ("Yours", "Sam's").
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
- the household: the due date, the baby's colours, and when onboarding finished
- the answers to the questions, every one kept (see [Facts](#facts))
- the household's people
- sessions

The current week is derived from the due date on read, never stored.

## Backups

`DATA_DIR` holds the database and the uploads, and nothing else. Back up the volume with the host's existing backup. A backup is only trusted once a restore has been tested.

Open: which host — Castle or Tower — and so which backup job covers it.
