import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        content: "src/content/index.ts",
        background: "src/background/index.ts",
        page: "src/page/index.ts",
      },
      output: {
        format: "module",
        entryFileNames: "[name].js",
      },
    },
    minify: "oxc",
    chunkSizeWarningLimit: 1000,
  },
});
