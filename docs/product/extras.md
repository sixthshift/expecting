# Extras

The optional parts of Expecting, some thirty of them, from choosing a name
to a babymoon, the baby shower and freezer meals. Off until one of you turns one
on, in onboarding (a few), in settings (all), or when Home offers one
in its week.

How it's built is [`architecture.md`](../architecture.md), Extras. The list
is `src/app/features/settings/model/extras.data.ts`.

## What it holds to

- **Off until turned on.** Unlike a question, which hides nothing until
  answered, an extra adds nothing until someone says yes. Most pregnancies
  have no baby shower or babymoon, and a Planner full of them would bury
  the admin that matters.
- **Fewer offers, not more.** Home offers one undecided extra at a
  time, once, in its week; onboarding offers only a few, so it stays short.
- **Turning one off hides, never deletes.** Turned on again, everything is
  where it was: one rule for every extra.
- **The best extras change the app, not just add reading.** Most bring an
  entry and its two or three tasks, and for many (food and drink, a doula,
  date nights, pets) that's the whole job. The ones worth most bring
  something you *do* ([the Drawer](drawer.md)): the names game, Who does
  what, Pregnancy bingo, A question a week, and a view of
  [Your people](drawer.md#your-people) each for Visitors, Birth
  announcement, Lining up help and Thank-you notes. An extra that brings a
  tool says so wherever it's offered, so they stand out.
- **A private entry is never part of one:** an extra is a shared switch.
- **Quiet puts it all away,** and each tool says what it does while
  something has happened ([quiet.md](quiet.md)).
- **Sends nothing.** No messages, invitations or emails go out from
  Expecting, and friends can't log in: a handover is the share sheet or
  paper, never a public link.

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

More extras that change the app, from the admin (childcare waitlists,
minding cards) to keepsakes, and the maternity shoot's own photo kind:
[`plan-extras.md`](../plan-extras.md).
