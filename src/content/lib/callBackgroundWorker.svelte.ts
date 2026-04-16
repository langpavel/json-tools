import type {
  MessageType,
  OperationResult,
  OperationPayload,
} from "../../background/index";

export async function callBackgroundWorker<T extends MessageType>(
  type: T,
  payload: OperationPayload<T>,
) {
  $inspect.trace("callBackgroundWorker");

  const result: { result: OperationResult<T> } | { error: string } =
    await chrome.runtime.sendMessage({ type, payload });

  if ("error" in result) {
    throw new Error(result.error);
  }
  return result.result;
}
