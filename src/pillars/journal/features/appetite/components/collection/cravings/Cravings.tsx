import { useAppetiteQuery } from "../../../../../../../api/rpc/appetite";
import { useSettingsQuery } from "../../../../../../../api/rpc/settings";
import { tally } from "../../../../../../../lib/journal/appetite";
import { TallyList } from "./TallyList";

/** What you've craved, most first, and what you've gone off: the fun part, for later. */
export function Cravings() {
  const { data: entries } = useAppetiteQuery();
  const { data: settings } = useSettingsQuery();
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:gap-12">
      <TallyList title="What you've craved" tallies={tally(entries, "craving")} dueDate={settings.dueDate} times />
      <TallyList title="Gone off" tallies={tally(entries, "off")} dueDate={settings.dueDate} times={false} />
    </div>
  );
}
