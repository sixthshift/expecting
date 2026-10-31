# Message: an actions slot

A request from Expecting to `@sixthshift/design-system`, against 0.11.0. It
asks for one new slot, one type fix and one style fix; all three would be wanted
by any app, not just this one. Done in 0.12.0; one follow-up open, below.

## Summary

| # | Change | Kind | Breaking |
|---|---|---|---|
| 1 | `actions` prop and `MessageActions` part | New API | No |
| 2 | `"brand"` in `MessageIntentName` | Type | No |
| 3 | `MessageTitle` drops `leading-none` | Style fix | No (visual only) |

## 1. `actions`

### Why

A message that tells you something often comes with something to do about it:
Retry, Undo, View details, Call. Alert-style components elsewhere commonly have
a place for this (MUI's `Alert` `action`, Atlassian's `SectionMessage`
`actions`, Polaris's `Banner` `action`); Message has none.

The library already needs it: `Toast` has its own `action` and puts the button
inside `MessageDescription`, so it shares the description's `opacity-90`, and
its `mt-2` wrapper is spacing decided outside Message.

### API

Simple API: a prop beside `title` and `icon`.

```ts
export type MessageProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof messageVariants> & {
    intent?: MessageIntent | undefined;
    brand?: string | undefined;
    title?: React.ReactNode;
    icon?: React.ReactNode;
    /** Simple API: optional actions (buttons, links) under the description */
    actions?: React.ReactNode;
  };
```

Compound API: a part beside the others, in `components/MessageActions.tsx`.

```ts
export type MessageActionsProps = React.HTMLAttributes<HTMLDivElement>;
export const MessageActions: React.ForwardRefExoticComponent<MessageActionsProps & React.RefAttributes<HTMLDivElement>>;
```

Exported from `src/components/Message/index.ts` with its props type, like
`MessageTitle`.

### Usage

```tsx
<Message
  intent="warning"
  title="Call your midwife or birth unit now."
  actions={
    <>
      <Button intent="warning">Call the birth suite</Button>
      <Button inline asChild>
        <a href="/emergency">Every number</a>
      </Button>
    </>
  }
>
  If your baby's movements slow down, call straight away.
</Message>
```

```tsx
<Message intent="danger">
  <MessageIcon><Siren /></MessageIcon>
  <MessageBody>
    <MessageTitle>Call 000 or go to emergency</MessageTitle>
    <MessageDescription>Heavy bleeding, a bad headache that won't go…</MessageDescription>
    <MessageActions>
      <Button intent="danger">Call 000</Button>
    </MessageActions>
  </MessageBody>
</Message>
```

### Rendering

The simple API renders the actions last inside the body, so they line up with
the title and text, not under the icon:

```tsx
<>
  {icon && <MessageIcon>{icon}</MessageIcon>}
  <MessageBody>
    {title && <MessageTitle>{title}</MessageTitle>}
    <MessageDescription>{children}</MessageDescription>
    {actions && <MessageActions>{actions}</MessageActions>}
  </MessageBody>
</>
```

`MessageActions` is added to the parts `Message` looks for when it decides the
compound API is in use (`hasCompoundChildren`).

### Styling

`MessageActions` owns only its own row; the space above it belongs to the body.

- A row that wraps: `flex flex-wrap items-center gap-2`.
- Space from the description: the body's `gap-1` is too tight above buttons.
  `mt-2` on the part (matching what Toast does by hand today), or a larger body
  gap when actions are present. Your call; the requirement is that the gap
  comes from Message, not from the caller.
- At `size="sm"`: the same row, `gap-1.5`.
- No opacity. It is not the description, and controls must keep their full
  contrast.
- No colour of its own: what goes in it (Button, a link) brings its own.

### Toast

`ToastProps` is `Omit<MessageProps, "size">`, so Toast would inherit `actions`
beside its own `action` and `onAction`. Two ways:

- **Keep Toast's API** (recommended): `Omit<MessageProps, "size" | "actions">`,
  and Toast renders its `action` button in `MessageActions` instead of inside
  `MessageDescription`. No API change, and the button loses the opacity and the
  hand-written `mt-2`.
- **Or open it up**: let Toast take `actions` too and deprecate `action` and
  `onAction`. Larger, and not needed for this request.

### Accessibility

No change to roles. The actions sit inside the message's live region, as
Toast's button already does; a screen reader reads their labels with the
message, which is what you want for "Call now" or "Undo".

## 2. `"brand"` in the intent type

```ts
// now
export type MessageIntentName = "neutral" | "success" | "warning" | "danger";
// asked for
export type MessageIntentName = "neutral" | "brand" | "success" | "warning" | "danger";
```

`src/theming/intents.css` defines `[data-intent="brand"]`, and `ButtonIntentName`
and `ProgressBarIntentName` list it. On Message it already works (the type is
widened), it just doesn't autocomplete. Nothing else changes: `brand` isn't in
`ALERT_INTENTS`, so it stays `role="status"`.

Update the intent list in Message's doc comment to match.

## 3. `MessageTitle` line height

`MessageTitle` is `font-medium leading-none`. A title that wraps (a phone, a
long sentence) gets lines with no leading between them. Drop `leading-none` so
it takes the message's line height (`text-sm`'s), or use `leading-snug` if a
single-line title must stay tight against the description. Check the icon
still lines up with the first line of the title (`MessageIcon` is `h-4 w-4`).

