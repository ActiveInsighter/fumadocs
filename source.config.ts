import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import { defineConfig } from 'fumadocs-mdx/config';
import lastModified from 'fumadocs-mdx/plugins/last-modified';

export default defineConfig({
  plugins: [lastModified()],
  mdxOptions: {
    remarkPlugins: [remarkMath],
    remarkImageOptions: {
      // Keep remote URLs unchanged and avoid network-bound image probing in CI.
      external: false,
      // Do not emit bundler imports for legacy relative image references.
      useImport: false,
      // Some imported study notes reference image files that are not in the repository.
      onError: 'hide',
    },
    // Render math before Fumadocs sends remaining code blocks to Shiki.
    rehypePlugins: (plugins) => [rehypeKatex, ...plugins],
  },
});
