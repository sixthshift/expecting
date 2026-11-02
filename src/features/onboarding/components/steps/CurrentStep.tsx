import { useOnboardingPage } from "../../contexts/OnboardingPageContext";
import { BabyStep } from "./BabyStep";
import { DueStep } from "./DueStep";
import { ExtrasStep } from "./ExtrasStep";
import { QuestionStep } from "./QuestionStep";
import { ReadyStep } from "./ReadyStep";

/** The screen for the step the URL names. Each step is its own file here. */
export function CurrentStep() {
  const { current } = useOnboardingPage();
  switch (current) {
    case "due":
      return <DueStep />;
    case "baby":
      return <BabyStep />;
    case "extras":
      return <ExtrasStep />;
    case "ready":
      return <ReadyStep />;
    default:
      return <QuestionStep askKey={current.slice(2)} />;
  }
}
