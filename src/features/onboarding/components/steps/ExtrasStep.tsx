import { Button } from "@sixthshift/design-system/button";
import { cn } from "@sixthshift/design-system/utils";
import { Check } from "lucide-react";
import { useState } from "react";
import { setExtras, useExtrasQuery } from "../../../../api/rpc/extras";
import { useAnswersQuery } from "../../../../api/rpc/facts";
import { extrasFor, extrasOn } from "../../../../lib/extras";
import { factsOf } from "../../../../lib/facts";
import { ExtraPitch } from "../../../settings/components/extraPitch/ExtraPitch";
import { useOnboardingPage } from "../../contexts/OnboardingPageContext";
import { OnboardingFrame } from "../OnboardingFrame";
import { SkipButton } from "../SkipButton";

/** The extras onboarding offers (`onboarding: true`): any to turn on now. Adding decides every one (those not chosen, off); a skip decides none, so This week can offer each in its week, as it does every extra onboarding doesn't offer. */
export function ExtrasStep() {
  const { data: facts } = useAnswersQuery({ select: factsOf });
  const { data: on } = useExtrasQuery({ select: extrasOn });
  const { advance } = useOnboardingPage();
  const offered = extrasFor(facts).filter((e) => e.onboarding);
  const [chosen, setChosen] = useState<ReadonlySet<string>>(on);
  const [saving, setSaving] = useState(false);
  const toggle = (id: string) =>
    setChosen((c) => {
      const next = new Set(c);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  return (
    <OnboardingFrame title="Anything else you'd like?" lead="Expecting can do a few extra things. Choose any that suit you; you can change them in settings.">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          {offered.map((e) => {
            const picked = chosen.has(e.id);
            return (
              <button
                key={e.id}
                type="button"
                aria-pressed={picked}
                onClick={() => toggle(e.id)}
                className={cn(
                  "flex min-h-14 w-full items-center gap-3 rounded-xl border bg-bg-normal px-4 py-3 text-left transition-colors hover:border-border-brand-hovered",
                  picked ? "border-border-brand bg-bg-brand-subtle" : "border-border-normal"
                )}
              >
                <span className="flex flex-1 flex-col gap-0.5">
                  <ExtraPitch extra={e} pitchClassName={cn("text-sm", picked ? "text-fg-normal" : "text-fg-subtle")}>
                    <span className={cn("text-base", picked ? "text-fg-on-brand-subtle" : "text-fg-strong")}>{e.name}</span>
                  </ExtraPitch>
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-md border",
                    picked ? "border-border-brand bg-bg-brand-strong text-fg-on-brand-strong" : "border-border-normal"
                  )}
                >
                  {picked ? <Check size={16} strokeWidth={3} /> : null}
                </span>
              </button>
            );
          })}
        </div>
        {chosen.size > 0 ? (
          <Button
            intent="brand"
            size="xl"
            loading={saving}
            className="w-full"
            onClick={async () => {
              setSaving(true);
              try {
                await advance(() => setExtras({ data: offered.map((e) => ({ id: e.id, on: chosen.has(e.id) })) }));
              } finally {
                setSaving(false);
              }
            }}
          >
            {chosen.size === 1 ? "Add it" : `Add these ${chosen.size}`}
          </Button>
        ) : null}
        <SkipButton onClick={() => advance()} />
      </div>
    </OnboardingFrame>
  );
}
