# For the review pass

Calls the drafters and checkers couldn't make from the sources, collected as
they came up. Each check record (`content/map/checks/drafts-*.yaml`) has the
detail.

## Verdicts and framing

- Settled 2026-10-31: `avoid`, shop-bought included (NSW Food Authority: "do not drink, high risk"; `map/checks/review-tier3.yaml`).
  `kombucha-and-fermented-drinks`: verdict `avoid`, but no source says to
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

- Settled 2026-10-31: the standard is real, from 19 January 2026, and covers bassinets and folding cots sold new; `bassinet`, `portable-cot` and the cot entries now cite the ACCC, and `pram` its own mandatory standard (`map/checks/review-tier3.yaml`).
  `bassinet`: the map says a mandatory bassinet safety standard started on
  19 January 2026, but PBB (reviewed March 2026) still says there are no
  bassinet standards, and the ACCC / Product Safety Australia pages block
  automated reading. The draft gives PBB's line only. Check the regulator's
  page by hand and update. `pram` and `portable-cot` are also PBB-only for
  the same reason.

- Settled 2026-10-31: MSI's own booking page gives 1300 003 707.
  `unplanned-pregnancy`: two phone details couldn't be confirmed on the
  organisation's own site (both block automated reading). MSI Australia: PBB
  gives 1300 003 707 and 1300 405 568; the draft uses 1300 003 707, the one
  healthdirect lists. Children by Choice (1800 177 725): PBB says nationwide
  on one page and Queensland only on another; both are credited.

- Settled 2026-10-31: $77,177 (Services Australia, updated 1 July 2026; no current page gives $79,955).
  `stillborn-baby-payment`: Services Australia gave two income-test
  figures: $77,177 on its "Deciding between Parental Leave Pay and Stillborn
  Baby Payment" page, $79,955 on its "Who can get it" (1 July 2026) and "How
  much" (4 Sept 2026) pages. Both are credited; confirm which applies.

## Handling rules to carry into the app

- Family violence and reproductive coercion entries (`card-asked-about-safety`,
  `reproductive-coercion`, `domestic-violence-in-pregnancy`): the map notes
  say these are never saved to the shared space, because the app is shared
  between both parents. Built: they are `private: true` (see
  `docs/architecture.md`, Content).
- **Candidates for `private`**, not marked; decide in review:
  - `previous-trauma-and-pregnancy`: past abuse and sexual assault (its
    aliases say "sexual assault survivor", "childhood abuse"). Strongest
    candidate: reading it may disclose something to the other parent.
    **Decided 2026-10-31: stays open.** The risk is disclosure, not danger
    from the partner; reading leaves no trace, it is `discreet`, and private
    would hide it from the birth-fear and birth-trauma entries that lead to it.
  - `relationship-breakdown`: separating during the pregnancy, and going to
    court "if the child may be at risk of abuse or violence". Someone
    planning to leave may not want it seen.
  - `arguments-and-stress`: the relationship under strain; points to
    1800RESPECT. Probably stays open (it's written for both of you), but its
    family violence paragraph links to the private entry.
  - `unplanned-pregnancy`: the decision to continue or not, including
    abortion; read alongside `reproductive-coercion`, it may be one someone
    can't be seen reading.
  - Mention family violence in passing and are meant for both of you, so
    likely stay open: `booking-visit` (the screen that asks about it),
    `partner-learning-the-signs`, `fall-or-blow-to-the-belly`,
    `young-parent` ("not safe at home"), `parental-leave-pay-work-test`
    (the work test's exemptions).
  - A private entry can't have tasks, a `decide_by`, a `when`, an extra or an
    `{% ask %}`; none of the first four has any, so marking one is one line.

## Duplicates (not merged)

Pairs that cover the same ground. Each is kept for now; pick one to keep, or
cut one down to what the other doesn't say, and link them with `related`.

- Draft and item, same subject: `listeria-foods` and `listeria` (same
  title), `pets-and-the-baby` and `pets` (same title),
  `staying-active-in-pregnancy` and `staying-active`, `second-hand-baby-gear`
  and `second-hand-gear`, `cord-blood-banking` and `cord-blood`, `alcohol`
  and `caffeine-and-alcohol`.
- Draft and an extra's item, for everyone against only those who turn the
  extra on: `doulas` and `doula` (extra `doula`), `when-to-tell-people` and
  `telling-people` (extra `announcing`). The drafts were `doula` and
  `telling-people` and were renamed so the ids don't collide; nothing pointed
  at them yet.
- `pets-and-health` (can-i, was the draft `pets`, renamed for the same
  reason), `pets-and-the-baby` (guide) and the item `pets`: three on pets.
- Drafts with each other: `braxton-hicks` (symptom) and
  `braxton-hicks-contractions` (guide), with `term-braxton-hicks` as well;
  `preterm-birth` and `when-the-baby-comes-early`; `ecv` and `breech`.

## Sources that disagree (kept side by side, each credited)

Settled 2026-10-31 (`map/checks/review-symptoms.yaml`): one position, bottom higher than head.
Was: `cord-prolapse` and `waters-breaking-early`
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

Settled 2026-10-31: all four, read by hand in a browser (`map/checks/review-tier3.yaml`). The cot entries cite Red Nose and the ACCC; `term-gravida-para` cites Queensland Health's Pregnancy Health Record for gravida; `term-golden-hour` says plainly that the name isn't a clinical term, and its facts are checked; `farm-animals-and-lambing` is `avoid`, citing Darling Downs Health.

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
