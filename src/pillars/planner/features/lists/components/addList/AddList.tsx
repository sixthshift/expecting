import { useNavigate } from "@tanstack/react-router";
import { listsSaves } from "../../../../../../api/rpc/lists";
import { useSave } from "../../../../../../app/hooks/useSave";
import { newId } from "../../../../../../lib/outbox";
import { AddOne } from "../../../../components/AddOne";

/** A list of your own, named, then opened to fill in. */
export function AddList() {
  const add = useSave(listsSaves.addList);
  const navigate = useNavigate();
  return (
    <AddOne
      label="A new list's name"
      placeholder="A list of your own"
      add="New list"
      addText
      className="max-w-xl"
      onAdd={(title) => {
        const id = newId();
        add({ id, title });
        navigate({ to: "/planner/lists/$listId", params: { listId: id } });
      }}
    />
  );
}
