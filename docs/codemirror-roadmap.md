# CodeMirror "Editor" mode — roadmap

Canonical status doc for the CodeMirror integration. Tick boxes as milestones land.
Current state: **M0 complete — M1 next.**

Bundle baseline (post-M0, CM deps installed but not imported):
- `dist/content.js`: 64.55 kB (gzip 24.20 kB)
- `dist/background.js`: 618.84 kB (gzip 177.75 kB)
- `dist/page.js`: 0.33 kB (gzip 0.24 kB)

## Context

The extension currently ships two view modes: **Raw** (`<pre>`) and **Prettier** (Prettier-formatted `<pre>` with dynamic `printWidth`). This track adds a third **Editor** mode backed by CodeMirror 6, a command palette that drives actions, and JSON-Schema inference from the current buffer.

Why:
- A real editor unlocks editable local copies, syntax-aware interactions (fold, search, multi-cursor), and a natural home for a discoverable command palette.
- Schema inference turns sample JSON into a reusable artifact. Driven by **algorithmic heuristics** (no LLM in v1), **dynamically configurable** — e.g. toggle "low-cardinality keys → discriminator" on/off and re-run.
- Speed-first UX: large payloads must not hang the tab. Default mode adapts to content size.

## Architecture

```
App.svelte
 ├─ header
 │   ├─ mode buttons: Raw | Prettier | Editor  (+ adaptive default by size)
 │   ├─ tab-width select
 │   └─ ThemeButton
 ├─ content (scrollable)
 │   ├─ <pre>raw</pre>
 │   ├─ PrettierJSON   (existing)
 │   └─ EditorJSON     ← new, CodeMirror 6 host
 └─ CommandPalette.svelte (overlay portal; open via Ctrl/Cmd+Shift+P)
```

Content script owns editor + palette. Heavy work (Prettier, schema inference) stays in the background worker behind `callBackgroundWorker`.

**Schema tab** reuses the existing content-script pipeline: background opens a new tab with `data:application/json,...`; our content script (matches `<all_urls>`) detects it and renders with the same `App.svelte` — including adaptive default mode. No separate extension page in v1.

## Dependencies added

```
@codemirror/state         ^6.6
@codemirror/view          ^6.41
@codemirror/language      ^6.12
@codemirror/commands      ^6.10
@codemirror/search        ^6.6
@codemirror/autocomplete  ^6.20
@codemirror/lang-json     ^6.0
```

Deliberately **not added**: `codemirror` meta-package (drags in lint/fold/gutter), `@codemirror/theme-one-dark` (own theme from existing CSS tokens), `svelte-codemirror-editor` (raw mount is simpler in Svelte 5 runes), any npm schema-inference lib (we own the heuristics).

Bundle target: **< +150 KB gz** on `content.js` post-M1. Prettier (~600 KB) stays in `background.js`.

## Keeping focus — working rhythm

1. **One milestone at a time.** Never start M(N+1) while M(N) has an open acceptance item. This doc is the scoreboard — tick boxes only after they're true.
2. **Acceptance criteria first.** Re-read the active milestone's block before writing code. If vague, refine the doc first. If > M (half-day) without an acceptance block, split.
3. **Per-milestone branch + squash merge.** `feat/codemirror/m<N>-<slug>`.
4. **Bundle budget check at every milestone.** `pnpm build`, note `dist/content.js` size, compare. A surprise +300 KB is a stop-and-think signal.
5. **Diff review before merge.** Delete anything that looks like "future use" scaffolding.
6. **Gotchas as they're found.** Append to `docs/gotchas.md` immediately, before the surprise fades.
7. **No peeking.** Don't prewire flags or hooks for later milestones.
8. **Session prelude (1 min).** `git log --oneline main..HEAD`, open this doc, re-read the active milestone's acceptance.
9. **Stuck budget.** > 1 hour without forward progress → stop, update doc with blocker, switch or ask.
10. **Lessons capture.** User corrections → append pattern to `~/.claude/CLAUDE.md` `tasks/lessons.md`.

## Milestones

Effort: **XS** ≈ 15–30 min · **S** ≈ 1–2 h · **M** ≈ half-day · **L** ≈ full day · **XL** ≈ multi-day.

---

### M0 — Foundations · **S**
Dependencies: none.

1. Add the seven `@codemirror/*` deps via `pnpm add -D`.
2. Seed this roadmap in `docs/`.
3. One-line reference from `CLAUDE.md` to this roadmap.
4. Widen `DisplayMode` to `"raw" | "prettier" | "editor"` (exported from `src/types.ts`). Editor button added but disabled until M1.
5. Refactor mode `<button>`s into a loop over `const modes: {id, label}[]`.

