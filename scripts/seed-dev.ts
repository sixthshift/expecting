// Fills the dev database with a pregnancy's worth of everything, so every
// pillar has something to show. The Journal: notes and letters, movements,
// sickness and cravings, feelings, the firsts with both your words, bump
// photos, scans and other pictures, papers (PDFs). The Planner: tasks done,
// your own tasks, appointments, questions, the lists marked and your own. The
// Drawer: names and votes, Who does what, Your people and their gifts, bingo,
// the question a week. Emergency info, and the extras turned on. Weeks 4 to
// the current one, from the due date in settings.
//
//   bun scripts/seed-dev.ts            (DATA_DIR, default ./data)
//
// On a new database (one of you, or no due date) it sets one up first: a due
// date ten weeks off (week 30), the other of you (no password: the first login
// sets it), onboarding done and the questions answered. What's already there
// it keeps.
//
// Run it again to start over: what it added has ids beginning `5eed` (and
// their uploads' folders), dropped first; the firsts, ticks, marks, picks,
// answers to the weekly question, the extras and Emergency info are set, not
// added. The pictures and PDFs are drawn by Playwright's Chromium (the e2e's),
// made up, and say so.

import { Database } from "bun:sqlite";
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";
import { parse } from "yaml";
import { deal } from "../src/lib/drawer/bingo";
import { JOBS } from "../src/lib/drawer/jobs";
import { DECK, widespread } from "../src/lib/drawer/nameDeck";
import { WEEKLY } from "../src/lib/home/weekly";

const DATA_DIR = process.env.DATA_DIR ?? "./data";
const db = new Database(join(DATA_DIR, "expecting.db"));
db.exec("PRAGMA foreign_keys = ON");

/** The same "random" every run, so a re-seed looks the same. */
let rngState = 0x5eed;
const rand = () => {
  rngState = (rngState * 1103515245 + 12345) & 0x7fffffff;
  return rngState / 0x7fffffff;
};
const chance = (p: number) => rand() < p;
const pick = <T>(xs: readonly T[]): T => xs[Math.floor(rand() * xs.length)]!;

// ── Set up, if it's new ─────────────────────────────────────────────────────

const nowIso = new Date().toISOString();
const NAMES = { carrying: "Cindy", partner: "Jason" } as const;
const already = db.query<{ id: string; name: string; role: "carrying" | "partner" }, []>("SELECT id, name, role FROM person ORDER BY created_at").all();
if (already.length === 0) throw new Error("No one here yet: open the app and set yourself up first.");
if (already.length === 1) {
  const role = already[0]!.role === "carrying" ? "partner" : "carrying";
  db.query("INSERT INTO person (id, name, role, created_at) VALUES (?, ?, ?, ?)").run(crypto.randomUUID(), NAMES[role], role, nowIso);
}
const settingsNow = db.query<{ due_date: string | null }, []>("SELECT due_date FROM settings WHERE id = 1").get();
if (!settingsNow?.due_date) {
  const dueDay = new Date(Date.now() + 70 * 86_400_000).toISOString().slice(0, 10);
  db.query(
    "INSERT INTO settings (id, due_date, baby, onboarded_at, updated_at) VALUES (1, ?, 'boy', ?, ?) ON CONFLICT(id) DO UPDATE SET due_date = excluded.due_date, baby = excluded.baby, onboarded_at = coalesce(settings.onboarded_at, excluded.onboarded_at), updated_at = excluded.updated_at"
  ).run(dueDay, nowIso, nowIso);
}

// ── What's there ────────────────────────────────────────────────────────────

const settings = db.query<{ due_date: string | null }, []>("SELECT due_date FROM settings WHERE id = 1").get();
const people = db.query<{ id: string; name: string; role: string }, []>("SELECT id, name, role FROM person ORDER BY role").all();
if (!settings?.due_date) throw new Error("No due date in settings.");
if (people.length < 2) throw new Error("Two people, please: the Journal is for both of you.");
const due = settings.due_date;
/** A carries, B is the partner. */
const A = people.find((p) => p.role === "carrying") ?? people[0]!;
const B = people.find((p) => p !== A)!;

// ── Days and ids ────────────────────────────────────────────────────────────

const DAY = 86_400_000;
const lmp = new Date(`${due}T00:00:00Z`).getTime() - 280 * DAY;
const today = new Date().toISOString().slice(0, 10);
/** Week `w`, day `d` (0–6): an ISO day. */
const on = (w: number, d = 0) => new Date(lmp + (w * 7 + d) * DAY).toISOString().slice(0, 10);
const nowWeek = Math.floor((Date.now() - lmp) / DAY / 7);
/** Only what's happened: nothing after today. */
const past = (day: string) => day <= today;
/** When it was kept: the day and time, in Sydney's summer time near enough. */
const at = (day: string, time: string) => new Date(`${day}T${time}:00+11:00`).toISOString();

let n = 0;
const id = () => `5eed0000-0000-4000-8000-${(++n).toString(16).padStart(12, "0")}`;

// ── Start over ──────────────────────────────────────────────────────────────

const seededUploads = db.query<{ id: string }, []>("SELECT id FROM upload WHERE id LIKE '5eed%'").all();
db.transaction(() => {
  for (const t of [
    "journal_entry",
    "appetite_entry",
    "feeling",
    "photo",
    "paper",
    "appointment",
    "question",
    "baby_name",
    "circle_gift",
    "circle_person",
    "own_line",
    "own_list",
    "own_task",
  ])
    db.exec(`DELETE FROM ${t} WHERE id LIKE '5eed%'`);
  db.exec("DELETE FROM task_tick WHERE task_id LIKE '5eed%'");
  db.exec("DELETE FROM list_mark WHERE line_id LIKE '5eed%'");
  db.exec("DELETE FROM upload WHERE id LIKE '5eed%'");
})();
for (const u of seededUploads) await rm(join(DATA_DIR, "uploads", u.id), { recursive: true, force: true });

// ── Pictures and PDFs ───────────────────────────────────────────────────────

const browser = await chromium.launch();
const page = await browser.newPage();

async function jpeg(html: string, width: number, height: number): Promise<Uint8Array> {
  await page.setViewportSize({ width, height });
  await page.setContent(`<!doctype html><html><body style="margin:0;width:${width}px;height:${height}px;overflow:hidden">${html}</body></html>`);
  return page.screenshot({ type: "jpeg", quality: 82 });
}

async function pdf(html: string): Promise<Uint8Array> {
  await page.setContent(`<!doctype html><html><head><style>
    body{font:13px/1.5 Helvetica,Arial,sans-serif;color:#222;margin:40px}
    h1{font-size:20px;margin:0 0 4px} .sub{color:#666;margin-bottom:24px}
    table{border-collapse:collapse;width:100%;margin:16px 0} td,th{border-bottom:1px solid #ddd;padding:6px 8px;text-align:left}
    .stamp{position:fixed;top:30px;right:40px;border:2px solid #c33;color:#c33;padding:4px 10px;font-weight:bold;transform:rotate(6deg)}
  </style></head><body><div class="stamp">SAMPLE</div>${html}</body></html>`);
  return page.pdf({ format: "A4" });
}

