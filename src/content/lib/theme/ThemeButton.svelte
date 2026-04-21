<script lang="ts">
  import { themeManager as theme } from "./theme.svelte";
  import { Sun, Moon } from "@lucide/svelte";

  // Sync body styles reactively — required for sandboxed pages
  // where ::global CSS from content scripts is ignored
  $effect(() => {
    const bg = theme.current === "dark" ? "#1e1e1e" : "#ffffff";
    const color = theme.current === "dark" ? "#d4d4d4" : "#24292f";
    document.body.style.cssText = `margin:0;padding:0;background-color:${bg};color:${color};`;

    document.body.setAttribute("data-theme", theme.current);
  });
</script>

<button
  class="theme-toggle"
  onclick={() => theme.toggle()}
  aria-label={theme.current === "dark"
    ? "Switch to light mode"
    : "Switch to dark mode"}
>
  {#if theme.current === "dark"}
    <!-- Sun icon -->
    <Sun width="16" height="16" aria-hidden="true" />
  {:else}
    <!-- Moon icon -->
    <Moon width="16" height="16" aria-hidden="true" />
  {/if}
</button>

<style>
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

  button {
    padding: 0.3em 0.7em;
    border: none;
    border-radius: 4px;
    background-color: var(--btn-bg);
    color: var(--btn-text);
    cursor: pointer;
    font-size: 0.85em;
  }
</style>
