# Plan: It's time, the page for the day it starts

Proposed 2026-10-31; the name, the timer, the Journal, the breech question
and the birthplace question settled with Jason the same day (below).

It's 2:40 am. Her waters might have broken, or the tightenings have been
coming for an hour and they're getting harder to talk through. Neither of you
has slept, one of you is holding a phone, and everything Expecting has taught
you over nine months is spread across a dozen Library entries
(`when-to-go-to-hospital`, `waters-breaking`, `card-waters-colour`,
`timing-contractions`, `getting-to-hospital`, `hospital-bag`, …), Emergency
info, the Planner and the bag list. On the day you won't read any of it.

*It's time* is one page for that night: **what's happening, who to ring, what
they'll ask, what to grab, and how to get there**, in that order, with
everything Expecting already knows filled in. It doesn't teach. The Library
has done that already. It's a set of instructions, and it works with no
signal.

## What it's for, and what it isn't

- **For the two of you, on the night**, holding one phone or both. Big
  targets, one hand, readable through tears and at arm's length in a car.
- **Directive about the admin, never about her body.** It's time says who to
  ring, what to tell them, what to take and where to park. It never decides
  whether this is labour or says "go now": the birth suite does that. The
  contraction timer gives the numbers in the shape the midwife asks for. It
  doesn't judge them. The only times it tells you what to do are when the
  Library's sources say plainly "call now" or "call 000" (below), and then
  it's a call, not a diagnosis.
- **Not a second Emergency info.** Emergency info is the handover: who she
  is, for a paramedic or a doctor. It's time reads from it and links to it. It
  never keeps the same fields twice.
- **Not a lesson.** Each part can link to its Library entry for the why
  (`ItemLink`), but nothing on the page needs reading through.

Settled with Jason on 2026-10-31:

- **It's called *It's time*,** at `/its-time`. It's what people say on the
  night, it's short enough for the pill, and it covers the waters breaking
  before labour as well as contractions ("Labour" wouldn't). It is not a
  birth plan (`birth-preferences`), which is about the birth itself.
- **The contraction timer moves here from the Drawer.** On the night you
  don't go digging in the Drawer, and the timer only matters because of the
  call it feeds.
- **The night goes into the Journal:** a first, and its times as one line in
  the story (below).
- **A question: is the baby head down?** Asked at 36 weeks, because it
  changes one instruction from "drive in" to "call 000".
- **A question: where are you giving birth?** So a home birth gets a page
  that fits it.

## Where it shows

Beside Emergency info, as you said, but only once it's near.

- **On a phone:** in `PhoneCorner`, before the call button, as a labelled
  pill ("It's time"), not a bare icon. On the night you need to find it
  without having to work out what an icon means.
- **On a desktop:** in the sidebar, above Emergency info.
- **From week 36,** not the whole third trimester. That's where the Library
  starts on it (`when-to-go-to-hospital`, `getting-to-hospital`,
  `timing-contractions` are all weeks 36–42) and where the bag is packed by.
  From week 28 it would sit in the corner for three months and turn into
  wallpaper, which is the opposite of what it's for.
  **From week 32 for twins or more** (`babies`), as they're more often early.
- **Before then it still works.** `/its-time` answers at any week, and Emergency
  info links to it ("Labour started early? It's time"). Before 37 weeks it opens
  with one line: contractions or waters before 37 weeks means calling the
  birth suite and going in (`signs-of-preterm-labour`, `waters-breaking`).
- **Never while something has happened** (the quiet path). It isn't drawn,
  and `/its-time` redirects to Emergency info.
- **On This week at 36** (32 for twins), once: "It's time is ready to look at. Look
  through it together once, so it's familiar on the night." The run-through
  matters more than the button.

## The page

One column, the phone's, even on a desktop (like Emergency info). Two modes:
**getting ready** (nothing has started) and **it's started** (a start is under
way, below). The night's version first, because it's the one that matters.

