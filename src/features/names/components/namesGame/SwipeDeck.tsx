import { Button } from "@sixthshift/design-system/button";
import { Heart, Star, X } from "lucide-react";
import { type HTMLAttributes, type PointerEvent, useRef, useState } from "react";
import { aboutName, type DeckCard, SEX_LABEL } from "../../../../lib/nameDeck";

/** How far a card is dragged before letting go likes or passes it. */
const THROW = 96;
/** A flick: let go moving at least this fast (px/ms), and this far, throws it too. */
const FLICK = 0.5;
const FLICK_MIN = 24;
/** How long a thrown card takes to leave (ms). */
const GONE_IN = 220;

/** What a card was thrown as: passed, liked, or superliked (on the shortlist without the other). */
export type Vote = "pass" | "like" | "super";

/**
 * The deck as you swipe it: the top card, and the next one under it. The top card follows the finger,
 * leans as it goes and says which way it will go (on its leading edge, so it stays on screen); let go past the edge (or flick it) and it flies off
 * that way, and the one under it is already there. Short of that, it springs back. Pass and Like throw
 * it the same way; Superlike, one a day, throws it up. The page still scrolls up and down over it.
 */
export function SwipeDeck({
  card,
  under,
  showSex,
  superLeft,
  onVote,
}: {
  card: DeckCard;
  under: DeckCard | undefined;
  showSex: boolean;
  /** Whether today's superlike is still there to use. */
  superLeft: boolean;
  onVote: (vote: Vote) => void;
}) {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  // How it was thrown, on its way off.
  const [gone, setGone] = useState<Vote | null>(null);
  const start = useRef<number | null>(null);
  const last = useRef<{ x: number; t: number; v: number }>({ x: 0, t: 0, v: 0 });

  function toss(vote: Vote) {
    if (gone !== null) return;
    setGone(vote);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) onVote(vote);
    else window.setTimeout(() => onVote(vote), GONE_IN);
  }

  function down(e: PointerEvent<HTMLElement>) {
    if (gone !== null) return;
    start.current = e.clientX;
    last.current = { x: e.clientX, t: e.timeStamp, v: 0 };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function move(e: PointerEvent<HTMLElement>) {
    if (start.current === null) return;
    const dt = e.timeStamp - last.current.t;
    if (dt > 0) last.current = { x: e.clientX, t: e.timeStamp, v: (e.clientX - last.current.x) / dt };
    setDx(e.clientX - start.current);
  }
  function up(e: PointerEvent<HTMLElement>) {
    if (start.current === null) return;
    start.current = null;
    setDragging(false);
    // A pause before letting go isn't a flick.
    const v = e.timeStamp - last.current.t < 80 ? last.current.v : 0;
    if (Math.abs(dx) >= THROW) toss(dx > 0 ? "like" : "pass");
    else if (Math.abs(v) >= FLICK && Math.abs(dx) >= FLICK_MIN && Math.sign(v) === Math.sign(dx)) toss(v > 0 ? "like" : "pass");
    else setDx(0);
  }

  const lean = gone !== null ? 1 : Math.min(Math.abs(dx) / THROW, 1);
  const showing = gone === null ? dx : gone === "like" ? 1 : gone === "pass" ? -1 : 0;
  const transform =
    gone === null
      ? `translateX(${dx}px) rotate(${dx / 24}deg)`
      : gone === "super"
        ? "translateY(-120vh)"
        : `translateX(${gone === "like" ? "" : "-"}150vw) rotate(${gone === "like" ? "" : "-"}30deg)`;

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="grid w-full max-w-sm">
        {under ? (
          <Face
            card={under}
            showSex={showSex}
            inert
            style={{ transform: `scale(${0.94 + 0.06 * lean})`, opacity: 0.6 + 0.4 * lean }}
            className={dragging ? "" : "motion-safe:transition-[transform,opacity]"}
          />
        ) : null}
        <Face
          card={card}
          showSex={showSex}
          aria-describedby="swipe-how"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          style={{ transform, transitionDuration: gone !== null ? `${GONE_IN}ms` : undefined }}
          className={`cursor-grab touch-pan-y shadow-md active:cursor-grabbing ${dragging ? "" : "motion-safe:transition-transform"}`}
        >
          <span
            aria-hidden
            style={{ opacity: showing < 0 ? lean : 0 }}
            className="absolute top-3 right-3 flex items-center gap-1 rounded-full border border-border-normal bg-bg-normal px-2 py-0.5 text-sm text-fg-normal"
          >
            <X size={14} /> Pass
          </span>
          <span
            aria-hidden
            style={{ opacity: showing > 0 ? lean : 0 }}
            className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-bg-brand px-2 py-0.5 text-sm text-fg-on-brand"
          >
            <Heart size={14} /> Like
          </span>
          <span
            aria-hidden
            style={{ opacity: gone === "super" ? 1 : 0 }}
            className="absolute top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-bg-brand px-2 py-0.5 text-sm text-fg-on-brand"
          >
            <Star size={14} /> Superlike
          </span>
        </Face>
      </div>
      <p id="swipe-how" className="text-xs text-fg-subtle">
        Swipe right to like, left to pass. A superlike puts it on the shortlist straight away: one a day.
      </p>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="lg" onClick={() => toss("pass")} aria-label={`Pass on ${card.name}`}>
          <X aria-hidden size={18} /> Pass
        </Button>
        <Button
          variant="outline"
          size="lg"
          iconOnly
          onClick={() => toss("super")}
          disabled={!superLeft}
          aria-label={superLeft ? `Superlike ${card.name}` : "Today's superlike is used"}
          title={superLeft ? "Superlike: on the shortlist straight away" : "Today's superlike is used. Another tomorrow."}
        >
          <Star aria-hidden size={18} />
        </Button>
        <Button intent="brand" size="lg" onClick={() => toss("like")} aria-label={`Like ${card.name}`}>
          <Heart aria-hidden size={18} /> Like
        </Button>
      </div>
    </div>
  );
}

/** A card's face: the name, whose it mostly is, and how given it is. The one under the top is only seen. */
function Face({ card, showSex, inert, className, children, ...rest }: { card: DeckCard; showSex: boolean; inert?: boolean } & HTMLAttributes<HTMLElement>) {
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
