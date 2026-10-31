# Intent

Why expecting exists and what it does. Vision, not spec: when this file and the code disagree, the code is right and this is stale. Each section says what is built; everything else is direction.

Architecture: [architecture.md](architecture.md).

## What it is

A pregnancy companion for one couple, expecting in Australia. Self-hosted. Not a product.

It covers the pregnancy, weeks 1 to 42. That is the first version: getting ready before a pregnancy and the fourth trimester after the birth (the first three months) come later, and it may grow into newborn and parenting after that. Nothing is built for them now, but nothing should prevent them.

**It runs the admin.** Having a baby in Australia comes with a long tail of bookings, claims, forms and purchases, each with its own window and lead time, split between two people and spread over a year. Expecting holds that list so you don't have to. From what it knows about you, it says what to do this week, what to start preparing for, and why, and it keeps track of what's done. You shouldn't need to know how the system works to get through it.

- **It tells, it doesn't just inform.** "Claim Parental Leave Pay this week", not an article about Parental Leave Pay. The reading is one tap behind the instruction.
- **Only about the admin.** It is directive about bookings, paperwork, purchases and plans; about her body it explains and points to the midwife ([Not medical advice](#not-medical-advice)).
- **It has to be complete to be trusted.** A reading app missing an article is a gap; a driver missing a deadline is a failure. Every task that has a date has a source.
- **It asks what it needs to know,** when it needs to know it, and the answer changes the plan ([Tailoring](#tailoring)).
- **It knows whose job it is:** hers, the partner's, or both of yours.

**And a companion, not a tool.** The admin is half of it; the other half is the pregnancy itself. A tool answers when asked. A companion:

- **knows you:** your answers tailor what you see;
- **remembers:** what happened becomes part of the story;
- **speaks at the right moment:** a heads-up just before something matters, not a pile of articles;
- **is there for both of you;**
- **is gentle,** including when things go wrong.

**One place for all of it.** People come to a pregnancy app for many different reasons, and Expecting should support all of them. To stop that becoming bloat, a small core is always on and everything else is a feature you can switch on or off ([Features](#features)).

## Why build one

Pregnancy apps exist. The ones worth using are written for the US, sell your data, or both. None of them is a shared space for both parents, and none treats the partner as a reader.

The research on what pregnant women look for agrees with the pregnancy books (Up the Duff, Birth with Confidence, What to Expect, Expecting Better). They want:

- **the baby's development;**
- **their own body and health:** symptoms, medication, the mental side;
- **food and safety;**
- **how the pregnancy is going;**
- **then:** the birth, feeding and the newborn.

Partners say the appointments, the classes and the reading all leave them out, and they're unsure of their role.

## Who uses it

- **Both parents, one space.** Shared by default. Everything either of you adds, the other sees and can edit. One password, no accounts.
- **But each with a name.** Each device says who is holding it ("I'm Jason"), once. That needs no account. It is what lets Expecting say who logged something, run the names game, show the partner's lens, and tell one of you what the other added since you last looked. *Built: who's who. Not built: what uses it.*
- **In the baby's colours.** One question (boy, girl, or don't know / keeping it a surprise) sets the theme: blue, pink, or both. Light or dark is each phone's own, matching the phone unless you choose. *Built.*
- **On a phone and on a computer, for different moments.**
  - **The phone** is for reacting: a lookup at 2am, at the appointment, go time. On a phone it installs to the home screen and opens like an app.
  - **The desktop** is for the two of you planning together: decisions, reading, paperwork. It uses the room: the same app laid out for a big screen, not a phone column in the middle of one. *Built, for the timeline.*

## The ways people come to it

People open a pregnancy app in different modes, and each mode has its own shape. The timeline answers *when*. Pregnancy also keeps asking *what* ("is this normal?", "can I?") and *which* (decisions). Forcing all of it into weeks is a mistake: it is why "nobody tells you" felt wrong as a view of the timeline.

| Mode | The moment | Its shape |
|---|---|---|
| **Where are we?** | The weekly ritual: the baby, my body, this week | Time: [the timeline](#the-timeline) |
| **What do we need to do?** | Book the scan, claim the leave pay | Time with deadlines: [to do](#to-do) |
| **Is this normal?** | 2am, a cramp, spotting, itchy palms | Triage: fine, mention it, call today, call now |
| **Can I…?** | Brie, coffee, hair dye, flying, paracetamol, sleeping on my back | Lookup: a verdict and why |
| **We have to choose** | Public or private, which screening, pain relief, feeding, names | [Decisions](#decisions) |
| **The appointment** | Before it, at it, after it | An event: questions, answers, results |
| **Learning** | Labour, breastfeeding, recovery, the newborn | A library: longer reading, at leisure, often together |
| **Something happened** | A kick, a craving, a bad day, a scan photo | [The log](#the-log) and [records](#records) |
| **Go time** | Contractions, the bag, who to call | A mode: big buttons and nothing else |
| **3am with a newborn** | Feeds, nappies, "is this crying normal?" | A mode: one hand, dark, tired |
| **Feelings** | Anxiety, the quiet first weeks, after a scare | A voice: gentle, with support one tap away |

### The pillars

The modes sort into six pillars, by whose a thing is and what you do with it:

| Pillar | Whose | You… | What's in it |
|---|---|---|---|
| **This week** | both, now | open it | Home: where you are, what to do and what has slipped, this week's note read as you, what's worth knowing, what's coming, the questions waiting |
| **Timeline** | both, through time | follow it | The whole pregnancy at a glance: what's coming, and behind today, what happened |
| **Library** | Expecting's | read it | Guides, week by week, "nobody tells you" (a shelf of its own), "Can I…?", "Is this normal?", topics, search |
| **Planner** | yours, ahead | do it | To do, what to get (the lists), decisions, appointments and their questions, contacts |
| **Journal** | yours, behind | keep it | Movements, cravings, moods and symptoms, notes, bump photos, scans, results, documents |
| **Drawer** | both, when it's time | reach for it | The handy things, each for its moment: the names game (the contraction timer and the hospital bag went to It's time) |

- **They are the things a pregnant person already keeps:** a book, a planner, a journal and a drawer of handy things.
- **Home is this week, not the timeline.** The timeline answers "where are we in all of it"; opening the app asks "where are we now, and what matters". This week is that landing page, and it stays about the week: the handy things have a pillar of their own, the Drawer, rather than crowding it, at the cost of a sixth tab on a phone.
- **The timeline is the thread through the others, not another shelf.** A Library item appears on the week it matters, a Planner task on the week it's due, a Journal entry on its day. The others are where things live; the timeline is where they meet. That is why "nobody tells you" was wrong as a view of the timeline: it put a shelf onto the thread.
- **Records live in the Journal:** a scan is something that happened, dated, on the timeline. A separate Vault for medical papers stays an option.
- **Outside every pillar:** the capture button (one "+" that files a kick, a question or a photo into the right pillar) and the call button.

*Built: the frame, This week, the Timeline, Library and Planner (with its lists of what to get), the Journal's notes, movements, sickness and cravings, photos and scans, how you're feeling, and results and papers, the Drawer's names game, and the capture "+" (a movement, sickness, a craving, a note, a photo or scan, a result or paper, a feeling, a question or a task). The rest of the Drawer says what's coming.*

### The app changes shape

| Stretch | Mode |
|---|---|
| The first weeks | Quiet: before you've told anyone |
| Pregnancy | The timeline |
| From 36 weeks | It's time: the calls, the contraction timer, the bag, getting there |
| After the birth | Newborn: one-handed, at night |

These are not views. They are different layouts for different moments, over the same data.

*Built: the pregnancy, one app with its pillars. Getting ready and the baby's here were built as apps of their own and taken out to keep the first version to the pregnancy; they come back with their phases. Not built: the quiet first weeks. It's time is a page beside Emergency info (`/its-time`), not a mode: [plan](plan-its-time.md).*

### Who to call

The most important button in the app is personal: **your** birth suite's number, from your contacts, one tap away everywhere.

- **"Is this normal?"** ends at it whenever the answer is "call".
- **The red flags,** said plainly, lead to it: a change in the baby's movements, bleeding, a severe headache or vision changes, fluid leaking, fever, itching.

*Built: the call button on every pillar (its number from Emergency info), and "Is this normal?": each symptom's levels, most urgent first, each with its call; and the red flags as one list (`warning-signs`, from healthdirect), on Emergency info under who to call and in the Library, each sign with its own page. Not built: the contacts the number would come from.*

### When things go wrong

Some pregnancies end in miscarriage, and screening sometimes brings bad news. An app that keeps cheerfully showing "the size of a lemon" after a loss is cruel. Expecting has a quiet "something has happened" path: it pauses the timeline and offers support. It is designed in from the start, not bolted on later.

*Built: a loss or hard news, from the guide or Settings, quiets every pillar for both of you, with support and the next steps in their place, and a way back ([architecture](architecture.md#something-has-happened)). Not built: moving on to a new pregnancy, and marking the due date and anniversaries.*

## The timeline

- **The spine is the week,** grouped two ways: [phases](#phases) and [chapters](#chapters).
- **Counting:**
  - Pregnancy weeks are completed weeks of gestation, the way midwives count: "28 weeks" runs from 28+0 to 28+6.
  - Before week 1 the app reads as week 1, and past 42 weeks it stays at 42.
  - Later, with the weeks after the birth: you enter the birth date, and they count from it.
- **Everything is always available.** You can read week 34 in week 8. The due date changes where you land, never what you can see.
- **Everything has a date, so everything has a week.** Built-in content, tasks, log entries, records and answered questions all land in their week.
  - **Ahead of today,** the timeline is the plan.
  - **Behind today,** it is the diary: week 22 holds the morphology scan item, the scan photos, "first kick, Tuesday night" and the questions you asked.
  - **By the birth,** it is the story of the pregnancy, without anyone having sat down to write it.

*Built: pregnancy weeks 1–42 as a map (a line a week, the landmarks, and the windows drawn across their weeks), each week's note on This week, own tasks and asked questions in their week, the Journal's notes, movements, sickness, cravings, feelings, photos and papers marked on theirs, and the trimesters as the timeline's chapter headings. Not built: the phases before and after the pregnancy, and the named chapters.*

### Phases

The phases are the timeline's segments. The first version is the pregnancy alone, so the timeline is weeks 1–42 and the code has no phases; the rest come later, and with them the data learns which phase an item belongs to.

| Phase | Span | Counted from |
|---|---|---|
| **Preconception** | one band, no weeks | Things best done before a pregnancy or very early in one, like the 12-month wait on private health cover and folate. |
| **Pregnancy** | weeks 1–42 | Completed weeks of gestation. |
| **Birth** | one band, an event | Labour, the birth and the hospital stay. |
| **Postpartum** | weeks 1–12 | The birth date. |

Gestation is counted from the last period, so pregnancy weeks 1–3 come before anyone knows. Most people find out around week 4 or 5. That gap belongs to preconception in spirit, and it's a "nobody tells you" item in its own right.

### Chapters

The chapters are the names people actually think in. They're derived from the week, never written into content, so they can be renamed freely.

| Chapter | Phase and span | What it's about |
|---|---|---|
| **Getting ready** | preconception | Private health cover, folate and iodine, a GP check, vaccinations up to date. |
| **The early weeks** | pregnancy 1–13 | The first trimester. It includes the quiet stretch before telling people, choosing your care, the dating scan and screening. |
| **The middle** | pregnancy 14–27 | The second trimester: the morphology scan, first movements, childcare waitlists, the glucose test. |
| **The home stretch** | pregnancy 28–36 | The third trimester: the RSV and whooping cough vaccines, leave paperwork, the car seat, the hospital bag. |
| **Any day now** | pregnancy 37–42 | Full term: signs of labour, when to call, going past the due date, induction. |
| **The birth** | birth | Labour, the birth and the hospital stay. Go time. |
| **The first days** | postpartum, days 0–7 | Milk coming in, the baby blues around day 3–5, newborn screening at 48–72 hours, going home, midwife home visits. |
| **The fourth trimester** | postpartum 2–12 | Recovery, the 6-week checks and immunisations, finding a rhythm. |

What this asks of the app, not yet built:

- A birth slot between pregnancy week 42 and postpartum week 1.
- The first days counted in days rather than as a single week.
- Phases and chapters as content files, not code.

## Tailoring

- **The answers build the plan.** What you answer decides which tasks are yours and when: do you have a hospital, an OB, is a caesarean planned. The Planner is the pregnancy's plan, put together from them.
- **Asked up front, and asked again.** Onboarding asks what you might already know: are you pregnant yet, when are you due, do you have private cover, public or private care, is the hospital booked, is this your first. Each can be "not sure yet". A question still unanswered or not sure comes back in the timeline, in the week it starts to matter, as close as possible to the task it changes.
- **Some questions only make sense later,** when the answer exists ("your first bloods are usually back: are you RhD negative?"). Those are asked only in the timeline, in the week they become real.
- **The driver needs more of them.** To say what to do, it has to know things like: is this your first baby; public, private or midwifery care; is the hospital booked; is a caesarean planned; for each parent, employee, self-employed or not working, and whether the employer pays leave. Each one earns its place by changing a task.
- **The rules:**
  - The questions are a list in the code (`src/features/settings/model/facts.data.ts`), not a migration.
  - Each answer is a fact, shared by both parents and changeable in settings.
  - **An unanswered question hides nothing,** and "not sure" is an answer that hides nothing.
  - Hiding happens only on a definite answer, and clearing the answer puts everything back.
  - Content is tailored two ways: a whole item by its `when:`, and a passage inside an item by `{% if %}`.

*Built: the questions in `src/features/settings/model/facts.data.ts` (fifteen, some asked of each of you, some only once another answer fits, one a date), each with the week This week asks it; onboarding (who, the due date or the last period, the colours, the onboarding questions); every answer kept with who gave it and when; This week asking what's due, again four weeks after a "not sure" or "not now"; settings built from the file, grouped, with how many are answered and what each answer changes; three items tailored by an answer (booking in, anti-D, childcare) and one passage; notice to the employer timed from the leave start date. Not built: most of the tasks the answers add, change or remove, which is content work, and asking with `text` answers.*

## Content

### Format

- **Markdoc.** Built-in content is Markdoc: Markdown, plus tags that are declared and checked.
- **Tags for things the app acts on:**
  - `{% ask %}` is a suggested question, added to your list in one tap.
  - **Every entry can send a question** to the list for the next appointment, in your own words, and some suggest one where your own case matters (`appointment:`, in the frontmatter). The Library answers Expecting's questions; the list is for what only your midwife or doctor can answer about you, so the Planner never suggests anything.
  - `{% window %}` draws the weeks something can happen against today.
  - `{% if %}` tailors a passage.
  - Later: videos, animations, links between items, partner notes.
- **The split between content and code:** content decides *where* a tag appears; a component in code decides *how* it looks and behaves.
- **Everything is checked** as the content loads, so `bun run test` fails on a bad file:
  - every tag and its attributes;
  - every `$question` and every answer it is compared with;
  - every `when:`.
- **YAML for content that is only lists:** the Library's map (`content/map/`), the log's entry types. The questions and the extras were YAML once; they drive behaviour, so they are typed lists in the code (`src/features/settings/model/facts.data.ts`, `src/features/settings/model/extras.data.ts`).

*Built on `timeline`: the format, `ask`, `window` and `if`, and the checks.*

### Content types

There isn't one shape of content. There are several, all Markdoc, all tagged with topics and tailored by your answers. The timeline shows any of them that has weeks; topics and search show all of them.

| Type | Shape | Example |
|---|---|---|
| **This week** | One per week: the baby, the body, and "for you" (the partner) | Week 28: the baby opens its eyes; heartburn; the partner's leave paperwork |
| **Moments** | Something that happens in a window, with tasks | The RSV vaccine, 28–36 weeks |
| **Cards** | "Nobody tells you": a headline and a paragraph, optionally the weeks it matters | "You bleed for up to six weeks after the birth." |
| **Can I…?** | A thing, a verdict (yes, limit, avoid, ask), why, a source | Soft cheese: avoid, listeria |
| **Symptoms** | A symptom, what's usual, when to mention it, when to call, the red flags | Itchy palms late in pregnancy: call |
| **Decisions** | Options and trade-offs, a decide-by week, what you chose and why | Public, private or midwifery group practice |
| **Money and leave** | What you can claim, when and how | Parental Leave Pay, Family Tax Benefit |
| **Guides** | The long reads | Labour, feeding, recovery, the newborn |
| **Terms** | A word you'll hear, in a sentence or two | Effaced, CTG, Anti-D |

*Built: every type, 893 entries in all, drafted from the Library's map (`content/map/`) and all but 38 checked against their sources by a second reader, all still draft until we review them; and a note for each of the 42 weeks. The Library opens by the question you came with: search, then a door per type and a quiet one for when it's hard, then what's open right now, then every topic. Each entry's page is drawn by its type: a can-i's verdict, a symptom's levels most urgent first with a call button for each. On This week: what's worth knowing as each week starts, and a card as a heads-up. Not built: what you chose in a decision and why, and our own entries of the new types.*

### Cards: "nobody tells you"

"Nobody tells you" is not a place on the timeline. It is a voice, written as one-liners with a paragraph behind them. They appear:

- **as a deck** to flip through any time. It remembers what you've seen, and either of you can save a card;
- **as a heads-up:** one card on this week, just before it matters;
- **as fillers** wherever the app makes you wait or has nothing to show: loading, an empty view, after a save, and the appointment waiting room (when you open Expecting on appointment day: your questions, then a few cards "while you wait").

*Built: the cards behind the Library's Nobody tells you door, and a heads-up on This week: one card a week, the one covering it that started nearest, none twice. Not built: the deck that remembers what you've seen and saves, and the fillers.*

### Every item

- **Weeks:** the range it applies to, such as 28–36, within weeks 1–42.
- **Topic:** one shelf per item, from the map's: food, drink, medicines, activities, body, baby, tests, appointments, care, labour, birth, after the birth, feeding, mental health, relationships, loss, money, work, paperwork, baby gear, partner, travel, special circumstances, and celebrations for the extras.
- **When:** who it is for, by your answers. Empty for everyone.
- **Body:** a short explanation. Practical, with a bit of warmth. Plain words, no jargon left undefined.
- **Sources:** every page a claim comes from, preferring Australian sources: Pregnancy, Birth and Baby (healthdirect), Services Australia, RANZCOG (the college of obstetricians), state health departments.
- **Last checked:** when the source was last confirmed. Entitlements change every financial year.
- **Linked tasks:** optional. "Book the RSV vaccine" belongs to the item that explains the RSV vaccine.
- **Draft:** set on every item Claude drafts, and cleared only once we have reviewed it. Drafts show with a marker.
- **Private:** an entry about family violence or reproductive coercion is read and searched like any other, but leaves no trace in the space you share: nothing to save from it, never offered unasked, not in the address bar, and a quick exit.

### Two origins, one shape

- **Built-in items** ship with the app. Claude drafts them; we review them before they count as trusted. The app can hide a built-in item but never edits it, so a content update can't clobber anything of ours.
- **Our own items** are added in the app: a friend's tip, something the midwife said. Same fields, same linked tasks.

The app shows both the same way. A small marker says which is which.

### Not medical advice

- **Medical content explains** what usually happens and when. It never tells her what to do about her body.
- **The admin is the exception that proves it.** Bookings, claims, forms and purchases are told plainly, with a when and a why. Booking an appointment is admin; what happens at it is medical.
- **Anything clinical** ends with "ask your midwife or OB".
- **Nothing reassures** where it should send you to a phone. A change in movements is always a call, never a chart.

### Australian specifics

The content assumes Australian care: Medicare, the public and private pathways, the national immunisation schedule, Paid Parental Leave through Services Australia, and state birth registration. Exact weeks and entitlements are checked against the sources when each item is written, not taken from memory.

## To do

To do is how Expecting [runs the admin](#what-it-is). This week opens with it: the few things to do now, in the order they matter, each with why.

- **What's on it:** every linked task, ordered by when it matters, plus any standalone tasks we add.
- **Nothing separate to manage.** Tick a task and it's ticked everywhere it appears.
- **A task has a window, not just a week:**
  - **opens:** the earliest it can or should be done ("you can't lodge the claim before…");
  - **best by:** when it's comfortably done, allowing for its **lead time** (classes and childcare book out weeks or months ahead);
  - **deadline:** a hard date, where there is one, when missing it costs something (a payment, a place, a vaccine window).
  These are in weeks, from the content, and the deadline is checked against a source like any other fact.
- **Ordered by urgency, not by week.** A hard deadline coming up beats a soft one; a task with a long lead time surfaces early. What has slipped says what it costs now.
- **Whose job it is:** hers, the partner's, or together. Each phone knows who is holding it, so This week can say "yours" and "Sam's".
- **The plan changes with the answers.** A self-employed parent has different leave paperwork; the state decides how the birth is registered. A task appears, changes or goes away when your answers say so.
- **Not decisions.** "Book the morphology scan" is a task. "Decide on public or private care" is a [decision](#decisions), and a decision can produce tasks.

*Built: windows (opens, best by, deadline) and whose job on built-in tasks, ordered by urgency into To do now, which This week opens with (`src/lib/todo.ts`: a deadline within two weeks or just missed, then what slipped in the last four weeks, then what is best done in the next two; older slips are left to the Planner). Four deadlines so far, each from its item's checked source: the first-trimester screening window, the glucose test window, and the employer's 10-week and 4-week notice. The other tasks' sources give no hard date, so they have a best-by week only. The Planner leads with the same order: one task Next up, the rest of To do now under it, and everything else folded away by the week it next asks of you (`src/lib/planner.ts`). Not built: own tasks with a window or an owner, and most tasks' windows, which is content work.*

## Decisions

Much of the stress of a pregnancy is in choices, not tasks, and some have deadlines that sneak up:

- the 12-month wait on private cover;
- screening, which has to be done before 14 weeks;
- midwifery group practice places, which fill in the first trimester;
- childcare waitlists.

A decision has:

- options, each with its trade-offs;
- a decide-by week;
- who decides;
- what you chose and why.

It is the one place the two of you most act together, and the record of "what we chose and why" outlasts the choice. *Built: the decisions as Library entries, each with its options and what to weigh, and a decide-by week, from a source, becoming a task to decide by then. Not built: who decides, and what you chose and why.*

## The log

One capture button, always within thumb reach, then a quick choice of what to log:

| Entry | Fields |
|---|---|
| Movement | when, an optional note |
| Sick | when, how bad |
| Craving | what, when |
| Mood | a five-step scale, optional words |
| Symptom | which, how bad |
| Note or photo | anything |
| Weight, blood pressure | only if switched on |
| Contraction | go time only |

The entry types are content (a YAML file), so adding one is a content change. Each entry is dated, and logged by whoever's phone it came from. It lands in its week on the timeline.

- **It prepares appointments.** Before the next visit, Expecting sums up what's happened since the last one ("headaches on 3 days, sickness easing, movements daily"). That's the answer to the midwife's "since when?".
- **It is careful.**
  - **Movements:** Australian advice is to know your baby's usual pattern, not to count kicks. So Expecting shows the pattern but never reassures, and an entry marked "different from usual" leads straight to the call button.
  - **Sickness:** an entry of "can't keep fluids down" leads straight to it too.
- **It notices mood gently.** If the mood entries stay low for a fortnight, it suggests talking to someone and shows the PANDA helpline. It never scores or diagnoses.
- **It is also fun.** "You craved pickles 14 times." By the birth, it is half the story.
- **The Journal gives it back.** Not a paper journal's fixed pages and empty frames: the page is made for the moment. What you just kept, in its thread; what the other kept since you looked; a first to claim, asked about while it's fresh; a trimester given back as it ends, and the whole pregnancy from week 37, as something to step through and a book to print. Then one story of everything kept and done, newest first, in a lens, searched, or zoomed out to the weeks or the whole pregnancy. It shows what's kept and never what's missing: some keep nothing, some one kind, some everything, and each gets a Journal that's theirs; what was done in the Planner is its backbone, so even one nobody wrote in tells the story ([plan](plan-journal.md)).

*Built: the capture button, a "+" on every pillar (floating above a phone's tab bar, at the top of a desktop's sidebar), filing a movement, sickness, a craving, a note, a photo or scan, a result or paper, a feeling, a question or a task into its pillar and leaving you where you were ([architecture](architecture.md#the-pillars)). Movements, from week 16: when, a few words if you want, and "slower, weaker or stopped?", which leads straight to the call; in the Journal the last fortnight as a dot at each time of day, never counted and never reassuring. Notes, in the Journal. Either of you can change any note, and it says who did; on the timeline a note marks its week, and This week shows a week's notes only when you peek at it. And mood, as how you're feeling: asked on This week, kept in the Journal, the step shared and the words only yours, with someone to talk to on a rough day and after a hard fortnight ([architecture](architecture.md#how-youre-feeling)). Sickness and cravings ([plan](plan-cravings-sickness.md)): sick or queasy in one tap (queasy, threw up, or can't keep fluids down, which leads straight to the call), a craving or something gone off as what, with past cravings one tap away; in the Journal, since when and the weeks as rows of days, a quiet word and a question for the appointment when she's been sick often or craves something that isn't food, and the cravings tallied; on the timeline, a week's sick days and its craving. They are a table of their own, not a YAML of entry types. Photos and scans ([plan](plan-photos-scans.md)): taken (the camera one tap from the "+") or chosen, said what they are (bump, scan or something else), on the day the camera says; in the Journal, the bump week by week with this week's empty frame and two weeks side by side, and every photo under its week; kept on the phone and sent when there's a connection, so one taken in a car park with no signal isn't lost. Results and papers ([plan](plan-results-papers.md)), from the "+" too, photographed a page at a time or chosen as a PDF, in the Journal and handy on Emergency info ([Records](#records)). The Journal as one story ([plan](plan-journal.md)): the Keep row, what matters now (a call, just kept, since you looked, a first, a recap, last week, this day weeks ago), the patterns there's enough for, lenses, search and zoom, the firsts, letters to the baby, the scrubber, the recaps and the book. Not built: other symptoms and the summary before an appointment.*

## Baby names

- **A game.** Each of you swipes through names on your own phone, Tinder-style. A name goes on the shortlist only when you've both liked it, so nobody has to admit to the name the other would hate. You never see a list of your own votes, or the other's: you just keep swiping.
- **A superlike, one a day.** For a name you love: it goes on the shortlist straight away, whatever the other thinks. The shortlist stars it, but doesn't say whose.
- **A shortlist.** The names you both like and the superliked ones, ranked together; either of you can take one off, and it isn't dealt again. For each:
  - said aloud with your surname;
  - its initials checked;
  - nicknames and meaning;
  - Australian popularity (the states publish their top names each year);
  - a veto each.
- **Secret mode,** for couples who keep the name until the birth.

*Built: the game, a page of its own opened from the Drawer, with the Choosing a name extra ([plan](plan-names.md)). A deck of names from the registers of births of England & Wales, Ireland, Ontario, New Zealand and South Australia (and the US, when its file is given), each country counting the same: the 3,646 standard Western names, common in at least two of them, dealt, and the regional ones (Aroha, Seán) kept for later, dealt a card at a time in each person's own shuffle, swiped right to like or left to pass, only girls' or boys' names once you know which it is (all of them, or either, as you choose, until then), with undo and no count of what's left; each card says where it's in a top 10 or 100 now, or when it was most given, or how many babies get it. Either of you can also add names (adding one likes it). Each votes on your own phone, and the shortlist shows to both, with no list of anyone's votes; a superlike, one a day each, puts a name on it without the other (starred, not saying whose); either of you takes one off, and it isn't dealt again. A name the other liked comes round sooner without being put first. Not built: the shortlist's checks, secret mode and the vetoes.*

## Records

Everything about the pregnancy, kept in one searchable place and attached to its date or appointment:

- scans and photos;
- results: bloods, the glucose test, screening;
- referral letters;
- the hand-held pregnancy record some states give you;
- the birth plan;
- the discharge summary;
- the baby's health record book.

Records include health information and irreplaceable photos, so two things come first:

- backups;
- settled access (HTTPS, and whether the server faces the internet at all).

*Built: the uploads, as a store any record can use (the original kept untouched on the server's volume, beside the database, so the one backup takes both; served only behind the password), and the records on it, in the Journal: photos and scans ([plan](plan-photos-scans.md)), and results and papers ([plan](plan-results-papers.md)): a photographed paper (a page a photo) or a PDF, said what it is (a result, a letter or referral, a plan, a record or summary, something else), what it's about (linked to its Library entry, where it shows under "Your papers"), its name and the date on it, found by kind or by search, and the handy ones on top, on Emergency info and kept on each phone for when there's no signal. Expecting keeps them and finds them; it never reads them. Not built: attaching a paper to an appointment (appointments aren't built), a paper's pages added after it's kept, and a stronger lock than the shared password; backups and HTTPS are still the host's to settle ([Open questions](#open-questions)).*

### The rest of the store

All shared, all editable by both:

- **Appointments:** date, who with, notes, the questions to ask, the log since the last one, and a waiting-room mode on the day.
- **Questions:** a running list for the next appointment. Asked questions keep their answers. *Built.*
- **Contacts:** midwife, OB, hospital, birth suite, GP, maternal child health nurse. The birth suite's number is the call button. *Begun as Emergency info, beside settings: the calls, then a handover for whoever is treating her on one screen.*

## Features

A small core is always on:

- the timeline and this week;
- to do;
- the call button and the red flags;
- questions.

Everything else is a feature, switched on or off in settings, for both of you:

- the log, and each of its entry types;
- mood;
- names;
- records;
- the cards deck;
- the partner's lens;
- decisions.

How the switches work:

- **Onboarding offers them** ("Want a place for baby names?"), so the app starts small and grows with you.
- **Off really means off.** Each feature brings its own sections, capture types and settings, so switching one off removes it rather than leaving gaps.
- **This week offers one in its week** if nobody has decided ("Add a babymoon?"), once: either answer settles it.

*Built, as extras (`src/features/settings/model/extras.data.ts`): the switches in settings, the offer in onboarding and on This week, and items that belong to an extra. Thirty-one so far, in five groups (celebrating, family and friends, getting ready, for you two, money), each one content, and one also a feature: Choosing a name brings the names game. An extra can be only for some pregnancies (`when`, as Older siblings is only for a second baby), and only a few are offered in onboarding (`onboarding: true`). Not built: the features above, which need more than items (the log, records), and bump photos, built since as part of the Journal's photos and scans, for everyone, not an extra. Left out on purpose: a kick counter (Australian guidance is to know your baby's pattern, not to count kicks) and a baby pool (friends can't log in, and the app has no birth to score against).*

## Order

The core loop first, the thing you open every week; then the parts that stand alone:

1. **Onboarding** and who's who. *Built.*
2. **The driver:** tasks with a window and whose job they are, and This week opening with what to do now. Then the questions it needs asked in the week they matter, and the full admin inventory, grown together.
3. **The weekly loop:** this week's note (*four weeks drafted*), the timeline as diary, and the capture button with movements, sickness, cravings, mood and notes. *Built: the capture button, with movements, sickness, cravings, mood and notes.*
4. **Safety:** the call button and the red flags.
5. **Names:** self-contained and fun, and the first test of the feature switches.
6. **Records,** once backups and access are settled. *Built: photos and scans, and results and papers, on the uploads store.*
7. **The rest of the content:** the deck, "Is this normal?", "Can I…?". Mostly writing.

## Open questions

- **Content sourcing.** How the built-in content gets written and reviewed at this volume: weekly notes, cards, "Can I…?" and symptoms are hundreds of entries.
- **The partner's lens.** How much of each week is written twice, once for each of you, rather than once with a "for you" line.
- **Reaching out.** Whether the app ever notifies (a weekly push, a heads-up). Today it only shows things when opened. A driver you have to remember to open is half a driver, so this matters more now; push on a self-hosted server needs HTTPS and the installed app first.
- **The admin inventory.** What the complete list is, for an Australian household with two working parents, and who keeps it current as entitlements change each financial year.
- **The newborn mode.** How much of feed, sleep and nappy tracking belongs here, and where it would end before "parenting" begins.
- **Hosting and access.** Castle or Tower, which backup covers it, and HTTPS (Tailscale) before records arrive.