```
It's time                                   ‹ Emergency info
───────────────────────────────────────────────────────────
 Started 2:14 am · waters 2:14 am, clear · week 39+2
 [ Call the birth suite ]          [ Call 000 ]

 Call now, don't wait, if                          ▾
  · the waters are green, brown or blood-coloured
  · she's bleeding (more than a mucousy show)
  · the baby is moving less
  · pain that doesn't ease between contractions
  · a temperature, a bad smell, feeling unwell
 Call 000 if the baby's coming before you'll get there,
 heavy bleeding, a severe headache or blurred vision.

── Contractions ────────────────────────────────────────
 [        Started one        ]        (big, one tap)
 Last hour: every 4–5 min, about 50 s · 3 in the last 10
 2:51  55 s   · 2:47  50 s   · 2:42  45 s   …

── When you ring, they'll ask ──────────────────────────
 Name           Alex Morgan            URN 4471923
 How far        39 weeks 2 days, due Thu 12 Nov
 First baby?    Yes
 Waters         Broke 2:14 am, clear
 Contractions   Every 4–5 min, about 50 s
 Baby moving?   (ask her)
 Anything else  GBS positive; low-lying placenta at 20w
 Your hospital said: "Come in at 3 in 10, or any time the
 waters break."

── Before you go ───────────────────────────────────────
 ☐ Ring to say you're on your way
 ☐ The bag (and the baby's)        → 4 last things
 ☐ Phone and charger
 ☐ Car seat fitted                  ✓ ticked wk 35
 ☐ Papers: Medicare card, birth plan  (on this phone too)
 ☐ Mum's minding Leo   [ Call Mum ]
 ☐ The dog

── Getting there ───────────────────────────────────────
 Royal Women's, 20 Flemington Rd, Parkville  [ Open maps ]
 After hours: emergency entrance, Grattan St. Park in P2.
 If you can't drive: [ Call Jo ]  · or 13 CABS
 If the baby's coming before you get there: pull over,
 call 000.

 [ We're there ]          [ False alarm, we're home ]
```

### 1. At the top: where it's at, and the two calls

The state in one line (started when, waters when and what colour, the week).
Then the two calls: the birth suite (`birthSuitePhone`, as `CallBirthSuite`
does) and 000. Until the birth suite's number is filled in, that button is
"Add the birth suite's number" and goes to Emergency info. On the night that
should never happen, which is what getting ready is for.

