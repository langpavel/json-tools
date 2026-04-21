# Brand

Reference for the JSON Tools Chrome extension. Not marketing copy — a guide
for contributors shipping UI, docs, and store listing assets.

## Name

**JSON Tools**

## Tagline options

Pick one for the store listing; keep the others as fallback.

1. Readable JSON, anywhere the browser shows it.
2. JSON the browser got lazy about. Fixed.
3. Prettier, searchable, editable JSON without a round trip.

## Logo

The mark is a rounded white square containing an orange plus flanked by
curly-brace glyphs. Source of truth: `public/icons/icon.svg`.

- **Clear space:** one square-radius unit of padding on every side.
- **Minimum size:** 16 px. Below that, the braces collapse visually — do not
  redraw, just do not use it.
- **In-app use:** `App.svelte` inlines a trimmed version at 20 px for the
  header wordmark. Do not swap this for an `<img>`; the braces use
  `currentColor` so the logo adapts to the header text color across themes.

## Palette

Values already live in `src/content/lib/components/App.svelte` — treat that as
canonical and only mirror it here.

| Role            | Dark        | Light       |
| --------------- | ----------- | ----------- |
| Surface         | `#1e1e1e`   | `#ffffff`   |
| Chrome / header | `#252526`   | `#f6f8fa`   |
| Text            | `#d4d4d4`   | `#24292f`   |
| Active accent   | `#007acc`   | `#0969da`   |
| Brand accent    | `#f1592b`   | `#f1592b`   |
| Warning         | `#f0c674`   | `#bf8700`   |

`#f1592b` is the brand orange — reserved for the plus glyph in the mark.
Avoid using it for interactive UI; active button color is the blue accent.

## Type

- **UI:** `system-ui, -apple-system, sans-serif`
- **Code:** `"JetBrains Mono", "SF Mono", Consolas, "Liberation Mono", Menlo, Courier, monospace`

Match `PrettierJSON.svelte` and `JsonEditor.svelte` — they already declare
these stacks.
