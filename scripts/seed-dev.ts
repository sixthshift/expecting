// Fills the dev database with a pregnancy's worth of Journal, so the Journal
// (and the weeks, the timeline and the book) have something to show: notes
// and letters, movements, sickness and cravings, feelings, the firsts with
// both your words, bump photos, scans and other pictures, papers (PDFs), a
// few tasks done and bingo squares. Weeks 4 to the current one, from the due
// date in settings.
//
//   bun scripts/seed-dev.ts            (DATA_DIR, default ./data)
//
// Run it again to start over: what it added has ids beginning `5eed` (and
// their uploads' folders), dropped first; the firsts, ticks and bingo marks
// are set, not added. It never touches anything else, and refuses a database
// with no due date or fewer than two people. The pictures and PDFs are drawn
// by Playwright's Chromium (the e2e's), made up, and say so.

import { Database } from "bun:sqlite";
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";

const DATA_DIR = process.env.DATA_DIR ?? "./data";
const db = new Database(join(DATA_DIR, "expecting.db"));
db.exec("PRAGMA foreign_keys = ON");

// ── What's there ────────────────────────────────────────────────────────────

const settings = db.query<{ due_date: string | null }, []>("SELECT due_date FROM settings WHERE id = 1").get();
const people = db.query<{ id: string; name: string; role: string }, []>("SELECT id, name, role FROM person ORDER BY created_at").all();
if (!settings?.due_date) throw new Error("No due date in settings: finish onboarding first.");
if (people.length < 2) throw new Error("Two people, please: the Journal is for both of you.");
const due = settings.due_date;
const [A, B] = [people[0]!, people[1]!];

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
  for (const t of ["journal_entry", "appetite_entry", "feeling", "photo", "paper"]) db.exec(`DELETE FROM ${t} WHERE id LIKE '5eed%'`);
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
  const days = w < 24 ? [3] : w < 32 ? [1, 4] : [0, 2, 3, 5, 6];
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

/** How each of you is feeling: now and then early on, twice a week from week 28. */
const STEPS = ["rough", "low", "okay", "good", "great"] as const;
const feelings: (Kept & { step: (typeof STEPS)[number]; words: string[]; note?: string })[] = [];
for (let w = 6; w <= nowWeek; w += w < 28 ? 3 : 1) {
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

// Bingo: a few squares on the first person's card, if one's dealt.
const card = db.query<{ squares: string }, [string]>("SELECT squares FROM bingo_card WHERE person_id = ?").get(A.id);
if (card) {
  const squares: string[] = JSON.parse(card.squares);
  const marks: [string, number, string | null][] = [
    ["size-of-fruit", 14, "An avocado, apparently"],
    ["guess-from-bump", 24, "The lady at the bakery said girl"],
    ["offered-seat", 31, null],
    ["bump-touch", 33, "A stranger at Bunnings"],
  ];
  for (const [square, w, note] of marks) {
    if (!squares.includes(square) || !past(on(w, 3))) continue;
    db.query(
      "INSERT INTO bingo_mark (person_id, square_id, day, note, marked_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT DO UPDATE SET day = excluded.day, note = excluded.note"
    ).run(A.id, square, on(w, 3), note, at(on(w, 3), "13:00"));
  }
}

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
console.log(`Week ${nowWeek} (due ${due}), for ${A.name} and ${B.name}:`, count);
