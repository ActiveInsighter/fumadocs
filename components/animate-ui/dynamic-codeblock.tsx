'use client';

import type { ComponentProps } from 'react';
import { CodeBlock, Pre } from '@/components/animate-ui/codeblock';
import type { HighlightOptions } from 'fumadocs-core/highlight';
import { useShiki } from 'fumadocs-core/highlight/client';
import { cn } from '@/lib/cn';

const getComponents = ({
  title,
  icon,
  onCopy,
  className,
}: {
  title?: string;
  icon?: React.ReactNode;
  onCopy?: () => void;
  className?: string;
}) =>
  ({
    pre(props: ComponentProps<'pre'>) {
      const { onCopy: _nativeOnCopy, ...preProps } = props;

      return (
        <CodeBlock
          {...preProps}
          title={title}
          icon={icon}
          onCopy={onCopy}
          className={cn('my-0', props.className, className)}
        >
          <Pre>{props.children}</Pre>
        </CodeBlock>
      );
    },
  }) satisfies NonNullable<HighlightOptions['components']>;

export type DynamicCodeBlockProps = {
  lang: string;
  code: string;
  title?: string;
  icon?: React.ReactNode;
  onCopy?: () => void;
  options?: Omit<HighlightOptions, 'lang'>;
  className?: string;
};

export function DynamicCodeBlock({
  lang,
  code,
  options,
  title,
  icon,
  onCopy,
  className,
}: DynamicCodeBlockProps) {
  const components = getComponents({ title, icon, onCopy, className });

  return useShiki(code, {
    lang,
    ...options,
    components: {
      ...components,
      ...options?.components,
    },
  });
}
