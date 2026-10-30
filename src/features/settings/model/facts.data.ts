// What Expecting asks, so it can say what to do and when. Each answer becomes a
// fact, shared by both of you, kept with who answered and when, and
// changeable in settings. The rules are in facts.ts, which checks
// this list as it loads.
//
// Items are written against these: `when: { cover: "no" }` in an item's
// frontmatter, `{% if equals($cover, "yes") %}` in its body. A question about
// each of you is named with whose: `when: { work.partner: [employee] }`,
// `$work.partner`. The tests check every such reference names a question and
// an answer here, so renaming an answer fails every item that depends on it.
//
// A question nobody has answered never hides anything, and neither does
// `unsure`, so nothing is written against it.
//
// `asked: "onboarding"` puts a question in the first-run questions, in this
// order; every question is also in settings. Ask there what you may
// already know. `week` is when This week asks it: again, if onboarding asked it
// and it was skipped or answered `unsure`; for the first time, if it only makes
// sense once the answer exists. A question's own `when` asks it only if the
// answers so far fit; in a question about each of you, a bare `work` is the
// same person's.
//
// `group` is where settings shows it (GROUPS in facts.ts, in settings' order).
//
// `type: "date"` asks for a date instead of a choice; `each: true` asks it
// once for each of you, with `{name}` in the question. Each question earns its
// place by changing a task; the comment above it says which.

import type { QuestionInput } from "./facts";

export const QUESTION_LIST = [
  // Antenatal classes, and how much a first-timer is told.
  {
    id: "firstBaby",
    group: "pregnancy",
    ask: "Is this your first baby?",
    asked: "onboarding",
    week: 8,
    answers: { yes: "Yes", no: "No" },
  },

  // Whether to try for a vaginal birth this time, and the care that goes with it.
  {
    id: "previousCaesarean",
    group: "pregnancy",
    ask: "Was a previous baby born by caesarean?",
    asked: "onboarding",
    week: 8,
    when: { firstBaby: "no" },
    answers: { yes: "Yes", no: "No" },
  },

  // Earlier and extra scans, earlier leave, two of everything.
  {
    id: "babies",
    group: "pregnancy",
    ask: "How many babies are you expecting?",
    asked: "onboarding",
    week: 12,
    answers: { one: "One", twins: "Twins", more: "More than two", unsure: "We don't know yet" },
  },

  // Who to book, the referral, and what the appointments cost.
  {
    id: "care",
    group: "care",
    ask: "Who's looking after the pregnancy?",
    asked: "onboarding",
    week: 8,
    answers: {
      public: "The public hospital's clinic",
      mgp: "A midwifery group practice (the same midwives throughout)",
      shared: "Shared care with our GP",
      obstetrician: "A private obstetrician",
      "private-midwife": "A private midwife",
      unsure: "Not sure yet",
    },
  },

  // Booking in with the hospital or birth centre.
  {
    id: "booked",
    group: "care",
    ask: "Have you booked in with your hospital or birth centre?",
    asked: "onboarding",
    week: 12,
    answers: { yes: "Yes", "not-yet": "Not yet" },
  },

  // The fund's waiting period, the obstetrician's fees and the gap.
  {
    id: "cover",
    group: "care",
    ask: "Do you have private hospital cover that includes pregnancy and birth?",
    asked: "onboarding",
    week: 8,
    answers: { yes: "Yes", no: "No, we're going public", unsure: "Not sure yet" },
  },

  // A planned caesarean: its date, the pre-op appointments, the longer stay, and
  // no driving for some weeks after.
  {
    id: "birth",
    group: "care",
    ask: "How are you planning to give birth?",
    asked: "onboarding",
    week: 32,
    answers: { vaginal: "A vaginal birth", caesarean: "A planned caesarean", unsure: "Not sure yet" },
  },

  // Notice to an employer, or the self-employed's own leave and claim; for the
  // partner, Partner Pay.
  {
    id: "work",
    group: "work",
    ask: "Does {name} work?",
    each: true,
    asked: "onboarding",
    week: 16,
    answers: { employee: "Yes, for an employer", "self-employed": "Yes, self-employed", "not-working": "Not at the moment" },
  },

  // Registering the birth, and the state's own services.
  {
    id: "state",
    group: "care",
    ask: "Which state or territory will the baby be born in?",
    asked: "onboarding",
    week: 20,
    answers: {
      act: "ACT",
      nsw: "New South Wales",
      nt: "Northern Territory",
      qld: "Queensland",
      sa: "South Australia",
      tas: "Tasmania",
      vic: "Victoria",
      wa: "Western Australia",
    },
  },

  // The first blood tests are usually back: anti-D.
  {
    id: "rhd",
    group: "pregnancy",
    ask: "Is the pregnant parent's blood group RhD negative?",
    week: 12,
    answers: { negative: "Yes, RhD negative", positive: "No, RhD positive", unsure: "We don't know yet" },
  },

  // Childcare waiting lists.
  {
    id: "childcare",
    group: "after",
    ask: "Will you want childcare in the baby's first two years?",
    week: 12,
    answers: { yes: "Yes", no: "No", unsure: "Not sure yet" },
  },

  // Employer-paid leave first or alongside, and when to claim the government's.
  {
    id: "paidLeave",
    group: "work",
    ask: "Does {name}'s employer pay parental leave?",
    each: true,
    week: 20,
    when: { work: "employee" },
    answers: { yes: "Yes", no: "No", unsure: "Not sure yet" },
  },

  // The day leave starts: notice to an employer is due 10 weeks before it, and
  // confirming the dates 4 weeks before.
  {
    id: "leaveStart",
    group: "work",
    ask: "When does {name}'s parental leave start?",
    each: true,
    type: "date",
    week: 20,
    when: { work: ["employee", "self-employed"] },
  },
] as const satisfies readonly QuestionInput[];
