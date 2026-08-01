import { createHash } from 'node:crypto';
import {
  mkdir,
  open,
  readdir,
  stat,
  unlink,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { remarkMdxFiles, remarkMdxMermaid } from 'fumadocs-core/mdx-plugins';
import { remarkSteps } from 'fumadocs-core/mdx-plugins/remark-steps';
import type { Plugin } from 'fumadocs-mdx';
import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import lastModified from 'fumadocs-mdx/plugins/last-modified';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

const LOCK_STALE_AFTER_MS = 30_000;
const LOCK_WAIT_TIMEOUT_MS = 60_000;

function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function getErrorCode(error: unknown) {
  if (typeof error !== 'object' || error === null || !('code' in error)) return undefined;
  return String(error.code);
}

function toPosixPath(value: string) {
  return value.split(path.sep).join('/');
}

function formatDuration(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

async function acquireProgressLock(lockPath: string) {
  const deadline = Date.now() + LOCK_WAIT_TIMEOUT_MS;

  while (Date.now() < deadline) {
    try {
      const handle = await open(lockPath, 'wx');
      await handle.writeFile(String(process.pid));
      await handle.close();

      return async () => {
        await unlink(lockPath).catch(() => undefined);
      };
    } catch (error) {
      if (getErrorCode(error) !== 'EEXIST') throw error;

      try {
        const lockStat = await stat(lockPath);
        if (Date.now() - lockStat.mtimeMs > LOCK_STALE_AFTER_MS) {
          await unlink(lockPath);
          continue;
        }
      } catch (lockError) {
        if (getErrorCode(lockError) !== 'ENOENT') throw lockError;
      }

      await sleep(10);
    }
  }

  throw new Error(`Timed out waiting for MDX progress lock: ${lockPath}`);
}

function mdxBuildProgressPlugin(): Plugin {
  return {
    name: 'mdx-build-progress',
    doc: {
      async vfile() {
        const progressDirectory = process.env.FUMADOCS_BUILD_PROGRESS_DIR;
        if (!progressDirectory) return;

        const total = Number.parseInt(
          process.env.FUMADOCS_BUILD_PROGRESS_TOTAL ?? '0',
          10,
        );
        const startedAt = Number.parseInt(
          process.env.FUMADOCS_BUILD_PROGRESS_STARTED_AT ?? String(Date.now()),
          10,
        );
        const absolutePath = path.isAbsolute(this.filePath)
          ? this.filePath
          : path.resolve(this.filePath);
        const relativePath = toPosixPath(path.relative(process.cwd(), absolutePath));

        if (!relativePath.startsWith('content/docs/') || !/\.mdx?$/i.test(relativePath)) {
          return;
        }

        await mkdir(progressDirectory, { recursive: true });
        const markerName = `${createHash('sha1').update(relativePath).digest('hex')}.done`;
        const markerPath = path.join(progressDirectory, markerName);
        const lockPath = path.join(progressDirectory, '.lock');
        const releaseLock = await acquireProgressLock(lockPath);

        try {
          try {
            await writeFile(markerPath, relativePath, { encoding: 'utf8', flag: 'wx' });
          } catch (error) {
            if (getErrorCode(error) === 'EEXIST') return;
            throw error;
          }

          const completed = (await readdir(progressDirectory)).filter((entry: string) =>
            entry.endsWith('.done'),
          ).length;
          const remaining = Math.max(total - completed, 0);
          const elapsed = formatDuration(Date.now() - startedAt);
          const width = Math.max(1, String(total).length);

          console.log(
            `[MDX ${String(completed).padStart(width, '0')}/${total}] compiled ${relativePath} | remaining ${remaining} | elapsed ${elapsed}`,
          );

          if (total > 0 && completed === total) {
            console.log(
              `[MDX] all ${total} documents compiled; subsequent time is Next.js/Turbopack bundling and optimization`,
            );
          }
        } finally {
          await releaseLock();
        }
      },
    },
  };
}

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    postprocess: {
      extractLinkReferences: true,
      includeProcessedMarkdown: true,
    },
  },
});

export default defineConfig({
  plugins: [lastModified(), mdxBuildProgressPlugin()],
  mdxOptions: {
    remarkPlugins: [remarkMath, remarkSteps, remarkMdxFiles, remarkMdxMermaid],
    remarkNpmOptions: {
      persist: {
        id: 'package-manager',
      },
    },
    rehypePlugins: (plugins) => [rehypeKatex, ...plugins],
  },
});
