# Checks

Each file here is a second pass over part of the map: every `covers` phrase
of an entry compared with the sources it cites, by an agent that did not
write it. One item per entry:

```yaml
- id: fever
  file: symptoms.yaml
  verdict: ok | fix | unchecked
  problems:                       # only the phrases that aren't ok
    - covers: "the phrase as written"
      judgement: wrong | unsupported | unchecked
      source_says: "what the page actually says"
      url: https://...
```

A `fix` is applied to the map by hand, then the check stays as the record.

- `symptoms-red-flags.yaml`: the 20 red-flag symptoms. Fixes applied 2026-10-29.
- `batch-1.yaml`: food safety, alcohol, the first medicines. Fixes applied 2026-10-29.
- `batch-2.yaml`: the other medicines and supplements, the common symptoms, heat and contact sports. Fixes applied 2026-10-29.
- `batch-3.yaml`: heat, sleeping position, cat litter, vaccines and travel; models of care, Medicare, booking in and first-trimester screening. Checked and fixes applied 2026-10-29; the Red Nose side-sleeping page refused, so that claim is unchecked.
- `batch-4.yaml`: the tests, vaccines and conditions of care, and labour and birth (when to go, signs, pain relief, induction, assisted birth). Checked and fixes applied 2026-10-29.
- `batch-5.yaml`: labour and birth (caesareans, vitamin K, waters colour); mental health in pregnancy, help lines, partners' mental health and leave, loss and miscarriage, ectopic pregnancy and a worrying screening result. Checked and fixes applied 2026-10-29.
- `batch-6.yaml`: loss, early birth, NICU, birth trauma and family violence; Parental Leave Pay, the tests, reserved days, Family Tax Benefit, Child Care Subsidy, Medicare for the baby, unpaid leave and notice. Checked and fixes applied 2026-10-29.
- `batch-7.yaml`: money-and-work (employer and partner leave, registering the birth, proof of birth, cost, private health waiting periods, childcare waitlists, car seat, cot, second-hand gear) and body-and-baby (sleep, supplements, Braxton Hicks, baby movements, terms and cards). Checked and fixes applied 2026-10-29.

- `items-1.yaml`, `items-2.yaml`, `items-3.yaml`: the 22 items in the app (`content/items/*.md`), each against its own source. Checked and fixes applied to the items 2026-10-29; 17 needed fixes. `booking-in` had no source and now cites one Melbourne hospital (The Royal Women's), so its rules may not hold elsewhere.

- `weeks-1.yaml`, `weeks-2.yaml`: the 42 week notes (`content/weeks/*.md`), against the Pregnancy, Birth and Baby week pages. Checked and fixes applied 2026-10-29; all but weeks 8, 9 and 16 needed fixes. Notes that cited Raising Children (which refuses fetches) now cite PBB. PBB gives no lengths or weights, so the `size` figures in weeks 6, 7, 12, 20 and 28 are unchecked and those notes carry no `checked`.

- `drafts-1.yaml` to `drafts-7.yaml`: the 143 high-stakes priority-1 entries drafted in `content/drafts/` (the 22 others are items), each against the pages it cites. Checked and fixes applied 2026-10-29; 141 carry `checked`. Red Nose and Product Safety Australia refuse automated fetches, so `cot-and-safe-sleep-standards` and `second-hand-baby-gear` are unchecked, and claims that rested only on Red Nose were cut elsewhere.

- `drafts-M01.yaml` to `drafts-M20.yaml` and `drafts-L01.yaml` to `drafts-L08.yaml`: the rest of the map (priority 2 and 3, and priority 1 below high stakes): 694 entries drafted in `content/drafts/` and checked 2026-10-29, Opus or Sonnet drafting and a separate Sonnet checker. 8 entries weren't written for lack of a source. Open questions for review are in `content/drafts/REVIEW.md`.

## Still to check

- `cot-and-safe-sleep-standards` and `second-hand-baby-gear`: their Red Nose and Product Safety Australia claims, read by hand in a browser.

- The `size` figures (length, weight) in the week notes: they need a source that gives them.
- The map's priority 2 and 3 entries, and its medium-stakes ones, as they come up for drafting.
