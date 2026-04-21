<!--
  JsonEditor: CodeMirror 6 editable view of the raw JSON.

  NOTE: edits here are LOCAL-ONLY — they live in the editor's own buffer and
  are discarded when the user switches modes. There is deliberately no
  write-back to `rawData`. If "apply edits" is needed later, it's a separate
  feature.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { EditorState, Compartment } from "@codemirror/state";
  import {
    EditorView,
    lineNumbers,
    highlightActiveLineGutter,
    highlightActiveLine,
    keymap,
    drawSelection,
  } from "@codemirror/view";
  import {
    defaultKeymap,
    history,
    historyKeymap,
    indentWithTab,
  } from "@codemirror/commands";
  import {
    foldGutter,
    indentOnInput,
    bracketMatching,
    foldKeymap,
    indentUnit,
    syntaxHighlighting,
    defaultHighlightStyle,
  } from "@codemirror/language";
  import { json, jsonParseLinter } from "@codemirror/lang-json";
  import { lintGutter, linter, lintKeymap } from "@codemirror/lint";
  import { search, searchKeymap, highlightSelectionMatches } from "@codemirror/search";
  import { oneDark } from "@codemirror/theme-one-dark";
  import { themeManager } from "../theme/theme.svelte";

  let {
    jsonText,
    tabWidth,
  }: { jsonText: string; tabWidth: number } = $props();

  let host: HTMLDivElement | undefined = $state();
  let view: EditorView | undefined;
  const themeCompartment = new Compartment();
  const tabCompartment = new Compartment();

  function themeExtension(theme: "light" | "dark") {
    return theme === "dark" ? oneDark : [];
  }

  onMount(() => {
    if (!host) return;

    const state = EditorState.create({
      doc: jsonText,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        foldGutter(),
        drawSelection(),
        history(),
        indentOnInput(),
        bracketMatching(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        highlightActiveLine(),
        highlightSelectionMatches(),
        search({ top: true }),
        json(),
        linter(jsonParseLinter()),
        lintGutter(),
        tabCompartment.of(indentUnit.of(" ".repeat(tabWidth))),
        themeCompartment.of(themeExtension(themeManager.current)),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...foldKeymap,
          ...searchKeymap,
          ...lintKeymap,
          indentWithTab,
        ]),
        EditorView.theme({
          "&": { height: "100%" },
          ".cm-scroller": {
            fontFamily:
              '"JetBrains Mono", "SF Mono", Consolas, "Liberation Mono", Menlo, Courier, monospace',
          },
        }),
      ],
    });

    view = new EditorView({ state, parent: host });

    return () => {
      view?.destroy();
      view = undefined;
    };
  });

  // Sync the theme compartment when the shared ThemeManager flips.
  $effect(() => {
    const t = themeManager.current;
    view?.dispatch({
      effects: themeCompartment.reconfigure(themeExtension(t)),
    });
  });

  // Sync indent unit when tabWidth prop changes.
  $effect(() => {
    const w = tabWidth;
    view?.dispatch({
      effects: tabCompartment.reconfigure(indentUnit.of(" ".repeat(w))),
    });
  });
</script>

<div class="editor" bind:this={host}></div>

<style>
  .editor {
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  .editor :global(.cm-editor) {
    height: 100%;
  }

  .editor :global(.cm-editor.cm-focused) {
    outline: none;
  }
</style>
