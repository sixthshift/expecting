import { Button } from "@sixthshift/design-system/button";
import { FormField } from "@sixthshift/design-system/form-field";
import { Input } from "@sixthshift/design-system/input";
import { cn } from "@sixthshift/design-system/utils";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, ToyBrick } from "lucide-react";
import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
import type { HouseholdState } from "../../app/load";
import { useAction } from "../../app/useAction";
import { useExpectingTheme } from "../../app/useExpectingTheme";
import { DateForm } from "../../components/DateForm";
import { AnswerInput } from "../../components/ProfileForm";
import { question } from "../../content/profile";
import { addDays, formatDate, type ISODate, todayISO } from "../../lib/dates";
import { NOT_YET, onboardingSteps, STAGE, type Step } from "../../lib/onboarding";
import { type Person, ROLES, type Role } from "../../lib/people";
import { applyTheme, BABY, type Baby, THEMES } from "../../lib/theme";
import { gestationLabel, positionOn, slotLabel } from "../../lib/timeline";
import { finishOnboarding, saveAnswer, saveHousehold } from "../../server/functions/household";
import { addPerson, becomePerson } from "../../server/functions/people";

const route = getRouteApi("/welcome");

/** Pregnancy, counted the way midwives do: 40 weeks from the first day of the last period. */
const GESTATION_DAYS = 280;

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
  const screen = renderStep(current, state, advance, async () => {
    await finishOnboarding();
    await navigate({ to: "/" });
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

type Screen = { title: string; lead?: ReactNode; body: ReactNode };
type Advance = (save?: () => Promise<unknown>) => Promise<void>;

function renderStep(step: Step, state: HouseholdState, advance: Advance, finish: () => Promise<void>): Screen {
  const { household, people } = state;
  switch (step) {
    case "who":
      return people.length === 0
        ? {
            title: "Welcome to Expecting. Who's holding this phone?",
            lead: "Expecting is for both of you, on both your phones. It just needs to know who's who; there are no accounts.",
            body: <NewPerson people={people} onDone={advance} />,
          }
        : {
            title: "Who's this?",
            lead: "Expecting is shared; this phone just needs to know whose it is.",
            body: <WhoIsThis people={people} onDone={advance} />,
          };

    case "stage": {
      const q = question(STAGE)!;
      return {
        title: q.ask,
        lead: "Either way, everything in Expecting is there to read.",
        body: (
          <Choices
            options={Object.entries(q.answers).map(([value, label]) => ({ value, label }))}
            value={household.profile[STAGE]}
            onChoose={(answer) => advance(() => saveAnswer({ data: { question: STAGE, answer } }))}
          />
        ),
      };
    }

    case "due":
      return {
        title: "When's the baby due?",
        lead: "Your best guess is fine. The dating scan may move it, and you can change it any time.",
        body: <DueDate value={household.dueDate} onDone={advance} />,
      };

    case "baby":
      return {
        title: "Do you know if it's a boy or a girl?",
        lead: "It sets Expecting's colours: blue, pink, or both. Anyone who sees your screen will see them, so keeping it a surprise is an answer too.",
        body: (
          <Choices
            options={(Object.keys(BABY) as Baby[]).map((value) => ({ value, label: BABY[value] }))}
            value={household.baby}
            onChoose={(baby) => {
              applyTheme(THEMES[baby as Baby]);
              return advance(() => saveHousehold({ data: { baby: baby as Baby } }));
            }}
          />
        ),
      };

    case "ready":
      return { title: "You're all set", lead: <ReadyLine state={state} />, body: <Ready onOpen={finish} /> };

    default: {
      const q = question(step.slice(2))!;
      const value = household.profile[q.id];
      const answers = Object.entries(q.answers).map(([value, label]) => ({ value, label }));
      return {
        title: q.ask,
        lead: "It tailors what Expecting shows you. Skip it and you'll see everything.",
        body: (
          <div className="flex flex-col gap-4">
            {answers.length <= 4 ? (
              <Choices options={answers} value={value} onChoose={(answer) => advance(() => saveAnswer({ data: { question: q.id, answer } }))} />
            ) : (
              <ChooseFromList question={q} value={value} onDone={advance} />
            )}
            <SkipButton onClick={() => advance()} />
          </div>
        ),
      };
    }
  }
}

/** Big answers, one tap each: choosing one is answering. */
function Choices({ options, value, onChoose }: { options: { value: string; label: string }[]; value?: string; onChoose: (value: string) => Promise<void> }) {
  const [busy, setBusy] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-3">
      {options.map((o) => {
        const chosen = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            disabled={busy !== null}
            aria-pressed={chosen}
            onClick={async () => {
              setBusy(o.value);
              try {
                await onChoose(o.value);
              } finally {
                setBusy(null);
              }
            }}
            className={cn(
              "flex min-h-14 w-full items-center gap-3 rounded-xl border bg-bg-normal px-4 py-3 text-left text-base transition-colors hover:border-border-brand-hovered disabled:cursor-wait",
              chosen ? "border-border-brand bg-bg-brand-subtle text-fg-on-brand-subtle" : "border-border-normal text-fg-strong",
              busy === o.value && "border-border-brand"
            )}
          >
            <span className="flex-1">{o.label}</span>
            {chosen ? <Check aria-hidden size={18} className="text-fg-brand" /> : null}
          </button>
        );
      })}
    </div>
  );
}

function SkipButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="min-h-11 self-start text-sm text-fg-subtle underline hover:text-fg-normal">
      Skip for now
    </button>
  );
}

function WhoIsThis({ people, onDone }: { people: Person[]; onDone: Advance }) {
  const [someoneElse, setSomeoneElse] = useState(false);
  if (someoneElse) return <NewPerson people={people} onDone={onDone} />;
  return (
    <div className="flex flex-col gap-4">
      <Choices options={people.map((p) => ({ value: p.id, label: `I'm ${p.name}` }))} onChoose={(id) => onDone(() => becomePerson({ data: { id } }))} />
      <button type="button" onClick={() => setSomeoneElse(true)} className="min-h-11 self-start text-sm text-fg-subtle underline hover:text-fg-normal">
        Someone else
      </button>
    </div>
  );
}

function NewPerson({ people, onDone }: { people: Person[]; onDone: Advance }) {
  const [name, setName] = useState("");
  // The second person is most likely the other role.
  const [role, setRole] = useState<Role | undefined>(people.length === 1 ? (people[0]!.role === "carrying" ? "partner" : "carrying") : undefined);
  const [saving, setSaving] = useState(false);
  const ready = name.trim().length > 0 && role !== undefined;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!ready) return;
    setSaving(true);
    try {
      await onDone(() => addPerson({ data: { name, role } }));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <FormField label="Your name">
        <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" maxLength={60} className="h-12 text-base" />
      </FormField>
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-sm font-medium text-fg-normal">Which of you is this?</legend>
        {(Object.keys(ROLES) as Role[]).map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={role === r}
            onClick={() => setRole(r)}
            className={cn(
              "flex min-h-14 w-full items-center gap-3 rounded-xl border bg-bg-normal px-4 py-3 text-left text-base transition-colors hover:border-border-brand-hovered",
              role === r ? "border-border-brand bg-bg-brand-subtle text-fg-on-brand-subtle" : "border-border-normal text-fg-strong"
            )}
          >
            <span className="flex-1">{ROLES[r]}</span>
            {role === r ? <Check aria-hidden size={18} className="text-fg-brand" /> : null}
          </button>
        ))}
      </fieldset>
      <Button type="submit" intent="brand" size="xl" loading={saving} disabled={!ready} className="w-full">
        Continue
      </Button>
    </form>
  );
}

function DueDate({ value, onDone }: { value: ISODate | null; onDone: Advance }) {
  const today = todayISO();
  const [fromPeriod, setFromPeriod] = useState(false);
  const save = (dueDate: ISODate | null) => onDone(dueDate ? () => saveHousehold({ data: { dueDate } }) : undefined);

  return (
    <div className="flex flex-col gap-4">
      {fromPeriod ? (
        <DateForm
          key="period"
          label="First day of the last period"
          description="Expecting adds 40 weeks, the way your midwife will."
          value={null}
          submitLabel="Next"
          wide
          minDate={addDays(today, -7 * 44)}
          maxDate={today}
          onSave={async (lmp) => save(lmp ? addDays(lmp, GESTATION_DAYS) : null)}
        />
      ) : (
        <DateForm
          key="due"
          label="Due date"
          value={value}
          submitLabel="Next"
          wide
          minDate={addDays(today, -7 * 3)}
          maxDate={addDays(today, 7 * 44)}
          onSave={save}
        />
      )}
      <button type="button" onClick={() => setFromPeriod((f) => !f)} className="min-h-11 self-start text-sm text-fg-subtle underline hover:text-fg-normal">
        {fromPeriod ? "I know the due date" : "Not sure? Work it out from the last period"}
      </button>
      <SkipButton onClick={() => onDone()} />
    </div>
  );
}

function ChooseFromList({ question: q, value, onDone }: { question: NonNullable<ReturnType<typeof question>>; value?: string; onDone: Advance }) {
  const [answer, setAnswer] = useState(value);
  return (
    <div className="flex flex-col gap-4">
      <AnswerInput question={q} value={answer} onChange={setAnswer} />
      <Button
        intent="brand"
        size="xl"
        disabled={!answer}
        className="w-full"
        onClick={() => onDone(() => saveAnswer({ data: { question: q.id, answer: answer! } }))}
      >
        Next
      </Button>
    </div>
  );
}

/** Where Expecting will open. */
function ReadyLine({ state }: { state: HouseholdState }) {
  const { dueDate, birthDate, profile } = state.household;
  if (!dueDate) {
    return profile[STAGE] === NOT_YET
      ? "Expecting opens at Getting ready: the things worth doing before a pregnancy. When you're expecting, add the due date and it moves with you."
      : "Expecting opens at the start. Add the due date when you have it, and it opens at your week.";
  }
  const position = positionOn(todayISO(), dueDate, birthDate);
  return (
    <>
      Expecting opens at {slotLabel(position.slot).toLowerCase()}
      {position.gestationDays !== undefined ? ` (${gestationLabel(position.gestationDays)})` : ""}, due {formatDate(dueDate)}.
    </>
  );
}

function Ready({ onOpen }: { onOpen: () => Promise<void> }) {
  const [opening, setOpening] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-fg-subtle">
        On your partner's phone, open Expecting and log in with the same password: it will ask who they are, and nothing else.
      </p>
      <Button
        intent="brand"
        size="xl"
        loading={opening}
        className="w-full"
        onClick={async () => {
          setOpening(true);
          await onOpen();
        }}
      >
        Open Expecting
      </Button>
    </div>
  );
}
