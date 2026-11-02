import { getRouteApi, Link, Navigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useQuietQuery } from "../../../api/rpc/quiet";
import { PillarHeader } from "../../../app/components/layout/PillarLayout";
import type { RecordKind } from "../../../lib/records";
import { FeelingsRecord } from "../../feelings/components/history/Feelings";
import { JournalTabs } from "../components/JournalTabs";
import { AppetiteRecord } from "../components/records/appetite/AppetiteRecord";
import { MovementsRecord } from "../components/records/movements/MovementsRecord";
import { PapersRecord } from "../components/records/papers/PapersRecord";

const route = getRouteApi("/app/journal/records/$kind");

/** The records folded away while something has happened: not a record then, even asked for by address. */
const FOLDED: readonly RecordKind[] = ["movements", "appetite"];

/** One of the Journal's records at full size (`/journal/records/movements`): its pattern, its tools, then every one. */
export function RecordPage() {
  // The route lets through only a record's kind.
  const kind = route.useParams().kind as RecordKind;
  const { data: quiet } = useQuietQuery({ select: (q) => q?.kind ?? null });
  if (quiet && FOLDED.includes(kind)) return <Navigate to="/journal/records" replace />;
  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
      <PillarHeader title="Journal" />
      <div className="flex min-w-0 flex-col gap-6">
        <JournalTabs current="records" />
        <div className="flex flex-col gap-4">
          <Link to="/journal/records" className="flex min-h-10 items-center gap-1 self-start text-sm text-fg-subtle hover:text-fg-normal">
            <ChevronLeft aria-hidden size={16} />
            All records
          </Link>
          {kind === "movements" ? <MovementsRecord /> : null}
          {kind === "appetite" ? <AppetiteRecord /> : null}
          {kind === "feelings" ? <FeelingsRecord /> : null}
          {kind === "papers" ? <PapersRecord quiet={quiet} /> : null}
        </div>
      </div>
    </main>
  );
}
