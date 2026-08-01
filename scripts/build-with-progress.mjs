import { spawn } from 'node:child_process';
import {
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const projectRoot = process.cwd();
const contentRoot = path.join(projectRoot, 'content', 'docs');
const heartbeatSeconds = Math.max(
  10,
  Number.parseInt(process.env.BUILD_PROGRESS_HEARTBEAT_SECONDS ?? '20', 10) || 20,
);

function toPosixPath(value) {
  return value.split(path.sep).join('/');
}

function formatDuration(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

async function discoverDocuments(directory) {
  const files = [];

  async function visit(currentDirectory) {
    const entries = await readdir(currentDirectory, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name, 'zh-CN'));

    for (const entry of entries) {
      const absolutePath = path.join(currentDirectory, entry.name);
      if (entry.isDirectory()) {
        await visit(absolutePath);
      } else if (entry.isFile() && /\.mdx?$/i.test(entry.name)) {
        files.push(toPosixPath(path.relative(projectRoot, absolutePath)));
      }
    }
  }

  await visit(directory);
  return files;
}

async function readMarkerDocuments(progressDirectory, suffix) {
  let entries;
  try {
    entries = await readdir(progressDirectory);
  } catch {
    return new Set();
  }

  const markerNames = entries.filter((entry) => entry.endsWith(suffix));
  const documents = await Promise.all(
    markerNames.map(async (markerName) => {
      try {
        return (await readFile(path.join(progressDirectory, markerName), 'utf8')).trim();
      } catch {
        return '';
      }
    }),
  );

  return new Set(documents.filter(Boolean));
}

async function readProgress(progressDirectory) {
  const [startedDocuments, completedDocuments] = await Promise.all([
    readMarkerDocuments(progressDirectory, '.started'),
    readMarkerDocuments(progressDirectory, '.done'),
  ]);

  return { startedDocuments, completedDocuments };
}

const documents = await discoverDocuments(contentRoot);
const totalDocuments = documents.length;
const startedAt = Date.now();
const progressDirectory = await mkdtemp(path.join(tmpdir(), 'fumadocs-build-progress-'));

await writeFile(
  path.join(progressDirectory, 'manifest.json'),
  `${JSON.stringify({ documents }, null, 2)}\n`,
  'utf8',
);

console.log(
  `[build progress] tracking ${totalDocuments} Markdown/MDX documents under content/docs`,
);
console.log(
  `[build progress] logs show MDX pipeline start/done events; heartbeat interval is ${heartbeatSeconds}s`,
);

const nextBinary = process.platform === 'win32' ? 'next.cmd' : 'next';
const child = spawn(nextBinary, ['build', ...process.argv.slice(2)], {
  cwd: projectRoot,
  env: {
    ...process.env,
    FUMADOCS_BUILD_PROGRESS_DIR: progressDirectory,
    FUMADOCS_BUILD_PROGRESS_TOTAL: String(totalDocuments),
    FUMADOCS_BUILD_PROGRESS_STARTED_AT: String(startedAt),
  },
  stdio: 'inherit',
});

let spawnError;

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => {
    child.kill(signal);
  });
}

const heartbeat = setInterval(async () => {
  const { startedDocuments, completedDocuments } = await readProgress(progressDirectory);
  const started = startedDocuments.size;
  const completed = completedDocuments.size;
  const active = Math.max(started - completed, 0);
  const remaining = Math.max(totalDocuments - completed, 0);
  const elapsed = formatDuration(Date.now() - startedAt);

  if (totalDocuments > 0 && remaining === 0) {
    console.log(
      `[build heartbeat] all ${totalDocuments} MDX documents processed; Next.js/Turbopack is still bundling or optimizing | elapsed ${elapsed}`,
    );
  } else {
    console.log(
      `[build heartbeat] Next.js build is running | started ${started}/${totalDocuments} | done ${completed}/${totalDocuments} | active ${active} | remaining ${remaining} | elapsed ${elapsed}`,
    );
  }
}, heartbeatSeconds * 1000);
heartbeat.unref();

const result = await new Promise((resolve) => {
  let settled = false;
  const settle = (value) => {
    if (settled) return;
    settled = true;
    resolve(value);
  };

  child.once('error', (error) => {
    spawnError = error;
    settle({ code: 1, signal: null });
  });
  child.once('exit', (code, signal) => settle({ code, signal }));
});
clearInterval(heartbeat);

const { startedDocuments, completedDocuments } = await readProgress(progressDirectory);
const activeDocuments = documents.filter(
  (document) => startedDocuments.has(document) && !completedDocuments.has(document),
);
const remainingDocuments = documents.filter(
  (document) => !completedDocuments.has(document),
);
const elapsed = formatDuration(Date.now() - startedAt);

if (result.code === 0) {
  console.log(
    `[build progress] Next.js build completed successfully | MDX ${completedDocuments.size}/${totalDocuments} | elapsed ${elapsed}`,
  );
} else {
  const reason = spawnError
    ? spawnError.message
    : result.signal
      ? `signal ${result.signal}`
      : `exit code ${result.code ?? 1}`;

  console.error(
    `[build progress] Next.js build failed (${reason}) | started ${startedDocuments.size}/${totalDocuments} | done ${completedDocuments.size}/${totalDocuments} | active ${activeDocuments.length} | remaining ${remainingDocuments.length} | elapsed ${elapsed}`,
  );

  if (activeDocuments.length > 0) {
    console.error('[build progress] documents that started but did not finish:');
    for (const document of activeDocuments.slice(0, 25)) {
      console.error(`  - ${document}`);
    }
    if (activeDocuments.length > 25) {
      console.error(`  ... and ${activeDocuments.length - 25} more`);
    }
  }

  if (remainingDocuments.length > 0) {
    console.error('[build progress] first documents not completed:');
    for (const document of remainingDocuments.slice(0, 25)) {
      console.error(`  - ${document}`);
    }
    if (remainingDocuments.length > 25) {
      console.error(`  ... and ${remainingDocuments.length - 25} more`);
    }
  }
}

await rm(progressDirectory, { recursive: true, force: true });
process.exitCode = result.code ?? 1;
