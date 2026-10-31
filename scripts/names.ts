// Generates src/lib/nameDeck.data.json: the names game's deck, from the names
// given across the English-speaking West.
//
//   bun run names
//   NAMES_US=~/Downloads/names.zip bun run names    # with the US
//
// Each source is a country's (or state's) register of births, published with
// how many babies were given each name each year:
//
//   England and Wales  ONS, "Baby names in England and Wales: from 1996", every
//                      name given 3 or more times a year (OGL v3)
//   Ireland            CSO, tables VSA50 and VSA60, every name given 3 or more
//                      times a year since 1964 (CC BY 4.0)
//   Ontario            ServiceOntario, "Ontario top baby names", every name
//                      given 5 or more times a year since 1913 (OGL-Ontario)
//   New Zealand        DIA, "Baby name popularity over time", every name given
//                      10 or more times a year since 1900 (CC BY 4.0)
//   South Australia    data.sa.gov.au, "Popular Baby Names", every name
//                      1944–2017 and the top 100 since (CC BY 4.0)
//   United States      SSA, "Beyond the Top 1000 Names", every name given 5 or
//                      more times a year since 1880 (public domain). SSA turns
//                      away scripted downloads, so it's read from the zip you
//                      download yourself (ssa.gov/oact/babynames/limits.html),
//                      given as NAMES_US; without it, the deck is the rest.
//
// A name's popularity in a year is its share of that source's babies of its
// sex that year, and every source counts the same, however big its country:
// the deck is Western naming, not American naming. A name is in the deck if
// its share reached MIN_SHARE in some source in some year since SINCE, or it
// is in a source's latest top 100. Rerun each year, once the new lists are out.
// Needs `unzip`.
//
// Each entry is [name, sex, perMillion, top, peak, common]:
//   sex         "f" or "m" when at least SEX_SHARE of the babies given it were
//               girls or boys (each source counting the same), "u" otherwise
//   perMillion  how many babies in a million were given it lately (the last
//               RECENT years of each source), averaged over the sources
//   top         its place in each source's latest top 100, in SOURCES' order,
//               0 when not in it
//   peak        the decade it was most given, averaged over the sources with
//               lists for that decade
//   common      whether it's common in each source, 1 or 0: a decade at
//               MIN_SHARE there since SINCE, or in its latest top 100. A name
//               common in only one place is regional (Aroha, Seán): kept, but
//               the game deals only those common in several (lib/nameDeck.ts)

import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const OUT = new URL("../src/lib/nameDeck.data.json", import.meta.url);
const SINCE = 1950;
const MIN_SHARE = 1 / 10_000;
const RECENT = 10;
const SEX_SHARE = 0.8;
/** Registry entries that aren't names. */
const NOT_NAMES = new Set(["unnamed", "baby", "not", "mc", "infant", "male", "female", "unknown"]);

type Sex = "f" | "m";
/** One name in one year of one source's list. */
type Row = { name: string; sex: Sex; year: number; n: number };
type Source = { id: string; place: string; credit: string; rows: Row[] /** Years with every name, not only a top 100. */; full: (year: number) => boolean };

const work = await mkdtemp(join(tmpdir(), "names-"));
const sources: Source[] = [await englandWales(), await ireland(), await ontario(), await newZealand(), await southAustralia()];
const us = process.env.NAMES_US;
if (us) sources.push(await unitedStates(us));
else console.log("No NAMES_US: the deck is made without the US.");
await rm(work, { recursive: true });

type Tally = {
  /** Each source's girls and boys given it, for its sex. */
  bySource: Map<string, { f: number; m: number }>;
  /** Share of births, by source, by year. */
  share: Map<string, Map<number, number>>;
  spellings: Map<string, number>;
};
const tallies = new Map<string, Tally>();
const latest = new Map<string, number>();
/** Each source's last RECENT years with every name. */
const recentYears = new Map<string, number[]>();
/** Each source's years with every name, by decade. */
const fullDecades = new Map<string, Map<number, number[]>>();

