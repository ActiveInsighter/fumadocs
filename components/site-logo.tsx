import { Sparkles } from 'lucide-react';

export function SiteLogo() {
  return (
    <span className="group/logo inline-flex items-center gap-2.5 font-semibold tracking-tight">
      <span className="relative grid size-8 place-items-center overflow-hidden rounded-xl border border-fd-border bg-fd-card shadow-sm transition duration-300 group-hover/logo:-rotate-3 group-hover/logo:scale-105">
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,color-mix(in_oklab,var(--accent)_38%,transparent),transparent_68%)]" />
        <Sparkles className="relative size-4 transition-transform duration-300 group-hover/logo:rotate-12" />
      </span>
      <span className="hidden sm:inline">Fumadocs Studio</span>
    </span>
  );
}
