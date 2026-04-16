import type { Options } from "prettier";

import * as pluginBabel from "prettier/plugins/babel";
import * as pluginEstree from "prettier/plugins/estree";
import { __debug } from "prettier/standalone";

export type { Options as PrettierOptions } from "prettier";

export const parseByPrettier = async (payload: {
  text: string;
  options: Options;
}) => {
  return __debug.parse(payload.text, {
    ...payload.options,
    plugins: [pluginBabel, pluginEstree],
  });
};
