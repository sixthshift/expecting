# Plan: photos and scans

The Journal's "Still to come" promises "Photos and scans: bump photos and
scan images, backed up." `intent.md` puts records in the Journal ("a scan is
something that happened, dated, on the timeline"), wants the capture "+" to
file a photo, and held bump photos back until there were uploads and
backups. This plan builds the uploads, as a store any record can use, and
photos and scans on top of it. Results and papers come next, on the same
store.

## Who wants it, and when they reach for it

- **The weekly bump photo.** Sunday morning, same wall, same pose, usually
  the partner holding the phone. It's a ritual, and the payoff is weeks
  later: week 12 beside week 32, the whole story in two pictures. Most
  couples keep them in the camera roll, lost among everything else, and
  never quite line them up. Here they sit in a row, a week each, and two
  weeks side by side is one tap.
- **The 12- and 20-week scans.** The sonographer hands over a glossy
  printout (or three). Walking back to the car, one of you photographs it,
  because thermal paper fades within a few years and the printout gets
  creased in a bag. Hospital car parks have poor signal. It must keep, on
  the phone, and go up when it can: a photo taken through the app's own
  camera is not in the camera roll, so throwing it away offline would lose
  it.
- **A 3D or 4D scan**, at a private clinic, often sent as images by email
  or on a USB. Chosen from the phone's photos or dropped onto the desktop
  page, several at once.
- **Something else:** the first outfit, the nursery, the positive test.
  Not a bump and not a scan, but this pregnancy's.
- **Both of you, both phones.** Whoever took it, both see it straight away.
  The partner who couldn't come to the scan sees it from work.
- **Later,** it's the story: the timeline's weeks behind today carry "bump
  photo · scan", and the Journal is the album.

It is never about her body beyond what she keeps: no "you've grown", no
size estimates from a photo, no comparing with anyone else.

## The flow

**One way in, from anywhere:** the "+" gets "A photo or scan", after a
note. In the Journal the same form sits in "Photos and scans", and the
bump row has this week's empty frame, which opens it ready for a bump.

1. **Take or choose.** On a phone two big buttons: **Take a photo** (the
   rear camera straight away: `capture="environment"`) and **Choose
   photos** (the phone's own picker; several at once). On a desktop a drop
   target that also opens the picker. The camera is one tap from the
   sheet.
2. **Got it.** The picture shows, small, while it's made ready (a second
   or two). Then:
   - **What is it?** Bump · Scan · Something else. One tap, nothing chosen
     until you choose (a scan filed as a bump spoils the row), except from
     the bump row's frame, which is a bump already.
   - **When:** "Taken today, 9:40 am · Week 28 · Change". The day the photo
     says it was taken (EXIF `DateTimeOriginal`, for one chosen from the
     camera roll a week late), else now. The week is worked out from the
     due date as it's read, as a note's is, so it moves with a new due
     date and the day never does. Change gives the day and time pickers.
   - **A few words, if you want:** "12-week scan, measuring 6.1 cm", "28
     weeks, and the hiccups started".
   - **Keep it** (or "Keep all 3"). Kept: the sheet closes and the toast
     says it's in the Journal, as everything in the "+" does.
3. **Several at once** take one kind and one caption, and each keeps its
   own day unless you change it (then all take the one you chose).

Things that go wrong, said plainly:

