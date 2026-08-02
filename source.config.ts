import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import stripProvidedComponentImports from './src/remark/strip-provided-component-imports';

export const docs = defineDocs({
  dir: 'content/docs',
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [stripProvidedComponentImports, remarkMath],
    remarkNpmOptions: {
      persist: {
        id: 'package-manager',
      },
    },
    rehypePlugins: (plugins) => [rehypeKatex, ...plugins],
  },
});
