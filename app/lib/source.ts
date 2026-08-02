import { loader } from 'fumadocs-core/source';
import { defineDocs } from 'fumadocs-mdx/macro';
import { getCustomContentSlugs } from './content-slugs';
import { docsContentRoute, docsRoute } from './shared';

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    async: true,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
});

export const source = loader({
  source: docs.toFumadocsSource(),
  baseUrl: docsRoute,
  slugs: (file) => getCustomContentSlugs(file.path),
});

/**
 * React Router exposes wildcard params as decoded path segments, while
 * Fumadocs stores generated slugs in their URI-encoded form. Normalize route
 * params back to the representation used by the source index before lookup.
 */
export function getRouteSlugs(path?: string): string[] {
  return (
    path
      ?.split('/')
      .filter((value) => value.length > 0)
      .map((value) => {
        try {
          return encodeURI(decodeURI(value));
        } catch {
          return encodeURI(value);
        }
      }) ?? []
  );
}

export function getPageMarkdownUrl(page: (typeof source)['$inferPage']) {
  const segments = [...page.slugs, 'content.md'];

  return {
    segments,
    url:
      '/' +
      [page.locale, ...docsContentRoute.split('/'), ...segments]
        .filter(Boolean)
        .join('/'),
  };
}

export async function getLLMText(page: (typeof source)['$inferPage']) {
  const processed = await page.data.getText('processed');

  return `# ${page.data.title} (${page.url})\n\n${processed}`;
}
