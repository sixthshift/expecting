# Intent

Why expecting exists and what it does. Vision, not spec: when this file and the code disagree, the code is right and this is stale. Each section says what is built; everything else is direction.

Architecture: [architecture.md](architecture.md).

## What it is

A pregnancy companion for one couple, expecting in Australia. Self-hosted. Not a product.

It covers the whole pregnancy, from getting ready to the birth, then the fourth trimester (the first three months after it). It may grow into newborn and parenting later. Nothing is built for that yet, but nothing should prevent it.

**It runs the admin.** Having a baby in Australia comes with a long tail of bookings, claims, forms and purchases, each with its own window and lead time, split between two people and spread over a year. Expecting holds that list so you don't have to. From what it knows about your household, it says what to do this week, what to start preparing for, and why, and it keeps track of what's done. You shouldn't need to know how the system works to get through it.

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

- **Both parents, as one household.** One shared space. Everything either of you adds, the other sees and can edit. One password, no accounts.
- **But each with a name.** Each device says who is holding it ("I'm Jason"), once. That needs no account. It is what lets Expecting say who logged something, run the names game, show the partner's lens, and tell one of you what the other added since you last looked. *Built: who's who. Not built: what uses it.*
- **In the baby's colours.** One question (boy, girl, or don't know / keeping it a surprise) sets the theme: blue, pink, or both. *Built.*
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

The modes sort into five pillars, by whose a thing is and what you do with it:

| Pillar | Whose | You… | What's in it |
|---|---|---|---|
| **This week** | both, now | open it | Home: where you are, this week's note, what to do and what has slipped, the questions waiting; and the tools for the moment: the names game, the bump booth, the contraction timer, the hospital bag |
| **Timeline** | both, through time | follow it | The whole pregnancy at a glance: what's coming, and behind today, what happened |
| **Library** | Expecting's | read it | Guides, week by week, "nobody tells you" (a shelf of its own), "Can I…?", "Is this normal?", topics, search |
| **Planner** | yours, ahead | do it | To do, decisions, appointments and their questions, contacts |
| **Journal** | yours, behind | keep it | Movements, cravings, moods and symptoms, notes, bump photos, scans, results, documents |

- **They are the things a pregnant person already keeps:** a book, a planner, a journal and a few gadgets.
- **Home is this week, not the timeline.** The timeline answers "where are we in all of it"; opening the app asks "where are we now, and what matters". This week is that landing page, and the tools for the moment live on it rather than in a pillar of their own, so a phone keeps five tabs.
- **The timeline is the thread through the other four, not a fifth shelf.** A Library item appears on the week it matters, a Planner task on the week it's due, a Journal entry on its day. The others are where things live; the timeline is where they meet. That is why "nobody tells you" was wrong as a view of the timeline: it put a shelf onto the thread.
- **Records live in the Journal:** a scan is something that happened, dated, on the timeline. A separate Vault for medical papers stays an option.
- **Outside every pillar:** the capture button (one "+" that files a kick, a question or a photo into the right pillar) and the call button.

*Built: the frame, This week, the Timeline, Library and Planner. The Journal and the tools say what's coming.*

### The app changes shape

| Stretch | Mode |
|---|---|
| The first weeks | Quiet: before you've told anyone |
| Pregnancy | The timeline |
| From 37 weeks | Go time: contraction timer, call, the bag |
| After the birth | Newborn: one-handed, at night |

These are not views. They are different layouts for different moments, over the same data.

*Built: getting ready, the pregnancy and the baby's here as three phases, each its own app with its own pillars, layout and home. Not built: the quiet first weeks and go time, which belong inside the pregnancy's.*

### Who to call

The most important button in the app is personal: **your** birth suite's number, from your contacts, one tap away everywhere.

- **"Is this normal?"** ends at it whenever the answer is "call".
- **The red flags,** said plainly, lead to it: a change in the baby's movements, bleeding, a severe headache or vision changes, fluid leaking, fever, itching.

### When things go wrong

Some pregnancies end in miscarriage, and screening sometimes brings bad news. An app that keeps cheerfully showing "the size of a lemon" after a loss is cruel. Expecting has a quiet "something has happened" path: it pauses the timeline and offers support. It is designed in from the start, not bolted on later.

## The timeline

