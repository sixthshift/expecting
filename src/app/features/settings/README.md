# Settings

Everything Expecting has been told, readable at a glance and changeable in
place, at `/settings`. Settings also owns the questions and the extras
wherever they're asked: This week's `AskNow` and `OfferExtra`, and
onboarding's steps, draw them with its parts. What the extras do and why is
[`docs/product/extras.md`](../../../../docs/product/extras.md); how answers
tailor is `docs/architecture.md`, Tailoring.

## Words

| Word | Means | Where |
|---|---|---|
| **question** | What Expecting asks: "Does Sam work?" One a row in Settings (`QuestionRow`), a card on This week (`AskNow`), a screen in onboarding. `FactQuestion` is its type. | `model/facts.data.ts` |
| **ask** | One question as asked of one of you: `work` of the partner is `work.partner`, its **key** (`Ask`). A question asked once has its id as its key. `?ask=<key>` opens Settings at it. | `model/facts.ts` |
| **answer** | What's kept: a row with the value, who and when; the latest counts. A skip or a clear is an answer with no value. `useAnswersQuery`. | `src/lib/facts.ts` |
| **fact** | Only the rules over the answers: `facts.ts` (checking a question, a `when`) and `src/lib/facts.ts` (`factsOf`, what the answers come to; `questionsDue`). Not a name for a question or an answer. | `model/facts.ts` |
| **settled** | Answered, and not with something asked again (`unsure`, `askAgain`). | `isSettled` |
| **extra** | A part of Expecting you choose, off until one of you turns it on; its **choice** is on or off, who, when. `?ask=extra:<id>` opens Settings at it. | `model/extras.data.ts` |
| **quiet** | Something has happened (a loss, hard news): Expecting goes quiet, and the progress banner isn't drawn. The switch is the quiet feature's; Settings has its section, `?ask=quiet`. | `src/lib/quiet.ts` |

## From the store to the screen

```
queries (settings, answers, extras, people)
  → SettingsPageProvider    the row open; asks, latest, answered, next   contexts/
  → SettingsSections (on a desktop SettingsNav beside them)             components/sections, desktop/
  → QuestionGroup           a group's questions, once and of each        components/questions/
  → QuestionRow             one ask: its answer, who, when it's asked    components/questions/
  → AnswerField             a date picker, or the answers                components/answer/
```

A part reads what only it needs itself (a row's answer in words, what it
decides, who turned an extra on); the context holds what several agree on.

## Where things are

```
pages/          SettingsPage: the sections, in order; on a desktop the nav beside them (useLayout)
desktop/        components/SettingsNav, the sections down the side, each with how many to answer
routes/         settings (/settings, ?ask=)
contexts/       SettingsPageContext: the row open, goTo, the ?ask= scroll, the questions as things stand
model/          facts.data.ts and extras.data.ts (the lists), facts.ts and extras.ts (their rules):
                pure, so lib/ and content/ may import them
components/
  sections/     SettingsSections, every section in one column, which both layouts draw
  progress/     AnswersProgress, how many are answered and the next
  questions/    QuestionGroup, QuestionRow
  dueDate/      DueDateRow, and DueDateForm (onboarding's too)
  colour/       BabyRow, and ColourChoice
  extras/       ExtrasList, every extra with its switch
  account/      Account, and its parts: Invite, Reset, CodeLink, ChangePassword, LogOut
  appearance/   light or dark, on this phone
  version/      the version, and what's new
  settingRow/   SettingRow (a line that opens in place) and SettingList
  answer/       AnswerField and AnswerInput: the way to answer, wherever it's asked
  extraPitch/   ExtraPitch: an extra's pitch and tool, wherever it's offered
  askNow/       AskNow, This week's questions
  offerExtra/   OfferExtra, This week's offer
```

## Adding a question

1. Add it to `QUESTION_LIST` in `model/facts.data.ts`: an `id` (one camelCase
   word), the `ask`, its `group`, and its `answers` (or `type: "date"`);
   `each: true` to ask it of each of you (`{name}` in the `ask`), `asked:
   "onboarding"` to ask it in onboarding too, a `week` for This week to ask
   it, a `when` to wait on another answer. The comment above it says which
   task it changes.
2. Write against it in content (`when: { cover: "no" }`, `$cover`).

Nothing else names a question: Settings, This week and onboarding draw it by
itself, and `bun run test` checks every reference to it.

## Adding an extra

1. Add it to `EXTRA_LIST` in `model/extras.data.ts`: a stable `id`, its
   `name`, `pitch` and `group`; an `offer` week, `onboarding: true`, a `when`
   and a `tool` as it needs.
2. Give its items `extra: <id>` in their frontmatter.

Settings lists it in its group, This week offers it in its week, and
onboarding offers it if it says so.