- **Too big** (over 30 MB): "That file is too big: up to 30 MB."
- **Not a picture** (or one we don't take): "That isn't a photo Expecting
  can keep: JPEG, PNG, WebP or HEIC."
- **A HEIC this browser can't open** (Chrome on a desktop, given an
  iPhone's file): "This browser can't open that photo (HEIC). Add it from
  the iPhone, or save it as a JPEG first." An iPhone hands Safari a JPEG
  anyway, and Safari opens HEIC itself.

## What's kept

### The file store: uploads, for any record

A domain of its own (`files`), not photos': results and papers will use it
as they are.

- **On disk:** `DATA_DIR/uploads/<id>/`, the Docker volume, beside the
  database, so the one backup takes both (architecture, Backups). In it
  `original` (the file as given, its bytes untouched) and, for an image,
  `display` (a JPEG at most 2048 px on its long edge) and `thumb` (at most
  480 px). Written to a temporary folder and renamed into place, so a
  half-written upload is never served.
- **In the database:** `upload`: the id (the phone's, so sending twice
  keeps one), its name as given, its type (sniffed from its first bytes,
  never the browser's say-so), its size, an image's width and height,
  whether it has a display and a thumbnail, who and when.
- **What it takes:** JPEG, PNG, WebP, HEIC and HEIF, and PDF (for results
  and papers), up to 30 MB. No SVG or HTML: nothing that can run in the
  page.
- **Owned by its record.** A record points at its upload
  (`photo.file_id REFERENCES upload(id)`), and deleting the record deletes
  the upload and its folder. An upload nothing points to a day after it
  arrived is swept as the next one comes (`FilesRepo.unclaimed`, which
  finds every column that references `upload` by asking SQLite, so a new
  record's table counts without being listed).

**Made smaller on the phone, not the server.** The phone already has the
picture decoded (it shows it), the browser's canvas makes a JPEG well, and
it honours the photo's rotation. The server would need an image library
with native parts in the image (sharp, libvips) and a HEIC decoder, for
what two phones can do. And the small versions are what goes up first in
spirit: a 300 KB display copy is what's looked at. The original goes up
too, untouched, because it's the keepsake and the backup: full size, with
its EXIF. (The display and thumbnail are drawn afresh, so they carry no
EXIF, location included.)

### Photos

`photo` (domain `photos`): the upload it shows, `kind` (`bump`, `scan` or
`other`), `day`, `time`, a `caption` if any, who kept it, when, and who
changed it last. Shared, as notes are: either of you sees, changes and
deletes any.

## Offline

A photo taken in the car park with no signal is kept, not refused.

- Before the save is made, its three parts go into the phone's IndexedDB
  (`expecting-uploads`; localStorage can't hold pictures), and its id onto
  a short list in localStorage, so the page knows at once which pictures
  are still only on this phone.
- The save (`addPhoto`, through the outbox like every other) carries only
  the words and the upload's id. Sending it puts the upload first
  (`putUpload`, `multipart/form-data`), then the photo, then forgets the
  parts on the phone. Both sides are idempotent: an upload already there is
  left as it is, and a photo already there too, so a send cut off halfway
  is sent again whole. `apply` adds the photo once, however often it runs.
- Until it's up, the picture is drawn from the phone's copy, so it shows at
  once, offline too, and after the app is closed and opened again.
- Turned away (a 4xx that isn't a lost session), the phone's copy is
  forgotten with it, and the outbox's toast says it didn't save. A lost
  session keeps both, to go once logged in.
- If the phone refuses IndexedDB (a private window), the parts are kept in
  the page only, as the outbox keeps saves then.

The service worker keeps each thumbnail and display copy as it's first
drawn (`expecting-files`, cache first: an upload never changes), so the
album opens offline. Not the originals, and nothing up front: a hundred
photos are not the app. It survives a new build (the files can't change
shape), and is forgotten on logging out or a lost session; a deleted
photo's are dropped from it.

## Served behind the gate

The bytes are a server route, `GET /api/files/<id>/<variant>`, the one
server route the app itself calls: an `<img>` needs a plain URL it can GET,
and a server function is a POST to a generated id that answers in its own
encoding. It is behind the gate like every other `/api/*` path (no
session, a 401), sent `private, immutable` (the id is new for every
upload), `nosniff`, with the type that was sniffed, and with `?download`
as an attachment under its own name. Uploads go the usual way, a server
function (`putUpload`), so the function middleware judges them as it
judges every save, and the privacy rule reads a form's fields too.

## How it's shown: the Journal's "Photos and scans"

1. **The add**, as above.
2. **Your bump, week by week:** a row of square thumbnails, one per week
   with a bump photo (that week's latest), "Week 12" under each, ending in
   this week's empty frame ("Week 28 · Take this week's") until it's taken.
   Before the first, the frame alone, with one line: "Same spot, same pose,
   once a week, and by the birth you'll have the whole story." It scrolls
   sideways on a phone.
3. **Side by side** (from two bump weeks): the two pictures next to each
   other, the first and the latest, each with its week to change. On a
   phone too: two halves of the screen is the point.
4. **By week:** everything, newest week first, a grid of thumbnails under
   "Week 28 · This week · 27 Oct – 2 Nov" (by month without a due date),
   scans marked "Scan". Six weeks, then "Show every week".
5. **One opened:** the display copy, as big as the screen allows, its kind,
   week, day and who; the caption; Previous and Next; Change (kind, day,
   time, words); Download the original; and Delete, which asks first:
   "Delete this photo? It goes from both phones, and can't be put back."
   No undo toast: the bytes are gone, and a photo is the one thing here
   that can't be typed again.

**On the timeline,** a week's line says "bump photo", "scan" or "2 scans",
"1 photo": what happened, quietly, without the pictures.

## While something has happened

Bump photos especially must not be pushed at anyone after a loss, and
scan pictures may be the most precious thing left, so: nothing offered,
nothing lost.

- **The "+"** offers no photo, as it offers no movement.
- **The Journal** folds the section behind one quiet line, "The photos and
  scans you kept", as the movements are. Opened, it is the album by week,
  plainly: no bump row, no empty frame for this week, no side by side.
- **Adding stays possible inside the fold,** one plain "Add a photo"
  button, never on show: some parents want to keep a scan, or a photo of
  their baby, afterwards. After a loss it offers Scan and Something else,
  never Bump; with hard news, whose pregnancy goes on, all three.
- **The timeline** is paused, so its marks are put away with it.
- Nothing is deleted, and everything comes back as it was.

## Not in this plan

- **Video** (4D scan clips): big, and a different player. Later, on the
  same store.
- **A nudge on This week** for this week's bump photo: the Journal's empty
  frame is the reminder for now. A weekly push is intent's open question.
- **Photos on This week's peek** at a week: the timeline marks the week.
- **Editing the picture** (crop, rotate, line up two bumps): the phone's
  editor does this before it's chosen.
- **A flip-book or GIF** of the bump weeks.
- **Sharing out** (a link for the grandparents): friends can't log in, and
  a public link is a hole in the gate.
- **Server-side making smaller,** and HEIC for browsers that can't open it.
- **Sweeping the phone's IndexedDB** of parts whose save was lost some
  other way (storage cleared mid-send): rare, and small.

## For Results and papers: reuse the store

Everything above "Photos" is general. A result or paper is a record of its
own beside `photo`, pointing at an upload:

1. **Table:** `paper` (or whatever it's called) with `file_id text NOT NULL
   UNIQUE REFERENCES upload(id)`. Nothing to register: the sweep finds the
   reference itself.
2. **On the phone:** `prepareFile(file)` (`src/app/model/uploads.ts`) takes
   a PDF as it is (original only, no display or thumb) and an image as a
   photo is taken (with display and thumb, so a photographed letter shows
   in a list). Then `await keepOnPhone(fileId, prepared)` before making the
   save, so the parts are on the phone before anything is sent.
3. **The save's send:**
   `send: (input, made) => withUpload(input.fileId, made, () => addPaper({ data: input, headers: stamped(made) }))`
   (`src/api/rpc/files.ts`): uploads first if still on the phone, then
   the record, then forgets the phone's copy; forgets it too if refused.
4. **The server function** checks the upload is there
   (`new FilesRepo(db).get(id)`) and 400s if not; deleting the record calls
   `dropUpload(db, id)` (`src/server/files/store.ts`) after its row is gone,
   and the page calls `forgetFile(id)` (`src/pwa/register.ts`) so the
   worker drops its copies.
5. **Showing it:** `useUploadSrc(fileId, "thumb")` for a picture (the
   phone's copy until it's up); a PDF opens at `fileUrl(id, "original")`
   in a new tab, and downloads with `?download`. A PDF is never drawn in an
   `<img>`, so it has no `display` or `thumb` unless the phone makes one.
6. **Medical papers are health information:** the same gate, the same
   volume, the same backup. Whether they want a stronger lock than the one
   shared password is the next plan's question.

## Steps

1. **The store.** `020_uploads_photos.sql`; `src/db/models/files/` (`upload`,
   `FilesRepo`) and `src/db/models/photos/` (`photo`, `PhotosRepo`);
   `src/server/files/store.ts` (the folder, `keepUpload`, `dropUpload`,
   `readUpload`) and `serve.ts` (the bytes back). Tests in `test/db/files.test.ts`, `test/db/photos.test.ts`,
   `test/server/files.test.ts`.
2. **The rules.** `src/lib/files.ts` (types, sniffing, limits, sizes,
   URLs), `src/lib/exif.ts` (the day a JPEG was taken),
   `src/lib/photos.ts` (kinds, the bump row, by week, the timeline's
   words, what's offered while quiet). Tests in `test/lib/`.
3. **Serving and uploading.** `src/api/rest/files.ts` (the route);
   `src/api/rpc/files.ts` (`putUpload`, `withUpload`);
   `src/api/rpc/photos.ts` (`addPhoto`, `editPhoto`, `deletePhoto`, their
   saves, `photosQuery`, `usePhotos`). The privacy rule reads forms.
4. **The phone's half.** `src/app/model/uploads.ts` (making ready, kept on
   the phone), `src/app/hooks/useUploadSrc.ts`; the worker's files cache.
5. **The Journal's section and the "+".**
   `src/features/journal/components/photos/`. Out of Still to come.
6. **The timeline.** `photos` on `MapWeek`, drawn by `WeekMap`.
7. **e2e.** `e2e/photos.spec.ts`; `quiet.spec.ts` checks the fold.
8. **Docs.** `architecture.md`, `intent.md`, CLAUDE.md.

## To settle while building

- 2048 px and 480 px, JPEG at 0.85 and 0.8: a guess at sharp on a phone
  without being slow to send. Jason to judge on a real scan printout.
- Whether "Something else" should be called "A moment" or "Other".
- 30 MB is generous for a photo and enough for a scanned PDF.

## Progress

- 2026-10-30: plan written, and built, steps 1–8 (the gate not yet run).
