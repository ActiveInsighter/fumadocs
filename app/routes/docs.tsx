import type { Route } from './+types/docs';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  PageLastUpdate,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import {
  docs,
  getPageMarkdownUrl,
  getRouteSlugs,
  source,
} from '@/lib/source';
import { baseOptions } from '@/lib/layout.shared';
import { gitConfig } from '@/lib/shared';
import { useFumadocsLoader } from 'fumadocs-core/source/client';
import { useMDXComponents } from '@/components/mdx';
import { use } from 'react';

export async function loader({ params }: Route.LoaderArgs) {
  const page = source.getPage(getRouteSlugs(params['*']));
  if (!page) throw new Response('Not found', { status: 404 });

  // The plugin adds this field at build time, while the current async macro
  // type does not merge plugin fields into DocData yet.
  const lastModified = (page.data as typeof page.data & { lastModified?: Date })
    .lastModified;

  return {
    path: page.path,
    markdownUrl: getPageMarkdownUrl(page).url,
    lastModified: lastModified?.toISOString(),
    pageTree: await source.serializePageTree(source.getPageTree()),
  };
}

function Content({
  path,
  markdownUrl,
  lastModified,
}: {
  path: string;
  markdownUrl: string;
  lastModified?: string;
}) {
  const page = docs.getPage(path);
  if (!page) throw new Error(`unknown page: ${path}`);

  const { toc } = use(page.load());
  const Mdx = page.body;
  const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${path}`;

  return (
    <DocsPage toc={toc} className="DocSearch-content">
      <title>{page.title}</title>
      <meta name="description" content={page.description} />
      <meta name="docsearch:language" content="zh-CN" />
      <meta name="docsearch:version" content="latest" />
      <DocsTitle>{page.title}</DocsTitle>
      <DocsDescription>{page.description}</DocsDescription>
      <div className="flex flex-row items-center gap-2 border-b -mt-4 pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover markdownUrl={markdownUrl} githubUrl={githubUrl} />
      </div>
      <DocsBody>
        <Mdx components={useMDXComponents()} />
      </DocsBody>
      {lastModified && <PageLastUpdate date={new Date(lastModified)} />}
    </DocsPage>
  );
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { path, markdownUrl, lastModified, pageTree } = useFumadocsLoader(loaderData);

  return (
    <DocsLayout {...baseOptions()} tree={pageTree} tabs={{}}>
      <Content
        path={path}
        markdownUrl={markdownUrl}
        lastModified={lastModified}
      />
    </DocsLayout>
  );
}
