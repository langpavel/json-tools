import type { JSONValue } from "../../types";

export function detectJSON(): { data: JSONValue; rawData: string } | null {
  const pre = document.querySelector("body > pre");
  const isPlainBody =
    document.body.children.length === 1 && pre instanceof HTMLPreElement;
  const hasJSONContentType = (document.contentType || "").includes("json");

  if (!isPlainBody && !hasJSONContentType) return null;

  const rawData = (
    pre ? pre.textContent : document.body.textContent || ""
  )!.trim();
  if (!rawData) return null;

  try {
    const data = JSON.parse(rawData);
    if (data === null || typeof data !== "object") return null;
    return { data, rawData };
  } catch {
    return null;
  }
}
