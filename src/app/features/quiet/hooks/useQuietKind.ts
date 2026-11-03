import { useQuietQuery } from "../../../../api/rpc/quiet";
import type { QuietKind } from "../../../../lib/quiet";

/** What has happened, or null: for a part both worlds draw, which reads neither world's context. */
export function useQuietKind(): QuietKind | null {
  const { data: quiet } = useQuietQuery();
  return quiet?.kind ?? null;
}
