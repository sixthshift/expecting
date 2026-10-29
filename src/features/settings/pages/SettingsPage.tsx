import { Badge } from "@sixthshift/design-system/badge";
import { Button } from "@sixthshift/design-system/button";
import { cn } from "@sixthshift/design-system/utils";
import { getRouteApi } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useExtras } from "../../../api/rpc/extras";
import { useAnswers } from "../../../api/rpc/facts";
import { usePeople } from "../../../api/rpc/people";
import { saveSettings, useNow, usePosition, useSettings } from "../../../api/rpc/settings";
import { Page, Section } from "../../../components/Page";
import { daysBetween, formatDate, todayISO } from "../../../lib/dates";
import { asksFor, factsOf, isSettled, latestByKey } from "../../../lib/facts";
import type { Person, Role } from "../../../lib/people";
import { gestationLabel } from "../../../lib/timeline";
import { COMMIT, VERSION } from "../../../lib/version";
import { useAction } from "../../app/useAction";
import { ColourChoice } from "../components/colour/ColourChoice";
import { DueDateForm } from "../components/dueDate/DueDateForm";
import { ExtrasList } from "../components/extras/ExtrasList";
import { FactRow } from "../components/facts/FactsForm";
import { SettingList, SettingRow } from "../components/SettingRow";
import { ThisPhone } from "../components/thisPhone/ThisPhone";
import { type Ask, GROUPS, type Group } from "../model/facts";

const route = getRouteApi("/app/settings");

const DUE_DATE = "dueDate";

/** The sections, in order: the question groups, the extras, then this phone. */
const SECTIONS = [
  ...(Object.entries(GROUPS) as [Group, string][]).map(([id, title]) => ({ id, title })),
  { id: "extras", title: "Extras" },
  { id: "phone", title: "This phone" },
];

/**
 * Everything Expecting has been told, grouped and readable at a glance: the
 * due date and colours with the pregnancy, every question in
 * src/features/settings/model/facts.data.ts in its group (each of yours under your name), how many
 * are settled and the next to answer; the extras; then this phone. `?ask=cover` opens at a
 * question (or `?ask=extra:babymoon` at an extra), as a hidden item's page links
 * here.
 */
