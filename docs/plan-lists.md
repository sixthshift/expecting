# Plan: the lists, what to get

The Library knows what you need: the car seat, the pram, a cot or bassinet,
nappies and clothes (`what-you-need-for-the-baby`). But it's spread across
entries, each written as prose, and there's nowhere to see everything you
still have to get, or to tick it off together in a shop.

Talked through with Jason on 2026-10-31 and 2026-11-01:

- **It's the Planner's, not a seventh pillar.** Getting things is doing
  things, and the Planner already holds what to do and when. The tab bar
  stays at six.
- **One list per job, not one big list and not a list per topic.** You use a
  list in one place at one moment: a baby shop, the supermarket, writing
  down what to ask Mum to bring. Topics (sleep, feeding, clothes) are
  sections inside a list.
- **More states than got and not got** (below).
- **No designated person.** A shopping list doesn't belong to one of you.
  What "whose" was for, not both buying the pram, is covered by the states
  and by who set them: "Arranged · Sam".
- **Only a line with a task shows a when.** The rest stay quiet.
- **Feeding is a new question**, so the formula lines show only to those
  they're for.
- **The hospital bag isn't here.** It goes to *It's time*
  (`docs/plan-its-time.md`), which owns the bag, its lines, its "last thing"
  state and moving it out of the Drawer.

## The lists

| List | What it's for | Its lines |
|---|---|---|
| **Before the birth** | Everything to have ready, for the baby and for you: the unified view. | `car-seat`, `pram`, `bassinet`, `cot-and-safe-sleep-standards`, `portable-cot`, `what-you-need-for-the-baby`, `tens-machine`, and `sleeping-well` with its extra, in sections from Sleep to For you (maternity pads, breast pads, a pregnancy pillow); the bottles and formula by the `feeding` answer. |
| **Freezer meals** | Cooking ahead, and the shopping for it. | `freezer-meals`, so only while that extra is on: the pantry and what to freeze them in. Your own lines are the meals, under *Meals to make*. |
| **Your own** | Anything else: "Bunnings run", "Ask Mum to bring". | Yours: name one, add lines, delete it when it's done. |

The lists Expecting knows are a short typed list, `LISTS` in
`src/lib/lists.ts`: an id, a title, a sentence on what it's for, its
sections in order, and its words for the states. A built-in list shows
while it has a line that applies to you, or a line of your own.

## The shape

`/planner/lists` is every list, with what's left on each. A list is
`/planner/lists/<id>`: a built-in list by its id (`baby`), your own by its
UUID.

```
Before the birth                             ‹ Lists
Everything to have before the birth. 9 to get.
─────────────────────────────────────────────
Sleep
 ☑ Cot that meets AS/NZS 2172          borrowed · Sam
 ◐ Firm mattress that fits the cot      arranged · you
Out and about
 ☐ Car seat                       by week 36 · in To do
 ☐ Pram
Changing
 ☐ Nappies                    "newborn size, 2 packs"
 …
 ┌──────────────────────────────┐
 │ Add something…               │ [ Add ]
 └──────────────────────────────┘
Not needed (2)                                     ›
```

- **The lines come from the Library.** An entry declares its lines in
  frontmatter, the way it declares `tasks:`. Each links back to its entry
  for the why (standards, second hand, how many).
- **Your own lines** can be added to any list by either of you, for the
  things Expecting couldn't know. An own line can be changed or deleted.
  A built-in line can't be deleted, but it can be *not needed*.
- **A line has a state,** set by either of you, and shows who set it last:

  | State | Before the birth | Freezer meals | Your own |
  |---|---|---|---|
  | (no mark) | To get | To make | To get |
  | `arranged` | Arranged: ordered, promised, someone's lending it | Someone's bringing it | Arranged |
  | `got` | Got | In the freezer | Got |
  | `not-needed` | Not needed: folded at the foot, and can be brought back | Not needed | Not needed |

  Once got, a line can also say *how* (bought, borrowed, second hand,
  given, or hired: a Kidsafe capsule, a TENS machine), and any line can hold a few words ("newborn size, 2 packs",
  "Mum's lending hers"). Tapping a line moves it to got, or back; the
  other states, how and the words are in a sheet. What's left counts *to
  get* and *arranged*.
- **Shared, and saved through the outbox,** so it works in a shop with no
  signal.
- **Tailored like everything else.** A line shows only while its entry
  does (its `when` and its `extra`), and a line may have its own `when`,
  for the feeding lines.
- **No prices, brands, shops or links to buy.** It isn't a budget and it
  isn't a registry.
- **Quiet puts it away.** While something has happened, the lists are put
  away, not deleted, as To do and the Drawer are.

### Lines and tasks

A line and its task are ticked separately: the tasks bundle more than the
getting (`buy-and-fit-car-seat`, `choose-cot-and-mattress`), and task ids
can't be renamed. A line can name its entry's task (`task:
buy-and-fit-car-seat`), and shows its when ("by week 36 · in To do").

