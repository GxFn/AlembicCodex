#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RUNTIME_PACKAGE_NAME = '@gxfn/alembic-codex-runtime';
const RUNTIME_PACKAGE_VERSION = '0.2.0';
const RUNTIME_PACKAGE_SPECIFIER = '@gxfn/alembic-codex-runtime@0.2.0';
const RUNTIME_BIN = 'alembic-codex-mcp';
const STARTUP_SOURCE = 'alembic-codex-start';

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const rawArgs = process.argv.slice(2);
const dryRun = rawArgs.includes('--dry-run') || process.env.ALEMBIC_CODEX_START_DRY_RUN === '1';
const runtimeArgs = collectRuntimeArgs(rawArgs);
const launchPlan = buildLaunchPlan({ env: process.env, pluginRoot, runtimeArgs });

if (dryRun) {
  const { env: childEnv, ...publicPlan } = launchPlan;
  process.stdout.write(
    `${JSON.stringify({ ok: true, ...publicPlan, env: summarizePublicEnv(childEnv) }, null, 2)}\n`
  );
  process.exit(0);
}

const child = spawn(launchPlan.command, launchPlan.args, {
  cwd: launchPlan.cwd,
  env: launchPlan.env,
  stdio: 'inherit',
});

child.on('error', (error) => {
  process.stderr.write(
    `${JSON.stringify(
      {
        ok: false,
        code: 'ALEMBIC_CODEX_RUNTIME_START_FAILED',
        message: error.message,
        command: launchPlan.command,
        args: launchPlan.args,
        cwd: launchPlan.cwd,
        runtimePackage: launchPlan.runtimePackage,
        nextAction:
          'Confirm npm/npx can resolve the pinned Alembic Codex runtime package, then rerun diagnostics.',
        source: STARTUP_SOURCE,
      },
      null,
      2
    )}\n`
  );
  process.exit(127);
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});

function buildLaunchPlan(input) {
  const command = input.env.ALEMBIC_CODEX_NPX_COMMAND || 'npx';
  const args = ['-y', '--package', RUNTIME_PACKAGE_SPECIFIER, RUNTIME_BIN, ...input.runtimeArgs];
  const env = {
    ...input.env,
    ALEMBIC_CHANNEL_ID: input.env.ALEMBIC_CHANNEL_ID || 'codex',
    ALEMBIC_CODEX_ENABLE_ADMIN: input.env.ALEMBIC_CODEX_ENABLE_ADMIN || '0',
    ALEMBIC_CODEX_MCP_MODE: '1',
    ALEMBIC_CODEX_PLUGIN_ROOT: input.pluginRoot,
    ALEMBIC_MCP_MODE: '1',
    ALEMBIC_MCP_TIER: input.env.ALEMBIC_MCP_TIER || 'agent',
    ALEMBIC_PLUGIN_HOST: input.env.ALEMBIC_PLUGIN_HOST || 'codex',
    ALEMBIC_RUNTIME_MODE: input.env.ALEMBIC_RUNTIME_MODE || 'plugin',
  };

  return {
    schemaVersion: 1,
    source: STARTUP_SOURCE,
    command,
    args,
    cwd: input.pluginRoot,
    runtimePackage: {
      name: RUNTIME_PACKAGE_NAME,
      version: RUNTIME_PACKAGE_VERSION,
      specifier: RUNTIME_PACKAGE_SPECIFIER,
      bin: RUNTIME_BIN,
    },
    env,
  };
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
    ALEMBIC_MCP_MODE: env.ALEMBIC_MCP_MODE,
    ALEMBIC_MCP_TIER: env.ALEMBIC_MCP_TIER,
    ALEMBIC_PLUGIN_HOST: env.ALEMBIC_PLUGIN_HOST,
    ALEMBIC_RUNTIME_MODE: env.ALEMBIC_RUNTIME_MODE,
  };
}
