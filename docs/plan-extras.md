# Plan: extras that change the app

Thirty of the 31 extras (`src/features/settings/model/extras.data.ts`) do
the same thing when turned on: one Library entry joins, and its two or three
tasks join the Planner, This week and the Timeline. Only Choosing a name does
more: it opens the names game in the Drawer, a thing you *do* together, not
another thing to read. That's the kind of extra worth having.

Looked at with Jason on 2026-10-31, the 30 sort into:

- **Content, and that's enough** (16): advice, a decision or a booking,
  where the entry and its tasks are the whole job. Food and drink, Telling
  people, Baby budget, Grandparents, Staying active, Babymoon, A doula,
  Partner prep, Cord blood, Traditions, Older siblings, Date nights,
  Sleeping well, Freebies, Push present, Pets.
- **Content, with the lists to come** (5): Birth playlist, The nursery,
  Second-hand gear, Baby shower and Freezer meals become lines in *To get*
  and *The bag* (`docs/product/planner.md`). Nothing more here.
- **Content, but what it's about is already built** (part 1): Keepsakes,
  Maternity photos, Gender reveal, Telling people, The baby's doctor. The
  entry tells you to keep something, and Expecting has the place to keep it,
  but the two never meet.
- **Content, but it's asking for a feature** (part 2): Thank-you notes,
  Lining up help, Meal train, Visitors and Birth announcement. Each pitch
  promises a list ("keeping track of gifts", "a list, and asking early"),
  and turning it on gives you a task telling you to keep one somewhere
  else.

## Parts 1 and 2: built

