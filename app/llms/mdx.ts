import type { Route } from './+types/mdx';
import { getLLMText, getRouteSlugs, source } from '@/lib/source';

export async function loader({ params }: Route.LoaderArgs) {
  const slugs = getRouteSlugs(params['*']);

  // Every generated Markdown resource ends with /content.md.
  slugs.pop();

  const page = source.getPage(slugs);
  if (!page) return new Response('Not found', { status: 404 });

  return new Response(await getLLMText(page), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}
