import { Button } from "@sixthshift/design-system/button";
import { useState } from "react";
import { itsTimeSaves } from "../../../../../api/rpc/itsTime";
import type { Ending } from "../../../../../lib/itsTime";
import { useSave } from "../../../../hooks/useSave";
import { useItsTimePage } from "../../contexts/ItsTimePageContext";

/** The end of a start: we're there, or a false alarm and home again. Asked twice: a stray tap shouldn't end the night. */
export function End() {
  const { start, home } = useItsTimePage();
  const end = useSave(itsTimeSaves.endStart);
  const [asking, setAsking] = useState<Ending | null>(null);
  if (!start) return null;
  const startId = start.id;
  const label: Record<Ending, string> = { there: home ? "The midwife's here" : "We're there", home: "False alarm, we're home" };
  if (asking) {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-border-subtle bg-bg-subtle p-4">
        <p className="text-fg-strong">
          {asking === "there" ? "End this start? The night is kept in the Journal." : "End this start? The contractions are kept here."}
        </p>
        <div className="flex gap-2">
          <Button intent="brand" onClick={() => end({ startId, ended: asking })}>
            {label[asking]}
          </Button>
          <Button variant="outline" onClick={() => setAsking(null)}>
            Not yet
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2 border-border-subtle border-t pt-6 sm:flex-row">
      <Button size="lg" variant="outline" className="min-h-14 flex-1" onClick={() => setAsking("there")}>
        {label.there}
      </Button>
      <Button size="lg" variant="ghost" className="min-h-14 flex-1" onClick={() => setAsking("home")}>
        {label.home}
      </Button>
    </div>
  );
}
