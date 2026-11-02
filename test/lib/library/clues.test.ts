import { describe, expect, test } from "vitest";
import { closest, cluesIn, namesPrivate } from "../../../src/lib/library/clues";
import { entry } from "./fixtures";

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

describe("an address that leads nowhere", () => {
  test.each([
    ["an entry's address, cut short", "/library/iron-tablet", "iron tablet"],
    ["escaped spaces", "/library/iron%20tablets", "iron tablets"],
    ["a path of its own", "/weeks", "weeks"],
    ["only a pillar", "/library/", ""],
    ["badly escaped", "/library/iron%E0", "iron"],
  ])("%s", (_name, path, clues) => {
    expect(cluesIn(path)).toBe(clues);
  });

  const iron = entry("iron", { title: "Iron tablets" });
  const infusion = entry("iron-infusion", { title: "Iron infusion" });
  const anaemia = entry("anaemia-in-pregnancy", { title: "Anaemia and low iron", aliases: ["iron tablets"] });
  const safety = entry("safety-plan", { title: "Iron-clad safety plan", private: true });
  const items = [infusion, anaemia, safety, iron];

  test("named by the most words first, then those whose title holds the most", () => {
    const constipation = entry("constipation", { title: "Constipation", aliases: ["iron tablets"] });
    expect(closest([...items, constipation], "iron tablets").map((i) => i.id)).toEqual(["iron", "anaemia-in-pregnancy", "constipation"]);
  });

  test("never a private entry", () => {
    expect(closest(items, "safety plan")).toEqual([]);
  });

  test("a few at most, and none for no words", () => {
    expect(closest(items, "iron", 2)).toHaveLength(2);
    expect(closest(items, "  ")).toEqual([]);
  });
});
