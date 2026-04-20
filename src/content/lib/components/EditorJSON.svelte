<script lang="ts">
  import { untrack } from "svelte";
  import { EditorView, keymap } from "@codemirror/view";
  import { Compartment } from "@codemirror/state";
  import { json } from "@codemirror/lang-json";
  import { defaultHighlightStyle, syntaxHighlighting } from "@codemirror/language";
  import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
  import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
  import { completionKeymap } from "@codemirror/autocomplete";
  import { themeManager, type Theme } from "../theme/theme.svelte";

  let { doc = $bindable("") }: { doc?: string } = $props();

  let container = $state<HTMLDivElement | null>(null);
  // CM internals must never be wrapped in $state — plain reference only.
  let view: EditorView | null = null;
  const themeC = new Compartment();

  function buildTheme(mode: Theme) {
    return EditorView.theme(
      {
        "&": {
          height: "100%",
          backgroundColor: "var(--bg)",
          color: "var(--text)",
        },
        ".cm-scroller": {
          fontFamily:
            '"JetBrains Mono", "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
        },
        ".cm-content": { caretColor: "var(--text)" },
        "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection":
          {
            backgroundColor: "var(--btn-active-bg)",
            color: "var(--btn-active-text)",
          },
        ".cm-activeLine": { backgroundColor: "rgba(127, 127, 127, 0.08)" },
      },
      { dark: mode === "dark" },
    );
  }

  $effect(() => {
    if (!container) return;
    const parent = container;
    const v = new EditorView({
      doc: untrack(() => doc),
      extensions: [
        history(),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...searchKeymap,
          ...completionKeymap,
        ]),
        json(),
        syntaxHighlighting(defaultHighlightStyle),
        highlightSelectionMatches(),
        themeC.of(buildTheme(untrack(() => themeManager.current))),
        EditorView.updateListener.of((vu) => {
          if (vu.docChanged) doc = vu.state.doc.toString();
        }),
      ],
      parent,
    });
    view = v;
    return () => {
      v.destroy();
      view = null;
    };
  });

  // Theme swap via compartment — never rebuild the view (loses scroll/selection/undo).
  $effect(() => {
    const mode = themeManager.current;
    if (!view) return;
    view.dispatch({ effects: themeC.reconfigure(buildTheme(mode)) });
  });

  // External doc change → dispatch; string-compare first to avoid ping-pong with updateListener.
  $effect(() => {
    const incoming = doc;
    if (!view) return;
    const existing = view.state.doc.toString();
    if (incoming === existing) return;
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: incoming },
    });
  });
</script>

<div class="editor-host" bind:this={container}></div>

<style>
  .editor-host {
    display: flex;
    flex: 1 1 0;
    min-height: 0;
    height: 100%;
    width: 100%;
  }

  .editor-host :global(.cm-editor) {
    flex: 1 1 0;
    min-height: 0;
    width: 100%;
  }

  .editor-host :global(.cm-editor.cm-focused) {
    outline: none;
  }
</style>
