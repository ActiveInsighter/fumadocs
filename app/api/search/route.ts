import { frontmatter } from 'fumadocs-core/content/md/frontmatter';
import { createSearchAPI } from 'fumadocs-core/search/server';
import { source } from '@/lib/source';

// createFromSource() asks every page for structuredData, which compiles every
// dynamic MDX document when the search server initializes. A lightweight raw
// Markdown index preserves search while keeping document compilation per-page.
const search = createSearchAPI('simple', {
  indexes: async () =>
    Promise.all(
      source.getPages().map(async (page) => {
        const raw = await page.data.getText('raw');
        const content = frontmatter(raw).content
          .replace(/^\s*import\s+[^\n]+;?\s*$/gmu, '')
          .replace(/^\s*export\s+[^\n]+;?\s*$/gmu, '');

        return {
          title: page.data.title,
          description: page.data.description,
          content,
          url: page.url,
        };
      }),
    ),
});

export const dynamic = 'force-dynamic';
export const { GET } = search;
