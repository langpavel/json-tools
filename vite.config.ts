// vite.config.ts
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { defineConfig, type Plugin } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { ENTRIES, type Entry } from "./scripts/entries";

// Chrome's content-script loader rejects files containing literal U+FFFE or
// U+FFFF bytes with the misleading error "It isn't UTF-8 encoded." The bytes
// are valid UTF-8 — Chrome specifically blocks these Unicode non-characters.
// CodeMirror's regex character classes embed U+FFFF.
//
// Why writeBundle (not renderChunk): Vite's esbuild minify step runs AFTER
// rollup's renderChunk hook but BEFORE files are flushed, so any escape we
// do in renderChunk is undone by minify. writeBundle runs last, patching
// files on disk. rolldown's `output.charset: "ascii"` is silently ignored
// in Vite 8, otherwise we'd use it.
// See docs/gotchas.md.
function escapeChromeRejectedChars(outDir: string): Plugin {
  return {
    name: "escape-chrome-rejected-chars",
    writeBundle(_options, bundle) {
      for (const fileName of Object.keys(bundle)) {
        if (!fileName.endsWith(".js")) continue;
        const path = join(outDir, fileName);
        const source = readFileSync(path, "utf8");
        if (!/[￾￿]/.test(source)) continue;
        const patched = source
          .replace(/￾/g, "\\uFFFE")
          .replace(/￿/g, "\\uFFFF");
        writeFileSync(path, patched, "utf8");
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";
  const entry = (process.env.ENTRY ?? ENTRIES[0]) as Entry;

  return {
    appType: "custom",
    plugins: [
      svelte({ compilerOptions: { dev: isDev } }),
      escapeChromeRejectedChars("dist"),
    ],
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
      minify: isDev ? false : "esbuild",
      sourcemap: isDev ? "inline" : false,
      chunkSizeWarningLimit: 3000,
    },
  };
});
