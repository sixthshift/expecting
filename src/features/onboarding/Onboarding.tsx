import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi, Outlet, useMatch, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Baby } from "lucide-react";
import { useEffect, useRef } from "react";
import { finishOnboarding } from "../../api/rpc/household";
import { type Step, stepAfter } from "../../lib/onboarding";
import { Redirect } from "../app/Redirect";
import { useExpectingTheme } from "../app/useExpectingTheme";
import { householdQuery, onboardingLeft } from "../household/load";
import { useAction } from "../household/useAction";
import { stepAt, stepHref } from "./paths";
import type { Screen, StepContext } from "./step";
import { babyStep } from "./steps/baby";
import { dueStep } from "./steps/due";
import { extrasStep } from "./steps/extras";
import { questionStep } from "./steps/question";
import { readyStep } from "./steps/ready";
import { whoStep } from "./steps/who";

// The first-run questions, one to a screen, each at its own URL
// (`/onboarding/due`), so the phone's back gesture goes back a question. Each
// answer is saved as it is given, and what's left to ask is worked out afresh
// from what is known (onboardingLeft): the second parent's phone is only asked
// who's holding it.

const nextRoute = getRouteApi("/onboarding/");

/** Around every step: the household's colours. */
export function OnboardingLayout() {
  const { data: state } = useSuspenseQuery(householdQuery);
  useExpectingTheme(state.household.baby);
  return <Outlet />;
}

/**
 * `/onboarding`: on to the step to ask. After an answer (`?after=due`), the
 * next one still to ask, from what's known now; else the first.
 */
export function OnboardingNext() {
  const { data: state } = useSuspenseQuery(householdQuery);
  const { after } = nextRoute.useSearch();
  const steps = onboardingLeft(state);
  const next = after ? stepAfter(steps, after as Step) : steps[0];
  return <Redirect href={next ? stepHref(next) : "/"} />;
}

// The first screen of a visit keeps focus where the browser put it; every one after moves it to its question.
let shownOne = false;

/** One step, the one the URL names. A step that isn't (or is no longer) asked goes on to the one that is. */
export function OnboardingStep() {
  const { data: state } = useSuspenseQuery(householdQuery);
  const navigate = useNavigate();
  // This page's own match, not the location: while a navigation away is pending, the location is already
  // the next one, and this page, still drawn, would take it for a step that isn't there.
  const current = stepAt(useMatch({ strict: false, select: (match) => match.pathname }));
  const steps = onboardingLeft(state);

  /** Save, reload what's known, then on to whatever's next. */
  const [save] = useAction(async (step?: () => Promise<unknown>) => {
    await step?.();
  });

  // A new screen: move focus to its question, for anyone not looking.
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (shownOne) heading.current?.focus({ preventScroll: true });
    shownOne = true;
  }, []);

  if (!current || !steps.includes(current)) return <Redirect href="/onboarding" />;

  const index = steps.indexOf(current);
  const previous = steps[index - 1];
  const screen = renderStep(current, {
    state,
    advance: async (step) => {
      if (await save(step)) await navigate({ to: "/onboarding", search: { after: current } });
    },
    finish: async () => {
      if (await save(() => finishOnboarding())) await navigate({ to: "/" });
    },
  });

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:max-w-lg lg:justify-center">
      <header className="flex items-center gap-3">
        {previous ? (
          <button
            type="button"
            onClick={() => navigate({ href: stepHref(previous) })}
            aria-label="Back"
            className="-ml-2 flex size-11 items-center justify-center rounded-full text-fg-subtle hover:bg-bg-normal-hovered hover:text-fg-normal"
          >
            <ArrowLeft aria-hidden size={20} />
          </button>
        ) : (
          <Baby aria-hidden size={22} className="text-fg-brand" />
        )}
        <span className="font-semibold text-fg-strong">Expecting</span>
        {steps.length > 1 ? (
          <div
            role="progressbar"
            aria-label="Getting started"
            aria-valuemin={1}
            aria-valuemax={steps.length}
            aria-valuenow={index + 1}
            className="ml-auto h-1 w-24 overflow-hidden rounded-full bg-bg-subtle"
          >
            <div
              className="h-full rounded-full bg-linear-to-r from-(--expecting-accent-from) to-(--expecting-accent-to) motion-safe:transition-[width] motion-safe:duration-500"
              style={{ width: `${((index + 1) / steps.length) * 100}%` }}
            />
          </div>
        ) : null}
      </header>

      <section aria-labelledby="step-heading" className="mt-10 flex flex-1 flex-col gap-6 lg:mt-14 lg:flex-none">
        <div className="flex flex-col gap-2">
          <h1
            id="step-heading"
            ref={heading}
            tabIndex={-1}
            className="text-2xl leading-tight font-display font-semibold text-fg-strong outline-none focus-visible:ring-0 focus-visible:outline-none lg:text-3xl"
          >
            {screen.title}
          </h1>
          {screen.lead ? <p className="text-fg-subtle">{screen.lead}</p> : null}
        </div>
        {screen.body}
      </section>
    </main>
  );
}

/** The screen for a step. Each step is its own file in steps/. */
function renderStep(step: Step, context: StepContext): Screen {
  switch (step) {
    case "who":
      return whoStep(context);
    case "due":
      return dueStep(context);
    case "baby":
      return babyStep(context);
    case "extras":
      return extrasStep(context);
    case "ready":
      return readyStep(context);
    default:
      return questionStep(context, step.slice(2));
  }
}
