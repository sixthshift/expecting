// The content review's rules (docs/plan-review.md), kept as tests so what it
// fixed can't come back: no lines left over from the drafting template, and
// every phone number the one this table gives its service. A new number goes
// into the table first, from the service's own page.
import { describe, expect, test } from "vitest";

const files = import.meta.glob<string>(["../../content/items/*.md", "../../content/weeks/*.md"], {
  query: "?raw",
  eager: true,
  import: "default",
});
const lines = Object.entries(files).flatMap(([path, text]) => text.split("\n").map((line) => ({ file: path.split("/").pop()!, line })));

/** Each service's number, digits only, as its own page gives it. */
const SERVICES: [name: RegExp, number: string][] = [
  [/Lifeline/, "131114"],
  [/PANDA/, "1300726306"],
  [/Beyond Blue/, "1300224636"],
  [/1800RESPECT/, "1800737732"],
  [/MotherSafe/, "1800647848"],
  [/Pregnancy, Birth and Baby/, "1800882436"],
  [/Red Nose/, "1300308307"],
  [/13YARN/, "139276"],
  [/Medicare Mental Health/, "1800595212"],
  [/MensLine/, "1300789978"],
  [/Poisons Information/, "131126"],
  [/Gidget/, "1300851758"],
  [/healthdirect/, "1800022222"],
  [/Nurture ?Line/, "1300622243"],
  [/Relationships Australia/, "1300364277"],
  [/TIS National/, "131450"],
  [/Breastfeeding Helpline/, "1800686268"],
  [/Centrelink/, "136150"],
  [/Quitline/, "137848"],
  [/Family Relationships? Advice Line/, "1800050321"],
  [/ForWhen/, "1300242322"],
  [/National Epilepsy Line/, "1300374537"],
  [/Kids Helpline/, "1800551800"],
  [/Suicide Call Back Service/, "1300659467"],
  [/AHPRA/, "1300419495"],
  [/Life's Little Treasures/, "1300697736"],
  [/Preterm Infants Parents Association/, "1300773672"],
  [/QLife/, "1800184527"],
  [/IPTAAS/, "1800478227"],
  [/PATS/, "1300341684"],
  [/DirectLine/, "1800888236"],
  [/Parentline/, "1300301300"],
  [/Medicines Line/, "1300633424"],
  [/NOFASD/, "1800860613"],
  [/ADIS/, "1800250015"],
  [/My Options/, "1800696784"],
  [/Children by Choice/, "1800177725"],
  [/MSI Australia/, "1300003707"],
  [/Fair Work Ombudsman/, "131394"],
  [/Bravehearts/, "1800272831"],
  [/Down Syndrome Australia/, "1300881935"],
];

/** 13 xx xx, 1300 and 1800 numbers however they're spaced, and 1800RESPECT; never a longer run of digits. */
const NUMBER = /(?<![\d])(1[38]00(?: ?\d){6}|13(?: ?\d){4}|1800RESPECT)(?![\d])/g;
const digits = (n: string) => (n === "1800RESPECT" ? "1800737732" : n.replace(/\D/g, ""));

describe("the review's rules", () => {
  test("no line left over from the drafting template", () => {
    const leftover = lines.filter(({ line }) => /Ask your midwife or OB\.|the source says/i.test(line));
    expect(leftover.map(({ file, line }) => `${file}: ${line.trim()}`)).toEqual([]);
  });

  test("every number is one the table knows", () => {
    const known = new Set(SERVICES.map(([, number]) => number));
    const unknown = lines.flatMap(({ file, line }) =>
      [...line.matchAll(NUMBER)]
        .map((m) => digits(m[1]!))
        .filter((n) => !known.has(n))
        .map((n) => `${file}: ${n}`)
    );
    expect(unknown).toEqual([]);
  });

  test("a service named just before a number has its own number", () => {
    const wrong = lines.flatMap(({ file, line }) =>
      SERVICES.flatMap(([name, number]) => {
        const at = line.search(name);
        if (at < 0) return [];
        const next = [...line.slice(at).matchAll(NUMBER)][0];
        if (!next || next.index! > 80) return [];
        // "PANDA is not a crisis service, so call Lifeline on 13 11 14": the number is the nearer name's.
        const between = line.slice(at, at + next.index!).replace(name, "");
        if (SERVICES.some(([other]) => other !== name && other.test(between))) return [];
        const given = digits(next[1]!);
        return given === number ? [] : [`${file}: ${name.source} gives ${given}, not ${number}`];
      })
    );
    expect(wrong).toEqual([]);
  });
});
