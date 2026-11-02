import { SYMPTOM_LEVELS } from "../../../../content/schema";
import { sectionsOf } from "../../../../content/sections";
import { useEntry } from "../../contexts/LibraryItemPageContext";
import { ItemBody } from "../content/ItemBody";
import { Triage } from "../content/Triage";
import { Part } from "./Part";

/** The body, by type: a symptom's levels lifted out as triage, everything else as written. */
export function Body() {
  const { item, page } = useEntry();
  if (item.type !== "symptom") return <ItemBody doc={page.doc} className="max-w-prose" />;
  const sections = sectionsOf(page.doc);
  const levels = sections.filter((s) => (SYMPTOM_LEVELS as readonly (string | null)[]).includes(s.title));
  const usual = sections.filter((s) => !levels.includes(s));
  return (
    <div className="flex flex-col gap-6">
      {/* Someone wondering whether to worry sees when to first. */}
      {/* A private entry offers nothing to add to the Planner: the list is shared. */}
      {levels.length > 0 ? <Triage levels={levels} question={item.private ? null : (item.ask ?? `About ${item.title.toLowerCase()}`)} /> : null}
      {usual.map((s) => (
        <Part key={s.title ?? ""} section={s} />
      ))}
    </div>
  );
}
