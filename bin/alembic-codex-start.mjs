#!/usr/bin/env node

import { spawn, spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { homedir, platform } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RUNTIME_PACKAGE_NAME = '@gxfn/alembic-codex-runtime';
const RUNTIME_PACKAGE_VERSION = '0.2.0';
const RUNTIME_PACKAGE_SPECIFIER = '@gxfn/alembic-codex-runtime@0.2.0';
const RUNTIME_BIN = 'alembic-codex-mcp';
const STARTUP_SOURCE = 'alembic-codex-start';
const DEFAULT_LOCK_TIMEOUT_MS = 60_000;
const DEFAULT_LOCK_STALE_MS = 120_000;

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const rawArgs = process.argv.slice(2);
const dryRun = rawArgs.includes('--dry-run') || process.env.ALEMBIC_CODEX_START_DRY_RUN === '1';
const runtimeArgs = collectRuntimeArgs(rawArgs);

try {
  const launchPlan = buildLaunchPlan({
    env: process.env,
    pluginRoot,
    runtimeArgs,
    verifyWritableCache: !dryRun,
  });

  if (dryRun) {
    const { env: childEnv, ...publicPlan } = launchPlan;
    process.stdout.write(
      `${JSON.stringify({ ok: true, ...publicPlan, env: summarizePublicEnv(childEnv) }, null, 2)}\n`
    );
    process.exit(0);
  }

  const readyRuntime = await ensureRuntimeReady({ env: process.env, launchPlan });
  const child = spawn(readyRuntime.command, readyRuntime.args, {
    cwd: launchPlan.cwd,
    env: readyRuntime.env,
    stdio: 'inherit',
  });

  child.on('error', (error) => {
    writeStartupDiagnostic({
      ok: false,
      code: 'ALEMBIC_CODEX_RUNTIME_START_FAILED',
      message: error.message,
      command: readyRuntime.command,
      args: readyRuntime.args,
      cwd: launchPlan.cwd,
      runtimePackage: launchPlan.runtimePackage,
      nextAction:
        'Confirm the cached Alembic Codex runtime entrypoint is executable, then rerun diagnostics.',
      source: STARTUP_SOURCE,
    });
    process.exit(127);
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 1);
  });
} catch (error) {
  const diagnostic = normalizeStartupError(error);
  writeStartupDiagnostic(diagnostic);
  process.exit(diagnostic.exitCode ?? 1);
}

function buildLaunchPlan(input) {
  const cache = selectRuntimeCache({
    env: input.env,
    pluginRoot: input.pluginRoot,
    verifyWritable: input.verifyWritableCache,
  });
  const npmCommand = input.env.ALEMBIC_CODEX_NPM_COMMAND || 'npm';
  const installArgs = buildNpmInstallArgs(cache.installRoot);
  const env = {
    ...input.env,
    ALEMBIC_CHANNEL_ID: input.env.ALEMBIC_CHANNEL_ID || 'codex',
    ALEMBIC_CODEX_ENABLE_ADMIN: input.env.ALEMBIC_CODEX_ENABLE_ADMIN || '0',
    ALEMBIC_CODEX_MCP_MODE: '1',
    ALEMBIC_CODEX_PLUGIN_ROOT: input.pluginRoot,
    ALEMBIC_CODEX_RUNTIME_CACHE_DIR: cache.cacheRoot,
    ALEMBIC_CODEX_RUNTIME_PACKAGE: RUNTIME_PACKAGE_NAME,
    ALEMBIC_CODEX_RUNTIME_PACKAGE_VERSION: RUNTIME_PACKAGE_VERSION,
    ALEMBIC_CODEX_RUNTIME_PACKAGE_SPECIFIER: RUNTIME_PACKAGE_SPECIFIER,
    ALEMBIC_MCP_MODE: '1',
    ALEMBIC_MCP_TIER: input.env.ALEMBIC_MCP_TIER || 'agent',
    ALEMBIC_PLUGIN_HOST: input.env.ALEMBIC_PLUGIN_HOST || 'codex',
    ALEMBIC_RUNTIME_MODE: input.env.ALEMBIC_RUNTIME_MODE || 'plugin',
  };

  return {
    schemaVersion: 2,
    source: STARTUP_SOURCE,
    command: process.execPath,
    args: [cache.entrypointPath, ...input.runtimeArgs],
    cwd: input.pluginRoot,
    runtimePackage: {
      name: RUNTIME_PACKAGE_NAME,
      version: RUNTIME_PACKAGE_VERSION,
      specifier: RUNTIME_PACKAGE_SPECIFIER,
      bin: RUNTIME_BIN,
    },
    runtimeCache: {
      source: cache.source,
      cacheRoot: cache.cacheRoot,
      installRoot: cache.installRoot,
      packageRoot: cache.packageRoot,
      entrypointPath: cache.entrypointPath,
      lockDir: cache.lockDir,
      npmCacheDir: cache.npmCacheDir,
      offline: isOfflineMode(input.env),
      lockTimeoutMs: parsePositiveInt(
        input.env.ALEMBIC_CODEX_LOCK_TIMEOUT_MS,
        DEFAULT_LOCK_TIMEOUT_MS
      ),
      lockStaleMs: parsePositiveInt(input.env.ALEMBIC_CODEX_LOCK_STALE_MS, DEFAULT_LOCK_STALE_MS),
    },
    npm: {
      command: npmCommand,
      args: installArgs,
    },
    env,
  };
}

