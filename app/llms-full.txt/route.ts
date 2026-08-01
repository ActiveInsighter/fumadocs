import { getLLMText } from '@/lib/get-llm-text';
import { source } from '@/lib/source';

// Building this as one static asset loads every document during next build.
// Stream raw sources at request time instead and cache the response at the CDN.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET() {
  const pages = source.getPages();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for (let index = 0; index < pages.length; index += 1) {
          if (index > 0) {
            controller.enqueue(encoder.encode('\n\n---\n\n'));
          }

          controller.enqueue(encoder.encode(await getLLMText(pages[index])));
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
