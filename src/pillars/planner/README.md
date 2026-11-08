# The Planner

What to do, what to get and what to ask, so nothing sneaks up on you. What
it does and why is [`docs/product/planner.md`](../../../docs/product/planner.md);
this is the map of the code. Beside it, `src/pillars/planner/features/tasks/` (a task's row
and tick, To do now and Coming up on Home) and
`src/pillars/planner/features/appointments/` (an appointment's card and form).

## Words

| Word | Means | Where |
|---|---|---|
| **task** | One thing to do: built in (from an item, tailored by the answers) or your own (a title and a week). `opens`, `due` (best by), perhaps a `deadline`, and `who`. | `Task`, `src/content/schema.ts`; `useTasks` |
| **To do** | The Planner's list of tasks: next up, also now, ahead, missed earlier, done (a `Plan`). **To do now** is next up and also now, the same list Home opens with. | `src/lib/planner/plan.ts`, `src/lib/planner/todo.ts` |
| **stage** | A stretch of what's ahead, ending at a week people mark ("By halfway"): what's ahead reads as a few goals. Its address is the week it ends (`?stage=20`). | `STAGES`, `stagesAhead` |
| **ahead** | Still to come, by the week it next asks of you (opens, else best by, else deadline). On screen "On the horizon". | `Ahead`, `components/toDo/Ahead.tsx` |
| **weeks** | To do as a chart, a bar for each task, at `/planner/weeks`. On screen "Across the weeks". | `src/lib/planner/weeks.ts` (`weeksChart`), `features/weeks/` |
| **list** | What to get, a list for each purpose: built in (`LISTS`: before the birth, freezer meals, the bag) or your own. The bag is It's time's (`isApart`). | `src/lib/planner/lists/builtIn.ts` |
| **line** | One thing on a list: built in (an item's `lines`, tailored like the item) or your own. | `Line`; `src/lib/planner/lists/lines.ts`; `useLines` |
| **mark** | A line's state, set by either of you: arranged, got or not needed, how it was got, a few words. No mark is still to get. | `Mark`, `list_mark` |
| **got** | A line marked got. Each list says it its own way (`words`: "Packed", "Done"). | `wordsFor` |
| **question** | Something to ask at the next appointment. Asked, it folds away. | `src/pillars/planner/features/questions/`; `components/questions/` |
| **appointment** | One-off, with a day and perhaps a time and place. The next is the earliest still ahead, today's included. | `src/lib/planner/appointments.ts` |

`checklist` is only the store's name (`task_tick`, `own_task`,
`useChecklistQuery`): what's ticked, and your own tasks. In the code and on
screen it's To do.

## From the store to the screen

```
useTasks (items, answers, due date, own tasks)  + checklist's ticks
  → planTasks            every task placed: next, now, ahead, earlier, done   lib/planner/plan.ts
  → stagesAhead          what's ahead, by stage                               lib/planner/plan.ts
  → usePlan              the two, as tasks and ticks change                   hooks/usePlan.ts
  → PlannerPageProvider  with what's ticked this visit                        contexts/
  → ToDo                 Next up, Also now, Ahead, Missed earlier, Done       components/toDo/
  → TaskLine             one task: its tick, when, whose, why

usePlan → weeksChart (a bar for each task, grouped as To do is) → WeeksChart   features/weeks/

useLines (items' lines that apply, and your own)  + lists (own lists, marks)
  → useListSummaries     each list summed up (listsOf)   ListsPage, ListsWayIn, ToGet, PlannerRail
  → ListPageProvider     one list: its summary, just what's left, its lines' tasks
  → Sections → sectionsOf → SectionCard → ListLine → LineRow                  features/lists/
```

## Where things are

```
pages/          PlannerPage (/planner: Up next, in PlannerPageProvider; PlannerMobile or
                PlannerDesktop), AppointmentsPage, QuestionsPage
routes/         planner (/planner, a path only), plannerIndex, appointments, questions; index.ts,
                plannerRoutes, adds the lists' (features/lists/routes/) and the chart's
                (features/weeks/routes/)
contexts/       PlannerPageContext: the plan, its stages, what's ticked this visit
hooks/          usePlan (the plan, To do's and the weeks'); useAppointmentsAhead (those ahead, the next and
                the rest, for both worlds)
model/labels.ts the Planner's words: when a task ahead or missed is due, how To do is going, a bar read out
components/
  Fold          a titled run of rows, open or folded (Also now, Missed earlier, Done, Been, Asked)
  AddOne        something of your own in one line: a task, a line on a list, a list
  PlannerTabs   the four places as tabs in the bar on a phone: Up next, Lists, Appointments, Questions
  upNext/       UpNext: appointments and tasks a week at a time (`upNext` in lib/planner/upNext.ts),
                the next appointment with its questions (on a phone, how many, to their tab)
  toDo/         To do: its progress, Next up, Ahead and a stage's card, a task's line, Missed and Done
  appointments/ the appointments, next first, and Been, those gone
  questions/    QuestionsSection, each appointment's questions; NextQuestions, under the next in Up next
quiet/          the Planner while something has happened (below)
mobile/         PlannerMobile: Up next and the horizon under it, the first of the tabs
desktop/        PlannerRail: Up next, Appointments, Questions, Across the weeks, the lists, down
                the left of each page on a desktop (not the quiet one: its chart and lists are
                put away); PlannerDesktop, the page there: UpNext beside ToGet (the lists) and
                Ahead
features/
  tasks/        a task's row, whose it is, keeping one, adding your own; useTasks (Home,
                the Library and the "+" draw these too)
  questions/    a question to ask: adding, open, asked, about an entry, waiting
  appointments/ an appointment's card and form, the next one; useAdding, the form opened in place
  lists/        ListsPage, ListPage and ListPageContext; useLines, useListSummaries; the way in, a list's card,
                its heading, sections, a line and its sheet, adding
  weeks/        WeeksPage and the weeks chart: its scale, a stage's group, the bars, the key
```

## While something has happened

The quiet Planner is a world of its own, in `quiet/`, in the same shape as
the pillar. The route (`routes/plannerIndex.ts`) is the one place that
chooses, `worlds(PlannerPage, QuietPlannerPage)` (and `appointments.ts` and
`questions.ts` likewise: the quiet Planner keeps both on its one page)
(`src/app/features/quiet/worlds.tsx`); each page takes its provider inside
itself (`PlannerPageProvider`, `QuietPlannerPageProvider`). Nothing in the
normal world checks quiet. The weeks and the lists are put away: their
routes' quiet world is `putAway({ … })`, their top as it is and
`PutAwayNotice` in place of the page. What it
is and why is [`docs/product/quiet.md`](../../../docs/product/quiet.md).

```
quiet/
  pages/QuietPlannerPage   the quiet lead, To do put aside, the appointments, the questions; no lists
  contexts/                QuietPlannerPageContext: what has happened, and what was set in motion
  components/
    PutAside               To do put aside: claims you've started, what's already booked or done
    InMotion               one of those: a heading, a line, each task to its item
```

Its rule is `setInMotion` (`src/lib/planner/quiet.ts`): the ticked tasks,
claims apart from bookings. `Appointments` and `QuestionsSection` are drawn
by both worlds, so they read neither context: `useAppointmentsAhead`.

## Adding a stage

1. Add `{ end, title }` to `STAGES` (`src/lib/planner/plan.ts`), in order;
   the last ends at week 42, so every week has one.
2. That's all: `stagesAhead` puts tasks in it, the chart draws its dashed
   line, and `?stage=<end>` opens it (`stageEnding`, `features/weeks/routes/weeks.ts`).
   Check the groups in `test/lib/planner/`.

## Adding a built-in list

1. Add it to `LISTS` (`src/lib/planner/lists/builtIn.ts`): its title, what it's
   for, its sections, the heading over your own lines, and its words for
   each state (`apart` if it's kept somewhere else, as the bag is).
2. Give it and its sections icons (`features/lists/components/icons.ts`).
3. Put lines on it from the Library: an item's `lines`, each with its list
   and section (`content/README.md`); the schema checks both against `LISTS`.