/** A side-on bump, growing with the week: a made-up illustration, not a photo. */
function bumpHtml(week: number, hue: number): string {
  const belly = 10 + Math.max(0, week - 10) * 3.2;
  return `<svg viewBox="0 0 900 1200" width="900" height="1200" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${hue},45%,92%)"/><stop offset="1" stop-color="hsl(${hue},35%,80%)"/></linearGradient></defs>
    <rect width="900" height="1200" fill="url(#g)"/>
    <rect x="80" y="120" width="260" height="380" rx="10" fill="hsl(${hue},40%,97%)" stroke="hsl(${hue},20%,70%)" stroke-width="10"/>
    <line x1="210" y1="120" x2="210" y2="500" stroke="hsl(${hue},20%,70%)" stroke-width="8"/>
    <ellipse cx="760" cy="1040" rx="60" ry="22" fill="hsl(120,20%,45%)" opacity=".5"/>
    <path d="M760 1040 C 740 920, 700 880, 690 800 M760 1040 C 780 930, 830 890, 840 820 M760 1040 C 760 900, 760 860, 765 780" stroke="hsl(120,30%,40%)" stroke-width="10" fill="none"/>
    <circle cx="450" cy="250" r="70" fill="hsl(25,35%,55%)"/>
    <path d="M400 330 L500 330 L520 560 Q ${520 + belly} 600 ${515 + belly * 0.9} 700 Q ${520 + belly * 0.6} 800 510 820 L520 1100 L390 1100 L380 560 Z" fill="hsl(${(hue + 180) % 360},30%,45%)"/>
    <path d="M500 380 L560 600 L540 610 L480 420 Z" fill="hsl(25,35%,55%)"/>
  </svg>`;
}

/** An ultrasound, made up: a fan of grey speckle and a shape in it. */
function scanHtml(week: number, seed: number): string {
  const dots = Array.from({ length: 900 }, (_, i) => {
    const r = Math.sin(i * 12.9898 + seed) * 43758.5453;
    const t = r - Math.floor(r);
    const a = -0.75 + ((((Math.sin(i * 78.233 + seed) * 43758.5453) % 1) + 1) % 1) * 1.5;
    const d = 120 + t * 700;
    return `<circle cx="${600 + Math.sin(a) * d}" cy="${60 + Math.cos(a) * d}" r="${1 + t * 3}" fill="#fff" opacity="${0.08 + t * 0.25}"/>`;
  }).join("");
  const size = week < 15 ? 90 : 190;
  return `<svg viewBox="0 0 1200 900" width="1200" height="900" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="900" fill="#050505"/>
    <path d="M600 60 L1060 760 A 820 820 0 0 1 140 760 Z" fill="#1d1d1d"/>
    ${dots}
    <ellipse cx="600" cy="470" rx="${size * 1.9}" ry="${size * 1.25}" fill="#000" opacity=".85"/>
    <path d="M${600 - size} 500 q ${size * 0.4} ${-size * 0.9} ${size * 1.1} ${-size * 0.6} q ${size * 0.7} ${size * 0.2} ${size * 0.6} ${size * 0.7} q ${-size * 0.6} ${size * 0.5} ${-size * 1.7} ${-size * 0.1}" fill="#bbb" opacity=".8"/>
    <circle cx="${600 + size * 0.45}" cy="${410 - size * 0.05}" r="${size * 0.35}" fill="#ccc" opacity=".8"/>
    <text x="40" y="60" fill="#ddd" font-family="monospace" font-size="26">SAMPLE  ${week}w  GA</text>
    <text x="40" y="860" fill="#888" font-family="monospace" font-size="20">Made up for Expecting's dev data</text>
  </svg>`;
}

/** Something else: a room, a seat, a table, in flat shapes. */
function otherHtml(kind: "nursery" | "carSeat" | "shower" | "outfit"): string {
  const scenes = {
    nursery: `<rect width="900" height="1200" fill="#c9d8c5"/><rect y="850" width="900" height="350" fill="#b08d6e"/>
      <rect x="200" y="560" width="500" height="320" fill="none" stroke="#fff" stroke-width="18"/>${Array.from({ length: 9 }, (_, i) => `<line x1="${250 + i * 50}" y1="560" x2="${250 + i * 50}" y2="880" stroke="#fff" stroke-width="10"/>`).join("")}
      <circle cx="680" cy="250" r="90" fill="#f4e7c5"/><rect x="120" y="180" width="200" height="160" fill="#fff" opacity=".7"/>`,
    carSeat: `<rect width="900" height="1200" fill="#7a8592"/><rect x="150" y="300" width="600" height="700" rx="60" fill="#3c4048"/>
      <path d="M300 420 Q450 340 600 420 L620 880 Q450 940 280 880 Z" fill="#2a2d33"/><rect x="420" y="560" width="60" height="260" rx="10" fill="#c33"/>`,
    shower: `<rect width="900" height="1200" fill="#f6e3e9"/><rect x="80" y="760" width="740" height="40" fill="#c8a98b"/>
      ${[
        [220, 560, "#f9c5d1"],
        [450, 520, "#cfe3f7"],
        [680, 580, "#fff1b8"],
      ]
        .map(
          ([x, y, c]) =>
            `<circle cx="${x}" cy="${y}" r="90" fill="${c}"/><line x1="${x}" y1="${Number(y) + 90}" x2="${x}" y2="760" stroke="#999" stroke-width="4"/>`
        )
        .join("")}
      <rect x="360" y="640" width="180" height="120" fill="#fff" stroke="#e3b6c3" stroke-width="8"/>`,
    outfit: `<rect width="900" height="1200" fill="#fdf8ef"/><path d="M300 300 L400 260 Q450 320 500 260 L600 300 L700 420 L630 470 L600 430 L600 900 L300 900 L300 430 L270 470 L200 420 Z" fill="#f2d65a"/>`,
  };
  return `<svg viewBox="0 0 900 1200" width="900" height="1200" xmlns="http://www.w3.org/2000/svg">${scenes[kind]}</svg>`;
}

const uploadsDir = join(DATA_DIR, "uploads");

/** An upload with its bytes on disk: a picture with its display copy and thumbnail, or a PDF as it is. */
async function upload(
  by: string,
  day: string,
  file: { name: string; bytes: Uint8Array; thumb?: Uint8Array; width?: number; height?: number; pdf?: boolean }
): Promise<string> {
  const uploadId = id();
  const folder = join(uploadsDir, uploadId);
  await mkdir(folder, { recursive: true });
  await Bun.write(join(folder, "original"), file.bytes);
  if (!file.pdf) {
    await Bun.write(join(folder, "display"), file.bytes);
    await Bun.write(join(folder, "thumb"), file.thumb!);
  }
  db.query("INSERT INTO upload (id, name, type, size, width, height, display, thumb, by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
    uploadId,
    file.name,
    file.pdf ? "application/pdf" : "image/jpeg",
    file.bytes.length,
    file.width ?? null,
    file.height ?? null,
    file.pdf ? 0 : 1,
    file.pdf ? 0 : 1,
    by,
    at(day, "12:00")
  );
  return uploadId;
}

async function picture(html: string, width: number, height: number) {
  const bytes = await jpeg(html, width, height);
  const scale = 480 / Math.max(width, height);
  await page.setViewportSize({ width: Math.round(width * scale), height: Math.round(height * scale) });
  await page.setContent(
    `<!doctype html><html><body style="margin:0;overflow:hidden"><img src="data:image/jpeg;base64,${Buffer.from(bytes).toString("base64")}" style="width:100%;height:100%;display:block"></body></html>`
  );
  const thumb = await page.screenshot({ type: "jpeg", quality: 75 });
  return { bytes, thumb, width, height };
}

// ── The Journal ─────────────────────────────────────────────────────────────

type Kept = { w: number; d: number; time: string; by: typeof A };

