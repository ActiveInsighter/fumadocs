import type { Config } from '@react-router/dev/config';
import { glob } from 'node:fs/promises';
import { createGetUrl, getSlugs } from 'fumadocs-core/source';

const getUrl = createGetUrl('/docs');

export default {
  ssr: false,
  async prerender({ getStaticPaths }) {
    const paths = new Set(getStaticPaths());

    paths.add('/api/search');

    for await (const entry of glob('**/*.mdx', { cwd: 'content/docs' })) {
      paths.add(getUrl(getSlugs(entry)));
    }

    return [...paths];
  },
} satisfies Config;
