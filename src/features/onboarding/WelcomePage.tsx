import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ToyBrick } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { finishOnboarding } from "../../api/rpc/household";
import { onboardingSteps, type Step } from "../../lib/onboarding";
import { useExpectingTheme } from "../app/useExpectingTheme";
import { useAction } from "../household/useAction";

import type { Screen, StepContext } from "./step";
import { babyStep } from "./steps/baby";
import { dueStep } from "./steps/due";
import { expectingStep } from "./steps/expecting";
import { questionStep } from "./steps/question";
import { readyStep } from "./steps/ready";
import { whoStep } from "./steps/who";

const route = getRouteApi("/welcome");

/** Pregnancy, counted the way midwives do: 40 weeks from the first day of the last period. */
const _GESTATION_DAYS = 280;

/**
 * The first-run questions, one to a screen. Each answer is saved as it is
 * given, so a reload resumes, and the steps are worked out again from what is
 * known: the second parent's phone is only asked who's holding it.
 */
export function WelcomePage() {
  const state = route.useLoaderData();
  const navigate = useNavigate();
  useExpectingTheme(state.household.baby);

  const steps = onboardingSteps({ known: state.me !== null, onboarded: state.household.onboardedAt !== null, profile: state.household.profile });
  // Steps answered in this visit, in order: the way back. A step leaves `steps` once it can't be asked again (who).
  const [done, setDone] = useState<Step[]>([]);
  const current = steps.find((s) => !done.includes(s)) ?? "ready";
  const previous = [...done].reverse().find((s) => steps.includes(s));

  /** Save, reload what's known, then move on. */
  const [save] = useAction(async (step?: () => Promise<unknown>) => {
    await step?.();
  });
  async function advance(step?: () => Promise<unknown>) {
    await save(step);
    setDone((d) => [...d, current]);
  }

  // A new screen: move focus to its question, for anyone not looking. Not on arrival; the page is new then anyway.
  const heading = useRef<HTMLHeadingElement>(null);
  const arrived = useRef(false);
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs on each new step.
  useEffect(() => {
    if (arrived.current) heading.current?.focus({ preventScroll: true });
    arrived.current = true;
  }, [current]);

  const index = steps.indexOf(current);
  const screen = renderStep(current, {
    state,
    advance,
    finish: async () => {
      await finishOnboarding();
      await navigate({ to: "/" });
    },
  });

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:max-w-lg lg:justify-center">
      <header className="flex items-center gap-3">
        {previous ? (
          <button
            type="button"
            onClick={() => setDone((d) => d.slice(0, d.lastIndexOf(previous)))}
            aria-label="Back"
            className="-ml-2 flex size-11 items-center justify-center rounded-full text-fg-subtle hover:bg-bg-normal-hovered hover:text-fg-normal"
          >
            <ArrowLeft aria-hidden size={20} />
          </button>
        ) : (
          <ToyBrick aria-hidden size={22} className="text-fg-brand" />
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

      <section key={current} aria-labelledby="step-heading" className="mt-10 flex flex-1 flex-col gap-6 lg:mt-14 lg:flex-none">
        <div className="flex flex-col gap-2">
          <h1
            id="step-heading"
            ref={heading}
            tabIndex={-1}
            className="text-2xl leading-tight font-semibold text-fg-strong outline-none focus-visible:ring-0 focus-visible:outline-none lg:text-3xl"
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
    case "expecting":
      return expectingStep(context);
    case "due":
      return dueStep(context);
    case "baby":
      return babyStep(context);
    case "ready":
      return readyStep(context);
    default:
      return questionStep(context, step.slice(2));
  }
}