async function ensureRuntimeReady({ env, launchPlan }) {
  const cache = launchPlan.runtimeCache;
  const firstProbe = probeCachedRuntime(cache);
  if (firstProbe.status === 'ready') {
    emitTrace(env, 'runtime-cache-reuse', {
      cacheRoot: cache.cacheRoot,
      packageVersion: firstProbe.packageVersion,
      entrypointPath: firstProbe.entrypointPath,
    });
    return runtimeCommand({ launchPlan, entrypointPath: firstProbe.entrypointPath });
  }

  if (cache.offline) {
    throw createStartupError({
      code: offlineErrorCode(firstProbe),
      message: `Pinned Alembic runtime is not available in the selected cache while offline: ${firstProbe.reason}`,
      exitCode: 74,
      details: {
        cacheRoot: cache.cacheRoot,
        packageRoot: cache.packageRoot,
        expected: RUNTIME_PACKAGE_SPECIFIER,
        actual: firstProbe.packageVersion ?? null,
        reason: firstProbe.reason,
      },
      nextAction:
        'Start once with network access or preinstall the exact pinned runtime package into the Alembic runtime cache.',
    });
  }

  const lock = await acquireRuntimeLock({
    env,
    lockDir: cache.lockDir,
    timeoutMs: cache.lockTimeoutMs,
    staleMs: cache.lockStaleMs,
  });
  try {
    const secondProbe = probeCachedRuntime(cache);
    if (secondProbe.status === 'ready') {
      emitTrace(env, 'runtime-cache-reuse-after-lock', {
        cacheRoot: cache.cacheRoot,
        packageVersion: secondProbe.packageVersion,
        entrypointPath: secondProbe.entrypointPath,
      });
      return runtimeCommand({ launchPlan, entrypointPath: secondProbe.entrypointPath });
    }

    const replacementReason = secondProbe.reason;
    installRuntimePackage({ env, launchPlan, reason: replacementReason });

    const installProbe = probeCachedRuntime(cache);
    if (installProbe.status === 'version-mismatch') {
      throw createStartupError({
        code: 'ALEMBIC_CODEX_RUNTIME_VERSION_MISMATCH_AFTER_INSTALL',
        message: `Installed Alembic runtime version ${installProbe.packageVersion} does not match ${RUNTIME_PACKAGE_VERSION}.`,
        exitCode: 70,
        details: {
          expected: RUNTIME_PACKAGE_VERSION,
          actual: installProbe.packageVersion ?? null,
          packageRoot: cache.packageRoot,
        },
        nextAction:
          'Clear the Alembic runtime cache and verify the npm package published for the pinned version.',
      });
    }
    if (installProbe.status === 'entrypoint-missing') {
      throw createStartupError({
        code: 'ALEMBIC_CODEX_RUNTIME_ENTRYPOINT_MISSING',
        message: 'The pinned Alembic runtime package installed, but its MCP entrypoint is missing.',
        exitCode: 70,
        details: {
          entrypointPath: installProbe.entrypointPath,
          packageRoot: cache.packageRoot,
          packageVersion: installProbe.packageVersion ?? null,
        },
        nextAction:
          'Verify the runtime package bin mapping and republish the package if the entrypoint is absent.',
      });
    }
    if (installProbe.status !== 'ready') {
      throw createStartupError({
        code: 'ALEMBIC_CODEX_RUNTIME_INSTALL_INCOMPLETE',
        message: `Alembic runtime install finished, but cache probe still failed: ${installProbe.reason}`,
        exitCode: 70,
        details: {
          reason: installProbe.reason,
          packageRoot: cache.packageRoot,
        },
        nextAction: 'Inspect the npm install output and remove the runtime cache before retrying.',
      });
    }

    emitTrace(env, 'runtime-install-ready', {
      cacheRoot: cache.cacheRoot,
      packageVersion: installProbe.packageVersion,
      entrypointPath: installProbe.entrypointPath,
      replacementReason,
    });
    return runtimeCommand({ launchPlan, entrypointPath: installProbe.entrypointPath });
  } finally {
    releaseRuntimeLock(lock);
  }
}

