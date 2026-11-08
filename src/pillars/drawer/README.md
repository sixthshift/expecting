# The Drawer

The handy things: tools you use together, each brought by an extra. What it
does and why is [`docs/product/drawer.md`](../../../docs/product/drawer.md);
this is the map of the code.

## Words

| Word | Means | Where |
|---|---|---|
| **tool** | Something the two of you do together and come back to: the names game, Who does what, Your people, bingo. A page of its own under `/drawer`. | a feature each (below) |
| **extra** | An optional part of Expecting you turn on in settings. A tool is on while its extra is (Your people: while any of its four is). | `src/app/features/settings/model/extras.data.ts` |
| **put away** | While something has happened (quiet), every tool is put away, not deleted: the Drawer and each tool's page say so in place of it. Each route's quiet world is `putAway({ … })`, the page's top as it is (`worlds`, `putAway`). | `PutAwayPage`, `src/app/features/quiet/` |
| **the other one** | The other of you two, as this phone's person sees them (`otherOf`, `otherName`); "The other one" (`OTHER_ONE`) before they've joined. | `src/lib/people.ts` |

## The routes, and who owns each

| Route | Page | Feature |
|---|---|---|
| `/drawer` | `DrawerPage`: a tile for each tool that's on, a note for each that's off | `drawer/` |
| `/drawer/names` (`?names=`) | `NamesPage`, the names game | `src/pillars/drawer/features/names/` |
| `/drawer/jobs` | `JobsPage`, Who does what | `src/pillars/drawer/features/jobs/` |
| `/drawer/people` (`?view=`) | `CirclePage`, Your people (`circle` in code) | `src/pillars/drawer/features/circle/` |
| `/drawer/bingo` (`?card=`) | `BingoPage`, Pregnancy bingo | `src/pillars/drawer/features/bingo/` |

Each route is a file in its feature's `routes/` (`features/names/routes/names.ts`,
…), named for its path, and added by `drawerRoutes` (`routes/index.ts`). The rules of each tool are `src/lib/<tool>.ts` (`names`, `nameDeck`,
`jobs`, `circle`, `bingo`); each tool's own line on its tile is its
`components/summary/` (`NamesSummary`, …).

## Where things are

```
pages/        DrawerPage: a tile per tool, from TOOLS
model/        tools.ts: TOOLS, each tool said once (where, name, lead, width, extras, what's put
              away, what it says while off), and toolPutAway, its route's quiet world
routes/       drawer (/drawer, a path only) and drawerIndex; index.ts, drawerRoutes, adds
              each tool's (features/<tool>/routes/)
components/
  tool/       DrawerTool: every tool's page, a PillarLayout back to the Drawer with
              the tool's name, and the extra-off state; the tools import it
  tools/      ToolTile (a tool that's on) and ToolOff (one that's off)
  ComesWith   "It comes with …. Turn it on in settings", for DrawerTool and ToolOff
features/     a feature per tool, each with its page, its parts and its summary line:
  names/      the names game and the shortlist (/drawer/names)
  jobs/       Who does what (/drawer/jobs)
  circle/     Your people (/drawer/people)
  bingo/      pregnancy bingo (/drawer/bingo)
```

## Adding a tool

1. An extra that brings it, in `src/app/features/settings/model/extras.data.ts`,
   with its `tool` line.
2. Its entry in `TOOLS` (`model/tools.ts`).
3. Its feature, `src/pillars/drawer/features/<tool>/`, and a route file in its `routes/`
   (`<tool>.ts`, `path: "<tool>"` under `drawer`, its quiet world
   `putAway(toolPutAway(TOOLS.<tool>))`), added to `drawerRoutes` in `routes/index.ts`.
4. Its page inside `<DrawerTool tool={TOOLS.<tool>}>`: it says when it's off,
   and draws the tool only when it's on.
5. Its icon and summary in `TILES` on `DrawerPage`: a `ToolTile` with the
   summary while its extra is on, a `ToolOff` while it isn't.
