import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import { defineConfig } from 'fumadocs-mdx/config';
import lastModified from 'fumadocs-mdx/plugins/last-modified';

export default defineConfig({
  plugins: [lastModified()],
  mdxOptions: {
    remarkPlugins: [remarkMath],
    // Keep legacy/local and remote image URLs untouched. The default image plugin
    // probes remote files and resolves root-relative paths at build time, which
    // makes this large imported study collection dependent on external assets.
    remarkImageOptions: false,
    // Render math before Fumadocs sends remaining code blocks to Shiki.
    rehypePlugins: (plugins) => [rehypeKatex, ...plugins],
  },
});