- **The spine is the week,** grouped two ways: [phases](#phases) and [chapters](#chapters).
- **Counting:**
  - Pregnancy weeks are completed weeks of gestation, the way midwives count: "28 weeks" runs from 28+0 to 28+6.
  - Once the baby is here you enter the birth date, and the weeks after the birth count from it. Without one, the due date stands in once you are past 42 weeks.
- **Everything is always available.** You can read week 34 in week 8. The due date changes where you land, never what you can see.
- **Everything has a date, so everything has a week.** Built-in content, tasks, log entries, records and answered questions all land in their week.
  - **Ahead of today,** the timeline is the plan.
  - **Behind today,** it is the diary: week 22 holds the morphology scan item, the scan photos, "first kick, Tuesday night" and the questions you asked.
  - **By the birth,** it is the story of the pregnancy, without anyone having sat down to write it.

*Built: the weeks, the ruler, the views, each week's note, own tasks and asked questions in their week. Not built: phases beyond the three, chapters, log entries and records.*

### Phases

The phases are the timeline's segments. They're what the data knows: every item and every week belongs to one.

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

- **Onboarding asks a few questions:** are you pregnant yet, when are you due, do you have private cover. The answers decide what you see.
- **Some questions only make sense later,** when the answer exists ("your first bloods are usually back: are you RhD negative?"). Those are asked in the timeline, in the week they become real, so onboarding stays short and the app keeps learning.
- **The driver needs more of them.** To say what to do, it has to know things like: is this your first baby; public, private or midwifery care; is the hospital booked; for each parent, employee, self-employed or not working, and whether the employer pays leave. Each is asked in the week it starts to matter, as close as possible to the task it changes, and each one earns its place by changing a task.
- **The rules:**
  - The questions are content (`content/profile.yaml`).
  - Each answer is a fact on the household, shared by both parents and changeable in settings.
  - **An unanswered question hides nothing,** and "not sure" is an answer that hides nothing.
  - Hiding happens only on a definite answer, and clearing the answer puts everything back.
  - Content is tailored two ways: a whole item by its `when:`, and a passage inside an item by `{% if %}`.

*Built: the questions in `content/profile.yaml`, onboarding (who, expecting or getting ready, the due date or the last period, the colours, the onboarding questions), a settings form built from the file, one tailored item and one tailored passage. Not built: questions asked in the timeline.*

## Content

### Format

- **Markdoc.** Built-in content is Markdoc: Markdown, plus tags that are declared and checked.
- **Tags for things the app acts on:**
  - `{% ask %}` is a suggested question, added to your list in one tap.
  - `{% window %}` draws the weeks something can happen against today.
  - `{% if %}` tailors a passage.
  - Later: videos, animations, links between items, partner notes.
- **The split between content and code:** content decides *where* a tag appears; a component in code decides *how* it looks and behaves.
- **Everything is checked** as the content loads, so `bun run test` fails on a bad file:
  - every tag and its attributes;
  - every `$question` and every answer it is compared with;
  - every `when:`.
- **YAML for content that is only lists:** the profile questions, the phases, the categories, the log's entry types.

*Built on `timeline`: the format, `ask`, `window` and `if`, and the checks.*

### Content types

There isn't one shape of content. There are several, all Markdoc, all tagged with topics and tailored by the profile. The timeline shows any of them that has weeks; topics and search show all of them.

| Type | Shape | Example |
|---|---|---|
| **This week** | One per week: the baby, the body, and "for you" (the partner) | Week 28: the baby opens its eyes; heartburn; the partner's leave paperwork |
| **Moments** | Something that happens in a window, with tasks | The RSV vaccine, 28–36 weeks |
| **Cards** | "Nobody tells you": a headline and a paragraph, optionally the weeks it matters | "You bleed for up to six weeks after the birth." |
| **Can I…?** | A thing, a verdict (yes, limit, avoid, ask), why, a source | Soft cheese: avoid, listeria |
| **Symptoms** | A symptom, what's usual, when to mention it, when to call, the red flags | Itchy palms late in pregnancy: call |
| **Decisions** | Options and trade-offs, a decide-by week, what you chose and why | Public, private or midwifery group practice |
| **Guides** | The long reads | Labour, feeding, recovery, the newborn |

*Built: moments, the 29 items so far, which are almost all appointments and paperwork, and this week, with four weeks drafted (6, 12, 20 and 28) to settle the format and voice before the rest. The biggest gaps are the other weeks, "Can I…?" and "Is this normal?": the reasons people open a pregnancy app.*

### Cards: "nobody tells you"

"Nobody tells you" is not a place on the timeline. It is a voice, written as one-liners with a paragraph behind them. They appear:

- **as a deck** to flip through any time. It remembers what you've seen, and either of you can save a card;
- **as a heads-up:** one card on this week, just before it matters;
- **as fillers** wherever the app makes you wait or has nothing to show: loading, an empty view, after a save, and the appointment waiting room (when you open Expecting on appointment day: your questions, then a few cards "while you wait").

### Every item

- **Weeks:** the range it applies to, such as 28–36, within one phase.
- **Topics:** body, baby, food and safety, tests and appointments, birth, feeding, money and work, feelings, gear, paperwork. Several per item.
- **When:** who it is for, by the profile's answers. Empty for everyone.
- **Body:** a short explanation. Practical, with a bit of warmth. Plain words, no jargon left undefined.
- **Source:** an optional link, preferring Australian sources: Pregnancy, Birth and Baby (healthdirect), Services Australia, RANZCOG (the college of obstetricians), state health departments.
- **Last checked:** when the source was last confirmed. Entitlements change every financial year.
- **Linked tasks:** optional. "Book the RSV vaccine" belongs to the item that explains the RSV vaccine.
- **Draft:** set on every item Claude drafts, and cleared only once we have reviewed it. Drafts show with a marker.

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
- **The plan changes with the answers.** A self-employed parent has different leave paperwork; the state decides how the birth is registered. A task appears, changes or goes away when the household's answers say so.
- **Not decisions.** "Book the morphology scan" is a task. "Decide on public or private care" is a [decision](#decisions), and a decision can produce tasks.

*Built: windows (opens, best by, deadline) and whose job on built-in tasks, ordered by urgency into To do now, which This week opens with (`src/lib/todo.ts`: a deadline within two weeks or just missed, then what slipped in the last four weeks, then what is best done in the next two; older slips are left to the Planner). Four deadlines so far, each from its item's checked source: the employer's 10-week and 4-week notice, finalising the Centrelink claim, and registering the birth. Not built: the Planner ordering by urgency, own tasks with a window or an owner, and most tasks' windows, which is content work.*

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

It is the one place the two of you most act together, and the record of "what we chose and why" outlasts the choice. *Not built.*

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

*Not built.*

## Baby names

- **A game.** Each of you swipes through names on your own phone. A name becomes a match only when you've both liked it, so nobody has to admit to the name the other would hate.
- **A shortlist.** The matches, ranked together. For each:
  - said aloud with your surname;
  - its initials checked;
  - nicknames and meaning;
  - Australian popularity (the states publish their top names each year);
  - a veto each.
- **Secret mode,** for couples who keep the name until the birth.

*Not built. Needs [who's who](#who-uses-it).*

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

*Not built.*

### The rest of the store

All shared, all editable by both:

- **Appointments:** date, who with, notes, the questions to ask, the log since the last one, and a waiting-room mode on the day.
- **Questions:** a running list for the next appointment. Asked questions keep their answers. *Built.*
- **Contacts:** midwife, OB, hospital, birth suite, GP, maternal child health nurse. The birth suite's number is the call button.

## Features

A small core is always on:

- the timeline and this week;
- to do;
- the call button and the red flags;
- questions.

Everything else is a feature, switched on or off in settings for the household:

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

*Not built.*

## Order

The core loop first, the thing you open every week; then the parts that stand alone:

1. **Onboarding** and who's who. *Built.*
2. **The driver:** tasks with a window and whose job they are, and This week opening with what to do now. Then the questions it needs asked in the week they matter, and the full admin inventory, grown together.
3. **The weekly loop:** this week's note (*four weeks drafted*), the timeline as diary, and the capture button with movements, sickness, cravings, mood and notes.
4. **Safety:** the call button and the red flags.
5. **Names:** self-contained and fun, and the first test of the feature switches.
6. **Records,** once backups and access are settled.
7. **The rest of the content:** the deck, "Is this normal?", "Can I…?". Mostly writing.

## Open questions

- **Content sourcing.** How the built-in content gets written and reviewed at this volume: weekly notes, cards, "Can I…?" and symptoms are hundreds of entries.
- **The partner's lens.** How much of each week is written twice, once for each of you, rather than once with a "for you" line.
- **Reaching out.** Whether the app ever notifies (a weekly push, a heads-up). Today it only shows things when opened. A driver you have to remember to open is half a driver, so this matters more now; push on a self-hosted server needs HTTPS and the installed app first.
- **The admin inventory.** What the complete list is, for an Australian household with two working parents, and who keeps it current as entitlements change each financial year.
- **The newborn mode.** How much of feed, sleep and nappy tracking belongs here, and where it would end before "parenting" begins.
- **Hosting and access.** Castle or Tower, which backup covers it, and HTTPS (Tailscale) before records arrive.
