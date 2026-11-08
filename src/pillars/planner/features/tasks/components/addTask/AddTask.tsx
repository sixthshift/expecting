import { checklistSaves } from "../../../../../../api/rpc/checklist";
import { useSave } from "../../../../../../app/hooks/useSave";
import { weekInSentence } from "../../../../../../lib/labels";
import { newId } from "../../../../../../lib/outbox";
import { type Week, weekLabel } from "../../../../../../lib/timeline";
import { AddOne } from "../../../../components/AddOne";

/** A task of our own, for the odd thing Expecting couldn't know: added in the Planner, for this week. `text`: its words to start (shared from another app). `onAdded` once it's kept (the capture sheet closes). */
export function AddTask({ week, text, onAdded }: { week: Week; text?: string; onAdded?: () => void }) {
  const add = useSave(checklistSaves.addOwnTask);
  return (
    <AddOne
      label={`New task for ${weekLabel(week)}`}
      placeholder={`Add a task for ${weekInSentence(week)}`}
      add="Add task"
      start={text}
      onAdd={(title) => {
        add({ id: newId(), title, week });
        onAdded?.();
      }}
    />
  );
}