const notes: (Kept & { kind: "note" | "letter"; body: string; fromBoth?: boolean })[] = [
  { w: 4, d: 2, time: "06:40", by: A, kind: "note", body: "Two lines. Sat on the bathroom floor for ages before saying anything." },
  { w: 5, d: 1, time: "21:15", by: B, kind: "note", body: "Haven't told a soul. Walked around Coles grinning like an idiot." },
  { w: 6, d: 3, time: "17:30", by: A, kind: "note", body: "GP today. Referral for bloods and the dating scan, and a printout about folate." },
  { w: 8, d: 0, time: "22:05", by: B, kind: "letter", body: "Dear little one, you're the size of a raspberry and already running the house." },
  { w: 9, d: 4, time: "08:10", by: A, kind: "note", body: "Toast and ginger tea is the only breakfast that stays down." },
  { w: 12, d: 2, time: "14:20", by: A, kind: "note", body: "Dating scan. Saw the heartbeat flicker on the screen. Both of us cried in the car park." },
  { w: 13, d: 6, time: "19:45", by: B, kind: "note", body: "Told the parents over Sunday lunch. Nan dropped her fork, then asked if we'd thought of names." },
  { w: 14, d: 1, time: "07:30", by: A, kind: "note", body: "Second trimester. The nausea is finally easing off." },
  { w: 16, d: 3, time: "20:00", by: B, kind: "note", body: "Started the names list on the fridge. Already arguing about it." },
  { w: 18, d: 5, time: "22:30", by: A, kind: "note", body: "A flutter, like a bubble popping. Not sure yet, but maybe?" },
  { w: 20, d: 1, time: "16:00", by: B, kind: "note", body: "Morphology scan. Everything measuring well. He kept a hand over his face the whole time." },
  {
    w: 20,
    d: 2,
    time: "21:10",
    by: A,
    kind: "letter",
    fromBoth: true,
    body: "We saw you properly today: your spine like a string of pearls, your feet. We can't wait to meet you.",
  },
  { w: 22, d: 6, time: "15:40", by: B, kind: "note", body: "Painted the nursery a pale sage. Took two coats and most of the weekend." },
  { w: 24, d: 2, time: "09:00", by: A, kind: "note", body: "Booked the glucose test and the antenatal classes in one phone call. Felt very organised." },
  { w: 26, d: 1, time: "11:30", by: A, kind: "note", body: "Glucose test done. The orange drink is exactly as bad as everyone says." },
  { w: 28, d: 3, time: "20:15", by: B, kind: "note", body: "First antenatal class. Learned to swaddle a doll. Ours came out looking like a burrito." },
  { w: 29, d: 5, time: "22:40", by: A, kind: "letter", body: "Dear you, you kick hardest when we read to you. We think you already know our voices." },
  { w: 30, d: 6, time: "18:00", by: B, kind: "note", body: "Baby shower at Mum's. Too many tiny socks, not enough sleep advice." },
  { w: 32, d: 2, time: "13:00", by: A, kind: "note", body: "Hospital tour. The birth suite has a bath and a beanbag. Worked out where to park." },
  { w: 34, d: 4, time: "17:20", by: B, kind: "note", body: "Car seat fitted. Took the two of us, a YouTube video and a fair bit of swearing." },
  {
    w: 35,
    d: 0,
    time: "21:50",
    by: B,
    kind: "letter",
    body: "Little one, the cot's up, your clothes are washed, and we keep standing in your room just looking at it.",
  },
  { w: 36, d: 3, time: "19:30", by: A, kind: "note", body: "Bag packed. Unpacked. Packed again." },
  { w: 37, d: 0, time: "08:00", by: A, kind: "note", body: "Full term! Last day of work on Friday, and a cake I didn't have to share." },
  { w: 38, d: 1, time: "10:15", by: B, kind: "note", body: "Nesting. Washed every onesie twice and folded them by size." },
  { w: 38, d: 3, time: "21:00", by: A, kind: "note", body: "Midwife says he's head down and settled. Any day now, or another fortnight." },
];

/** Movements: from week 18, most days later on, a few with words. */
const movements: (Kept & { body: string; different?: boolean })[] = [];
const said = ["Hiccups after dinner", "Big roll during the news", "Kicked the remote off the bump", "Wriggly in the bath", "Very busy at 2 am", ""];
for (let w = 18; w <= nowWeek; w++) {
  const days = w < 22 ? [3] : w < 26 ? [1, 4] : w < 32 ? [0, 2, 4, 6] : [0, 1, 2, 3, 4, 5, 6];
  for (const d of days) {
    const k = w * 7 + d;
    const times = w >= 34 && k % 3 === 0 ? ["09:20", "21:40"] : [k % 2 ? "20:30" : "07:50"];
    for (const time of times) movements.push({ w, d, time, by: k % 4 === 0 ? B : A, body: k % 5 === 0 ? said[k % said.length]! : "" });
  }
}

/** Sickness from week 6 to 13, cravings and things gone off along the way. */
const appetite: (Kept & { kind: "sick" | "craving" | "off"; how?: "queasy" | "vomited" | "fluids"; what?: string; note?: string })[] = [];
for (let w = 6; w <= 13; w++) {
  for (const d of w >= 8 && w <= 10 ? [0, 1, 2, 4, 5] : [1, 4]) {
    appetite.push({
      w,
      d,
      time: d % 2 ? "07:10" : "16:30",
      by: A,
      kind: "sick",
      how: w >= 8 && w <= 10 && d === 2 ? "vomited" : "queasy",
      note: w === 9 && d === 2 ? "Couldn't face the kitchen" : undefined,
    });
  }
}
appetite.push(
  { w: 7, d: 2, time: "15:00", by: A, kind: "off", what: "Coffee" },
  { w: 8, d: 5, time: "18:30", by: A, kind: "off", what: "Chicken" },
  { w: 7, d: 4, time: "20:00", by: A, kind: "craving", what: "Pickles" },
  { w: 11, d: 2, time: "21:30", by: A, kind: "craving", what: "Pickles", note: "Straight from the jar" },
  { w: 15, d: 3, time: "15:20", by: A, kind: "craving", what: "Mandarins" },
  { w: 17, d: 1, time: "10:00", by: A, kind: "craving", what: "Mandarins" },
  { w: 19, d: 6, time: "22:10", by: A, kind: "craving", what: "Vegemite toast" },
  { w: 24, d: 2, time: "14:45", by: A, kind: "craving", what: "Sour lollies" },
  { w: 27, d: 4, time: "21:00", by: A, kind: "craving", what: "Pickles", note: "Back again" },
  { w: 33, d: 1, time: "13:15", by: A, kind: "craving", what: "Ice" },
  { w: 36, d: 5, time: "16:40", by: A, kind: "craving", what: "Ice" }
);
/** How each of you is feeling: once a week each. */
/** How each of you is feeling: now and then early on, twice a week from week 28. */
const STEPS = ["rough", "low", "okay", "good", "great"] as const;
const feelings: (Kept & { step: (typeof STEPS)[number]; words: string[]; note?: string })[] = [];
for (let w = 6; w <= nowWeek; w++) {
  for (const [i, by] of [A, B].entries()) {
    const d = (w + i * 3) % 7;
    const sickWeeks = w >= 8 && w <= 10 && by === A;
    const step = sickWeeks ? "low" : STEPS[2 + ((w + i) % 3)]!;
    const words = sickWeeks
      ? ["tired", "flat"]
      : step === "great"
        ? ["excited", "connected"]
        : step === "good"
          ? ["happy", "grateful"]
          : w > 34
            ? ["tired", "anxious"]
            : ["calm"];
    feelings.push({ w, d, time: "21:00", by, step, words, note: w === 37 && by === B ? "Can't believe it's nearly here" : undefined });
  }
}

