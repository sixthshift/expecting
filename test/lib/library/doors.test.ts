import { describe, expect, test } from "vitest";
import { behind, DOOR_INFO, doorOf, topicByDoor, topicsIn } from "../../../src/lib/library/doors";
import { entry, item } from "./fixtures";

describe("doors", () => {
  const brie = entry("brie", { type: "can-i", topic: "food", verdict: "avoid" });
  const coffee = entry("coffee", { type: "can-i", topic: "drink", verdict: "limit" });
  const sushi = entry("sushi", { type: "can-i", topic: "food", verdict: "avoid", title: "Sushi", aliases: ["raw fish"] });
  const ctg = entry("ctg", { type: "term", topic: "tests", title: "CTG" });
  const anti = entry("anti-d", { type: "term", topic: "tests", title: "Anti-D" });
  const pain = entry("pain", { type: "symptom", stakes: "high" });
  const itch = entry("itch", { type: "symptom", stakes: "low" });
  const card = entry("card", { type: "card", surprise: true });
  const loss = entry("loss", { type: "guide", topic: "loss" });
  const all = [brie, coffee, sushi, ctg, anti, pain, itch, card, loss];

  test("each type is behind its own door, and the hard topics behind the quiet one too", () => {
    expect(behind("can-i", all).map((i) => i.id)).toEqual(["brie", "coffee", "sushi"]);
    expect(behind("surprises", all).map((i) => i.id)).toEqual(["card"]);
    expect(behind("hard", all).map((i) => i.id)).toEqual(["loss"]);
    expect(doorOf(loss)).toBe("guides");
  });

  test("can I…? is shelved by topic, in the topics' usual order", () => {
    expect(DOOR_INFO["can-i"].group(behind("can-i", all)).map((g) => [g.title, g.items.map((i) => i.id)])).toEqual([
      ["Food", ["brie", "sushi"]],
      ["Drink", ["coffee"]],
    ]);
  });

  test("is this normal? puts the ones to know first", () => {
    expect(DOOR_INFO.normal.group(behind("normal", all)).map((g) => [g.title, g.items.map((i) => i.id)])).toEqual([
      ["Know these first", ["pain"]],
      ["Everything else", ["itch"]],
    ]);
  });

  test("the glossary runs A to Z", () => {
    expect(DOOR_INFO.glossary.group(behind("glossary", all)).map((g) => g.title)).toEqual(["A", "C"]);
  });

  test("what happens comes in order, under its trimester, and what has no week last", () => {
    const moments = [{ ...item("rsv", 28, "tests") }, item("dating-scan", 6, "tests"), item("morphology", 20, "tests"), entry("any", { type: "moment" })];
    expect(DOOR_INFO.moments.group(moments).map((g) => [g.key, g.items.map((i) => i.id)])).toEqual([
      ["first", ["dating-scan"]],
      ["second", ["morphology"]],
      ["third", ["rsv"]],
      ["any", ["any"]],
    ]);
  });

  test("a decision comes by its decide-by", () => {
    const decisions = [entry("late", { type: "decision", decideBy: 36 }), entry("early", { type: "decision", decideBy: 10 })];
    expect(DOOR_INFO.decisions.group(decisions).map((g) => [g.key, g.items.map((i) => i.id)])).toEqual([
      ["first", ["early"]],
      ["third", ["late"]],
    ]);
  });

  test("a topic on its own is grouped by door", () => {
    expect(topicByDoor([ctg, brie, card]).map((g) => [g.key, g.items.map((i) => i.id)])).toEqual([
      ["can-i", ["brie"]],
      ["surprises", ["card"]],
      ["glossary", ["ctg"]],
    ]);
  });

  test("every topic with how many, an empty one left out", () => {
    expect(topicsIn(all).find((t) => t.topic === "food")?.count).toBe(2);
    expect(topicsIn(all).some((t) => t.topic === "gear")).toBe(false);
  });
});
