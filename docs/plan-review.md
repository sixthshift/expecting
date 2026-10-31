# Plan: the content review

Every entry (893) and week note (42) is `draft: true`. The pass so far
(`content/map/checks/`) asked one question: does the cited page say this? It
caught a lot (about 3 in 4 needed fixes), but it can't catch what a clinical
editor would: something missing, a weak source, the same thing said two ways
in two entries, a figure gone stale, or a sentence that's true and useless.
This review asks those questions, and an entry loses `draft` only when it
answers all of them.

## The bar

An entry is reviewed when:

1. **Safe.** Every red flag the Australian guidance gives for it is there, at
   the guidance's urgency, with who to call. Nothing reassures where the
   guidance says to check. (Pregnancy Care Guidelines, RANZCOG, Safer Baby,
   PBB, healthdirect, MotherSafe, FSANZ.)
2. **Right.** Each claim matches its source, and the source is the best
   Australian one for it: a national guideline over a hospital page, a
   current page over an old one.
3. **Consistent.** It says what every other entry on the same fact says:
   the same weeks, the same number, the same urgency. Where sources
   disagree, the entry takes a position and says why, rather than giving two.
4. **Current.** Money, leave and standards are true as at the review date
   (Services Australia indexes on 1 July and 20 March and 20 September), and
   the entry says which year's figures it gives.
5. **Useful.** It answers the `ask` in its first lines; the next step is
   plain (who, by when); nothing is padding. Directive about bookings,
   claims and purchases, never about her body.
6. **Written.** Our voice (`content/README.md`): "you" or the pregnant parent,
   en-AU, metric, no leftover template lines, kind on the hard subjects,
   the partner in it where they have a part.

## Order: by what's at stake

1. **Red flags** (about 120): the 73 symptoms, every entry with a 000 or
   "go to hospital" line, loss (29), mental health (24) and medicines' `avoid`
   and `yes` verdicts. Read closely, every source opened.
2. **Week notes** (42), read in order as one run: continuity, tense (what's
   said at week 20 about weeks 16 to 24), each week's partner part.
3. **Money, work and paperwork** (about 100): every figure and date against
   Services Australia and the Fair Work Ombudsman as at the review date.
4. **The rest of the high and medium stakes**: guides, can-i, decisions,
   moments.
5. **Terms and cards** (254): accuracy and voice, lighter.

## Passes across the whole corpus

Before and alongside the order above, because one entry at a time can't see
them:

- **Lint** (scripted, and kept as tests where it's a rule): leftover lines
  ("Ask your midwife or OB." ends 12 entries), words outside the voice
  (mother, woman, mum), US spellings, every phone number against one table of
  services, symptom headings in urgency order, weeks within 1 to 42.
- **Clusters**: entries on one subject read together (listeria; bleeding;
  lying on your back; movements; alcohol), so they agree and link, and the
  duplicates in `REVIEW.md` get merged or cut to what's theirs alone.
- **Coverage**: walk the Pregnancy Care Guidelines, the Safer Baby Bundle and
  RANZCOG's patient information against the Library and list what's missing.
  First found: there is no symptom entry for the baby moving less, the
  Safer Baby Bundle's main message (`baby-movements` is a moment, so it gets
  no triage or call button).
- **The open calls** in `content/REVIEW.md`: a recommendation for each.
  Clinical ones are decided in review; whether an entry is `private` is
  Jason's.

## How

- Calibrate on the red flags first, by hand, before any agent touches the
  rest: the rubric above gets tested against real entries and sharpened.
- Later tiers can go to agents working to the rubric, a cluster at a time,
  with every verdict change, urgency change and a sample of the rest read
  again before it lands.
- Each entry reviewed gets a record in `content/map/checks/review-*.yaml`
  (what changed and why), its fixes, `reviewed: <date>` and no `draft`.
- Red-flag entries are worth a midwife's read once reviewed: a couple of
  hours of their time over the symptoms.

## Progress

- 2026-10-31: plan written. Lint: phone numbers agree across entries; the
  gendered words are mostly sources' names and statistics, fixed entry by
  entry; "Ask your midwife or OB." ends 12 items and 40 week notes.
