# Polish

How Expecting feels to use, beyond what it does: loading, motion, empty and first-run states, feedback after an action, and the small things that make a PWA feel like an app. This starts from a walkthrough of every pillar on 2026-11-01, on a fresh database at week 24, at phone width (390) and desktop width (1440), in light and dark, with a few actions (ticking a task, a feeling, a note through the "+", opening a Library entry) shot frame by frame.

What's already good, and to keep: the "+" sheet slides up over a dimmed page; saves are optimistic, so a tick or a note lands at once; after the "+" a toast says where it went ("In the Journal", See it); the Journal's first-run invitations ("Felt the first kick: Write it / Not yet", "There's a place ready for the glucose test's result") already invite instead of showing gaps; the stork waits 400ms before showing; focus rings are visible on desktop; dark mode holds up.

## What the walkthrough found

Ranked by how often it's felt. The rank is a proposal.

### 1. The "+" button covers things (phone, every pillar)

The floating "+" sits over the content's last line with nothing reserved under it. On This week it covers "Great", the last mood; on the Journal it cuts the "Note" chip; on the Planner it half-covers "Add question". The page needs bottom room for it (the nav's height plus the button's), and horizontal rows that reach the right edge need to stop short of it or scroll clear of it.

### 2. A tick has no moment, and no undo

Ticking a task on This week removes the row in the same frame: no check drawn, no fade, the list jumps up under the finger, and the next row is now where the tap was (an easy double-tick). There's nothing to undo a mistaken tick except going to find it in the Planner. Proposal: the box fills and the text strikes through (about 150ms), the row stays for a beat, then collapses (about 200ms); a toast "Ticked: Book antenatal classes · Undo". Also a light vibration on Android.

### 3. Progress bars read as full when they're empty

`ProgressBar` draws its track in a near-black, so the Planner's "0 of 42 done" looks like a full bar, and This week's position bar reads as a two-tone bar rather than a fill. The track wants a light neutral. This is the design system's colour (`@sixthshift/design-system/progress-bar`), so it goes as a spec in `docs/design-system/` unless the theme can set it.

### 4. Loading is a stork or a line of text, never the page's shape

Two kinds of waiting: the whole page swaps for the stork (the router's pending page), and an opening Library entry shows "Opening The glucose tolerance test" with a spinner on a blank page. Both lose the frame of what's coming. Proposal: a skeleton per page for the parts whose shape is known (This week's header and to-do rows, the Planner's list, a Library entry's card, the Journal's week card) and the stork kept for a cold start only. Measure on a production build first: the dev server serves unbundled modules, so its waits overstate what a phone sees. With the service worker and `offlineFirst` queries, a warm phone may barely wait at all, and then the skeletons matter mostly for the first visit and a new install.

### 5. Pages change with a hard cut

Moving between pillars, opening a Library entry and going back are instant swaps (going back does land where you were). Proposal: a short cross-fade between pillars, a slide for going in and back out (Library entry, a list, the book), with the View Transitions API where the browser has it and no animation where it doesn't.

### 6. The timeline's labels collide with its lines

On the phone, item labels are drawn over the "now" line and the dashed milestone lines, and the longer ones are cut ("Your employer's own paid parental l…"). The colours (dark, grey, pink bars) carry meaning with no key. The "Today" pill floats over the bars. Proposal: give labels a background in the page colour (or knock the lines out behind them), a key under the trimester header, and the pill clear of the content. On open, glide to this week instead of a jump.

### 7. Confirmations say where, not what

After a note, the toast says "In the Journal" with See it, and sits mid-screen over the mood row. It would read better as what and where ("Note kept · week 24", See it) and sit above the nav, clear of the "+". The same pattern for every capture, and for a tick (with Undo, above).

### 8. Small reading problems

- **To-do meta line:** "was due week 20 · The birth parent's · Why" reads as a broken sentence ("The birth parent's" what?), and on desktop the meta sits far right of a narrow title column. "Why" is a small underlined word, a small target (the 44px rule).
- **Planner's Next up:** the explanation is set larger than the task's title, so the hierarchy is upside down.
- **Library's topic grid:** an odd count leaves an empty grey cell at the end.
- **Lists:** the new-list placeholder is cut off ("Bunnings run, ask M"), and the disabled "New list" and "Add question" buttons are so faint they read as missing.
- **Emergency info:** "Still blank: Full name, Date of birth, Allergies…" is a run-on list; it would read better as "8 things still to fill in" with Edit. The 000 button is the same size as any other button, on the one page where it shouldn't be.
- **Header icon:** the emergency icon (a siren) beside settings is hard to read as "Emergency info" at that size.

### 9. Empty and first-run states, pillar by pillar

The Journal does this well. Elsewhere:

- **Drawer:** two of its three cards are "Coming", so it reads as unfinished; either fewer placeholders or the names game shown as the thing it is, with a picture of the game.
- **Planner's questions:** "Nothing to ask yet. Add a question as it comes to you." is fine, but sits under a disabled button; the field could say it ("What do you want to ask the midwife?").
- **Lists:** a single card and an input; fine, but nothing says what a list of your own is for beyond the placeholder.
- **The Journal's book** and the **recaps** before there's anything kept: to check with entries in place (this walkthrough had one note).

### 10. Motion, everywhere at once

No shared timings or easing curves for motion; each animation picks its own, and only the stork and the names game check reduced motion. Proposal: a small set in `src/styles/` (durations: 120, 200, 320ms; one ease-out for entering, one ease-in for leaving), applied to sheets, toasts, list items arriving and leaving, a tick and the mood choice, all under one `prefers-reduced-motion` rule that turns movement into a plain fade or nothing.

### 11. Feeling like an app (PWA)

Not seen in a desktop browser, so to check on a phone: safe areas (the nav above the home indicator), the status bar colour per theme and light or dark, Apple splash screens, no grey flash on tap (`-webkit-tap-highlight-color`), no text selection on long-press of a button, overscroll that doesn't bounce the frame, and an icon badge for what's due (`navigator.setAppBadge`, where supported).

### 12. Desktop

- **Wide pages:** the Journal at 1440 is one very wide column (the week card and the firsts stretch to 1100px).
- **Empty space:** This week leaves the top right empty above "To do now".
- **Keyboard:** focus rings are there; no shortcuts (`n` or `+` for the "+", `/` for the Library search).

## Not found

- **Errors:** no console errors on any page, phone or desktop.
- **Dark mode:** nothing broken in dark.

## The order

1. **Foundations.** Motion tokens and the reduced-motion rule (10), and the "+" button's room (1). Small, and everything after uses them.
2. **A tick and a capture.** Ticking with its moment and Undo (2), confirmations (7).
3. **Moving around.** Page transitions (5).
4. **Loading.** Measure on a production build, then skeletons where they earn it (4).
5. **The timeline** (6) and the **small reading problems** (8), a pillar at a time.
6. **Empty states** (9), **PWA** (11), **desktop** (12).
7. **Design-system specs** for what belongs there: the progress bar's track (3), and anything the motion or skeleton work wants as a component.

Each step is one commit on `feat/polish`, with the gate.

## Not doing

- **A marker for offline:** the outbox already makes offline invisible, as decided.
- **Fanfare:** no confetti or streaks. Moments stay quiet, and none of it shows on the quiet path.
