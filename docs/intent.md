# Intent

Why expecting exists and what it does. Vision, not spec: when this file and the code disagree, the code is right and this is stale.

Architecture: [architecture.md](architecture.md).

## What it is

A pregnancy companion for one couple, expecting in Australia. Self-hosted. Not a product.

It covers the whole pregnancy, from conception to birth, then the fourth trimester (the first three months after birth). It may grow into newborn and parenting later. Nothing is built for that yet, but nothing should prevent it.

## Why build one

Pregnancy apps exist. The ones worth using are written for the US, sell your data, or both. None of them is a shared space for both parents, and none treats the partner as a reader.

The three things we want are not hard. Each one is a content problem, not a technology problem:

1. **A checklist.** What to do, and by when.
2. **What to expect.** What is happening, week by week.
3. **What nobody tells you.** The private health waiting period, the RSV vaccine, the childcare waitlists. The things you only learn by missing them.

Plus a place to keep everything else: notes, photos, contacts, names.

## Who uses it

- **Both parents, as one.** One shared space. Everything either of you adds, the other sees and can edit. No accounts.
- **On a phone and on a computer.** On a phone it installs to the home screen and opens like an app. On a desktop it uses the room: the same app, laid out for a big screen, not a phone column in the middle of one.

## The timeline

- The spine of the app is the week: a **before** band (things best done before, or very early, in a pregnancy, like private health cover), pregnancy weeks 1 to 42, then weeks 1 to 12 after the birth.
- Pregnancy weeks are completed weeks of gestation, the way midwives count: "28 weeks" runs from 28+0 to 28+6.
- Once the baby is here you enter the birth date, and the weeks after the birth count from it, not from the due date. Without one, the due date stands in once you are past 42 weeks.
- All content for every week is always available. You can read week 34 in week 8.
- The app *is* the timeline: one scroll of weeks that opens at this one, with a ruler to move along it. Checklist, "nobody tells you" and questions are ways of looking at the same timeline, not separate places.
- You enter the due date once. The app then opens at the current week and shows what's coming up. The due date changes where you land, never what you can see.

## Content

### Items

Every piece of content is an **item**:

- **Weeks** — the range it applies to, such as 28–36, within one phase (before, pregnancy, after the birth).
- **Category** — appointments, body, baby, paperwork, money, baby gear, partner, after the birth.
- **Body** — a short explanation. Practical, with a bit of warmth. Plain words, no jargon left undefined.
- **Source** — an optional link, preferring Australian sources: Pregnancy, Birth and Baby (healthdirect), Services Australia, RANZCOG (the college of obstetricians), state health departments.
- **Last checked** — when the source was last confirmed. Entitlements change every financial year.
- **Linked tasks** — optional. "Book the RSV vaccine" belongs to the item that explains the RSV vaccine.
- **Nobody tells you** — a flag for the third kind of content. These items cut across categories, so this is a flag, not a category.
- **Draft** — set on every item Claude drafts, and cleared only once we have reviewed it. Drafts show with a marker.

### Two origins, one shape

- **Built-in items** ship with the app. Claude drafts them; we review them before they count as trusted. The app can hide a built-in item but never edits it, so a content update can't clobber anything of ours.
- **Our own items** are added in the app — a friend's tip, something the midwife said. Same fields, same linked tasks.

The app shows both the same way. A small marker says which is which.

### Not medical advice

Medical items explain what usually happens and when. They never say what to do about her body. Anything clinical ends with "ask your midwife or OB".

### Australian specifics

The content assumes Australian care: Medicare, the public and private pathways, the national immunisation schedule, Paid Parental Leave through Services Australia, and state birth registration. Exact weeks and entitlements are checked against the sources when each item is written, not taken from memory.

## The checklist

- The checklist is every linked task, ordered by week, plus any standalone tasks we add.
- There is nothing separate to manage. Tick a task and it's ticked everywhere it appears.
- Each task has an optional due week. It defaults to the end of its item's range.

## The information store

All shared, all editable by both:

- **Appointments** — date, who with, notes, and questions to ask next time.
- **Questions** — a running list for the next appointment. Asked questions keep their answers.
- **Scans and photos** — scan images, bump photos. Irreplaceable, so they are backed up.
- **Contacts** — midwife, OB, hospital, birth suite, GP, maternal child health nurse.
- **Symptoms** — a simple dated log, useful when the midwife asks "since when?".
- **Baby names** — a shared list. Each of you can mark favourites.

## Open questions

- **Content sourcing.** How the first pass of built-in items gets written and reviewed. To explore.
- **Partner category.** Items written for the non-pregnant parent. Built as a category for now; an audience flag may suit better, since partner items also belong to paperwork and the birth.
- **Reaching out.** Whether the app ever notifies (a weekly push). Today it only shows things when opened.
- **Next on the timeline.** Capture from anywhere (one thumb-reach button for a question, task or note), a "since you last looked" line for the other parent, and the app changing shape with the phase (a "go time" mode near the birth, an appointment mode).
- **State and care pathway.** Settings that mark items as not applying (another state's birth registration, private-only appointments) without hiding them.
- **Hosting.** Castle or Tower, and so which backup covers it.
