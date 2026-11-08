import { useState } from "react";
import { journalSaves } from "../../../../../api/rpc/journal";
import { useSave } from "../../../../../app/hooks/useSave";
import { newId } from "../../../../../lib/outbox";
import { UntilDone } from "../../../components/UntilDone";
import { MovementForm } from "./MovementForm";
import { MovementsChanged } from "./MovementsChanged";

/**
 * A new movement. `onAdded` once it's kept (the capture sheet closes); one
 * felt as different keeps the call on screen until it's put away, so it
 * never closes on its own.
 */
export function AddMovement({ onAdded }: { onAdded?: (id: string) => void }) {
  const add = useSave(journalSaves.addMovement);
  // The one just kept, felt as different: the call stays on screen until Done.
  const [changed, setChanged] = useState<string | null>(null);

  if (changed) {
    return (
      <UntilDone
        onDone={() => {
          setChanged(null);
          onAdded?.(changed);
        }}
      >
        <MovementsChanged />
      </UntilDone>
    );
  }

  return (
    <MovementForm
      submitLabel="Keep it"
      onSave={(draft) => {
        const id = newId();
        add({ id, ...draft });
        if (draft.different) setChanged(id);
        else onAdded?.(id);
      }}
    />
  );
}
