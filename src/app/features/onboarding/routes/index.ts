import { baby } from "./baby";
import { due } from "./due";
import { extras } from "./extras";
import { onboardingNext } from "./next";
import { onboarding } from "./onboarding";
import { question } from "./question";
import { ready } from "./ready";

/** The first-run questions' addresses: on to the next step, then a step to a URL. */
export const onboardingRoutes = onboarding.addChildren([onboardingNext, due, baby, question, extras, ready]);
