#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const pluginRoot = process.cwd();
const runtimeTarball = join(pluginRoot, 'runtime.tgz');
const lockScope = createHash('sha256')
  .update(`${pluginRoot}\0${runtimeTarball}`)
  .digest('hex')
  .slice(0, 16);
const npmCacheRoot =
  process.env.ALEMBIC_CODEX_NPM_CACHE || join(tmpdir(), 'alembic-codex-plugin-runtime-npm-cache');
const npmCacheBase = join(npmCacheRoot, lockScope);
const npmCacheRunRoot = join(npmCacheBase, 'sessions', `${process.pid}-${Date.now()}`);
const lockDir = `${npmCacheBase}.lock`;
let lockHeld = false;
let lockReleaseTimer = null;

try {
  await acquireStartupLock();
  startRuntime();
} catch (err) {
  const error = err instanceof Error ? err : new Error(String(err));
  logWrapperDiagnostic('startup-lock-failed', {
    lockDir,
    message: error.message,
    nextAction:
      'Check owner.json in the lock directory, clear stale plugin cache locks, or run npm run dev:codex-plugin:reload.',
  });
  process.exit(1);
}

function startRuntime() {
  scheduleStartupLockRelease();

  const child = spawn(
    'npx',
    ['-y', '--offline', '--package', './runtime.tgz', 'alembic-codex-mcp'],
    {
      cwd: pluginRoot,
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
    }
  );

  child.stdout.on('data', (chunk) => {
    releaseStartupLock('stdout');
    process.stdout.write(chunk);
  });

  child.stderr.on('data', (chunk) => {
    releaseStartupLock('stderr');
    process.stderr.write(chunk);
  });

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      child.kill(signal);
    });
  }

  child.on('exit', (code, signal) => {
    releaseStartupLock('child-exit');
    cleanupRunCache(code, signal);
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 1);
  });

  child.on('error', (error) => {
    releaseStartupLock('child-error');
    cleanupRunCache(1, null);
    console.error(`Failed to start Alembic Codex MCP runtime through npx: ${error.message}`);
    process.exit(1);
  });
}

async function acquireStartupLock() {
  const startedAt = Date.now();
  const timeoutMs = Number(process.env.ALEMBIC_CODEX_NPM_LOCK_TIMEOUT_MS || 120000);
  let lastWaitLogAt = 0;
  // ALEMBIC_CODEX_NPM_CACHE may point at a fresh nested install cache; create it
  // before the scoped lock so missing parents do not abort packaged MCP startup.
  mkdirSync(npmCacheRoot, { recursive: true });
  for (;;) {
    try {
      mkdirSync(lockDir, { recursive: false });
      lockHeld = true;
      writeFileSync(
        join(lockDir, 'owner.json'),
        `${JSON.stringify(
          {
            pid: process.pid,
            pluginRoot,
            runtimeTarball,
            lockScope,
            lockDir,
            npmCacheRoot,
            npmCacheRunRoot,
            startedAt: new Date().toISOString(),
          },
          null,
          2
        )}\n`
      );
      return;
    } catch (error) {
      if (!isExistingLockError(error)) {
        throw error;
      }
      const staleResult = clearStaleLock();
      const waitMs = Date.now() - startedAt;
      if (Date.now() - lastWaitLogAt > 5000) {
        lastWaitLogAt = Date.now();
        logWrapperDiagnostic('startup-lock-wait', {
          lockDir,
          lockScope,
          owner: readLockOwner(),
          waitMs,
          timeoutMs,
          staleResult,
          nextAction:
            'Wait for the owning wrapper startup to finish. If this repeats, inspect owner.json or run npm run dev:codex-plugin:reload to refresh installed caches; restart Codex itself if the current host MCP transport is closed.',
        });
      }
      if (waitMs > timeoutMs) {
        throw new Error(
          `Timed out waiting for Alembic Codex npm cache lock: ${lockDir}; owner=${JSON.stringify(
            readLockOwner()
          )}; waitMs=${waitMs}; timeoutMs=${timeoutMs}`
        );
      }
      await sleep(250);
    }
  }
}

function clearStaleLock() {
  if (!existsSync(lockDir)) {
    return 'missing';
  }
  if (!lockOwnerAlive()) {
    rmSync(lockDir, { force: true, recursive: true });
    logWrapperDiagnostic('startup-lock-cleared', {
      lockDir,
      reason: 'owner-not-alive',
      nextAction: 'Retrying wrapper startup after clearing a stale lock.',
    });
    return 'cleared-owner-not-alive';
  }
  const staleMs = Number(process.env.ALEMBIC_CODEX_NPM_LOCK_STALE_MS || 300000);
  try {
    const ageMs = Date.now() - statSync(lockDir).mtimeMs;
    if (ageMs > staleMs) {
      rmSync(lockDir, { force: true, recursive: true });
      logWrapperDiagnostic('startup-lock-cleared', {
        ageMs,
        lockDir,
        reason: 'lock-age-exceeded-stale-threshold',
        staleMs,
        nextAction: 'Retrying wrapper startup after clearing a stale lock.',
      });
      return 'cleared-stale-age';
    }
    return 'owner-alive';
  } catch {
    rmSync(lockDir, { force: true, recursive: true });
    logWrapperDiagnostic('startup-lock-cleared', {
      lockDir,
      reason: 'lock-stat-failed',
      nextAction: 'Retrying wrapper startup after clearing a lock with unreadable metadata.',
    });
    return 'cleared-stat-failed';
  }
}

function lockOwnerAlive() {
  const owner = readLockOwner();
  try {
    if (!Number.isInteger(owner?.pid)) {
      return false;
    }
    process.kill(owner.pid, 0);
    return true;
  } catch {
    return false;
  }
}

function readLockOwner() {
  try {
    return JSON.parse(readFileSync(join(lockDir, 'owner.json'), 'utf8'));
  } catch {
    return null;
  }
}

function scheduleStartupLockRelease() {
  const holdMs = Number(process.env.ALEMBIC_CODEX_NPM_LOCK_HOLD_MS || 15000);
  lockReleaseTimer = setTimeout(() => {
    releaseStartupLock('hold-timeout');
  }, holdMs);
  lockReleaseTimer.unref?.();
}

function releaseStartupLock(reason) {
  if (!lockHeld) {
    return;
  }
  lockHeld = false;
  clearTimeout(lockReleaseTimer);
  rmSync(lockDir, { force: true, recursive: true });
  if (reason === 'hold-timeout') {
    logWrapperDiagnostic('startup-lock-released', {
      lockDir,
      reason,
      nextAction:
        'The wrapper released the startup lock after the bounded hold interval; npx/runtime startup continues in the child process.',
    });
  }
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

function logWrapperDiagnostic(event, data) {
  const payload = {
    event,
    source: 'alembic-codex-mcp-wrapper',
    ...data,
  };
  process.stderr.write(`[Alembic Codex MCP wrapper] ${JSON.stringify(payload)}\n`);
}
