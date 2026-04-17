// vite.config.ts
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { ENTRIES, type Entry } from "./scripts/entries";

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";
  const entry = (process.env.ENTRY ?? ENTRIES[0]) as Entry;

  return {
    appType: "custom",
    plugins: [svelte({ compilerOptions: { dev: isDev } })],
    build: {
      outDir: "dist",
      emptyOutDir: entry === ENTRIES[0] && !isDev, // Only empty on the first entry in production build
      rollupOptions: {
        input: { [entry]: `src/${entry}/index.ts` },
        output: {
          format: "iife",
          entryFileNames: "[name].js",
        },
      },
      minify: isDev ? false : "oxc",
      sourcemap: isDev ? "inline" : false,
      chunkSizeWarningLimit: 3000,
    },
  };
});
