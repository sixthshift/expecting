import { useListsQuery } from "../../../../../../api/rpc/lists";
import { isLeft } from "../../../../../../lib/planner/lists/lines";
import { sectionsOf } from "../../../../../../lib/planner/lists/sections";
import { useListPage } from "../../contexts/ListPageContext";
import { useLines } from "../../hooks/useLines";
import { NotNeeded } from "./NotNeeded";
import { SectionCard } from "./SectionCard";

/** A list's sections as cards, flowing down two columns on a desktop, what's left first; with "just what's left", only that. The not-needed under them. */
export function Sections() {
  const { listId, leftOnly, tickedHere } = useListPage();
  const lines = useLines();
  const { data: marks } = useListsQuery({ select: (l) => l.marks });
  const { sections, notNeeded } = sectionsOf(listId, lines, marks, tickedHere);
  const shown = sections
    .map((s) => ({ ...s, lines: leftOnly ? s.lines.filter((l) => isLeft(marks[l.id]) || tickedHere.has(l.id)) : s.lines }))
    .filter((s) => s.lines.length > 0);
  return (
    <div className="flex flex-col gap-4">
      {leftOnly && shown.length === 0 ? <p className="text-fg-normal">All sorted: nothing left to get on this list.</p> : null}
      {shown.length > 0 ? (
        <div className="gap-4 desktop:columns-2">
          {shown.map((section) => (
            <SectionCard
              key={section.key ?? "yours"}
              section={section}
              total={sections.find((s) => s.key === section.key)?.lines.length ?? section.lines.length}
            />
          ))}
        </div>
      ) : null}
      {notNeeded.length > 0 && !leftOnly ? <NotNeeded lines={notNeeded} /> : null}
    </div>
  );
}
