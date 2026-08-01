import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { repositoryUrl } from '@/lib/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: '算法知识库',
    },
    links: [
      {
        text: '算法文档',
        url: '/docs/algorithm',
        active: 'nested-url',
      },
    ],
    githubUrl: repositoryUrl,
  };
}
