import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { OnboardingPage } from "../../../../src/app/features/onboarding/contexts/OnboardingPageContext";
import { onboardingSteps } from "../../../../src/lib/onboarding";

// A step's context: the step the URL names among those left to ask, the one
// before it, and the ways on; a step that isn't asked goes back to onboarding.
const where = vi.hoisted(() => ({ pathname: "/onboarding/baby", onboardedAt: null as string | null, saves: true }));
const navigated: unknown[] = [];
const finishOnboarding = vi.fn(async () => undefined);
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => async (to: unknown) => {
    navigated.push(to);
  },
  useMatch: ({ select }: { select: (m: { pathname: string }) => string }) => select({ pathname: where.pathname }),
}));
vi.mock("../../../../src/api/rpc/settings", () => ({
  finishOnboarding: () => finishOnboarding(),
  useSettingsQuery: ({ select }: { select: (s: { onboardedAt: string | null }) => unknown }) => ({ data: select({ onboardedAt: where.onboardedAt }) }),
}));
vi.mock("../../../../src/api/rpc/facts", () => ({ useAnswersQuery: () => ({ data: [] }) }));
// A save that goes in (or, with `saves` false, fails), as useAction resolves.
vi.mock("../../../../src/app/hooks/useAction", () => ({
  useAction: (save: (step?: () => Promise<unknown>) => Promise<void>) => [
    async (step?: () => Promise<unknown>) => {
      await save(step);
      return where.saves;
    },
    false,
  ],
}));

const { OnboardingPageProvider, useOnboardingPage } = await import("../../../../src/app/features/onboarding/contexts/OnboardingPageContext");

let seen: OnboardingPage;
function Probe() {
  seen = useOnboardingPage();
  return <p>The step</p>;
}
function stepAt(pathname: string) {
  where.pathname = pathname;
  return render(
    <OnboardingPageProvider>
      <Probe />
    </OnboardingPageProvider>
  );
}

beforeEach(() => {
  where.onboardedAt = null;
  where.saves = true;
  navigated.length = 0;
  finishOnboarding.mockClear();
});
afterEach(cleanup);

describe("OnboardingPageProvider", () => {
  it("the step the URL names, among what's left, and the one before it", () => {
    stepAt("/onboarding/baby");
    expect(seen.steps).toEqual(onboardingSteps({ onboarded: false }));
    expect(seen.current).toBe("baby");
    expect(seen.previous).toBe("due");
    cleanup();
    stepAt("/onboarding/due");
    expect(seen.previous).toBeUndefined();
  });

  it("advance saves the answer, then goes on from this step", async () => {
    stepAt("/onboarding/baby");
    const save = vi.fn(async () => undefined);
    await act(() => seen.advance(save));
    expect(save).toHaveBeenCalledOnce();
    expect(navigated).toEqual([{ to: "/onboarding", search: { after: "baby" } }]);
  });

  it("a save that fails stays on the step", async () => {
    where.saves = false;
    stepAt("/onboarding/baby");
    await act(() => seen.advance(async () => undefined));
    expect(navigated).toEqual([]);
  });

  it("finish says onboarding is done, then into the app", async () => {
    stepAt("/onboarding/ready");
    await act(() => seen.finish());
    expect(finishOnboarding).toHaveBeenCalledOnce();
    expect(navigated).toEqual([{ to: "/" }]);
  });

  it("a step that isn't asked goes back to onboarding, to the one that is", () => {
    stepAt("/onboarding/q/no-such-question");
    expect(screen.queryByText("The step")).toBeNull();
    expect(navigated).toEqual([{ href: "/onboarding", replace: true }]);
  });

  it("once onboarded, no step is left, so any goes back", () => {
    where.onboardedAt = "2026-10-01T00:00:00.000Z";
    stepAt("/onboarding/baby");
    expect(screen.queryByText("The step")).toBeNull();
    expect(navigated).toEqual([{ href: "/onboarding", replace: true }]);
  });
});
