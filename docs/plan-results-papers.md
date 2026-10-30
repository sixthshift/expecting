# Plan: results and papers

The Journal's "Still to come" promises "Results and papers: blood tests,
screening, letters, the birth plan, the discharge summary." `intent.md`
puts records in the Journal and lists them (results, referral letters, the
hand-held record some states give you, the birth plan, the discharge
summary, the baby's health record book). Photos and scans built the uploads
as a store any record can use; this plan puts papers on it.

Expecting keeps the papers and finds them. It never reads them: no "normal",
no ranges, no green ticks, nothing drawn from what a result says. It is
directive only about the admin around them: keep it handy, bring it along.

## Who wants it, and when they reach for it

- **"Do you have your blood group?"** The midwife at the 28-week visit,
  or a new one at the hospital, asks for a result from week 8. It was a
  printout, or a line in a portal, or an email with a PDF. Here it's one
  search away: "blood", and there it is, on either phone.
- **"Show me your birth plan."** Triage, 2 am, labour, the partner holding
  the bag and the phone. No time to find an email, and hospital signal is
  poor. The birth plan, kept handy, is on Emergency info, and opens with no
  connection.
- **"Your referral letter?"** The first visit at the hospital, the GP's
  letter left at home. A photo of it, taken the day it was handed over,
  answers.
- **The discharge summary**, handed over as you leave the hospital
  (several stapled pages), and the GP needs it at the six-week check. Four
  photos, one paper, filed in a minute in the ward.
- **The GTT result** emailed as a PDF, saved from the mail app straight
  into Expecting with the phone's share-to-files, or dropped onto the
  desktop page.
- **The partner carries the folder.** It's often the partner who keeps
  the papers and fronts the desk. Both phones see every paper, at once.
- **Later,** the whole lot in one place, by what it is: for the next
  pregnancy, a new GP, an insurer, a Centrelink claim.

It is never about her body: Expecting doesn't know what a paper says, and
never pretends to.

## The flow

**One way in, from anywhere:** the "+" gets "A result or paper", after the
photo. In the Journal the same form sits at the top of "Results and
papers".

1. **Take or choose.** On a phone, **Photograph it** (the rear camera
   straight away) and **Choose a file** (a PDF from Files, or photos;
   several at once). On a desktop a drop target that also opens the picker.
2. **More pages.** Each picture shows small, numbered, with an × to take it
   out. **Another page** (the camera again, on a phone) and **Add a file**
   add to the same paper. Several photos chosen at once are one paper's
   pages, in the order chosen: a letter is one thing, not four.
3. **What is it?** Result · Letter or referral · Plan · Record or summary ·
   Something else. One tap, nothing chosen until you choose.
4. **What it's about** (a result, a letter, a plan or a record): a short
   list of the tests and moments that make papers (the first blood tests,
   blood group, the dating scan, NIPT, the morphology scan, the glucose
   test, the GBS swab, the birth plan, the discharge summary, …), the ones
   around the paper's week first, searchable, and "none of these" as good
   as any. Choosing one names the paper ("Glucose tolerance test") if it
   has no name yet, and links it to its Library entry.
5. **Its name**, prefilled or typed: "Referral to the Women's".
6. **Dated:** "Dated today · Week 28 · Change": the date on the paper, which
   is rarely today (a result from last week, photographed now), so it's
   one tap to change. The week is worked out from the due date as it's
   read, as a note's is.
7. **Anything to remember**, if you want: "The midwife kept the original",
   "Copy to the GP".
8. **Keep handy** (a switch): "On top here and on Emergency info, and kept
   on this phone for when there's no signal." On already for a plan and
   for the blood group, the referral and the discharge summary, until you
   say otherwise.
9. **Keep it.** The sheet closes and the toast says it's in the Journal.

Things that go wrong, said plainly: too big (over 30 MB a file); not a
PDF or a picture; a HEIC this browser can't open (as photos say it).

## What's kept

`paper` (domain `papers`): its `kind` (`result`, `letter`, `plan`,
`record`, `other`), a `title`, the Library entry it's about (`item_id`, or
none), the `day` on it, a `note` if any, whether it's `handy`, who kept it,
when, and who changed it last. Shared, as notes are: either of you sees,
changes and deletes any.

`paper_page`: its pages, in order, each an upload (`file_id REFERENCES
upload(id)`, unique), so the file store's sweep finds them itself. A page
is a photo (with its display copy and thumbnail) or a PDF (the original
only). A PDF is usually all of one paper; a photographed letter is a page
per photo. Deleting a paper deletes its pages, and their uploads.

What is deliberately not kept: anything the paper says. No values, no
ranges, no "result: normal", no reading of the PDF's text. A field for a
blood group or a GTT number would be a field someone reads as a verdict,
and Expecting isn't the one to give it. The blood group, for whoever is
treating her, is on Emergency info already, typed by you.

The Library entries a paper can be about are a short list
(`PAPER_TOPICS`, `src/lib/papers.ts`): the tests, letters, plans and records
that come as paper, each with the name it gives a paper. Never a private
entry (`test/lib/papers.test.ts` holds it, and the privacy rule refuses one
anyway).

