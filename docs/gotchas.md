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
