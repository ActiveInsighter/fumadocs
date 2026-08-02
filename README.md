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

Search indexes are prerendered at `/api/search` and queried in the browser, so the deployed site does not require a Node.js server.

## Cloudflare Pages

`.github/workflows/cloudflare-pages.yml` validates pull requests and deploys pushes to `main` to the `fumadocs` Pages project.

Required GitHub Actions secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Each workflow run records its current run ID and the ten most recent workflow runs in the job summary, uploaded artifacts, and the `Workflow run index` issue.