`keeps` (a task that ends by keeping something) and Your people with its
four views are built: [`product/extras.md`](product/extras.md) and
[`product/drawer.md`](product/drawer.md#your-people). Left from them:
`emergency: <field>` (nothing needs it yet) and the maternity shoot's
`shoot` photo kind, with *Add your favourites from the shoot*.

## Part 3: new extras like the names game

What makes the names game work: **each of you plays on your own phone,
something is revealed when you both have (a match, both answers), and it's
worth coming back to.** These are new extras built that way, each with a
feature of its own, not only an entry. Ideas, not settled. Some are games,
but they don't have to be.

### Matching: each of you, then where you agree

- **Who does what.** Swipe the newborn jobs (night feeds, nappies, the bath,
  the washing, the admin, the visitors) as *me*, *you* or *together*. It
  shows where you agree and where you need to talk. Closest to the names
  game, and squarely about the admin.
- **Same page.** The big choices (dummies, where the baby sleeps, screens,
  religion, whose surname) answered by each of you alone, shown side by
  side once both are in. No right answers: it starts a conversation.
- **Date night picker.** Swipe a deck of ideas; the matches are your list.
  Gives the Date nights extra a feature.

### Sealed: kept now, opened later

- **Predictions.** Each of you guesses the sex, the day, the hair, the eyes,
  whose nose. Sealed until the birth, then opened in the Journal (needs the
  weeks after the birth, so made now and opened later).
- **Letters to open at the birth.** To each other or to the baby, locked
  until then. The Journal's `letter`, with a seal.
- **Time capsule.** The news, the prices, a photo of the day, your song this
  year: sealed for their 18th.

### Weekly: a small ritual

- **A question a week.** One prompt each week ("What did your parents get
  right?"). Each of you answers, and the answers show once both are in. The
  firsts already ask a question each; this is that, weekly.
- **Size of a…** The baby's size each week, in a theme you choose: fruit,
  Australian animals, footy, coffee orders. On This week.

### Games

- **Pregnancy bingo.** A card for the two of you, ticked over the months: a
  stranger touches the bump, someone says "you're huge", crying at an ad,
  the first "is it twins?". The squares are about other people and the
  funny moments, never her body (the body rule): they need care.
- **Shower games.** Bingo cards and a guess-the-bump sheet for the Baby
  shower extra, as a page to print, since guests can't log in.

### Keeping

- **The two of you as babies.** Your own baby photos side by side, for
  comparing with theirs later. Photos and scans, a kind of its own.
- **Voice notes to the bump.** Messages to the baby, kept in the Journal.
  Needs audio in the upload store, which takes pictures and papers now.

Picked first, on 2026-10-31: **Who does what** and **A question a week**
(the most like the names game, and about the two of you), then **Pregnancy
bingo** (the most fun, and the most care with its squares).

## Part 4: extras for the admin

Not games: features for what Expecting is best at, telling you what to do
and by when. Ideas, not settled.

### Trackers: a list where each thing has a state

- **Childcare waitlists.** In much of Australia you join them during the
  pregnancy. A centre per line, each *enquired*, *toured*, *on the list*,
  *offered* or *declined*, with the day you applied, the start you want,
  and a task to check in. Admin nobody expects, and very Australian.
- **Freebies tracker.** The Freebies extra's packs and programs, each
  *signed up* then *arrived*.
- **What's in the freezer.** The Freezer meals extra's meals and portions,
  crossed off after the birth. One more list in the lists plan's `list`
  column, like childcare and freebies (settled, 12).

### Planners: dates for the two of you

- **The leave plan.** Each of you's leave on one calendar (employer leave,
  Paid Parental Leave, annual leave), the days you're both off, when each of
  you goes back, and the claims' deadlines as tasks. Dated admin. Core,
  not an extra (settled, 11).
- **The route card.** The hospital's address, where to park, the after-hours
  entrance, a back-up route and how long it takes. Partner prep's *Plan the
  route* keeps it (`keeps`, part 1). Beside Emergency info, or in it.

### Handover cards: a page you give someone else

- **Minding cards.** One card per thing someone minds when labour starts:
  the older child (routines, allergies, pick-up, who to call), the pets
  (feeding, the vet, the keys), the house (bins, plants). Shared through the
  share sheet or printed. Gives Older siblings and Pets a feature each, on
  one shape.
- **Visitor rules.** A short note for visitors: hands washed, whooping
  cough vaccine, when to come, drop food and go. With the visitors view in
  Your people.

### Decisions: made together and kept

- **Birth preferences.** Her choices, from options, kept and shared with the
  midwife as a page or PDF. The body rule: Expecting keeps what she decides,
  never suggests what she should.
- **Life admin.** A will, guardians, life insurance, super beneficiaries:
  each a decision and a paper, kept in Results and papers.

### Family

- **Asking the grandparents.** Questions for the grandparents-to-be (their
  pregnancies, the family's health history, what you were like as babies),
  the answers kept in the Journal. A keepsake, and the health history helps
  at appointments. Gives Grandparents a feature.

Picked first, on 2026-10-31: **the leave plan** and **childcare
waitlists** (the admin people don't know to start early), then **minding
cards** (one shape, two extras made real). Since settled (11, 12): the
leave plan is core and gets its own plan, and childcare waits for the
lists, so the minding cards come first here.

## Across all of it

What every new extra here has to hold to, whichever part it's from.

- **Hidden is on trust.** The names game's server returns only your own
  votes and the matches (`src/api/rpc/names.ts`), and part 3's reveals
  would do the same. But who's holding the phone is a choice, not a login
  (`src/api/rpc/people.ts`): switch to the other one and their answers are
  there. Fine for a game between the two of you; say so plainly where
  something is "sealed", and never use it for anything that has to stay
  secret (a push present, a surprise, anything private).
- **Quiet puts it all away.** After a loss, predictions, bingo, the size
  of the week, a question a week, the announcement and the visitors must
  not be seen. Each feature says what it does while quiet, as the names do,
  and nothing is deleted. Some need more than hiding: the leave plan still
  matters after a loss (leave can still be due), and should say so gently,
  not vanish.
- **One pillar each, and the Timeline for dates.** Each feature names its
  pillar: the Drawer for the tools (names, Your people, bingo), the
  Planner for the admin (the leave plan, childcare), This week for the
  weekly ones. Anything dated shows on its week in the Timeline. But the
  Timeline stops at week 42, and the leave plan, the meal train and
  childcare starts fall after the birth: until the weeks after the birth
  exist, those dates are kept and shown in their feature, not on the
  Timeline.
- **The Journal shows what's kept, never what's missing**
  (`docs/product/journal.md`). An answered question, a marked bingo square, a
  match belongs in the story; an unanswered question or an empty square
  doesn't, and nothing nags.
- **Turning an extra off hides, never deletes.** Turned on again,
  everything is where it was. One rule for all of them, not decided per
  feature.
- **The decks are writing.** The newborn jobs, the Same page questions,
  the weekly questions, the bingo squares and the grandparents' questions
  are content: in `content/`, reviewed before they go in, checked by the
  content tests, under `content/REVIEW.md`. Which shape (a new kind of
  file, or a section of an entry) is open.
- **Facts from a source, with a date.** The leave plan and childcare rest
  on rules that change (Paid Parental Leave's weeks, the Child Care Subsidy):
  sourced like any entry, `checked:` only once confirmed, and looked at
  again when the rules change.
- **Every save through the outbox,** with an `apply` that gives the same
  answer twice (`src/app/model/saves.ts`). A reveal waits for the other's
  answer, which may still be on their phone; say "waiting for Sam", not
  "Sam hasn't answered".
- **Every new write path in `test/server/private.test.ts`**, so none can
  carry a private entry.
- **Fewer offers, not more.** This week offers one extra at a time in its
  week, and onboarding offers 11 already. Fifteen more extras need their
  `offer` weeks spread out, and few or none added to onboarding.
- **The Drawer fills up.** It has the names game and three "coming"
  placeholders now. With Your people, bingo, the minding cards and more, it
  needs a shape: the tools you've turned on first, and the rest as a line
  each saying which extra brings them, as the names do now.
- **Settings says what an extra unlocks.** A switch's pitch says what it
  adds to read; an extra that brings a tool should say so ("adds a tool in
  the Drawer"), so the better extras stand out.
- **Mind the cost.** Each of these is a build, not an entry. Pick a few,
  build them well, and leave the rest here.

## Settled

All thirteen questions, settled with Jason on 2026-11-01:

1. **`keeps` it is.** One field on a task, checked with the rest of the
   frontmatter, and `FIRST_TICKS` moves onto it, so there's one way.
2. **A shoot is a photo kind of its own,** `shoot`, not `bump`: the bump
   booth's week-by-week line is for bump photos. One migration (the
   `photo_kind` check).
3. **Marking *Found out boy or girl* asks** whether Expecting should use it,
   rather than answering the "do you know" question itself. Some know and
   keep it out of the app.
4. **The baby's doctor stays content.** No link to Emergency info, which is
   hers; the baby's numbers wait for the weeks after the birth.
5. **Your people keeps names,** with a few words each. A number can go in
   the words; there's no phone field.
6. **Lining up help and Meal train are one extra,** Lining up help, with the
   meal train as its second view. Meal train's id is retired from
   `extras.data.ts` and its entry and tasks move under `help-network`
   (task ids stay).
7. **"Your people"** in the app, `circle` in the code.
8. **Gifts received and gifts wanted are two things.** Received is Your
   people's gifts view; wanted is a registry over *To get*, later, with
   the Baby shower extra (`docs/product/planner.md`).
9. **Part 3 builds Who does what, then A question a week, then Pregnancy
   bingo.** The small ones join extras that exist: the date night picker
   Date nights, the shower games Baby shower, the time capsule and the
   letters to open at the birth Keepsakes. Same page, Predictions, Size
   of a…, your baby photos and voice notes wait.
10. **"Both answer, then reveal" is built once,** with Who does what, and
    A question a week uses it.
11. **The leave plan is core, not an extra:** in the Planner, for everyone.
    It's here because it came up here; it gets its own plan.
12. **Childcare, freebies and the freezer are lists,** more values of the
    lists' `list` column, each with its own states, once the lists are
    built. Check childcare's dates fit when it comes.
13. **A handover card goes out as a message or on paper:** the share sheet
    as text, or a page to print. Never a public link.

## Steps

1. **`keeps`**: the frontmatter field, checked in `src/content/schema.ts`.
   The second button on a task, opening the "+" or Emergency info at the
   right place. `FIRST_TICKS` moved onto it. Tests for each kind of keeping.
2. **Part 1's content**: the new tasks (letter, shoot photos, telling the
   family) and the entries pointed at the Journal. Ids stay as they are.
3. **Your people, the list**: the domain, its migration, the page in the
   Drawer, adding and editing a person, put away while quiet.
4. **The views, one extra at a time**: Visitors, Birth announcement (with
   the share sheet), Lining up help (with the meal train, and Meal train
   folded into it), then Gifts.
5. **The tasks meet the list**: each part 2 task opens its view.
6. e2e: turn an extra on, keep from its task, see it in the Journal; add
   someone to Your people, see them in two views.
7. **Part 3**: Who does what, with "both answer, then reveal" built for
   it; then A question a week on the same; then Pregnancy bingo. The small
   ones join their extras as they come.
8. **Part 4**: the minding cards (Older siblings, Pets). Childcare,
   freebies and the freezer wait for the lists. The leave plan goes to a
   plan of its own, as core.

## Progress

- 2026-10-31: plan written, with parts 3 and 4 (new extras) and what
  they all hold to added the same day.
- 2026-11-01: the thirteen questions settled (above).
- 2026-11-01, the easy ones (`feat/extras-easy`): Meal train folded into
  Lining up help (028, a choice carried over); an extra's `tool` shown
  wherever it's offered (the names game); step 1, `keeps` (letter, photo,
  a first; `FIRST_TICKS` gone, the cot and bag on it), kept from a task
  ticks it; step 2 in part: Keepsakes' letter, Telling people's *Tell the
  family*, Gender reveal's *Have the reveal* (boy or girl asks whether to
  use it). Not yet: `emergency: <field>` (nothing needs it now the baby's
  doctor stays content) and the maternity shoot (its `shoot` photo kind).
- 2026-11-01, Your people (`feat/your-people`): steps 3 and 4. The list
  (`circle_person`, `circle_gift`, `announcement`; 030), at
  `/drawer/people`, put away while quiet, in the Drawer with its extras
  named when none is on; its four views (Visitors, Hearing first with the
  words for the birth and a share per round, Help with the meal train and
  its roster, Gifts with what's left to thank in the view's name); each of
  the four extras says it brings it (`tool`). Step 5: `keeps: { people:
  <view> }`, so the four tasks that start each list ("Start a shared list of
  gifts", …) open their view ("Open the list"), left to tick when done.
- 2026-11-01, Who does what (`feat/who-does-what`): part 3's first. Its own
  extra (For you two, offered at 24), the jobs in code (`JOBS`,
  `src/lib/jobs.ts`, 18 in five groups), each of you's answer (`job_pick`,
  031) as me, you or together, the other's shown only for a job both have
  answered (the names game's rule, `JobsRepo.view`), at `/drawer/jobs`: a
  job at a time with undo, then To talk about and Settled, each changeable;
  in the Drawer, settled and to-talk counts. The "both answer, then reveal"
  rule lives in the repo's view, ready for A question a week.
- 2026-11-01, A question a week (`feat/question-a-week`): its own extra
  (For you two, offered at 6), a question for each week 4–41 (`WEEKLY`,
  `src/lib/weekly.ts`, drafted, for Jason's review), each of you's answer
  (`weekly_answer`, 033), the other's shown only once both have answered
  (`WeeklyRepo.view`; a phone that hasn't said sees only those). This
  week's question on This week, with the earlier weeks' folded beneath,
  never counted; a week both have answered is a line in the Journal's
  story (`question`), hidden while the extra is off. Settled with Jason:
  on This week, from the week you're in, drafted by Claude for review, and
  earlier weeks still answerable, found only when looked for.

## Not in this plan

- **The 16 content-only extras.** They stay content.
- **Sending anything.** No messages, invitations or emails sent from
  Expecting, and no logins for friends.
- **After the birth.** Visitors and meals are planned in weeks 30–38 and
  used after. Reminding you on the day needs the weeks after the birth,
  out of the first version.
- **Importing contacts.** The Contact Picker API is Android Chrome only;
  typing names in is enough for now.