/** The firsts, and both your words for them. */
const firsts: { key: string; w: number; d: number; by: typeof A; words: [typeof A, string][] }[] = [
  {
    key: "found-out",
    w: 4,
    d: 2,
    by: A,
    words: [
      [A, "Bathroom floor, 6:40 on a Tuesday, still in pyjamas."],
      [B, "Woken up and handed a stick. Best alarm clock ever."],
    ],
  },
  { key: "first-craving", w: 7, d: 4, by: A, words: [[A, "Pickles. A whole jar, standing at the fridge."]] },
  { key: "first-scan", w: 12, d: 2, by: B, words: [[B, "A little bean doing star jumps."]] },
  {
    key: "heartbeat",
    w: 12,
    d: 2,
    by: A,
    words: [
      [A, "Like galloping horses, fast and loud."],
      [B, "So quick I thought something was wrong. It wasn't."],
    ],
  },
  { key: "told-family", w: 13, d: 6, by: B, words: [[B, "Sunday lunch. Nan dropped her fork."]] },
  { key: "first-outfit", w: 15, d: 5, by: B, words: [[B, "A tiny yellow onesie with ducks on it, from the market."]] },
  { key: "showing", w: 16, d: 2, by: A, words: [[A, "A colleague asked, then apologised in case I wasn't."]] },
  { key: "first-kick", w: 19, d: 2, by: A, words: [[A, "On the couch watching the footy. A proper thump."]] },
  { key: "boy-or-girl", w: 20, d: 1, by: B, words: [[B, "A boy. I guessed girl, so I owe someone ten dollars."]] },
  { key: "felt-outside", w: 23, d: 4, by: B, words: [[B, "Hand on the bump for twenty minutes, then one kick right into my palm."]] },
  { key: "cot-up", w: 34, d: 6, by: B, words: [[B, "In our room, by the window. Two hours and one spare screw."]] },
  { key: "bag-packed", w: 36, d: 3, by: A, words: [[A, "The good lip balm and the long phone charger."]] },
];

/** Done: the tasks ticked, on the day. */
const ticks: [string, number, number][] = [
  ["book-first-gp-visit", 5, 2],
  ["have-first-blood-tests", 7, 1],
  ["book-combined-screening", 9, 3],
  ["book-in-hospital", 10, 2],
  ["book-morphology-scan", 15, 1],
  ["ask-employer-about-paid-leave", 19, 4],
  ["book-antenatal-classes", 24, 2],
  ["book-glucose-tolerance-test", 24, 2],
  ["get-whooping-cough-vaccine", 28, 1],
  ["give-written-leave-notice", 28, 4],
  ["submit-pre-birth-claim", 31, 2],
  ["ask-about-hospital-tour", 31, 5],
  ["confirm-leave-dates", 34, 0],
  ["set-up-cot-in-your-room", 34, 6],
  ["buy-and-fit-car-seat", 34, 4],
  ["pack-hospital-bag", 36, 3],
];

// ── More of the Journal ─────────────────────────────────────────────────────

/** Everyday notes, a few a week, on the days the story above leaves free. */
const everyday: [string, string][] = [
  ["A", "Fell asleep on the couch at 8:15. Again."],
  ["B", "Made a spreadsheet of prams. Nobody asked for it."],
  ["A", "Walked to the beach and back. Slower than last month, still lovely."],
  ["B", "Read the week's note out loud over breakfast. Apparently he has eyelashes now."],
  ["A", "Bought maternity jeans. Life-changing."],
  ["B", "Rubbed her feet while we watched the cricket. Both counted it as a win."],
  ["A", "Couldn't find my keys. They were in the fridge."],
  ["B", "Started reading the birth book. Got to chapter three and had to have a lie down."],
  ["A", "Swim at the local pool. Felt weightless for half an hour."],
  ["B", "Assembled the change table. One screw left over, which is apparently normal."],
  ["A", "Heartburn from a single spoon of curry. Worth it."],
  ["B", "Her sister came round with a bag of hand-me-downs. Sorted them into keep and op shop."],
  ["A", "Pregnancy yoga. Mostly lying on a bolster, which suits me."],
  ["B", "Booked the car in for a service before it's too late to bother."],
  ["A", "Dreamt he arrived with a full beard. Woke up laughing."],
  ["B", "Played him some Paul Kelly through the bump. He kicked at the chorus."],
  ["A", "Work farewell lunch planned for my last week. Already know what I'm ordering."],
  ["B", "Cleaned out the spare room. Found three boxes of cables we'll never use."],
  ["A", "Slept nine hours straight. Unheard of."],
  ["B", "Practised the drive to the hospital at 5 pm. Twenty-two minutes."],
  ["A", "Sat in the garden with a lemonade and did absolutely nothing."],
  ["B", "Did the hospital paperwork online. Had to look up my own Medicare number."],
  ["A", "Friends over for dinner. Everyone wanted to feel a kick, and he refused."],
  ["B", "Learned how to fold a pram one-handed in the Baby Bunting car park."],
];
const usedDays = new Set(notes.map((e) => `${e.w}:${e.d}`));
let ev = 0;
for (let w = 6; w <= nowWeek; w++) {
  for (const d of [1, 4]) {
    if (usedDays.has(`${w}:${d}`) || !chance(0.7)) continue;
    const [who, body] = everyday[ev++ % everyday.length]!;
    notes.push({ w, d, time: pick(["07:45", "12:30", "18:15", "21:20"]), by: who === "A" ? A : B, kind: "note", body });
  }
}

// ── Setting up: answers, extras ─────────────────────────────────────────────

const anyAnswer = db.query("SELECT 1 FROM answer LIMIT 1").get();
if (!anyAnswer) {
  const leave = (w: number) => on(w, 0);
  const answers: [string, "carrying" | "partner" | null, string, number][] = [
    ["firstBaby", null, "yes", 4],
    ["babies", null, "one", 4],
    ["care", null, "public", 4],
    ["booked", null, "yes", 10],
    ["cover", null, "no", 4],
    ["birth", null, "vaginal", 4],
    ["birthPlace", null, "hospital", 20],
    ["work", "carrying", "employee", 4],
    ["work", "partner", "employee", 4],
    ["state", null, "nsw", 4],
    ["rhd", null, "positive", 12],
    ["childcare", null, "yes", 12],
    ["feeding", null, "breast", 24],
    ["paidLeave", "carrying", "yes", 20],
    ["paidLeave", "partner", "yes", 20],
    ["leaveStart", "carrying", leave(37), 20],
    ["leaveStart", "partner", leave(40), 20],
  ];
  const ins = db.query("INSERT INTO answer (id, question, about, value, answered_by, answered_at) VALUES (?, ?, ?, ?, ?, ?)");
  for (const [q, about, value, w] of answers) ins.run(crypto.randomUUID(), q, about, value, w <= 4 ? B.id : A.id, at(past(on(w)) ? on(w) : today, "20:00"));
}

const EXTRAS_ON = [
  "food-safety",
  "announcing",
  "baby-budget",
  "pregnancy-bingo",
  "grandparents",
  "exercise",
  "babymoon",
  "choosing-names",
  "partner-prep",
  "nursery",
  "date-nights",
  "who-does-what",
  "question-a-week",
  "sleep-setup",
  "second-hand",
  "baby-shower",
  "freebies",
  "keepsakes",
  "help-network",
  "thank-you-notes",
  "freezer-meals",
  "birth-playlist",
  "visitors",
  "birth-announcement",
];
const extraOn = new Set(EXTRAS_ON);

// ── What the content asks: tasks and lines ──────────────────────────────────

type Front = {
  id: string;
  extra?: string;
  private?: boolean;
  decide_by?: number;
  tasks?: { id: string; due?: number; opens?: number }[];
  lines?: { id: string; list: string; section?: string; when?: number; task?: string }[];
};
const fronts: Front[] = [];
for await (const file of new Bun.Glob("content/items/*.md").scan(".")) {
  const text = await Bun.file(file).text();
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (m) fronts.push(parse(m[1]!) as Front);
}
const shown = fronts.filter((f) => !f.private && (!f.extra || extraOn.has(f.extra)));
const tasks = shown.flatMap((f) => [
  ...(f.tasks ?? []).map((t) => ({ id: t.id, due: t.due ?? t.opens ?? 20 })),
  ...(f.decide_by ? [{ id: `decide-${f.id}`, due: f.decide_by }] : []),
]);
const lines = shown.flatMap((f) => f.lines ?? []);
const taskIds = new Set(tasks.map((t) => t.id));

// ── The Planner ─────────────────────────────────────────────────────────────

