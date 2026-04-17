<script lang="ts">
  import { ThemeManager } from "./theme.svelte";

  const theme = new ThemeManager();

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
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="3.5" stroke="currentColor" stroke-width="1.5" />
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
