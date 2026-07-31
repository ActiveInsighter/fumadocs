import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  // Dynamic MDX compilation loads Shiki at runtime. Keeping it external avoids
  // bundling every grammar and theme into the Next.js server compilation.
  serverExternalPackages: ['shiki'],
  experimental: {
    webpackMemoryOptimizations: true,
    webpackBuildWorker: true,
    serverSourceMaps: false,
  },
  async rewrites() {
    return [
      {
        source: '/docs/:path*.md',
        destination: '/llms.mdx/docs/:path*',
      },
    ];
  },
};

export default withMDX(config);