## Not asked for

Things Expecting needs that the library already allows, or that are the app's
job, so they stay out of this request:

- **Choosing a role.** `role` is spread after the intent's role, so the app
  passes `role="alert"` for an urgent warning and `role="note"` for a static
  callout. No `live` prop.
- **A heading for a title.** The compound API: `<MessageTitle><h3>…</h3></MessageTitle>`.
  (The simple API's `title` would take a node too, but its type doesn't; see
  the follow-up below. A generic `asChild` on the parts would be nicer still,
  a separate decision about the compound API.)
- **The description's `opacity-90`.** A design choice; with actions outside
  the description it no longer touches controls.
- **Expecting's look**: an accent edge on the left, the icon and title in
  `--intent-fg`, 44px tap targets on links. Classes in the app.

## Follow-up, after 0.12.0: `title`'s type

Found putting 0.12.0 to use. `MessageProps` is
`React.HTMLAttributes<HTMLDivElement> & { title?: React.ReactNode; … }`, and
`HTMLAttributes` has its own `title?: string`, so the two intersect to
`string`: `title={<h3>…</h3>}` fails to type-check, though it would render.
`CardProps` already avoids this with `Omit<React.HTMLAttributes<HTMLDivElement>, "title">`.

```ts
export type MessageProps = Omit<React.HTMLAttributes<HTMLDivElement>, "title"> &
  VariantProps<typeof messageVariants> & { … };
```

`ToastProps` builds on `MessageProps`, so it is fixed by the same line. Done
when `<Message title={<strong>Saved</strong>}>` type-checks.

## Later, separately

Worth deciding for the library as a whole, not part of this request:

- **An explicit root.** `Message` decides between its two APIs by checking its
  children's types, which misses a part wrapped in the app's own component or
  in a fragment, and can't mix the two. A `Message.Root` for the parts, with
  `Message` as the root filled in from props (Radix's `Callout.Root`), would
  make the choice explicit. Breaking for compound users, Toast included.
- **`asChild` on the parts**, so a title can be an `h3` without a wrapper.

## Done when

- `actions` renders under the description, aligned with the body, at both
  sizes, and wraps on a narrow screen.
- `MessageActions` works in the compound API and is detected as a part.
- Toast's action renders in `MessageActions`, at full opacity, with Toast's
  props unchanged.
- `intent="brand"` autocompletes and renders the brand tint with
  `role="status"`.
- A two-line title has normal leading, and the icon sits on its first line.
- Stories: Message with actions (each intent, both sizes, one and two
  actions, the compound form), and a wrapping title.
