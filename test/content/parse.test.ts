import { describe, expect, test } from "vitest";
import { ContentError, splitItem } from "../../src/content/file";
import { parseAll, parseItem } from "../../src/content/parse";

const item = (frontmatter: string, body = "Some words.") => `---\n${frontmatter}\n---\n${body}\n`;

// An item lives in items/ and its file name is its id: `items/rsv-vaccine.md`.
const RSV = "items/rsv-vaccine.md";
const rsv = `id: rsv-vaccine
title: The RSV vaccine
weeks: [28, 36]
type: moment
topic: appointments
surprise: true
sources:
  - title: A source
    url: https://example.org/rsv
checked: 2026-10-27
tasks:
  - id: book-rsv-vaccine
    title: Book it`;

describe("parseItem", () => {
  test("a full item", () => {
    const parsed = parseItem(RSV, item(rsv));
    expect(parsed).toMatchObject({
      id: "rsv-vaccine",
      from: 28,
      to: 36,
      surprise: true,
      draft: true,
      checked: "2026-10-27",
      body: "Some words.",
    });
    expect(parsed.tasks).toEqual([
      {
        id: "book-rsv-vaccine",
        title: "Book it",
        opens: 28,
        due: 36,
        deadline: null,
        deadlineFrom: null,
        who: "together",
        itemId: "rsv-vaccine",
        origin: "built-in",
      },
    ]);
  });

  test("a task's window and whose job it is", () => {
    const tasks = "tasks:\n  - id: t\n    title: T\n    opens: 27\n    due: 28\n    deadline: 36\n    who: partner";
    const [task] = parseItem("items/x.md", item(`id: x\ntitle: X\nweeks: [24, 34]\ntype: moment\ntopic: paperwork\n${tasks}`)).tasks;
    expect(task).toMatchObject({
      opens: 27,
      due: 28,
      // A deadline may fall after the item's weeks, as long as it is by week 42.
      deadline: 36,
      who: "partner",
    });
  });

  test("a deadline counted back from a date the household gives, its week standing in until then", () => {
    const tasks = "tasks:\n  - id: t\n    title: T\n    due: 28\n    deadline: { before: leaveStart, weeks: 10, week: 30 }";
    const [task] = parseItem("items/x.md", item(`id: x\ntitle: X\nweeks: [24, 34]\ntype: moment\ntopic: paperwork\n${tasks}`)).tasks;
    expect(task).toMatchObject({ due: 28, deadline: 30, deadlineFrom: { fact: "leaveStart", weeks: 10 } });
  });

  test("items/ holds them, however the path starts", () => {
    expect(parseItem("../../content/items/x.md", item("id: x\ntitle: X\nweeks: 6\ntype: moment\ntopic: baby")).from).toBe(6);
  });

  test("a single week and an explicit due", () => {
    const parsed = parseItem("items/x.md", item("id: x\ntitle: X\nweeks: 6\ntype: moment\ntopic: baby\ntasks:\n  - id: t\n    title: T\n    due: 6"));
    expect([parsed.from, parsed.to]).toEqual([6, 6]);
    expect(parsed.tasks[0]!.due).toBe(6);
  });

  test.each([
    ["no frontmatter", "items/x.md", "just text", /no frontmatter/],
    ["bad yaml", "items/x.md", item("id: [unclosed"), /not YAML/],
    ["unknown field", RSV, item(`${rsv}\nmood: happy`), /mood|Unrecognized/],
    ["weeks backwards", "items/x.md", item("id: x\ntitle: X\nweeks: [30, 20]\ntype: moment\ntopic: body"), /weeks must run forwards/],
    ["weeks out of range", "items/x.md", item("id: x\ntitle: X\nweeks: [30, 43]\ntype: moment\ntopic: body"), /within 1–42/],
    [
      "a task due outside its item",
      "items/x.md",
      item("id: x\ntitle: X\nweeks: [18, 20]\ntype: moment\ntopic: body\ntasks:\n  - id: t\n    title: T\n    due: 16"),
      /within the item's weeks, 18–20/,
    ],
    [
      "a task that opens after it is due",
      "items/x.md",
      item("id: x\ntitle: X\nweeks: [18, 24]\ntype: moment\ntopic: body\ntasks:\n  - id: t\n    title: T\n    opens: 22\n    due: 20"),
      /no later than due, 18–20/,
    ],
    [
      "a deadline before it is due",
      "items/x.md",
      item("id: x\ntitle: X\nweeks: [18, 24]\ntype: moment\ntopic: body\ntasks:\n  - id: t\n    title: T\n    due: 22\n    deadline: 20"),
      /on or after due and no later than week 42, 22–42/,
    ],
    [
      "a deadline after week 42",
      "items/x.md",
      item("id: x\ntitle: X\nweeks: [36, 40]\ntype: moment\ntopic: body\ntasks:\n  - id: t\n    title: T\n    deadline: 43"),
      /no later than week 42, 40–42/,
    ],
    ["a task for nobody", RSV, item(rsv.replace("    title: Book it", "    title: Book it\n    who: grandma")), /who/],
    ["bad topic", "items/x.md", item("id: x\ntitle: X\nweeks: 6\ntype: moment\ntopic: shopping"), /topic/],
    ["bad id", "items/x.md", item("id: Not A Slug\ntitle: X\nweeks: 6\ntype: moment\ntopic: body"), /lower-case/],
    ["empty body", "items/x.md", item("id: x\ntitle: X\nweeks: 6\ntype: moment\ntopic: body", ""), /body is empty/],
    ["a phase in the frontmatter", "items/x.md", item("id: x\ntitle: X\nphase: pregnancy\nweeks: 6\ntype: moment\ntopic: body"), /phase|Unrecognized/],
    ["a file outside items/", "x.md", item("id: x\ntitle: X\nweeks: 6\ntype: moment\ntopic: body"), /belongs in items\//],
    ["a folder that isn't items/", "pregnancy/x.md", item("id: x\ntitle: X\nweeks: 6\ntype: moment\ntopic: body"), /belongs in items\//],
    ["an id that isn't the file's name", "items/y.md", item("id: x\ntitle: X\nweeks: 6\ntype: moment\ntopic: body"), /id "x" must be the file's name, y/],
    ["a when on no question", RSV, item(`${rsv}\nwhen: { mood: happy }`), /"mood" is not a question/],
    ["a when without whose", RSV, item(`${rsv}\nwhen: { work: employee }`), /say whose/],
    ["a body without whose", RSV, item(rsv, '{% if equals($work, "employee") %}\nHi\n{% /if %}'), /say whose/],
    [
      "a deadline counted from no date",
      "items/x.md",
      item(
        "id: x\ntitle: X\nweeks: [24, 34]\ntype: moment\ntopic: paperwork\ntasks:\n  - id: t\n    title: T\n    deadline: { before: cover, weeks: 10, week: 34 }"
      ),
      /"cover" is not a date question/,
    ],
    ["a when on no answer", RSV, item(`${rsv}\nwhen: { cover: maybe }`), /"maybe" is not an answer to cover/],
    ["an unknown tag", RSV, item(rsv, "{% video /%}"), /video/],
    ["a tag missing its attribute", RSV, item(rsv, "{% ask /%}"), /primary/],
    ["an unknown question in the body", RSV, item(rsv, '{% if equals($mood, "happy") %}\nHi\n{% /if %}'), /\$mood is not a question/],
    ["an unknown answer in the body", RSV, item(rsv, '{% if equals($cover, "maybe") %}\nHi\n{% /if %}'), /"maybe" is not an answer to \$cover/],
    ["a window backwards", RSV, item(rsv, "{% window from=36 to=28 /%}"), /window weeks must run forwards/],
  ])("rejects %s, naming the file", (_name, file, source, message) => {
    expect(() => parseItem(file, source)).toThrow(ContentError);
    expect(() => parseItem(file, source)).toThrow(message);
    expect(() => parseItem(file, source)).toThrow(`${file}: `);
  });
});

describe("tailoring", () => {
  test("when takes one answer or a list", () => {
    expect(parseItem(RSV, item(`${rsv}\nwhen: { cover: "no", state: [vic, nsw] }`)).when).toEqual({ cover: ["no"], state: ["vic", "nsw"] });
    expect(parseItem(RSV, item(rsv)).when).toEqual({});
  });

  test("a body may use the tags and the household's answers", () => {
    const body = '{% window from=28 to=36 /%}\n\n{% if equals($cover, "yes") %}\nPrivate.\n{% else /%}\nPublic.\n{% /if %}\n\n{% ask "Is it free?" /%}';
    expect(() => parseItem(RSV, item(rsv, body))).not.toThrow();
  });
});

test("ids are unique across items and tasks", () => {
  const a = item("id: a\ntitle: A\nweeks: 6\ntype: moment\ntopic: body\ntasks:\n  - id: b\n    title: T");
  const b = item("id: b\ntitle: B\nweeks: 6\ntype: moment\ntopic: body");
  expect(() => parseAll({ "items/a.md": a, "items/b.md": b })).toThrow(/id "b" is also used by a/);
});

describe("types", () => {
  const typed = (fields: string, body = "Some words.") => parseItem("items/x.md", item(`id: x\ntitle: X\n${fields}`, body));
  const symptom = (levels: string) => typed("type: symptom\ntopic: body", `## What's usual\n\nOften.\n\n${levels}`);

  test("an item without weeks is in the Library only", () => {
    const parsed = typed("type: term\ntopic: baby");
    expect([parsed.from, parsed.to]).toEqual([null, null]);
  });

  test("the fields a list reads, and the ones only its page does", () => {
    const fields = "type: can-i\ntopic: food\nask: Can I eat brie?\naliases: [camembert]\nverdict: avoid\nstakes: high\nwho: carrying\nrelated: [y]";
    const { index, page } = splitItem("items/x.md", item(`id: x\ntitle: X\n${fields}`, "## Why\n\nBecause $cover.\n\n## What to do\n\nThis."));
    expect(Object.keys(page.frontmatter)).toEqual(["related"]);
    expect(index.variables).toEqual(["cover"]);
    expect(Object.keys(index.frontmatter)).not.toContain("related");
  });

  test("a card is one of the things nobody tells you", () => {
    expect(typed("type: card\ntopic: body").surprise).toBe(true);
  });

  test("a decision with a week to decide by asks you to decide, by then", () => {
    const options = "## The options\n\nA.\n\n## Things to weigh\n\nB.\n\n## When to decide\n\nC.";
    expect(typed("type: decision\ntopic: tests\nweeks: [10, 16]\nwho: carrying\ndecide_by: 13", options).tasks).toEqual([
      { id: "decide-x", title: "Decide: X", opens: 10, due: 13, deadline: null, deadlineFrom: null, who: "carrying", itemId: "x", origin: "built-in" },
    ]);
    expect(typed("type: decision\ntopic: tests\nweeks: [10, 16]", options).tasks).toEqual([]);
  });

  test("a symptom's levels, most urgent first, after what's usual", () => {
    expect(() => symptom("## Call 000 or go to emergency\n\nNow.\n\n## Mention it at your next visit\n\nLater.")).not.toThrow();
  });

  test.each([
    ["a can-i without a verdict", "type: can-i\ntopic: food", "## Why\n\nA.\n\n## What to do\n\nB.", /a can-i has a verdict/],
    ["a verdict on anything else", "type: guide\ntopic: food\nverdict: yes", "Words.", /a can-i has a verdict/],
    ["a can-i without its why", "type: can-i\ntopic: food\nverdict: yes", "## What to do\n\nB.", /## Why/],
    ["a decision without its sections", "type: decision\ntopic: care", "## The options\n\nA.", /## Things to weigh, ## When to decide/],
    ["decide_by on anything but a decision", "type: guide\ntopic: care\ndecide_by: 20", "Words.", /only a decision/],
    [
      "decide_by without weeks",
      "type: decision\ntopic: care\ndecide_by: 20",
      "## The options\n\nA.\n\n## Things to weigh\n\nB.\n\n## When to decide\n\nC.",
      /needs weeks/,
    ],
    [
      "decide_by outside its weeks",
      "type: decision\ntopic: care\nweeks: [10, 16]\ndecide_by: 20",
      "## The options\n\nA.\n\n## Things to weigh\n\nB.\n\n## When to decide\n\nC.",
      /within the decision's weeks, 10–16/,
    ],
    ["a card with a heading", "type: card\ntopic: body", "## Why\n\nWords.", /a card has no headings/],
    ["a term that runs long", "type: term\ntopic: body", "Word. ".repeat(250), /stays short/],
    ["tasks without weeks", "type: moment\ntopic: body\ntasks:\n  - id: t\n    title: T", "Words.", /needs weeks/],
    ["an unknown type", "type: poem\ntopic: body", "Words.", /type/],
  ])("rejects %s", (_name, fields, body, message) => {
    expect(() => typed(fields, body)).toThrow(message);
  });

  test.each([
    ["not opening with what's usual", "## See your doctor or midwife\n\nSoon.", /opens with ## What's usual/],
    ["a level of its own", "## What's usual\n\nOften.\n\n## Get urgent care\n\nNow.", /not ## Get urgent care/],
    ["levels out of order", "## What's usual\n\nOften.\n\n## See your doctor or midwife\n\nSoon.\n\n## Contact your hospital now\n\nNow.", /most urgent first/],
  ])("rejects a symptom %s", (_name, body, message) => {
    expect(() => typed("type: symptom\ntopic: body", body)).toThrow(message);
  });

  test("related names another item", () => {
    const a = item("id: a\ntitle: A\ntype: term\ntopic: body\nrelated: [b]");
    const b = item("id: b\ntitle: B\ntype: term\ntopic: body\nrelated: [a]");
    expect(() => parseAll({ "items/a.md": a, "items/b.md": b })).not.toThrow();
    expect(() => parseAll({ "items/a.md": a })).toThrow(/related names no other item: b/);
  });
});
