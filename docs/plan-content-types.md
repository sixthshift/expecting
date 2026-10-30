# Plan: the Library's content types

The map (`content/map/`) is written: 837 entries in `content/drafts/`, typed
as the map types them (219 can-i, 211 guide, 163 term, 87 card, 73 symptom,
38 payment, 21 decision, 19 moment), plus the 56 items in `content/items/`.
The app reads only the items, and only one shape: a moment. This plan brings
every type into the app, so the review pass happens in the Library rather
than in an editor.

Decided with Jason on 2026-10-29:

- **Drafts show straight away, marked draft**, as the items do. The review
  pass clears `draft: true` entry by entry.
- **The map's topics replace the categories.** One set of shelves. Add
  `celebrations` for the extras.
- **Family violence and reproductive coercion entries leave no trace** (see
  Private, below).

## One item, typed

Not eight models: one `Item` with a `type`, so there's one read path, one
page route (`/library/<id>`), one search, and the timeline, Planner and This
week keep working off the same list. Type-specific fields are optional and
checked per type.

| Field | Now | Becomes |
|---|---|---|
| `type` | (none) | `moment`, `payment`, `decision`, `can-i`, `symptom`, `guide`, `card`, `term`; existing items are `moment` (or `payment`) |
| `category` | 9 values | `topic`: the map's 23, plus `celebrations` |
| `weeks` | required | optional. No weeks: not on the timeline, not in Right now, never "open" |
| `source` | one | `sources`: a list. Items' single `source` becomes a one-entry list |
| `ask`, `aliases` | none | the question as people ask it, and what they search for |
| `related` | none | ids, checked to exist; drawn as links on the page |
| `who` | none | the audience (`carrying`, `partner`, `together`), distinct from `when` |
| `verdict` | none | can-i only: `yes`, `limit`, `avoid`, `ask` |
| `decide_by` | none | decision only: a week |
| `stakes` | none | `high`, `medium`, `low`; drives ordering and the red-flag treatment |
| `private` | none | see Private |
| `surprise` | boolean | stays for items; a `card` is a surprise by type |

Per-type body checks in `src/content/` (failing the gate like any bad item):
a symptom's `##` headings come from the fixed four levels in
`content/drafts/README.md`, after `## What's usual`; a can-i has `## Why` and
`## What to do`; a decision has its three sections; a card and a term have no
headings and stay short.

## Steps

Each step ends with the gate green (`check`, `test`, `lint`, `e2e`).

**Done 2026-10-29: steps 1 and 2.** What they settled, beyond the text below:

- Three drafts shared an id with an item and were renamed (nothing pointed at
  them yet): `doula` → `doulas`, `telling-people` → `when-to-tell-people`,
  `pets` → `pets-and-health`. All duplicates are listed in
  `content/drafts/REVIEW.md`.
- `related` ids the map had folded into an existing item now name that item;
  the two naming unwritten entries were dropped.
- A can-i must have `## Why`; `## What to do` only when there's anything to
  do (airport scanners has nothing). Six can-i bodies had their answer and
  their why in one paragraph; `## Why` now sits after the first sentence.
- Measured: whole files eagerly were +570 KB gzipped and ~200 ms of parsing
  on desktop. So `src/content/vite.ts` splits each file at build time: one
  virtual module holds every item's index (frontmatter less `sources`,
  `related`, `checked`, plus the `$questions` its body names), +119 KB
  gzipped and ~20 ms to check; each page (`<id>.md?page`) is its own chunk,
  loaded by `loadPage` when it opens. Tests parse every file whole.
- Search is over title, ask, aliases and summary: bodies aren't loaded up
  front. Step 4 decides whether body search earns loading them.
