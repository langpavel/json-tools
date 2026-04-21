import { mount } from "svelte";

import App from "./lib/components/App.svelte";
import { detectJSON } from "./lib/detectJSON";
import { readStoredTheme } from "./lib/theme/theme.svelte";

const isSandboxed = window.origin === "null";

async function init(): Promise<void> {
  const result = detectJSON();
  if (!result) return;

  const { data, rawData } = result;

  // Read theme before mount to prevent flash
  const initialTheme: "light" | "dark" = await readStoredTheme();

  // Apply body styles immediately to prevent flash
  const bg = initialTheme === "dark" ? "#1e1e1e" : "#ffffff";
  const color = initialTheme === "dark" ? "#d4d4d4" : "#24292f";
  document.body.style.cssText = `margin:0;padding:0;background-color:${bg};color:${color};`;

  const body = window.document.body;

  // Preserve the browser-native <pre> that Chrome wraps JSON responses in.
  // Keeping it alive means Raw mode costs zero JS rendering work, which is
  // the whole point — the tab stays responsive on pathologically large
  // payloads. `null` when Chrome didn't use a <pre> (e.g. Content-Type-only
  // detection or sandboxed origins); in that case App.svelte renders a
  // Svelte-owned <pre> fallback.
  const nativePre = body.querySelector<HTMLPreElement>(":scope > pre");

  // Remove every body child except nativePre, including stray text nodes.
  for (const child of Array.from(body.childNodes)) {
    if (child !== nativePre) body.removeChild(child);
  }

  // Svelte mount target goes first so the header renders above the native
  // pre if they're still siblings when the first frame paints, before the
  // reparent effect in App.svelte fires.
  const appElement = document.createElement("div");
  body.insertBefore(appElement, body.firstChild);

  const dataElement = document.createElement("script");
  dataElement.setAttribute("type", "application/json");
  dataElement.setAttribute("id", "json-data");
  dataElement.textContent = rawData;
  body.appendChild(dataElement);

  mount(App, {
    target: appElement,
    props: { data, rawData, nativePre, isSandboxed, initialTheme },
  });

  if (!isSandboxed) {
    const exposeDataScript = document.createElement("script");
    exposeDataScript.type = "module";
    exposeDataScript.src = chrome.runtime.getURL("page.js");
    body.appendChild(exposeDataScript);
  } else {
    console.log(
      "%c[JSON Tools] %cSandboxed",
      "color: #f0c674; font-weight: bold",
      "color: #ff6666; font-weight: bold",
    );
  }
}

init();
