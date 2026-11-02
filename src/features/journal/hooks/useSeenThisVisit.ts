import { useEffect, useState } from "react";
import { journalSeenSaves, useJournalSeen } from "../../../api/rpc/journal";
import { usePeople } from "../../../api/rpc/people";
import { useSave } from "../../../app/hooks/useSave";

/**
 * Opening the Journal marks it seen, for whoever's holding the phone, quiet
 * or not (so what the other kept since you looked is right once the quiet
 * time ends). Gives when you last looked, as it was when you came in: this
 * visit marks it, and what it shows stays for this visit.
 */
export function useSeenThisVisit(): string | null {
  const { data: seen } = useJournalSeen();
  const { data: people } = usePeople();
  const markSeen = useSave(journalSeenSaves.markJournalSeen);
  const [lastSeen] = useState(seen);

  // Once a visit, for whoever's holding the phone: `markSeen` is a new function each render.
  const me = people.me?.id;
  // biome-ignore lint/correctness/useExhaustiveDependencies: marked once as the page opens (and as who's holding it changes), not on every render.
  useEffect(() => {
    if (me) markSeen(undefined);
  }, [me]);

  return lastSeen;
}
