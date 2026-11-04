import { use } from "react";
import { MobileCorner } from "../../../../app/mobile/components/MobileCorner";
import type { Item } from "../../../../content/schema";
import { sectionsOf } from "../../../../content/sections";
import type { Quiet } from "../../../../lib/quiet";
import { QUIET_PARTS } from "../../../../lib/thisWeek/quiet";
import { ItemBody } from "../../../library/components/content/ItemBody";
import { pageOf } from "../../../library/model/pageOf";

/** The guide's opening words as the page's, then its parts for what happened. */
export function Guide({ item, quiet }: { item: Item; quiet: Quiet }) {
  const sections = sectionsOf(use(pageOf(item)).doc);
  const opening = sections.find((s) => s.title === null);
  const parts = QUIET_PARTS[quiet.kind].flatMap((title) => sections.filter((s) => s.title === title));
  return (
    <>
      <header className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-display font-semibold text-fg-strong desktop:text-3xl">Take the time you need</h1>
          <MobileCorner />
        </div>
        {opening ? <ItemBody doc={opening.doc} className="max-w-prose" /> : null}
      </header>
      {parts.map((s) => (
        <section key={s.title} className="flex flex-col">
          <h2 className="text-lg font-display font-semibold text-fg-strong">{s.title}</h2>
          <ItemBody doc={s.doc} className="max-w-prose" />
        </section>
      ))}
    </>
  );
}
