/** @type {import("@sveltejs/vite-plugin-svelte").SvelteConfig} */
export default {
  compilerOptions: {
    dev: true,
    css: "injected",
    experimental: {
      async: true,
    },
  },
};
