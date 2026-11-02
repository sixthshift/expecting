import { Card } from "@sixthshift/design-system/card";
import type { Section } from "../../../../../../lib/planner/lists/sections";
import { useListPage } from "../../contexts/ListPageContext";
import { sectionIcon } from "../icons";
import { ListLine } from "../line/ListLine";

/** One section of a list as a card: its icon, heading and how many of its `total` are got, then its lines. */
export function SectionCard({ section, total }: { section: Section; total: number }) {
  const { listId } = useListPage();
  const Icon = sectionIcon(listId, section.key);
  return (
    <Card size="md" className="mb-4 flex break-inside-avoid flex-col">
      <section aria-label={section.title ?? undefined} className="flex flex-col">
        {section.title ? (
          <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-fg-strong">
            {Icon ? <Icon aria-hidden size={16} className="text-fg-brand" /> : null}
            <span className="flex-1">{section.title}</span>
            <span className="text-xs font-normal text-fg-subtle">
              {section.got} of {total}
            </span>
          </h2>
        ) : null}
        {section.lines.map((line) => (
          <ListLine key={line.id} line={line} />
        ))}
      </section>
    </Card>
  );
}
