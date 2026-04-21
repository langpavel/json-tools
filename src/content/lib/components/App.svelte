<script lang="ts">
  import { untrack } from "svelte";
  import type { JSONValue } from "../../../types";
  import type { Theme } from "../theme/theme.svelte";
  import { themeManager } from "../theme/theme.svelte";
  import ThemeButton from "../theme/ThemeButton.svelte";
  import JsonEditor from "./JsonEditor.svelte";

  let {
    data,
    rawData,
    nativePre,
    isSandboxed,
    initialTheme,
  }: {
    data: JSONValue;
    rawData: string;
    nativePre: HTMLPreElement | null;
    isSandboxed: boolean;
    initialTheme?: Theme;
  } = $props();

  // Seed the shared theme manager once. `initialTheme` is a snapshot passed
  // from the mount site; we intentionally read it only at init.
  untrack(() => {
    const seed = initialTheme;
    if (seed) {
      themeManager.current = seed;
    }
  });

  // Raw is the default because it costs zero JS render work — the native
  // <pre> is simply reparented into `.content`. First paint stays responsive
  // regardless of payload size; editing is opt-in.
  let displayMode = $state<"raw" | "edit">("raw");
  let tabWidth = $state(2);
  let contentEl: HTMLElement | undefined = $state();

  // Move the preserved browser-native <pre> in and out of the content area
  // as the mode toggles. When it's null (sandboxed / Content-Type path), the
  // template renders a Svelte-owned <pre> fallback instead.
  $effect(() => {
    if (!contentEl || !nativePre) return;
    if (displayMode === "raw") {
      if (nativePre.parentElement !== contentEl) {
        contentEl.appendChild(nativePre);
      }
    } else if (nativePre.parentElement === contentEl) {
      nativePre.remove();
    }
  });
</script>

<div class="root">
  <header>
    <div class="header-left">
      <span class="brand" aria-hidden="true">
        <svg
          class="brand-mark"
          viewBox="0 0 64 64"
          width="20"
          height="20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="64" height="64" rx="14" ry="14" fill="#ffffff" />
          <path
            fill="#f1592b"
            d="M 30,30 H 18 v 4 h 12 v 12 h 4 V 34 H 46 V 30 H 34 V 18 h -4 z"
          />
          <path
            fill="currentColor"
            d="m 2,34 v -4 c 4,0 6,0 6,-6 V 16 C 8,10 10,8 18,8 v 4 c -4,0 -6,0 -6,4 v 8 c 0,3 0,7 -6,8 6,1 6,5 6,8 0,1 0,7 0,8 0,4 2,4 6,4 v 4 C 10,56 8,54 8,48 V 40 C 8,35 6,34 2,34 Z"
          />
          <path
            fill="currentColor"
            d="m 62,30 v 4 c -4,0 -6,0 -6,6 v 8 c 0,6 -2,8 -10,8 v -4 c 4,0 6,0 6,-4 v -8 c 0,-3 0,-7 6,-8 -6,-1 -6,-5 -6,-8 0,-1 0,-7 0,-8 0,-4 -2,-4 -6,-4 V 8 c 8,0 10,2 10,8 v 8 c 0,5 2,6 6,6 z"
          />
        </svg>
        <span class="brand-word">JSON Tools</span>
      </span>
      <button
        class:active={displayMode === "raw"}
        onclick={() => {
          displayMode = "raw";
        }}>Raw</button
      >
      <button
        class:active={displayMode === "edit"}
        onclick={() => {
          displayMode = "edit";
        }}>Edit</button
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

    <ThemeButton />
  </header>

  <section class="content" bind:this={contentEl}>
    {#if displayMode === "edit"}
      <JsonEditor {rawData} {tabWidth} />
    {:else if !nativePre}
      <!-- sandboxed / Content-Type fallback: no browser-native <pre> to reparent -->
      <pre style:tab-size={tabWidth}>{rawData}</pre>
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

  .brand {
    display: inline-flex;
    align-items: center;
    gap: 0.4em;
    margin-right: 0.25em;
    user-select: none;
  }

  .brand-mark {
    display: block;
    color: var(--text);
  }

  .brand-word {
    font-family:
      system-ui,
      -apple-system,
      sans-serif;
    font-size: 0.85em;
    font-weight: 500;
    letter-spacing: 0.01em;
    color: var(--text);
    opacity: 0.85;
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

  .content {
    flex: 1;
    overflow: auto;
    min-height: 0;
  }

  /* The browser-native <pre> is reparented here in Raw mode — it lives
     outside Svelte's tree so we need :global. Leave its font/color alone;
     inheriting the default browser rendering is the whole point. */
  .content :global(> pre) {
    margin: 0;
    padding: 0 1ch;
  }
</style>