for (const s of sources) {
  const bad = s.rows.filter((r) => !(Number.isFinite(r.n) && r.n > 0));
  if (bad.length > 0) console.log(`${s.place}: ${bad.length} rows without a count, left out:`, bad.slice(0, 3));
  s.rows = s.rows.filter((r) => Number.isFinite(r.n) && r.n > 0);
  const years = [...new Set(s.rows.map((r) => r.year))].sort();
  latest.set(s.id, years.at(-1)!);
  console.log(`${s.place}: ${s.rows.length} rows, ${years[0]}–${years.at(-1)}`);
  const births = new Map<string, number>();
  for (const r of s.rows) births.set(`${r.sex}${r.year}`, (births.get(`${r.sex}${r.year}`) ?? 0) + r.n);
  for (const r of s.rows) {
    const key = keyOf(r.name);
    if (!key) continue;
    const t = tallies.get(key) ?? { bySource: new Map(), share: new Map(), spellings: new Map() };
    tallies.set(key, t);
    const sexes = t.bySource.get(s.id) ?? { f: 0, m: 0 };
    sexes[r.sex] += r.n;
    t.bySource.set(s.id, sexes);
    t.spellings.set(r.name, (t.spellings.get(r.name) ?? 0) + r.n);
    // A top 100 year says nothing of a name's share against the whole year.
    if (!s.full(r.year)) continue;
    const shares = t.share.get(s.id) ?? new Map<number, number>();
    shares.set(r.year, (shares.get(r.year) ?? 0) + r.n / births.get(`${r.sex}${r.year}`)!);
    t.share.set(s.id, shares);
  }
  recentYears.set(s.id, years.filter(s.full).slice(-RECENT));
  const decades = new Map<number, number[]>();
  for (const y of years.filter(s.full)) decades.set(decade(y), [...(decades.get(decade(y)) ?? []), y]);
  fullDecades.set(s.id, decades);
}

/** Each source's latest top 100, by sex: the key's place. */
const tops = new Map<string, Map<string, number>>();
for (const s of sources) {
  const top = new Map<string, number>();
  for (const sex of ["f", "m"] as const) {
    const ranked = s.rows.filter((r) => r.year === latest.get(s.id) && r.sex === sex).sort((a, b) => b.n - a.n);
    let place = 0;
    ranked.slice(0, 100).forEach((r, i) => {
      // Equal counts share a place.
      if (i === 0 || ranked[i - 1]!.n !== r.n) place = i + 1;
      const key = keyOf(r.name);
      if (key && !top.has(key)) top.set(key, place);
    });
  }
  tops.set(s.id, top);
}

const deck = [...tallies]
  .map(([key, t]) => {
    // Its best decade in any source, as the mean of that decade's years (a year it isn't listed counting 0),
    // so a few babies in one year of a small country don't make a name.
    const best = sources.map((s) => {
      const shares = t.share.get(s.id);
      if (!shares) return 0;
      return Math.max(0, ...[...fullDecades.get(s.id)!].filter(([d]) => d >= SINCE).map(([, years]) => mean(years.map((y) => shares.get(y) ?? 0))));
    });
    const top = sources.map((s) => tops.get(s.id)!.get(key) ?? 0);
    // Where it's common: its best decade reached MIN_SHARE there, or it's in the latest top 100.
    const common = sources.map((_, i) => (best[i]! >= MIN_SHARE || top[i]! > 0 ? 1 : 0));
    if (common.every((c) => c === 0)) return null;
    // Girls' share, each source counting the same.
    const girls = mean([...t.bySource.values()].map(({ f, m }) => f / (f + m)));
    const sex = girls >= SEX_SHARE ? "f" : girls <= 1 - SEX_SHARE ? "m" : "u";
    const perMillion = Math.round(
      mean(
        sources.map((s) => {
          const shares = t.share.get(s.id);
          return mean(recentYears.get(s.id)!.map((y) => shares?.get(y) ?? 0));
        })
      ) * 1_000_000
    );
    const decades = new Map<number, number[]>();
    for (const shares of t.share.values()) {
      const bySourceDecade = new Map<number, number[]>();
      for (const [y, v] of shares) bySourceDecade.set(decade(y), [...(bySourceDecade.get(decade(y)) ?? []), v]);
      for (const [d, vs] of bySourceDecade) decades.set(d, [...(decades.get(d) ?? []), mean(vs)]);
    }
    const peak = [...decades].filter(([d]) => d >= 1940).sort((a, b) => mean(b[1]) - mean(a[1]))[0]?.[0] ?? 2020;
    return [display(t.spellings), sex, perMillion, top, peak, common] as const;
  })
  .filter((d) => d !== null)
  .sort((a, b) => a[0].localeCompare(b[0]));

const header = {
  sources: sources.map((s) => ({ id: s.id, place: s.place, latest: latest.get(s.id)! })),
  credit: sources.map((s) => s.credit).join("; "),
};
await Bun.write(OUT, JSON.stringify({ ...header, names: deck }));
await Bun.$`bunx biome format --write ${OUT.pathname}`.quiet();
console.log(
  `${deck.length} names: ${deck.filter((d) => d[1] === "f").length} girls', ${deck.filter((d) => d[1] === "m").length} boys', ${deck.filter((d) => d[1] === "u").length} either`
);

// The sources, each read into rows.

