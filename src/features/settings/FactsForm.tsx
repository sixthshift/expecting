import { FormField } from "@sixthshift/design-system/form-field";
import { RadioButtonGroup } from "@sixthshift/design-system/radio-button-group";
import { Select } from "@sixthshift/design-system/select";
import { saveAnswer } from "../../api/rpc/facts";
import { DateForm } from "../../components/DateForm";
import { type Ask, askedOf, type FactQuestion } from "../../content/facts";
import { formatDate, type ISODate, todayISO } from "../../lib/dates";
import { type Answer, asksFor, factsOf, latestByKey } from "../../lib/facts";
import type { Person } from "../../lib/people";
import { useAction } from "../household/useAction";

/**
 * The questions in content/facts.yaml, as a form: nothing here names a
 * question, so a new one in the file appears here by itself, once for each of
 * you where it's about each. Any answer can be cleared, which puts back
 * everything it hid; each says who gave it.
 */
export function FactsForm({ answers, people }: { answers: readonly Answer[]; people: readonly Person[] }) {
  const [save] = useAction((key: string, answer: string | null) => saveAnswer({ data: { key, answer } }));
  const latest = latestByKey(answers);

  return (
    <div className="flex flex-col gap-6">
      {asksFor(factsOf(answers)).map((a) => {
        const label = askedOfIn(a, people);
        const last = latest[a.key];
        const value = last?.value ?? undefined;
        return (
          <FormField key={a.key} label={label}>
            <div className="flex flex-col items-start gap-2">
              {a.question.type === "date" ? (
                <DateForm label="Date" value={(value as ISODate | undefined) ?? null} submitLabel="Save" onSave={(date) => save(a.key, date)} />
              ) : (
                <AnswerInput question={a.question} label={label} value={value} onChange={(answer) => save(a.key, answer)} />
              )}
              {value ? (
                <span className="flex flex-wrap items-baseline gap-x-3 text-xs text-fg-subtle">
                  {answeredBy(last!, people)}
                  <button type="button" onClick={() => save(a.key, null)} aria-label={`Clear answer: ${label}`} className="underline hover:text-fg-normal">
                    Clear answer
                  </button>
                </span>
              ) : (
                <span className="text-xs text-fg-subtle">Not answered: you'll see everything this question decides.</span>
              )}
            </div>
          </FormField>
        );
      })}
    </div>
  );
}

/** The question in words, with the name of whoever it's about if they've joined. */
export function askedOfIn(a: Ask, people: readonly Person[]): string {
  return askedOf(a, a.about === "household" ? null : (people.find((p) => p.role === a.about)?.name ?? null));
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
