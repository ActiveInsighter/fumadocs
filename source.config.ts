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
import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import lastModified from 'fumadocs-mdx/plugins/last-modified';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

const LOCK_STALE_AFTER_MS = 30_000;
const LOCK_WAIT_TIMEOUT_MS = 60_000;

type ProgressStatus = 'started' | 'done';
type ProgressVFile = { path?: string };

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

async function writeUniqueMarker(markerPath: string, relativePath: string) {
  try {
    await writeFile(markerPath, relativePath, { encoding: 'utf8', flag: 'wx' });
    return true;
  } catch (error) {
    if (getErrorCode(error) === 'EEXIST') return false;
    throw error;
  }
}

async function recordMdxProgress(status: ProgressStatus, filePath?: string) {
  const progressDirectory = process.env.FUMADOCS_BUILD_PROGRESS_DIR;
  if (!progressDirectory || !filePath) return;

  const total = Math.max(
    0,
    Number.parseInt(process.env.FUMADOCS_BUILD_PROGRESS_TOTAL ?? '0', 10) || 0,
  );
  const startedAt =
    Number.parseInt(
      process.env.FUMADOCS_BUILD_PROGRESS_STARTED_AT ?? String(Date.now()),
      10,
    ) || Date.now();
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(filePath);
  const relativePath = toPosixPath(path.relative(process.cwd(), absolutePath));

  if (!relativePath.startsWith('content/docs/') || !/\.mdx?$/i.test(relativePath)) {
    return;
  }

  await mkdir(progressDirectory, { recursive: true });
  const markerId = createHash('sha1').update(relativePath).digest('hex');
  const startedMarkerPath = path.join(progressDirectory, `${markerId}.started`);
  const markerPath = path.join(progressDirectory, `${markerId}.${status}`);
  const lockPath = path.join(progressDirectory, '.lock');
  const releaseLock = await acquireProgressLock(lockPath);

  try {
    if (status === 'done') {
      await writeUniqueMarker(startedMarkerPath, relativePath);
    }

    if (!(await writeUniqueMarker(markerPath, relativePath))) return;

    const entries = await readdir(progressDirectory);
    const started = entries.filter((entry: string) => entry.endsWith('.started')).length;
    const completed = entries.filter((entry: string) => entry.endsWith('.done')).length;
    const active = Math.max(started - completed, 0);
    const remaining = Math.max(total - completed, 0);
    const elapsed = formatDuration(Date.now() - startedAt);
    const width = Math.max(1, String(total).length);

    if (status === 'started') {
      console.log(
        `[MDX start ${String(started).padStart(width, '0')}/${total}] ${relativePath} | active ${active} | completed ${completed} | elapsed ${elapsed}`,
      );
    } else {
      console.log(
        `[MDX done  ${String(completed).padStart(width, '0')}/${total}] ${relativePath} | remaining ${remaining} | active ${active} | elapsed ${elapsed}`,
      );

      if (total > 0 && completed === total) {
        console.log(
          `[MDX] all ${total} documents finished the MDX processing pipeline; subsequent time is Next.js/Turbopack bundling and optimization`,
        );
      }
    }
  } finally {
    await releaseLock();
  }
}

function remarkBuildProgressStart() {
  return async (_tree: unknown, file: ProgressVFile) => {
    await recordMdxProgress('started', file.path);
  };
}

function rehypeBuildProgressDone() {
  return async (_tree: unknown, file: ProgressVFile) => {
    await recordMdxProgress('done', file.path);
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
  plugins: [lastModified()],
  mdxOptions: {
    remarkPlugins: [
      remarkBuildProgressStart,
      remarkMath,
      remarkSteps,
      remarkMdxFiles,
      remarkMdxMermaid,
    ],
    remarkNpmOptions: {
      persist: {
        id: 'package-manager',
      },
    },
    rehypePlugins: (plugins) => [
      rehypeKatex,
      ...plugins,
      rehypeBuildProgressDone,
    ],
  },
});