/** Done: most of what was due by now, a few just ahead, on or near the day it was due. */
for (const t of tasks) {
  if (ticks.some(([id]) => id === t.id)) continue;
  if (t.due < nowWeek - 1 ? chance(0.88) : t.due <= nowWeek + 2 ? chance(0.35) : chance(0.04)) {
    const w = Math.max(4, Math.min(nowWeek, t.due - Math.floor(rand() * 3)));
    ticks.push([t.id, w, Math.floor(rand() * 7)]);
  }
}
for (let i = ticks.length - 1; i >= 0; i--) if (!taskIds.has(ticks[i]![0])) ticks.splice(i, 1);

const ownTasks: [string, number, boolean][] = [
  ["Tell the landlord about the baby", 14, true],
  ["Clear out the spare room", 20, true],
  ["Sort Mum's hand-me-down bag", 22, true],
  ["Get the car serviced", 27, true],
  ["Ask work about the parking spot", 29, false],
  ["Frame the scan picture for Nan", 30, false],
  ["Cancel the gym membership", 33, false],
  ["Fill the freezer before the 38th week", 36, false],
  ["Write thank-you cards from the shower", 31, false],
  ["Install the white-noise app on both phones", 35, false],
];

const appointments: [string, number, number, string | null, string | null, string | null][] = [
  ["GP: confirm the pregnancy", 6, 3, "09:15", "Sample Street Medical", "Bring the list of medicines"],
  ["First blood tests", 7, 1, "07:30", "Laverty Pathology, Sample St", "Fasting not needed"],
  ["Dating scan", 12, 2, "14:00", "Sample Imaging, Level 2", "Full bladder: drink 1 litre an hour before"],
  ["Booking-in visit", 13, 1, "10:00", "Sample Hospital antenatal clinic", "Both of us. Allow two hours."],
  ["Midwife check", 16, 3, "11:30", "Sample Hospital antenatal clinic", null],
  ["Morphology scan", 20, 1, "15:30", "Sample Imaging, Level 2", "Decide beforehand if we want to know"],
  ["Midwife check", 22, 2, "11:00", "Sample Hospital antenatal clinic", null],
  ["Dentist (free check while pregnant)", 23, 4, "16:15", "Smile Dental", null],
  ["Glucose tolerance test", 26, 3, "08:00", "Laverty Pathology, Sample St", "Fasting from 10 pm. Bring a book: two hours."],
  ["Midwife check", 26, 3, "11:15", "Sample Hospital antenatal clinic", null],
  ["Antenatal class 1 of 4", 28, 3, "18:30", "Sample Hospital, Education Room 3", null],
  ["Whooping cough vaccine", 28, 1, "12:40", "Sample Street Medical", null],
  ["Antenatal class 2 of 4", 29, 3, "18:30", "Sample Hospital, Education Room 3", null],
  ["Midwife check", 30, 2, "10:30", "Sample Hospital antenatal clinic", "Ask about the hospital tour"],
  ["Antenatal class 3 of 4", 30, 3, "18:30", "Sample Hospital, Education Room 3", "Breastfeeding session"],
  ["Physio: pelvic floor", 30, 5, "09:00", "Women's Physio Co", null],
  ["Antenatal class 4 of 4", 31, 3, "18:30", "Sample Hospital, Education Room 3", null],
  ["Hospital tour", 32, 2, "13:00", "Sample Hospital, main entrance", "Meet at the front desk"],
  ["Midwife check", 32, 4, "11:00", "Sample Hospital antenatal clinic", null],
  ["Midwife check", 34, 2, "11:00", "Sample Hospital antenatal clinic", null],
  ["GBS swab and midwife check", 36, 1, "10:30", "Sample Hospital antenatal clinic", "Talk through the birth plan"],
  ["Midwife check", 37, 2, "10:30", "Sample Hospital antenatal clinic", null],
  ["Midwife check", 38, 2, "10:30", "Sample Hospital antenatal clinic", null],
  ["Midwife check", 39, 2, "10:30", "Sample Hospital antenatal clinic", null],
  ["Midwife check: 40 weeks", 40, 1, "09:30", "Sample Hospital antenatal clinic", "Ask about what happens if we go over"],
];

const questions: [string, string | null, number | null, number][] = [
  ["Is it okay to keep drinking one coffee a day?", "Yes: up to 200 mg of caffeine, about one or two cups.", 6, 6],
  ["Which pain relief can I take for headaches?", "Paracetamol is fine. Avoid ibuprofen.", 13, 9],
  ["Do we need to do the NIPT, or is the combined screen enough?", "Combined screen first; NIPT if the result is high chance.", 12, 10],
  ["How long can I keep flying for?", "Domestic until 36 weeks with a letter after 28.", 22, 18],
  ["Is my iron level okay, or should I take a supplement?", "A bit low: one iron tablet every second day, not with tea.", 26, 24],
  ["When should we come in once labour starts?", "Contractions 3 in 10 lasting a minute, or waters break, or anything worrying.", 30, 27],
  ["Can the partner stay overnight after the birth?", null, null, 28],
  ["Do they have a birth pool, and how do we ask for it?", null, null, 29],
  ["Is it okay to sleep on my back now and then?", null, null, 30],
  ["When will we know if he's head down?", null, null, 30],
  ["Should we bring our own pillows to the birth suite?", null, null, 30],
  ["What happens if I go past 41 weeks?", null, null, 30],
];

// ── The Drawer ──────────────────────────────────────────────────────────────

const ownNames = ["Oscar", "Harvey", "Theodore", "Archie", "Felix"];
const deckBoys = DECK.filter((d) => d.sex === "m" && widespread(d));
const deckNames = Array.from(new Set([...Array.from({ length: 40 }, () => pick(deckBoys.slice(0, 300)).name)]));

const circle: [string, string | null, "hospital" | "first-weeks" | "not-yet" | null, "first" | "next" | "everyone" | null, string | null, number | null][] = [
  ["Mum (Linda)", "Cindy's mum, 20 minutes away", "hospital", "first", "Washing and the first few dinners", 1],
  ["Dad (Peter)", null, "hospital", "first", "Mowing and the bins", null],
  ["Margaret", "Jason's mum, in Newcastle", "first-weeks", "first", "Staying the second week", 8],
  ["Nan", null, "first-weeks", "first", null, null],
  ["Sophie", "Cindy's sister", "hospital", "first", "Walking the dog", 3],
  ["Tom and Priya", "Next door", "first-weeks", "next", "Meals", 5],
  ["Ben", "Jason's brother", "first-weeks", "next", "Picking up groceries", 10],
  ["Aunty Jo", null, "not-yet", "next", null, null],
  ["Hannah", "Uni friend, three kids, all the advice", "first-weeks", "next", "Lasagne, apparently famous", 12],
  ["Mike and Sarah", "Antenatal class friends", "not-yet", "everyone", null, null],
  ["Raj", "Jason's work", null, "everyone", null, null],
  ["The book club", null, "not-yet", "everyone", "A meal roster of their own", 15],
  ["Grace", "Cindy's oldest friend", "first-weeks", "next", "A night off: babysitting when we're ready", null],
  ["Uncle Dave", null, "not-yet", "everyone", null, null],
];
const gifts: [string, string, boolean][] = [
  ["Mum (Linda)", "The cot and mattress", true],
  ["Margaret", "A knitted blanket", true],
  ["Sophie", "A bag of hand-me-down clothes", true],
  ["Hannah", "The bouncer, second hand", false],
  ["Tom and Priya", "Nappies, two boxes", false],
  ["The book club", "A voucher for Baby Bunting", false],
  ["Nan", "A silver money box", true],
  ["Grace", "A pram organiser and the good burp cloths", false],
  ["Mike and Sarah", "Board books", false],
  ["Raj", "A tiny Swans jersey", false],
];

