import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  PageLastUpdate,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { getMDXComponents } from '@/components/mdx';
import { getPageMarkdownUrl, source } from '@/lib/source';
import { gitConfig } from '@/lib/shared';

type PageProps = {
  params: Promise<{ slug?: string[] }>;
};

// Fumadocs Dynamic Mode compiles the requested file with Node.js filesystem
// APIs. Keeping this route dynamic ensures Vercel emits a server trace that can
// include content/docs instead of treating the page as a fully static asset.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page({ params }: PageProps) {
  const page = source.getPage((await params).slug);
  if (!page) notFound();

  let loaded: Awaited<ReturnType<typeof page.data.load>>;
  try {
    loaded = await page.data.load();
  } catch (error) {
    console.error(`[docs] Failed to load dynamic MDX: ${page.path}`, error);
    throw error;
  }

  const { body: MDX, toc, lastModified } = loaded;
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

      {lastModified ? <PageLastUpdate date={lastModified} /> : null}
    </DocsPage>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = source.getPage((await params).slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
