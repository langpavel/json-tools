import { analyzeJson } from "./analyzeJson";
import { formatByJsonStringify } from "./formatByJsonStringify";
import { formatByPrettier } from "./formatByPrettier";

export type Operations = typeof operations;
export type MessageType = keyof Operations;
export type OperationResult<T extends MessageType = MessageType> = Awaited<
  ReturnType<Operations[T]>
>;
export type OperationPayload<T extends MessageType = MessageType> = Parameters<
  Operations[T]
>[0];

const operations = {
  FORMAT_PRETTIER: formatByPrettier,
  FORMAT_JSON: formatByJsonStringify,
  ANALYZE_JSON: analyzeJson,
  TEST_ERROR: async () => {
    throw new Error("This is a test error from the background script.");
  },
} as const satisfies Record<string, (payload: any) => Promise<any>>;

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const operation = operations[message.type as MessageType];
  if (!operation) {
    return;
  }
  const operationPromise: Promise<any> = operation(message.payload);

  operationPromise
    .then((result) => sendResponse({ result }))
    .catch((err) => {
      sendResponse({ error: String(err) });
    });

  // Returning true keeps the message channel open for async sendResponse
  return true;
});

chrome.runtime.onInstalled.addListener(() => {
  console.log(
    "[JSON Tools] Extension installed and background script initialized.",
  );
});
