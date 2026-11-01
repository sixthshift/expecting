# Intent

Why Expecting exists, who it's for, and the principles every part of it
keeps. Vision, not spec: what each part does now, and why, is
[`product/`](product/README.md); how it's built is
[architecture.md](architecture.md). When this file and the code disagree,
the code is right and this is stale.

## What it is

A pregnancy companion for one couple, expecting in Australia. Self-hosted.
Not a product.

It covers the pregnancy, weeks 1 to 42. That is the first version: getting
ready before a pregnancy and the fourth trimester after the birth (the
first three months) come later, and it may grow into newborn and parenting
after that. Nothing is built for them now, but nothing should prevent them.

**It runs the admin.** Having a baby in Australia comes with a long tail of
bookings, claims, forms and purchases, each with its own window and lead
time, split between two people and spread over a year. Expecting holds that
list so you don't have to. From what it knows about you, it says what to do
this week, what to start preparing for, and why, and it keeps track of
what's done. You shouldn't need to know how the system works to get
through it.

- **It tells, it doesn't just inform.** "Claim Parental Leave Pay this
  week", not an article about Parental Leave Pay. The reading is one tap
  behind the instruction.
- **Only about the admin.** It is directive about bookings, paperwork,
  purchases and plans; about her body it explains and points to the
  midwife ([Not medical advice](#not-medical-advice)).
- **It has to be complete to be trusted.** A reading app missing an article
  is a gap; a driver missing a deadline is a failure. Every task that has a
  date has a source.
- **It asks what it needs to know,** when it needs to know it, and the
  answer changes the plan ([Tailoring](#tailoring)).
- **It knows whose job it is:** hers, the partner's, or both of yours.

**And a companion, not a tool.** The admin is half of it; the other half is
the pregnancy itself. A tool answers when asked. A companion:

- **knows you:** your answers tailor what you see;
- **remembers:** what happened becomes part of the story;
- **speaks at the right moment:** a heads-up just before something
  matters, not a pile of articles;
- **is there for both of you;**
- **is gentle,** including when things go wrong.

**One place for all of it,** without bloat: a small core is always on, and
everything else is an [extra](product/extras.md) you turn on.

## Why build one

Pregnancy apps exist. The ones worth using are written for the US, sell
your data, or both. None of them is a shared space for both parents, and
none treats the partner as a reader.

The research on what pregnant women look for agrees with the pregnancy
books (Up the Duff, Birth with Confidence, What to Expect, Expecting
Better). They want:

- **the baby's development;**
- **their own body and health:** symptoms, medication, the mental side;
- **food and safety;**
- **how the pregnancy is going;**
- **then:** the birth, feeding and the newborn.

Partners say the appointments, the classes and the reading all leave them
out, and they're unsure of their role.

## Who uses it

- **Both parents, one space.** Shared by default. Everything either of you
  adds, the other sees and can edit. One password, no accounts.
- **But each with a name.** Each phone says who is holding it ("I'm
  Jason"), once. That needs no account. It's what lets Expecting say who
  kept something and whose a task is, ask each of you how you are, run the
  names game, and tell one of you what the other added since you last
  looked. It's a courtesy, not security: anyone with the password can say
  they're you, so nothing that must stay secret rests on it.
- **In the baby's colours.** One question (boy, girl, or don't know /
  keeping it a surprise) sets the theme: blue, pink, or purple. Light or
  dark is each phone's own.
- **On a phone and on a computer, for different moments.**
  - **The phone** is for reacting: a lookup at 2 am, at the appointment,
    the night it starts. It installs to the home screen and opens like an
    app, and works with no signal.
  - **The desktop** is for the two of you planning together: decisions,
    reading, paperwork. It uses the room: the same app laid out for a big
    screen, not a phone column in the middle of one.

## The ways people come to it

People open a pregnancy app in different modes, and each mode has its own
shape. The timeline answers *when*. Pregnancy also keeps asking *what*
("is this normal?", "can I?") and *which* (decisions). Forcing all of it
into weeks is a mistake: it is why "nobody tells you" felt wrong as a view
of the timeline.

| Mode | The moment | Its shape |
|---|---|---|
| **Where are we?** | The weekly ritual: the baby, my body, this week | Time: [This week](product/this-week.md), [the timeline](product/timeline.md) |
| **What do we need to do?** | Book the scan, claim the leave pay | Time with deadlines: [To do](#to-do) |
| **Is this normal?** | 2 am, a cramp, spotting, itchy palms | Triage: fine, mention it, call today, call now |
| **Can I…?** | Brie, coffee, hair dye, flying, paracetamol | Lookup: a verdict and why |
| **We have to choose** | Public or private, which screening, pain relief, feeding, names | [Decisions](#decisions) |
| **The appointment** | Before it, at it, after it | An event: questions, answers, results |
| **Learning** | Labour, breastfeeding, recovery, the newborn | A library: longer reading, at leisure, often together |
| **Something happened** | A kick, a craving, a bad day, a scan photo | Kept: [the Journal](product/journal.md) |
| **It's time** | Contractions, the bag, who to call | A page: big buttons and nothing else ([It's time](product/its-time.md)) |
| **3 am with a newborn** | Feeds, nappies, "is this crying normal?" | A mode: one hand, dark, tired (later) |
| **Feelings** | Anxiety, the quiet first weeks, after a scare | A voice: gentle, with support one tap away |

### The pillars

The modes sort into six pillars, by whose a thing is and what you do with
it:

| Pillar | Whose | You… | What's in it |
|---|---|---|---|
| [**This week**](product/this-week.md) | both, now | open it | Where you are, what to do now, the week's note, what's worth knowing |
| [**Timeline**](product/timeline.md) | both, through time | follow it | The whole pregnancy at a glance: what's coming, and behind today, what happened |
| [**Library**](product/library.md) | Expecting's | read it | Everything it knows, by the question you came with |
| [**Planner**](product/planner.md) | yours, ahead | do it | To do, what to get, questions for the appointment; later decisions, appointments, contacts |
| [**Journal**](product/journal.md) | yours, behind | keep it | Movements, sickness and cravings, feelings, notes and letters, photos and scans, papers, the firsts |
| [**Drawer**](product/drawer.md) | both, when it's time | reach for it | The handy things you do together: the names game, Your people |

- **They are the things a pregnant person already keeps:** a book, a
  planner, a journal and a drawer of handy things.
- **Home is this week, not the timeline.** The timeline answers "where are
  we in all of it"; opening the app asks "where are we now, and what
  matters". It stays about the week: the handy things have the Drawer
  rather than crowding it, at the cost of a sixth tab on a phone.
- **The timeline is the thread through the others, not another shelf.** A
  Library entry appears on the week it matters, a task on the week it's
  due, a Journal entry on its day. The others are where things live; the
  timeline is where they meet.
- **Records live in the Journal:** a scan is something that happened,
  dated, on the timeline.
- **Outside every pillar:** the [capture "+"](product/capture.md), which
  files anything into its pillar, and the call button. Beside settings:
  [Emergency info](product/emergency.md) and, from 36 weeks,
  [It's time](product/its-time.md).

### The app changes shape

| Stretch | Mode |
|---|---|
| The first weeks | Quiet: before you've told anyone (not built) |
| Pregnancy | The pillars |
| From 36 weeks | It's time, beside Emergency info |
| After the birth | Newborn: one-handed, at night (later) |

These are different layouts for different moments, over the same data.

### Who to call

The most important button in the app is personal: **your** birth suite's
number, one tap away everywhere. "Is this normal?" ends at it whenever the
answer is "call", and the red flags, said plainly, lead to it
([Emergency info](product/emergency.md)).

### When things go wrong

Some pregnancies end in miscarriage, and screening sometimes brings bad
news. An app that keeps cheerfully showing "the size of a lemon" after a
loss is cruel. Expecting has a quiet "something has happened" path: it
pauses the weeks and offers support in their place, for both of you. It is
designed in from the start, not bolted on later, and every part says what
it does while it's quiet ([Something has happened](product/quiet.md)).

## Not medical advice

- **Medical content explains** what usually happens and when. It never
  tells her what to do about her body.
- **The admin is the exception that proves it.** Bookings, claims, forms
  and purchases are told plainly, with a when and a why. Booking an
  appointment is admin; what happens at it is medical.
- **Anything clinical** ends with asking the midwife or OB.
- **Nothing reassures** where it should send you to a phone. A change in
  movements is always a call, never a chart.
- **It never reads her results,** and never scores her mood: no "normal",
  no grades.

## Australian

The content assumes Australian care: Medicare, the public and private
pathways, the national immunisation schedule, Paid Parental Leave through
Services Australia, and state birth registration. Every claim comes from a
source, Australian first (healthdirect's Pregnancy, Birth and Baby,
Services Australia, RANZCOG, the state health departments). Exact weeks
and entitlements are checked against the sources when each entry is
written, never taken from memory, and re-checked when they change
(entitlements every financial year). Metric, en-AU spelling.

## Tailoring

- **The answers build the plan.** What you answer decides which tasks are
  yours and when: do you have a hospital, an OB, is a caesarean planned,
  each parent's work and leave. Each question earns its place by changing
  something.
- **Asked up front, and asked again.** Onboarding asks what you might
  already know (are you pregnant yet, when are you due, private cover,
  public or private care, is this your first), each with "not sure yet". A
  question still unanswered comes back on This week in the week it starts
  to matter, as close as possible to the task it changes.
- **Some questions only make sense later,** when the answer exists ("your
  first bloods are usually back: are you RhD negative?"), and are asked
  only then.
- **An unanswered question hides nothing,** and "not sure" is an answer
  that hides nothing. Hiding happens only on a definite answer, and
  clearing it puts everything back.
- **Each answer is a fact,** shared by both of you (or asked of each), with
  who gave it and when, and changeable in settings, which says what each
  answer changes.
- **Extras are the opposite:** off until turned on
  ([extras](product/extras.md)).

## To do

To do is how Expecting runs the admin. This week opens with it: the few
things to do now, in the order they matter, each with why
([Planner](product/planner.md)).

- **What's on it:** every task the answers and extras make yours, ordered
  by when it matters, plus any of your own.
- **Nothing separate to manage.** Tick a task and it's ticked everywhere
  it appears.
- **A task has a window, not just a week:**
  - **opens:** the earliest it can or should be done ("you can't lodge the
    claim before…");
  - **best by:** when it's comfortably done, allowing for its **lead time**
    (classes and childcare book out weeks or months ahead);
  - **deadline:** a hard date, where there is one, when missing it costs
    something (a payment, a place, a vaccine window). Only from a source.
- **Ordered by urgency, not by week.** A hard deadline coming up beats a
  soft one; a task with a long lead time surfaces early. What has slipped
  says what it costs now.
- **Whose job it is:** hers, the partner's, or together.
- **A task belongs to the entry that explains it.** "Book the RSV vaccine"
  lives on the RSV vaccine.
- **Not decisions.** "Book the morphology scan" is a task. "Decide on
  public or private care" is a decision, and a decision can produce tasks.

## Decisions

Much of the stress of a pregnancy is in choices, not tasks, and some have
deadlines that sneak up: the 12-month wait on private cover, screening
before 14 weeks, midwifery group practice places that fill in the first
trimester, childcare waitlists.

A decision has options, each with its trade-offs; a decide-by week; who
decides; and what you chose and why. It's the one place the two of you
most act together, and the record of "what we chose and why" outlasts the
choice. *Today a decision is a Library entry whose decide-by, from a
source, becomes a task. Not built: who decides, and what you chose and
why.*

## Content

- **Written and reviewed before it ships,** by Claude, from sources; no
  draft marker in the app. Reviewed like code: diffs, history, and a build
  that refuses a bad file. How an entry is written is
  [`content/README.md`](../content/README.md).
- **Several shapes, one item:** the week's note, moments, payments,
  decisions, can-i, symptoms, guides, cards and terms
  ([Library](product/library.md#the-types)).
- **"Nobody tells you" is a voice, not a place:** one-liners with a
  paragraph behind them, as a door in the Library, a heads-up on This week
  just before it matters, and later as a deck and as fillers wherever the
  app makes you wait.
- **Two origins, one shape.** Built-in entries ship with the app; later,
  our own entries (a friend's tip, something the midwife said), the same
  fields, with a small marker. The app can hide a built-in entry but never
  edits it, so an update can't clobber anything of ours.
- **Content decides where; code decides how.** An entry places a tag (a
  question to ask, its window against today, a passage for some readers);
  a component draws it.

## Later

### Phases and chapters

The first version is the pregnancy alone, weeks 1–42, and the code has no
phases. Later the timeline grows segments, and with them the data learns
which one an item belongs to:

| Phase | Span | Counted from |
|---|---|---|
| **Preconception** | one band, no weeks | Things best done before a pregnancy or very early in one: private cover's 12-month wait, folate |
| **Pregnancy** | weeks 1–42 | Completed weeks of gestation |
| **Birth** | one band, an event | Labour, the birth and the hospital stay |
| **Postpartum** | weeks 1–12 | The birth date |

Gestation is counted from the last period, so weeks 1–3 come before anyone
knows, and most people find out around week 4 or 5.

The chapters are the names people actually think in, derived from the
week, never written into content, so they can be renamed freely: getting
ready, the early weeks (1–13), the middle (14–27), the home stretch
(28–36), any day now (37–42), the birth, the first days (counted in days),
the fourth trimester. This asks for a birth slot between week 42 and
postpartum week 1, the first days counted in days, and phases and chapters
as content, not code.

### The rest of the store

All shared, all editable by both:

- **Appointments:** date, who with, notes, the questions to ask, the
  Journal's summary since the last one ("headaches on 3 days, sickness
  easing, movements daily": the answer to the midwife's "since when?"),
  and a waiting-room mode on the day.
- **Contacts:** midwife, OB, hospital, birth suite, GP, maternal and child
  health nurse. Begun as Emergency info.
- **The log's other kinds:** symptoms, and weight and blood pressure only
  if switched on.

Left out on purpose: a kick counter (Australian guidance is to know your
baby's pattern, not to count kicks) and a baby pool (friends can't log in,
and the app has no birth to score against).

## Open questions

- **The partner's lens.** How much of each week is written twice, once for
  each of you, rather than once with a "for the partner" part.
- **Reaching out.** Whether the app ever notifies (a weekly push, a
  heads-up). Today it only shows things when opened. A driver you have to
  remember to open is half a driver; push on a self-hosted server needs
  HTTPS and the installed app first.
- **The admin inventory.** What the complete list is, for an Australian
  household with two working parents, and who keeps it current as
  entitlements change each financial year.
- **The newborn mode.** How much of feed, sleep and nappy tracking belongs
  here, and where it would end before "parenting" begins.
- **Hosting and access.** Where it runs, which backup covers it, HTTPS,
  and whether health papers want a stronger lock than the shared password.
