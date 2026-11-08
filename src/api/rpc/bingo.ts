// Pregnancy bingo: both cards, seen by both of you; only your own is yours to
// deal and mark, as the person holding this phone. A card is dealt on the
// phone, so the save is the same each time it's sent.

import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { BingoRepo } from "../../db/models/bingo/repo";
import { type ISODate, isISODate } from "../../lib/dates";
import { CARD_SIZE, type Card, squareOf } from "../../lib/drawer/bingo";
import { save, stamped } from "../../lib/outbox";
import { getDb } from "../../server/core/db";
import { madeAt } from "../../server/core/madeAt";
import { personId } from "../../server/core/person";
import { queryHook } from "../queryHook";

const square = z.string().refine((id) => squareOf(id) !== undefined, "a square in src/lib/drawer/bingo.ts");

export type Bingo = { cards: Card[] };

const getBingo = createServerFn({ method: "GET" }).handler((): Bingo => ({ cards: new BingoRepo(getDb()).cards() }));

const dealCard = createServerFn({ method: "POST" })
  .validator(
    z
      .object({
        squares: z
          .array(square)
          .length(CARD_SIZE)
          .refine((s) => new Set(s).size === CARD_SIZE, "24 different squares"),
      })
      .strict()
  )
  .handler(({ data }) => {
    new BingoRepo(getDb()).deal(personId(), data.squares, madeAt());
  });

const markSquare = createServerFn({ method: "POST" })
  .validator(
    z
      .object({
        squareId: square,
        day: z.string().refine(isISODate, "a day, YYYY-MM-DD"),
        note: z.string().max(200).nullable(),
      })
      .strict()
  )
  .handler(({ data }) => new BingoRepo(getDb()).mark(personId(), data.squareId, { day: data.day as ISODate, note: data.note }, madeAt()));

const unmarkSquare = createServerFn({ method: "POST" })
  .validator(z.object({ squareId: square }).strict())
  .handler(({ data }) => new BingoRepo(getDb()).unmark(personId(), data.squareId));

export const bingoQuery = queryOptions({ queryKey: ["bingo"], queryFn: () => getBingo() });

/** Your card, as the outbox's saves change it: by `made.by`, the person holding this phone. */
function mine(bingo: Bingo, by: string | null, change: (card: Card) => Card): Bingo {
  return { cards: bingo.cards.map((c) => (c.personId === by ? change(c) : c)) };
}

/** Bingo's saves, through the outbox (src/app/model/outbox.ts): each shows at once, and is sent when it can be. */
export const bingoSaves = {
  dealCard: save({
    key: "dealCard",
    query: bingoQuery.queryKey,
    send: (data: { squares: string[] }, made) => dealCard({ data, headers: stamped(made) }),
    apply: (bingo: Bingo, { squares }, made) => {
      const now = bingo.cards.find((c) => c.personId === made.by);
      if (!made.by || (now && now.marks.length > 0)) return bingo;
      const card: Card = { personId: made.by, squares, dealtAt: now?.dealtAt ?? made.at, marks: [] };
      return now ? mine(bingo, made.by, () => card) : { cards: [...bingo.cards, card] };
    },
  }),
  markSquare: save({
    key: "markSquare",
    query: bingoQuery.queryKey,
    send: (data: { squareId: string; day: ISODate; note: string | null }, made) => markSquare({ data, headers: stamped(made) }),
    apply: (bingo: Bingo, { squareId, day, note }, made) =>
      mine(bingo, made.by, (card) => {
        if (!card.squares.includes(squareId)) return card;
        const was = card.marks.find((m) => m.squareId === squareId);
        const mark = { squareId, day, note: note?.trim() || null, markedAt: was?.markedAt ?? made.at };
        return { ...card, marks: was ? card.marks.map((m) => (m.squareId === squareId ? mark : m)) : [...card.marks, mark] };
      }),
  }),
  unmarkSquare: save({
    key: "unmarkSquare",
    query: bingoQuery.queryKey,
    send: (data: { squareId: string }, made) => unmarkSquare({ data, headers: stamped(made) }),
    apply: (bingo: Bingo, { squareId }, made) => mine(bingo, made.by, (card) => ({ ...card, marks: card.marks.filter((m) => m.squareId !== squareId) })),
  }),
};

export const useBingoQuery = queryHook(bingoQuery);
