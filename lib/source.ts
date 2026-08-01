import { docs } from 'collections/dynamic';
import { loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
});

type SourcePage = (typeof source)['$inferPage'];

function normalizeSlugSegment(segment: string) {
  try {
    return decodeURI(segment).normalize('NFC');
  } catch {
    // Keep malformed URI segments stable so they fail as a normal 404 instead
    // of throwing while resolving a route.
    return segment.normalize('NFC');
  }
}

function createSlugKey(slugs: string[] | undefined) {
  return JSON.stringify((slugs ?? []).map(normalizeSlugSegment));
}

// Fumadocs generates non-ASCII slugs with encodeURI(), while Next.js route
// params can arrive decoded. Index pages by a normalized representation so
// both `/docs/%E5%9B%BE%E8%AE%BA/...` and `/docs/图论/...` resolve identically.
const pagesByNormalizedSlug = new Map<string, SourcePage>();

for (const page of source.getPages()) {
  const key = createSlugKey(page.slugs);
  const existing = pagesByNormalizedSlug.get(key);

  if (existing && existing.path !== page.path) {
    throw new Error(
      `Duplicate document slug after URI normalization: ${existing.path} and ${page.path}`,
    );
  }

  pagesByNormalizedSlug.set(key, page);
}

export function getPageByRouteSlugs(slugs?: string[]) {
  return pagesByNormalizedSlug.get(createSlugKey(slugs));
}

export function getPageMarkdownUrl(page: SourcePage) {
  const suffix = page.slugs.length === 0 ? '' : `/${page.slugs.join('/')}`;

  return `/llms.mdx/docs${suffix}`;
}
