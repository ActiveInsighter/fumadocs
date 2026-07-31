'use client';

import { useEffect, useId, useState } from 'react';

type MermaidProps = {
  chart: string;
};

type RenderState =
  | { status: 'loading' }
  | { status: 'ready'; svg: string }
  | { status: 'error'; message: string };

export function Mermaid({ chart }: MermaidProps) {
  const reactId = useId();
  const [state, setState] = useState<RenderState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    let renderCount = 0;
    const root = document.documentElement;

    async function renderDiagram() {
      const { default: mermaid } = await import('mermaid');
      const theme = root.classList.contains('dark') ? 'dark' : 'default';
      const id = `mermaid-${reactId.replaceAll(':', '')}-${renderCount++}`;

      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme,
      });

      try {
        const { svg } = await mermaid.render(id, chart);
        if (!cancelled) setState({ status: 'ready', svg });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to render Mermaid diagram.';
        if (!cancelled) setState({ status: 'error', message });
      }
    }

    setState({ status: 'loading' });
    void renderDiagram();

    const observer = new MutationObserver(() => {
      setState({ status: 'loading' });
      void renderDiagram();
    });
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [chart, reactId]);

  if (state.status === 'error') {
    return (
      <div className="my-4 overflow-auto rounded-lg border border-fd-border bg-fd-card p-4">
        <p className="mb-3 text-sm font-medium text-fd-foreground">Mermaid 渲染失败</p>
        <pre className="text-xs text-fd-muted-foreground">{state.message}</pre>
      </div>
    );
  }

  if (state.status === 'loading') {
    return (
      <div className="my-4 rounded-lg border border-fd-border bg-fd-card p-6 text-center text-sm text-fd-muted-foreground">
        正在渲染图表…
      </div>
    );
  }

  return (
    <div
      className="my-4 overflow-auto rounded-lg border border-fd-border bg-fd-card p-4 [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: state.svg }}
    />
  );
}
