import type { ReactNode } from 'react';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { source } from '@/lib/source';
import { baseOptions } from '@/lib/layout.shared';

export default function DocumentationLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      tabs={false}
      containerProps={{ className: 'docs-shell' }}
      {...baseOptions()}
    >
      {children}
    </DocsLayout>
  );
}
