import { describe, expect, test } from "vitest";
import type { DatedItem, Item, Topic } from "../../src/content/schema";
import { behind, DOOR_INFO, doorOf, headsUps, namesPrivate, rightNow, search, standingLabel, topicByDoor, topicsIn, worthKnowing } from "../../src/lib/library";

function item(id: string, from: number, topic: Topic, surprise = false): DatedItem {
  return {
    id,
    title: id,
    summary: null,
    from,
    to: from,
    type: "moment",
    topic,
    ask: null,
    aliases: [],
    who: null,
    stakes: null,
    verdict: null,
    decideBy: null,
    surprise,
    private: false,
    draft: true,
    when: {},
    extra: null,
    variables: [],
    tasks: [],
    origin: "built-in",
  };
}

const entry = (id: string, over: Partial<Item>): Item => ({ ...item(id, 1, "body"), from: null, to: null, ...over }) as Item;

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

  test("search wants every word, and puts matches by name before matches in a summary", () => {
    const sauce = entry("sauce", { title: "Aioli", summary: "Made with raw fish sometimes" });
    expect(search([sauce, sushi, brie], "raw fish").map((i) => i.id)).toEqual(["sushi", "sauce"]);
    expect(search(all, "  ")).toEqual([]);
  });
});

describe("right now", () => {
  const span = (id: string, from: number, to: number): DatedItem => ({
    ...item(id, from, "appointments"),
    to,
    tasks: [{ id: `${id}-task`, title: id, opens: from, due: to, deadline: null, deadlineFrom: null, who: "together", itemId: id, origin: "built-in" }],
  });
  const windows = [span("flu", 4, 40), span("gtt", 24, 28), span("rsv", 28, 36), span("whooping", 20, 32), span("car-seat", 30, 37)];

  test("the items open this week, soonest-closing first, with where each stands", () => {
    expect(rightNow(windows, 28).map(({ item, standing }) => [item.id, standingLabel(standing, 28)])).toEqual([
      ["gtt", "Closes this week"],
      ["whooping", "4 weeks left"],
      ["rsv", "Opened this week"],
      ["flu", "Open since week 4"],
    ]);
  });

  test("a window counts down once it closes within a month", () => {
    expect(rightNow(windows, 33).map(({ item, standing }) => [item.id, standing])).toEqual([
      ["rsv", { kind: "left", weeks: 3 }],
      ["car-seat", { kind: "left", weeks: 4 }],
      ["flu", { kind: "open", since: 4 }],
    ]);
    expect(standingLabel({ kind: "left", weeks: 1 }, 35)).toBe("1 week left");
  });

  test("windows closing the same week: the one open longest first", () => {
    expect(rightNow([span("a", 10, 20), span("b", 5, 20)], 12).map(({ item }) => item.id)).toEqual(["b", "a"]);
  });

  test("nothing open, nothing shown", () => {
    expect(rightNow(windows, 2)).toEqual([]);
  });

  test("only what asks something of you: an item without tasks, or without weeks, is on its shelf instead", () => {
    const reading = { ...span("reading", 20, 32), tasks: [] };
    const weekless: Item = { ...item("vernix", 1, "baby"), from: null, to: null };
    expect(rightNow([reading, weekless, ...windows], 28).map(({ item }) => item.id)).not.toContain("reading");
    expect(rightNow([reading, weekless, ...windows], 28).map(({ item }) => item.id)).not.toContain("vernix");
  });
});

describe("worth knowing", () => {
  const at = (id: string, from: number, to: number, over: Partial<Item> = {}): DatedItem => ({ ...item(id, from, "body"), to, ...over }) as DatedItem;
  const task = (id: string, from: number, to: number) => ({
    id: `${id}-task`,
    title: id,
    opens: from,
    due: to,
    deadline: null,
    deadlineFrom: null,
    who: "together" as const,
    itemId: id,
    origin: "built-in" as const,
  });

  test("what starts that week and belongs to it: high stakes first, then what asks something of you, then by title", () => {
    const items = [
      at("b-guide", 36, 40),
      at("a-guide", 36, 42),
      at("contractions", 36, 42, { stakes: "high" }),
      at("pack-the-bag", 36, 40, { tasks: [task("pack-the-bag", 36, 40)] }),
      at("later", 37, 40),
    ];
    expect(worthKnowing(items, 36).map((i) => i.id)).toEqual(["contractions", "pack-the-bag", "a-guide", "b-guide"]);
  });

  test("any time is in the Library, unless it asks something of you", () => {
    const flu = at("flu", 4, 40, { tasks: [task("flu", 4, 40)] });
    expect(worthKnowing([at("folic-acid", 4, 42), flu], 4).map((i) => i.id)).toEqual(["flu"]);
  });

  test("never a card, a hard topic or a private entry", () => {
    const items = [at("card", 10, 12, { type: "card" }), at("loss", 10, 12, { topic: "loss" }), at("safety", 10, 12, { private: true })];
    expect(worthKnowing(items, 10)).toEqual([]);
  });
});

describe("heads-ups", () => {
  const card = (id: string, from: number, to: number, over: Partial<Item> = {}): DatedItem =>
    ({ ...item(id, from, "body"), to, type: "card", surprise: true, ...over }) as DatedItem;

  test("a card a week, the one that started nearest, none twice", () => {
    const ups = headsUps([card("any-time", 1, 42), card("from-twenty", 20, 30), card("also-twenty", 20, 21, { stakes: "high" })]);
    expect([1, 19, 20, 21, 22, 23].map((w) => ups.get(w)?.id)).toEqual(["any-time", undefined, "also-twenty", "from-twenty", undefined, undefined]);
  });

  test("never a hard topic or a private card, nor anything but a card", () => {
    const ups = headsUps([card("loss", 5, 5, { topic: "loss" }), card("safety", 5, 5, { private: true }), { ...card("guide", 5, 5), type: "guide" }]);
    expect(ups.size).toBe(0);
  });
});

describe("names a private entry", () => {
  const safety = entry("domestic-violence-in-pregnancy", { title: "Family violence during pregnancy", ask: "Is that a thing?", private: true });
  const open = entry("braxton-hicks", { title: "Braxton Hicks", ask: "Is this labour?" });
  const items = [safety, open];

  test.each([
    ["its id", "domestic-violence-in-pregnancy"],
    ["its id, inside other words", "see domestic-violence-in-pregnancy later"],
    ["its title", "Family violence during pregnancy"],
    ["its title, in another case and spacing", "  family  VIOLENCE during pregnancy "],
    ["its question", "Is that a thing?"],
    ["the question a page would add for it", "About family violence during pregnancy"],
  ])("%s", (_name, text) => {
    expect(namesPrivate(text, items)).toBe(true);
  });

  test.each([
    ["an open entry's title", "Braxton Hicks"],
    ["an open entry's question", "Is this labour?"],
    ["your own words about it", "Can we talk about family violence at the next visit?"],
    ["nothing", "  "],
  ])("not %s", (_name, text) => {
    expect(namesPrivate(text, items)).toBe(false);
  });
});
