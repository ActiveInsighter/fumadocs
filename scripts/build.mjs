import { spawn } from 'node:child_process';
import { readdir } from 'node:fs/promises';
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

async function countDocuments(directory) {
  let count = 0;
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      count += await countDocuments(absolutePath);
    } else if (entry.isFile() && /\.mdx?$/iu.test(entry.name)) {
      count += 1;
    }
  }

  return count;
}

const documentCount = await countDocuments(docsRoot);
console.log(
  `[content] prerendering ${documentCount} Markdown/MDX documents with the Sätteri compiler`,
);
console.log(
  '[build] using Webpack for production to avoid the current Turbopack Unicode module identifier crash',
);

const startedAt = Date.now();
const nextBinary = process.platform === 'win32' ? 'next.cmd' : 'next';
const forwardedArgs = process.argv
  .slice(2)
  .filter((argument) => !['--webpack', '--turbopack', '--turbo'].includes(argument));
const child = spawn(nextBinary, ['build', '--webpack', ...forwardedArgs], {
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
