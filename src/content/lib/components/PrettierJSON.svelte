<script lang="ts">
  import type { PrettierOptions } from "../../../background/formatByPrettier";
  import { callBackgroundWorker } from "../callBackgroundWorker";
  import { useCharWidth } from "../charWidth.svelte";

  let {
    jsonText,
    tabWidth,
    useTabs,
  }: { jsonText: string; tabWidth?: number; useTabs?: boolean } = $props();

  let clientWidth = $state(0);
  let preElement: HTMLPreElement | null = $state(null);
  let { charWidth } = $derived(useCharWidth(() => preElement));

  let printWidth = $derived.by(() => {
    let result = Math.floor(clientWidth / charWidth);
    if (result < 20) {
      return 20;
    }
    return result;
  });

  let formatted = $derived(
    await callBackgroundWorker("FORMAT_PRETTIER", {
      text: jsonText,
      options: {
        parser: "json",
        tabWidth: tabWidth ?? 2,
        printWidth,
        useTabs: useTabs ?? false,
      } satisfies PrettierOptions,
    }),
  );
</script>

<div>
  {clientWidth} / {charWidth} = {printWidth}
</div>

<pre bind:this={preElement} bind:clientWidth>{formatted}</pre>
