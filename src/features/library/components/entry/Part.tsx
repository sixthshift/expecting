import type { ReactNode } from "react";
import type { Section } from "../../../../content/sections";
import { ItemBody } from "../content/ItemBody";

/** One part of a body, under its heading if it has one. */
export function Part({ section }: { section: Section }): ReactNode {
  return (
    <section className="flex flex-col">
      {section.title ? <h2 className="text-lg font-display font-semibold text-fg-strong">{section.title}</h2> : null}
      <ItemBody doc={section.doc} className="max-w-prose" />
    </section>
  );
}
