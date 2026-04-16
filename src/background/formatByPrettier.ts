import type { Options } from "prettier";

import * as pluginBabel from "prettier/plugins/babel";
import * as pluginEstree from "prettier/plugins/estree";
import { format } from "prettier/standalone";

export type { Options as PrettierOptions } from "prettier";

export const formatByPrettier = async (payload: {
  text: string;
  options: Options;
}) => {
  return format(payload.text, {
    ...payload.options,
    plugins: [pluginBabel, pluginEstree],
  });
};