async function englandWales(): Promise<Source> {
  const page = await (
    await fetch("https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/livebirths/datasets/babynamesinenglandandwalesfrom1996")
  ).text();
  const uri = page.match(/href="(\/file\?uri=[^"]+\.xlsx)"/)![1]!;
  const file = join(work, "ew.xlsx");
  await Bun.write(file, await fetch(`https://www.ons.gov.uk${uri}`));
  const rows: Row[] = [];
  for (const [sheet, sex] of [
    ["Table_1", "f"],
    ["Table_2", "m"],
  ] as const) {
    const table = await readSheet(file, sheet);
    const head = table.findIndex((r) => r[0] === "Name");
    const columns = table[head]!.map((c) => c.match(/^(\d{4}) Count$/)?.[1]);
    for (const row of table.slice(head + 1)) {
      row.forEach((cell, i) => {
        const year = columns[i];
        if (year && /^\d+$/.test(cell)) rows.push({ name: row[0]!, sex, year: Number(year), n: Number(cell) });
      });
    }
  }
  return { id: "ew", place: "England & Wales", credit: "ONS, Baby names in England and Wales, OGL v3", rows, full: () => true };
}

async function ireland(): Promise<Source> {
  const rows: Row[] = [];
  for (const [table, sex] of [
    ["VSA60", "f"],
    ["VSA50", "m"],
  ] as const) {
    const j = (await (await fetch(`https://ws.cso.ie/public/api.restful/PxStat.Data.Cube_API.ReadDataset/${table}/JSON-stat/2.0/en`)).json()) as {
      id: string[];
      size: number[];
      value: (number | null)[];
      dimension: Record<string, { category: { index: string[]; label: Record<string, string> } }>;
    };
    const [stat, time, names] = j.id.map((id) => j.dimension[id]!.category);
    // The count, not the rank: the statistic whose label doesn't end in Rank.
    const count = stat!.index.findIndex((code) => !/Rank$/.test(stat!.label[code]!));
    const [, nYears, nNames] = j.size;
    for (let y = 0; y < nYears!; y++) {
      for (let k = 0; k < nNames!; k++) {
        const n = j.value[(count * nYears! + y) * nNames! + k];
        if (n) rows.push({ name: names!.label[names!.index[k]!]!, sex, year: Number(time!.index[y]), n });
      }
    }
  }
  return { id: "ie", place: "Ireland", credit: "CSO Ireland, VSA50 and VSA60, CC BY 4.0", rows, full: () => true };
}

/** A dataset's resources on a CKAN portal (Ontario's, New Zealand's, South Australia's), by its id. */
async function ckan(portal: string, id: string): Promise<{ name: string; format: string; url: string }[]> {
  const meta = (await (await fetch(`${portal}/api/3/action/package_show?id=${id}`)).json()) as {
    result: { resources: { name: string; format: string; url: string }[] };
  };
  return meta.result.resources;
}

async function ontario(): Promise<Source> {
  const rows: Row[] = [];
  for (const [id, sex] of [
    ["ontario-top-baby-names-female", "f"],
    ["ontario-top-baby-names-male", "m"],
  ] as const) {
    const csv = (await ckan("https://data.ontario.ca", id)).find((r) => r.format.toUpperCase() === "CSV")!;
    const [, ...lines] = (await (await fetch(csv.url)).text()).replace(/^\uFEFF/, "").split(/\r?\n/);
    for (const line of lines) {
      const [year, name, n] = line.split(",");
      if (year && name && n) rows.push({ name: titleCase(name), sex, year: Number(year), n: Number(n) });
    }
  }
  return { id: "on", place: "Ontario", credit: "ServiceOntario, Ontario top baby names, OGL-Ontario", rows, full: () => true };
}

async function newZealand(): Promise<Source> {
  const csv = (await ckan("https://catalogue.data.govt.nz", "baby-name-popularity-over-time")).find((r) => r.format.toUpperCase() === "CSV")!;
  const [, ...lines] = (await (await fetch(csv.url)).text()).replace(/^\uFEFF/, "").split(/\r?\n/);
  const rows: Row[] = [];
  for (const line of lines) {
    const [year, sex, name, n] = line.split(",");
    if (year && name && n) rows.push({ name, sex: sex === "F" ? "f" : "m", year: Number(year), n: Number(n) });
  }
  return { id: "nz", place: "New Zealand", credit: "Department of Internal Affairs, Baby name popularity over time, CC BY 4.0", rows, full: () => true };
}

