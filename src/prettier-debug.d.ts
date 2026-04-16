declare module "prettier/standalone" {
  export function format(
    source: string,
    options?: import("prettier").Options,
  ): Promise<string>;

  export const __debug: {
    parse(
      text: string,
      options: import("prettier").Options & { plugins: Array<any> },
    ): Promise<{ text: string; ast: any }>;
  };
}
