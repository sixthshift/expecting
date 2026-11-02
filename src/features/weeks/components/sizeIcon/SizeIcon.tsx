import { SIZE_ICONS } from "../../model/sizeIcons";

/** The fruit or vegetable a week's size is like, drawn flat, or nothing if there's no drawing for it. Decoration: the words say it. */
export function SizeIcon({ like, className }: { like: string; className?: string }) {
  const shapes = SIZE_ICONS[like];
  if (!shapes) return null;
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={className}>
      {shapes.map(([Tag, attrs], i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: a drawing's shapes are fixed, in order
        <Tag key={i} {...attrs} />
      ))}
    </svg>
  );
}
