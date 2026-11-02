import { saveAnswer, useAnswersQuery } from "../../../../../api/rpc/facts";
import { usePeopleQuery } from "../../../../../api/rpc/people";
import { latestByKey } from "../../../../../lib/facts";
import { AnswerField } from "../../../settings/components/answer/AnswerField";
import { ask, askedOf } from "../../../settings/model/facts";
import { useOnboardingPage } from "../../contexts/OnboardingPageContext";
import { Choices } from "../Choices";
import { OnboardingLayout } from "../OnboardingLayout";
import { SkipButton } from "../SkipButton";
import { ChooseFromList } from "./ChooseFromList";

/**
 * One of src/app/features/settings/model/facts.data.ts's onboarding questions, by
 * its key, skippable. A skip is kept, unless it's already answered, so This
 * week asks it again only once its week has come, not straight away.
 */
export function QuestionStep({ askKey }: { askKey: string }) {
  const { data: last } = useAnswersQuery({ select: (answers) => latestByKey(answers)[askKey] });
  const { people } = usePeopleQuery().data;
  const { advance } = useOnboardingPage();
  const a = ask(askKey)!;
  const label = askedOf(a, people);
  const value = last?.value ?? undefined;
  const save = (answer: string | null) => () => saveAnswer({ data: { key: askKey, answer } });
  const options = Object.entries(a.question.answers).map(([value, label]) => ({ value, label }));

  return (
    <OnboardingLayout title={label} lead="It tailors what Expecting shows you. Skip it and you'll see everything, and be asked again when it matters.">
      <div className="flex flex-col gap-4">
        <AnswerField
          question={a.question}
          label={label}
          value={value}
          submitLabel="Next"
          wide
          requireChange={false}
          onAnswer={(answer) => advance(save(answer))}
          choice={
            options.length <= 4 ? (
              <Choices options={options} value={value} onChoose={(answer) => advance(save(answer))} />
            ) : (
              <ChooseFromList ask={a} name={label} value={value} />
            )
          }
        />
        <SkipButton onClick={() => advance(last ? undefined : save(null))} />
      </div>
    </OnboardingLayout>
  );
}