function installRuntimePackage({ env, launchPlan, reason }) {
  const cache = launchPlan.runtimeCache;
  assertNpmAvailable({ env, command: launchPlan.npm.command });
  rmSync(cache.packageRoot, { recursive: true, force: true });
  mkdirSync(cache.installRoot, { recursive: true });
  mkdirSync(cache.npmCacheDir, { recursive: true });

  emitTrace(env, 'runtime-install-start', {
    cacheRoot: cache.cacheRoot,
    installRoot: cache.installRoot,
    packageSpecifier: RUNTIME_PACKAGE_SPECIFIER,
    reason,
  });

  const result = spawnSync(launchPlan.npm.command, launchPlan.npm.args, {
    cwd: cache.installRoot,
    env: {
      ...env,
      npm_config_cache: env.npm_config_cache || cache.npmCacheDir,
    },
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  });
  if (result.error) {
    throw createStartupError({
      code:
        result.error.code === 'ENOENT'
          ? 'ALEMBIC_CODEX_NPM_MISSING'
          : 'ALEMBIC_CODEX_RUNTIME_INSTALL_FAILED',
      message: result.error.message,
      exitCode: result.error.code === 'ENOENT' ? 127 : 70,
      details: {
        command: launchPlan.npm.command,
        args: launchPlan.npm.args,
        cacheRoot: cache.cacheRoot,
      },
      nextAction:
        'Install npm or configure ALEMBIC_CODEX_NPM_COMMAND to a working npm executable, then retry.',
    });
  }
  if (result.status !== 0) {
    throw createStartupError({
      code: 'ALEMBIC_CODEX_RUNTIME_INSTALL_FAILED',
      message: `npm install failed for ${RUNTIME_PACKAGE_SPECIFIER}.`,
      exitCode: result.status || 70,
      details: {
        command: launchPlan.npm.command,
        args: launchPlan.npm.args,
        cacheRoot: cache.cacheRoot,
        failureClass: classifyInstallFailure(result.stderr || result.stdout),
        stdoutTail: tail(result.stdout),
        stderrTail: tail(result.stderr),
      },
      nextAction:
        'Check network/registry access and that the exact Alembic runtime package version exists.',
    });
  }
}

