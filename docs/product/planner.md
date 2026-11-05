# The Planner

What to do, what to get, and what to ask: the admin, run for you. Up next
(`/planner`), the lists of what to get (`/planner/lists`), the appointments
(`/planner/appointments`), and the questions for the next one
(`/planner/questions`): four places, a phone's tabs under the Planner's
name and a desktop's rail, each its own address. This is where Expecting is directive: about bookings,
claims and purchases, never about her body.

How it's built is [`architecture.md`](../architecture.md), Planner. Tasks themselves (windows, whose, urgency) are in
[`intent.md`](../intent.md#to-do), and how they're written is
[`content/README.md`](../../content/README.md).

## Why you open it

1. **"What do we do next?"** There's always somewhere to start: one thing
   first, with when, whose and why.
2. **"What's coming?"** The admin ahead, without reading every week; and
   when you want the whole run of it, [across the weeks](#across-the-weeks).
3. **"What do we still need?"** In a baby shop, the supermarket, or
   writing down what to ask Mum to bring.
4. **"When's the next appointment?"** The day, the time, where, and what to
   bring, without digging through texts from the clinic.
5. **"What did we want to ask?"** In the waiting room, or straight after,
   writing down what they said.

## What it holds to

- **There's always somewhere to start.** Next up is one task, the top of
  To do now, with when, whose and why. A list of forty open tasks is where
  admin goes to die.
- **The same order everywhere.** Next up and Also now are To do now, in the
  order Home opens with: a deadline coming up or just missed, then
  what slipped in the last four weeks, then what's best done in the next
  two. A tick anywhere is a tick everywhere.
- **Nothing jumps.** A task ticked during a visit stays where it was,
  struck through, until the next visit, so a tick never moves the row you
  just touched. Next up is the exception: ticking it is how you get to the
  next one.
- **Ahead reads as a few goals, not a list.** What's still to come is
  grouped by the week it next asks something of you (when it opens, else
  its best-by, else its deadline) into stages ending at weeks people mark:
  before the first trimester ends, by halfway, before the third trimester,
  by 32 weeks, by full term, before the birth. Folded away, with what
  slipped long ago and what's done.
- **With no due date there's no now:** everything open, by its best-by
  week, To do as it was.
- **Up next:** the same plan as one running order, a week
  at a time from this one: each week's appointments, then its tasks (this
  week's are To do now, next up first; a later week's are what next asks
  of you then). The next appointment carries the questions for it, there
  to tick off in the waiting room. A later week with nothing in it is left
  out; four weeks, then Across the weeks. The lists have no dates, so
  they're beside it, not on it: To get, each list with what's left and
  got as a bar, and On the horizon under it. Missed, done, the
  appointments been and a task of your own close it. That's a desktop's;
  a phone has Up next alone in its first tab, the horizon under it, and the
  next appointment says how many questions wait for it, the way to them
  in the Questions tab.
- **Whose:** each phone knows who's holding it, so a task says "Yours" or
  "Sam's". Own tasks have no owner yet.

## To do

Every built-in task the answers and extras make yours, plus your own
tasks (a title and a week). A task that keeps something (a letter, a photo,
a first, a list of your people) offers the way to keep it, and keeping it
ticks the task.

## Across the weeks

To do drawn as a chart, at `/planner/weeks`, for when you want the whole
run of it at once: what overlaps, how long a window has left, what's
bunching up.

- **The same plan as To do, drawn another way.** The same groups in the
  same order: To do now, then a group per stage ahead, each ending at a
  week people mark, then what's earlier and done, folded. The stages' ends
  are dashed lines across the chart, so a stage card is visibly a slice of
  it.
- **A task a row,** not an entry a row: the Planner thinks in things to
  do. Each is a bar from the week it opens to the week it closes (its
  deadline, else where its entry's weeks end, never before its best-by
  week), with a notch at its best-by week; coloured open now, ahead, past
  its best-by week, or done. A row goes to its entry, for the why.
- **Reached from To do, not a tab of its own:** "Across the weeks" beside
  Ahead's heading opens it at the top, and each stage card's "On the chart"
  opens it at that stage (`?stage=37`), shaded. Each card carries a thin
  bar of the pregnancy with its stage's weeks tinted, so the card and the
  chart speak the same language.
- **For looking, not ticking.** Ticking is To do's, where nothing jumps.
- **Desktop:** the titles in a column beside the bars. **Phone:** the
  chart the width of the screen, each title over its bar, starting where
  the bar does (or ending where it does, late in the pregnancy).

## The lists: what to get

The Library knows what you need (the car seat, the pram, a cot, nappies),
but as prose spread across entries. The lists are where you see what's
still to get and tick it off together in a shop.

- **The Planner's, not a pillar of its own.** Getting things is doing
  things, and the Planner already holds what to do and when.
- **One list per job,** not one big list and not a list per topic: you use
  a list in one place at one moment. Topics (sleep, feeding, out and about,
  for you) are sections inside it.
  - **Before the birth:** everything to have ready, for the baby and for
    you.
  - **Freezer meals:** cooking ahead and its shopping, while that extra is
    on. Your own lines are the meals.
  - **Your own:** "Bunnings run", "Ask Mum to bring". Name one, add lines,
    delete it when it's done.
- **The lines come from the Library,** each restating its entry and
  linking back for the why (standards, second hand, how many). Tailored
  like everything else: a line shows only while its entry does, and the
  bottles and formula only unless you've said breastfeeding. The feeding
  question is only about what to get, and never steers the choice.
- **Your own lines** go on any list, for what Expecting couldn't know. A
  built-in line can't be deleted, but it can be not needed: folded at the
  foot, and brought back.
- **More states than got and not got:** to get, arranged (ordered,
  promised, someone's lending it), got, and not needed, in each list's own
  words (the freezer's "In the freezer"). Once got, how (bought, borrowed,
  second hand, given, hired: a Kidsafe capsule, a TENS machine), and any
  line can hold a few words ("newborn size, 2 packs"). A tap moves a line
  to got and back; the rest is in a sheet. What's left counts to get and
  arranged.
- **No one's job.** A shopping list doesn't belong to one of you. What an
  owner would be for, not both buying the pram, is covered by arranged and
  by who set it: "Arranged · Sam".
- **A line and its task are ticked apart.** A task bundles more than the
  getting ("Buy and fit the car seat"), so getting the seat doesn't tick
  it. Only a line with a task shows a when ("by week 36 · in To do"); the
  rest stay quiet.
- **In a shop:** "Just what's left", and it saves with no signal.
- **No prices, brands, shops or links to buy.** It isn't a budget and it
  isn't a registry.
- **The hospital bag isn't here.** It's [It's time](its-time.md)'s, with
  its last things.

## Appointments

What's booked, kept where both of you can see it. One-off: an appointment
is what it is ("Midwife", "20-week scan"), its day, and its time, place and
notes if you have them. Added from the "+" or here; either of you can
change one or delete it (a delete can be undone).

- **The next one is given room,** with how soon once it's within a
  fortnight ("Tomorrow"), then the rest still ahead, earliest first. Those
  gone fold away under Been, latest first.
- **"The next appointment" is the earliest still ahead,** today's included
  until the day is over, so its questions are there in the waiting room.
  The questions below are for it, and say so ("Midwife, Fri 6 Nov");
  without one booked they're for whichever comes next.
- **On its week.** Home shows the next one once it's within a
  fortnight, with the questions waiting; a peek at another week shows that
  week's; the map counts them. Its week is worked out from the due date, so
  a moved due date moves its week, never its day.
- **Add to calendar,** on each one still ahead: the phone's own calendar
  does the reminders, and fits it among the rest of the week. An iPhone
  shows the event with Add to Calendar; a computer downloads the file for
  its calendar app. Without a time it's all day; with one, an hour, as
  nothing says how long. Changed later, add it again: a calendar that
  knows it updates it, one that doesn't keeps both.
- **Nothing repeats, and Expecting doesn't remind.** No recurring
  appointments and no notifications: the calendar does those.
- **Kept while something has happened,** like the questions: there are
  often more appointments, not fewer.

## Questions for the next appointment

The midwife has ten minutes, and the question you had on Tuesday is gone
by Thursday. The list is a running one: add a question, mark it asked with
what they said, ask it again.

- **The Library answers Expecting's questions; the list is for yours.** It
  holds what only your midwife or doctor can answer: your case, your
  results, your medication. A general question the Library answers doesn't
  belong on it, so the Planner never suggests anything.
- **Every Library entry can send one,** "Ask at my next appointment", in
  your own words, while you're reading it: you read about low iron and
  wonder whether yours is. Some entries suggest a question or two where
  your own case matters ("Can you check my iron on my next bloods?"), and
  an entry that says "ask first" offers its own question. Never on a
  private entry: a saved question would be a trace.
- **It remembers where it came from and whose it is:** "from *Anaemia and
  low iron* · Sam's", linking back. Once asked, the entry shows what you
  were told: "You asked on 3 Nov: ferritin 18, start tablets."
- **Discreet entries** (mental health, drugs, smoking) don't name
  themselves on the shared list: "from *Antidepressants*" would tell the
  partner what the question's wording was careful not to.
- **The same question can't go on twice,** even from two entries.

How the suggested questions are written is in
[`content/README.md`](../../content/README.md), Questions for the
appointment.

## While something has happened

To do is put aside, not deleted, and the lists are put away. The Planner
lists instead what was already set in motion (the ticked tasks): claims
that may still apply, and bookings you might cancel. The appointments and
the questions stay: there are often more appointments, not fewer.
Everything comes back as it was.

## Not doing

- **Prices, brands, shops, a budget or a registry.**
- **Quantities and sizes as fields:** a few words cover them.
- **Suggesting questions in the Planner,** or general ones anywhere.
- **Questions about cost** ("Is it covered?"): the appointment is about
  her care, and the Library answers money.

## Not yet

- **More to an appointment:** a question aimed at a particular one, the
  Journal's summary since the last one ("sickness on 5 days, easing"), a
  waiting-room mode on the day (your questions, then a few cards while you
  wait), and repeating ones.
- **Decisions you've made:** who decides, what you chose and why. Today a
  decision is a Library entry whose decide-by becomes a task.
- **Own tasks with a window or an owner,** and most built-in tasks'
  windows, which is content work.
- **A gift registry** for the baby shower, with Your people.
- **Lists after the birth,** with the weeks after the birth.
- **Asking about a highlighted sentence,** or "The Library has this" as you
  type a question.
- **Two of everything for twins:** a few words cover it for now.

## Open

- An ask-first entry's own question is offered even when it's general
  ("How do I know if a medicine is safe?").
