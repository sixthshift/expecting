# For the review pass

Calls the drafters and checkers couldn't make from the sources, collected as
they came up. Each check record (`content/map/checks/drafts-*.yaml`) has the
detail.

## Verdicts and framing

- `kombucha-and-fermented-drinks`: verdict `avoid`, but no source says to
  avoid shop-bought kombucha outright (PBB: no safe level of alcohol; NSW:
  higher-risk drinks; MotherSafe: commercial ones carry traces; only home-brew
  is flagged avoid). Keep, or change to `limit`/`ask`?
- `cooking-with-alcohol`: no Australian page covers cooked dishes; the entry
  rests on MotherSafe's general alcohol sheet. Merge into `alcohol`?
- Entries whose sources don't address pregnancy, framed honestly as "no
  source says": `probiotics`, `sleeping-on-your-stomach`, `electric-blankets`,
  `loud-noise`, `airport-scanners`, `computer-screens`, `hemp-seeds`,
  `artificial-sweeteners`, `rock-climbing`, `surfing-and-water-sports`. Keep,
  or drop the weakest (e.g. `loud-noise`)?
- `brain-fog`: changed from symptom to card (PBB gives one sentence).

- `anaemia-in-pregnancy`: PBB's haemoglobin table gives "mg/dL" (looks like
  a unit error), so no thresholds are given.

- `card-one-in-ten-assisted`: not written; its only source is a RANZCOG
  poster whose text can't be read, and no other page gives the rate.

- `term-nad`, `card-extra-saliva`, and (unless L07's checker finds a source)
  `term-nuchal-cord`, `term-fifths`, `term-fhr`, `term-fundal-placenta`: not
  written; no official page defines or covers them.
- `chemical-pregnancy`: not written; no official page we could load defines
  the term.

- `bassinet`: the map says a mandatory bassinet safety standard started on
  19 January 2026, but PBB (reviewed March 2026) still says there are no
  bassinet standards, and the ACCC / Product Safety Australia pages block
  automated reading. The draft gives PBB's line only. Check the regulator's
  page by hand and update. `pram` and `portable-cot` are also PBB-only for
  the same reason.

- `unplanned-pregnancy`: two phone details couldn't be confirmed on the
  organisation's own site (both block automated reading). MSI Australia: PBB
  gives 1300 003 707 and 1300 405 568; the draft uses 1300 003 707, the one
  healthdirect lists. Children by Choice (1800 177 725): PBB says nationwide
  on one page and Queensland only on another; both are credited.

- `stillborn-baby-payment`: Services Australia gives two income-test
  figures: $77,177 on its "Deciding between Parental Leave Pay and Stillborn
  Baby Payment" page, $79,955 on its "Who can get it" (1 July 2026) and "How
  much" (4 Sept 2026) pages. Both are credited; confirm which applies.

## Handling rules to carry into the app

- Family violence and reproductive coercion entries (`card-asked-about-safety`,
  `reproductive-coercion`, `domestic-violence-in-pregnancy`): the map notes
  say these are never saved to the shared space, because the app is shared
  between both parents. The drafts have no field for that; it has to be built
  when the new types are wired in.

## Sources that disagree (kept side by side, each credited)

Worth a clinician's eye first: `cord-prolapse` and `waters-breaking-early`
give two different positions to wait in for the ambulance, because two PBB
pages differ (knees to chest, head down; or hands and knees, bottom up). Both
entries put the 000 call first and credit each position.

Not decisions, but worth reading together: Better Health's "scuba reasonably
safe to 18 m" (in `scuba-diving` and `swimming`) against everyone else's
avoid; cycling (PBB's own pages contradict); vitamin D; folic acid duration;
lying on your back (16 vs 28 weeks); exercise amounts; nasal sprays (3 vs 5
days); ginger; doxylamine for sleep; COVID vaccine (Handbook "not routinely
recommended, can consider from 20 weeks" vs PBB "recommended if never
vaccinated"); serum screening window (14–20 vs 15–20 weeks); hepatitis C
(routine vs at-risk only).

## Couldn't be checked

- `cot-and-safe-sleep-standards`, `second-hand-baby-gear`: Red Nose and
  Product Safety Australia block automated reading; read by hand.
- `term-gravida-para`: no readable page defines gravida or the G2P1
  shorthand (a Queensland Health PDF reportedly does); the entry explains
  parity only and isn't marked checked.
- `term-golden-hour`: no source uses the phrase; its skin-to-skin facts are
  sourced, but the name isn't, so it isn't marked checked.
- `farm-animals-and-lambing`: verdict `ask`, because no readable Australian
  page tells pregnant people to stay away from birthing animals. A Queensland
  Health (Darling Downs) news item, "Darling Downs and South West communities
  reminded of the risk of Q fever", reportedly does, but blocks automated
  reading. If it says so, change the verdict to `avoid` and cite it.
