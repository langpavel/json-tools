import type {
  MessageType,
  OperationResult,
  OperationPayload,
} from "../../background/index";

import { stringify, parse } from "devalue";

export async function callBackgroundWorker<T extends MessageType>(
  type: T,
  payload: OperationPayload<T>,
) {
  const result: { result: string } | { error: string } =
    await chrome.runtime.sendMessage({ type, payload: stringify(payload) });

  if ("error" in result) {
    throw new Error(result.error);
  }
  return parse(result.result) as OperationResult<T>;
}
