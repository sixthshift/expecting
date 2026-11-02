import { Lightbulb } from "lucide-react";
import { useMemo } from "react";
import { headsUps } from "../../../../lib/library/thisWeek";
import { ItemLink } from "../../../library/components/itemLink/ItemLink";
import { useItems } from "../../../library/hooks/useItems";
import { useThisWeekPage } from "../../contexts/ThisWeekPageContext";

/** The week's heads-up: one of the things nobody tells you (`headsUps` in src/lib/library/thisWeek.ts), read without opening. */
export function HeadsUp() {
  const { week } = useThisWeekPage();
  const items = useItems();
  const cards = useMemo(() => headsUps(items), [items]);
  const card = week === null ? undefined : cards.get(week);
  if (!card) return null;
  return (
    <section aria-labelledby="heads-up" className="flex flex-col gap-2">
      <h2 id="heads-up" className="flex items-center gap-2 text-sm font-medium text-fg-subtle">
        <Lightbulb aria-hidden size={16} className="text-fg-brand" />
        Nobody tells you
      </h2>
      <ItemLink itemId={card.id} className="flex flex-col gap-1 rounded-xl border border-border-subtle bg-bg-normal p-4 hover:border-border-normal">
        <span className="font-medium text-fg-strong">{card.title}</span>
        {card.summary ? <span className="text-sm text-fg-normal">{card.summary}</span> : null}
      </ItemLink>
    </section>
  );
}
