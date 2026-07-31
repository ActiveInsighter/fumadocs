import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  experimental: {
    // Recommended by Next.js for large production builds. This trades a small
    // amount of compilation speed for a lower peak Webpack heap.
    webpackMemoryOptimizations: true,
    // Fumadocs augments the Webpack config, so force the build worker back on
    // to isolate compilation memory from the main Next.js process.
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