## Finding one fast

- **Handy on top,** with a pin, then newest first by the date on them.
- **By kind:** All · Results · Letters · Plans · Records · Other, only the
  kinds you have.
- **Search,** from five papers: name, kind, what it's about, and the
  words. Held on the page, not in the address.
- **On the Library entry,** under the GTT's page: "Your papers: Glucose
  tolerance test, dated 26 Oct", one tap open. What it is, linked to what
  you kept.
- **On Emergency info:** "Papers to hand", the handy ones, opened in
  place. With none, one line on how to put one there.

## Offline

- **Keeping one** without signal (the ward, the car park): each page is
  made ready and kept on the phone first (`keepOnPhone`), then the save,
  through the outbox; its `send` puts every page up, then the paper, then
  forgets the phone's copies (`withUploads`, the photos' `withUpload` for
  several). Until then the pages show from the phone's copy.
- **Reading one** without signal: the worker keeps every thumbnail and
  display copy as it's first drawn, as for photos. A handy paper's pages
  are kept up front, as soon as the list arrives on that phone: its display
  copies, and a PDF's original (`keepHandyOffline`, into `expecting-files`).
  The worker answers an original from that cache when it has it, and from
  the network when it doesn't, never keeping others: a stack of PDFs is not
  the app. A paper put away from handy has its PDF let go.
- **The list itself** is fetched with the app's frame (the `app` route's
  loader), so the worker's last answer is always there, on Emergency info
  too, without the Journal ever having been opened on that phone.

## PDFs on a phone

A PDF page is a tile, not a picture: its name and size, **Open** (in a new
tab: the phone's own viewer, which pinches and scrolls better than anything
drawn in the page) and **Download**. A browser can't draw a PDF in an
`<img>`, and an `<iframe>` on an iPhone shows only the first page. A
photographed page is drawn in the app, as big as the screen allows, with
"Page 2 of 4".

## The timeline thread

A week's line says what was dated in it: "result", "2 results", "letter",
"plan", "record", "paper". Quietly, without names: the line is a glance.

## While something has happened

Papers are admin, and after a loss there are more of them, not fewer: the
discharge summary, the results the follow-up asks for, letters. So the
section stays open, and the "+" still offers a paper. What changes:

- **Nothing pregnancy-forward is suggested.** After a loss, "What it's
  about" isn't offered (its list is the birth plan and the morphology
  scan), and nothing is handy by default. With hard news, whose pregnancy
  goes on, everything as usual.
- **Nothing is deleted** or hidden: what you kept is yours.
- **The timeline** is paused, so its marks are put away with it.

## Deleting

Asks first: "Delete this paper? Every page goes from both phones, and can't
be put back." No undo: the bytes are gone. The worker's copies go too.

## Not in this plan

- **Reading a paper:** no OCR, no values, no "normal", no flags. Ever.
- **Adding a page to a kept paper,** or reordering pages: delete and keep it
  again. Later, if it's missed.
- **A paper ticking a task** (a GTT result doesn't tick "Book the glucose
  tolerance test"): having the paper isn't the admin being done. Later
  perhaps "you've a result for this" on the task.
- **Appointments,** and "bring these to the next one": they come with
  appointments. Keep handy stands in.
- **Sharing out** (a link for the GP): friends and doctors can't log in.
- **A stronger lock for medical papers** than the shared password. They're
  behind the same gate, on the same volume, in the same backup. Whether
  health papers want more is still the hosting question in `intent.md`.
- **Drawing PDFs smaller** (a first-page thumbnail): a PDF is a tile.

## Steps

1. **The store.** `021_papers.sql`; `src/db/models/papers/` (`paper`,
   `paper_page`, `PapersRepo`). Tests in `test/db/papers.test.ts`.
2. **The rules.** `src/lib/papers.ts` (kinds, topics, order, search, the
   timeline's words, handy by default, what's kept offline). Tests in
   `test/lib/papers.test.ts`.
3. **Server and saves.** `src/api/rpc/papers.ts` (`addPaper`, `editPaper`,
   `deletePaper`, their saves, `papersQuery`, `usePapers`);
   `withUploads` in `src/api/rpc/files.ts`; `papersQuery` in the `app`
   loader.
4. **Offline.** `keepHandyOffline` (`src/pwa/register.ts`); the worker
   answers a kept original, and answers every `/api/files/` path itself,
   navigations too (an opened PDF), never with the shell.
5. **The Journal's section and the "+".**
   `src/features/journal/components/papers/`. Still to come goes.
6. **The thread.** `papers` on `MapWeek`; the Library entry's "Your
   papers"; Emergency info's "Papers to hand".
7. **e2e.** `e2e/papers.spec.ts`.
8. **Docs.** `architecture.md`, `intent.md`, CLAUDE.md.

## To settle while building

- The five kinds, and whether "Record or summary" reads right for the
  discharge summary and the hand-held record.
- Which entries are handy by default: the plans, blood group, the referral,
  the discharge summary.
- Whether "Keep handy" should be called "Bring along".

## Progress

- 2026-10-30: plan written, and built, steps 1–8 (the gate not yet run).
