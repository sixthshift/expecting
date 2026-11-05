import { Badge } from "@sixthshift/design-system/badge";
import { useExtrasQuery } from "../../../../../api/rpc/extras";
import { factsSaves } from "../../../../../api/rpc/facts";
import { usePeopleQuery } from "../../../../../api/rpc/people";
import { useNow, useSettingsQuery } from "../../../../../api/rpc/settings";
import { builtInItems } from "../../../../../content";
import type { ISODate } from "../../../../../lib/dates";
import { extrasOn, inExtras } from "../../../../../lib/extras";
import { type Answer, decides, isSettled, nextAsked } from "../../../../../lib/facts";
import { didOn, fullDate } from "../../../../../lib/labels";
import type { Person } from "../../../../../lib/people";
import type { Week } from "../../../../../lib/timeline";
import { ItemLink } from "../../../../../pillars/library/components/itemLink/ItemLink";
import { useSave } from "../../../../hooks/useSave";
import { useSettingsPage } from "../../contexts/SettingsPageContext";
import { type Ask, askedOf, type FactQuestion, UNSURE } from "../../model/facts";
import { AnswerField } from "../answer/AnswerField";
import { SettingRow } from "../settingRow/SettingRow";

/**
 * One of the questions in src/app/features/settings/model/facts.data.ts, as a row: its answer, who gave
 * it, and when Home asks again if it isn't settled. Open, it can be
 * answered, changed or cleared (which puts back everything it hid), and says
 * what it decides. Nothing here names a question, so a new one in the file
 * appears by itself.
 */
export function QuestionRow({ a }: { a: Ask }) {
  const { open: openRow, toggle, latest } = useSettingsPage();
  const { people } = usePeopleQuery().data;
  const { data: dueDate } = useSettingsQuery({ select: (s) => s.dueDate });
  const now = useNow();
  const last = latest[a.key];
  const open = openRow === a.key;
  const saveAnswer = useSave(factsSaves.saveAnswer);
  const save = async (key: string, answer: string | null) => saveAnswer({ key, answer });
  const label = askedOf(a, people);
  const value = last?.value ?? undefined;
  const settled = isSettled(a, last);
  const again = dueDate && !settled ? nextAsked(a, last, dueDate) : null;
  const { data: extras } = useExtrasQuery({ select: extrasOn });
  // What it decides among everything that could show: not an extra that's off.
  const uses = open ? decides(a.question.id, builtInItems).filter((i) => inExtras(i.extra, extras)) : [];

  return (
    <SettingRow
      id={a.key}
      label={label}
      open={open}
      onToggle={() => toggle(a.key)}
      value={
        settled ? (
          shown(a.question, value!)
        ) : value === UNSURE ? (
          <Badge variant="soft" intent="warning" size="sm">
            Not sure
          </Badge>
        ) : (
          <Badge variant="soft" intent="brand" size="sm">
            Not answered
          </Badge>
        )
      }
      meta={[value ? answeredBy(last!, people) : null, again !== null && now !== null ? askedAgain(again, now) : null].filter(Boolean).join(" · ") || undefined}
    >
      <div className="flex flex-col gap-4">
        <AnswerField question={a.question} label={label} value={value} onAnswer={(answer) => save(a.key, answer)} />
        {value ? (
          <button
            type="button"
            onClick={() => save(a.key, null)}
            aria-label={`Clear answer: ${label}`}
            className="min-h-11 self-start text-sm text-fg-subtle underline hover:text-fg-normal"
          >
            Clear answer
          </button>
        ) : (
          <p className="text-xs text-fg-subtle">Until it's answered, you see everything this question decides.</p>
        )}
        {uses.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            <h4 className="text-xs font-semibold text-fg-subtle">What this answer changes</h4>
            <ul className="flex flex-wrap gap-2">
              {uses.map((item) => (
                <li key={item.id}>
                  <ItemLink
                    itemId={item.id}
                    className="inline-flex min-h-9 items-center rounded-full border border-border-subtle bg-bg-normal px-3 text-sm text-fg-normal hover:border-border-brand-hovered"
                  >
                    {item.title}
                  </ItemLink>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </SettingRow>
  );
}

/** An answer in words: its label, or the date. */
function shown(q: FactQuestion, value: string): string {
  return q.type === "date" ? fullDate(value as ISODate) : (q.answers[value] ?? value);
}

/** "Home asks in week 16", or that it's asking now. */
function askedAgain(week: Week, now: Week): string {
  return week <= now ? "Home is asking" : `Home asks in week ${week}`;
}

/** "Jason answered, 3 Oct". */
function answeredBy(a: Answer, people: readonly Person[]): string {
  return didOn(people.find((p) => p.id === a.answeredBy)?.name, "answered", a.answeredAt, { comma: false });
}
