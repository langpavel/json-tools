<script lang="ts">
  import type { PrettierOptions } from "../../../background/formatByPrettier";
  import { callBackgroundWorker } from "../callBackgroundWorker";
  import { CharWidthMeasurer } from "../charWidth.svelte";

  let {
    jsonText,
    tabWidth,
    useTabs,
  }: { jsonText: string; tabWidth?: number; useTabs?: boolean } = $props();

  let clientWidth = $state(0);
  const charMeasure = new CharWidthMeasurer();

  let autoWidth = $derived.by(() => {
    let result = Math.floor(clientWidth / charMeasure.current - 2.5);
    if (result < 20) {
      return 20;
    }
    return result;
  });

  let formatPayload = $derived.by(() => {
    $inspect.trace("formatPayload");
    return {
      text: jsonText,
      options: {
        parser: "json",
        tabWidth: tabWidth ?? 2,
        printWidth: autoWidth,
        useTabs: useTabs ?? false,
      } satisfies PrettierOptions,
    };
  });

  let formatted = $derived(
    await callBackgroundWorker("FORMAT_PRETTIER", formatPayload),
  );
</script>

<svelte:window bind:innerWidth={clientWidth} />

<!-- {clientWidth} / {charMeasure.current} = {autoWidth} -->

<div class="container">
  <div class="ruler" style:width={autoWidth * charMeasure.current + "px"}></div>
  <pre class="response"><code bind:this={charMeasure.element}>{formatted}</code
    ></pre>
</div>

<style>
  .container {
    position: relative;
    margin: 0 1ch 0 1ch;
    padding: 0;
  }

  .ruler {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;

    border-right: 1px solid rgba(127, 127, 127, 0.5);
    background-color: rgba(127, 127, 127, 0.1);
    margin: 0;
    padding: 0;
    pointer-events: none;
  }

  .response {
    margin: 0;
    padding: 0;
    overflow-x: visible;
    font-family:
      "JetBrains Mono",
      "SF Mono",
      SF Mono,
      Consolas,
      "Liberation Mono",
      Menlo,
      Courier,
      monospace;
  }
</style>
