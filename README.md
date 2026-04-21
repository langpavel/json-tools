# JSON Tools

A Chrome extension (Manifest v3) that detects when the browser is showing
raw JSON and replaces it with a readable UI — Prettier-formatted with a
responsive print-width, a raw view, and a CodeMirror 6 editable scratchpad
with JSON syntax highlighting, parse-error diagnostics, folding, and search.

Works on any JSON served from a URL or opened as a local `file://`, including
sandboxed origins.

## Install (unpacked, for local dev)

Requires **Node 24+** and **pnpm**.

```bash
pnpm install
pnpm build
```

Then in Chrome:

1. Open `chrome://extensions`.
2. Enable **Developer mode** (top-right).
3. Click **Load unpacked** and select the `dist/` directory.
4. Open any JSON page (e.g. `https://api.github.com/repos/sveltejs/svelte`).

**Minimum Chrome version: 126** — set in `public/manifest.json`.

## Development

```bash
pnpm dev      # watch mode; rebuilds dist/ on file changes
pnpm build    # production build
pnpm check    # Svelte + TypeScript type-check (the project's gate; there is no test framework)
```

After a rebuild, click the reload icon on the extension card in
`chrome://extensions` — or **Remove** and **Load unpacked** again if Chrome
appears to cache a prior broken build (see `docs/gotchas.md` for the one
failure mode where that's required).

## Modes

The UI header exposes three view modes:

| Mode     | Purpose                                                                 |
| -------- | ----------------------------------------------------------------------- |
| Raw      | Untouched source text with a configurable tab-size rendering hint.      |
| Prettier | Responsive pretty-print; recalculates `printWidth` on resize.           |
| Edit     | CodeMirror 6 editor with JSON lint/fold/search. Edits are local-only.   |

Edit mode is a **scratchpad** — changes live in the editor buffer and are
discarded when you switch modes. There is deliberately no "apply" button.

## Further reading

- [`CLAUDE.md`](CLAUDE.md) — architecture, key files, stack.
- [`docs/gotchas.md`](docs/gotchas.md) — non-obvious behaviors
  (sandboxed-origin body styles, the shared `ThemeManager` singleton,
  CodeMirror runtime style injection, Chrome's `U+FFFF`/`U+FFFE` bundle
  rejection and how `vite.config.ts` works around it).
- [`docs/brand.md`](docs/brand.md) — visual identity: name, logo, palette,
  type.
- [`docs/store-assets/`](docs/store-assets/) — template SVGs for the Chrome
  Web Store listing.