const weeklyWords: Record<number, [string, string]> = {
  4: ["Shaky, then very calm.", "Like the floor dropped away, in a good way."],
  5: ["My sister. She'd never forgive me otherwise.", "Dad. He's been dropping hints for years."],
  6: ["Lazy Saturday mornings in bed with the paper.", "Spontaneous dinners out."],
  7: ["The first time he grabs my finger.", "Teaching him to swim."],
  8: ["That something will go wrong and I won't notice.", "Whether I'll be any good at the night shift."],
  9: ["They always turned up. Every game, every concert.", "Mum made the house feel safe. Always."],
  10: ["Talk more about feelings.", "Fewer rules about dinner."],
  11: ["The smell of Nan's kitchen at Christmas.", "The sound of the surf at Kiama."],
  12: ["Stubbornness, sorry.", "My terrible jokes."],
  13: ["Her kindness. Hopefully her ears.", "His patience. Definitely his height."],
  14: ["Pancakes every Sunday.", "A walk after Christmas lunch."],
  15: ["Slow coffee, a park, a nap for everyone.", "Footy on, baby asleep on my chest."],
  16: ["How to cook.", "Riding a bike."],
  17: ["How to slow down.", "How to be less serious."],
  18: ["My sister.", "Ben. He'll be the fun uncle."],
  19: ["Sleep when you're tired, not when the baby sleeps.", "Get the car seat fitted early."],
  20: ["Anything involving a full moon.", "That the partner's job is to stay out of the way."],
  21: ["The foot rubs. And the spreadsheets.", "How calm she's been, all of it."],
  22: ["Spontaneous weekends away.", "Sleeping in."],
  23: ["Wondering if we'll ever be ready.", "The waiting."],
  24: ["The Princess Bride.", "Calvin and Hobbes."],
  25: ["Tag out before we snap.", "Say it out loud when we need a break."],
  26: ["We already love you, whoever you turn out to be.", "Take your time in there. We'll be ready."],
  27: ["Loud, warm and a bit messy.", "Somewhere he can always come back to."],
  28: ["One last weekend at the beach.", "A proper fancy dinner."],
  29: ["How it feels when he kicks during the news.", "Her laughing at the antenatal class doll."],
  30: ["We'll always listen.", "I'll always pick you up, wherever you are."],
};

// ── Write it ─────────────────────────────────────────────────────────────────

