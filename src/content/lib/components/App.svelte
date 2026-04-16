<script lang="ts">
  import type { JSONValue } from "../../../types";
  import type { Theme } from "../theme.svelte";
  import { ThemeManager } from "../theme.svelte";
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

  let displayMode = $state<"raw" | "prettier">("prettier");
  let tabWidth = $state(2);

  const theme = new ThemeManager();

  // Sync body styles reactively — required for sandboxed pages
  // where ::global CSS from content scripts is ignored
  $effect(() => {
    const bg = theme.current === "dark" ? "#1e1e1e" : "#ffffff";
    const color = theme.current === "dark" ? "#d4d4d4" : "#24292f";
    document.body.style.cssText = `margin:0;padding:0;background-color:${bg};color:${color};`;
  });
</script>

<div class="root" data-theme={theme.current}>
  <header>
    <div class="header-left">
      <button
        class:active={displayMode === "raw"}
        onclick={() => {
          displayMode = "raw";
        }}>Raw</button
      >
      <button
        class:active={displayMode === "prettier"}
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
    </div>

    <button
      class="theme-toggle"
      onclick={() => theme.toggle()}
      aria-label={theme.current === "dark"
        ? "Switch to light mode"
        : "Switch to dark mode"}
    >
      {#if theme.current === "dark"}
        <!-- Sun icon -->
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="8"
            cy="8"
            r="3.5"
            stroke="currentColor"
            stroke-width="1.5"
          />
          <line
            x1="8"
            y1="0.5"
            x2="8"
            y2="2.5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <line
            x1="8"
            y1="13.5"
            x2="8"
            y2="15.5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <line
            x1="0.5"
            y1="8"
            x2="2.5"
            y2="8"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <line
            x1="13.5"
            y1="8"
            x2="15.5"
            y2="8"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <line
            x1="2.7"
            y1="2.7"
            x2="4.1"
            y2="4.1"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <line
            x1="11.9"
            y1="11.9"
            x2="13.3"
            y2="13.3"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <line
            x1="2.7"
            y1="13.3"
            x2="4.1"
            y2="11.9"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <line
            x1="11.9"
            y1="4.1"
            x2="13.3"
            y2="2.7"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
      {:else}
        <!-- Moon icon -->
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M13.5 9.5a5.5 5.5 0 0 1-7-7 5.5 5.5 0 1 0 7 7z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      {/if}
    </button>
  </header>

  <section class="content">
    {#if displayMode === "raw"}
      <pre style:tab-size={tabWidth}>{rawData}</pre>
    {:else if displayMode === "prettier"}
      <PrettierJSON jsonText={rawData} {tabWidth} />
    {/if}
  </section>
</div>

<style>
  ::global(html, body) {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
  }

  .root {
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

  .root[data-theme="light"] {
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

  header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 0.5em;
    padding: 0.5em 0.75em;
    background-color: var(--header-bg);
    border-bottom: 1px solid var(--header-border);
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

  button:hover {
    background-color: var(--btn-hover-bg);
  }

  button.active {
    background-color: var(--btn-active-bg);
    color: var(--btn-active-text);
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

  .theme-toggle {
    margin-left: auto;
    background: transparent;
    padding: 0.35em;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    color: var(--btn-text);
  }

  .theme-toggle:hover {
    background-color: var(--btn-hover-bg);
  }

  .content {
    flex: 1;
    overflow: auto;
    min-height: 0;
  }
</style>
