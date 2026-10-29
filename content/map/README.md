# The Library's map

The table of contents for everything Expecting's Library will hold: every entry
it should have, before any is written. One file per area, `<area>.yaml`, a list
of entries. Nothing here is shown in the app; it is the plan the content is
written from, and the measure of what's missing.

Entries are written in our own words from open, citable sources. Books (Up the
Duff, What to Expect, Birth with Confidence, Expecting Better) are a checklist
of what a complete reference covers, never a source of text.

## An entry

```yaml
- id: soft-cheese                 # a stable slug: lower-case words joined by hyphens, unique across every file
  title: Soft cheese              # what the entry is called
  type: can-i                     # see Types
  topic: food                     # see Topics
  ask: Can I eat brie or camembert?   # how a person would actually ask, in their words
  aliases: [brie, camembert, feta, blue cheese]   # what people search for: brands, slang, other spellings
  weeks: [1, 42]                  # optional: the weeks it matters, [from, to] or one week
  who: carrying                   # optional: carrying, partner, together; omit for everyone
  priority: 1                     # 1: almost everyone asks or needs it; 2: many; 3: some, or specific circumstances
  stakes: high                    # what a wrong answer costs: high (health, safety, a missed deadline that costs), medium, low
  covers: [listeria, cooked until steaming hot]   # the points the entry must make, as short phrases (not prose)
  sources:                        # where the facts come from; every URL loaded and read
    - title: Food Standards Australia New Zealand — Listeria and food safety in pregnancy
      url: https://www.foodstandards.gov.au/...
  related: [deli-meats, listeria]   # ids of entries it should link to
  exists: content/items/rsv-vaccine.md   # only when an item already covers it
  notes: ...                      # optional: anything the writer must know (contested advice, state differences, sensitivities)
```

## Types

- `can-i`: a thing, a verdict (yes, limit, avoid, ask) and why. Food, drink, medicines, activities, products.
- `symptom`: is this normal? What's usual, when to mention it, when to call. Red flags said plainly.
- `moment`: something that happens in a window of weeks, often with tasks (a scan, a vaccine, a claim). The kind the app already has.
- `guide`: a longer read on a subject (labour, feeding, pain relief).
- `card`: "nobody tells you": a headline and a paragraph.
- `decision`: a choice with options and trade-offs, and a decide-by week (public or private, screening, pain relief).
- `term`: a glossary entry: a word the midwife uses (vernix, anti-D, effacement, 36+2).
- `payment`: money and paperwork from government or an employer (Parental Leave Pay, Medicare, leave notice).

## Topics

food, drink, medicines, activities, body, baby, tests, appointments, care, labour, birth, after-the-birth, feeding, mental-health, relationships, loss, money, work, paperwork, gear, partner, travel, special-circumstances

## Sources, in order of preference

Australian government and health services: Pregnancy, Birth and Baby (pregnancybirthbaby.org.au), healthdirect, Food Standards Australia New Zealand, the TGA, Services Australia, Fair Work, the state health departments (NSW Health, Health.vic, Queensland Health), the Australian Immunisation Handbook. Then the professional bodies and teaching hospitals: RANZCOG, the Royal Women's Hospital, the Royal Hospital for Women, Mater, KEMH, the Australian Breastfeeding Association, PANDA, Red Nose, Sands. Raising Children Network refuses automated fetches; cite it only if a page actually loads.
