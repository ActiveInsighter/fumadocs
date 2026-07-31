import { getLLMText } from '@/lib/get-llm-text';
import { source } from '@/lib/source';

type RouteProps = {
  params: Promise<{ slug?: string[] }>;
};

export const revalidate = false;

export async function GET(_request: Request, { params }: RouteProps) {
  const page = source.getPage((await params).slug);

  if (!page) {
    return new Response('Not Found', { status: 404 });
  }

  return new Response(await getLLMText(page), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}

export function generateStaticParams() {
  return source.generateParams();
}
