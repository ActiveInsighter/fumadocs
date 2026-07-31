import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { ArrowRight, Palette } from 'lucide-react';
import { SiteLogo } from '@/components/site-logo';
import { gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <SiteLogo />,
      transparentMode: 'top',
    },
    links: [
      {
        text: '文档',
        url: '/docs',
        active: 'nested-url',
      },
      {
        text: '快速开始',
        url: '/docs/getting-started',
      },
      {
        text: '主题定制',
        url: '/docs/customization',
        icon: <Palette className="size-4" />,
      },
      {
        type: 'button',
        text: (
          <span className="group/cta inline-flex items-center gap-1.5">
            开始使用
            <ArrowRight className="size-3.5 transition-transform duration-200 group-hover/cta:translate-x-0.5" />
          </span>
        ),
        url: '/docs/getting-started',
        secondary: false,
        on: 'nav',
      },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
    searchToggle: {
      enabled: true,
    },
    themeSwitch: {
      enabled: true,
    },
  };
}
