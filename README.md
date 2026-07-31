# Fumadocs Studio

A standalone Next.js documentation site generated from the official Fumadocs CLI structure and selectively styled with Animate UI-inspired navigation, controls, and motion.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Fumadocs Core, MDX, and Base UI
- Motion
- Lucide React

## Development

```bash
corepack enable
pnpm install
pnpm dev
```

Open `http://localhost:3000` for the landing page and `http://localhost:3000/docs` for documentation.

## Commands

```bash
pnpm types:check
pnpm build
pnpm check
pnpm start
```

## Vercel deployment

Import the repository into Vercel with these settings:

- Framework Preset: `Next.js`
- Root Directory: `./`
- Build Command: use the detected default (`pnpm build`)
- Output Directory: leave empty and use the Next.js default
- Install Command: use the detected default
- Node.js Version: `24.x`
- Production Branch: `main`

The root `package.json` declares Next.js as a direct dependency, `vercel.json` explicitly selects the Next.js framework, and pushes to `main` are deployed automatically by the Vercel Git integration.

## Content

Write MDX documents in `content/docs` and control their sidebar order with `content/docs/meta.json`.

## Workflow Run IDs

The reusable `.github/actions/run-metadata` composite action captures the current Run ID, recent run status, workflow summary, artifacts, and the repository `Workflow run index` issue.

## Licensing

Fumadocs is MIT licensed. The visual layer is selectively inspired by Animate UI; see `THIRD_PARTY_LICENSES.md` before copying additional upstream files.
