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

export const dynamic = 'force-static';
export const revalidate = false;

export default async function Page({ params }: PageProps) {
  const page = source.getPage((await params).slug);
  if (!page) notFound();

  const { body: MDX, toc, lastModified } = await page.data.load();
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
