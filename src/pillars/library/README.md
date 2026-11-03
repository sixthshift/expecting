# The Library

Everything Expecting knows, opened by the question you came with. What it
does and why is [`docs/product/library.md`](../../../docs/product/library.md);
this is the map of the code.

## Words

| Word | Means | Where |
|---|---|---|
| **entry** | One built-in piece of the Library, `content/items/<id>.md`. The docs say entry, the code says **`Item`** (`Item`, `itemId`, `/library/$itemId`): the routes and the content depend on that name, so it stays. Its words, loaded apart, are its page (`ItemPage`). | `src/content/schema.ts` |
| **door** | A way in by the question you came with (Can I…?, Is this normal?, …): one per type of entry, and `hard`, the quiet one for the topics nobody wants to need. `?door=` on `/library`. | `src/lib/library/doors.ts` |
| **shelf** | A door opened, or a topic on its own: its entries under headings (a door's `group`), narrowed by chips. | `components/shelf/` |
| **topic** | What an entry is about (`TOPICS`): a shelf on its own (`?topic=`), or a chip within a door. | `src/content/schema.ts` |
| **right now** | What asks something of you this week, soonest-closing first, each with where its window stands (`Standing`). | `src/lib/library/rightNow.ts` |
| **read mark** | The quiet tick on an entry you've opened before (`ReadMark`; `item_read`). Never on a private entry. | `components/ReadMark.tsx` |
| **private** | An entry that leaves no trace in the shared space (family violence, reproductive coercion): its address masked by `ItemLink`, a quick exit on its page, never offered unasked. | `components/private/`, `src/lib/library/clues.ts` |

## From the content to the screen

```
content/items/*.md
  → builtInItems              bundled, checked               src/content/
  → useItems()                tailored by your answers, extras   hooks/
  → LibraryFrame              search, a shelf, or the home it's given   components/
  → the home                  doors, right now, topics           pages/LibraryPage
                              (QuietLibraryPage while quiet)    quiet/pages/
  → Shelf                     a door or topic: DOOR_INFO[door].group, chips   components/shelf/
  → ItemList / Rows / Cards   rows linking to each entry (ItemLink)
  → the entry's page          LibraryItemPageProvider: the entry, or why it isn't there
  → Entry → ItemCard          the entry in full, by its type    components/entry/
```

The entry's page works out once, from the id in its address, what it is
(`contexts/LibraryItemPageContext.tsx`): the entry as your Library has it,
one hidden by an answer or an extra that's off, or none; and its words
(`pageOf`), read under a Suspense by `useEntry()`. Its parts read that,
not props.

## Where things are

```
pages/          LibraryPage (LibraryFrame around LibraryHome), LibraryItemPage (an entry)
quiet/          while something has happened: pages/QuietLibraryPage (LibraryFrame
                around components/QuietLibraryHome)
contexts/       LibraryItemPageContext: the entry, why it's hidden, its words
hooks/          useItems (your entries), useSwipe
model/          labels (an entry's weeks), narrowing (a shelf's search params),
                pageOf (an entry's words, loaded once), suggestions (what to ask)
components/
  ReadMark      the read mark, on every list
  itemLink/     every link to an entry (masks a private one); other pillars use it
  itemList/     a list of entries; other pillars use it
  content/      an entry's body: ItemBody, the can-i's Verdict, a symptom's Triage
  home/         HomeColumn, the home's one column, in both worlds
  doors/        the doors on the home, and the quiet door
  rightNow/     right now, at week N
  topics/       browse by topic
  shelf/        a door or topic opened: chips, and its rows, cards or glossary
  lookFor/      what an address that leads nowhere was after
  entry/        the entry's page: Entry, ItemCard and its Body, Part, Sources; the skeleton
  wayBack/      back to the list it came from, or its door
  through/      swipe through the list it was opened from
  askAtAppointment/  ask at my next appointment, and its sheet
  related/      what it links to
  private/      the quick exit, and the address masked
  notInLibrary/ hidden by an answer or extra, or no entry by that id
```

The rules, pure and tested apart, are `src/lib/library/`: `doors.ts`,
`search.ts`, `rightNow.ts`, `thisWeek.ts` (what This week takes: worth
knowing, the heads-up) and `clues.ts` (a private entry named, an address
that leads nowhere). How weeks and dates are said is `src/lib/labels.ts`.

## While something has happened

Quiet is a world of its own: `quiet/` mirrors the pillar's shape. The route
(`src/routes/library.ts`) is the one place that chooses,
`worlds(LibraryPage, QuietLibraryPage)` (`src/app/features/quiet/worlds.tsx`).
Only the home differs, so both pages are `LibraryFrame` (the search and its
results, a door or a topic's shelf) around their home: `LibraryHome`, or
`QuietLibraryHome`, the quiet door first and nothing open right now. An entry
is the same in both worlds, and what both homes draw is shared
(`HomeColumn`, `Doors`, `Topics`, `HardDoor`). Quiet's own rules for the Library would go in
`src/lib/library/quiet.ts`; what quiet is, `src/lib/quiet.ts`.

## Adding a door

1. Add it to `DOORS` in its place on the page, and its `DOOR_INFO`: title,
   examples, lead, what it `holds`, how it's grouped (`group`) and laid out
   (`layout`). A door for a new type of entry goes in `TYPE_DOOR` too.
2. Give it an icon in `components/doors/doorIcons.ts`.

`DOOR_INFO` and `DOOR_ICONS` are records over `Door`, so TypeScript stops until each has it;
`?door=` takes it from `DOORS` (`src/routes/search.ts`).

## Adding a shelf view

A shelf's layout is a door's `layout` (`rows`, `cards`, `glossary`). A new
one is a `DoorLayout`, a component in `components/shelf/` and its branch in
`Shelf`. A new way to narrow is a search param (`librarySearch`,
`src/routes/search.ts`), a field of `Narrowing` (`model/narrowing.ts`) and
its `Chips` in `Shelf`.
