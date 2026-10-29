import { Button } from "@sixthshift/design-system/button";
import { cn } from "@sixthshift/design-system/utils";
import { Check } from "lucide-react";
import { useState } from "react";
import { setExtras } from "../../../api/rpc/extras";
import { extrasFor, extrasOn } from "../../../lib/extras";
import { factsOf } from "../../../lib/facts";
import type { Extra } from "../../settings/model/extras";
import { SkipButton } from "../parts";
import type { Advance, Screen, StepContext } from "../step";

/** The extras onboarding offers (`onboarding: true`): any to turn on now. Adding decides every one (those not chosen, off); a skip decides none, so This week can offer each in its week, as it does every extra onboarding doesn't offer. */
export function extrasStep({ answers, extras, advance }: StepContext): Screen {
  return {
    title: "Anything else you'd like?",
    lead: "Expecting can do a few extra things. Choose any that suit you; you can change them in settings.",
    body: <Extras offered={extrasFor(factsOf(answers)).filter((e) => e.onboarding)} on={extrasOn(extras)} onDone={advance} />,
  };
}

function Extras({ offered, on, onDone }: { offered: readonly Extra[]; on: ReadonlySet<string>; onDone: Advance }) {
  const [chosen, setChosen] = useState<ReadonlySet<string>>(on);
  const [saving, setSaving] = useState(false);
  const toggle = (id: string) =>
    setChosen((c) => {
      const next = new Set(c);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  return (
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
                <span className={cn("text-base", picked ? "text-fg-on-brand-subtle" : "text-fg-strong")}>{e.name}</span>
                <span className="text-sm text-fg-subtle">{e.pitch}</span>
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
              await onDone(() => setExtras({ data: offered.map((e) => ({ id: e.id, on: chosen.has(e.id) })) }));
            } finally {
              setSaving(false);
            }
          }}
        >
          {chosen.size === 1 ? "Add it" : `Add these ${chosen.size}`}
        </Button>
      ) : null}
      <SkipButton onClick={() => onDone()} />
    </div>
  );
}