async function acquireRuntimeLock({ env, lockDir, timeoutMs, staleMs }) {
  const startedAt = Date.now();
  while (true) {
    try {
      mkdirSync(lockDir, { recursive: false });
      const lock = {
        pid: process.pid,
        acquiredAt: new Date().toISOString(),
        acquiredAtMs: Date.now(),
        source: STARTUP_SOURCE,
      };
      writeFileSync(join(lockDir, 'owner.json'), `${JSON.stringify(lock, null, 2)}\n`);
      emitTrace(env, 'runtime-lock-acquired', { lockDir, pid: process.pid });
      return { lockDir };
    } catch (error) {
      if (error?.code !== 'EEXIST') {
        throw createStartupError({
          code: 'ALEMBIC_CODEX_RUNTIME_LOCK_FAILED',
          message: error?.message || 'Unable to create Alembic runtime startup lock.',
          exitCode: 70,
          details: { lockDir },
          nextAction: 'Verify the Alembic runtime cache directory is writable and retry.',
        });
      }

      const owner = readLockOwner(lockDir);
      const ageMs = Date.now() - (owner.acquiredAtMs || 0);
      if (owner.acquiredAtMs > 0 && ageMs > staleMs) {
        rmSync(lockDir, { recursive: true, force: true });
        emitTrace(env, 'runtime-lock-stale-removed', { lockDir, ageMs, staleMs, owner });
        continue;
      }

      if (Date.now() - startedAt >= timeoutMs) {
        throw createStartupError({
          code: 'ALEMBIC_CODEX_RUNTIME_LOCK_TIMEOUT',
          message: 'Timed out waiting for another Alembic runtime startup/install lock.',
          exitCode: 75,
          details: {
            lockDir,
            timeoutMs,
            staleMs,
            owner,
          },
          nextAction:
            'Wait for the other startup to finish, or remove the stale lock after confirming no install is running.',
        });
      }

      await delay(Math.min(100, Math.max(10, timeoutMs - (Date.now() - startedAt))));
    }
  }
}

function releaseRuntimeLock(lock) {
  if (!lock?.lockDir) {
    return;
  }
  rmSync(lock.lockDir, { recursive: true, force: true });
}

function selectRuntimeCache({ env, pluginRoot, verifyWritable }) {
  const explicit = env.ALEMBIC_CODEX_RUNTIME_CACHE_DIR || env.ALEMBIC_CODEX_RUNTIME_CACHE;
  const candidates = [];
  if (explicit) {
    candidates.push({ source: 'env', cacheRoot: resolve(explicit), required: true });
  }
  for (const envName of ['ALEMBIC_CODEX_PLUGIN_DATA_DIR', 'CODEX_PLUGIN_DATA_DIR', 'PLUGIN_DATA']) {
    const value = env[envName];
    if (value) {
      candidates.push({
        source: envName,
        cacheRoot: resolve(value, 'alembic-codex-runtime'),
        required: false,
      });
    }
  }
  candidates.push({
    source: 'plugin-root',
    cacheRoot: resolve(pluginRoot, '.runtime'),
    required: false,
  });
  candidates.push({
    source: 'user-cache',
    cacheRoot: resolve(userCacheRoot(env), 'alembic', 'codex-runtime'),
    required: true,
  });

  const errors = [];
  for (const candidate of candidates) {
    const paths = runtimeCachePaths(candidate);
    if (!verifyWritable) {
      return paths;
    }
    try {
      ensureWritableDirectory(paths.cacheRoot);
      return paths;
    } catch (error) {
      errors.push({ source: candidate.source, cacheRoot: candidate.cacheRoot, error: error.message });
      if (candidate.required) {
        throw createStartupError({
          code: 'ALEMBIC_CODEX_RUNTIME_CACHE_NOT_WRITABLE',
          message: `Alembic runtime cache is not writable: ${candidate.cacheRoot}`,
          exitCode: 73,
          details: { candidate, errors },
          nextAction:
            'Choose a writable cache with ALEMBIC_CODEX_RUNTIME_CACHE_DIR or fix permissions for the selected cache.',
        });
      }
    }
  }

  throw createStartupError({
    code: 'ALEMBIC_CODEX_RUNTIME_CACHE_NOT_WRITABLE',
    message: 'No writable Alembic runtime cache directory is available.',
    exitCode: 73,
    details: { errors },
    nextAction:
      'Choose a writable cache with ALEMBIC_CODEX_RUNTIME_CACHE_DIR or fix plugin data directory permissions.',
  });
}

function runtimeCachePaths(candidate) {
  const installRoot = resolve(candidate.cacheRoot, 'runtime-install');
  const packageRoot = resolve(
    installRoot,
    'node_modules',
    ...RUNTIME_PACKAGE_NAME.split('/')
  );
  return {
    source: candidate.source,
    cacheRoot: candidate.cacheRoot,
    installRoot,
    packageRoot,
    entrypointPath: resolve(packageRoot, 'dist', 'bin', 'codex-mcp.js'),
    lockDir: resolve(candidate.cacheRoot, '.install.lock'),
    npmCacheDir: resolve(candidate.cacheRoot, 'npm-cache'),
  };
}

