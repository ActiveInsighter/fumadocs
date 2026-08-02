import { frontmatter } from 'fumadocs-core/content/md/frontmatter';
import { createSearchAPI } from 'fumadocs-core/search/server';
import { source } from '@/lib/source';

const server = createSearchAPI('simple', {
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

export async function loader() {
  return server.staticGET();
}
