import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('docs/*', 'routes/docs.tsx'),
  route('llms.mdx/docs/*', 'llms/mdx.ts'),
] satisfies RouteConfig;