- Until step 5, Right now and This week's "Worth knowing" show only items
  with tasks (`asks()`, the same rule as the Timeline's windows); everything
  else with weeks is in the Library only. 321 items cover week 28 and 101
  start at week 1, so step 5 has to choose what earns a place on a week.

**Done 2026-10-30: step 6.** `private: true` on `domestic-violence-in-pregnancy`,
`reproductive-coercion` and `card-asked-about-safety`. Every way one could
be recorded or shown, and what each does (the rule is in
`docs/architecture.md`, Content):

- **Saving.** None of the three had tasks or an `{% ask %}`, and now none
  can: the content rules refuse a private entry with tasks, a `decide_by`
  (a task), a `when` or an extra (shared answers and switches, and settings
  lists what they change), or an `{% ask %}`. A symptom's "Mention it at your
  next visit" offers no question for one. The server refuses any function's
  input naming one, in function middleware after the gate, so a write path
  added later is covered; the questions are stored as text, so "names" is the
  id anywhere, or the title, question or "About …" as the whole string. Words
  typed by hand are left alone: blocking "family violence" in your own
  question would be the app deciding what you may ask.
  `test/server/private.test.ts` runs all 18 write paths through it and fails
  on a 19th it doesn't list.
- **Offered unasked.** Already kept off This week (step 5). Right now and the
  Timeline show only what asks something of you, which a private entry can't.
  Settings' "What this answer changes" leaves them out (`decides`).
- **Browser history and the address bar.** Every link to an entry is now
  `ItemLink`, which masks a private one's address as `/library` and, from a
  private page, replaces it instead of pushing. One opened by its address is
  masked in place. Search words that find a private entry stay out of `?q=`
  (held on the page; a reload loses them, which is the point).
- **Quick exit.** Sticky at the top of the page, and Esc: to This week,
  replacing the history entry, so Back lands where the reading started (the
  Library, with no search words). Chosen over another site: instant, offline,
  works in the installed app, and looks like nothing.
- **Not a trace, so unchanged.** The service worker fetches every page chunk
  up front, so a private one's presence in the cache says nothing; no server
  function's answer names one; the document title is always "Expecting";
  there is no "recently read" or saved list to keep them out of.
- **Left for the review** (in `content/drafts/REVIEW.md`):
  `previous-trauma-and-pregnancy`, `relationship-breakdown`,
  `arguments-and-stress`, `unplanned-pregnancy` may want `private`.
  `booking-visit`, `partner-learning-the-signs` and
  `fall-or-blow-to-the-belly` mention family violence in passing and are
  meant for both of you; they stay open.

**Done 2026-10-30: step 5.** Decided with Jason:

- **Worth knowing on This week** (and on a peeked week) is what starts that
  week and belongs to it (`worthKnowing` in `src/lib/library.ts`): anything
  that asks something of you, plus entries whose window is 12 weeks or less
  (`ON_A_WEEK`). Longer windows are any time, so they stay in the Library.
  Never a card, a hard topic (loss, mental health, special circumstances) or
  a private entry: those wait to be looked for. High stakes first, then what
  asks something of you, then by title; five shown, then "Show all". Up to 26
  start in one week (36), none in some.
- **A heads-up a week** (`headsUps`): one card, under the week's note.
  Walking the weeks in order, each takes the card covering it that started
  nearest and hasn't been taken, so the same card shows on both phones all
  week and none repeats. Every week but 3 has one with today's cards.
- **A decision becomes a task only with a sourced `decide_by`**:
  `decide-<id>`, "Decide: <title>", from the decision's first week, best by
  `decide_by` (which must sit within its weeks), for whom it's written. No
  decision has one yet: the review pass adds them where a source gives the
  week. Decisions without one stay reading, on their week.
- The drafts with `tasks:` already fed the Planner since step 2; ids are
  checked unique across items and tasks.
- The Timeline is unchanged: its windows are still what asks something of
  you (now including decisions with a `decide_by`), and a week's line opens
  that week on This week, where its reading is.

**Done 2026-10-30: step 4.** The Library's home lists no entries: search,
eight doors (one per type: Can I…?, Is this normal?, Nobody tells you, What
does that mean?, What happens at…?, What do we decide?, What can we claim?,
How do we…?), Right now (first four, then "Show all"), the topics with counts,
and a quiet ninth door, When it's hard (loss, mental health, special
circumstances). A door or topic opens in place by search param (`door`,
`topic`, `verdict`, `for=partner`), narrowed by chips; each door is laid out
for its question (`DOOR_INFO` in `src/lib/library.ts`): rows by topic, by
trimester, symptoms with "Know these first" (stakes high) under a call-now
box, cards, or an A–Z glossary that opens in place. Search ranks matches on
title, ask or aliases above summary-only ones; the body is not searched. An
item's page leads back to its door.