- 2026-10-31: the 73 symptoms read whole (`content/map/checks/review-symptoms.yaml`):
  two entries added (`baby-moving-less`, `seizure-in-pregnancy`), fifteen
  with a sign at two urgencies fixed, cord prolapse and heavy bleeding given
  one answer each. Then every source reopened and each finding judged: 74 of 75
  symptoms lose `draft` (partner-perinatal-depression waits on PANDA's pages).
- 2026-10-31: the week notes read in order (`review-weeks.yaml`): leftover
  lines and "the source says" gone, five contradictions between weeks fixed;
  Parental Leave Pay lines left for the money pass. Loss entries read: the
  bleeding line is 1 pad an hour everywhere. Sources not reopened for either.
- 2026-10-31: the week notes', loss entries' sources reopened; medicines
  (50) and mental health guides (18) read and their sources reopened
  (`review-tier1.yaml`). Undrafted: 30 weeks, 29 loss, 35 medicines, 17
  mental health. 194 of 937 reviewed in all.
- 2026-10-31: the money pass (facts read by hand from Services Australia
  and Fair Work), the last 12 week notes, the 15 medicines, and every
  remaining high-stakes cluster: food, tests, labour and birth, body,
  activities, travel, gear, care, special circumstances, partner
  (`review-tier2.yaml`). 412 of 938 reviewed; all 42 week notes.
- Held for a person to read (sites block automated reading), or a decision:
  see `review-tier2.yaml`, "still drafts".
- 2026-10-31: the private entries, then every medium and low entry
  (`review-tier3.yaml`): readers proposed exact edits against the settled
  rules, each read before it was applied. 927 of 938 reviewed; the 11 left
  wait on a person (blocked sites, one missing source) or a decision.
- Next: a person reads the blocked pages (`review-tier3.yaml`, "still
  drafts"); a midwife reads the symptom pages; then re-review on a schedule
  (money every 1 July, guidelines as they're revised).

## Still to do

Noted 2026-10-31, after the full pass. In the order I'd take them.

**Needs a person**

1. ~~Read the pages that block automated reading.~~ Done 2026-10-31, in
   Chrome: all 11 drafts finished, the SA, NT and Tasmania registries
   (60 days, free), MSI's number (1300 003 707) and the patient travel
   schemes (`review-tier3.yaml`).
2. ~~Decide whether `previous-trauma-and-pregnancy` is `private`.~~
   Decided 2026-10-31: not private (`content/REVIEW.md`).
3. A midwife reads the symptom pages.

**Work for Claude**

4. Coverage: walk the national Pregnancy Care Guidelines, the Safer Baby
   Bundle and RANZCOG's patient leaflets against the Library and list
   what's missing (so far found ad hoc: `baby-moving-less`,
   `seizure-in-pregnancy`).
5. ~~Make the review's rules tests.~~ Done 2026-10-31
   (`test/content/review.test.ts`): no template lines, and every phone
   number against one table of services. Symptom headings in urgency order
   were already a parse rule (`src/content/parse.ts`). Not made a test:
   mother/woman/she, which sources' names and statistics use legitimately.
6. Merge the duplicates in `content/REVIEW.md`: `listeria` and
   `listeria-foods`; the three pets entries; the three Braxton Hicks
   entries; leave after a loss (three); `brain-fog` and its card.
7. Replace stale sources lines still rest on. Done 2026-10-31: Better
   Health's 2015 travel and 2017 exercise pages are gone from every entry;
   the 2019–2020 MotherSafe sheets are still MotherSafe's current ones.
   Left: RANZCOG's 2017 screening leaflet; RANZCOG C-Obs 11 (breech) and 36 (prelabour
   rupture), overdue for review since July 2026.
8. Record the review in the entries: many carry `checked: 2026-10-29`
   though edited since. A `reviewed:` date (schema change) would show it
   and drive the re-checks below.
9. ~~Tidy `content/REVIEW.md`.~~ Done 2026-10-31: kombucha, the infant
   sleep standard (with `portable-cot` moved to AS/NZS 2195:2010), MSI and
   the four "couldn't be checked" marked settled. Still open there: the
   other `private` candidates, `cooking-with-alcohol`, the "no source says"
   entries, and the duplicates (item 6).
10. Run `bun run e2e`: 927 entries just lost `draft`.

**Ongoing**

- Money: every 1 July, and the 20 March and 20 September indexations.
- Clinical: when a national guideline is revised.
- Week notes' `size` figures (weeks 6, 7, 12, 20, 28) still need a source.

The settled rules (urgency, bleeding before and after the birth, when to
go in, retinol, vitamin D, trimesters…) are in the review records; the
brief the readers used is worth recreating from them for any new pass.
