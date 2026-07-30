'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  BookOpenText,
  Check,
  ChevronRight,
  Command,
  FileText,
  Github,
  Palette,
  Search,
  Sparkles,
  WandSparkles,
} from 'lucide-react';

const features = [
  { icon: BookOpenText, label: 'Fumadocs 内容系统' },
  { icon: Palette, label: 'Animate UI 风格主题' },
  { icon: Search, label: '内置全文搜索' },
];

export function HomeHero() {
  const reduceMotion = useReducedMotion();
  const initial = reduceMotion ? false : { opacity: 0, y: 18 };

  return (
    <main className="relative isolate flex min-h-[calc(100vh-4rem)] flex-1 overflow-hidden">
      <div className="hero-grid pointer-events-none absolute inset-0 -z-20 opacity-55" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-[8%] top-12 -z-10 size-72 rounded-full bg-violet-500/16 blur-3xl"
        animate={reduceMotion ? undefined : { x: [0, 28, 0], y: [0, -18, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-[5%] top-28 -z-10 size-80 rounded-full bg-indigo-400/12 blur-3xl"
        animate={reduceMotion ? undefined : { x: [0, -32, 0], y: [0, 24, 0], scale: [1.04, 0.96, 1.04] }}
        transition={{ duration: 14, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-[0.88fr_1.12fr] lg:px-10 lg:py-28">
        <motion.section
          initial={initial}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-fd-border bg-fd-card/80 px-3 py-1.5 text-sm text-fd-muted-foreground shadow-sm backdrop-blur-xl">
            <Sparkles className="size-3.5 text-violet-500" />
            Fumadocs 官方架构 · Animate UI 灵感设计
          </div>

          <h1 className="text-balance text-5xl font-semibold leading-[1.03] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            让文档既可靠，
            <span className="bg-gradient-to-r from-violet-500 via-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">
              又有生命力。
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-pretty text-lg leading-8 text-fd-muted-foreground">
            使用 Fumadocs 管理 MDX、目录、搜索与页面结构，只迁移 Animate UI 的主题、导航、按钮与细腻动效。
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <motion.div whileHover={reduceMotion ? undefined : { y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/docs/getting-started"
                className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-fd-primary px-5 text-sm font-medium text-fd-primary-foreground shadow-[0_16px_45px_-20px_color-mix(in_oklab,var(--accent)_75%,transparent)] sm:w-auto"
              >
                查看快速开始
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
            <motion.div whileHover={reduceMotion ? undefined : { y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="https://github.com/ActiveInsighter/fumadocs"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-fd-border bg-fd-card/80 px-5 text-sm font-medium shadow-sm backdrop-blur-xl sm:w-auto"
              >
                <Github className="size-4" />
                查看仓库
              </Link>
            </motion.div>
          </div>

          <div className="mt-9 grid gap-3 text-sm text-fd-muted-foreground sm:grid-cols-3">
            {features.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-md bg-fd-accent text-fd-accent-foreground">
                  <Icon className="size-3.5" />
                </span>
                {label}
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="absolute -inset-8 -z-10 rounded-[2.5rem] bg-gradient-to-br from-violet-500/16 via-transparent to-indigo-500/14 blur-2xl" />
          <div className="overflow-hidden rounded-[1.4rem] border border-fd-border bg-fd-card/84 shadow-[0_35px_110px_-48px_rgba(35,20,95,0.55)] backdrop-blur-2xl">
            <div className="flex h-12 items-center gap-2 border-b border-fd-border px-4">
              <span className="size-2.5 rounded-full bg-red-400/75" />
              <span className="size-2.5 rounded-full bg-amber-400/75" />
              <span className="size-2.5 rounded-full bg-emerald-400/75" />
              <div className="ml-4 flex h-7 flex-1 items-center gap-2 rounded-lg border border-fd-border bg-fd-background/55 px-3 text-xs text-fd-muted-foreground">
                <Search className="size-3.5" />
                搜索文档
                <span className="ml-auto inline-flex items-center gap-0.5 rounded border border-fd-border px-1.5 py-0.5 font-mono text-[10px]">
                  <Command className="size-2.5" />K
                </span>
              </div>
            </div>

            <div className="grid min-h-[460px] grid-cols-[148px_1fr] sm:grid-cols-[190px_1fr]">
              <aside className="border-r border-fd-border bg-fd-background/42 p-3 sm:p-4">
                <div className="mb-4 flex items-center gap-2 px-2 text-xs font-medium">
                  <span className="grid size-6 place-items-center rounded-lg bg-fd-primary text-fd-primary-foreground">
                    <WandSparkles className="size-3.5" />
                  </span>
                  <span className="hidden sm:inline">Fumadocs Studio</span>
                </div>
                <PreviewItem active icon={FileText} label="介绍" />
                <PreviewItem icon={ChevronRight} label="快速开始" />
                <PreviewItem icon={ChevronRight} label="主题定制" />
                <PreviewItem icon={ChevronRight} label="部署" />
              </aside>

              <article className="overflow-hidden p-5 sm:p-8">
                <div className="mb-6 flex items-center gap-2 text-xs text-fd-muted-foreground">
                  文档 <ChevronRight className="size-3" /> 介绍
                </div>
                <div className="h-3 w-24 rounded-full bg-violet-500/18" />
                <div className="mt-4 h-9 w-[86%] rounded-lg bg-fd-foreground/90" />
                <div className="mt-3 h-3 w-full rounded-full bg-fd-muted" />
                <div className="mt-2 h-3 w-[82%] rounded-full bg-fd-muted" />

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {['MDX 内容源', '自动目录', '全文搜索', '暗色主题'].map((item) => (
                    <div key={item} className="rounded-xl border border-fd-border bg-fd-background/46 p-4">
                      <span className="mb-3 grid size-7 place-items-center rounded-lg bg-fd-accent text-fd-accent-foreground">
                        <Check className="size-4" />
                      </span>
                      <div className="text-sm font-medium">{item}</div>
                      <div className="mt-2 h-2 w-full rounded-full bg-fd-muted" />
                      <div className="mt-1.5 h-2 w-2/3 rounded-full bg-fd-muted" />
                    </div>
                  ))}
                </div>

                <div className="mt-6 overflow-hidden rounded-xl border border-fd-border bg-zinc-950 p-4 font-mono text-xs text-zinc-300 shadow-inner">
                  <span className="text-violet-300">pnpm</span> create fumadocs-app
                  <span className="mt-2 block text-zinc-500"># choose Next.js · Fumadocs MDX</span>
                </div>
              </article>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}

function PreviewItem({
  active = false,
  icon: Icon,
  label,
}: {
  active?: boolean;
  icon: typeof FileText;
  label: string;
}) {
  return (
    <div
      className={`mb-1 flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition ${
        active
          ? 'border border-violet-500/15 bg-violet-500/10 font-medium text-fd-foreground'
          : 'text-fd-muted-foreground'
      }`}
    >
      <Icon className="size-3.5" />
      {label}
    </div>
  );
}
