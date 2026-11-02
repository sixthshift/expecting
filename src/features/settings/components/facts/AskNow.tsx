import { Card } from "@sixthshift/design-system/card";
import { Link } from "@tanstack/react-router";
import { factsSaves, useAnswersQuery } from "../../../../api/rpc/facts";
import { usePeopleQuery } from "../../../../api/rpc/people";
import { useNow, useSettingsQuery } from "../../../../api/rpc/settings";
import { useSave } from "../../../../app/hooks/useSave";
import { DateForm } from "../../../../components/DateForm";
import { questionsDue } from "../../../../lib/facts";
import { AnswerInput, askedOfIn } from "./FactsForm";

/** How many questions This week asks at once; the rest wait their turn. */
const SHOWN = 3;

/**
 * The questions This week asks: each one's week has come and its answer is
 * still unknown or unsure. An answer changes the plan; "Not now" puts it off
 * a few weeks. Every answer can be changed in settings.
 */
export function AskNow() {
  const { data: settings } = useSettingsQuery();
  const { data: answers } = useAnswersQuery();
  const { people } = usePeopleQuery().data;
  const now = useNow();
  const saveAnswer = useSave(factsSaves.saveAnswer);
  const save = async (key: string, answer: string | null) => saveAnswer({ key, answer });
  const { dueDate } = settings;
  if (now === null || !dueDate) return null;
  const due = questionsDue({ answers, now, dueDate });
  if (due.length === 0) return null;
  const more = due.length - SHOWN;

  return (
    <section aria-labelledby="ask-now" className="flex flex-col gap-2">
      <h2 id="ask-now" className="text-lg font-display font-semibold text-fg-strong">
        Expecting needs to know
      </h2>
      <p className="text-sm text-fg-subtle">Your answers decide what's on your plan, and when.</p>
      <div className="flex flex-col gap-3">
        {due.slice(0, SHOWN).map((a) => {
          const label = askedOfIn(a, people);
          return (
            <Card key={a.key}>
              <fieldset className="flex flex-col items-start gap-2">
                <legend className="mb-2 font-medium text-fg-strong">{label}</legend>
                {a.question.type === "date" ? (
                  <DateForm label="Date" value={null} submitLabel="Save" onSave={(date) => save(a.key, date)} />
                ) : (
                  <AnswerInput question={a.question} label={label} value={undefined} inline onChange={(answer) => save(a.key, answer)} />
                )}
                <button
                  type="button"
                  onClick={() => save(a.key, null)}
                  aria-label={`Not now: ${label}`}
                  className="-mb-2 min-h-11 text-sm text-fg-subtle underline hover:text-fg-normal"
                >
                  Not now
                </button>
              </fieldset>
            </Card>
          );
        })}
      </div>
      {more > 0 ? (
        <Link to="/settings" className="flex min-h-11 w-fit items-center text-sm text-fg-subtle underline hover:text-fg-normal">
          {more === 1 ? "1 more after these" : `${more} more after these`}, or answer them all now
        </Link>
      ) : null}
    </section>
  );
}
