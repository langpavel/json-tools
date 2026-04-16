import { mount } from "svelte";

import App from "./lib/components/App.svelte";
import { detectJSON } from "./lib/detectJSON";

const isSandboxed = window.origin === "null";

function init(): void {
  const result = detectJSON();
  if (!result) return;

  const { data, rawData } = result;
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
    props: { data, rawData, isSandboxed },
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
  document.body.style = "margin:0;padding:0;";
}

init();
