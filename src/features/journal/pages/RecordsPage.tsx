import { useQuietQuery } from "../../../api/rpc/quiet";
import { PillarHeader } from "../../../app/components/layout/PillarLayout";
import { JournalTabs } from "../components/JournalTabs";
import { Records } from "../components/records/Records";

/**
 * The Journal's records: what's kept, said as a short answer and the lines
 * behind it, to look up rather than read back (the midwife's "since
 * when?", "how often?", the paper asked for at triage). Each opens at full
 * size (`RecordPage`). The story is the other way in (`JournalTabs`). See
 * docs/product/journal.md, The records.
 */
export function RecordsPage() {
  const { data: quiet } = useQuietQuery({ select: (q) => q?.kind ?? null });
  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
      <PillarHeader title="Journal" />
      <div className="flex min-w-0 flex-col gap-6">
        <JournalTabs current="records" />
        <Records quiet={quiet} />
      </div>
    </main>
  );
}