const more = {
  extras: 0,
  appointments: 0,
  questions: 0,
  ownTasks: 0,
  names: 0,
  votes: 0,
  circle: 0,
  gifts: 0,
  jobs: 0,
  listMarks: 0,
  ownLines: 0,
  weekly: 0,
  bingo: 0,
};
db.transaction(() => {
  for (const e of EXTRAS_ON) {
    db.query('INSERT INTO extra (id, "on", changed_by, changed_at) VALUES (?, 1, ?, ?) ON CONFLICT(id) DO UPDATE SET "on" = 1').run(
      e,
      B.id,
      at(on(8), "20:00")
    );
    more.extras++;
  }

  for (const [title, w, d, time, place, notesText] of appointments) {
    const day = on(w, d);
    db.query("INSERT INTO appointment (id, title, day, time, place, notes, by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
      id(),
      title,
      day,
      time,
      place,
      notesText,
      chance(0.6) ? A.id : B.id,
      at(on(Math.max(4, Math.min(nowWeek, w - 3))), "20:00")
    );
    more.appointments++;
  }

  for (const [text, answer, askedW, w] of questions) {
    db.query("INSERT INTO question (id, text, answer, asked_at, created_at, item_id, by) VALUES (?, ?, ?, ?, ?, NULL, ?)").run(
      id(),
      text,
      answer,
      askedW ? at(on(askedW, 2), "11:00") : null,
      at(on(w, 4), "21:00"),
      chance(0.7) ? A.id : B.id
    );
    more.questions++;
  }

  for (const [title, w, done] of ownTasks) {
    const taskId = id();
    db.query("INSERT INTO own_task (id, title, week, created_at) VALUES (?, ?, ?, ?)").run(taskId, title, w, at(on(Math.min(w, nowWeek) - 2), "19:00"));
    if (done && w <= nowWeek) db.query("INSERT INTO task_tick (task_id, ticked_at) VALUES (?, ?)").run(taskId, at(on(w, 3), "18:00"));
    more.ownTasks++;
  }

  // Names: a few typed in, the rest from the deck, voted on by both; three superlikes each.
  const superDays = { [A.id]: 0, [B.id]: 0 };
  for (const [i, name] of [...ownNames, ...deckNames].entries()) {
    const fromDeck = i >= ownNames.length;
    if (db.query("SELECT 1 FROM baby_name WHERE lower(name) = lower(?)").get(name)) continue;
    const nameId = id();
    const w = 16 + Math.floor(rand() * (nowWeek - 16));
    db.query("INSERT INTO baby_name (id, name, added_by, added_at, from_deck) VALUES (?, ?, ?, ?, ?)").run(
      nameId,
      name,
      fromDeck ? null : pick([A, B]).id,
      at(on(w), "21:00"),
      fromDeck ? 1 : 0
    );
    more.names++;
    const loved = !fromDeck || chance(0.25);
    for (const who of [A, B]) {
      if (!chance(fromDeck ? 0.85 : 0.95)) continue;
      const liked = loved ? chance(0.8) : chance(0.3);
      const superOn = liked && superDays[who.id]! < 3 && chance(0.2) ? on(16 + superDays[who.id]! * 4, who === A ? 1 : 2) : null;
      if (superOn) superDays[who.id]!++;
      db.query("INSERT INTO name_vote (name_id, person_id, liked, voted_at, super_on) VALUES (?, ?, ?, ?, ?)").run(
        nameId,
        who.id,
        liked ? 1 : 0,
        at(on(w, 1), "21:30"),
        superOn
      );
      more.votes++;
    }
  }

  // Who does what: both have answered every job, mostly agreeing; a few to talk about.
  for (const job of JOBS) {
    const a = pick(["me", "you", "together"] as const);
    const flip = { me: "you", you: "me", together: "together" } as const;
    const b = chance(0.75) ? flip[a] : pick(["me", "you", "together"] as const);
    for (const [who, p] of [
      [A, a],
      [B, b],
    ] as const) {
      db.query("INSERT INTO job_pick (job_id, person_id, pick, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT DO UPDATE SET pick = excluded.pick").run(
        job.id,
        who.id,
        p,
        at(on(nowWeek - 2), "21:00")
      );
      more.jobs++;
    }
  }

  // Your people.
  const circleIds = new Map<string, string>();
  for (const [name, note, visit, hears, help, mealOffset] of circle) {
    const personId = id();
    circleIds.set(name, personId);
    db.query("INSERT INTO circle_person (id, name, note, visit, hears, help, meal_day, by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
      personId,
      name,
      note,
      visit,
      hears,
      help,
      mealOffset === null ? null : new Date(new Date(`${due}T00:00:00Z`).getTime() + mealOffset * DAY).toISOString().slice(0, 10),
      pick([A, B]).id,
      at(on(24 + Math.floor(rand() * (nowWeek - 24))), "20:00")
    );
    more.circle++;
  }
  for (const [name, what, thanked] of gifts) {
    const w = 22 + Math.floor(rand() * (nowWeek - 22));
    db.query("INSERT INTO circle_gift (id, person_id, what, thanked_at, by, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(
      id(),
      circleIds.get(name)!,
      what,
      thanked ? at(on(Math.min(nowWeek, w + 1)), "19:00") : null,
      pick([A, B]).id,
      at(on(w), "18:00")
    );
    more.gifts++;
  }
  db.query("INSERT INTO announcement (id, body, by, updated_at) VALUES (1, ?, ?, ?) ON CONFLICT(id) DO NOTHING").run(
    "He's here! [name] arrived on [day] at [time], [weight]. Mum and baby are doing well and we're all a bit in love. Thank you for all the love, and give us a week or two before visiting.",
    A.id,
    at(on(nowWeek - 1), "21:00")
  );

  // The lists: most of the baby list sorted by now, some of the freezer meals, the bag begun.
  const hows = ["bought", "bought", "bought", "borrowed", "second-hand", "given"] as const;
  for (const line of lines) {
    const p = line.list === "baby" ? 0.65 : line.list === "freezer-meals" ? 0.35 : line.list === "bag" ? 0.3 : 0;
    if (!chance(p)) continue;
    const r = rand();
    const state = r < 0.7 ? "got" : r < 0.9 ? "arranged" : "not-needed";
    const how = state === "got" ? pick(hows) : null;
    const note = how === "given" ? pick(["From Mum", "Sophie's old one", "From the shower"]) : how === "borrowed" ? "Hannah's, back by Easter" : null;
    db.query(
      "INSERT INTO list_mark (line_id, state, how, note, by, updated_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(line_id) DO UPDATE SET state = excluded.state, how = excluded.how, note = excluded.note"
    ).run(line.id, state, how, note, pick([A, B]).id, at(on(Math.max(14, nowWeek - Math.floor(rand() * 12))), "17:00"));
    more.listMarks++;
  }
  const ownList = id();
  db.query("INSERT INTO own_list (id, title, by, created_at) VALUES (?, ?, ?, ?)").run(ownList, "The nursery", B.id, at(on(22), "20:00"));
  const ownLineRows: [string, string, string | null, string | null][] = [
    [ownList, "Blackout blind", null, "got"],
    [ownList, "Rug for the floor", null, "got"],
    [ownList, "Night light, warm and dim", null, null],
    [ownList, "Hooks for the back of the door", null, "arranged"],
    [ownList, "A comfy chair for feeds", null, "got"],
    [ownList, "Frames for the scan pictures", null, null],
    ["baby", "A second set of sheets for the bassinet", "sleep", "got"],
    ["baby", "Muslin wraps, lots", "clothes", null],
    ["bag", "The good lip balm", "for-her", "got"],
    ["bag", "Snacks for the partner", "for-partner", null],
    ["freezer-meals", "Lasagne, two trays", null, "got"],
    ["freezer-meals", "Dal and rice", null, null],
    ["freezer-meals", "Bolognese", null, "got"],
  ];
  for (const [listId, title, section, state] of ownLineRows) {
    const lineId = id();
    db.query("INSERT INTO own_line (id, list_id, title, section, by, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(
      lineId,
      listId,
      title,
      section,
      pick([A, B]).id,
      at(on(24), "20:00")
    );
    if (state)
      db.query("INSERT INTO list_mark (line_id, state, how, note, by, updated_at) VALUES (?, ?, ?, NULL, ?, ?)").run(
        lineId,
        state,
        state === "got" ? "bought" : null,
        A.id,
        at(on(nowWeek - 1), "17:00")
      );
    more.ownLines++;
  }

  // The question a week, from both of you; the odd one only one of you got to.
  for (const [w, [a, b]] of Object.entries(weeklyWords)) {
    const week = Number(w);
    if (!WEEKLY[week as keyof typeof WEEKLY] || week > nowWeek) continue;
    for (const [who, body] of [
      [A, a],
      [B, b],
    ] as const) {
      if (week < nowWeek - 1 && !chance(0.92)) continue;
      if (week >= nowWeek - 1 && who === B) continue;
      db.query("INSERT INTO weekly_answer (week, person_id, body, answered_at) VALUES (?, ?, ?, ?) ON CONFLICT DO UPDATE SET body = excluded.body").run(
        week,
        who.id,
        body,
        at(on(week, 5), "21:30")
      );
      more.weekly++;
    }
  }

  // Bingo: a card each, and a race on.
  const bingoNotes = [
    "At the bakery",
    "Aunty Jo, at Christmas in July",
    "A stranger at Bunnings",
    "Twice in one day",
    "Work morning tea",
    "At the antenatal class, of all places",
    null,
    null,
  ];
  for (const who of [A, B]) {
    const existing = db.query<{ squares: string }, [string]>("SELECT squares FROM bingo_card WHERE person_id = ?").get(who.id);
    const squares: string[] = existing ? JSON.parse(existing.squares) : deal(rand);
    if (!existing) db.query("INSERT INTO bingo_card (person_id, squares, dealt_at) VALUES (?, ?, ?)").run(who.id, JSON.stringify(squares), at(on(14), "20:00"));
    const marked = squares.filter(() => chance(who === A ? 0.5 : 0.35));
    for (const square of marked) {
      const day = on(14 + Math.floor(rand() * (nowWeek - 14)), Math.floor(rand() * 7));
      if (!past(day)) continue;
      db.query(
        "INSERT INTO bingo_mark (person_id, square_id, day, note, marked_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT DO UPDATE SET day = excluded.day, note = excluded.note"
      ).run(who.id, square, day, pick(bingoNotes), at(day, "19:00"));
      more.bingo++;
    }
  }

  // Emergency info: every field.
  const emergency: Record<string, string> = {
    fullName: `${A.name} Sample`,
    dateOfBirth: "1992-03-14",
    allergies: "Penicillin: hives",
    bloodGroup: "O positive",
    pregnancy: "Low iron at 26 weeks, on a supplement. GBS swab due at 36 weeks.",
    pastPregnancies: "None: first baby",
    medications: "Pregnancy multivitamin with iodine, daily\\nIron, every second day",
    conditions: "Asthma, mild, no inhaler needed since 2019",
    hospital: "Sample Hospital\\n1 Sample Road, Sampleton NSW 2000",
    birthSuitePhone: "02 9000 1234",
    hospitalWayIn: "Car park P2 off Sample Road. After 8 pm, the emergency entrance, then the lifts to level 3.",
    hospitalSaid: "Come in with contractions 3 in 10, lasting a minute, or any time the waters break, there's bleeding, or he's moving less.",
    hospitalRecord: "MRN 1234567",
    carer: "Midwives' clinic (Team Banksia)",
    carerPhone: "02 9000 1250",
    partnerPhone: "0400 000 111",
    gp: "Dr Sample, Sample Street Medical",
    gpPhone: "02 9000 5678",
    support: "Linda (Mum): 0400 000 222",
    minder: "Tom next door, for the dog",
    minderPhone: "0400 000 333",
    backupDriver: "Sophie",
    backupDriverPhone: "0400 000 444",
    medicare: "1234 56789 0, number 1",
    healthFund: "None: public",
  };
  for (const [field, value] of Object.entries(emergency))
    db.query("INSERT INTO emergency (field, value, changed_by, changed_at) VALUES (?, ?, ?, ?) ON CONFLICT(field) DO UPDATE SET value = excluded.value").run(
      field,
      value.replaceAll("\\n", "\n"),
      B.id,
      at(on(nowWeek - 3), "20:30")
    );
})();

// ── Write it ────────────────────────────────────────────────────────────────

