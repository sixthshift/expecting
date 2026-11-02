import { getRouteApi } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useQuietQuery } from "../../../api/rpc/quiet";
import { PillarHeader } from "../../../app/components/layout/PillarLayout";
import type { QuietKind } from "../../../lib/quiet";
import type { RecordKind } from "../../../lib/records";
import { FeelingsLens } from "../../feelings/components/history/Feelings";
import { JournalTabs } from "../components/JournalTabs";
import { AppetiteLens } from "../components/records/appetite/AppetiteLens";
import { MovementsLens } from "../components/records/movements/MovementsLens";
import { PapersLens } from "../components/records/papers/PapersLens";
import { Records } from "../components/records/Records";

const route = getRouteApi("/app/journal/records");

/** The kinds folded away while something has happened: not a record then. */
const FOLDED: readonly RecordKind[] = ["movements", "appetite"];

/** One kind at full size: its pattern, its tools, then each. */
function RecordOpen({ kind, quiet }: { kind: RecordKind; quiet: QuietKind | null }) {
  const navigate = route.useNavigate();
  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => navigate({ search: {} })}
        className="flex min-h-10 items-center gap-1 self-start text-sm text-fg-subtle hover:text-fg-normal"
      >
        <ChevronLeft aria-hidden size={16} />
        All records
      </button>
      {kind === "movements" ? <MovementsLens /> : null}
      {kind === "appetite" ? <AppetiteLens /> : null}
      {kind === "feelings" ? <FeelingsLens /> : null}
      {kind === "papers" ? <PapersLens quiet={quiet} /> : null}
    </div>
  );
}

/**
 * The Journal's records: what's kept, said in a few lines, to look up
 * rather than read back (the midwife's "since when?", "how often?", the
 * paper asked for at triage). Each opens at full size (`?show=`). The story
 * is the other way in (`JournalTabs`). See docs/product/journal.md, The
 * records.
 */
export function RecordsPage() {
  const { show } = route.useSearch();
  const { data: quietNow } = useQuietQuery();
  const quiet = quietNow?.kind ?? null;
  const open = show && !(quiet && FOLDED.includes(show)) ? show : null;
  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
      <PillarHeader title="Journal" />
      <div className="flex min-w-0 flex-col gap-6">
        <JournalTabs current="records" />
        {open ? <RecordOpen kind={open} quiet={quiet} /> : <Records quiet={quiet} />}
      </div>
    </main>
  );
}
