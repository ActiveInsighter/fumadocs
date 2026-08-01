import { ImageZoom } from 'fumadocs-ui/components/image-zoom';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';

function DocumentationImage(props: any) {
  const isRemote = typeof props.src === 'string' && /^https?:\/\//u.test(props.src);

  if (isRemote) {
    // The imported algorithm notes reference several third-party image hosts.
    // Render those URLs directly so they do not require an ever-growing
    // next/image allowlist or a slow Vercel image-optimization round trip.
    return (
      <ImageZoom {...props}>
        <img
          {...props}
          loading={props.loading ?? 'lazy'}
          decoding={props.decoding ?? 'async'}
          referrerPolicy={props.referrerPolicy ?? 'no-referrer'}
        />
      </ImageZoom>
    );
  }

  return <ImageZoom {...props} />;
}

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Tab,
    Tabs,
    img: DocumentationImage,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
