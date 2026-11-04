# Architecture

How Expecting is built, and where the code is. Why it exists is
[intent.md](intent.md); what each part does, and why, is
[product/](product/README.md), which this file links to rather than
restates. Running it is [development.md](development.md).

Built: the five pillars, the capture "+", Emergency info, It's time, the
quiet path, two accounts, built-in content tailored by your answers and
extras, onboarding, uploads, the PWA (offline reads and writes) and Claude
over MCP. Not built: our own entries and hiding built-in ones, contacts as a
store, other symptoms, and the phases before and after the pregnancy
([One app, the pregnancy](#one-app-the-pregnancy)).

## Shape

- One Bun process. TanStack Start on Nitro's Bun preset serves the app, the
  server functions and `/api/*`.
- One SQLite file, `DATA_DIR/expecting.db`, through Drizzle.
- One directory of uploads, `DATA_DIR/uploads/`, a folder per upload
  ([Uploads](#uploads)).
- One Docker container, with `DATA_DIR` on a mounted volume. That volume is
  everything worth backing up.

```
phone (PWA) ──server fns / HTTP──▶ TanStack Start (Nitro, Bun) ──▶ bun:sqlite ──▶ expecting.db
                                                              └──▶ uploads/      (DATA_DIR volume)
content/ (in the repo, bundled at build) ──▶ built-in items
```

## Access: two accounts

- **Two of you, two accounts.** A `person` row (`src/db/models/people/`) is
  one of you: a name, `carrying` or `partner`, and your own password, kept
  only as its argon2id hash. Two at most, one in each role, held by a
  trigger (`person_two_at_most`). No usernames: `/login` shows your names,
  you tap yours, then give your password.
- **Why accounts.** A few things are one person's own (the words of how
  you're feeling, your votes before the other has voted), and only a login
  of your own makes that hold, and makes "Jason did this" true. Not no
  auth: the data is personal and meant to be reachable from a phone at the
  hospital. A guest (a birth support, grandparents) would be a narrow,
  read-mostly link, not a third account; not built.
- **Either of you sets it up; one is a whole setup.** On a new instance
  `/login` asks which of you you are, your name and a password (`setUp`).
  Whoever gets there first sets it up, which is fine self-hosted: you do it
  straight after starting the container. Nothing assumes the one holding
  the phone is pregnant: a partner running the admin alone is one account,
  as is a single parent.
- **The other joins only by invite.** From Settings (`makeInvite`,
  `src/api/rpc/people.ts`): a code such as `K7Q-MP3-XD9-VA2` in a link
  (`/join?code=…`), alive a week, used once. Opening it asks the other's
  name and password and logs that phone in (`join`). Codes are Crockford
  base32, typed with any case, spaces or dashes; only their SHA-256 is kept
  (`invite`, `src/db/models/auth/`).
- **No primary.** Each of you can make the other a reset link (`makeReset`,
  `/reset?code=…`, a day, once), which logs out every phone of theirs.
  Each changes your own password (`choosePassword`) and can log out
  everywhere (`logOutEverywhere`). Alone and locked out, the way back is the
  server: turn logins off, choose a new password in Settings, turn them back
  on.
- **Sessions.** Logging in sets an HTTP-only cookie whose token is stored
  only as a SHA-256 (`session.person_id` says whose), so a copy of the
  database is not a login. A session lives 400 days from its last use.
  `personId()` (`src/server/core/person.ts`) reads who you are from it
  (`sessionOf`, looked up once a request); there is no other cookie saying
  who.
- **Rate limits.** Ten failed logins in fifteen minutes lock that client out
  of that person, in memory, so guessing at one of you doesn't lock out the
  other; a wrong code counts against the client alone.
- **The gate** (`src/server/auth/gate.ts`), applied twice in `src/start.ts`.
  Request middleware judges by path: a page without a session goes to
  `/login`, an `/api/*` call gets a 401; only `/login`, `/join`, `/reset`,
  `/api/health` and the OAuth endpoints are open, and `/api/mcp` is judged
  by its bearer token ([Claude](#claude-mcp)). Function middleware judges
  each server function by the file it's defined in: without a session only
  `src/api/rpc/session.ts` answers (`getAccess`, `setUp`, `login`,
  `checkCode`, `join`, `resetPassword`, `logout`), so the app has one way of
  calling the server.
- **`EXPECTING_LOGIN=off`** stops asking for passwords, not who you are:
  `/login` is your names and tapping one logs you in; Settings lets you
  choose a password without the old one; Log out hands the phone to the
  other. For a LAN you trust. On is the default, and a value that is neither
  `on` nor `off` is an error, so a typo never opens anything. Turned back on,
  one of you without a password chooses it at the next login.

Where it runs, HTTPS and reaching it from outside home are still open
([intent](intent.md#open-questions)). They decide the PWA, which needs
HTTPS: `tailscale serve` is the easiest way to get it.

## One app, the pregnancy

The first version is the pregnancy alone, weeks 1–42, from the due date.
Don't add phases, a phase type, a phase in the URL or a birth date until
getting ready or the weeks after the birth are being built: they would make
every part harder for a version that has none. When they come, a slot
becomes a phase and a week, and the content says which phase an item is
in.

- **The URL is the page.** Home is `/`; each pillar has its path
  (`/library`, `/planner`, `/journal`, `/drawer`), with `/timeline`,
  `/emergency`, `/its-time` and `/settings` beside them. The navigation is
  `PILLARS` (`src/app/components/layout/pillars.ts`), typed against the
  route tree, so a pillar can't point at a page that isn't there.
- **Naming.** "Shell" means only what TanStack Start means: the HTML
  document (`Document`) and SPA shell mode. The component around the
  pillars is `App` (`src/app/pages/App.tsx`); what it draws around them is
  `AppLayout`, the top bar and the tab bar.

## Code layout

```
src/
  app/          the app itself, not a domain: the document, the app's layout (App, AppLayout, PillarLayout, PILLARS), the error pages, the outbox, useSave, useAction
    features/   what's outside the pillars: capture (the +), emergency, itsTime, quiet, settings, onboarding, auth, connect
  pillars/      the five pillars: thisWeek, library, planner, journal, drawer
    <pillar>/features/  what lives in a pillar, each a feature: planner/features/{tasks,questions,appointments,lists,weeks}, …
  components/   generic parts with no domain: Page, DateForm, loading
  lib/          pure rules and types: no React, no router, no store. A pillar's own rules in a folder of its name (journal/, drawer/, planner/, thisWeek/, library/); what several share (dates, labels, timeline, people, facts, extras, quiet, …) loose
  content/      reading and checking the built-in content
  routes/       root.tsx, app.tsx (the app's layout route), notFound.ts, and tree.ts, which puts the pillars' and features' routes/ together
  api/
    rest/       server routes: /api/health, /api/mcp and OAuth, an upload's bytes, an appointment's calendar file
    rpc/        server functions, what the app calls (/api/rpc/<id>)
    mcp/        the MCP server's tools
  db/ server/   server only: the store, auth, boot
  pwa/          the service worker, the Vite plugin that emits it, its registration
```

A pillar is its own page at its top, and what lives in it, with its own
store or pages, a feature under it: the Drawer's tools
(`drawer/features/{names,jobs,circle,bingo}`), the Planner's tasks,
questions, appointments, lists and weeks, the Journal's kinds
(`journal/features/{appetite,feelings,firsts,movements,notes,papers,photos}`),
This week's timeline and week's question. What's outside the pillars is a
feature of the app, `src/app/features/`. Another pillar may draw a
feature's parts (This week draws the Planner's tasks and the Journal's
feelings); the feature still lives in one pillar. Each pillar has a
`README.md`, the map of its code.

A pillar and every feature have one shape, each folder only where it has
something: `pages/` (what a route draws), `components/` (a folder per
aspect, the shared parts loose), `hooks/`, `contexts/` (a page's context, at
most one a page), `model/` (no React: rules, types, paths), `routes/` (its
addresses) and, for a pillar, `features/`. Settings owns the questions and the extras wherever
they're drawn (`AskNow` and `OfferExtra` on This week), and its `model/`
(`src/app/features/settings/model/`) is the only part of them that `lib/`
and `content/` may import.

The routes nest as their folders do. A pillar's `routes/` holds its own
route, a path only (`path: "journal"`, no component, so nothing wraps its
pages: each draws its own `PillarLayout`), its pages as its children (its
index at `/`), and an `index.ts` that puts the subtree together, its
features' subtrees included (`plannerRoutes` adds the lists' and the
chart's, from `planner/features/{lists,weeks}/routes/`). The app's features
keep theirs the same way (onboarding's steps under its layout; the logins
and `/connect` off the root). A loader goes on a path-only route only when
every child reads it (the collections'); a search schema is in the route
that owns it. `src/routes/` is what's left: the root, the app's layout
(`app.tsx`), the address nothing else answers (`notFound.ts`), and
`tree.ts`, the subtrees in navigation order. A route's id is its path under
`/app` (`/app/journal/collections/$name`), an index's ending in `/`
(`/app/journal/`), and a page reads its route by it with `getRouteApi`.

Biome holds the layers (`noRestrictedImports` in `biome.json`): only `db/`,
`server/` and `api/` import the store or `server/`; nothing imports
`api/rest/`, and nothing imports a `routes/` folder but other routes and
`src/routes/tree.ts` (a page reads its route through `getRouteApi`);
`lib/` and `content/` import no React, router or server. A phone's layout never imports a desktop's, nor the other way (`mobile/`, `desktop/`; Adaptive).

## Data in the app

- **A query per thing, beside its server function.** Each
  `src/api/rpc/<thing>.ts` holds its server functions, its query and the
  query's hook, `use<Thing>Query`: `useSuspenseQuery` over the query,
  returned as is, with any options overriding the defaults. What's worked
  out from one query is a `select`:
  `const { data: facts } = useAnswersQuery({ select: factsOf })`.
  `usePosition()` and `useNow()` (settings) need today as well as the due
  date. TanStack Start's compiler turns each server function into a fetch
  in the browser, so a page can import the file whole.
- **The query cache is the only store of data:** no data provider, no
  aggregate. `useItems()` (the items your facts and extras fit) and
  `useTasks()` (their tasks, timed, then your own) combine several, each a
  pure function in a `useMemo`, cheap enough for every caller to do its own.
  The `app` route's loader loads what nearly every page reads before any
  pillar draws, so moving between pillars is instant.
- **Every change goes through one of two hooks.** A save is `useSave`
  (`src/app/hooks/useSave.ts`) through the outbox ([PWA](#pwa)): it shows at
  once, by its `apply` on the query it changes, and is sent behind it. What
  can't wait for a connection (logging in, your account, onboarding) is
  `useAction`: it saves, refetches the queries on screen with the page still
  drawn, then resolves. Either way a failed save says so in a toast, and an
  ended session goes to log in.
- **A page may have one context,** its organising layer: `<Page>Provider`
  and `use<Page>Page()` in its feature's `contexts/<Page>PageContext.tsx`.
  It holds the page's shared state, what must be worked out once, and what
  several parts must agree on; never the data, which stays in the cache.
  What only one part needs, that part works out itself. Its parts read it
  rather than take props. A value that changes often goes in a second
  context from the same provider, so parts that don't read it aren't drawn
  again. The Planner, its lists, Settings, onboarding, This week, It's time,
  a Library entry and the Journal have one.

## The app's layout

- **Five pillars, in one row:** the tab bar on a phone, the top bar on a
  desktop, in one order (`PILLARS`), from the middle out: This week in the
  middle, the Journal and the Planner either side (past to future, as on the
  strip; the Planner on the right, the easier side for most thumbs), the
  Library and the Drawer at the edges. The same five in the same places on
  every phone and computer.
- **Three levels on a desktop, each on its own axis.** The top bar
  (`TopBar`, `src/app/desktop/components/`) is the app's, the same on every
  page: Expecting and the week you're in (`30+2`, opening the whole
  pregnancy; not while something has happened), the pillars, then the
  Library's search (`/`), the "+", what the phone keeps in its corner, and
  whose session it is (`You`: your name, settings, logging out on this
  computer, which is more often shared than a phone). A pillar's rail is the
  pillar's: its own places, down the left of each of its pages
  (`PillarLayout`'s `rail`; `PlannerRail`, `LibraryRail`, `JournalRail`, each
  in its pillar's `desktop/components/`, built from `Rail` and `RailLink`),
  each place an address. This week and the Drawer have none: each is one
  page. The side panel is the thing's, on the right (below). Why a bar
  rather than a sidebar: five places sit in a row, and the width a sidebar
  takes from every page is what side-by-side pages want.
- **The side panel, a desktop's.** What you're looking at, beside what
  you're working through: the page gives it room (`DesktopLayout`'s slot,
  `src/app/desktop/components/panel/`) and stays live, so you scroll it, tick
  on it, and open the next thing, which takes the panel's place (one at a
  time, `claim`). Esc and its close shut it. Two ways in:
  - **An entry, by its address:** every link to one (`ItemLink`) outside the
    Library opens it in the panel on a desktop, `?panel=item:<id>` on the
    page you're on (the `app` route's search, `src/app/model/panel.ts`), so
    Back closes it and a link to it opens it; the page doesn't move (`resetScroll: false`). Drawn
    by `AddressedPanel`, the Library's `EntryInset` inside (the entry's own
    provider, `inset`, its title an `h2` under the page's `h1`), with "Open
    in full". Not a private entry (its link goes to its page, masked, as on
    a phone), and not from an entry's own page, where reading on is reading
    in full.
    In the Library itself (`/library`: a door, search, Right now) a link
    opens the entry in its reader instead, a `Modal` over the list
    (`?entry=<id>`, the Library's own search; `EntryReader`), since there
    you came to read, not to keep a page beside it: on through the list by
    its arrows, ← →, or its foot (`neighbours`, the same as the phone's
    swipe), each replacing the last in the history, so Back closes it. A
    phone given that address goes on to the entry's page.
  - **Something opened to look at and change** (someone in Your people, a
    line on a list, a first, a bingo square, a line of the story):
    `DetailSheet` (`src/app/components/`), a sheet on a phone, the panel on a
    desktop. Its opener's state still says whether it's open.
  What isn't looked at stays as it is: something to do and be done with (the
  "+", a question to ask, a confirmation) is a sheet on both, and a photo or
  a scan takes the whole screen.
- **Beside settings, not pillars:** Emergency info and It's time, in the
  phone's top corner (`MobileCorner`) and the top bar, and the call button
  (`CallBirthSuite`): the birth suite's number from Emergency info, drawn
  once it's filled in, and read without suspense so the app's layout never waits
  for it. A symptom's `Triage` calls the same number.
- **The app's layout provides what content renders against** (the answers, now,
  the questions already asked), so a Markdoc tag works the same everywhere.
- **Each thing lives in one pillar and meets the others on its week.**
- Settings sits in the app's layout; onboarding and login don't.
- **Every page inside a pillar draws `PillarLayout`** (`src/app/components/layout/PillarLayout.tsx`):
  one column at the page's width, and its top. A pillar's own page has its
  title and lead, with `MobileCorner` on a phone; a page under it (`back`) has
  the way back, then its title; a page that draws its own top (This week's
  hero, a Library entry) has neither. It never asks whether something has
  happened: a page put away then is its route's quiet world, `putAway`
  (`PutAwayPage`). A pillar adds what's
  its own around it: `JournalTabs` (a phone's; a desktop has the rail),
  `DrawerTool`, and on a desktop its `rail`, beside which a page's way back
  isn't drawn, as the rail says where you are. So `AppLayout` is the app's
  layout (the top bar, the tab bar, the "+") and `PillarLayout` a page's.

## The pillars

### This week

`/`, `?at=29` to peek at another week ([product](product/this-week.md)).
`src/pillars/thisWeek/`. The map of its code, its words and how to add a
section is [`src/pillars/thisWeek/README.md`](../src/pillars/thisWeek/README.md).

- `ThisWeekPage` is `ThisWeekPageProvider`, which works out the week shown,
  whether it's a peek and the week's note once, around `ThisWeekMobile` (one
  column, the doing first) or `ThisWeekDesktop` (the week on the left, the
  doing on the right: `DoingNow`, or on a peek `BestDoneThatWeek`).

- To do now is `toDoNow` (`src/lib/planner/todo.ts`), Coming up `comingUp`; the
  heads-up and Worth knowing are `headsUps` and `worthKnowing`
  (`src/lib/library/thisWeek.ts`).
- The strip is `PregnancyStrip` (`src/pillars/thisWeek/features/timeline/components/strip/`).
- The week's note and the day reads are one carousel, `DayByDay`; the note
  reads as whoever holds the phone, with a toggle for the other's part
  (`WeekNote`, `src/pillars/thisWeek/components/weekNote/`).
- What Expecting needs to know is `AskNow`, the extra on offer
  `extraToOffer`, the check-in `CheckIn` and `HardFortnight`
  (`src/pillars/journal/features/feelings/`), the next appointment `NextAppointment`, and
  the week's question `WeeklyCard` while A question a week is on.
- While something has happened it's `QuietThisWeekPage`
  (`src/pillars/thisWeek/quiet/`), and the timeline `QuietTimelinePage`.

### The whole pregnancy

`/timeline`, `?at=28` ([product](product/timeline.md)): opened from This
week, not a pillar, so no tab and no "+". `src/pillars/thisWeek/features/timeline/`, the
rules in `src/lib/thisWeek/timelineWeeks.ts`. `PillarLayout` draws its top, as it is and
while paused. A week is a line (`TimelineWeeks`) that links
to This week at it (`/?at=<week>`). The strip's weeks are left out of the
tab order; the steps beside it are the keyboard's way.

### Library

`/library` (`?q=`, `?door=`, `?topic=`, `?verdict=`, `?for=partner`),
`/library/<id>` ([product](product/library.md)). `src/pillars/library/`,
mapped in its [README](../src/pillars/library/README.md); the rules are
`src/lib/library/`, a file each: the doors and their shelves, search and
its ranking, Right now, what This week takes, and the clues
(`namesPrivate`, `cluesIn`). An entry's page is `LibraryItemPageProvider`
(`useLibraryItemPage`, `useEntry`), worked out once from its id;
`ItemCard` draws an entry by its type. Every link to an entry is
`ItemLink`. An entry's words load in its route's loader, so it opens
whole. What you've read is `item_read` (yours alone: a person, an item's
id with no foreign key, when first opened), marked by the entry's page
(`Entry`) through `readsSaves.markRead` (`src/api/rpc/reads.ts`) and
shown by `ReadMark`; never for a private entry. A list passes its ids to
`ItemLink` (`list`), kept in the history entry's state (`HistoryState.list`,
`src/router.tsx`), not the address, so a private entry stays masked; the
entry's page (`Through`) swipes through them (`useSwipe`) and links the
neighbours, each replacing the page in the history. The Library's pages
alone have the router's scroll restoration (`scrollRestoration`,
`inLibrary`), by history entry; `App` starts every other page at its top.
An entry's way back (`WayBack`) is the history's Back when it was opened
from a Library list (`HistoryState.from`). Content is [below](#content).

### Planner

[Product](product/planner.md).

The map of the code is `src/pillars/planner/README.md`.

- **To do** (`/planner`): `src/pillars/planner/` and `src/pillars/planner/features/tasks/`
  (`TaskRow`, `AddTask`, `KeepButton`), its shape `src/lib/planner/plan.ts`
  (`next`, `now`, `ahead` in `STAGES`, `earlier`, `done`) over `toDoNow`,
  worked out once for the page in `PlannerPageProvider` (`usePlan`).
  Ticks are `task_tick`, own tasks `own_task` (a title and a week).
- **The weeks** ("Across the weeks", `/planner/weeks`, `?stage=37`): `WeeksPage`, the
  bars from `weeksChart` (`src/lib/planner/weeks.ts`).
- **Lists** (`/planner/lists`, `/planner/lists/<id>`): `src/pillars/planner/` (`ListsPage`, `ListPage` and `ListPageProvider`, `components/lists/`),
  rules `src/lib/planner/lists/` (`LISTS` in `builtIn.ts`; the lines that apply, `lines.ts`; what's left, `summaries.ts`; by section, `sections.ts`). A
  built-in line comes from an item's `lines`, tailored like the item. The
  store is `own_list`, `own_line` and `list_mark` (a line's id, no foreign
  key, like `task_tick`; no row is still to get).
- **Appointments:** `src/pillars/planner/features/appointments/`, the `appointment` table
  (title, `day`, perhaps `time`, `place`, `notes`), rules
  `src/lib/planner/appointments.ts` (the next is the earliest still ahead, today's
  included; its week from the due date on read). Add to calendar is a plain
  link to `GET /api/appointments/<id>/calendar.ics` (`src/api/rest/calendar.ts`,
  the file from `icsOf`, `src/lib/planner/calendar.ts`): a server route, because a
  phone hands a file to its calendar only from a URL with its own type. The
  time floats (local, no zone), an hour long, or all day; the `UID` is the
  appointment's id.
- **Questions:** `src/pillars/planner/features/questions/`, the `question` table (`answer`,
  `asked_at`, the `item_id` it came from). The way in from an entry is
  `AskAtAppointment` (suggestions from `suggestionsFor`), and an entry's own
  questions back are `QuestionsAbout`. An unknown `itemId` is refused by
  `isBuiltInItemId`, a private one by the privacy middleware.

### Journal

`/journal` (`?view=`, `?at=`), `/journal/collections`,
`/journal/collections/<name>`, `/journal/book`
([product](product/journal.md)). The map of its code, its words and how to
add a kind of line is
[`src/pillars/journal/README.md`](../src/pillars/journal/README.md).

- The route chooses (`worlds`): `JournalPage` in `JournalPageProvider`, which
  builds the story's lines once, or while something has happened
  `QuietJournalPage` in `QuietJournalPageProvider` (`quiet/`); each draws
  inside `PillarLayout`, under `JournalTabs` on a phone, beside `JournalRail`
  on a desktop.
- `components/` has a folder per part (`story/`, `thisWeek/`, `lines/`,
  `collections/`, `book/`); the quiet Journal is `quiet/`; each kind kept is a feature,
  `features/<kind>/`, its forms and rows (which the "+" and other pillars
  import) and its collection in full.
- The rules are `src/lib/journal/`: `story/` (the lines, collections, views,
  search, spine, zoom), `summaries/` (each collection's answer, a file each),
  `labels.ts`, `journal.ts`, `firsts.ts`, `chapters.ts`, `places.ts`,
  `recap.ts`, `appetite.ts`, `feelings.ts`, `photos.ts`, `papers.ts`.
- The store: `journal_entry` (`note`, `movement`, `letter`), `first_mark`
  and `first_words`, `journal_seen`, `feeling`, `appetite_entry`, `photo`,
  and `paper` with `paper_page` (both on uploads). An entry keeps its day;
  its week is worked out from the due date as it's read.
- **Feelings' words never reach the other phone.** `FeelingsRepo.list(asker)`
  sends the asker's own whole and the other's step only; `change` and
  `delete` act only on the asker's own. Tested in the repo and on the wire
  (`e2e/mood.spec.ts`).

### Drawer

`/drawer` ([product](product/drawer.md)): each tool shown once its extra is
on, the rest named by the extra that brings them. The map of its code, its
words and how to add a tool is
[`src/pillars/drawer/README.md`](../src/pillars/drawer/README.md): each
tool's page is drawn inside `DrawerTool`, which says when it's put away or
off, and each has a tile on the Drawer (`ToolTile`, `ToolOff`).

- **The names game** (`/drawer/names`, `src/pillars/drawer/features/names/`): dealt by
  `upNext` (`src/lib/drawer/nameDeck.ts`) from [the names deck](#the-names-deck),
  the sex from the colours (`dealing`, `src/lib/drawer/names.ts`). The store is
  `baby_name` (a deck name gets a row the first time either of you votes on
  it; `off_at` takes it off the shortlist) and `name_vote` (`super_on`, a
  superlike's day). `src/api/rpc/names.ts` answers only with your own votes,
  your superlike and the shortlist, never the other's votes.
- **Who does what** (`/drawer/jobs`, `src/pillars/drawer/features/jobs/`): `JOBS` in
  `src/lib/drawer/jobs.ts`, each answer a `job_pick`.
- **Your people** (`/drawer/people`, `?view=`, `src/pillars/drawer/features/circle/`):
  `circle_person`, `circle_gift`, `announcement`, a view per extra
  (`src/lib/drawer/circle.ts`).
- **Pregnancy bingo** (`/drawer/bingo`, `src/pillars/drawer/features/bingo/`): `SQUARES`
  in `src/lib/drawer/bingo.ts`, a card each (`bingo_card`), its squares marked
  (`bingo_mark`).
- **A question a week** is drawn on This week (`src/pillars/thisWeek/features/weekly/components/`):
  `WEEKLY` in `src/lib/thisWeek/weekly.ts`, answers in `weekly_answer`.
- **Both answer, then reveal** is one rule in the repos' views
  (`JobsRepo.view`, `WeeklyRepo.view`): the other's answer is sent only
  once you've both given one.

## Outside the pillars

- **The capture "+"** (`src/app/features/capture/`,
  [product](product/capture.md)): drawn by `AppLayout` on the pillars
  only, a `Modal` listing `captureChoices` (`model/choices.ts`: the order,
  what's offered when, `CHOICE`, what each is called, and `FILED_IN`, where
  each goes). Each choice is its pillar's own form (`AddMovement`,
  `AddNote`, `AddPhoto`, …) with an `onAdded`, picked in `CaptureForm`, a
  switch over every kind, so a new one doesn't compile without its form.
- **Emergency info** (`/emergency`, `src/app/features/emergency/`,
  [product](product/emergency.md)): the `emergency` table, the fields in
  `src/lib/emergency.ts`, the handover built by `handover`
  (`model/handover.ts`) from them and the answers; then `PapersToHand` and
  `WarningSigns` (from `content/items/warning-signs.md`). Read as
  `components/view/`, filled in as `components/form/`.
- **It's time** (`/its-time`, `src/app/features/itsTime/`, rules
  `src/lib/itsTime.ts`, [product](product/its-time.md), the map in its
  `README.md`). Shown by `itsTimeShown`; one context,
  `ItsTimePageProvider` (the start, a home birth, who's who); `stillToReady`,
  `bagOf`, `flagsFor`, `theyllAsk`, `patternOf`. The
  store: `labour_start` (one under way at a time, a unique index),
  `contraction` (refetched every few seconds while under way; a wake lock
  keeps the screen on), `start_tick`, `start_line`; Emergency info holds
  its fields (`partnerPhone`, `hospitalWayIn`, `hospitalSaid`, the minder,
  the backup driver). Every save names its start and a contraction's end
  carries its beginning, so saves arriving out of order make the same night.
  The bag is `bag` in `LISTS` (`isApart`, kept out of the Planner's lists).
  The night's Journal line is `nightLine`. This week's look-through card is
  once a phone, in browser storage.
- **Something has happened** ([product](product/quiet.md)): one row
  (`quiet`: `loss` or `news`, who, when), deleted to come back, so nothing
  else is touched. The core is `src/lib/quiet.ts` (the kinds, `canBecome`),
  the state `useQuietQuery`, and `useQuietKind` for a part both worlds draw.
  The way in is `QuietSwitch` (`src/app/features/quiet/`), on the guide's page
  and in Settings (`/settings?ask=quiet`); the way back is `canBecome`.
- **Quiet is a mirror world of each pillar.** A pillar, or a feature in one,
  that's different while quiet has `quiet/` in the one shape: `quiet/pages/`
  (`QuietThisWeekPage`, `QuietTimelinePage`, `QuietLibraryPage`,
  `QuietPlannerPage`, `QuietJournalPage`, `QuietBookPage`), `quiet/contexts/`
  where a quiet page needs its own (the Journal's, the Planner's, each built
  from the same rules as the normal one, only less), and `quiet/components/`.
  Its small rules (what's folded, offered, said) are `src/lib/<pillar>/quiet.ts`.
  The route's file is the one place that chooses: its component is
  `worlds(normal, quiet)` (`src/app/features/quiet/worlds.tsx`), two
  `lazyRouteComponent`s, so it names each world's page and no page chooses.
  Quiet is read from the cache the app's loader filled, so the choice never
  waits; both pages are preloaded, and a change swaps one for the other in
  place. Each page takes its own provider inside itself; the normal world's
  pages, contexts and parts never check quiet, and a part both draw reads
  neither context (`useQuietKind`). Where the two share all but one part, the
  rest is one component both pages draw (the Library's `LibraryPageBody`, around
  `LibraryHome` or `QuietLibraryHome`). The address is the same in both
  worlds. A page put away while quiet (the Drawer and its tools, the Planner's
  weeks and lists) has no `quiet/`: its quiet world is `putAway({ subject,
  back, title, lead, … })`, `PutAwayPage`, its top as it is and
  `PutAwayNotice` in place of the page; `PillarLayout` never reads quiet. It's
  time's quiet world is `QuietItsTimePage`, Emergency info's address. Outside
  the pillars, a feature's quiet rule is in its own `model/`
  (`captureChoices`, `itsTimeShown`).

## Content

- **Built-in items are files:** `content/items/<id>.md`, one Markdoc file
  each, the name its id. How one is written is
  [`content/README.md`](../content/README.md); the review's standing calls
  are [`content/REVIEW.md`](../content/REVIEW.md). Chosen over content in
  the database because it's reviewed like code: diffs, history, and a build
  that refuses bad data.
- **One item, typed** (`src/content/schema.ts`): one `Item` with a `type`,
  not a model per type, so there's one read path, one page, one search, and
  every pillar works off one list. The types are in
  [the Library](product/library.md#the-types). Each has one `topic`
  (`TOPICS`) and may have `ask`, `aliases`, `who`, `stakes`, `related`,
  `sources`, weeks (within 1–42), tasks and `lines`. Each type's body has its
  shape, checked by `src/content/parse.ts`.
- **A linked task** has `opens` (default: the item's first week), `due`
  (best by, default its last), an optional `deadline` (from the source, on
  or after `due`) and `who` (`carrying`, `partner`, `together`, the
  default). A decision's `decide_by` makes a task, `decide-<id>`. Ids are
  stable: ticks point at them, so wording can change without losing state.
- **Checked as it loads.** zod validates every file when the content module
  loads, and `bun run test` loads it, so a bad file fails the gate, not the
  page. Every tag, attribute, `$question` and answer is checked too.
- **The index and the page.** `src/content/vite.ts` splits each file at
  build time: one module holds every item's index (so lists and search work
  offline at once), and each page's body is its own chunk, loaded by
  `loadPage`.
- **Markdoc tags** (`src/content/markdoc.ts`) are drawn by components in
  `src/pillars/library/components/content/`: `{% ask %}` a suggested
  question, `{% window %}` an item's weeks against today, `{% if %}` a
  passage for some readers. Content decides where; code decides how.
- **The week's note** is `content/weeks/<week>.md`: a title, perhaps the
  baby's size, and three `##` parts (The baby, Your body, For the partner),
  checked by `src/content/weeks.ts`. **A day's read** is
  `content/days/<week>/<day>.md`, +1 to +6: a title, `read` (the entries it
  opens onto) and a short body with no links (`src/content/days.ts`).
- **A private entry leaves no trace** (`private: true`: family violence,
  reproductive coercion). The other parent may be the one causing harm.
  What it does is in [the Library](product/library.md#private-entries); how:
  - The content rules refuse one with tasks, lines, `decide_by`, `when`, an
    extra, `{% ask %}` or `appointment:` questions.
  - Function middleware (`src/server/privacy/`, after the gate) refuses any
    server function's input that names one: its id anywhere, or its title,
    question or "About …" as the whole of a string (`namesPrivate`). The
    session's functions and passwords are exempt.
    `test/server/private.test.ts` runs every write path through it and fails
    when a new one isn't listed.
  - `ItemLink` masks a private entry's address as `/library` (the router
    keeps the real one in the history entry's state, so Back and a reload
    find it) and replaces rather than stacks it. Search words that find one
    are held on the page, not in `?q=`.
  - The service worker fetches every page as it installs, so a private one
    being kept says nothing. The document's title is always "Expecting".
- **A discreet entry** (`discreet: true`: mental health, drugs, smoking) is
  shared, but a question asked from it isn't labelled "from *title*" on the
  Planner or This week.

## Tailoring

- **The questions** are `src/app/features/settings/model/facts.data.ts`, read
  and checked by `facts.ts` beside it (`applies`, `checkWhen`); what the
  answers become is `src/lib/facts.ts` (`factsOf`, `questionsDue`,
  `timeTask`). They drive behaviour, so they're code, not content: their ids
  are types (`QuestionId`), checked by `tsc`, and content names them as
  strings, checked by the tests. Each has a `type` (`choice` or `date`), and
  may have `each: true` (asked of each of you: the key is `work.partner`), a
  `when` (it waits on another answer), `asked: onboarding` and a `week`.
- **Answers are rows** in `answer`: the question, whose (`carrying`,
  `partner` or null), the value, who and when. The latest counts, so a fact
  keeps its history; a skip or a clear is a row with no value.
  `questionsDue` decides when to ask again: from its `week`, while unknown or
  `unsure`, and four weeks after a skip (`ASK_AGAIN_AFTER`).
- **An item's `when:`** hides it on a definite answer; `{% if %}` tailors a
  passage. Nothing is written against `unsure` (`checkWhen` refuses it), so
  the `{% else %}` branch is the general wording.
- **A task can be timed from a fact** (`timeTask`):
  `deadline: { before: leaveStart, weeks: 10, week: 30 }` is notice 10 weeks
  before leave begins, whose leave by the task's `who`; `week` stands in
  until the date is known.
- **Facts are not records.** A fact changes what Expecting tells you to do;
  a record is something you look up. The birth suite's number is a contact
  and a caesarean's date an appointment, even where a fact points at it.
  Without this line the facts grow into the whole store.
- Settings shows every question by `group`, with who answered, when it's
  next asked and what it decides; `/settings?ask=<key>` opens at one. A
  **question** is what's asked and an **answer** what's kept, in the code
  as on the screens (`QuestionRow`, `useAnswersQuery`); **facts** are only
  the rules over them (`facts.ts`, `src/lib/facts.ts`). The map of
  Settings' code is `src/app/features/settings/README.md`.

## Extras

`src/app/features/settings/model/extras.data.ts`, read by `extras.ts` beside it;
what the choices mean is `src/lib/extras.ts` (`extrasOn`, `inExtras`,
`extraToOffer`). [Product](product/extras.md).

- An item with `extra: <id>` shows only while it's on: `useItems` drops it
  and `useTasks` its tasks. Its page links to the switch
  (`/settings?ask=extra:<id>`).
- An extra may have a `when` (as an item's), `onboarding: true`, an `offer`
  week, a group (`EXTRA_GROUPS`) and a `tool` (what it brings beyond its
  items, said wherever it's offered).
- Choices are the `extra` table, a row once decided (on or off, who, when);
  no row is undecided.

## Onboarding

- `/onboarding` asks a question a screen, each at its own URL
  (`/onboarding/due`, `/onboarding/q/cover`), so the back gesture goes back
  a question. The app's layout sends anyone with a step left there; the first of
  you gets all of them, and the other, joining later, goes straight in.
- Which steps are asked is a pure function of what's known
  (`src/lib/onboarding.ts`): the due date, the colours, every
  `asked: onboarding` question that fits so far, the extras, where it will
  open. `/onboarding?after=due` works out the next afresh (`stepAfter`),
  since the other phone may have answered meanwhile.
- Each answer is saved as it's given, so a reload resumes. With the due
  date skipped, This week asks for it.
- Each step is a component reading its own queries, drawn in
  `OnboardingLayout`; `OnboardingPageProvider` holds only where it is and
  the ways on. The map is `src/app/features/onboarding/README.md`.

## The names deck

`src/lib/drawer/nameDeck.data.json`, generated by `bun run names`
(`scripts/names.ts`) from registers that publish every name given each year
with its count: England & Wales (ONS, OGL v3), Ireland (CSO, CC BY 4.0),
Ontario (OGL-Ontario), New Zealand (DIA, CC BY 4.0), South Australia (CC BY
4.0) and optionally the US (SSA, public domain: download `names.zip` by hand
and run `NAMES_US=<path> bun run names`, as the SSA turns away scripts).
Rerun each year once the new lists are out.

- A name's popularity is its share of a country's babies of its sex,
  averaged across countries. It's in the deck if it averaged at least 1 in
  10,000 of a decade's babies since 1950 somewhere, or is in a latest top
  100. Dealt are those common in at least two places; the rest are kept but
  not dealt. "Either" is at least a fifth of the other sex.
- Not names: registry entries like `UNNAMED`, and anything but letters,
  apostrophes and hyphens. Spelled as the registers that keep case write it.
- Not used: British Columbia, NSW, Victoria and Queensland (top 100 only),
  Alberta, Quebec, Scotland (worth adding), anything from leaked
  social-media data. Meanings: none free; Wikidata (CC0) has variants and
  nicknames, for the shortlist later.
- 43 KB compressed, loaded with the Drawer's page, and on the server only
  when a swipe arrives (it checks the name is in the deck).

## Uploads

Files kept for a record: photos and scans, the pages of results and papers.

- **On disk** in `DATA_DIR/uploads/<id>/`, beside the database, so one
  backup takes both: `original` (untouched, EXIF and all) and for a picture
  `display` (JPEG, 2048 px long edge) and `thumb` (480 px). Written to a
  folder of its own, then renamed into place, so a half-written upload is
  never served (`FileStore`, `src/server/files/store.ts`).
- **A row each,** `upload`: the phone's id (sending twice keeps one), name,
  type, size, a picture's dimensions, its copies, who and when.
- **Typed by its bytes** (`sniff`, `src/lib/files.ts`): JPEG, PNG, WebP,
  HEIC, HEIF and PDF, up to 30 MB. Never SVG or HTML: nothing that can run
  in the page.
- **Made smaller on the phone** (`prepareFile`, `src/app/model/uploads.ts`):
  the browser already has the picture decoded and upright, where the server
  would need native image libraries. The copies carry no EXIF, location
  included. A HEIC the browser can't open is refused in words.
- **Owned by its record:** `file_id REFERENCES upload(id)` (`photo`,
  `paper_page`), and deleting the record drops the upload. One nothing
  points to a day on is swept (`FilesRepo.unclaimed`, which asks SQLite for
  every column referencing `upload`, so a new table counts unlisted).
- **Up** through `putUpload` (`src/api/rpc/files.ts`), as a form, judged by
  the gate and the privacy rule like every save.
- **Down** through `GET /api/files/<id>/<variant>` (`src/api/rest/files.ts`):
  a server route because an `<img>` needs a plain URL. Behind the gate, sent
  with its sniffed type, `nosniff`, `private, immutable`, and with
  `?download` as an attachment.

## PWA

Installing and the service worker need HTTPS, except on `localhost`.

- **Installable.** `public/manifest.webmanifest`, the icons rendered from
  `public/icon.svg` (192, 512, a maskable 512, the Apple 180), and a favicon
  per theme that `paintFavicon` (`src/lib/theme.ts`) switches. Public files,
  served ahead of the gate.
- **Service worker,** hand-written: `src/pwa/worker.js`, emitted as `/sw.js`
  by `src/pwa/vite.ts` in a build only, with the build's files written in,
  so a new build is a new worker that takes over and drops the old caches.
  Dev has none, and unregisters any a build left behind.
- **Offline reads.** Every page is the same shell, so the worker keeps one;
  it fetches the app's files as it installs and every item's page just after.
  Each server function's last answer is kept (`expecting-data`). Pages and
  data go to the network first and fall back to what's kept after four
  seconds (hospital Wi-Fi); the build's files come from the cache first.
  Queries are `networkMode: "offlineFirst"` so they ask offline and the
  worker answers. A 401, logging out and a new build forget the kept data.
  Every `/api/` path but `/api/rpc/` goes to the network, so it's never
  answered with the shell.
- **Offline writes,** as an outbox over TanStack Query's mutations
  (`src/app/model/outbox.ts`). Each `Save` is defined beside its server
  function, with `apply` (what it does to the one query it changes, giving
  the same answer run twice: `test/app/saves.test.ts`), and listed in
  `src/app/model/saves.ts`.
  - A save is written to localStorage (`expecting-outbox`, synchronous, so
    it survives the app being swiped away), shown at once, and sent one at a
    time, retried until it gets through. While it waits it's applied over
    every answer fetched, so a kept answer from before it never undoes it on
    screen. Left waiting when the app closed, it's restored by the `app`
    route's loader (`restoreOutbox`).
  - Landed saves are remembered (the last 200). The worker stamps each kept
    answer with when it was asked for (`x-expecting-kept-at`), and the outbox
    re-applies every save that landed after it, so a dropped connection
    can't put the screen back to before a landed save.
  - Turned away (a 4xx, or a server error after a few tries), a save is
    dropped with a toast and the screen refetched; a 401 keeps it for after
    logging in, when it goes as whoever logs in next.
  - The phone stamps when each was made (`x-expecting-made-at`, believed if
    not in the future and under 60 days old); what it adds carries the
    phone's own id, so a save sent twice adds once. The last to arrive wins,
    except the facts, which keep the latest made.
  - A save with an upload keeps its parts in IndexedDB first (`keepOnPhone`,
    `src/app/model/uploads.ts`), drawn from there until they're up
    (`useUploadSrc`); its `send` (`withUpload`, `withUploads`) puts the
    upload first, then the record, then forgets the phone's copy.
  - **Known gap:** saves that waited offline can reach the server out of
    order on reconnect, as `resumePausedMutations` continues every paused
    mutation at once. It's time's saves give the same night in any order;
    the outbox should send one at a time for every save. Also not covered:
    two tabs on one phone each send what's waiting.
- **Uploads offline.** The worker keeps each thumbnail and display copy as
  it's drawn (`expecting-files`, cache first), and originals only for a
  handy paper, which the page puts there itself (`keepHandyOffline`). It
  answers every `/api/files/` path itself, so an upload is never answered
  with the shell. This cache outlives a new build; logging out clears it.
- **Sharing in** (Android only; Safari has no share target): the manifest's
  `share_target` posts to `/share`, which only the worker answers, keeping
  the share (`expecting-shared`, one at a time) and opening the app. The app's
  layout takes it once (`takeShared`, `src/pwa/share.ts`; under an hour old),
  after any login or onboarding, into the "+" (`SharedIn`, offering
  `sharedChoices`).

## Claude (MCP)

[Product](product/mcp.md).

- **One endpoint, `/api/mcp`** (`src/api/rest/mcp.ts`): MCP over Streamable
  HTTP, stateless, a fresh `McpServer` per request. The tools are
  `src/api/mcp/tools/`, a file for each pillar or part (`thisWeek`,
  `library`, `planner`, `journal`, `drawer`, `itsTime`, `emergency`, and
  `remove`), put together by `server.ts`; `instructions.ts` is what Claude
  is told, `context.ts` what a tool knows (`Known`: the answers, the
  tailored items and tasks, each worked out only when asked for),
  `shapes.ts` the answers several pillars share, and `answer.ts` how a tool
  is registered (`read`, or `keep`, whose arguments pass `refusePrivate`
  first) and answers. They call the repositories directly and keep the
  app's rules: tailoring through `src/content/tailor.ts`, which the app's
  hooks use too, and the pages' own rules (It's time's `flagsFor`,
  `theyllAsk`, `stillToReady`). The Library's search for a sentence is
  `rank` (`src/lib/library/search.ts`) beside the app's `search`. Each tool
  reads the server's clock, so `TZ` is where you are (the image's is
  Sydney's; compose takes `EXPECTING_TZ`).
- **OAuth 2.1, with your login as the consent.** Clients register
  themselves (`/api/oauth/register`), are public (PKCE S256, no secret), and
  find everything from the `/.well-known/` metadata
  (`src/server/oauth/endpoints.ts`). Authorising is `/connect`, behind the
  gate, so only one of you lets a client in (`approveConnection`). Codes
  live a minute, access tokens a day, refresh tokens 400 days from last use
  (replaced on each use); only their SHA-256 is stored (the `connections`
  domain). Disconnecting deletes the connection and its tokens. A client
  nobody connected is forgotten after a day, since registering is open.
- **The gate:** the metadata, `register`, `token` and `revoke` are open.
  `/api/mcp` is judged by its bearer token (`grantOf`); a cookie never
  counts there, and anything else gets a 401 pointing at the metadata. With
  logins off, `/connect` refuses.
- **The public address** is `EXPECTING_URL`, else the proxy's
  `X-Forwarded-*`, else the request's (`src/server/oauth/origin.ts`). These
  endpoints answer any origin (CORS `*`), since they take tokens, never
  cookies.

## Look and feel

### Adaptive

- **Two experiences, each responsive.** A phone and a desktop each get a
  layout designed for them, not one layout rearranged: on a phone the tab
  bar under the thumb, one thing at a time, the corner (`MobileCorner`) for
  It's time, the call button, Emergency info and settings; on a desktop the
  top bar, a pillar's rail, and things side by side. Within each, a part still flows with
  the width (`sm:`: cards two across, a row's answer beside its question),
  but the page's gutter is the layout's: 16px on a phone (`px-4`), 32px on a
  desktop (`desktop:px-8`), so a scroller that runs to the screen's edges
  (`-mx-4 px-4`, the Library's chips, the Journal's story controls) always
  meets it.
- **Two, not three.** Under 1024px is a phone's layout: every phone, and an
  iPad held upright. 1024px and over is a desktop's: laptops, monitors, and
  an iPad turned sideways. There's no tablet view: a third would mean
  building everything three times, and a tablet fits one of the two. The
  desktop's rail and columns are too tight under 1024px, which is why
  the line is there. A phone's layout on a wider screen (640–1023px) is
  stretched, not redesigned: `sm:` lets a part use the room (cards two
  across, an answer beside its question), and nothing else changes there.
- **One line, two ways to follow it.** The line is `DESKTOP_MEDIA`
  (64rem, `src/app/model/layout.ts`): `mobile` under it, `desktop` on and
  over it. `useLayout()` (`src/app/hooks/useLayout.ts`) follows it in React,
  as the window is resized across it (`layoutNow()` for an effect that asks
  once). A boot script (`LAYOUT_BOOT_SCRIPT`, in `Document`) puts the same
  answer on `<html data-layout>` before the first paint, and the `mobile:`
  and `desktop:` variants (`src/styles/index.css`) follow that. There's no
  `lg:` breakpoint any more, and a test keeps it out (`test/app/layout.test.ts`).
  A desktop stretches the way a phone does with `sm:`, by `xl:` (1280px) and
  `2xl:` (1536px) within a part: the top bar's words beside its icons.
- **Structure with `useLayout()`, adjustments with the variants.** Where the
  two differ in what's there or its order (a part only one has, a column
  beside the page, a camera or a drop zone), a part chooses with
  `useLayout()`, never by drawing both and hiding one, which mounts the other
  and runs its effects for nothing. Where it's the same parts in the same
  order, only spaced or sized differently (side by side rather than stacked,
  a bigger heading), `desktop:` and `mobile:` say so. The one exception is the
  loading skeleton (`PageSkeleton`, `src/components/`), a placeholder with
  nothing to run, which stays out of the app's code.
- **A layout of each is a mirror, like quiet.** What's only a phone's or only
  a desktop's goes in `mobile/` or `desktop/` beside what it splits, in the
  one shape (`pages/`, `components/`): the app's own are
  `src/app/mobile/components/` (`MobileLayout`, `MobileCorner`) and
  `src/app/desktop/components/` (`DesktopLayout`), and `AppLayout` chooses
  between them. What both draw stays outside both (`PillarNav`). This
  week's is two pages (`ThisWeekMobile`, one column, the doing first, the
  week's reads between its runs; `ThisWeekDesktop`, the week on the left
  and the doing on the right); Settings' nav is the desktop's only
  (`settings/desktop/components/SettingsNav`). A page
  chooses under its own provider (`layout === "desktop" ? <X /> : <Y />`), so
  what it holds (search words, what's open) carries across the line, and the
  address is the same in both. Quiet is chosen by the route and the layout by
  the page, so they never multiply: a quiet page has `quiet/mobile/` and
  `quiet/desktop/` only where it differs too. Biome keeps them apart: nothing
  in `mobile/` imports `desktop/`, or the other way.
- **Tests:** the DOM tests' window is a phone's (390 wide, `vite.config.ts`),
  so a part drawn per layout draws the phone's; a test of the desktop's
  resizes it (`happyDOM.setWindowSize`).
- **Under the top bar.** Its height is `--top-bar` (nothing on a phone), so
  what sticks while a page scrolls (the doing beside This week's week, the
  Planner's side, Settings' nav, a private entry's quick exit) sticks under
  it.
- One width for the pillars (`max-w-6xl`), so the header stays put between
  them; what's read rather than scanned (a Library entry, Emergency info,
  the book) keeps a `max-w-3xl` column at the left.
- Tap targets at least 44px, no hover-only interactions, safe areas
  respected. e2e loads every page at both sizes.

### Motion

- **One set of timings** (`src/styles/motion.css`): 120ms for answering a
  tap, 200ms for a row arriving or leaving, 320ms for a page or a sheet.
  Nothing bounces or celebrates, and nothing does on the quiet path. Reduced
  motion gets short fades and no travel, from one rule.
- **Pages give way to each other** through View Transitions:
  `transitionBetween` (`src/app/model/transitions.ts`) picks in, out or
  across; a change of search alone has none, and the app's layout holds still.
- **Loading has a shape:** in the app's layout a slow page draws `PageSkeleton`
  after 400ms; the stork is for the first start only. Pillars' routes load
  what they read, and `App` warms every pillar once idle.
- **A tick is seen going:** in To do now it strikes through, holds a beat,
  folds away, with a toast to undo it and a light tap on Android
  (`feelDone`). After the "+", the toast says what was kept and where.
- **Floating buttons step aside** while the page scrolls down
  (`useOutOfTheWay`).
- **On a phone,** no tap highlight, no text selection on a long press, no
  double-tap wait (`src/styles/touch.css`), and the icon's badge counts the
  deadlines coming up (`useDeadlineBadge`): a badge that never clears is one
  nobody reads.
- **On a desktop,** `/` searches the Library and `n` opens the "+"
  (`useShortcuts`), never while typing or under a dialog.
- **Arriving on a page focuses its heading** (`useFocusOnArrival`), so a
  screen reader says where you are; not on the first page, not on a search
  change, never away from a field or a dialog.
- No offline marker: the outbox makes offline invisible.

### Theme

Expecting's own, not the design system's Linen, built from a reference
palette: `#9DC3E2` blue, `#9DD2D8` aqua, `#FADCE4` blush, `#FFB5CC` pink,
`#E2B9DB` lilac.

- **Palette** (`src/styles/theme/palette.css`): a 50–950 scale per family,
  generated by `bun run palette` (`scripts/palette.ts`), in OKLCH around the
  reference colours. Sky, lagoon, blossom, lilac, mist (neutral), sea
  (success), peach (warning), cherry (danger). It also writes
  `docs/palette.html`, every family and theme to open in a browser.
- **Three themes,** picked by the colours question: Baby Blue (a boy), Baby
  Pink (a girl) and Baby Purple (don't know or a surprise, and the default),
  each a file (`baby-*.css`) so each can be judged alone. Each sets every
  semantic token the design system reads, light and dark, plus
  `--expecting-accent-*` for the progress gradients and `--expecting-page`
  (a white with at most a temperature). `data-expecting-theme` on `<html>`
  picks it (`src/lib/theme.ts`); an inline script applies the last one
  before paint.
- **Colour comes in accents,** never as a fill, and never as a border on
  one side of a box: a card is outlined all round or not at all.
- **Contrast is tested,** all six (`test/styles/theme/contrast.test.ts`):
  body text 4.5:1 on the page, surfaces and tints; the focus ring and
  meaningful marks 3:1. On a tint, quiet text is `fg-normal`, not
  `fg-subtle`.
- **Dark, for all three,** because the moments that matter most are at
  night, beside a sleeping partner. The palette is the household's and the
  mode each phone's (`data-theme`, the design system's `bootstrapTheme()`
  and `useTheme()`): Light, Dark or System, under Appearance. Expecting's own
  hook is `useAppTheme`, so "theme" means one thing in each file.
- **Two design-system parts are restyled** in the theme's `overrides`
  layer: the progress bar's track is a faint line (its near-black made an
  empty bar look full), and a disabled solid button in the dark is its
  intent's tint.

## Data

The database holds only what you create: the people, sessions and invites;
the settings (the due date, the colours, onboarding finished); the answers;
the extras chosen; ticks and own tasks; lists; appointments and questions;
the Journal's entries, feelings, firsts, photos and papers, and the uploads
under them; Emergency info and It's time's nights; the names, jobs, Your
people, bingo and the weekly answers; whether something has happened; and
Claude's connections. Built-in content is in the repo. The current week is
derived from the due date, never stored.

## Backups

`DATA_DIR` holds the database and the uploads, and nothing else. Back up the
volume with the host's backup; a backup is only trusted once a restore has
been tested.
