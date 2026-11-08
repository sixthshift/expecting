import { Button } from "@sixthshift/design-system/button";
import { Pencil, Trash2 } from "lucide-react";
import { type ReactNode, useState } from "react";

/**
 * Under a photo or a paper opened: Change and Delete, and any other way
 * between them (`children`: a download). Deleting asks first (`asks`): it
 * goes from both phones, with nothing to put back.
 */
export function ChangeOrDelete({ asks, onChange, onDelete, children }: { asks: string; onChange: () => void; onDelete: () => void; children?: ReactNode }) {
  const [confirming, setConfirming] = useState(false);
  if (confirming) {
    return (
      <div role="alert" className="flex flex-col gap-2 rounded-lg border border-border-normal p-3">
        <p className="text-sm text-fg-strong">{asks}</p>
        <div className="flex gap-2">
          <Button intent="danger" size="sm" onClick={onDelete}>
            Delete it
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
            Keep it
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-1">
      <Button variant="ghost" size="sm" onClick={onChange}>
        <Pencil aria-hidden size={16} /> Change
      </Button>
      {children}
      <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
        <Trash2 aria-hidden size={16} /> Delete
      </Button>
    </div>
  );
}
