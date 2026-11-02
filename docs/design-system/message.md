# Message: `title`'s type

A request from Expecting to `@sixthshift/design-system`, against 0.12.1. A
type fix, no change at runtime. (The rest of the Message request, the
actions slot, `"brand"` and the title's line height, is done in 0.12.0.)

`MessageProps` is
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

