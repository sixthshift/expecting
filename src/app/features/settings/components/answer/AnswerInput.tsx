import { RadioButtonGroup } from "@sixthshift/design-system/radio-button-group";
import { Select } from "@sixthshift/design-system/select";
import type { FactQuestion } from "../../model/facts";

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
