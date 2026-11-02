import { Button } from "@sixthshift/design-system/button";
import { Checkbox } from "@sixthshift/design-system/checkbox";
import { Trash2 } from "lucide-react";
import { itsTimeSaves } from "../../../../api/rpc/itsTime";
import { useSave } from "../../../../app/hooks/useSave";
import type { StartLine } from "../../../../lib/itsTime";

/** A last thing of your own, ticked for this start, or taken off for every start. */
export function OwnLine({ line, checked, disabled, onTick }: { line: StartLine; checked: boolean; disabled: boolean; onTick: (on: boolean) => void }) {
  const remove = useSave(itsTimeSaves.deleteStartLine);
  return (
    <li className="flex min-h-11 items-center justify-between gap-2">
      <Checkbox label={line.title} checked={checked} disabled={disabled} onCheckedChange={(on) => onTick(on === true)} />
      <Button variant="ghost" size="sm" iconOnly aria-label={`Take off “${line.title}”`} onClick={() => remove({ id: line.id })}>
        <Trash2 aria-hidden size={16} />
      </Button>
    </li>
  );
}
