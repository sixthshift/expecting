# Focus without scrolling, in popups

A request from Expecting to `@sixthshift/design-system`, against 0.12.0. A bug
fix, no API change. Done in 0.12.1 (the calendar with the first-focus-only
fallback below, and TimeColumn too); Expecting's patch is deleted.

## The bug

Open a Select, or a DatePicker's calendar, low on a long page, and the page
jumps, often to the top. On a phone you lose your place.

## Why

When a popup opens, the component moves keyboard focus into it, so arrow
keys and a screen reader land in the right place. `element.focus()` also
scrolls the page to bring the focused element into view, and it runs before
the popup has been placed (floating-ui positions it after mount). So the
browser scrolls to where the element is at that moment, not where it will
be.

## The fix

`focus({ preventScroll: true })` at the three places a popup focuses itself
as it opens:

| File | Line (0.12.0) | Focuses |
|---|---|---|
| `src/components/Select/Select.tsx` | 229 | the search box, when `searchable` |
| `src/components/Select/Select.tsx` | 243 | the listbox, when not |
| `src/components/Calendar/CalendarView.tsx` | 277 | the day, following the roving tabIndex |

```ts
inputRef.current.focus({ preventScroll: true });
listboxNode?.focus({ preventScroll: true });
gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${temporalToISO(focusedDate)}"]`)?.focus({ preventScroll: true });
```

The popup is already positioned to be seen; the page doesn't need to move to
show it.

### Probably the same

- `src/components/TimePicker/TimeColumn.tsx:50`: `selectedRef.current?.focus()`
  when `autoFocusSelected`, as the time popup opens. The same shape; check it
  and fix it the same way if it jumps. (Expecting hasn't hit it.)

### Leave as they are

These move focus between controls already on screen, by keyboard, where
scrolling to the focused one is right:

- `Select.tsx:144`: focus back to the trigger when the list closes. The
  trigger is where you were.
- `Tabs/components/TabsList.tsx:31`, `ToggleGroup/ToggleGroupSingle.tsx:65`,
  `RadioButtonGroup/RadioButtonGroup.tsx:132`, `internal/SegmentedField.tsx:169`:
  arrow-key roving.
- `Code/Editor/Editor.tsx:110`: the editor.

One trade-off in CalendarView: its focus also follows arrow keys inside the
grid, so a calendar laid inline and taller than the screen would no longer
scroll to the focused day. A calendar is six rows, so this isn't expected to
matter; if it does, pass `preventScroll` only on the first focus after
opening.

## How to check

A story or test with a long page: scroll down, open the Select (searchable
and not) and the DatePicker, and `window.scrollY` is unchanged.

Expecting's version, for reference: `e2e/journey.spec.ts`, "opening a choice
further down the page keeps your place". It opens a Select low in Settings
and checks `scrollY` before and after.

## In Expecting until then

Expecting patched 0.12.0's built files with these three lines
(`patches/@sixthshift%2Fdesign-system@0.12.0.patch`, `patchedDependencies`
in `package.json`). With 0.12.1 the patch is deleted, and upgrades no longer
need it redone.

## Done when

- The three focus calls pass `preventScroll: true`.
- TimeColumn is checked, and fixed if it jumps.
- Opening a Select or a DatePicker low on a long page leaves the page where
  it was, on a phone and on a desktop.