function probeCachedRuntime(cache) {
  const packageJsonPath = join(cache.packageRoot, 'package.json');
  if (!existsSync(packageJsonPath)) {
    return { status: 'missing', reason: 'package-json-missing' };
  }
  const packageJson = readJsonOrNull(packageJsonPath);
  if (!packageJson) {
    return { status: 'invalid', reason: 'package-json-invalid' };
  }
  if (packageJson.name !== RUNTIME_PACKAGE_NAME) {
    return {
      status: 'invalid',
      reason: 'package-name-mismatch',
      packageVersion: packageJson.version,
    };
  }
  if (packageJson.version !== RUNTIME_PACKAGE_VERSION) {
    return {
      status: 'version-mismatch',
      reason: 'package-version-mismatch',
      packageVersion: packageJson.version,
    };
  }

  const entrypointPath = resolveRuntimeEntrypoint(cache.packageRoot, packageJson);
  if (!existsSync(entrypointPath)) {
    return {
      status: 'entrypoint-missing',
      reason: 'runtime-entrypoint-missing',
      packageVersion: packageJson.version,
      entrypointPath,
    };
  }
  return {
    status: 'ready',
    reason: 'ready',
    packageVersion: packageJson.version,
    entrypointPath,
  };
}

function resolveRuntimeEntrypoint(packageRoot, packageJson) {
  const bin = packageJson.bin;
  if (typeof bin === 'string') {
    return resolve(packageRoot, bin);
  }
  if (bin && typeof bin === 'object' && typeof bin[RUNTIME_BIN] === 'string') {
    return resolve(packageRoot, bin[RUNTIME_BIN]);
  }
  return resolve(packageRoot, 'dist', 'bin', 'codex-mcp.js');
}

function runtimeCommand({ launchPlan, entrypointPath }) {
  return {
    command: process.execPath,
    args: [entrypointPath, ...runtimeArgs],
    env: launchPlan.env,
  };
}

function assertNpmAvailable({ env, command }) {
  const result = spawnSync(command, ['--version'], {
    env,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024,
  });
  if (result.error || result.status !== 0) {
    throw createStartupError({
      code: 'ALEMBIC_CODEX_NPM_MISSING',
      message: result.error?.message || `npm version check failed for ${command}.`,
      exitCode: 127,
      details: {
        command,
        status: result.status,
        stderrTail: tail(result.stderr),
      },
      nextAction:
        'Install npm or configure ALEMBIC_CODEX_NPM_COMMAND to a working npm executable, then retry.',
    });
  }
}

function buildNpmInstallArgs(installRoot) {
  return [
    'install',
    '--prefix',
    installRoot,
    '--no-save',
    '--no-audit',
    '--no-fund',
    '--omit=dev',
    '--package-lock=false',
    RUNTIME_PACKAGE_SPECIFIER,
  ];
}

function collectRuntimeArgs(args) {
  const separator = args.indexOf('--');
  if (separator >= 0) {
    return args.slice(separator + 1);
  }
  return args.filter((arg) => arg !== '--dry-run');
}

function summarizePublicEnv(env) {
  return {
    ALEMBIC_CHANNEL_ID: env.ALEMBIC_CHANNEL_ID,
    ALEMBIC_CODEX_ENABLE_ADMIN: env.ALEMBIC_CODEX_ENABLE_ADMIN,
    ALEMBIC_CODEX_MCP_MODE: env.ALEMBIC_CODEX_MCP_MODE,
    ALEMBIC_CODEX_PLUGIN_ROOT: env.ALEMBIC_CODEX_PLUGIN_ROOT,
    ALEMBIC_CODEX_RUNTIME_CACHE_DIR: env.ALEMBIC_CODEX_RUNTIME_CACHE_DIR,
    ALEMBIC_CODEX_RUNTIME_PACKAGE_SPECIFIER: env.ALEMBIC_CODEX_RUNTIME_PACKAGE_SPECIFIER,
    ALEMBIC_MCP_MODE: env.ALEMBIC_MCP_MODE,
    ALEMBIC_MCP_TIER: env.ALEMBIC_MCP_TIER,
    ALEMBIC_PLUGIN_HOST: env.ALEMBIC_PLUGIN_HOST,
    ALEMBIC_RUNTIME_MODE: env.ALEMBIC_RUNTIME_MODE,
  };
}

