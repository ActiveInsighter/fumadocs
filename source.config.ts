import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import stripProvidedComponentImports from './src/remark/strip-provided-component-imports';

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    // Turbopack does not lazy-bundle async MDX imports. Dynamic mode keeps
    // frontmatter in the generated collection and compiles the requested page
    // at runtime instead of adding every document body to the build graph.
    dynamic: true,
  },
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