const insertEntry = db.query("INSERT INTO journal_entry (id, kind, day, time, body, different, by, created_at, from_both) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
const insertAppetite = db.query("INSERT INTO appetite_entry (id, kind, day, time, how, what, note, by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
const insertFeeling = db.query("INSERT INTO feeling (id, by, day, time, step, words, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

const count = { notes: 0, movements: 0, appetite: 0, feelings: 0, firsts: 0, photos: 0, papers: 0, ticks: 0 };
db.transaction(() => {
  for (const e of notes) {
    const day = on(e.w, e.d);
    if (!past(day)) continue;
    insertEntry.run(id(), e.kind, day, e.time, e.body, 0, e.by.id, at(day, e.time), e.fromBoth ? 1 : 0);
    count.notes++;
  }
  for (const e of movements) {
    const day = on(e.w, e.d);
    if (!past(day)) continue;
    insertEntry.run(id(), "movement", day, e.time, e.body, e.different ? 1 : 0, e.by.id, at(day, e.time), 0);
    count.movements++;
  }
  for (const e of appetite) {
    const day = on(e.w, e.d);
    if (!past(day)) continue;
    insertAppetite.run(id(), e.kind, day, e.time, e.how ?? null, e.what ?? null, e.note ?? null, e.by.id, at(day, e.time));
    count.appetite++;
  }
  for (const e of feelings) {
    const day = on(e.w, e.d);
    if (!past(day)) continue;
    insertFeeling.run(id(), e.by.id, day, e.time, e.step, JSON.stringify(e.words), e.note ?? null, at(day, e.time));
    count.feelings++;
  }
  for (const f of firsts) {
    const day = on(f.w, f.d);
    if (!past(day)) continue;
    db.query("INSERT INTO first_mark (key, day, by, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(key) DO UPDATE SET day = excluded.day, by = excluded.by").run(
      f.key,
      day,
      f.by.id,
      at(day, "20:00")
    );
    for (const [who, body] of f.words) {
      db.query("INSERT INTO first_words (key, by, body, edited_at) VALUES (?, ?, ?, ?) ON CONFLICT(key, by) DO UPDATE SET body = excluded.body").run(
        f.key,
        who.id,
        body,
        at(day, "20:05")
      );
    }
    count.firsts++;
  }
  for (const [task, w, d] of ticks) {
    const day = on(w, d);
    if (!past(day)) continue;
    db.query("INSERT INTO task_tick (task_id, ticked_at) VALUES (?, ?) ON CONFLICT(task_id) DO UPDATE SET ticked_at = excluded.ticked_at").run(
      task,
      at(day, "12:30")
    );
    count.ticks++;
  }
})();

// Photos: the bump every four weeks from 12, the two scans, and a few others.
const photos: { kind: "bump" | "scan" | "other"; w: number; d: number; by: typeof A; caption: string | null; html: () => string; size: [number, number] }[] = [
  ...[12, 16, 20, 24, 28, 32, 36].map((w, i) => ({
    kind: "bump" as const,
    w,
    d: 6,
    by: B,
    caption: i === 0 ? "The first one, barely there" : w === 36 ? "Nearly there" : null,
    html: () => bumpHtml(w, 200 + i * 8),
    size: [900, 1200] as [number, number],
  })),
  { kind: "scan", w: 12, d: 2, by: A, caption: "Dating scan: our little bean", html: () => scanHtml(12, 1), size: [1200, 900] },
  { kind: "scan", w: 20, d: 1, by: B, caption: "Morphology scan, hand over his face", html: () => scanHtml(20, 2), size: [1200, 900] },
  { kind: "other", w: 15, d: 5, by: B, caption: "The first outfit", html: () => otherHtml("outfit"), size: [900, 1200] },
  { kind: "other", w: 22, d: 6, by: B, caption: "Sage, two coats", html: () => otherHtml("nursery"), size: [900, 1200] },
  { kind: "other", w: 30, d: 6, by: A, caption: "Baby shower at Mum's", html: () => otherHtml("shower"), size: [900, 1200] },
  { kind: "other", w: 34, d: 4, by: B, caption: "Car seat in, finally", html: () => otherHtml("carSeat"), size: [900, 1200] },
];
for (const p of photos) {
  const day = on(p.w, p.d);
  if (!past(day)) continue;
  const pic = await picture(p.html(), ...p.size);
  const fileId = await upload(p.by.id, day, { name: `${p.kind}-week-${p.w}.jpg`, ...pic });
  db.query("INSERT INTO photo (id, file_id, kind, day, time, caption, by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
    id(),
    fileId,
    p.kind,
    day,
    "18:00",
    p.caption,
    p.by.id,
    at(day, "18:00")
  );
  count.photos++;
}

// Papers: results, a referral, a plan and the pregnancy record, as PDFs.
const table = (rows: [string, string][]) => `<table>${rows.map(([a, b]) => `<tr><td>${a}</td><td>${b}</td></tr>`).join("")}</table>`;
const papers: {
  kind: "result" | "letter" | "plan" | "record" | "other";
  title: string;
  item: string | null;
  w: number;
  d: number;
  by: typeof A;
  note: string | null;
  handy: boolean;
  html: string;
}[] = [
  {
    kind: "letter",
    title: "GP referral to the hospital",
    item: null,
    w: 6,
    d: 3,
    by: A,
    note: null,
    handy: false,
    html: `<h1>Referral: antenatal care</h1><div class="sub">Made up for Expecting's dev data</div><p>Dear colleague,</p><p>Thank you for seeing this patient for antenatal care. First pregnancy, estimated due date ${due}. Bloods and dating scan requested.</p><p>Kind regards,<br>Dr Sample, Sample Street Medical</p>`,
  },
  {
    kind: "result",
    title: "First pregnancy bloods",
    item: "first-blood-tests",
    w: 7,
    d: 4,
    by: A,
    note: "GP said all fine",
    handy: false,
    html: `<h1>Pathology report</h1><div class="sub">Made up for Expecting's dev data</div>${table([
      ["Blood group", "Sample"],
      ["Full blood count", "Sample"],
      ["Rubella", "Sample"],
      ["Hepatitis B", "Sample"],
    ])}`,
  },
  {
    kind: "result",
    title: "Dating scan report",
    item: "dating-scan",
    w: 12,
    d: 2,
    by: B,
    note: null,
    handy: false,
    html: `<h1>Obstetric ultrasound: dating</h1><div class="sub">Made up for Expecting's dev data</div>${table([
      ["Gestation", "12 weeks"],
      ["Heart rate", "Sample"],
      ["EDD", due],
    ])}`,
  },
  {
    kind: "record",
    title: "Pregnancy health record",
    item: null,
    w: 10,
    d: 2,
    by: A,
    note: "Bring to every appointment",
    handy: true,
    html: `<h1>Pregnancy health record</h1><div class="sub">Made up for Expecting's dev data</div>${table([
      ["EDD", due],
      ["Hospital", "Sample Hospital"],
      ["Midwife", "Sample"],
    ])}`,
  },
  {
    kind: "result",
    title: "Morphology scan report",
    item: "morphology-scan",
    w: 20,
    d: 1,
    by: B,
    note: null,
    handy: false,
    html: `<h1>Obstetric ultrasound: morphology</h1><div class="sub">Made up for Expecting's dev data</div>${table([
      ["Gestation", "20 weeks"],
      ["Placenta", "Sample"],
      ["Anatomy", "Sample"],
    ])}`,
  },
  {
    kind: "result",
    title: "Glucose tolerance test",
    item: "glucose-tolerance-test",
    w: 26,
    d: 3,
    by: A,
    note: null,
    handy: false,
    html: `<h1>Pathology report: OGTT</h1><div class="sub">Made up for Expecting's dev data</div>${table([
      ["Fasting", "Sample"],
      ["1 hour", "Sample"],
      ["2 hours", "Sample"],
    ])}`,
  },
  {
    kind: "plan",
    title: "Birth plan",
    item: null,
    w: 33,
    d: 2,
    by: B,
    note: "Copy in the hospital bag",
    handy: true,
    html: `<h1>Our birth plan</h1><div class="sub">Made up for Expecting's dev data</div><ul><li>Lights low, our playlist on</li><li>Open to gas and an epidural if we ask</li><li>Skin to skin straight after, if we're both well</li><li>Partner to cut the cord</li></ul>`,
  },
];
for (const p of papers) {
  const day = on(p.w, p.d);
  if (!past(day)) continue;
  const bytes = await pdf(p.html);
  const fileId = await upload(p.by.id, day, { name: `${p.title}.pdf`, bytes, pdf: true });
  const paperId = id();
  db.query("INSERT INTO paper (id, kind, title, item_id, day, note, handy, by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
    paperId,
    p.kind,
    p.title,
    p.item,
    day,
    p.note,
    p.handy ? 1 : 0,
    p.by.id,
    at(day, "19:00")
  );
  db.query("INSERT INTO paper_page (paper_id, position, file_id) VALUES (?, 0, ?)").run(paperId, fileId);
  count.papers++;
}

await browser.close();
console.log(`Week ${nowWeek} (due ${due}), for ${A.name} and ${B.name}:`, { ...count, ...more });
