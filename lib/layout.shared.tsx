import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { repositoryUrl } from '@/lib/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: '考研知识库',
    },
    links: [
      {
        text: '数学',
        url: '/docs/math',
        active: 'nested-url',
      },
      {
        text: '408',
        url: '/docs/408',
        active: 'nested-url',
      },
      {
        text: '算法',
        url: '/docs/algorithm',
        active: 'nested-url',
      },
    ],
    githubUrl: repositoryUrl,
  };
}