### The feeding question

In `src/features/settings/model/facts.data.ts`, asked on This week at week
24 (when `what-you-need-for-the-baby` opens), in *After the birth*:

```ts
  // What to get: bottles, a steriliser and formula only if you'll use them.
  {
    id: "feeding",
    group: "after",
    ask: "How are you thinking of feeding the baby?",
    week: 24,
    answers: { breast: "Breastfeeding", formula: "Formula", both: "Some of each", unsure: "Not sure yet" },
  },
```

It's only about what to get, and never steers the choice. Unanswered and
`unsure` hide nothing, so the formula lines show until you say
breastfeeding.

### Where the lines are written

```yaml
# content/items/car-seat.md
lines:
  - id: get-car-seat
    title: Rear-facing car seat that meets AS/NZS 1754
    list: baby
    section: out-and-about
    task: buy-and-fit-car-seat
```

- Ids are stable slugs, unique across items, tasks and lines, and never
  renamed: the marks point at them.
- `list` is one of `LISTS`; `section` is one of that list's.
- `when`, written as an item's, narrows a line further.
- `task` is a task on the same entry.
- No lines on a `private` entry: a line is shared.
- In the eager index: the list page needs every line without each entry's
  page.
- A line restates its entry and adds nothing new: the entry was checked
  against its sources, the line wasn't.

## Steps

Each step ends with the gate green (`check`, `test`, `lint`, `e2e`).

1. **The content field and the question.** *Done 2026-11-01.* The `feeding` question;
   `lines:` in `src/content/schema.ts` with the checks above; the lines
   collected in the index; `LISTS` and the rules in `src/lib/lists.ts`
   (the lines that apply, by section, what's left). Tests.
2. **The store.** *Done 2026-11-01.* Migration `026_lists.sql` (025 is taken on main by the
   names superlike, not yet committed): `own_list` (`id`, `title`, `by`,
   `created_at`), `own_line` (`id`, `list_id`, a built-in list's id or an
   own list's, `title`, `section`, `by`, `created_at`) and `list_mark`
   (`line_id`, a built-in line's id or an own line's, no foreign key, as
   `task_tick`; `state`, `how`, `note`, `by`, `updated_at`; a null state
   is a line still to get with only words on it). Deleting an own
   list deletes its lines and marks; an own line, its mark.
   `src/db/models/lists/`, `src/api/rpc/lists.ts` with its saves. Tests.
3. **The pages.** *Done 2026-11-01.* `/planner/lists` and `/planner/lists/$listId`, in
   `src/features/lists/`. Dom tests; an e2e that adds, ticks and reloads.
4. **Into the Planner.** *Done 2026-11-01.* The way in on the Planner, and quiet putting the
   lists away.
5. **The content.** *Done 2026-11-01.* The lines on the entries above, from
   what each says: 27 before the birth, 7 for the freezer meals. Reviewed
   by Claude on 2026-11-01 against each entry's body (below).
6. **Docs and memory.** *Done 2026-11-01.* `docs/architecture.md`, `docs/intent.md`,
   `content/README.md`, CLAUDE.md's domains.

## Progress

- 2026-10-31: first plan, with the bag; questions settled.
- 2026-11-01: rewritten: one list per job, own lists, the bag to It's
  time. Built on `feat/lists`, steps 1–6. Decided on the way: no
  *Nursery* section (the nursery entry only restates the cot, whose lines
  are everyone's), a *For you* section instead; a mark may hold words with
  no state, for a line still to get ("newborn size, 2 packs"); each list
  names the heading over your own lines (*Also*, *Meals to make*).
  `docs/plan-its-time.md` still points here for the bag and its *last
  thing* state: it owns them now.
- 2026-11-01: the lines reviewed by Claude, each against its entry's body.
  For the baby became *Before the birth* (it holds what's for you too);
  *hired* joined how a line was got (Kidsafe capsules, TENS); added the
  pregnancy pillow (`sleeping-well`, its task), a TENS machine and a chest
  freezer; the pram, portable cot and toiletries reworded. Left out on
  purpose: wipes and a nappy bin (no entry names them), dummies (an entry
  names them only in passing, and whether to use one is its own question),
  the hospital bag's things (It's time), and two of everything for twins
  (a few words cover it until a `babies` line rule is worth it).

- 2026-11-01: the look refined (`feat/lists-look`), as it read bland: each
  list a card with its icon, a bar and what's next; a list's page with
  where it's up to, "Just what's left" for the shop, its sections as cards
  with an icon and a count, flowing down two columns on a desktop; what's
  got sinks within its section (not while you're ticking); arranged, how
  and a task's when as badges, the when warning two weeks out.

## Not in this plan

- **The hospital bag:** *It's time*.
- **A gift registry** for the baby-shower extra: with *Your people*
  (`docs/plan-extras.md`).
- **Quantities and sizes** as fields: the few words cover them.
- **Lists after the birth:** with the weeks after the birth.
