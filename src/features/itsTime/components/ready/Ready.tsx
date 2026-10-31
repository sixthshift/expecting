import { Button } from "@sixthshift/design-system/button";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { itsTimeSaves } from "../../../../api/rpc/itsTime";
import { useSave } from "../../../../app/hooks/useSave";
import { newId } from "../../../../lib/outbox";
import type { ReadyThing } from "../../model/ready";
import { Part } from "../CallButton";

/**
 * Getting ready: nothing has started. The two ways in, each opening a start;
 * then what the night's page still needs, each a tap to where it goes; and,
 * once, ringing the number to check it. Below this the rest of the page shows
 * as it will on the night: the practice run.
 */
export function Ready({ things, home }: { things: readonly ReadyThing[]; home: boolean }) {
  const begin = useSave(itsTimeSaves.beginStart);
  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="nothing-yet" className="flex flex-col gap-3">
        <p id="nothing-yet" className="text-fg-strong">
          Nothing's started. When it does, tap one of these.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button size="lg" intent="brand" className="min-h-14 flex-1" onClick={() => begin({ id: newId(), waters: true })}>
            The waters broke
          </Button>
          <Button size="lg" intent="brand" className="min-h-14 flex-1" onClick={() => begin({ id: newId(), waters: false })}>
            Contractions started
          </Button>
        </div>
      </section>

      <Part id="ready" title="Ready for the night">
        {things.length > 0 ? (
          <ul className="flex flex-col divide-y divide-border-subtle rounded-xl border border-border-subtle bg-bg-normal">
            {things.map((t) => (
              <li key={t.key}>
                <ThingLink thing={t} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-fg-normal">Everything the night needs is filled in.</p>
        )}
        <p className="text-sm text-fg-normal">
          Once, together: ring {home ? "your midwife's" : "the birth suite's"} number now to check it, and ask what they'll want on the night. Then read this
          page through, so it's familiar when it counts.
        </p>
      </Part>
    </div>
  );
}

function ThingLink({ thing }: { thing: ReadyThing }) {
  const cls = "flex min-h-12 items-center justify-between gap-3 px-4 text-fg-normal hover:text-fg-strong";
  const inner = (
    <>
      {thing.text}
      <ChevronRight aria-hidden size={16} className="shrink-0 text-fg-subtle" />
    </>
  );
  if (thing.to === "bag")
    return (
      <Link to="/planner/lists/$listId" params={{ listId: "bag" }} className={cls}>
        {inner}
      </Link>
    );
  return (
    <Link to={thing.to === "planner" ? "/planner" : "/emergency"} className={cls}>
      {inner}
    </Link>
  );
}
