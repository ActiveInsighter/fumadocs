import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { getMDXComponents } from '@/components/mdx';
import { getPageByRouteSlugs, getPageMarkdownUrl, source } from '@/lib/source';
import { gitConfig } from '@/lib/shared';

type PageProps = {
  params: Promise<{ slug?: string[] }>;
};

type StaticParam = ReturnType<typeof source.generateParams>[number];

// Linux filesystems allow at most 255 bytes in one filename. Vercel appends
// `.rsc.prerender-fallback.rsc` to a prerendered route's final segment, while
// non-ASCII slugs expand substantially after URL encoding. Keep a small safety
// margin and let oversized routes use Next.js on-demand static generation.
const MAX_PRERENDER_DIRECTORY_SEGMENT_LENGTH = 240;
const MAX_PRERENDER_FINAL_SEGMENT_LENGTH = 220;

function getEncodedSegmentLength(segment: string) {
  try {
    return encodeURIComponent(decodeURIComponent(segment).normalize('NFC')).length;
  } catch {
    return encodeURIComponent(segment.normalize('NFC')).length;
  }
}

function isSafePrerenderParam(param: StaticParam) {
  const segments = param.slug ?? [];

  return segments.every((segment, index) => {
    const isFinalSegment = index === segments.length - 1;
    const limit = isFinalSegment
      ? MAX_PRERENDER_FINAL_SEGMENT_LENGTH
      : MAX_PRERENDER_DIRECTORY_SEGMENT_LENGTH;

    return getEncodedSegmentLength(segment) <= limit;
  });
}

// Documents selected by generateStaticParams are prerendered during deployment.
// Longer routes remain valid and are generated on demand, then cached by Next.js.
export const revalidate = false;
export const dynamicParams = true;

export default async function Page({ params }: PageProps) {
  const page = getPageByRouteSlugs((await params).slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const toc = page.data.toc;
  const markdownUrl = getPageMarkdownUrl(page);
  const githubUrl = `https://github.com/${gitConfig.owner}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${page.path}`;

  return (
    <DocsPage toc={toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>

      <div className="flex flex-row items-center gap-2 border-b pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover markdownUrl={markdownUrl} githubUrl={githubUrl} />
      </div>

      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = getPageByRouteSlugs((await params).slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}

export function generateStaticParams() {
  const params = source.generateParams();
  const safeParams = params.filter(isSafePrerenderParam);
  const deferredCount = params.length - safeParams.length;

  if (deferredCount > 0) {
    console.log(
      `[docs] deferring ${deferredCount} oversized route${deferredCount === 1 ? '' : 's'} to on-demand static generation`,
    );
  }

  return safeParams;
}
