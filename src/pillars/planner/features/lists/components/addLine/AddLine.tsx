import { listsSaves } from "../../../../../../api/rpc/lists";
import { useSave } from "../../../../../../app/hooks/useSave";
import { newId } from "../../../../../../lib/outbox";
import { AddOne } from "../../../../components/AddOne";

/** A line of your own on a list, for what Expecting couldn't know. */
export function AddLine({ listId }: { listId: string }) {
  const add = useSave(listsSaves.addLine);
  return (
    <AddOne
      label="Something to add"
      placeholder="Add something…"
      add="Add it"
      className="max-w-xl"
      onAdd={(title) => add({ id: newId(), listId, title, section: null })}
    />
  );
}
