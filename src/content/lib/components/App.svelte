<script lang="ts">
  import type { DisplayMode, JSONValue } from "../../../types";
  import ThemeButton from "../theme/ThemeButton.svelte";
  import EditorJSON from "./EditorJSON.svelte";
  import PrettierJSON from "./PrettierJSON.svelte";

  let {
    data,
    rawData,
    isSandboxed,
  }: {
    data: JSONValue;
    rawData: string;
    isSandboxed: boolean;
  } = $props();

  let displayMode = $state<DisplayMode>("prettier");
  let tabWidth = $state(2);

  const modes: { id: DisplayMode; label: string; disabled?: boolean }[] = [
    { id: "raw", label: "Raw" },
    { id: "prettier", label: "Prettier" },
    { id: "editor", label: "Editor" },
  ];
</script>

<div class="root">
  <header>
    <div class="header-left">
      {#each modes as mode (mode.id)}
        <button
          class:active={displayMode === mode.id}
          disabled={mode.disabled}
          title={mode.disabled ? "Coming soon" : undefined}
          onclick={() => {
            displayMode = mode.id;
          }}>{mode.label}</button
        >
      {/each}
      <select bind:value={tabWidth}>
        <option value={2}>2</option>
        <option value={4}>4</option>
        <option value={8}>8</option>
      </select>
      {#if isSandboxed}
        <span class="warning">sandboxed</span>
      {/if}
    </div>

    <ThemeButton />
  </header>

  <section class="content">
    {#if displayMode === "raw"}
      <pre style:tab-size={tabWidth}>{rawData}</pre>
    {:else if displayMode === "prettier"}
      <PrettierJSON jsonText={rawData} {tabWidth} />
    {:else if displayMode === "editor"}
      <EditorJSON doc={rawData} />
    {/if}
  </section>
</div>

<style>
  :global(html, body) {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
  }

  :global(body) {
    --bg: #1e1e1e;
    --text: #d4d4d4;
    --header-bg: #252526;
    --header-border: #3c3c3c;
    --btn-bg: #3c3c3c;
    --btn-text: #cccccc;
    --btn-hover-bg: #505050;
    --btn-active-bg: #007acc;
    --btn-active-text: #ffffff;
    --select-bg: #3c3c3c;
    --select-text: #cccccc;
    --select-border: #555555;
    --warning-color: #f0c674;
  }

  :global(body[data-theme="light"]) {
    --bg: #ffffff;
    --text: #24292f;
    --header-bg: #f6f8fa;
    --header-border: #d1d9e0;
    --btn-bg: #e9ecef;
    --btn-text: #24292f;
    --btn-hover-bg: #d1d5db;
    --btn-active-bg: #0969da;
    --btn-active-text: #ffffff;
    --select-bg: #ffffff;
    --select-text: #24292f;
    --select-border: #d1d9e0;
    --warning-color: #bf8700;
  }

  .root {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    background-color: var(--bg);
    color: var(--text);
    font-family:
      system-ui,
      -apple-system,
      sans-serif;
  }

  .content {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    background-color: var(--bg);
    color: var(--text);
    font-family:
      system-ui,
      -apple-system,
      sans-serif;
  }

  header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 0.5em;
    padding: 0.5em 0.75em;
    background-color: var(--header-bg);
    border-bottom: 1px solid var(--header-border);
    user-select: none;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 0.5em;
  }

  button {
    padding: 0.3em 0.7em;
    border: none;
    border-radius: 4px;
    background-color: var(--btn-bg);
    color: var(--btn-text);
    cursor: pointer;
    font-size: 0.85em;
  }

  button:hover:not(:disabled) {
    background-color: var(--btn-hover-bg);
  }

  button.active {
    background-color: var(--btn-active-bg);
    color: var(--btn-active-text);
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  select {
    padding: 0.25em 0.5em;
    border: 1px solid var(--select-border);
    border-radius: 4px;
    background-color: var(--select-bg);
    color: var(--select-text);
    font-size: 0.85em;
    cursor: pointer;
  }

  .warning {
    color: var(--warning-color);
    font-weight: bold;
    font-size: 0.85em;
  }

  .content {
    flex: 1;
    overflow: auto;
    min-height: 0;
  }
</style>
