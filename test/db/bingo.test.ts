import { expect, test } from "vitest";
import { BingoRepo } from "../../src/db/models/bingo/repo";
import { PeopleRepo } from "../../src/db/models/people/repo";
import { SQUARES } from "../../src/lib/bingo";
import { useTestDb } from "./helpers";

const db = useTestDb();
const AT = new Date("2026-11-01T00:00:00Z");
const CARD = SQUARES.slice(0, 24).map((s) => s.id);
const OTHER = SQUARES.slice(24, 48).map((s) => s.id);

test("a card dealt, and dealt again while nothing's marked; once something is, it stays", () => {
  const sam = new PeopleRepo(db()).add("Sam", "carrying");
  const repo = new BingoRepo(db());
  expect(repo.deal(sam.id, CARD, AT)).toBe(true);
  expect(repo.deal(sam.id, OTHER, AT)).toBe(true);
  expect(repo.card(sam.id)?.squares).toEqual(OTHER);
  repo.mark(sam.id, OTHER[0]!, { day: "2026-11-01", note: " Woolies " }, AT);
  expect(repo.deal(sam.id, CARD, AT)).toBe(false);
  expect(repo.card(sam.id)).toMatchObject({ squares: OTHER, marks: [{ squareId: OTHER[0], day: "2026-11-01", note: "Woolies" }] });
});

test("a square marked only on its own card; changed in place; unmarked", () => {
  const people = new PeopleRepo(db());
  const sam = people.add("Sam", "carrying");
  const jason = people.add("Jason", "partner");
  const repo = new BingoRepo(db());
  repo.deal(sam.id, CARD, AT);
  repo.deal(jason.id, OTHER, AT);
  repo.mark(sam.id, OTHER[0]!, { day: "2026-11-01", note: null }, AT);
  expect(repo.card(sam.id)?.marks).toEqual([]);
  repo.mark(sam.id, CARD[3]!, { day: "2026-11-01", note: null }, AT);
  repo.mark(sam.id, CARD[3]!, { day: "2026-11-02", note: "on the tram" }, AT);
  expect(repo.card(sam.id)?.marks).toEqual([{ squareId: CARD[3], day: "2026-11-02", note: "on the tram", markedAt: AT.toISOString() }]);
  expect(repo.cards().map((c) => c.personId)).toEqual([sam.id, jason.id]);
  repo.unmark(sam.id, CARD[3]!);
  expect(repo.card(sam.id)?.marks).toEqual([]);
});
