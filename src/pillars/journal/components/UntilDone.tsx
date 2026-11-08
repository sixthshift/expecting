import { Button } from "@sixthshift/design-system/button";
import type { ReactNode } from "react";

/** A call to make, or a word worth reading, kept on screen until Done: it never goes on its own. */
export function UntilDone({ onDone, children }: { onDone: () => void; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      {children}
      <Button variant="outline" onClick={onDone}>
        Done
      </Button>
    </div>
  );
}
