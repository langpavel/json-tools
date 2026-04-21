# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Watch mode build (rebuilds on file changes)
pnpm build      # Production build → dist/
pnpm check      # TypeScript + Svelte type checking
```

To test changes, load `dist/` as an unpacked extension in Chrome (`chrome://extensions` → Load unpacked). There is no test framework.

## Architecture

This is a Chrome Extension (Manifest v3) that detects JSON pages and replaces them with a formatted UI. It uses three isolated execution contexts required by Chrome's security model:

```
Page Context (page.js)
  └─ Runs in page origin, exposes parsed JSON to window.data

Content Script (content.js)
  └─ Detects JSON, clears page body, mounts Svelte UI
  └─ Bridges IPC between page and background

Background Service Worker (background.js)
  └─ Runs CPU-heavy Prettier formatting off main thread
  └─ Responds to chrome.runtime.sendMessage() calls
```

**Data flow:** Content script detects JSON → injects page.js to expose `window.data` → calls background worker via `callBackgroundWorker.ts` for formatting → renders result in Svelte components.

**IPC pattern:** All background calls go through `src/content/lib/callBackgroundWorker.ts`, which wraps `chrome.runtime.sendMessage()` with type-safe generics. Operations are registered in `src/background/index.ts`.

## Key Files

| File | Purpose |
|------|---------|
| `src/content/index.ts` | Entry point: detects JSON, mounts Svelte app |
| `src/content/lib/detectJSON.ts` | Detects JSON via `<pre>` tag or Content-Type header |
| `src/content/lib/components/App.svelte` | Main UI: mode toggle (raw/edit), tab width selector, inline logo. Reparents the browser-native `<pre>` into `.content` when mode is Raw |
| `src/content/lib/components/JsonEditor.svelte` | CodeMirror 6 editable view. Owns Prettier formatting — calls `FORMAT_PRETTIER` with a `printWidth` derived from the editor's own content width via `defaultCharacterWidth` + `ResizeObserver` |
| `src/content/lib/theme/theme.svelte.ts` | `ThemeManager` class + shared `themeManager` singleton. Consumers import the singleton |
| `src/background/index.ts` | Operation registry + message listener |
| `src/background/formatByPrettier.ts` | Prettier standalone formatter |
| `src/page/index.ts` | Exposes JSON to `window.data` in page context |
| `src/types.ts` | Shared types (`JSONValue`, message types) |
| `public/manifest.json` | Chrome extension manifest v3 |

## Stack

- **Svelte 5** (runes API: `$state`, `$derived`, `$props`)
- **Vite 8** with three entry points → `dist/{content,background,page}.js`
- **TypeScript 6** — strict, `checkJs: true`
- **Prettier 3** bundled into the background worker (~600 KB output)
- **CodeMirror 6** powers the Edit mode, bundled into `content.js`. Packages in use: `@codemirror/{state,view,commands,language,lang-json,lint,search,theme-one-dark}`. CM6 injects its own styles at runtime (`StyleModule`), which coexists with the Svelte plugin's `css: { injected: true }` — see gotchas.

## Notes

- **Keep Prettier for JSON formatting.** `JSON.stringify(v, null, w)` is not a substitute — Prettier's `printWidth`-aware packing keeps short objects and arrays on one line when they fit (e.g. `"point": { "x": 1, "y": 2 }` stays one line instead of exploding to three), which is the feature users actually come for. The editor's initial doc is populated via the `FORMAT_PRETTIER` background op, and `printWidth` is recomputed from the editor's content width on resize.
- **Raw is the default mode** and Chrome's browser-native `<pre>` is preserved across the `content.js` takeover — `src/content/index.ts` only removes siblings, never the pre itself. This guarantees Raw costs zero JS render work, so the tab stays responsive on pathologically large payloads. `nativePre` is `null` when Chrome didn't use a pre (Content-Type path, sandboxed origins); App.svelte renders a Svelte-owned `<pre>` fallback in that case.
- `analyzeJson.ts` is a stub — the analyze operation is not yet implemented
- The extension sets `css: { injected: true }` in svelte config so styles are inlined into `content.js`
- `chunkSizeWarningLimit: 3000` is intentionally high because Prettier and CodeMirror are large
- `vite.config.ts` registers an `escapeChromeRejectedChars()` plugin that post-processes `dist/*.js` to escape literal `U+FFFF` / `U+FFFE` — Chrome rejects bundles containing them with a misleading "isn't UTF-8 encoded" error. **Do not remove.** See `docs/gotchas.md`.
- Minimum Chrome version: 126 (per manifest)
- See `docs/gotchas.md` for non-obvious behaviors (e.g. why body styles are set via JS, the shared `ThemeManager` singleton, the U+FFFF escape plugin)
