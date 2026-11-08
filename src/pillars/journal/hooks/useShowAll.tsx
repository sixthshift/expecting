import { Button } from "@sixthshift/design-system/button";
import { type ReactNode, useState } from "react";

/**
 * A long list in a collection: its first `count` until all are asked for,
 * and the button that asks ("Show all 12", or `label`), nothing once there's
 * no more to show.
 */
export function useShowAll<T>(list: readonly T[], count: number, label = `Show all ${list.length}`): { shown: readonly T[]; more: ReactNode } {
  const [all, setAll] = useState(false);
  const shown = all ? list : list.slice(0, count);
  const more =
    list.length > shown.length ? (
      <Button variant="ghost" size="sm" className="self-start" onClick={() => setAll(true)}>
        {label}
      </Button>
    ) : null;
  return { shown, more };
}
