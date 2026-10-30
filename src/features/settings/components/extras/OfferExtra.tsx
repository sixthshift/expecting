import { Button } from "@sixthshift/design-system/button";
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { extrasSaves, useExtras } from "../../../../api/rpc/extras";
import { useAnswers } from "../../../../api/rpc/facts";
import { useNow } from "../../../../api/rpc/settings";
import { useSave } from "../../../../app/hooks/useSave";
import { extraToOffer } from "../../../../lib/extras";
import { factsOf } from "../../../../lib/facts";

/**
 * This week offers an extra once, in its week (`offer` in
 * src/features/settings/model/extras.data.ts), if nobody has decided on it: one at a time. Either
 * answer decides it, so it isn't offered again; settings can change it.
 */
export function OfferExtra() {
  const { data: choices } = useExtras();
  const now = useNow();
  const { data: facts } = useAnswers({ select: factsOf });
  const setExtras = useSave(extrasSaves.setExtras);
  const save = (id: string, on: boolean) => setExtras([{ id, on }]);
  if (now === null) return null;
  const extra = extraToOffer(choices, now, facts);
  if (!extra) return null;

  return (
    <section
      aria-labelledby="offer-extra"
      className="flex flex-col gap-3 rounded-xl bg-linear-to-br from-(--expecting-accent-soft-from) to-(--expecting-accent-soft-to) p-4"
    >
      <div className="flex items-start gap-3">
        <Sparkles aria-hidden size={18} className="mt-0.5 shrink-0 text-fg-brand" />
        <div className="flex flex-col gap-1">
          <h2 id="offer-extra" className="font-display font-semibold text-fg-strong">
            Add {extra.name.toLowerCase()}?
          </h2>
          <p className="text-sm text-fg-normal">{extra.pitch}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button intent="brand" size="sm" onClick={() => save(extra.id, true)}>
          Add it
        </Button>
        <Button variant="ghost" size="sm" onClick={() => save(extra.id, false)}>
          No thanks
        </Button>
        <Link to="/settings" search={{ ask: `extra:${extra.id}` }} className="ml-auto text-xs text-fg-normal underline hover:text-fg-strong">
          All the extras
        </Link>
      </div>
    </section>
  );
}
