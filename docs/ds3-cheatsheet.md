# DS3.0 cheatsheet

Quick reference for the components this starter uses, copied from https://commure-ui.pages.dev in October 2026. The docs site is the source of truth: for any component not listed here, or if something here doesn't work, check its Code tab at `https://commure-ui.pages.dev/components/<name>?tab=code`.

There are 57 components. Full list: https://commure-ui.pages.dev/components

## Setup (already done in this starter)

```tsx
import "@getathelas/ui/globals.css";
import { CommureProvider } from "@getathelas/ui";

<CommureProvider>{children}</CommureProvider>
```

## Button

```tsx
<Button variant="primary">Save changes</Button>
```

- `variant`: `"primary" | "secondary" | "tertiary" | "neutral" | "danger-primary" | "danger-secondary" | "danger-tertiary"` (default `primary`)
- `size`: `"sm" | "md" | "lg"` (default `md`)
- `loading`: boolean. Shows a spinner and disables the button.
- `disabled`: boolean
- Rules: one Primary per view. Use Link, not Button, to navigate between pages. Danger buttons need a label that names the consequence ("Delete record", not "OK"). Icon-only buttons use `IconButton` with `aria-label`.

## Stack (layout)

```tsx
<Stack direction="vertical" gap={4}>
  ...
</Stack>

// Push items apart with a growing spacer
<Stack direction="horizontal" gap={2} align="center">
  <Typography variant="label-m">Filters</Typography>
  <Stack.Item grow />
  <Button variant="secondary">Reset</Button>
  <Button variant="primary">Apply</Button>
</Stack>
```

- `direction`: `"horizontal"` (default) or `"vertical"`
- `gap`, `padding`, `margin` (and their Vertical / Horizontal / Top / Right / Bottom / Left variants): spacing scale numbers below
- `align`, `justify`, `wrap`: alignment and wrapping
- All layout props accept responsive values.

## Typography (all text)

```tsx
<Typography variant="heading-l">Heading L</Typography>
<Typography variant="body-s" color="fg-secondary">Secondary body small.</Typography>
<Typography variant="heading-l" render={<h1 />}>Page title</Typography>
```

- `variant` (required): `"display" | "supportive" | "overline" | "heading-xl" | "heading-l" | "heading-m" | "heading-s" | "body-l" | "body-m" | "body-s" | "label-l" | "label-m" | "label-s" | "label-xs" | "numeric-lg" | "numeric-md" | "numeric-sm" | "numeric-xs" | "numeric-xxs"`
- `color`: `"fg-primary" | "fg-secondary" | "fg-tertiary" | "fg-accent" | "fg-semantic-info" | "fg-semantic-success" | "fg-semantic-warning" | "fg-semantic-danger"` and others. Defaults to inheriting.
- `align`: `"left" | "center" | "right"`
- `truncate`: boolean
- `render`: swap the HTML element, for example `render={<h1 />}` for page titles.

## Card

```tsx
<Card>Card content for grouped UI.</Card>
<Card floating padding="sm">...</Card>
```

- `padding`: `false | "sm" | "md" | "lg"` (default `md`)
- `floating`: boolean, adds a shadow
- `radius`: `"sm" | "md" | "lg"` (default `md`)

## SegmentedControl (used by the direction switcher)

```tsx
<SegmentedControl defaultValue={["day"]}>
  <SegmentedControl.Button value="day">Day</SegmentedControl.Button>
  <SegmentedControl.Button value="week">Week</SegmentedControl.Button>
</SegmentedControl>
```

- `value` / `defaultValue`: an array of selected values
- `onValueChange(values)`: called with the new array
- `size`: `"sm" | "md" | "lg"`; `stretch`: fill the container width

## Spacing scale

Use these numbers for `gap`, `padding`, and `margin`. Never use pixel values.

| Token | px | Typical use |
|---|---|---|
| 1 | 4 | Icon gaps, tight padding in chips and tags |
| 2 | 8 | Inline gaps, compact list items |
| 3 | 12 | Input padding, small buttons |
| 4 | 16 | Default content padding |
| 5 | 20 | Section gaps within a component |
| 6 | 24 | Card and modal padding |
| 8 | 32 | Between related page sections |
| 10 | 40 | Section separators, table row height |
| 12 | 48 | Page gutter |
| 16 | 64 | Large section gaps |
| 20 | 80 | Top-level page regions |

## Color

- No hex values, ever. Prefer component props (`variant`, `color`) over CSS.
- When CSS is unavoidable, use theme tokens, for example backgrounds `var(--color-bg-solid-base)` (white surface), `var(--color-bg-solid-1)` (page), `var(--color-bg-solid-2)`, `var(--color-bg-solid-3)`, `var(--color-bg-solid-inverse)`. Browse all tokens at https://commure-ui.pages.dev/foundations/tokens
- Semantic meaning is fixed: info = blue, success = green, warning = yellow, danger = red. Never use color as the only signal; pair it with an icon or label.
