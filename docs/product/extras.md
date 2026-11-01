# Extras

The optional parts of Expecting: thirty of them, from choosing a name to a
babymoon, the baby shower and freezer meals. Off until one of you turns one
on, in onboarding (a few), in settings (all), or when This week offers one
in its week.

How it's built is [`architecture.md`](../architecture.md), Extras. The list
is `src/features/settings/model/extras.data.ts`.

## What it holds to

- **Off until turned on.** Unlike a question, which hides nothing until
  answered, an extra adds nothing until someone says yes. Most pregnancies
  have no baby shower or babymoon, and a Planner full of them would bury
  the admin that matters.
- **Fewer offers, not more.** This week offers one undecided extra at a
  time, once, in its week; onboarding offers only a few, so it stays
  short.
- **Turning one off hides, never deletes.** Turned on again, everything is
  where it was: one rule for every extra.
- **The best extras change the app, not just add reading.** Most bring an
  entry and its two or three tasks, and for many (food and drink, a doula,
  date nights, pets) that's the whole job. The ones worth most bring
  something you *do*: Choosing a name brings the names game, Who does what its own tool, and Visitors,
  Birth announcement, Lining up help and Thank-you notes each bring a view
  of [Your people](drawer.md#your-people). An extra that brings a tool says
  so wherever it's offered, so they stand out.
- **A private entry is never part of one:** an extra is a shared switch.

## A task that ends by keeping something

An extra's entry often tells you to keep something (a letter to the baby,
the shoot's photos, telling the family), and Expecting has the place to
keep it. A task can name what it keeps: a letter, a photo, a first, or a
view of your people. The task offers the way there ("Write it", "Open the
list"); keeping from it ticks the task. Ticking still works without it:
keeping is offered, never required. Any task can do this, not only an
extra's: setting up the cot keeps "The cot is up", packing the bag "The
bag is packed".

- **Gender reveal's** reveal keeps "Found out boy or girl", and marking it
  asks whether Expecting should use it: some know and keep it out of the
  app.
- **The baby's doctor** stays reading. Emergency info is hers, and the
  baby's numbers wait for the weeks after the birth.
- **Lining up help and Meal train are one extra,** the meal train its
  second view.

## Not yet

New extras built like the names game (each of you plays on your own phone,
something is revealed when you both have), extras for the admin (childcare
waitlists, minding cards) and the rest are
[`plan-extras.md`](../plan-extras.md), still in flight; so are the
maternity shoot's photo kind and Emergency info as a place a task keeps.
