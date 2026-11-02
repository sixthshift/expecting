# The Planner

What to do, what to get and what to ask, so nothing sneaks up on you. What
it does and why is [`docs/product/planner.md`](../../../docs/product/planner.md);
this is the map of the code. Beside it, `src/pillars/planner/features/tasks/` (a task's row
and tick, To do now and Coming up on This week) and
`src/pillars/planner/features/appointments/` (an appointment's card and form).

## Words

| Word | Means | Where |
|---|---|---|
| **task** | One thing to do: built in (from an item, tailored by the answers) or your own (a title and a week). `opens`, `due` (best by), perhaps a `deadline`, and `who`. | `Task`, `src/content/schema.ts`; `useTasks` |
| **To do** | The Planner's list of tasks: next up, also now, ahead, missed earlier, done (a `Plan`). **To do now** is next up and also now, the same list This week opens with. | `src/lib/planner/plan.ts`, `src/lib/todo.ts` |
| **stage** | A stretch of what's ahead, ending at a week people mark ("By halfway"): what's ahead reads as a few goals. Its address is the week it ends (`?stage=20`). | `STAGES`, `stagesAhead` |
| **ahead** | Still to come, by the week it next asks of you (opens, else best by, else deadline). On screen "On the horizon". | `Ahead`, `components/toDo/Ahead.tsx` |
| **weeks** | To do as a chart, a bar for each task, at `/planner/weeks`. On screen "Across the weeks". | `src/lib/planner/weeks.ts` (`weeksChart`), `components/weeks/` |
| **list** | What to get, a list for each purpose: built in (`LISTS`: before the birth, freezer meals, the bag) or your own. The bag is It's time's (`isApart`). | `src/lib/lists/builtIn.ts` |
| **line** | One thing on a list: built in (an item's `lines`, tailored like the item) or your own. | `Line`; `src/lib/lists/lines.ts`; `useLines` |
| **mark** | A line's state, set by either of you: arranged, got or not needed, how it was got, a few words. No mark is still to get. | `Mark`, `list_mark` |
| **got** | A line marked got. Each list says it its own way (`words`: "Packed", "Done"). | `wordsFor` |
| **question** | Something to ask at the next appointment. Asked, it folds away. | `src/pillars/planner/features/questions/`; `components/questions/` |
| **appointment** | One-off, with a day and perhaps a time and place. The next is the earliest still ahead, today's included. | `src/lib/appointments.ts` |

`checklist` is only the store's name (`task_tick`, `own_task`,
`useChecklistQuery`): what's ticked, and your own tasks. In the code and on
screen it's To do.

## From the store to the screen

```
useTasks (items, answers, due date, own tasks)  + checklist's ticks
  → planTasks            every task placed: next, now, ahead, earlier, done   lib/planner/plan.ts
  → stagesAhead          what's ahead, by stage                               lib/planner/plan.ts
  → usePlan              the two, as tasks and ticks change                   hooks/usePlan.ts
  → PlannerPageProvider  with what's ticked this visit, and the appointments  contexts/
  → ToDo                 Next up, Also now, Ahead, Missed earlier, Done       components/toDo/
  → TaskLine             one task: its tick, when, whose, why

usePlan → weeksChart (a bar for each task, grouped as To do is) → WeeksChart   components/weeks/

useLines (items' lines that apply, and your own)  + lists (own lists, marks)
  → listsOf              each list summed up      ListsPage, ListsWayIn        lib/lists/summaries.ts
  → ListPageProvider     one list: its summary, just what's left, its lines' tasks
  → Sections → sectionsOf → SectionCard → ListLine → LineRow                  components/lists/
```

## Where things are

```
pages/          PlannerPage (To do, or put aside; the lists, appointments, questions)
contexts/       PlannerPageContext: the plan, its stages, what's ticked this visit, the appointments
hooks/          usePlan (the plan, To do's and the weeks')
model/labels.ts the Planner's words: when a task ahead or missed is due, how To do is going, a bar read out
components/
  PlannerFrame  the weeks', the lists' and a list's column, way back, title and what's put away
  Fold          a titled run of rows, open or folded (Also now, Missed earlier, Done, Been, Asked)
  toDo/         To do: its progress, Next up, Ahead and a stage's card, a task's line
  appointments/ the appointments, next first
  questions/    for the next appointment
  quiet/        To do put aside while something has happened, and what was set in motion
features/
  tasks/        a task's row, whose it is, keeping one, adding your own; useTasks (This week,
                the Library and the "+" draw these too)
  questions/    a question to ask: adding, open, asked, about an entry, waiting
  appointments/ an appointment's card and form, the next one
  lists/        ListsPage, ListPage and ListPageContext; useLines; the way in, a list's card,
                its heading, sections, a line and its sheet, adding
  weeks/        WeeksPage and the weeks chart: its scale, a stage's group, the bars, the key
```

## Adding a stage

1. Add `{ end, title }` to `STAGES` (`src/lib/planner/plan.ts`), in order;
   the last ends at week 42, so every week has one.
2. That's all: `stagesAhead` puts tasks in it, the chart draws its dashed
   line, and `?stage=<end>` opens it (`stageEnding`, `src/routes/search.ts`).
   Check the groups in `test/lib/planner/`.

## Adding a built-in list

1. Add it to `LISTS` (`src/lib/lists/builtIn.ts`): its title, what it's
   for, its sections, the heading over your own lines, and its words for
   each state (`apart` if it's kept somewhere else, as the bag is).
2. Give it and its sections icons (`components/lists/icons.ts`).
3. Put lines on it from the Library: an item's `lines`, each with its list
   and section (`content/README.md`); the schema checks both against `LISTS`.
