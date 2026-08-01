import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Dynamic MDX compilation loads Shiki on the server, so keep its grammars
  // and themes out of the main Turbopack server bundle.
  serverExternalPackages: ['shiki'],
  // Dynamic Mode reads the original Markdown/MDX files with fs at request
  // time. Static analysis cannot reliably discover those generated paths, so
  // explicitly include the content tree in every Node.js server trace.
  outputFileTracingIncludes: {
    '/*': ['./content/docs/**/*'],
  },
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
