export const ENTRIES = ["content", "background", "page"] as const;
export type Entry = (typeof ENTRIES)[number];
