import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { repositoryUrl } from '@/lib/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: 'Fumadocs',
    },
    githubUrl: repositoryUrl,
  };
}
