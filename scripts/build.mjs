import { spawn } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const projectRoot = process.cwd();
const docsRoot = path.join(projectRoot, 'content', 'docs');
const heartbeatMs = 20_000;

function formatDuration(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

async function collectDocuments(directory) {
  const documents = [];
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      documents.push(...(await collectDocuments(absolutePath)));
    } else if (entry.isFile() && /\.mdx?$/iu.test(entry.name)) {
      documents.push(absolutePath);
    }
  }

  return documents;
}

function lineNumberAt(source, index) {
  return source.slice(0, index).split('\n').length;
}

async function validateDynamicDocuments() {
  const documents = await collectDocuments(docsRoot);
  const violations = [];

  for (const absolutePath of documents) {
    const source = await readFile(absolutePath, 'utf8');
    const relativePath = path.relative(projectRoot, absolutePath).split(path.sep).join('/');

    for (const match of source.matchAll(/^\s*(import|export)\s+([^\n]+)$/gmu)) {
      const statement = match[0].trim();
      const isProvidedTabsImport =
        match[1] === 'import' &&
        /from\s+['"]fumadocs-ui\/components\/tabs['"]\s*;?$/u.test(statement);

      if (!isProvidedTabsImport) {
        violations.push(
          `${relativePath}:${lineNumberAt(source, match.index ?? 0)} unsupported MDX ESM: ${statement}`,
        );
      }
    }

    const relativeImagePatterns = [
      /!\[[^\]]*\]\((?:\.\.?\/)[^)]+\)/gu,
      /<(?:img|Image)\b[^>]*\bsrc=["'](?:\.\.?\/)[^"']+["'][^>]*>/gu,
    ];

    for (const pattern of relativeImagePatterns) {
      for (const match of source.matchAll(pattern)) {
        violations.push(
          `${relativePath}:${lineNumberAt(source, match.index ?? 0)} relative images are unsupported in dynamic mode: ${match[0]}`,
        );
      }
    }
  }

  if (violations.length > 0) {
    console.error('[content validation] Dynamic MDX compatibility check failed:');
    for (const violation of violations.slice(0, 50)) {
      console.error(`  - ${violation}`);
    }
    if (violations.length > 50) {
      console.error(`  ... and ${violations.length - 50} more`);
    }
    process.exitCode = 1;
    return false;
  }

  console.log(
    `[content validation] ${documents.length} Markdown/MDX documents are compatible with Fumadocs dynamic mode`,
  );
  return true;
}

if (!(await validateDynamicDocuments())) {
  process.exit();
}

const startedAt = Date.now();
const nextBinary = process.platform === 'win32' ? 'next.cmd' : 'next';
const child = spawn(nextBinary, ['build', ...process.argv.slice(2)], {
  cwd: projectRoot,
  env: process.env,
  stdio: 'inherit',
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => child.kill(signal));
}

const heartbeat = setInterval(() => {
  console.log(
    `[build heartbeat] Next.js production build is still running | elapsed ${formatDuration(Date.now() - startedAt)}`,
  );
}, heartbeatMs);
heartbeat.unref();

const result = await new Promise((resolve) => {
  child.once('error', (error) => resolve({ code: 1, error, signal: null }));
  child.once('exit', (code, signal) => resolve({ code: code ?? 1, error: null, signal }));
});

clearInterval(heartbeat);

if (result.error) {
  console.error(`[build] failed to start Next.js: ${result.error.message}`);
} else if (result.signal) {
  console.error(`[build] Next.js exited after signal ${result.signal}`);
} else {
  console.log(
    `[build] Next.js exited with code ${result.code} | elapsed ${formatDuration(Date.now() - startedAt)}`,
  );
}

process.exitCode = result.code;
