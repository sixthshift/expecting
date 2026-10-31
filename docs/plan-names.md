# Plan: the names deck

The names game was built with only the names either of you typed in, so the
swiping ran out almost as soon as it started. What makes a swipe game work is
being dealt names you'd never have thought to type: "as easy as that". This
plan gives the game a deck.

Asked for by Jason on 2026-10-31. The choices below were made while building
it, and are for Jason to review.

## Where the names come from

Western naming, not one country's: Australia names its babies much as the
rest of the English-speaking world does, so the deck is drawn from the
registers of births of several countries, each published with how many babies
were given every name each year:

| Place | What's published | Licence |
| --- | --- | --- |
| England & Wales | ONS: every name given 3+ times a year, 1996 on | OGL v3 |
| Ireland | CSO (VSA50, VSA60): every name given 3+ times a year, 1964 on | CC BY 4.0 |
| Ontario | ServiceOntario: every name given 5+ times a year, 1913 on | OGL-Ontario |
| New Zealand | DIA: every name given 10+ times a year, 1900 on | CC BY 4.0 |
| South Australia | data.sa.gov.au: every name 1944–2017, the top 100 since | CC BY 4.0 |
| The US, optionally | SSA: every name given 5+ times a year, 1880 on | Public domain |

- **Every country counts the same.** A name's popularity in a year is its
  share of that country's babies of its sex, and the countries' shares are
  averaged, so the deck is Western naming, not whichever country has the most
  babies.
- **Curated by use, not by hand.** A name is in the deck if, in some country,
  it averaged at least 1 in 10,000 of a decade's babies since 1950, or it's in
  a country's latest top 100. A decade's average, not a year's, so a few
  babies in one year of a small country don't make a name. That keeps 6,578
  names (3,579 girls', 2,654 boys', 345 either), and drops one-offs, typos and
  spellings nobody chose twice. At 1 in 20,000 it was half as many again
  (tried with four countries), and the extra names were mostly rare
  spellings.
- **Standard Western names are dealt; regional ones are kept.** A name
  common in only one place (Aroha and Nikau in New Zealand, Seán and Oisín in
  Ireland, and one country's own spellings) is regional. It stays in the
  deck, with the places it's common in (`common`), for dealing by region one
  day, but the game deals only the names common in at least two places
  (`widespread`, `WIDESPREAD` in `src/lib/nameDeck.ts`): 3,646 of the 6,578.
  A regional name the other liked is still dealt, so a match isn't lost.
  This is by spread, not origin: a name common across several countries is
  dealt whatever its roots (Muhammad, Aadhya). Sorting by origin would need
  another source, such as Wikidata's languages for each name.
- **The US is optional.** The SSA turns away scripted downloads, and the
  script doesn't get round that. Download `names.zip` from
  ssa.gov/oact/babynames/limits.html and run `NAMES_US=<path> bun run names`;
  without it, the deck is the other five.
- **Not names:** registry entries like `UNNAMED` and `BABY`, and anything
  that isn't letters, apostrophes and hyphens.
- **Spelled as the registers write them,** accents and all (Seán, Zoë beside
  Zoe). SA and Ontario write names in capitals, so a name is shown as the
  registers that keep the case write it, and McKenzie, not Mckenzie.
- **Generated, not hand-kept:** `bun run names` (`scripts/names.ts`) fetches
  the lists and writes `src/lib/nameDeck.data.json`. Rerun each year, once
  the new lists are out. The ONS lists are spreadsheets; the script reads
  them itself (`readSheet`), with no library.

### Sources considered and not used

Researched on 2026-10-31.

- **British Columbia** (used at first): replaced by Ontario, which has about
  three times the births and lists every name given 5 or more times.
- **NSW, Victoria, Queensland:** a top 100 only, which says what's popular but
  adds no names.
- **Alberta** (spreadsheets only) and **Quebec** (counts only children on
  family benefits, not all births): not worth the reading.
- **Scotland** (NRS): full lists, a spreadsheet a year; England & Wales is
  nine-tenths of the UK's births already. Worth adding if it's easy later.
- **The `babynames` R package** republishes the US data (CC0), but as an R
  binary file, last updated in 2022: the SSA's own zip is better.
- **Meanings:** none free. Behind the Name's free API excludes its meanings
  from apps; Nameberry and the like are copyrighted; Wiktionary's etymologies
  are CC BY-SA (credit, and share edits alike). **Wikidata** (CC0) has no
  meanings, but has each name's spelling variants, nicknames, languages and
  pronunciation recordings: the source for the shortlist's nicknames, later.
- **Name datasets built from leaked social-media data:** not used.

## Dealing it

- **Your own order.** Each of you is dealt the deck shuffled by your own id:
  the same order each time you look, a different one from the other's, so you
  aren't swiping in lockstep. Familiar names are a little likelier near the
  front (a weighted shuffle, by share of babies now), so the first cards aren't all
  rarities, but it's a mix, not a ranking.
- **The other's added names first,** as before: they asked for them.
- **A match comes sooner.** A deck name the other liked is shuffled in among
  the first few dozen cards, not put first, which would tell you what they
  liked. A deck name the other passed is never shown early, so the order of
  your deck never gives away what they've seen.
- **Girls' or boys' names, from what you know.** The one question Expecting
  already asks (boy, girl or don't know: the colours) decides it. Knowing,
  the deck is that one's names, with no way to choose the other's. Not
  knowing, it's all of them, or girls' or boys' as you choose, in the address
  (`/drawer?names=girls`). A name is "either" when at least a fifth of the
  babies given it were of the other sex, and is dealt with both.
- **Undo** the last swipe: thumbs slip.
- **No count.** It never says how many names are left. It's something to do
  in a spare moment and pick up again, and it should feel endless.

## A page of its own

The game is its own page, `/drawer/names`, opened from the Drawer, which says
how many names you both like. The card comes first and fills most of a
phone's screen, with Undo under it. The matches, adding a name and your votes
are below, for when you want them.

## A card

The name, large, and one line from the data: "Top 10 in England & Wales and
Ireland", or "Top 100 in …", where it's in a country's latest list; "Most given
in the 1950s" when it peaked before 1990; otherwise "About 1 in 2,400 babies
now" (each country's last ten full years, averaged), or "Rare now". Dealt from
all names, it also says Girl, Boy or Either.

Swiped like Tinder, with a finger (`SwipeDeck`): the card follows it and
leans, Like or Pass showing on its leading edge; let go past 96 px, or flick
it, and it flies off that way, with the next card already under it. Short of
that, it springs back. The page still scrolls up and down over it. Pass and
Like throw it the same way. With reduced motion, it goes without the flight.

## The store

A deck name gets its `baby_name` row the first time either of you votes on it
(`from_deck`, migration 024), so votes and matches work as they always have.
The other is shown it only once they've voted on it, or once someone liked it.
Undo takes back the vote by name (the phone may not know the row the server
gave it), and a deck name nobody has a vote on any more leaves the game. The
server checks a swiped name is in the deck.

The deck (43 KB compressed) is loaded with the Drawer's page only, never with
the app, and on the server only when a swipe arrives.

## Not now

- **The shortlist's checks** (said aloud with your surname, initials,
  nicknames and meaning), **secret mode** and **a veto each**, from
  `intent.md`, Baby names.
- **Meanings and origins:** good data for them is mostly copyrighted.
- **More countries:** Scotland, New Zealand and Canada's other provinces
  weren't checked. Any that publish full lists would be one more voice in
  the average.
- **Passed names coming round again** later in the pregnancy.
- **Dealing by region:** the regional names, for parents who want New
  Zealand's or Ireland's own, from `common`.