function ensureWritableDirectory(path) {
  mkdirSync(path, { recursive: true });
  const probe = join(path, `.write-test-${process.pid}-${Date.now()}`);
  writeFileSync(probe, 'ok\n');
  unlinkSync(probe);
}

function userCacheRoot(env) {
  if (env.XDG_CACHE_HOME) {
    return env.XDG_CACHE_HOME;
  }
  if (platform() === 'darwin') {
    return join(homedir(), 'Library', 'Caches');
  }
  return join(homedir(), '.cache');
}

function isOfflineMode(env) {
  return (
    env.ALEMBIC_CODEX_RUNTIME_OFFLINE === '1' ||
    env.ALEMBIC_CODEX_NO_NETWORK === '1' ||
    env.npm_config_offline === 'true'
  );
}

function offlineErrorCode(probe) {
  if (probe.status === 'version-mismatch') {
    return 'ALEMBIC_CODEX_RUNTIME_VERSION_MISMATCH_OFFLINE';
  }
  if (probe.status === 'entrypoint-missing') {
    return 'ALEMBIC_CODEX_RUNTIME_ENTRYPOINT_MISSING';
  }
  return 'ALEMBIC_CODEX_RUNTIME_CACHE_MISS_OFFLINE';
}

function readLockOwner(lockDir) {
  const ownerPath = join(lockDir, 'owner.json');
  const owner = readJsonOrNull(ownerPath) || {};
  return {
    pid: Number.isInteger(owner.pid) ? owner.pid : null,
    acquiredAt: typeof owner.acquiredAt === 'string' ? owner.acquiredAt : null,
    acquiredAtMs: Number.isFinite(owner.acquiredAtMs) ? owner.acquiredAtMs : 0,
    source: typeof owner.source === 'string' ? owner.source : null,
  };
}

function readJsonOrNull(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value || ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function classifyInstallFailure(text) {
  if (/ENOTFOUND|EAI_AGAIN|network|timeout/i.test(text)) {
    return 'network-or-registry-unavailable';
  }
  if (/404|not found/i.test(text)) {
    return 'package-not-found';
  }
  return 'install-failed';
}

function tail(text, maxLength = 4000) {
  const value = String(text || '');
  return value.length > maxLength ? value.slice(value.length - maxLength) : value;
}

function emitTrace(env, event, details) {
  if (env.ALEMBIC_CODEX_START_TRACE !== '1') {
    return;
  }
  writeStartupDiagnostic({
    ok: true,
    event,
    source: STARTUP_SOURCE,
    details,
  });
}

function writeStartupDiagnostic(diagnostic) {
  process.stderr.write(`${JSON.stringify({ source: STARTUP_SOURCE, ...diagnostic }, null, 2)}\n`);
}

function createStartupError({ code, message, exitCode, details, nextAction }) {
  const error = new Error(message);
  error.startupDiagnostic = {
    ok: false,
    code,
    message,
    exitCode,
    runtimePackage: {
      name: RUNTIME_PACKAGE_NAME,
      version: RUNTIME_PACKAGE_VERSION,
      specifier: RUNTIME_PACKAGE_SPECIFIER,
      bin: RUNTIME_BIN,
    },
    details,
    nextAction,
    source: STARTUP_SOURCE,
  };
  return error;
}

function normalizeStartupError(error) {
  if (error?.startupDiagnostic) {
    return error.startupDiagnostic;
  }
  return {
    ok: false,
    code: 'ALEMBIC_CODEX_RUNTIME_STARTUP_UNEXPECTED',
    message: error?.message || String(error),
    exitCode: 1,
    runtimePackage: {
      name: RUNTIME_PACKAGE_NAME,
      version: RUNTIME_PACKAGE_VERSION,
      specifier: RUNTIME_PACKAGE_SPECIFIER,
      bin: RUNTIME_BIN,
    },
    nextAction: 'Rerun Alembic diagnostics with ALEMBIC_CODEX_START_TRACE=1 and inspect stderr.',
    source: STARTUP_SOURCE,
  };
}

function delay(ms) {
  return new Promise((resolveDelay) => {
    setTimeout(resolveDelay, ms);
  });
}
