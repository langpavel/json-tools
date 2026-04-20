# Gotchas

## Sandboxed page body style override (`App.svelte` `$effect`)

Body styles (margin, padding, background-color, color) are managed by a reactive
`$effect` in `App.svelte` that syncs with the current theme. On initial load,
`index.ts` also applies body styles before mounting to prevent a flash of unstyled
content (FOUC).

This JS-based approach is required because on sandboxed pages (`window.origin === "null"`,
e.g. local `file://` URLs, `data:` URLs, or sandboxed iframes), the browser may refuse
to apply CSS injected via content scripts that uses `::global` selectors. The direct JS
style assignment bypasses this restriction.

**Do NOT consolidate body styles into CSS-only `::global` rules — they will not apply
on sandboxed pages.**

## CodeMirror `EditorView` must not be wrapped in `$state()` (`EditorJSON.svelte`)

CodeMirror's `EditorView` (and the state it owns) relies on stable object identity
and mutable internals. Wrapping it in a Svelte 5 proxy via `$state()` corrupts that
model — dispatches silently misbehave. Hold it in a plain `let view: EditorView | null`.
If you need reactivity off the view's identity, use `$state<EditorView | null>(null)`
for the *reference* only, never for nested CM state.

## Theme swap via `Compartment.reconfigure`, not view rebuild (`EditorJSON.svelte`)

Rebuilding the `EditorView` on theme toggle drops selection, scroll position, and the
undo history. Install the theme behind a `Compartment` and dispatch
`themeC.reconfigure(buildTheme(mode))` on change. Read the initial theme and `doc`
with `untrack()` inside the mount `$effect` so toggling the theme (or typing) does
not re-enter the mount effect.

## Editor container needs `min-height: 0` (`EditorJSON.svelte`)

The editor host sits inside `.content` (a flex-column child with `flex: 1`). Without
`min-height: 0` on the editor host **and** on the inner `.cm-editor`, the CM scroller
collapses to content height and the outer `.content` grows a scrollbar instead — same
flex-child overflow quirk as `.content` itself.
