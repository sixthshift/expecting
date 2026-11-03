# Claude

Claude, in the Claude app, on claude.ai or in Claude Code, can work in
Expecting as one of you. It reads the weeks, the Library, the to do and the
Journal, and keeps what the "+" keeps. Expecting is an MCP server at
`/api/mcp`. You add it to Claude as a custom connector, and Settings' Claude
section gives the address.

How it's built is [`architecture.md`](../architecture.md), Claude (MCP).

## Why you'd reach for it

Expecting is already the way into the pregnancy: what to do, when, and a
place to keep what happens. Claude is worth connecting for what tapping
can't do: putting Expecting together with the rest of your life (email,
calendar, documents, the web), and making sense across what's kept. Every
tool earns its place by one of those; what the app already does better
stays in the app.

- **The admin, as it arrives.** "The clinic emailed: add the 20-week scan."
  "Services Australia sent this: what is it?" "Draft my leave notice to my
  manager." "Fill in the hospital's booking-in form." Claude reads the
  email, the letter or the form, finds the entry and the task, answers
  from your situation, and keeps the appointment or ticks the task.
- **Questions for the midwife, as they come up.** Talking anything through,
  when it's one for the midwife or doctor, Claude offers to keep it as a
  question for the next appointment, from the entry it came from; after,
  "she said iron's fine" marks it asked with what you were told.
- **Planning around your life.** "We're away at 30 weeks: what clashes?"
  Tasks come with their windows as days as well as weeks, so a trip in the
  calendar meets them.
- **Catching up and getting ready.** "What's she logged this week?" "Get
  me ready for Thursday." What's new since a day, across the Journal and the
  Planner, in one call; the Journal found by words and days.
- **Writing from what's kept.** A letter to the baby from this month's
  notes, the announcement to your people, a "can you bring dinner".
- **At 11 pm.** Claude answers from the symptom's own entry and says who it
  says to call, and offers to log it so it's there in the morning. When
  labour may have started, it answers from your own plan, It's time's.

## Connecting

- **Connecting goes through your login.** Claude registers itself and
  sends you to `/connect`, which sits behind the login like every page.
  Logged out, you log in first. The page asks whether to allow it, as you.
- **A connection is one of you:** whoever allowed it. Whatever it keeps is
  kept as that person, so the Journal says who kept it, and feelings' words stay that person's,
  as on their phone. Each of you can connect your own Claude.
- **Disconnecting is in Settings.** Each connection shows its client, whose
  it is, and when it was last used. Disconnecting ends its access at once.
- **Logins off means no connecting.** Without a password there is nothing
  to keep anyone else out, and Claude's connection comes from the internet.
- **It needs a public HTTPS address.** The Claude app and claude.ai reach
  Expecting from Anthropic's servers, not from your phone, so a Tailscale
  name alone isn't enough (Tailscale Funnel or a reverse proxy is).
  Turning this on puts Expecting on the internet, behind your logins.

## What it can do

- **Read:** where you are this week (the note, today's read, what to do
  now), any week and its days, about you (your answers and the extras
  on), the to do (windows as weeks and days), the Library (search, in a
  word or a sentence, and an entry whole, its words fitted to your
  answers), the Journal (by week, days, kinds or words), what's new since
  a day, the appointments, the questions for them, the lists, Emergency
  info, It's time's plan, your people, and a paper's pages.
- **Keep:** a note or a letter, a movement, sickness, a craving or
  something gone off, how you're feeling, a first, an appointment, a
  question for an appointment, a task of your own, a line on a list. It
  can also tick a task off, change an appointment (only what's changed),
  mark a question asked, and mark a line got, arranged or not needed. A
  question already open in the same words isn't kept twice.
- **Take back:** anything either of you kept in the Journal or the
  Planner, to put right what was kept wrong or cancel an appointment;
  never the other's feeling, and never a photo or a paper. It says what it
  took back, so it can be kept again as it should be.
- **Not:** upload photos or papers, look at photos (the captions are in
  the Journal), play the Drawer's games (the names game, bingo, the weekly
  question), time contractions, or change the answers, extras or
  settings. Those stay in the app, where you can see what you're changing.

The day is the house's: Expecting's clock, set to where you are
(`TZ`), since Claude has no phone to say it.

## The careful parts

- **The principles go with it.** Claude is told what every part of
  Expecting keeps: be directive about bookings, claims and purchases, never
  about her body. It isn't medical advice: for anything worrying, it finds
  the symptom's entry and says who it says to call.
- **Papers are read, never judged.** Expecting keeps papers and never reads
  them. Claude may, when asked, because a result's words are hard to find
  on a phone at 11 pm. It describes what's written and never calls a value
  normal or not, which is for whoever ordered it.
- **Private entries aren't there.** The entries on family violence and
  reproductive coercion are absent: not searchable, not readable, and
  nothing that names one is kept. Claude is a second place a conversation
  is kept, in an account the other parent may see.
- **What goes to Claude leaves the house.** Whatever Claude reads is sent
  to Anthropic as part of the conversation. Connecting is a choice to share
  the pregnancy's record with it. That's why each of you allows it for
  yourself, and why it can be disconnected.
