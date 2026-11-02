import { Card } from "@sixthshift/design-system/card";
import type { DayRead } from "../../../../content/days";
import { ItemBody } from "../../../library/components/content/ItemBody";
import { ItemLink } from "../../../library/components/itemLink/ItemLink";

export function Read({ read, label, titles }: { read: DayRead; label: string; titles: ReadonlyMap<string, string> }) {
  const links = read.read.filter((id) => titles.has(id));
  return (
    <Card className="w-full">
      <article className="flex flex-col gap-2">
        <span className="text-xs font-semibold tracking-widest text-fg-subtle uppercase">{label}</span>
        <h3 className="text-lg leading-snug font-display font-semibold text-fg-strong">{read.title}</h3>
        <ItemBody doc={read.body} className="max-w-prose" />
        {links.length > 0 ? (
          <p className="flex flex-wrap gap-x-3 gap-y-1 pt-1 text-sm">
            {links.map((id) => (
              <ItemLink key={id} itemId={id} className="font-medium text-fg-brand underline">
                {titles.get(id)}
              </ItemLink>
            ))}
          </p>
        ) : null}
      </article>
    </Card>
  );
}
