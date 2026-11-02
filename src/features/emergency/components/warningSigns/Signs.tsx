import { use } from "react";
import type { Item } from "../../../../content/schema";
import { sectionsOf } from "../../../../content/sections";
import { ItemBody } from "../../../library/components/content/ItemBody";
import { pageOf } from "../../../library/model/pageOf";

/** Its part Emergency info shows: the signs that mean call now. */
const NOW = "Straight away";

/** The guide's opening and its "Straight away" part. */
export function Signs({ item }: { item: Item }) {
  const sections = sectionsOf(use(pageOf(item)).doc);
  const opening = sections.find((s) => s.title === null);
  const now = sections.find((s) => s.title === NOW);
  return (
    <>
      {opening ? <ItemBody doc={opening.doc} className="max-w-prose" /> : null}
      {now ? <ItemBody doc={now.doc} className="max-w-prose" /> : null}
    </>
  );
}
