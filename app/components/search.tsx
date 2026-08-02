'use client';

import type { SortedResult } from 'fumadocs-core/search';
import { useDocsSearch, type SearchClient } from 'fumadocs-core/search/client';
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogFooter,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SharedProps,
} from 'fumadocs-ui/components/dialog/search';

const hierarchyLevels = [
  'lvl0',
  'lvl1',
  'lvl2',
  'lvl3',
  'lvl4',
  'lvl5',
  'lvl6',
] as const;

type HierarchyLevel = (typeof hierarchyLevels)[number];

type HighlightValue = {
  value?: string;
};

type DocSearchHit = {
  objectID: string;
  url: string;
  url_without_anchor?: string;
  anchor?: string;
  type?: string;
  content?: string | null;
  hierarchy?: Partial<Record<HierarchyLevel, string | null>>;
  _highlightResult?: {
    content?: HighlightValue;
    hierarchy?: Partial<Record<HierarchyLevel, HighlightValue | HighlightValue[]>>;
  };
  _snippetResult?: {
    content?: HighlightValue;
  };
};

type AlgoliaSearchResponse = {
  hits?: DocSearchHit[];
  message?: string;
};

type AlgoliaConfig = {
  appId: string;
  apiKey: string;
  indexName: string;
};

const algoliaConfig: AlgoliaConfig = {
  appId: import.meta.env.VITE_ALGOLIA_APP_ID?.trim() ?? '',
  apiKey: import.meta.env.VITE_ALGOLIA_SEARCH_API_KEY?.trim() ?? '',
  indexName: import.meta.env.VITE_ALGOLIA_INDEX_NAME?.trim() ?? '',
};

const isAlgoliaConfigured = Object.values(algoliaConfig).every(
  (value) => value.length > 0,
);

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function sanitizeHighlight(value?: string | null): string {
  if (!value) return '';

  return value
    .replace(/<em>/giu, '<mark>')
    .replace(/<\/em>/giu, '</mark>')
    .replace(/<(?!\/?mark(?:\s|>))[^>]*>/giu, '');
}

function getHighlightValue(
  hit: DocSearchHit,
  level: HierarchyLevel,
): string {
  const highlighted = hit._highlightResult?.hierarchy?.[level];
  const first = Array.isArray(highlighted) ? highlighted[0] : highlighted;

  return (
    sanitizeHighlight(first?.value) ||
    escapeHtml(hit.hierarchy?.[level]?.trim() ?? '')
  );
}

function getRawHierarchy(hit: DocSearchHit, level: HierarchyLevel): string {
  return hit.hierarchy?.[level]?.trim() ?? '';
}

function getPageTitleLevel(hit: DocSearchHit): HierarchyLevel | undefined {
  if (getRawHierarchy(hit, 'lvl1')) return 'lvl1';
  return hierarchyLevels.find((level) => getRawHierarchy(hit, level));
}

function getDeepestLevel(hit: DocSearchHit): HierarchyLevel | undefined {
  return [...hierarchyLevels]
    .reverse()
    .find((level) => getRawHierarchy(hit, level));
}

function getPageBreadcrumbs(
  hit: DocSearchHit,
  titleLevel: HierarchyLevel,
): string[] | undefined {
  const titleIndex = hierarchyLevels.indexOf(titleLevel);
  const breadcrumbs = hierarchyLevels
    .slice(0, titleIndex)
    .map((level) => getHighlightValue(hit, level))
    .filter((value, index, values) => value && values.indexOf(value) === index);

  return breadcrumbs.length > 0 ? breadcrumbs : undefined;
}

function mapHitsToResults(hits: DocSearchHit[]): SortedResult[] {
  const results: SortedResult[] = [];
  const pages = new Set<string>();

  for (const hit of hits) {
    const pageUrl = hit.url_without_anchor || hit.url.split('#', 1)[0];
    const titleLevel = getPageTitleLevel(hit);
    const deepestLevel = getDeepestLevel(hit);
    const pageTitle = titleLevel
      ? getHighlightValue(hit, titleLevel)
      : escapeHtml(pageUrl);

    if (!pages.has(pageUrl)) {
      pages.add(pageUrl);
      results.push({
        id: `page:${pageUrl}`,
        type: 'page',
        url: pageUrl,
        content: pageTitle,
        breadcrumbs: titleLevel
          ? getPageBreadcrumbs(hit, titleLevel)
          : undefined,
      });
    }

    const snippet =
      sanitizeHighlight(hit._snippetResult?.content?.value) ||
      sanitizeHighlight(hit._highlightResult?.content?.value) ||
      escapeHtml(hit.content?.trim() ?? '');
    const heading = deepestLevel
      ? getHighlightValue(hit, deepestLevel)
      : '';
    const content = snippet || heading;

    if (!content || (content === pageTitle && hit.url === pageUrl)) continue;

    results.push({
      id: hit.objectID,
      type: hit.type === 'content' || snippet ? 'text' : 'heading',
      url: hit.url,
      content,
    });
  }

  return results;
}

function createAlgoliaDocSearchClient(config: AlgoliaConfig): SearchClient {
  return {
    deps: [config.appId, config.apiKey, config.indexName],
    async search(query) {
      const normalizedQuery = query.trim();
      if (!normalizedQuery) return [];

      const response = await fetch(
        `https://${config.appId}-dsn.algolia.net/1/indexes/${encodeURIComponent(config.indexName)}/query`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-algolia-application-id': config.appId,
            'x-algolia-api-key': config.apiKey,
          },
          body: JSON.stringify({
            query: normalizedQuery,
            hitsPerPage: 20,
            distinct: true,
            attributesToRetrieve: [
              'hierarchy',
              'content',
              'anchor',
              'url',
              'url_without_anchor',
              'type',
            ],
            attributesToHighlight: ['hierarchy', 'content'],
            attributesToSnippet: ['content:24'],
            highlightPreTag: '<mark>',
            highlightPostTag: '</mark>',
          }),
        },
      );

      const data = (await response.json()) as AlgoliaSearchResponse;
      if (!response.ok) {
        throw new Error(data.message || `Algolia search failed (${response.status})`);
      }

      return mapHitsToResults(data.hits ?? []);
    },
  };
}

const searchClient: SearchClient = isAlgoliaConfigured
  ? createAlgoliaDocSearchClient(algoliaConfig)
  : {
      deps: ['algolia-not-configured'],
      async search() {
        return [];
      },
    };

export default function AlgoliaSearchDialog(props: SharedProps) {
  const { search, setSearch, query } = useDocsSearch({ client: searchClient });
  const emptyMessage = !isAlgoliaConfigured
    ? 'Algolia DocSearch 尚未配置。请先添加公开的搜索凭据。'
    : query.error
      ? '搜索服务暂时不可用，请稍后重试。'
      : '没有找到匹配的内容。';

  return (
    <SearchDialog
      search={search}
      onSearchChange={setSearch}
      isLoading={query.isLoading}
      {...props}
    >
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList
          items={query.data !== 'empty' ? query.data : null}
          Empty={() => (
            <div className="px-6 py-12 text-center text-sm text-fd-muted-foreground">
              {emptyMessage}
            </div>
          )}
        />
        <SearchDialogFooter>
          {isAlgoliaConfigured && (
            <a
              href="https://www.algolia.com/"
              target="_blank"
              rel="noreferrer noopener"
              className="ms-auto text-xs text-fd-muted-foreground hover:text-fd-foreground"
            >
              Search by Algolia
            </a>
          )}
        </SearchDialogFooter>
      </SearchDialogContent>
    </SearchDialog>
  );
}
