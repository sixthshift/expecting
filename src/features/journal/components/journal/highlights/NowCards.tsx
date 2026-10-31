// Now: the cards `nowCards` chose (src/lib/journalNow.ts), at most two, in
// their fixed order, at the top of the highlights. While something has
// happened, none.

import { Button } from "@sixthshift/design-system/button";
import { Card } from "@sixthshift/design-system/card";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useState } from "react";
import { useAppetite } from "../../../../../api/rpc/appetite";
import { useSettings } from "../../../../../api/rpc/settings";
import { formatDate, type ISODate } from "../../../../../lib/dates";
import { placeOf } from "../../../../../lib/journal";
import type { NowCard, RecapSpan } from "../../../../../lib/journalNow";
import { hasRecap } from "../../../../../lib/recap";
import { cravingThread, lensOf, type StoryItem, summarise } from "../../../../../lib/story";
import { weekLabel } from "../../../../../lib/timeline";
import { RecapViewer, useRecap } from "../../Recap";
import { MovementPattern } from "../MovementPattern";
import { PhotoThumbs, StoryLine } from "../Story";
import { SuggestedFirst } from "./SuggestedFirst";

const route = getRouteApi("/app/journal");

/** A line or a photo, as a card shows it. */
function Line({ item, onOpenPhoto }: { item: StoryItem; onOpenPhoto?: () => void }) {
  return item.kind === "photo" ? <PhotoThumbs photos={[item.photo]} onOpen={() => onOpenPhoto?.()} /> : <StoryLine item={item} />;
}

/** What was just kept, and its thread: a craving's times, a movement on the pattern. */
function Kept({ item }: { item: StoryItem }) {
  const navigate = useNavigate();
  const { data: appetite } = useAppetite();
  const { data: settings } = useSettings();
  const lens = lensOf(item);
  const thread = item.kind === "appetite" ? cravingThread(appetite, item.entry.id) : null;
  const weekOf = (day: ISODate) => {
    const place = settings.dueDate ? placeOf(day, settings.dueDate) : null;
    return typeof place === "number" ? weekLabel(place).toLowerCase() : formatDate(day, { day: "numeric", month: "short" });
  };
  return (
    <Card size="sm" className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-fg-strong">Just kept</p>
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          aria-label="Put this away"
          onClick={() => navigate({ to: "/journal", search: (s) => ({ ...s, kept: undefined }), replace: true })}
        >
          <X aria-hidden size={16} />
        </Button>
      </div>
      <Line item={item} onOpenPhoto={() => navigate({ to: "/journal", search: { show: "photos" } })} />
      {thread && thread.times > 1 ? (
        <p className="text-sm text-fg-normal">
          {thread.times} times since {weekOf(thread.first)}
          {thread.before ? `; the last, ${weekOf(thread.before)}` : ""}.
        </p>
      ) : null}
      {item.kind === "movements" ? <MovementPattern /> : null}
      {lens && lens !== "notes" ? (
        <Button variant="ghost" size="sm" className="self-start" onClick={() => navigate({ to: "/journal", search: { show: lens } })}>
          See them all
        </Button>
      ) : null}
    </Card>
  );
}

/** What the other one kept since you last looked: who, a phrase for it, and the lines when asked. */
function Since({ card }: { card: Extract<NowCard, { kind: "since" }> }) {
  const [open, setOpen] = useState(false);
  const names = card.people.map((p) => p.name).join(" and ") || "One of you";
  return (
    <Card size="sm" className="flex flex-col gap-2">
      <p className="text-sm font-semibold text-fg-strong">Since you looked</p>
      <p className="text-fg-normal">
        {names} kept {summarise(card.items)}.
      </p>
      {open ? (
        <div className="flex flex-col gap-2">
          {card.items.map((item) => (
            <Line key={item.key} item={item} />
          ))}
        </div>
      ) : (
        <Button variant="outline" size="sm" className="self-start" onClick={() => setOpen(true)}>
          See them
        </Button>
      )}
    </Card>
  );
}

/** A recap to open: once opened, it isn't offered again on this phone. */
function RecapCard({ span, items, onOpened }: { span: RecapSpan; items: readonly StoryItem[]; onOpened: (key: string) => void }) {
  const recap = useRecap(span, items);
  const [open, setOpen] = useState(false);
  // Nothing kept or done in those weeks: nothing to give back.
  if (!recap || !hasRecap(recap)) return null;
  return (
    <Card size="sm" className="flex flex-col gap-2">
      <p className="font-display text-lg font-semibold text-fg-strong">{span.title}, kept</p>
      <p className="text-sm text-fg-normal">What you kept and did in these weeks, a card at a time.</p>
      <Button
        intent="brand"
        size="sm"
        className="self-start"
        onClick={() => {
          setOpen(true);
          onOpened(span.key);
        }}
      >
        Step through it
      </Button>
      {open ? <RecapViewer recap={recap} onClose={() => setOpen(false)} /> : null}
    </Card>
  );
}

/** "Two weeks ago today", "Six weeks ago today". */
const WORDS = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];

function weeksAgo(weeks: number): string {
  return `${WORDS[weeks] ?? weeks} weeks ago today`;
}

/** One card. */
function NowCardView({ card, items, onRecapOpened }: { card: NowCard; items: readonly StoryItem[]; onRecapOpened: (key: string) => void }) {
  const navigate = route.useNavigate();
  switch (card.kind) {
    case "kept":
      return <Kept item={card.item} />;
    case "since":
      return <Since card={card} />;
    case "first":
      return <SuggestedFirst key={card.suggestion.key} suggestion={card.suggestion} />;
    case "recap":
      return <RecapCard span={card.span} items={items} onOpened={onRecapOpened} />;
    case "lastWeek":
      return (
        <Card size="sm" className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-fg-strong">{weekLabel(card.week)}, kept</p>
          <p className="text-fg-normal">{summarise(card.items).replace(/^./, (c) => c.toUpperCase())}.</p>
          <Button variant="outline" size="sm" className="self-start" onClick={() => navigate({ search: { at: card.week } })}>
            See it
          </Button>
        </Card>
      );
    case "weeksAgo":
      return (
        <Card size="sm" className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-fg-strong">{weeksAgo(card.weeks)}</p>
          <Line item={card.item} onOpenPhoto={() => navigate({ search: { show: "photos" } })} />
        </Card>
      );
  }
}

/** The cards chosen, in their order. */
export function NowCards({ cards, items, onRecapOpened }: { cards: readonly NowCard[]; items: readonly StoryItem[]; onRecapOpened: (key: string) => void }) {
  if (cards.length === 0) return null;
  return (
    <section aria-label="Now" className="flex flex-col gap-3">
      {cards.map((card) => (
        <NowCardView key={card.kind} card={card} items={items} onRecapOpened={onRecapOpened} />
      ))}
    </section>
  );
}
