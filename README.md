# Alembic Codex Plugin

Alembic for Codex gives Codex local project memory without turning every chat into a setup session. It starts with a lightweight MCP shim, reports diagnostics and workspace status without initializing the database, initializes in Ghost mode by default, then starts or connects to the per-workspace daemon only when project knowledge, Guard, Dashboard, Codex host-agent bootstrap/rescan, or explicit provider-backed daemon jobs are requested.

Chinese version: [README.zh-CN.md](README.zh-CN.md)

Use it when you want Codex to:

- Prime itself with project Recipes before coding.
- Start/finish tracked work and run scoped Guard checks against the current change.
- Build or refresh project knowledge through Codex host-agent workflows.
- Open the local Dashboard only when a visual handoff is useful.

## Install

Install this repository as a Codex plugin marketplace:

```bash
codex plugin marketplace add GxFn/AlembicCodex --ref main
```

For a pinned release after the matching Git tag exists:

```bash
codex plugin marketplace add GxFn/AlembicCodex --ref main
```

If Codex asks for a GitHub target or direct artifact path, use:

```text
GxFn/AlembicCodex
```

If the Codex dialog separates source, ref, and sparse path, fill it like this:

```text
Source:
GxFn/AlembicCodex

Git ref:
main

Sparse path:
leave empty
```

Enable `alembic-codex` from the plugin list after installation.

## Runtime

- Node.js 22 or newer is required. Node 22 LTS is recommended for local development; keep the MCP shim and daemon on the same Node executable.
- The plugin ships a lightweight marketplace shell, not embedded runtime files. The shell entry is `./bin/alembic-start.mjs`.
- The marketplace shell installs the exact pinned runtime package `alembic-runtime@0.3.0` into a deterministic startup cache when needed, reuses that cache on later launches, and starts the cached MCP entrypoint with Node.
- The marketplace MCP config sets `ALEMBIC_RUNTIME_MODE=plugin` as the generic plugin runtime signal and `ALEMBIC_PLUGIN_HOST=codex` as the current host signal.
- The marketplace MCP config explicitly sets `ALEMBIC_MCP_MODE=1` and `ALEMBIC_CODEX_MCP_MODE=1`; the binary still applies the same defaults as a safety net.
- The public plugin shell does not contain `runtime.tgz`, `runtime/`, or `node_modules/`.
- The shell keeps runtime installation outside the installed plugin directory. Detailed first-run cache, upgrade, and failure classification belongs to the shell bootstrap path.
- The default MCP tier is `agent`; admin tools stay hidden unless both `ALEMBIC_MCP_TIER=admin` and `ALEMBIC_CODEX_ENABLE_ADMIN=1` are set.

## First Checks

Use `alembic_status` first. It reports Node, npm, runtime package/cache wiring, daemon version, plugin metadata checks, portable runtime artifact guidance, cleanup policy, and structured `issues` / `nextActions`.

Use `alembic_status` to inspect workspace initialization and daemon state without starting the daemon. The response includes an `onboarding` block with a concise state, primary recommended tool call, whether that call starts the daemon, and follow-up actions.

Outside Codex, the same runtime checks are available from the CLI:

```bash
alembic codex diagnostics --json
alembic codex status --json
```

The normal first minute is:

1. `alembic_status`
2. `alembic_status`
3. `alembic_init` when status reports `needs_init`
4. `alembic_bootstrap` for first project knowledge, `alembic_rescan` to refresh existing knowledge, or direct standalone `alembic_prime` before coding work

Codex MCP tool calls return clean `structuredContent`: `ok`, `status`, `summary`, optional `error`, optional `meta`, and tool-specific fields. Visible tool text is summary-only, so host integrations should not parse legacy JSON envelopes from text.

## Long-Running Jobs

`alembic_bootstrap` and `alembic_rescan` are the default Codex host-agent workflows. Codex reads the Mission Briefing, analyzes the project, submits knowledge, and completes dimensions. These workflows do not require an Alembic AI Provider.

`alembic_job` and `alembic_job` are explicit provider-backed Alembic daemon jobs. They require configured AI Provider credentials and return a durable job id immediately. Use `alembic_job` with that id to resume status checks after Codex reconnects or the local Alembic UI refreshes.

If the Alembic daemon shuts down or restarts before an active provider-backed daemon job completes, the next daemon lifecycle marks that job as `failed` with an interruption reason instead of leaving it stuck in `queued` or `running`. Start a new provider-backed daemon job or use the host-agent workflow to retry.

## Release Verification

Before publishing, run:

```bash
npm run release:codex-plugin
```

The release check builds the runtime, verifies the `alembic-runtime@0.3.0` package boundary, validates the lightweight marketplace shell, checks the `alembic-codex-mcp` binary, default agent tier, disabled admin gate, declared assets, shipped skills, default prompts, package tarball contents, local install simulation, shell dry-run startup, and real MCP stdio calls. Dashboard frontend build and serving belong to Alembic/AlembicDashboard; this plugin only hands off a local Dashboard URL when that daemon capability is already available.

For the full local daemon path, run:

```bash
npm run release:codex-plugin:daemon
```

That optional variant also starts the daemon on a temporary localhost port and verifies interrupted job recovery. `prepublishOnly` runs `release:codex-plugin`.

After release checks pass, commit and push any changed plugin files from inside this submodule, then commit the updated `plugins/alembic-codex` pointer in the Alembic monorepo.

For the full release, testing, and promotion plan, see [RELEASE-PLAYBOOK.md](./RELEASE-PLAYBOOK.md).

## Local Marketplace

This distribution repository includes `.agents/plugins/marketplace.json` so Codex can add the repository itself as a plugin marketplace. The marketplace is named `gxfn`, the single entry points to `.`, installation is `AVAILABLE`, and authentication is `ON_INSTALL`.

Register this repository as a local marketplace during development:

```toml
[marketplaces.gxfn]
source_type = "local"
source = "/absolute/path/to/Alembic/plugins/alembic-codex"

[plugins."alembic@gxfn"]
enabled = true
```

The Alembic monorepo also keeps a local development marketplace at `.agents/plugins/marketplace.json`, named `gxfn`, pointing to `./plugins/alembic-codex`.

`npm run smoke:codex-plugin` packs the release contents, resolves this marketplace entry from the tarball, copies the plugin into a temporary install root, validates the installed manifest, shell entry, forbidden artifact absence, MCP config, assets, skills, shell dry-run startup, and stdio MCP calls.

## Offline Fallback

The default plugin config launches `alembic-runtime@0.3.0` through the marketplace shell. If the first run cannot resolve production dependencies, restore registry access for npm, clear the Alembic runtime cache if needed, and rerun `alembic_status`.

## Cleanup Policy

Uninstalling the plugin never removes Alembic data automatically. Use `alembic_runtime` for an explicit cleanup flow. The default call is a dry run; `confirm=true` only removes daemon runtime state, logs, locks, and job files. Knowledge, Recipes, candidates, and project data are left intact.
