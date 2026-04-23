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
    highlightSpecialChars,
    dropCursor,
    rectangularSelection,
    crosshairCursor,
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
    autocompletion,
    closeBrackets,
    closeBracketsKeymap,
    completionKeymap,
  } from "@codemirror/autocomplete";
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
    printWidth,
    debug,
  }: {
    rawData: string;
    tabWidth: number;
    printWidth: number | "auto";
    debug: boolean;
  } = $props();

  let host: HTMLDivElement | undefined = $state();
  let clientWidth = $state(600);
  let view = $state<EditorView | undefined>(undefined);

  const themeCompartment = new Compartment();
  const tabCompartment = new Compartment();

  function themeExtension(theme: "light" | "dark") {
    return theme === "dark" ? oneDark : [];
  }

  function computePrintWidth(v: EditorView): number {
    const charW = v.defaultCharacterWidth || 8;
    const cols = Math.floor(clientWidth / charW - 9);
    return Math.max(20, cols);
  }

  let realPrintWidth = $derived.by(() => {
    if (typeof printWidth === "number") return printWidth;
    return computePrintWidth(view!);
  });

  function createEditorView(parent: Element): EditorView {
    const state = EditorState.create({
      doc: "",

      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        foldGutter(),
        drawSelection(),
        dropCursor(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        bracketMatching(),
        closeBrackets(),
        autocompletion(),
        rectangularSelection(),
        crosshairCursor(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        search({ top: true }),
        json(),
        linter(jsonParseLinter()),
        lintGutter(),
        tabCompartment.of(indentUnit.of(" ".repeat(tabWidth))),
        themeCompartment.of(themeExtension(themeManager.current)),
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...searchKeymap,
          ...historyKeymap,
          ...foldKeymap,
          ...completionKeymap,
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

    return new EditorView({ state, parent });
  }

  onMount(() => {
    if (!host) return;

    view = createEditorView(host);
    return () => {
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
    const pw = realPrintWidth;
    const text = rawData;
    if (!v) return;

    if (debug) {
      console.log("formatting with Prettier", {
        textLength: text.length,
        tabWidth: w,
        printWidth: pw,
      });
    }

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

<div bind:clientWidth class="editor" bind:this={host}></div>

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
