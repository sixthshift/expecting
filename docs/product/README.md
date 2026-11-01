# Product

What each part of Expecting does and why, as it is now: one doc per pillar,
and one for each part outside them (the "+", Emergency info, It's time).

## Which doc says what

- **`intent.md`**: the why and the whole. Who it's for, and the principles
  every part keeps.
- **`product/<part>.md`**: what that part does and why. Who reaches for it and
  when, the decisions and their reasons, the careful parts, what happens
  while something has happened, what it deliberately doesn't do, and the
  first guesses still to judge.
- **`architecture.md`**: how it's built, and where the code is. It points
  here for behaviour and doesn't restate it.
- **`plan-*.md`**: work in flight. When a plan is built, its decisions are
  folded into `product/` (and anything technical into `architecture.md`),
  and the plan is deleted. Git keeps the story.

Each thing is said once. When two docs need it, one says it and the other
links to it.

## Writing one

- **Present tense, as it is.** No steps, dates or "decided on". When it
  changes, change the doc.
- **Every rule carries its reason.** A rule without one gets "improved" away
  by the next session. "No numbers: a 3/5 is a score."
- **Behaviour, not layout.** Say what a part does and why, not where each
  button sits: the code shows that, and it changes every polish pass.
- **Few code names.** A route or a term people search for, not functions.
- **A kind that shows in several pillars lives in the one that keeps it,**
  and the others link to it. Feelings are asked on This week but kept in
  the Journal, so they're in `journal.md`.

## The docs

- [This week](this-week.md)
- [The timeline](timeline.md)
- [The Journal](journal.md)
- [The Planner](planner.md)
- [The Library](library.md)
- [The Drawer](drawer.md)
- [Extras](extras.md)
- [The capture "+"](capture.md)
