import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Baby } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";
import { ProgressBar } from "../../../../components/ProgressBar";
import { useOnboardingPage } from "../contexts/OnboardingPageContext";
import { stepHref } from "../model/paths";

// The first screen of a visit keeps focus where the browser put it; every one after moves it to its question.
let shownOne = false;

/**
 * Every step's screen: the way back (or the baby, on the first), how far
 * along, then its question, a line under it, and the way to answer.
 */
export function OnboardingLayout({ title, lead, children }: { title: string; lead?: ReactNode; children: ReactNode }) {
  const { steps, current, previous } = useOnboardingPage();
  const navigate = useNavigate();
  const index = steps.indexOf(current);

  // A new screen: move focus to its question, for anyone not looking.
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (shownOne) heading.current?.focus({ preventScroll: true });
    shownOne = true;
  }, []);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] desktop:max-w-lg desktop:justify-center">
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
          <ProgressBar label="Getting started" value={index + 1} min={1} max={steps.length} className="ml-auto h-1 w-24 bg-bg-subtle" />
        ) : null}
      </header>

      <section aria-labelledby="step-heading" className="mt-10 flex flex-1 flex-col gap-6 desktop:mt-14 desktop:flex-none">
        <div className="flex flex-col gap-2">
          <h1
            id="step-heading"
            ref={heading}
            tabIndex={-1}
            className="text-2xl leading-tight font-display font-semibold text-fg-strong outline-none focus-visible:ring-0 focus-visible:outline-none desktop:text-3xl"
          >
            {title}
          </h1>
          {lead ? <p className="text-fg-subtle">{lead}</p> : null}
        </div>
        {children}
      </section>
    </main>
  );
}
