export type Theme = "light" | "dark";

const STORAGE_KEY = "json-tools-theme";

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

export async function readStoredTheme(): Promise<Theme> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const stored = result[STORAGE_KEY];
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // storage unavailable (e.g. sandboxed context)
  }
  return getSystemTheme();
}

export class ThemeManager {
  current = $state<Theme>(getSystemTheme());

  toggle = () => {
    this.current = this.current === "dark" ? "light" : "dark";
    try {
      chrome.storage.local.set({ [STORAGE_KEY]: this.current });
    } catch {
      // storage unavailable
    }
  };

  constructor() {
    readStoredTheme().then((stored) => {
      if (stored !== this.current) {
        this.current = stored;
      }
    });

    const mql = window.matchMedia("(prefers-color-scheme: light)");
    mql.addEventListener("change", async () => {
      this.current = await readStoredTheme();
    });
  }
}

/**
 * Shared instance used by every consumer in the content script (header button,
 * editor, body-style $effect). Using one instance avoids multiple MQL
 * listeners and keeps reactive state in sync across components.
 */
export const themeManager = new ThemeManager();
