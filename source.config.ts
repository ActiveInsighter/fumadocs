import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import { defineConfig } from 'fumadocs-mdx/config';
import lastModified from 'fumadocs-mdx/plugins/last-modified';

export default defineConfig({
  plugins: [lastModified()],
  mdxOptions: {
    remarkPlugins: [remarkMath],
    // Render math before Fumadocs sends remaining code blocks to Shiki.
    rehypePlugins: (plugins) => [rehypeKatex, ...plugins],
  },
});
