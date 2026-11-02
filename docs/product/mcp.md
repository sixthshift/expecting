# Claude

Claude, in the Claude app, on claude.ai or in Claude Code, can work in
Expecting as one of you. It reads the weeks, the Library, the to do and the
Journal, and keeps what the "+" keeps. Expecting is an MCP server at
`/api/mcp`. You add it to Claude as a custom connector, and Settings' Claude
section gives the address.

How it's built is [`architecture.md`](../architecture.md), Claude (MCP).

## Why you'd reach for it

- **Talking it through.** "We're at 24 weeks: what should we be booking?"
  "Can she have brie?" "Draft the questions for Thursday's appointment."
  Claude answers from Expecting's own entries, Australian and sourced, not
  from wherever it last read.
- **Keeping things hands-free.** "Log that she felt it kick after dinner."
  "Put the pram on as a task for week 30." These are kept as if typed into
  the "+".
- **Making sense of the paperwork.** Claude can look at a photo, a scan, or a
  result's pages, and say what's written on them.

## Connecting

- **Connecting goes through the shared password.** Claude registers itself
  and sends you to `/connect`, which sits behind the password like every
  page. Logged out, you log in first. The page asks who is connecting and
  whether to allow it.
- **A connection is one of you.** Whatever it keeps is kept as that person,
  so the Journal says who kept it, and feelings' words stay that person's,
  as on their phone. Each of you can connect your own Claude.
- **Disconnecting is in Settings.** Each connection shows its client, whose
  it is, and when it was last used. Disconnecting ends its access at once.
- **Logins off means no connecting.** Without a password there is nothing
  to keep anyone else out, and Claude's connection comes from the internet.
- **It needs a public HTTPS address.** The Claude app and claude.ai reach
  Expecting from Anthropic's servers, not from your phone, so a Tailscale
  name alone isn't enough (Tailscale Funnel or a reverse proxy is).
  Turning this on puts Expecting on the internet, behind the password.

## What it can do

- **Read:** where you are this week (the note, today's read, what to do
  now), any week, the to do, the Library (search, and an entry whole, its
  words fitted to your answers), the Journal, the questions for
  appointments, Emergency info, the lists, and photos and papers' pages.
- **Keep:** a note or a letter, a movement, sickness, a craving or
  something gone off, how you're feeling, a first, a question for an
  appointment, a task of your own. It can also tick a task off, or mark a
  question asked.
- **Not:** upload photos or papers, delete anything, or change the
  answers, extras or settings. Those stay in the app, where you can see
  what you're changing.

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
