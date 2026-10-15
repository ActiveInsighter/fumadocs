// Paste this configuration into the Algolia DocSearch Crawler editor.
// Replace the three credential placeholders after DocSearch approval.
// If a custom domain is connected, replace the Cloudflare Pages URL below.

const siteUrl = 'https://fumadocs.pages.dev';
const indexName = 'YOUR_INDEX_NAME';

new Crawler({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_CRAWLER_API_KEY',
  startUrls: [`${siteUrl}/docs`],
  renderJavaScript: false,
  actions: [
    {
      indexName,
      pathsToMatch: [`${siteUrl}/docs/**`],
      recordExtractor: ({ helpers }) => {
        return helpers.docsearch({
          recordProps: {
            lvl0: {
              selectors: '',
              defaultValue: '题库文档',
            },
            lvl1: '.DocSearch-content h1',
            lvl2: '.DocSearch-content h2',
            lvl3: '.DocSearch-content h3',
            lvl4: '.DocSearch-content h4',
            lvl5: '.DocSearch-content h5',
            lvl6: '.DocSearch-content h6',
            content: '.DocSearch-content p, .DocSearch-content li',
          },
          aggregateContent: true,
          recordVersion: 'v3',
        });
      },
    },
  ],
  initialIndexSettings: {
    [indexName]: {
      attributesForFaceting: ['type', 'lang', 'version'],
      attributesToRetrieve: [
        'hierarchy',
        'content',
        'anchor',
        'url',
        'url_without_anchor',
        'type',
        'lang',
        'version',
      ],
      attributesToHighlight: ['hierarchy', 'content'],
      attributesToSnippet: ['content:24'],
      camelCaseAttributes: ['hierarchy', 'content'],
      searchableAttributes: [
        'unordered(hierarchy.lvl0)',
        'unordered(hierarchy.lvl1)',
        'unordered(hierarchy.lvl2)',
        'unordered(hierarchy.lvl3)',
        'unordered(hierarchy.lvl4)',
        'unordered(hierarchy.lvl5)',
        'unordered(hierarchy.lvl6)',
        'content',
      ],
      distinct: true,
      attributeForDistinct: 'url',
      customRanking: [
        'desc(weight.pageRank)',
        'desc(weight.level)',
        'asc(weight.position)',
      ],
      ranking: [
        'words',
        'filters',
        'typo',
        'attribute',
        'proximity',
        'exact',
        'custom',
      ],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
      minWordSizefor1Typo: 3,
      minWordSizefor2Typos: 7,
      allowTyposOnNumericTokens: false,
      minProximity: 1,
      ignorePlurals: true,
      advancedSyntax: true,
      attributeCriteriaComputedByMinProximity: true,
      removeWordsIfNoResults: 'allOptional',
      separatorsToIndex: '_',
    },
  },
});
