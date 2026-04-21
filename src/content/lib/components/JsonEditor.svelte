<!--
  JsonEditor: CodeMirror 6 view for Prettier-formatted JSON.

  On mount the doc is empty — we then call the FORMAT_PRETTIER background
  op with a printWidth derived from the editor's own content width, and
  replace the whole doc when it returns. This keeps mount instant even
  for very large payloads; Prettier runs off the main thread.

  Edits typed into the editor are LOCAL-ONLY: they live in the editor's
  own buffer and are discarded whenever a new format arrives (tabWidth
  change, window resize) or the user switches modes. There is deliberately
  no write-back to the source document.
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
  import {
    search,
    searchKeymap,
    highlightSelectionMatches,
  } from "@codemirror/search";
  import { oneDark } from "@codemirror/theme-one-dark";
  import { themeManager } from "../theme/theme.svelte";
  import { callBackgroundWorker } from "../callBackgroundWorker";
  import type { PrettierOptions } from "../../../background/formatByPrettier";

  let {
    rawData,
    tabWidth,
  }: { rawData: string; tabWidth: number } = $props();

  let host: HTMLDivElement | undefined = $state();
  let view = $state<EditorView | undefined>(undefined);
  let printWidth = $state(80);
  const themeCompartment = new Compartment();
  const tabCompartment = new Compartment();

  function themeExtension(theme: "light" | "dark") {
    return theme === "dark" ? oneDark : [];
  }

  function computePrintWidth(v: EditorView): number {
    const charW = v.defaultCharacterWidth || 8;
    const contentW = v.contentDOM.clientWidth;
    const cols = Math.floor(contentW / charW - 2.5);
    return Math.max(20, cols);
  }

  onMount(() => {
    if (!host) return;

    const state = EditorState.create({
      doc: "",
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

    const v = new EditorView({ state, parent: host });
    view = v;
    printWidth = computePrintWidth(v);

    const ro = new ResizeObserver(() => {
      if (view) printWidth = computePrintWidth(view);
    });
    ro.observe(v.scrollDOM);

    return () => {
      ro.disconnect();
      view?.destroy();
      view = undefined;
    };
  });

  // Sync theme compartment when the shared ThemeManager flips.
  $effect(() => {
    const t = themeManager.current;
    view?.dispatch({
      effects: themeCompartment.reconfigure(themeExtension(t)),
    });
  });

  // Format rawData via Prettier whenever inputs change; replace the whole doc.
  $effect(() => {
    const v = view;
    const w = tabWidth;
    const pw = printWidth;
    const text = rawData;
    if (!v) return;
    let cancelled = false;
    callBackgroundWorker("FORMAT_PRETTIER", {
      text,
      options: {
        parser: "json",
        tabWidth: w,
        printWidth: pw,
        useTabs: false,
      } satisfies PrettierOptions,
    }).then((formatted) => {
      if (cancelled || !view) return;
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: formatted },
        effects: tabCompartment.reconfigure(indentUnit.of(" ".repeat(w))),
      });
    });
    return () => {
      cancelled = true;
    };
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
