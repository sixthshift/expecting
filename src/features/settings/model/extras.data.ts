// The extras: the parts of Expecting you choose, for fun or because
// it suits them. Off until someone turns one on: unlike a question in
// facts.data.ts, an extra nobody has chosen shows nothing. Turned on, its items
// (`extra: <id>` in their frontmatter) appear everywhere items do: the
// Library, the Timeline, the Planner and This week. Turned off, they're gone.
//
// Each can be switched in settings; a few are offered in onboarding; and, if
// nobody has decided by its `offer` week, This week suggests it once.
//
//   id          a stable slug: items name it, and your choice is kept under it
//   name        what it's called, on its switch
//   pitch       one line: what turning it on gets you
//   group       where settings shows it: EXTRA_GROUPS in extras.ts
//   offer       the week This week suggests it, if nobody has decided
//   onboarding  also offered in onboarding (a few, so it stays short)
//   when        only when your answers fit, as an item's `when`
//   tool        what it brings beyond its items, if anything: a tool, and where,
//               as it reads after "And"
//
// extras.ts checks this list as it loads.

import type { ExtraInput } from "./extras";

export const EXTRA_LIST = [
  {
    id: "food-safety",
    name: "Food and drink",
    pitch: "What the food authorities say about eating and drinking while pregnant, and why.",
    group: "ready",
    offer: 4,
    onboarding: true,
  },
  {
    id: "announcing",
    name: "Telling people",
    pitch: "When and how to share the news, and who to tell first.",
    group: "people",
    offer: 8,
    onboarding: true,
  },
  {
    id: "baby-budget",
    name: "Baby budget",
    pitch: "What a baby costs in the first year, and a budget for the things you'll buy.",
    group: "money",
    offer: 10,
    onboarding: true,
  },
  {
    id: "gender-reveal",
    name: "Gender reveal",
    pitch: "Finding out the sex, and planning a reveal if you'd like one.",
    group: "celebrate",
    offer: 11,
    onboarding: true,
  },
  {
    id: "grandparents",
    name: "Grandparents",
    pitch: "Talking with the grandparents-to-be about the help you'd like, and the role they'll have.",
    group: "people",
    offer: 12,
  },
  {
    id: "exercise",
    name: "Staying active",
    pitch: "Pregnancy exercise classes and what the guidelines say about staying active.",
    group: "you-two",
    offer: 12,
  },
  {
    id: "babymoon",
    name: "Babymoon",
    pitch: "A last trip as two: when to go, flying while pregnant, and the insurance.",
    group: "you-two",
    offer: 14,
    onboarding: true,
  },
  {
    id: "doula",
    name: "A doula",
    pitch: "What a doula does, what one costs, and when to find one.",
    group: "ready",
    offer: 14,
  },
  {
    id: "choosing-names",
    name: "Choosing a name",
    pitch: "Shortlisting names, the rules for registering one, and testing it out loud.",
    group: "celebrate",
    tool: "the names game, in the Drawer",
    offer: 16,
    onboarding: true,
  },
  {
    id: "partner-prep",
    name: "Partner prep",
    pitch: "Classes, books and the practical jobs for the partner before the birth.",
    group: "you-two",
    offer: 16,
  },
  {
    id: "nursery",
    name: "The nursery",
    pitch: "Setting up where the baby will sleep: the cot, the room, and safe sleep.",
    group: "ready",
    offer: 20,
    onboarding: true,
  },
  {
    id: "cord-blood",
    name: "Cord blood",
    pitch: "Banking or donating the cord blood: what it is, what it costs, and the deadlines.",
    group: "ready",
    offer: 20,
  },
  {
    id: "traditions",
    name: "Traditions",
    pitch: "Naming ceremonies, baptisms, the confinement month and other customs, and what they need planned.",
    group: "celebrate",
    offer: 20,
  },
  {
    id: "siblings",
    name: "Older siblings",
    pitch: "Getting an older child ready for the baby, and a gift from the baby.",
    group: "people",
    offer: 20,
    when: { firstBaby: "no" },
  },
  {
    id: "date-nights",
    name: "Date nights",
    pitch: "A few nights out as two before the baby arrives.",
    group: "you-two",
    offer: 20,
  },
  {
    id: "sleep-setup",
    name: "Sleeping well",
    pitch: "Pillows, positions and a bed set-up for the later months.",
    group: "you-two",
    offer: 20,
  },
  {
    id: "second-hand",
    name: "Second-hand gear",
    pitch: "What's fine to buy used, and what isn't: car seats, cots and mattresses.",
    group: "money",
    offer: 20,
    onboarding: true,
  },
  {
    id: "baby-shower",
    name: "Baby shower",
    pitch: "Planning a shower: who hosts, when, the invites and a gift registry.",
    group: "celebrate",
    offer: 20,
    onboarding: true,
  },
  {
    id: "freebies",
    name: "Freebies and samples",
    pitch: "The free packs, samples and government help worth signing up for.",
    group: "money",
    offer: 24,
  },
  {
    id: "maternity-photos",
    name: "Maternity photos",
    pitch: "Booking a bump photo shoot at the right time.",
    group: "celebrate",
    offer: 24,
    onboarding: true,
  },
  {
    id: "keepsakes",
    name: "Keepsakes",
    pitch: "A belly cast, hand and foot prints, a letter to the baby, a time capsule.",
    group: "celebrate",
    offer: 28,
  },
  {
    id: "push-present",
    name: "Push present",
    pitch: "A gift for the birth parent, if you'd like one: the idea, and when to sort it out.",
    group: "celebrate",
    offer: 28,
  },
  {
    id: "baby-gp",
    name: "The baby's doctor",
    pitch: "Choosing a GP or paediatrician for the baby before the birth.",
    group: "ready",
    offer: 30,
  },
  {
    id: "help-network",
    name: "Lining up help",
    pitch: "Who can help with what in the first weeks, from a meal train to the school run, and asking early.",
    group: "people",
    offer: 30,
  },
  {
    id: "thank-you-notes",
    name: "Thank-you notes",
    pitch: "Keeping track of gifts and thanking people without the stress.",
    group: "people",
    offer: 30,
  },
  {
    id: "pets",
    name: "Pets and the baby",
    pitch: "Getting the dog or cat ready for a baby in the house.",
    group: "people",
    offer: 30,
  },
  {
    id: "freezer-meals",
    name: "Freezer meals",
    pitch: "Cooking ahead so the first weeks home are fed.",
    group: "ready",
    offer: 32,
  },
  {
    id: "birth-playlist",
    name: "Birth playlist",
    pitch: "Music and the small comforts for labour, ready in the bag.",
    group: "ready",
    offer: 32,
  },
  {
    id: "visitors",
    name: "Visitors",
    pitch: "Who visits in hospital and the first weeks, and how to say not yet.",
    group: "people",
    offer: 32,
  },
  {
    id: "birth-announcement",
    name: "Birth announcement",
    pitch: "Who hears first, and when and how to share the news of the birth.",
    group: "celebrate",
    offer: 34,
  },
] as const satisfies readonly ExtraInput[];
