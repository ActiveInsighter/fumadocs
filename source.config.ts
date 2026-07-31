import { remarkMdxFiles, remarkMdxMermaid } from 'fumadocs-core/mdx-plugins';
import { remarkSteps } from 'fumadocs-core/mdx-plugins/remark-steps';
import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import lastModified from 'fumadocs-mdx/plugins/last-modified';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import normalizeMathUnicode from './src/rehype/normalize-math-unicode';
import stripRegisteredComponentImports from './src/remark/strip-registered-component-imports';

const katexOptions = {
  // The question bank contains many formulas. HTML-only output avoids
  // generating a second MathML tree for every expression during builds.
  output: 'html' as const,
  strict: (errorCode: string) =>
    errorCode === 'unicodeTextInMathMode' ? 'ignore' : 'warn',
};

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    // Keep frontmatter and the page tree lightweight, then compile each MDX
    // page only when Next.js renders that route. This avoids one enormous
    // Webpack graph containing the complete question bank.
    dynamic: true,
    postprocess: {
      extractLinkReferences: true,
      includeProcessedMarkdown: false,
    },
  },
});

export default defineConfig({
  plugins: [lastModified()],
  mdxOptions: {
    remarkPlugins: [
      stripRegisteredComponentImports,
      remarkMath,
      remarkSteps,
      remarkMdxFiles,
      remarkMdxMermaid,
    ],
    remarkNpmOptions: {
      persist: {
        id: 'package-manager',
      },
    },
    rehypePlugins: (plugins) => [
      normalizeMathUnicode,
      [rehypeKatex, katexOptions],
      ...plugins,
    ],
  },
});