async function southAustralia(): Promise<Source> {
  const resources = await ckan("https://data.sa.gov.au/data", "popular-baby-names");
  const rows: Row[] = [];
  const parse = (text: string, year: number, sex: Sex) => {
    for (const line of text.split(/\r?\n/).slice(1)) {
      const [name, n] = line.split(",").map((s) => s.replace(/"/g, "").trim());
      if (name && n) rows.push({ name: titleCase(name), n: Number(n), year, sex });
    }
  };
  const sexOf = (label: string): Sex => (/female/i.test(label) ? "f" : "m");
  for (const r of resources) {
    if (r.format !== "CSV") continue;
    if (r.url.endsWith(".zip")) {
      const dir = join(work, "sa");
      await Bun.write(join(dir, "names.zip"), await fetch(r.url));
      await Bun.$`unzip -q ${join(dir, "names.zip")} -d ${dir}`;
      for await (const file of new Bun.Glob("**/*_cy*.csv").scan(dir)) {
        const [, label, year] = file.match(/(female|male)_cy(\d{4})/)!;
        parse(await Bun.file(join(dir, file)).text(), Number(year), sexOf(label!));
      }
      continue;
    }
    // 2016 was published twice; the amended lists replace the first.
    if (/2016/.test(r.name) && !/amended/i.test(r.name)) continue;
    parse(await (await fetch(r.url)).text(), Number(r.name.match(/\d{4}/)![0]), sexOf(r.name));
  }
  return { id: "sa", place: "South Australia", credit: "Government of South Australia, Popular Baby Names, CC BY 4.0", rows, full: (year) => year <= 2017 };
}

async function unitedStates(zip: string): Promise<Source> {
  const dir = join(work, "us");
  await Bun.$`unzip -q ${zip.replace(/^~/, process.env.HOME ?? "~")} -d ${dir}`;
  const rows: Row[] = [];
  for await (const file of new Bun.Glob("yob*.txt").scan(dir)) {
    const year = Number(file.match(/\d{4}/)![0]);
    for (const line of (await Bun.file(join(dir, file)).text()).split(/\r?\n/)) {
      const [name, sex, n] = line.split(",");
      if (name && n) rows.push({ name, sex: sex === "F" ? "f" : "m", year, n: Number(n) });
    }
  }
  return { id: "us", place: "the US", credit: "US Social Security Administration, Beyond the Top 1000 Names, public domain", rows, full: () => true };
}

// Helpers.

/** A name's key: its spelling, whatever its case; null for what isn't a name. */
function keyOf(name: string): string | null {
  const key = name.trim().normalize("NFC").toLowerCase();
  if (!/^\p{L}[\p{L}'-]*\p{L}$/u.test(key) || NOT_NAMES.has(key)) return null;
  return key;
}

/** The spelling to show: the most given one not written in capitals (the registers that do lose the case), and McKenzie, not Mckenzie. */
function display(spellings: Map<string, number>): string {
  const ranked = [...spellings].sort((a, b) => b[1] - a[1]).map(([s]) => s);
  const shown = ranked.find((s) => s !== s.toUpperCase()) ?? titleCase(ranked[0]!);
  return shown.replace(/^Mc(\p{Ll})/u, (_, ch: string) => `Mc${ch.toUpperCase()}`);
}

function mean(xs: number[]): number {
  return xs.length === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / xs.length;
}

function decade(year: number) {
  return Math.floor(year / 10) * 10;
}

/** MARY-JANE as Mary-Jane, D'ARCY as D'Arcy, MCKENZIE as McKenzie. */
function titleCase(upper: string) {
  return upper
    .trim()
    .toLowerCase()
    .replace(/(^|['-])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase())
    .replace(/^Mc(\p{L})/u, (_, ch: string) => `Mc${ch.toUpperCase()}`);
}

/** The rows of a sheet in an .xlsx, as strings. Enough for a government's tables; not a general reader. */
async function readSheet(file: string, sheet: string): Promise<string[][]> {
  const part = async (name: string) => await Bun.$`unzip -p ${file} ${name}`.quiet().text();
  const fromXml = (s: string) =>
    s
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, "&");
  const shared = [...(await part("xl/sharedStrings.xml")).matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) =>
    fromXml([...m[1]!.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join(""))
  );
  const id = (await part("xl/workbook.xml")).match(new RegExp(`<sheet [^>]*name="${sheet}"[^>]*r:id="([^"]+)"`))![1];
  const rels = await part("xl/_rels/workbook.xml.rels");
  const target = [...rels.matchAll(/<Relationship [^>]*>/g)]
    .map((m) => m[0])
    .find((r) => r.includes(`Id="${id}"`))!
    .match(/Target="([^"]+)"/)![1]!;
  const xml = await part(`xl/${target.replace(/^\/?xl\//, "")}`);
  return [...xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)].map((r) =>
    [...r[1]!.matchAll(/<c ([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)].map((c) => {
      const v = c[2]?.match(/<v>([\s\S]*?)<\/v>/)?.[1] ?? c[2]?.match(/<t[^>]*>([\s\S]*?)<\/t>/)?.[1] ?? "";
      return /t="s"/.test(c[1]!) ? shared[Number(v)]! : fromXml(v);
    })
  );
}
