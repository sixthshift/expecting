import type { ReactNode } from "react";
import { DateForm } from "../../../../../components/DateForm";
import type { ISODate } from "../../../../../lib/dates";
import type { FactQuestion } from "../../model/facts";
import { AnswerInput } from "./AnswerInput";

/**
 * The way to answer a question, wherever it's asked: a date question gets
 * the date picker, saved with a button; a choice, its answers (`AnswerInput`),
 * or `choice` where a screen answers it its own way (onboarding's big
 * buttons).
 */
export function AnswerField({
  question,
  label,
  value,
  onAnswer,
  submitLabel = "Save",
  wide = false,
  requireChange = true,
  inline = false,
  choice,
}: {
  question: FactQuestion;
  label: string;
  value: string | undefined;
  onAnswer: (answer: string | null) => Promise<unknown>;
  /** The date's button. */
  submitLabel?: string;
  /** The date's button full-width and large, as in onboarding. */
  wide?: boolean;
  /** Whether the date must change before it can be saved. */
  requireChange?: boolean;
  /** The answers in a row, where room is short (Home). */
  inline?: boolean;
  /** A choice answered this way, not with `AnswerInput`. */
  choice?: ReactNode;
}) {
  if (question.type === "date")
    return (
      <DateForm
        label="Date"
        value={(value as ISODate | undefined) ?? null}
        submitLabel={submitLabel}
        wide={wide}
        requireChange={requireChange}
        onSave={(date) => onAnswer(date)}
      />
    );
  return choice ?? <AnswerInput question={question} label={label} value={value} inline={inline} onChange={(answer) => onAnswer(answer)} />;
}
