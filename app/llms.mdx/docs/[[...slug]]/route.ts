import { getLLMText } from '@/lib/get-llm-text';
import { source } from '@/lib/source';

type RouteProps = {
  params: Promise<{ slug?: string[] }>;
};

// Do not generate a second static route for every document during deployment.
// Raw MDX is inexpensive to read and the Vercel CDN caches the response.
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: RouteProps) {
  const page = source.getPage((await params).slug);

  if (!page) {
    return new Response('Not Found', { status: 404 });
  }

  return new Response(await getLLMText(page), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
