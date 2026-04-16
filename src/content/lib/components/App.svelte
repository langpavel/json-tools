<script lang="ts">
  import type { JSONValue } from "../../../types";
  import PrettierJSON from "./PrettierJSON.svelte";

  let {
    data,
    rawData,
    isSandboxed,
  }: { data: JSONValue; rawData: string; isSandboxed: boolean } = $props();

  let displayMode = $state<"raw" | "prettier">("prettier");
  let tabWidth = $state(2);
</script>

<header>
  <button
    onclick={() => {
      displayMode = "raw";
    }}>Raw</button
  >
  <button
    onclick={() => {
      displayMode = "prettier";
    }}>Prettier</button
  >
  <select bind:value={tabWidth}>
    <option value={2}>2</option>
    <option value={4}>4</option>
    <option value={8}>8</option>
  </select>
  {#if isSandboxed}
    <span class="warning">sandboxed</span>
  {/if}
</header>

<section class="content">
  {#if displayMode === "raw"}
    <pre style:tab-size={tabWidth}>{rawData}</pre>
  {:else if displayMode === "prettier"}
    <PrettierJSON jsonText={rawData} {tabWidth} />
  {/if}
</section>

<style>
  ::global(html, body) {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
  }
  ::global(body) {
    background-color: #1e1e1e;
    color: #d4d4d4;
  }

  header {
    margin-bottom: 1em;
  }

  button {
    margin-right: 0.5em;
  }

  .warning {
    color: yellow;
    font-weight: bold;
  }

  .content {
    overflow: scroll;
    width: 100vw;
    height: 100vh;
  }
</style>