export function SettingsPage() {
  const { ask } = route.useSearch();
  const [save] = useAction((data: Parameters<typeof saveSettings>[0]["data"]) => saveSettings({ data }));
  const { data: settings } = useSettings();
  const { data: answers } = useAnswers();
  const { data: choices } = useExtras();
  const { data: facts } = useAnswers({ select: factsOf });
  const position = usePosition();
  const now = useNow();
  const today = todayISO();
  const { me, people } = usePeople().data;
  const { dueDate, baby } = settings;

  const asks = asksFor(facts);
  const latest = latestByKey(answers);
  const unsettled = asks.filter((a) => !isSettled(a, latest[a.key]));
  const total = asks.length + 1;
  const answered = total - unsettled.length - (dueDate ? 0 : 1);
  const next = dueDate ? unsettled[0]?.key : DUE_DATE;

  const [open, setOpen] = useState<string | null>(ask ?? null);
  const toggle = (key: string) => setOpen((o) => (o === key ? null : key));
  const goTo = (key: string) => {
    setOpen(key);
    requestAnimationFrame(() => document.getElementById(`setting-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  // A link to a question opens it, wherever it sits on the page.
  useEffect(() => {
    if (!ask) return;
    setOpen(ask);
    requestAnimationFrame(() => document.getElementById(`setting-${ask}`)?.scrollIntoView({ block: "start" }));
  }, [ask]);

  const waiting = (group: string) => unsettled.filter((a) => a.question.group === group).length + (group === "pregnancy" && !dueDate ? 1 : 0);
  const rows = (list: readonly Ask[]) =>
    list.map((a) => (
      <FactRow key={a.key} a={a} last={latest[a.key]} people={people} dueDate={dueDate} now={now} open={open === a.key} onToggle={() => toggle(a.key)} />
    ));
  const toGo = dueDate ? daysBetween(today, dueDate) : 0;

  return (
    <Page title="Settings">
      <div className="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:items-start lg:gap-10">
        <nav aria-label="Settings" className="hidden lg:sticky lg:top-10 lg:flex lg:flex-col lg:gap-1">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#settings-${s.id}`}
              onClick={(event) => {
                event.preventDefault();
                document.getElementById(`settings-${s.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="flex min-h-10 items-center justify-between gap-2 rounded-md px-3 text-sm text-fg-normal hover:bg-bg-normal-hovered"
            >
              {s.title}
              {waiting(s.id) > 0 ? (
                <Badge variant="soft" intent="brand" size="sm" aria-label={`${waiting(s.id)} to answer`}>
                  {waiting(s.id)}
                </Badge>
              ) : null}
            </a>
          ))}
        </nav>

        <div className="flex min-w-0 flex-col gap-8">
          <div className="flex flex-col gap-4 rounded-xl bg-linear-to-r from-(--expecting-accent-soft-from) to-(--expecting-accent-soft-to) p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
            <div className="flex flex-1 flex-col gap-2">
              <p className="font-display text-lg font-semibold text-fg-strong">
                {answered === total ? "Every question answered" : `${answered} of ${total} answered`}
              </p>
              <p className="text-sm text-fg-normal">Each answer tailors what Expecting tells you to do, and when. Change any of them here.</p>
              {/* Onboarding's bar, on white so it shows on the tint. */}
              <div
                role="progressbar"
                aria-label="Questions answered"
                aria-valuemin={0}
                aria-valuemax={total}
                aria-valuenow={answered}
                className="mt-1 h-1.5 overflow-hidden rounded-full bg-bg-normal"
              >
                <div
                  className="h-full rounded-full bg-linear-to-r from-(--expecting-accent-from) to-(--expecting-accent-to) motion-safe:transition-[width] motion-safe:duration-500"
                  style={{ width: `${(answered / total) * 100}%` }}
                />
              </div>
            </div>
            {next ? (
              <Button intent="brand" onClick={() => goTo(next)} className="self-start sm:self-center">
                Answer the next one
              </Button>
            ) : null}
          </div>

          {(Object.entries(GROUPS) as [Group, string][]).map(([group, title]) => {
            const inGroup = asks.filter((a) => a.question.group === group);
            const household = inGroup.filter((a) => a.about === "household");
            const each = (["carrying", "partner"] as Role[])
              .map((role) => ({ role, asks: inGroup.filter((a) => a.about === role) }))
              .filter((e) => e.asks.length > 0);
            return (
              <Section key={group} id={`settings-${group}`} title={title} className="scroll-mt-6">
                {group === "pregnancy" ? (
                  <SettingList>
                    <SettingRow
                      id={DUE_DATE}
                      label="Due date"
                      open={open === DUE_DATE}
                      onToggle={() => toggle(DUE_DATE)}
                      value={
                        dueDate ? (
                          formatDate(dueDate, { day: "numeric", month: "short", year: "numeric" })
                        ) : (
                          <Badge variant="soft" intent="brand" size="sm">
                            Not set
                          </Badge>
                        )
                      }
                      meta={
                        position && dueDate
                          ? `${gestationLabel(position.gestationDays)} today · ${toGo > 0 ? `${toGo} days to go` : toGo === 0 ? "due today" : `${-toGo} days past`}`
                          : "Until there is one, Expecting opens at week 1"
                      }
                    >
                      <DueDateForm
                        key={dueDate}
                        value={dueDate}
                        submitLabel="Save due date"
                        description="Expecting opens at its week. It never hides any week."
                        onSave={async (date) => {
                          await save({ dueDate: date });
                          setOpen(null);
                        }}
                      />
                    </SettingRow>
                    <div className="flex flex-col gap-3 px-4 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-fg-strong">Boy or girl?</span>
                        <span className="text-xs text-fg-subtle">
                          Sets Expecting's colours. Anyone who sees the screen sees them, so keeping it a surprise is an answer too.
                        </span>
                      </div>
                      <ColourChoice value={baby} onChoose={(next) => save({ baby: next })} />
                    </div>
                    {rows(household)}
                  </SettingList>
                ) : household.length > 0 ? (
                  <SettingList>{rows(household)}</SettingList>
                ) : null}
                {each.map((e) => (
                  <div key={e.role} className="flex flex-col gap-2">
                    {household.length > 0 || each.length > 1 ? (
                      <h3 className={cn("text-sm font-medium text-fg-normal", household.length > 0 && "mt-2")}>{nameOf(e.role, people)}</h3>
                    ) : null}
                    <SettingList>{rows(e.asks)}</SettingList>
                  </div>
                ))}
              </Section>
            );
          })}

          <Section id="settings-extras" title="Extras" className="scroll-mt-6">
            <p className="-mt-1 text-sm text-fg-subtle">The parts of Expecting you choose. Each is off until one of you turns it on, and off means gone.</p>
            <ExtrasList choices={choices} people={people} highlight={ask?.startsWith("extra:") ? ask.slice("extra:".length) : undefined} />
          </Section>

          <Section id="settings-phone" title="This phone" className="scroll-mt-6">
            <ThisPhone me={me} people={people} />
          </Section>

          <p className="text-xs text-fg-subtle">
            Expecting {VERSION}
            {COMMIT ? ` · ${COMMIT}` : ""}
          </p>
        </div>
      </div>
    </Page>
  );
}

/** Whose questions these are: their name once they've joined. */
function nameOf(role: Role, people: readonly Person[]): string {
  return people.find((p) => p.role === role)?.name ?? (role === "carrying" ? "The pregnant parent" : "The partner");
}
