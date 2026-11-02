import { CurrentStep } from "../components/steps/CurrentStep";
import { OnboardingPageProvider } from "../contexts/OnboardingPageContext";

/**
 * The first-run questions, one to a screen, each at its own URL
 * (`/onboarding/due`), so the phone's back gesture goes back a question: the
 * one the URL names.
 */
export function OnboardingStep() {
  return (
    <OnboardingPageProvider>
      <CurrentStep />
    </OnboardingPageProvider>
  );
}
