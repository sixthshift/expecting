import type { HTMLAttributes } from "react";
import { aboutName, type DeckCard, SEX_LABEL } from "../../../../lib/nameDeck";

/** A card's face: the name, whose it mostly is, and how given it is. The one under the top is only seen. */
export function CardFace({
  card,
  showSex,
  inert,
  className,
  children,
  ...rest
}: { card: DeckCard; showSex: boolean; inert?: boolean } & HTMLAttributes<HTMLElement>) {
  const about = aboutName(card.deck);
  return (
    <article
      aria-label={inert ? undefined : card.name}
      aria-hidden={inert || undefined}
      inert={inert}
      {...rest}
      className={`relative flex min-h-[min(55vh,26rem)] select-none flex-col items-center justify-center gap-2 rounded-xl border border-border-subtle bg-bg-normal px-6 py-8 text-center [grid-area:1/1] ${className ?? ""}`}
    >
      {children}
      {showSex && card.deck ? <span className="text-xs tracking-wide text-fg-subtle uppercase">{SEX_LABEL[card.deck.sex]}</span> : null}
      <p className="font-display text-5xl font-semibold break-words text-fg-strong">{card.name}</p>
      {about ? <p className="text-sm text-fg-subtle">{about}</p> : null}
    </article>
  );
}
