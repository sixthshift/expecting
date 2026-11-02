import { useQuietQuery } from "../../../api/rpc/quiet";
import { JournalFrame } from "../components/JournalFrame";
import { Records } from "../components/records/Records";

/**
 * The Journal's records: what's kept, said as a short answer and the lines
 * behind it, to look up rather than read back (the midwife's "since
 * when?", "how often?", the paper asked for at triage). Each opens at full
 * size (`RecordPage`). The story is the other way in (`JournalFrame`). See
 * docs/product/journal.md, The records.
 */
export function RecordsPage() {
  const { data: quiet } = useQuietQuery({ select: (q) => q?.kind ?? null });
  return (
    <JournalFrame current="records">
      <Records quiet={quiet} />
    </JournalFrame>
  );
}
