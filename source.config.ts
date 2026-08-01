import { defineConfig, defineDocs } from 'fumadocs-mdx/config';

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    // Match the official Fumadocs docs architecture: compile content with the
    // faster Sätteri compiler and expose async imports to the server bundle.
    // Every page is prerendered below, so visitors never compile MDX at runtime.
    compiler: 'satteri',
    async: true,
    satteriOptions: {
      features: {
        math: true,
      },
      // Most algorithm illustrations are hosted by third-party sites. Do not
      // download every remote image during compilation just to discover its
      // dimensions; the browser loads them lazily instead.
      remarkImageOptions: {
        external: false,
      },
      remarkNpmOptions: {
        persist: {
          id: 'package-manager',
        },
      },
    },
  },
});

export default defineConfig({
  compiler: 'satteri',
});
