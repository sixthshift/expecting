// Pregnancy bingo: both cards, seen by both of you; only your own is yours to
// deal and mark, as the person holding this phone. A card is dealt on the
// phone, so the save is the same each time it's sent.

import { queryOptions, type UseSuspenseQueryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { BingoRepo } from "../../db/models/bingo/repo";
import { PeopleRepo } from "../../db/models/people/repo";
import { CARD_SIZE, type Card, squareOf } from "../../lib/bingo";
import { type ISODate, isISODate } from "../../lib/dates";
import { save, stamped } from "../../lib/outbox";
import { getDb } from "../../server/core/db";
import { madeAt } from "../../server/core/madeAt";
import { personId } from "../../server/core/person";

/** Who's playing: the person this phone says it is. A phone that hasn't said can't play. */
function player(): string {
  const id = personId();
  if (!id || !new PeopleRepo(getDb()).get(id)) throw new Error("Say who's holding this phone first");
  return id;
}

const square = z.string().refine((id) => squareOf(id) !== undefined, "a square in src/lib/bingo.ts");

export type Bingo = { cards: Card[] };

export const getBingo = createServerFn({ method: "GET" }).handler((): Bingo => ({ cards: new BingoRepo(getDb()).cards() }));

export const dealCard = createServerFn({ method: "POST" })
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
    new BingoRepo(getDb()).deal(player(), data.squares, madeAt());
  });

export const markSquare = createServerFn({ method: "POST" })
  .validator(
    z
      .object({
        squareId: square,
        day: z.string().refine(isISODate, "a day, YYYY-MM-DD"),
        note: z.string().max(200).nullable(),
      })
      .strict()
  )
  .handler(({ data }) => new BingoRepo(getDb()).mark(player(), data.squareId, { day: data.day as ISODate, note: data.note }, madeAt()));

export const unmarkSquare = createServerFn({ method: "POST" })
  .validator(z.object({ squareId: square }).strict())
  .handler(({ data }) => new BingoRepo(getDb()).unmark(player(), data.squareId));

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

/** bingoQuery as useSuspenseQuery returns it; `options` (`select`, …) override its defaults. It has no select of its own, so the data is TData. */
export function useBingoQuery<TData = Bingo>(options?: Omit<UseSuspenseQueryOptions<Bingo, Error, TData, string[]>, "queryKey" | "queryFn">) {
  return useSuspenseQuery({ ...bingoQuery, ...options } as UseSuspenseQueryOptions<Bingo, Error, TData, string[]>);
}
