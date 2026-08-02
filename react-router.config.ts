import type { Config } from '@react-router/dev/config';
import { glob } from 'node:fs/promises';
import { createGetUrl, getSlugs } from 'fumadocs-core/source';

const getUrl = createGetUrl('/docs');

function toPrerenderPath(path: string): string {
  // React Router decodes request pathnames before checking the prerender allowlist.
  // Fumadocs encodes non-ASCII slug segments, so normalize both sides to decoded paths.
  return decodeURI(path);
}

export default {
  ssr: false,
  async prerender({ getStaticPaths }) {
    const paths = new Set(getStaticPaths().map(toPrerenderPath));

    for await (const entry of glob('**/*.mdx', { cwd: 'content/docs' })) {
      const slugs = getSlugs(entry);
      paths.add(toPrerenderPath(getUrl(slugs)));
      paths.add(
        toPrerenderPath(`/llms.mdx/docs/${[...slugs, 'content.md'].join('/')}`),
      );
    }

    return [...paths];
  },
} satisfies Config;
