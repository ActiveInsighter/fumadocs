import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import { defineConfig } from 'fumadocs-mdx/config';

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkMath],
    // Render math before Fumadocs sends remaining code blocks to Shiki.
    rehypePlugins: (plugins) => [rehypeKatex, ...plugins],
  },
});
