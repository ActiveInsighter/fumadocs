'use client';

import {
  type HTMLAttributes,
  type ReactNode,
  forwardRef,
  useCallback,
  useRef,
  useState,
} from 'react';
import { cn } from '@/lib/cn';
import {
  ScrollArea,
  ScrollBar,
  ScrollViewport,
} from '@/components/animate-ui/scroll-area';
import type { ScrollArea as ScrollAreaPrimitive } from 'radix-ui';
import { CopyButton } from '@/components/animate-ui/copy-button';

export type CodeBlockProps = Omit<HTMLAttributes<HTMLElement>, 'onCopy'> & {
  icon?: ReactNode;
  allowCopy?: boolean;
  viewportProps?: ScrollAreaPrimitive.ScrollAreaViewportProps;
  onCopy?: () => void;
};

export const Pre = forwardRef<HTMLPreElement, HTMLAttributes<HTMLPreElement>>(
  ({ className, ...props }, ref) => {
    return (
      <pre
        ref={ref}
        className={cn('p-4 focus-visible:outline-none', className)}
        {...props}
      >
        {props.children}
      </pre>
    );
  },
);

Pre.displayName = 'Pre';

export const CodeBlock = forwardRef<HTMLElement, CodeBlockProps>(
  (
    {
      title,
      allowCopy = true,
      icon,
      viewportProps,
      onCopy: onCopyEvent,
      ...props
    },
    ref,
  ) => {
    const [isCopied, setIsCopied] = useState(false);
    const areaRef = useRef<HTMLDivElement>(null);

    const onCopy = useCallback(() => {
      const pre = areaRef.current?.getElementsByTagName('pre').item(0);

      if (!pre) return;

      const clone = pre.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('.nd-copy-ignore').forEach((node) => {
        node.remove();
      });

      void navigator.clipboard.writeText(clone.textContent ?? '').then(() => {
        setIsCopied(true);
        onCopyEvent?.();
        setTimeout(() => setIsCopied(false), 3000);
      });
    }, [onCopyEvent]);

    return (
      <figure
        ref={ref}
        {...props}
        className={cn(
          'not-prose group fd-codeblock relative my-6 overflow-hidden rounded-xl text-sm [&.shiki]:!bg-accent',
          props.className,
        )}
      >
        {title ? (
          <div className="flex h-10 flex-row items-center gap-2 pl-4 pr-4">
            {icon ? (
              <div
                className="text-muted-foreground [&_svg]:size-3.5"
                dangerouslySetInnerHTML={
                  typeof icon === 'string' ? { __html: icon } : undefined
                }
              >
                {typeof icon !== 'string' ? icon : null}
              </div>
            ) : null}
            <figcaption className="flex-1 truncate text-muted-foreground">
              {title}
            </figcaption>
            {allowCopy ? (
              <CopyButton
                size="xs"
                variant="ghost"
                className="-me-2 bg-transparent hover:bg-black/5 dark:hover:bg-white/10"
                onClick={onCopy}
                isCopied={isCopied}
                aria-label="复制代码"
              />
            ) : null}
          </div>
        ) : (
          allowCopy && (
            <div className="absolute right-0 top-0 z-[2] rounded-bl-xl bg-accent p-1.5">
              <CopyButton
                size="xs"
                variant="ghost"
                className="bg-transparent hover:bg-black/5 dark:hover:bg-white/10"
                onClick={onCopy}
                isCopied={isCopied}
                aria-label="复制代码"
              />
            </div>
          )
        )}
        <div className={cn('p-1.5', title && 'pt-0')}>
          <ScrollArea ref={areaRef} dir="ltr">
            <ScrollViewport
              {...viewportProps}
              data-slot="codeblock-viewport"
              className={cn(
                'max-h-[600px] rounded-md bg-background [&_code]:!text-[13px] [&_code_.line]:!px-0',
                viewportProps?.className,
              )}
            >
              {props.children}
            </ScrollViewport>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </figure>
    );
  },
);

CodeBlock.displayName = 'CodeBlock';