**Who's holding the phone changes the top.** If the person carrying is
holding it and the other parent isn't the one who started it, the first
thing is "Call Sam" (the partner's number, see Data). If the partner is
holding it, the page reads to them: "You ring, you drive, you time."
`getting-to-hospital` is clear that the person in labour plans not to drive.

### 2. Call now, don't wait

The red flags, worded from the Library, never the page's own words: the
"When to get help" parts of `when-to-go-to-hospital`, `waters-breaking`,
`card-waters-colour`, `getting-to-hospital` and `timing-contractions`.
Open by default, foldable once read. Not red. The danger colour is kept for
a call that one of your own taps has set off (below).

- **Waters, and the baby isn't head-first → 000.** `getting-to-hospital` and
  `waters-breaking` both say this (cord prolapse). Shown with `presentation:
  breech` (the new question, below). With *Not sure* or no answer it's shown
  too, as "if you've been told the baby isn't head-first". With *Head down*
  it's left out. With `breech` it's also the first line of the page once the
  waters have broken, and the 000 button comes before the birth suite's.
- **Before 37 weeks → call and go in**, said at the top as well (above).
- **A planned caesarean, and labour starts first → call**, from
  `timing-contractions`. Only with `birth: caesarean`.

### 3. Contractions: the timer

One big button: tap at the start of one, tap at the end. Underneath, the
three things the midwife asks (`timing-contractions`): **how often** (start
to start), **how long**, and **how many in the last 10 minutes**, plus a list
of the last few. Strength is a word you add if you want ("talking through it",
"had to stop"), never a scale.

- **No verdict.** It never says "it's time" or "5-1-1". The Library says
  there's no single rule and your hospital's advice comes first. So under the
  numbers is **what your hospital told you** (a new Emergency info field,
  asked at the appointment: `when-to-go-to-hospital` already puts "When would
  you want us to call or come in once labour starts?" into the Planner's
  questions).
- **Shared.** Either phone can tap. The partner times while she labours, and
  if they swap the phone, nothing is lost. Each contraction is a row, saved
  through the outbox, so it works in a lift or a car park.
- **The screen stays on** while timing (the Screen Wake Lock API, where the
  phone has it).
- **Tapped by mistake:** undo the last one, from its line.
- **This is the Drawer's "Contraction timer".** It moves here, the way the
  hospital bag moved to the Planner (`plan-lists.md`), and leaves the
  Drawer's coming list. That leaves the Drawer with the names game alone,
  which is a question about the Drawer for another day.

### 4. Waters

"Waters broke" is one tap. It keeps the time, which is the first thing
they'll ask. Then: what colour? Clear, pink or straw-coloured, or green,
brown or blood-coloured (`card-waters-colour`). Green, brown or blood keeps
the call on screen, as a movement felt as different does in the Journal
(`MovementsChanged`), with its line from the card. That's the one use of the
danger colour. Then "Not sure if they've broken" is fine too: it rings the
birth suite all the same (`waters-breaking`: "or you think they may have").

### 5. When you ring, they'll ask

This is the part only Expecting can do: **the phone call, already answered.**
A card in the order a midwife asks, filled in from what's kept:

| They ask | From |
|---|---|
| Name, record number | Emergency info (`fullName`, `hospitalRecord`) |
| How many weeks | The due date (`usePosition`), worked out on read |
| First baby? A caesarean before? Twins? | The answers (`firstBaby`, `previousCaesarean`, `babies`) |
| A planned caesarean? | `birth` |
| Waters: when, colour | The start (above) |
| Contractions: how often, how long | The timer |
| Baby moving? | Not filled in: "Ask her". Never inferred from the Journal's movements |
| Anything else (GBS, blood pressure, the placenta) | Emergency info's "This pregnancy" as she wrote it. Never read from papers |

Blank ones are left out, like the handover. The birth plan, if one is kept
handy, is one tap from here (`PapersToHand` already keeps it offline).

### 6. Before you go

A short list of last things, ticked for this start only, not a second packing
list:

- **Ring to say you're on your way** (`getting-to-hospital`: it helps them
  plan).
- **The bag:** a link to *The bag*, showing only its *Last thing* lines
  (phone, charger, pillow: the state `plan-lists.md` already has for exactly
  this). If the bag isn't packed, it says so once and doesn't make a fuss.
- **The car seat**, ticked off from its task if it's done
  (`buy-and-fit-car-seat`). Otherwise "Not fitted yet: it's needed to drive
  home."
- **Papers:** Medicare card, health fund card, the birth plan
  (`getting-to-hospital`'s list), with a note that the handy ones are on this
  phone too.
- **Older children** (with `firstBaby: no`) and **pets** (if added): who's
  minding them, with their number to call. Your own lines can be added, kept
  between starts ("Turn the heater off").

### 7. Getting there

The hospital's name and address from Emergency info, with **Open maps** (a
plain maps URL; the phone picks its app). Then a new field: **getting in**
(parking, the after-hours entrance, which floor), which is the bit everyone
forgets and the tour tells you (`hospital-tour`). Then a backup: **if you
can't drive**, a person to call, and a taxi. Then the 000 line for a baby
coming on the way, from `getting-to-hospital`.

**With `birthPlace: home`** this part turns round: no getting there, no
bag, and the first call is the midwife (`carerPhone`), not the birth suite.
"Before you go" becomes "Before the midwife arrives" (the kids, the pets,
the space ready, as `home-birth` says), and the hospital stays as the
backup: its address and the 000 line, for a transfer. A birth centre
(`birth-centre`) is the same as a hospital here.

