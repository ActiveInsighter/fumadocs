# Fumadocs

A minimal Next.js documentation site using the default Fumadocs UI.

## Development

```bash
corepack enable
pnpm install
pnpm dev
```

Open `http://localhost:3000/docs`.

## Build

```bash
pnpm types:check
pnpm build
pnpm start
```

## Vercel

Import the repository with the Next.js preset, keep the root directory as `./`, and leave the output directory empty. Pushes to `main` are deployed automatically by the Vercel Git integration.
