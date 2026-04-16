import { mount } from "svelte";

import App from "./lib/components/App.svelte";
import { detectJSON } from "./lib/detectJSON";
import { readStoredTheme } from "./lib/theme.svelte";

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
  body.innerHTML = "";

  const dataElement = document.createElement("script");
  dataElement.setAttribute("type", "application/json");
  dataElement.setAttribute("id", "json-data");
  dataElement.textContent = rawData;
  body.appendChild(dataElement);

  const appElement = document.createElement("div");
  body.appendChild(appElement);

  mount(App, {
    target: appElement,
    props: { data, rawData, isSandboxed, initialTheme },
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
