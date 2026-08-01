import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Matches the official Fumadocs docs app. Dynamic MDX compilation loads
  // Shiki on the server, so keep its grammars and themes out of the main
  // Turbopack server bundle.
  serverExternalPackages: ['shiki'],
  experimental: {
    turbopackFileSystemCacheForBuild: true,
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
