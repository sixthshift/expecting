import { Badge } from "@sixthshift/design-system/badge";
import { RadioButtonGroup } from "@sixthshift/design-system/radio-button-group";
import { Select } from "@sixthshift/design-system/select";
import { useExtras } from "../../../../api/rpc/extras";
import { factsSaves } from "../../../../api/rpc/facts";
import { useSave } from "../../../../app/hooks/useSave";
import { DateForm } from "../../../../components/DateForm";
import { builtInItems } from "../../../../content";
import { formatDate, type ISODate, todayISO } from "../../../../lib/dates";
import { extrasOn, inExtras } from "../../../../lib/extras";
import { type Answer, decides, isSettled, nextAsked } from "../../../../lib/facts";
import type { Person } from "../../../../lib/people";
import type { Week } from "../../../../lib/timeline";
import { ItemLink } from "../../../library/components/ItemLink";
import { type Ask, askedOf, type FactQuestion, UNSURE } from "../../model/facts";
import { SettingRow } from "../SettingRow";

/**
 * One of the questions in src/features/settings/model/facts.data.ts, as a row: its answer, who gave
 * it, and when This week asks again if it isn't settled. Open, it can be
 * answered, changed or cleared (which puts back everything it hid), and says
 * what it decides. Nothing here names a question, so a new one in the file
 * appears by itself.
 */
export function FactRow({
  a,
  last,
  people,
  dueDate,
  now,
  open,
  onToggle,
}: {
  a: Ask;
  last: Answer | undefined;
  people: readonly Person[];
  dueDate: ISODate | null;
  now: Week | null;
  open: boolean;
  onToggle: () => void;
}) {
  const saveAnswer = useSave(factsSaves.saveAnswer);
  const save = async (key: string, answer: string | null) => saveAnswer({ key, answer });
  const label = askedOfIn(a, people);
  const value = last?.value ?? undefined;
  const settled = isSettled(a, last);
  const again = dueDate && !settled ? nextAsked(a, last, dueDate) : null;
  const { data: extras } = useExtras({ select: extrasOn });
  // What it decides among everything that could show: not an extra that's off.
  const uses = open ? decides(a.question.id, builtInItems).filter((i) => inExtras(i.extra, extras)) : [];

  return (
    <SettingRow
      id={a.key}
      label={label}
      open={open}
      onToggle={onToggle}
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
        {a.question.type === "date" ? (
          <DateForm label="Date" value={(value as ISODate | undefined) ?? null} submitLabel="Save" onSave={(date) => save(a.key, date)} />
        ) : (
          <AnswerInput question={a.question} label={label} value={value} onChange={(answer) => save(a.key, answer)} />
        )}
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
  return q.type === "date" ? formatDate(value as ISODate, { day: "numeric", month: "short", year: "numeric" }) : (q.answers[value] ?? value);
}

/** "This week asks in week 16", or that it's asking now. */
function askedAgain(week: Week, now: Week): string {
  return week <= now ? "This week is asking" : `This week asks in week ${week}`;
}

/** The question in words, with the name of whoever it's about if they've joined. */
export function askedOfIn(a: Ask, people: readonly Person[]): string {
  return askedOf(a, a.about === null ? null : (people.find((p) => p.role === a.about)?.name ?? null));
}

/** "Jason answered, 3 Oct". */
function answeredBy(a: Answer, people: readonly Person[]): string {
  const who = people.find((p) => p.id === a.answeredBy)?.name;
  const when = formatDate(todayISO(new Date(a.answeredAt)), { day: "numeric", month: "short" });
  return who ? `${who} answered, ${when}` : `Answered ${when}`;
}

/** A few answers as buttons; a long list (a state) as a select. */
export function AnswerInput({
  question,
  label,
  value,
  onChange,
  inline = false,
}: {
  question: FactQuestion;
  label: string;
  value: string | undefined;
  onChange: (answer: string) => void;
  /** The options in a row, where room is short (This week). */
  inline?: boolean;
}) {
  const options = Object.entries(question.answers).map(([answer, label]) => ({ value: answer, label }));
  if (options.length <= 4)
    return (
      <RadioButtonGroup aria-label={label} options={options} orientation={inline ? "horizontal" : "vertical"} value={value ?? ""} onValueChange={onChange} />
    );
  return <Select aria-label={label} options={options} value={value} placeholder="Choose…" onValueChange={onChange} className="w-full max-w-xs" />;
}
