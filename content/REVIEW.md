# Reviewing content

What an entry has to be before it ships, the calls that hold for every
entry, and what is still open. Every entry and week note meets this bar; a
new or changed one must too. The records behind each entry's review, with the rules for urgency,
bleeding before and after the birth, when to go in, retinol, vitamin D and
trimesters, were `content/map/checks/`: removed with the Library's map on
2026-11-05, and kept in git history. How an
entry is written is [`README.md`](README.md).

## The bar

An entry is reviewed when it is:

1. **Safe.** Every red flag the Australian guidance gives for it is there,
   at the guidance's urgency, with who to call. Nothing reassures where the
   guidance says to check. (Pregnancy Care Guidelines, RANZCOG, Safer Baby,
   PBB, healthdirect, MotherSafe, FSANZ.)
2. **Right.** Each claim matches its source, and the source is the best
   Australian one: a national guideline over a hospital page, a current page
   over an old one.
3. **Consistent.** It says what every other entry on the same fact says: the
   same weeks, number and urgency. Where sources disagree, it takes a
   position and says why, rather than giving two.
4. **Current.** Money, leave and standards are true as at the review date,
   and the entry says which year's figures it gives.
5. **Useful.** It answers its `ask` in the first lines; the next step is
   plain (who, by when); nothing is padding. Directive about bookings,
   claims and purchases, never about her body.
6. **Written** in our voice ([`README.md`](README.md)): "you" or the
   pregnant parent, en-AU, metric, kind on the hard subjects, the partner in
   it where they have a part.

Two rules are tests (`test/content/review.test.ts`): no lines left over
from the drafting template, and every phone number the one a single table
gives its service. Not a test: mother, woman and she, which sources' names
and statistics use legitimately.

## Re-checking

- **Money:** every 1 July, and Services Australia's 20 March and 20
  September indexations.
- **Clinical:** when a national guideline is revised. The guidelines' iron
  and omega-3 recommendations are drafts, said as drafts; re-check when the
  NHMRC approves them. RANZCOG's 2017 screening leaflet and C-Obs 11 and 36
  are its current documents; re-check when revised.
- **A new pass:** calibrate on the red flags by hand first, then work a
  cluster at a time (entries on one subject read together, so they agree
  and link), with every verdict or urgency change read again before it
  lands.

## Calls to follow

- **Private is for danger from the other parent:** family violence and
  reproductive coercion only. Reading leaves no trace anyway, so entries
  that may disclose something (`previous-trauma-and-pregnancy`,
  `relationship-breakdown`, `arguments-and-stress`, `unplanned-pregnancy`)
  are `discreet`, not private: private would also hide them from the entries
  that lead to them.
- **No id is deleted to merge duplicates.** Saved questions and papers keep
  an entry's id, so each of a pair gets one job and they link both ways
  (`listeria`, `pets` and `staying-active` cut to the extra's part and
  pointing to the full entry; `braxton-hicks-contractions` without weeks, the
  symptom the one on the timeline; `card-brain-fog` only that pregnancy brain
  is real).
- **"No source says" is an answer.** Entries whose sources don't address
  pregnancy (`probiotics`, `sleeping-on-your-stomach`, `electric-blankets`,
  `loud-noise`, `hemp-seeds`, `artificial-sweeteners`, `rock-climbing`,
  `surfing-and-water-sports`) are kept and say so plainly, unless a source
  settles them (`computer-screens` and `airport-scanners`: `yes`, from
  ARPANSA).
- `kombucha-and-fermented-drinks`: `avoid`, shop-bought included (NSW Food
  Authority).
- `cooking-with-alcohol`: its own entry, verdict `ask`, linked to `alcohol`.
- `cord-prolapse` and `waters-breaking-early`: one position to wait in,
  bottom higher than head.
- Vitamin D: no routine test or supplement; hepatitis C: offered to everyone
  at the first visit (national guidelines, August 2026).
- `stillborn-baby-payment`: the income test is $77,177 (Services Australia,
  1 July 2026).
- `bassinet`, `portable-cot` and the cot entries cite the ACCC's mandatory
  standard (from 19 January 2026); `pram` its own.
- `farm-animals-and-lambing`: `avoid` (Darling Downs Health).
- `term-golden-hour` says the name isn't a clinical term;
  `term-gravida-para` cites Queensland Health's Pregnancy Health Record.
- `brain-fog` is a card, not a symptom (PBB gives one sentence).
- `anaemia-in-pregnancy` gives no thresholds: PBB's table has a unit error.
- The weeks' sizes: what it's like (`size.like`) is PBB's "How big is your
  baby?" for weeks 4 to 40, as it has them (its grouped weeks each get the
  group's: 22–24 an eggplant, 25–28 a papaya, 29–32 a pumpkin, 33–36 a
  honeydew melon, 37–40 a watermelon; "naval orange" spelt navel). Weeks 1
  to 3, 41 and 42 have none. The length and weight, weeks 8 to 41, are
  BabyCenter Australia's average fetal length and weight chart, every week
  from the one table (Jason's call: no Australian health source has one;
  Better Health gives ten weeks and Raising Children refuses automated
  reads). A commercial site, below the bar, accepted for a line that's for
  fun. Its length is crown to rump to week 13, crown to heel from 14 (`to:
  bottom`, `to: heel`), so the jump from 13 to 14 is the measure, not the
  baby.

## Settled without an entry of their own

Eight planned entries once lacked a source; searched again 2026-11-05 and
closed:

- Written: `chemical-pregnancy` (Pink Elephants for the definition, an
  Australian charity a step below the usual bar, the only Australian page
  that defines it), `term-fundal-placenta`, and from the glossary of
  Queensland Health's Pregnancy Health Record, `term-fhr`, `term-fifths`
  and `term-nad`.
- Merged: `card-one-in-ten-assisted` into `assisted-birth` (it already gives
  the figure); `card-extra-saliva` into `severe-vomiting`, the only official
  word on excess saliva being PBB's on hyperemesis.
- Dropped: `term-nuchal-cord`. No Australian page for parents says what a
  cord around the neck means or what happens; write it only if one appears.
  Unsourced too, and left out: a threshold for engaged ("2/5 or less"),
  the IVF side of a chemical pregnancy, and that extra saliva is common or
  eases after the first trimester.

## Worth reading together

Sources that differ, each entry taking a position: scuba (Better Health's
"reasonably safe to 18 m" against everyone else's avoid), cycling, folic
acid duration, lying on your back (use 16 weeks), exercise amounts (use 2.5
to 5 hours a week), nasal sprays (3 or 5 days), ginger, doxylamine
for sleep, the COVID vaccine, the serum screening window (14–20 or 15–20
weeks).

## Open

- Tailor It's time's entries by its two questions: `home-birth` and
  `birth-centre` by `birthPlace`, `breech-birth` by `presentation`
  ([its-time.md](../docs/product/its-time.md#not-yet)).
- RANZCOG's "Exercise During Pregnancy" leaflet could join the exercise
  entries' sources.