**Acceptance:**
- [x] `pnpm check` clean.
- [x] `pnpm build` produces the same runtime behavior as before (Editor button visible but disabled).
- [x] `docs/codemirror-roadmap.md` committed. *(seeded; commit pending on user request)*

---

### M1 — Editor mode (CodeMirror mounted) · **M**
Dependencies: M0.
New: `src/content/lib/components/EditorJSON.svelte`. Edit: `App.svelte`, `docs/gotchas.md`.

1. Mount `EditorView` in `$effect`; teardown via returned destructor.
2. Keep `view` in a plain `let` (or `$state<EditorView>()` for identity only) — **never** wrap CM internals in a Svelte proxy (breaks CM's mutable model). Record in gotchas.
3. Extensions: `history()`, `keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap, ...completionKeymap])`, `json()`, `highlightSelectionMatches()`, a theme `Compartment`.
4. Two-way doc sync: `EditorView.updateListener` writes back to the `doc` prop; a guarded `$effect` dispatches external changes (string-compare before dispatch to avoid ping-pong).
5. Theme compartment: `$effect` watches `ThemeManager.current` → `dispatch({effects: themeC.reconfigure(buildTheme(tokens, current))})`. No view rebuild on toggle.
6. `buildTheme(tokens, mode)` reads existing CSS custom props (`--bg`, `--text`, `--header-bg`, …) so dark/light sync is free.
7. Enable the Editor button; pass `rawData` as initial `doc`.

**Acceptance:**
- [ ] Editor button switches content area; CodeMirror visible with JSON highlighting.
- [ ] Typing works; undo/redo via defaults (Mod-z / Mod-Shift-z).
- [ ] Theme toggle instantly repaints the editor.
- [ ] `dist/content.js` delta < +150 KB gz vs post-M0.

---

### M2 — Command palette shell · **M**
Dependencies: M1.
New: `src/content/lib/components/CommandPalette.svelte`, `src/content/lib/commands/registry.ts`.

1. `registry.ts`: `type Command = { id; title; group?; run(ctx) }`. `CommandCtx = { view: EditorView | null; rawData: string; data: JSONValue }`. Export `commands: Command[]`.
2. `CommandPalette.svelte`: centered modal, input, filtered list (plain `String.includes` v1), arrow-key nav, Enter runs, ESC closes, backdrop click closes, focus trap.
3. Lift `openPalette = $state(false)` + `paletteCtx = $derived(...)` to `App.svelte`.
4. `EditorJSON.svelte` keymap: `Mod-Shift-p` → `onOpenPalette()`.
5. Global `document` keydown `$effect` so palette opens from Raw/Prettier modes too.

**Acceptance:**
- [ ] Cmd/Ctrl+Shift+P opens palette in all three modes.
- [ ] Filter, arrow nav, Enter, ESC, backdrop click all work.
- [ ] Smoke-test "About" entry runs.

---

### M3 — "Format with Prettier" command · **S**
Dependencies: M2.
New: `src/content/lib/commands/formatPrettier.ts`. Edit: `registry.ts`, `EditorJSON.svelte`.

1. Read `view.state.doc.toString()`, call `callBackgroundWorker("FORMAT_PRETTIER", …)`, dispatch whole-doc replace.
2. Additional keybinding `Shift-Alt-F` (VS Code parity).
3. Reuses existing `FORMAT_PRETTIER` — no new message type.

**Acceptance:**
- [ ] Munge JSON in Editor → palette → "Format with Prettier" → matches Prettier mode output for the same `tabWidth`.
- [ ] Undo restores pre-format state in one step.

---

### M4 — Structural schema inference · **M**
Dependencies: M2.
New: `src/background/inferSchema/{index,walker}.ts`, `src/content/lib/commands/inferSchema.ts`, `src/background/openSchemaTab.ts`. Edit: `src/background/index.ts` (register `INFER_SCHEMA`, `OPEN_SCHEMA_TAB`).

1. Walker: recursive structural inference emitting **JSON Schema 2020-12**. Handles primitives, arrays (union items), objects (properties + required).
2. Integer vs number: integer iff every numeric sample is `Number.isInteger`.
3. Nullable via `"type": ["string", "null"]` — compact.
4. Returns `{ schema, report: { nodesAnalyzed, heuristicsApplied } }`.
5. Command calls `INFER_SCHEMA`, then `OPEN_SCHEMA_TAB` (background-side `chrome.tabs.create({url: "data:application/json," + encoded})`).

**Acceptance:**
- [ ] `{ "a": 1, "b": "x", "c": null }` → integer/string/null types, `required: ["a","b","c"]`.
- [ ] Heterogeneous array → `items: { anyOf: [...] }`.
- [ ] Command opens new tab; existing content script renders schema.

---

### M4b — Adaptive default mode · **XS**
Dependencies: M1.
Edit: `App.svelte`. New: `src/content/lib/constants.ts`.

1. Initial `displayMode` from `rawData.length`:
   - `< 256 KB` → `"editor"`
   - `< 2 MB` → `"prettier"`
   - else → `"raw"`
2. Thresholds in `constants.ts`.
3. User override sticks — no re-evaluation on mode switch.

**Acceptance:**
- [ ] Tiny JSON → Editor by default.
- [ ] 10 MB synthetic JSON → Raw by default, no Prettier call, no CM instance.
- [ ] Manual mode switch sticks.

---

### M5 — Heuristic refinements · **L**
Dependencies: M4.
New under `src/background/inferSchema/heuristics/`: `formats.ts`, `enum.ts`, `multiSample.ts`, `discriminator.ts`. Edit: `inferSchema/index.ts`.

```ts
type Heuristic = {
  id: string;
  label: string;
  description: string;
  defaultEnabled: boolean;
  apply(schema, samples, opts): Schema;
};
```

v1 heuristics:
- **`formats`** — `uuid | email | uri | date-time | date | ipv4 | ipv6` via precompiled regex; apply only if **every** sample matches. Default on.
- **`enum`** — distinct ≤ `maxEnumSize` (default 8) AND `distinct/total ≤ 0.5` → `"enum"`. Default on.
- **`multiSample`** — array-of-objects per-key: `required` iff present in every element; types union otherwise. Tuple when array length is small and constant across samples. Default on.
- **`discriminator`** — low-cardinality key partitioning object shape → `oneOf` + OpenAPI-style `discriminator`. Default **off** until M6 UI exists.

Orchestrator: base walker, then enabled heuristics in order, collecting `report.heuristicsApplied`.

**Acceptance:**
- [ ] All-UUID string field → `"format": "uuid"`.
- [ ] Field with 4 distinct values / 1000 samples → `"enum": [...]`.
- [ ] `{type: "cat"} | {type: "dog"}` with `discriminator` on → `oneOf` + discriminator.
- [ ] `report.heuristicsApplied` matches what fired.

---

### M6 — Heuristics UI (dynamic re-inference) · **L**
Dependencies: M5.
New: `src/content/lib/components/SchemaSidebar.svelte`. Edit: `App.svelte`.

1. Detect schema-view mode: URL hash contains `#schema=<nonce>`; background stores original sample + current heuristic config in `chrome.storage.session[nonce]`.
2. Sidebar: heuristic toggles + param inputs (`maxEnumSize`, …).
3. Change → `callBackgroundWorker("INFER_SCHEMA", …)` → swap editor doc.
4. Chips above editor show active heuristics (`report.heuristicsApplied`).
5. Fallback: `chrome.storage.session` unavailable → disable sidebar with tooltip; schema stays static.

**Acceptance:**
- [ ] Toggling `enum` re-infers live; state persists within tab session.
- [ ] `maxEnumSize` change updates schema.
- [ ] Disabling `formats` removes `"format": "uuid"` within ~100 ms on a small sample.

---

### M7 — Secondary commands · **M**
Dependencies: M2 + M1.
New: `src/content/lib/commands/{copyAll,download,minify,selectAll,foldAll,unfoldAll}.ts`.

1. **Copy all** — `navigator.clipboard.writeText(view.state.doc.toString())`.
2. **Download** — `Blob` + `<a download>`, filename from `location.hostname + ".json"`.
3. **Minify** — `FORMAT_JSON` bg op with zero indent; replaces editor doc.
4. **Select all / Fold all / Unfold all** — CM built-ins.

**Acceptance:**
- [ ] All six visible in palette, grouped "Editor" / "Export".
- [ ] Minify → Format with Prettier round-trips.

---

### M8 — Polish and ship-readiness · **M**
Dependencies: all prior.

1. Remove `console.log` in `charWidth.svelte.ts`, `$inspect.trace` in `PrettierJSON.svelte`.
2. `docs/gotchas.md` final pass.
3. Tick all acceptance boxes; add "current state: shipped".
4. Update CLAUDE.md "Key files" table.
5. `pnpm build`, record sizes, commit.
6. Smoke matrix: small public JSON endpoint, 10 MB synthetic, sandboxed `file://`, schema `data:` URL.

**Acceptance:**
- [ ] All milestone boxes ticked.
- [ ] No dev-only logs in built output.
- [ ] Smoke matrix passes.

---

### Out of v1 scope (explicit)

- Lint panel (`@codemirror/lint`) — bundle cost, defer until demand.
- LLM-assisted schema refinement — scoped out.
- Dedicated schema-viewer extension page — only if data-URL approach proves constraining.

## Critical files — one-shot index

| File | Change | Milestone |
|---|---|---|
| `package.json` | add 7 `@codemirror/*` deps | M0 |
| `docs/codemirror-roadmap.md` | **new** — this doc | M0 |
| `CLAUDE.md` | pointer to roadmap; Key-files table update | M0, M8 |
| `docs/gotchas.md` | append CM + adaptive-mode notes | M1, M4b, M6 |
| `src/types.ts` | widen `DisplayMode`; add `Schema`, `HeuristicId`, `HeuristicOpts` | M0, M4–M5 |
| `src/content/lib/components/App.svelte` | mode loop, palette state, adaptive default, sidebar slot | M0, M1, M2, M4b, M6 |
| `src/content/lib/components/EditorJSON.svelte` | **new** | M1 |
| `src/content/lib/components/CommandPalette.svelte` | **new** | M2 |
| `src/content/lib/components/SchemaSidebar.svelte` | **new** | M6 |
| `src/content/lib/commands/registry.ts` | **new** | M2 |
| `src/content/lib/commands/*.ts` | **new** per-command modules | M3, M4, M7 |
| `src/content/lib/constants.ts` | **new** | M4b |
| `src/background/index.ts` | register `INFER_SCHEMA`, `OPEN_SCHEMA_TAB` | M4 |
| `src/background/inferSchema/*.ts` | **new** — walker + orchestrator | M4, M5 |
| `src/background/inferSchema/heuristics/*.ts` | **new** — 4 heuristics | M5 |
| `src/background/openSchemaTab.ts` | **new** — wraps `chrome.tabs.create` | M4 |
| `public/manifest.json` | verify `chrome.tabs.create` needs no extra permission in MV3 | M4 |

## Reused existing code — do not duplicate

- `callBackgroundWorker` (`src/content/lib/callBackgroundWorker.ts`) — typed IPC, devalue-aware.
- `formatByPrettier` (`src/background/formatByPrettier.ts`) — Prettier already bundled.
- `formatByJsonStringify` (`src/background/formatByJsonStringify.ts`) — reused by Minify.
- `ThemeManager` (`src/content/lib/theme/theme.svelte.ts`) — its `$state<Theme>` drives the CM theme compartment.
- `CharWidthMeasurer` (`src/content/lib/charWidth.svelte.ts`) — unchanged.
- `src/content/index.ts` bootstrap — unchanged for the schema tab (already matches `<all_urls>`, handles sandboxed origins).

## Gotchas to record

Add to `docs/gotchas.md` as each lands:

1. (M1) CodeMirror `EditorView` must not be wrapped in `$state()`.
2. (M1) Theme swap via `Compartment.reconfigure` — **not** view rebuild (loses scroll/selection/undo).
3. (M1) Editor container inside `.content` needs `min-height: 0` (same flex-child overflow quirk as `.content`).
4. (M4) `chrome.tabs.create({url: "data:..."})` from background works without `"tabs"` permission in MV3 — verify and pin.
5. (M4b) Adaptive default thresholds in `constants.ts`; user override does not re-trigger.
6. (M6) Schema sidebar needs `chrome.storage.session` — may be unavailable; disable gracefully.

## Verification at end of each milestone

1. `pnpm check` clean.
2. `pnpm build` — record `dist/content.js` size.
3. Load `dist/` unpacked in Chrome, open `https://api.github.com/repos/sveltejs/svelte` (or similar).
4. Tick acceptance boxes. Fix before next milestone.

## Risks and mitigations

- **Bundle bloat** — hand-rolled extension list (no `basicSetup`); re-measure per milestone.
- **Data-URL tab sandboxing** — M6 fallback disables sidebar; core display still works.
- **Discriminator false positives** — default off until M6 UI ships.
- **Adaptive default changes UX** — release-note it; thresholds easy to tune.
- **M5–M6 scope creep** — ship only the four listed heuristics in v1.
