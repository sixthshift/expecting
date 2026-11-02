# Onboarding

The first-run questions, one to a screen, each at its own URL
(`/onboarding/due`, `/onboarding/q/cover`), so the phone's back gesture goes
back a question. Outside the frame; done with them, it goes home. The first
of you gets every step; the other, joining later, goes straight in.

## Steps

Which are asked is a pure function of what's known (`onboardingLeft`,
`src/lib/onboarding.ts`), worked out afresh after every answer, so a reload
resumes and the other phone's answers count:

| Step | Asks | Where |
|---|---|---|
| `due` | the due date, or the last period's first day | `components/steps/DueStep.tsx` |
| `baby` | boy, girl or don't know: the colours | `BabyStep.tsx` |
| `q:<key>` | each `asked: "onboarding"` question in `facts.data.ts` whose `when` fits so far, once for each of you where it's about each | `QuestionStep.tsx` |
| `extras` | the extras with `onboarding: true`, any to turn on | `ExtrasStep.tsx` |
| `ready` | nothing: where Expecting will open, and how the other joins | `ReadyStep.tsx` |

## From the store to the screen

```
queries (settings, answers)
  → OnboardingPageProvider   the steps left, the current, the previous, advance, finish   contexts/
  → CurrentStep              the step the URL names                                      components/steps/
  → <Kind>Step               reads its own queries; draws OnboardingFrame                components/steps/
```

`advance(save)` saves the step's answer (or nothing, to skip), waits for
what's known to reload, and goes to `/onboarding?after=<step>`
(`OnboardingNext`), which works out the next. While a save is in, the step
stays as it was, though it may already look answered.

## Where things are

```
pages/          OnboardingLayout (the baby's colours), OnboardingNext (on to the next), OnboardingStep
contexts/       OnboardingPageContext: where the step is, and the ways on
model/paths.ts  a step's URL, and the step a URL is
components/
  OnboardingFrame  every step's screen: the way back, how far along, the question
  Choices, SkipButton  what the steps share
  steps/        CurrentStep, a file for each step, ChooseFromList (a long list's answers)
```

Settings' parts draw what it asks: `AnswerField`, `DueDateForm`,
`ExtraPitch`.

## Adding a step

A question needs none: `asked: "onboarding"` in `facts.data.ts` makes it a
`q:` step. Otherwise:

1. Add it to `Step` and to `onboardingSteps`, in its place
   (`src/lib/onboarding.ts`), and its route (`src/routes/onboarding/`, added
   to `tree.ts`).
2. Draw it: `components/steps/<Kind>Step.tsx`, in `OnboardingFrame`, going
   on with `advance` from `useOnboardingPage()`; and a case in `CurrentStep`.
