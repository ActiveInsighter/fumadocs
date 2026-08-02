# Fumadocs + React Router + Vite

A Fumadocs site based on React Router framework mode and Vite.

## Development

```bash
pnpm install
pnpm dev
```

Write documentation in `content/docs`.

## Static build

The site uses React Router SPA mode with full prerendering. The production output is generated in `build/client`:

```bash
pnpm types:check
pnpm build
```

Search is hosted by Algolia DocSearch. The static build does not generate or serialize a local search index and does not prerender an `/api/search` resource route.

## Algolia DocSearch

This public technical documentation site can apply for the free Algolia DocSearch program. Algolia crawls the deployed HTML and maintains the hosted index, while the browser queries it with a public search-only key.

1. Deploy the site and apply for DocSearch using the production documentation URL.
2. After approval, open the Algolia Crawler editor and adapt `docsearch.config.js`.
3. If the site uses a custom domain, replace `https://fumadocs.pages.dev` in that crawler configuration.
4. Run a test crawl and inspect the generated records.
5. Add these GitHub repository **Variables** under Settings → Secrets and variables → Actions:

   - `VITE_ALGOLIA_APP_ID`
   - `VITE_ALGOLIA_SEARCH_API_KEY`
   - `VITE_ALGOLIA_INDEX_NAME`

6. Re-run the workflow so Vite embeds the public search configuration in the static client.

For local development, the same values can be placed in `.env.local`.

Only use the restricted search-only key in `VITE_ALGOLIA_SEARCH_API_KEY`. Never expose the crawler key, write key, or Algolia admin key to Vite or browser code.

The documentation page wrapper includes the `DocSearch-content` class and DocSearch language/version metadata so the crawler can extract headings, paragraphs, and list items without JavaScript rendering.

## Cloudflare Pages

`.github/workflows/cloudflare-pages.yml` validates pull requests and deploys pushes to `main` to the `fumadocs` Pages project.

Required GitHub Actions secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Each workflow run records its current run ID and the ten most recent workflow runs in the job summary, uploaded artifacts, and the `Workflow run index` issue.
