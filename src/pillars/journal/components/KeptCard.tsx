import { Button } from "@sixthshift/design-system/button";
import { Card } from "@sixthshift/design-system/card";
import { Pencil, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

/**
 * One thing kept, as a card in its collection: what it is (`children`), then
 * who kept it and when (`meta`), with a way to change it and to delete it,
 * named for what it is (`what`: "this note").
 */
export function KeptCard({
  what,
  meta,
  onChange,
  onDelete,
  children,
}: {
  what: string;
  meta: string;
  onChange: () => void;
  onDelete: () => void;
  children: ReactNode;
}) {
  return (
    <Card size="sm">
      {children}
      <div className="mt-2 flex items-center gap-1 text-xs text-fg-subtle">
        <span className="flex-1">{meta}</span>
        <Button variant="ghost" size="sm" iconOnly aria-label={`Change ${what}`} onClick={onChange}>
          <Pencil aria-hidden size={16} />
        </Button>
        <Button variant="ghost" size="sm" iconOnly aria-label={`Delete ${what}`} onClick={onDelete}>
          <Trash2 aria-hidden size={16} />
        </Button>
      </div>
    </Card>
  );
}