At the foot of "Before you go": **We're leaving**, one tap. It keeps the
time for the Journal's line, and the page moves "Getting there" to the top.

### 8. The end of a start

Two buttons at the foot:

- **We're there.** This start is over: the page goes back to getting ready, and
  the night is kept (below). Nothing here is about the birth itself, as there
  are no phases and no birth date (`mvp-pregnancy-only`).
- **False alarm, we're home.** Common, and the Library says so kindly
  (`when-to-go-to-hospital`, "If you're sent home"). It's time says the same in
  one line, keeps the contractions, and clears the start's ticks for next time.

## Getting ready (before it's started)

The same page, before a start, is the run-through. Its top says "Nothing's
started. When it does, tap one of these," with the two ways in: **Waters
broke** and **Contractions started** (each opens a start). Then **ready for the
night**, the things the night version needs and doesn't have yet, each a tap
to where it's filled in:

- the birth suite's number, the hospital's address, getting in, what the
  hospital said about when to come in (Emergency info)
- the bag packed, the car seat fitted (their tasks in the Planner)
- who's minding the kids, a backup driver (Emergency info)
- once, together: "Ring the birth suite's number now to check it" (there's
  no harm in asking what they'll want on the night)

Then the rest of the night's page, greyed and filled in as far as it can be,
so you see exactly what the 2:40 am version will show. That's the practice
run.

This list tells you what's missing (unlike the Journal, which never does)
because it's admin, and directive is what the Planner is for. It doesn't put
anything in the Planner: the tasks are already there. It only links to them.

## What's kept

- **New Emergency info fields** (`src/lib/emergency.ts`, ids stored, added
  only): `partnerPhone` (the other parent's number, in "Who else to call"),
  `hospitalWayIn` (getting in: parking, the after-hours entrance, the floor,
  in "Where she's booked"), `hospitalSaid` (when your hospital said to come
  in), `minder` (who's minding the kids or pets, and their number) and
  `backupDriver`. All shared and editable by both, like the rest. Shown on
  Emergency info too, as they belong there.
- **A `labour_start` table:** when it started, who started it, the waters' time and colour
  (`clear`, `green-brown-blood`, `unsure`, or none), its end and how it ended
  (`there`, `home`).
- **A `contraction` table:** start, end, a few words, who tapped, its start.
- **`start_tick`:** a start's ticked last things (by key); own lines in a small
  `start_line` table.
- Every save is a `Save` in the outbox (`src/app/model/saves.ts`), with ids
  made on the phone so `apply` gives the same answer twice. While a start is
  under way, its queries refetch every few seconds so both phones agree.

**The Journal:** a start that ended "We're there" goes into the story, two
ways:

- **One line, on its day**, like a day's movements: the times only, never
  the contractions one by one. "Waters broke 2:14 am (clear) · timing from
  2:30 · left 3:05 · there 3:40." Each part only when it was kept. It's the
  start of the birth story, in your own times. Tapped, it opens the start
  (its contractions, read only), and it can be deleted from there like any
  line. It isn't put on the timeline.
- **A first, "It started"** (`FIRSTS`, weeks 36–42, question: "Where were
  you when it started?"), suggested with the start's day, the way ticking
  the bag suggests its first.

A false alarm ("we're home") isn't put in the story: it's kept in It's time
only, until a later start ends "We're there". Then the earlier ones are folded
into that start's line ("a false start on Tue").

## The two new questions

In `src/features/settings/model/facts.data.ts`, beside `birth`, both in the
*care* group:

```ts
  // It's time: a home birth's page calls the midwife first and has no trip
  // to make; a birth centre is like a hospital.
  {
    id: "birthPlace",
    group: "care",
    ask: "Where are you planning to give birth?",
    week: 20,
    answers: { hospital: "A hospital", "birth-centre": "A birth centre", home: "At home", unsure: "Not sure yet" },
  },

  // It's time: waters breaking with a baby who isn't head-first is a 000
  // call, not a drive in (cord prolapse).
  {
    id: "presentation",
    group: "care",
    ask: "Has your midwife or doctor said the baby is head down?",
    week: 36,
    when: { birth: ["vaginal", "unsure"] },
    answers: { "head-down": "Yes, head down", breech: "No, not head-first", unsure: "Not sure" },
  },
```

- **Neither in onboarding.** Both are asked on This week as they come due.
  Birthplace at 20 weeks, as it's settled by then. Head down at 36, when
  it's checked and the page appears.
- **The head-down question asks what you've been told**, not what she feels.
  Expecting doesn't judge her body; it passes on what the hospital said. It's
  asked again if the answer is *Not sure* or *breech*, as a baby can turn,
  and an external cephalic version is offered from 36 weeks
  (`breech-birth`). A planned caesarean doesn't ask it (labour before the
  date is already a call).
- **Their content:** `home-birth` and `birth-centre` gain a `when` on
  `birthPlace` where it fits, and `breech-birth` one on `presentation`. That's
  done in the content pass, after the app, not here.

## Steps

1. **The page, with what's already kept.** `/its-time` (`src/routes/itsTime.ts`, in
   `tree.ts`), `src/features/itsTime/`, the pill in `PhoneCorner` and the
   sidebar from week 36 (32 for twins), hidden while quiet. Static parts
   only: the calls, call now, they'll ask (without a start), before you go,
   getting there. Plus the new Emergency info fields.
2. **The start and the waters:** the `labour_start` table, its saves, starting and ending
   a start, the colour's call.
3. **The timer:** the `contraction` table, the wake lock, the shared
   refetch; "Contraction timer" leaves the Drawer's coming list.
4. **Getting ready:** the ready list, the This week card.
5. **The bag's last things** once `plan-lists.md` step 1 is built (until
   then, "The bag" links to the `hospital-bag` entry).
6. **The questions:** `birthPlace` and `presentation`, and the page's home
   birth and breech turns.
7. **The Journal:** the start's line in the story and the "It started"
   first.
8. **e2e:** a start from waters to "We're there" offline, a false alarm, the
   pill's weeks, quiet.

## Still open

- **The Drawer after the timer leaves:** the names game alone, and two
  placeholders gone. Whether it stays a pillar is its own question.

## Progress

- 2026-11-01: steps 1 to 8 built on `feat/its-time`, in one go. Decided on
  the way:
  - **The bag is a list It's time owns,** not a link: `plan-lists.md` handed
    it over. `bag` in `LISTS` (`apart`, so not among the Planner's lists, and
    its page's back link is It's time), its lines in `hospital-bag`'s
    frontmatter restating the body, by section (papers, for her, for the
    baby, for the support partner) and a *Last thing, on the night* section
    (pillows, phone chargers, snacks and drinks, a little cash) that Before
    you go ticks for the start. Its words: to pack, set aside, packed.
  - **The minder and the backup driver are a name and a number each**
    (`minder`, `minderPhone`, `backupDriver`, `backupDriverPhone`), so the
    page can ring them; shown under "Everyone else to call" on Emergency info
    with `partnerPhone`.
  - **Waters broke keeps the time first, the colour after:** a start opened
    by the waters has `waters_at` and no colour until it's said. "Not sure if
    they have" is the colour `unsure`.
  - **Asking again:** a question's `askAgain` lists answers asked again like
    `unsure`; `presentation` has `breech`. Asked only with `birth: vaginal`
    (or unanswered), as `unsure` can't be written against.
  - **The end is asked twice,** so a stray tap doesn't end the night. A
    home birth ends "The midwife's here".
  - **This Week's card is once a phone** (browser storage), until that
    phone opens the page: each of you should look.
  - **One start under way at a time** (a unique index), and every tap but
    starting lands on the one under way, so two phones and late outbox saves
    agree.
  - A false alarm says so once, kindly, for 12 hours after.
- Still to do: the content's `when`s (`home-birth`, `birth-centre` on
  `birthPlace`; `breech-birth` on `presentation`), in the content pass.