**Done 2026-10-30: step 3.** The item page draws each type
(`ItemCard`, with `Verdict`, `Triage` and `Related`). Settled on the way:

- A symptom shows "When to get help" before "What's usual": someone
  wondering whether to worry sees when first. Each level has its action:
  Call 000; the birth suite's number from Emergency info, or a link to add
  it; the midwife's and GP's numbers when filled in; and "Mention it at your
  next visit" adds the entry's question to the Planner.
- Every phone number in any body (items and week notes) is a `tel:` link
  (`src/lib/phones.ts`: 000, 13 and 1300/1800 numbers).
- The card's title is the page's h1; a body's own `##` headings are styled.
- No decision has a `decide_by` yet, so "Decide by week N" shows nowhere
  until the review pass adds one from a source.

1. **Clean the drafts (mechanical).**
   - Fix the 6 drafts whose frontmatter doesn't parse:
     `partner-mental-health-support`, `card-fundal-height-matches-weeks`,
     `card-placenta-is-a-stage`, `card-partner-pack-snacks`,
     `second-pregnancy-feels-different`, `card-sterile-water`.
   - Map the ~20 off-list symptom headings onto the four levels, keeping
     each sentence's own wording ("See your doctor" → `## See your doctor or
     midwife`; "If you're worried you might hurt yourself or your baby" sits
     as a callout under the right level).
   - Find duplicates of existing items (`braxton-hicks` vs
     `braxton-hicks-contractions`, the drafts the map marked `exists:`) and
     list them in `REVIEW.md` rather than merging.
2. **Schema and loading.** The fields above, in `src/content/schema.ts` and
   `parse.ts`; per-type checks; items move from `category` to `topic`; drafts
   move into `content/items/` (the name is still the id). Make `from`/`to`
   nullable and teach `covers`, `rightNow`, `timelineMap`, the WindowsChart,
   Home, the Planner and ItemCard that a weekless item has no window.
   **Measure the bundle first**: ~900 files parsed eagerly may be slow on a
   phone. If it is, keep frontmatter eager and parse each body when its page
   opens (tests still parse everything).
3. **The item page by type** (`LibraryItemPage` and parts in
   `src/features/library/components/content/`): a verdict badge for can-i; the symptom
   levels drawn as triage, most urgent first, with call buttons for 000 and
   numbers; a decision's options and decide-by; a card as a card; a term as a
   short definition; sources listed with the checked date; related links;
   the draft marker as now.
4. **The Library.** The two doors go live: Can I…? (by topic, verdict on
   each row, filter by verdict) and Is this normal? (red flags first). A
   glossary shelf for terms. Shelves by topic. Search over title, ask,
   aliases, summary and body, with title and alias matches first. Doors use a
   search param (`/library?door=can-i`), not a route, so they can't collide
   with an item id.
5. **The other pillars.** Typed items with weeks appear on their weeks like
   items do. A decision's decide-by is a task in the Planner. This week can
   show one card as a heads-up. The 22 drafts with `tasks:` join the
   Planner; check their ids don't duplicate an item's.
6. **Private.** `private: true` on the family violence and reproductive
   coercion entries (`domestic-violence-in-pregnancy`,
   `reproductive-coercion`, `card-asked-about-safety`, and any the review
   adds). Such an entry can be read and searched, but leaves no trace: no
   "add to questions" from it, no saving it, nothing in any history or
   "recently read" shown to the other parent, and a quick-exit button that
   jumps to a neutral page. A test asserts no write path accepts a private
   item's id.
7. **Docs.** `docs/architecture.md` (Content, the Library row of the
   pillars), `docs/intent.md` (the content types' Built line), and
   `CLAUDE.md` (Content constraint: types, topics, `private`). Retire
   `content/drafts/` once empty.

**Done 2026-10-30: step 7.** `docs/intent.md` (the content types, Every
item, Cards and Decisions), `docs/architecture.md` (the Library row and
Content) and `CLAUDE.md` (the types and topics) say what's built.
`content/drafts/` is gone: its writing guide is `content/README.md`, and the
review list `content/REVIEW.md`. Check records from before keep naming
`content/drafts/<id>.md`; the README says where those files went.

## Not in this plan

The cards deck and fillers (`docs/intent.md`, Cards), inline links from a
term to its glossary entry, and own items of the new types. Each is its own
piece once the types exist.
