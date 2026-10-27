import { FormField } from "@sixthshift/design-system/form-field";
import { RadioButtonGroup } from "@sixthshift/design-system/radio-button-group";
import { Select } from "@sixthshift/design-system/select";
import { useRouter } from "@tanstack/react-router";
import { PROFILE, type Profile, type ProfileQuestion } from "../content/profile";
import { saveAnswer } from "../server/functions/household";

/**
 * The questions in content/profile.yaml, as a form: nothing here names a
 * question, so a new one in the file appears here by itself. Any answer can be
 * cleared, which puts back everything it hid.
 */
export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();

  async function save(question: string, answer: string | null) {
    await saveAnswer({ data: { question, answer } });
    await router.invalidate();
  }

  return (
    <div className="flex flex-col gap-6">
      {PROFILE.map((q) => (
        <FormField key={q.id} label={q.ask}>
          <div className="flex flex-col items-start gap-2">
            <AnswerInput question={q} value={profile[q.id]} onChange={(answer) => save(q.id, answer)} />
            {profile[q.id] ? (
              <button type="button" onClick={() => save(q.id, null)} className="text-xs text-fg-subtle underline hover:text-fg-normal">
                Clear answer
              </button>
            ) : (
              <span className="text-xs text-fg-subtle">Not answered: you'll see everything this question decides.</span>
            )}
          </div>
        </FormField>
      ))}
    </div>
  );
}

/** A few answers as buttons; a long list (a state) as a select. */
function AnswerInput({ question, value, onChange }: { question: ProfileQuestion; value: string | undefined; onChange: (answer: string) => void }) {
  const options = Object.entries(question.answers).map(([answer, label]) => ({ value: answer, label }));
  if (options.length <= 4) return <RadioButtonGroup aria-label={question.ask} options={options} value={value ?? ""} onValueChange={onChange} />;
  return <Select aria-label={question.ask} options={options} value={value} placeholder="Choose…" onValueChange={onChange} className="w-full max-w-xs" />;
}
