import { Button } from "@sixthshift/design-system/button";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useEmergencyQuery } from "../../../../api/rpc/emergency";
import { EmergencyForm } from "../components/form/EmergencyForm";
import { EmergencyView } from "../components/view/EmergencyView";

/**
 * Emergency info: the one page to open when something goes wrong, or labour starts,
 * and to hand to whoever is treating her. The calls in one row, then the handover
 * (who, how far along, allergies, blood, the pregnancy, medicines, history, where
 * she's booked), fitting a phone's first screen; below it, the papers kept handy
 * (the birth plan at triage, with no signal too), when to call, everyone else to
 * call and the front desk's numbers. Both of you fill it in.
 */
export function EmergencyPage() {
  const { data: emergency } = useEmergencyQuery();
  const [editing, setEditing] = useState(false);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-16 md:px-8 lg:pt-10">
      <div className="flex max-w-3xl flex-col gap-4 lg:gap-6">
        <header className="flex items-center justify-between gap-3">
          <h1 className="font-display text-2xl font-semibold text-fg-strong lg:text-3xl">Emergency info</h1>
          {editing ? null : (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="shrink-0">
              <Pencil aria-hidden size={16} /> Edit
            </Button>
          )}
        </header>
        {editing ? <EmergencyForm emergency={emergency} done={() => setEditing(false)} /> : <EmergencyView emergency={emergency} />}
      </div>
    </main>
  );
}
