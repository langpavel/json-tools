import type { JSONValue } from "../types";

export const analyzeJson = async (data: JSONValue) => {
  return {
    keyNames: new Set(),
  };
};
