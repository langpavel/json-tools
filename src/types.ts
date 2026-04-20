export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

export type DisplayMode = "raw" | "prettier" | "editor";

export type { Operations, MessageType } from "./background/index";
