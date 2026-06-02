#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const npmCache =
  process.env.ALEMBIC_CODEX_NPM_CACHE || join(tmpdir(), 'alembic-codex-plugin-runtime-npm-cache');
const npmCacheBase = npmCache;
const npmCacheRunRoot = join(npmCacheBase, 'sessions', `${process.pid}-${Date.now()}`);
const lockDir = `${npmCacheBase}.lock`;
let lockHeld = false;

await acquireStartupLock();

const child = spawn('npx', ['-y', '--offline', '--package', './runtime.tgz', 'alembic-codex-mcp'], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    // npm exec 会为同一个 package spec 复用确定性的 _npx 目录；长驻 MCP 进程和二次启动会抢同一目录。
    // 每个 wrapper 进程使用独立 cache，保留离线 tarball 启动，同时避免 ENOTEMPTY / stale package 冲突。
    npm_config_cache: npmCacheRunRoot,
    npm_config_fund: 'false',
    npm_config_audit: 'false',
    npm_config_ignore_scripts: 'true',
    npm_config_offline: 'true',
  },
  stdio: ['inherit', 'pipe', 'pipe'],
});

child.stdout.on('data', (chunk) => {
  releaseStartupLock();
  process.stdout.write(chunk);
});

child.stderr.on('data', (chunk) => {
  process.stderr.write(chunk);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    child.kill(signal);
  });
}

child.on('exit', (code, signal) => {
  releaseStartupLock();
  cleanupRunCache(code, signal);
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});

child.on('error', (error) => {
  releaseStartupLock();
  cleanupRunCache(1, null);
  console.error(`Failed to start Alembic Codex MCP runtime through npx: ${error.message}`);
  process.exit(1);
});

async function acquireStartupLock() {
  const startedAt = Date.now();
  const timeoutMs = Number(process.env.ALEMBIC_CODEX_NPM_LOCK_TIMEOUT_MS || 120000);
  for (;;) {
    try {
      mkdirSync(lockDir, { recursive: false });
      lockHeld = true;
      writeFileSync(
        join(lockDir, 'owner.json'),
        `${JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }, null, 2)}\n`
      );
      return;
    } catch (error) {
      if (!isExistingLockError(error)) {
        throw error;
      }
      clearStaleLock();
      if (Date.now() - startedAt > timeoutMs) {
        throw new Error(`Timed out waiting for Alembic Codex npm cache lock: ${lockDir}`);
      }
      await sleep(250);
    }
  }
}

function clearStaleLock() {
  if (!existsSync(lockDir)) {
    return;
  }
  if (!lockOwnerAlive()) {
    rmSync(lockDir, { force: true, recursive: true });
    return;
  }
  const staleMs = Number(process.env.ALEMBIC_CODEX_NPM_LOCK_STALE_MS || 300000);
  try {
    const ageMs = Date.now() - statSync(lockDir).mtimeMs;
    if (ageMs > staleMs) {
      rmSync(lockDir, { force: true, recursive: true });
    }
  } catch {
    rmSync(lockDir, { force: true, recursive: true });
  }
}

function lockOwnerAlive() {
  try {
    const owner = JSON.parse(readFileSync(join(lockDir, 'owner.json'), 'utf8'));
    if (!Number.isInteger(owner.pid)) {
      return false;
    }
    process.kill(owner.pid, 0);
    return true;
  } catch {
    return false;
  }
}

function releaseStartupLock() {
  if (!lockHeld) {
    return;
  }
  lockHeld = false;
  rmSync(lockDir, { force: true, recursive: true });
}

function cleanupRunCache(code, signal) {
  if (process.env.ALEMBIC_CODEX_KEEP_NPM_CACHE === '1') {
    return;
  }
  if (code === 0 || signal) {
    rmSync(npmCacheRunRoot, { force: true, recursive: true });
  }
}

function isExistingLockError(error) {
  return error && typeof error === 'object' && 'code' in error && error.code === 'EEXIST';
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
