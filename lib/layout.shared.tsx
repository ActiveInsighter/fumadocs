import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { GithubStarsLogo } from '@/components/animate-ui/github-stars-logo';
import { ThemeSwitcher } from '@/components/animate-ui/theme-switcher';
import { repositoryUrl } from '@/lib/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: 'Fumadocs',
    },
    links: [
      {
        type: 'icon',
        text: 'GitHub',
        label: 'GitHub',
        url: repositoryUrl,
        external: true,
        active: 'none',
        on: 'menu',
        icon: <GithubStarsLogo />,
      },
    ],
    slots: {
      themeSwitch: ThemeSwitcher,
    },
  };
}
