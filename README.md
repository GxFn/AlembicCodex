# Alembic Codex Plugin

Alembic for Codex gives Codex local project memory without turning every chat into a setup session. Every MCP request resolves its own project root, data root, and database through the Plugin runtime; tools remain listed and callable before initialization and return truthful empty or unavailable results when knowledge is absent.

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

- Node.js 22 or newer is required. Node 22 LTS is recommended for local development.
- The plugin ships a lightweight marketplace shell, not embedded runtime files. The shell entry is `./bin/alembic-start.mjs`.
- The marketplace shell installs the exact pinned runtime package `alembic-runtime@0.3.0` into a deterministic startup cache when needed, reuses that cache on later launches, and starts the cached MCP entrypoint with Node.
- The marketplace MCP config sets `ALEMBIC_RUNTIME_MODE=plugin` as the generic plugin runtime signal and `ALEMBIC_PLUGIN_HOST=codex` as the current host signal.
- The marketplace MCP config explicitly sets `ALEMBIC_MCP_MODE=1` and `ALEMBIC_CODEX_MCP_MODE=1`; the binary still applies the same defaults as a safety net.
- The public plugin shell does not contain `runtime.tgz`, `runtime/`, or `node_modules/`.
- The shell keeps runtime installation outside the installed plugin directory. Detailed first-run cache, upgrade, and failure classification belongs to the shell bootstrap path.
- Every MCP tool is exposed on one ordinary surface; tool-local input and destructive-write confirmation still apply.

## Security

This plugin is a lightweight distribution shell, not the runtime itself. A security scan will flag `bin/alembic-start.mjs` for using `node:child_process` (`spawn` / `spawnSync`). That usage is deliberate, minimal, and limited to running one specific, version-pinned, publicly published package — never arbitrary or user-supplied code:

- **Runtime install** — on first use the shell runs `npm install alembic-runtime@0.3.0` into a local startup cache. It ships no runtime files (no `runtime.tgz`, `runtime/`, or `node_modules/`) so the marketplace artifact stays small and within risk limits; the runtime is fetched from the public npm registry as a fixed `name@version`.
- **Runtime launch** — it then starts the cached runtime's MCP entrypoint with Node. The installed package **name and version are validated against `alembic-runtime@0.3.0` before launch**; a mismatch aborts instead of executing.
- **npm preflight** — a `npm --version` check only produces a clear error when npm is missing.

There is no `eval`, no remote code beyond the pinned npm install, and Ghost mode keeps the footprint minimal until you explicitly request project knowledge, Guard, Dashboard, or bootstrap workflows. This lightweight-shell + pinned-runtime pattern is the standard way to distribute a larger MCP runtime through the marketplace without embedding it in the plugin artifact. Each `bin/alembic-start.mjs` call site is annotated inline with the same rationale.

## First Checks

Use `alembic_status` first. It reports the current request project's root, project id, Ghost/data-root/database location, database existence, and compact runtime facts.

Use `alembic_status` to inspect only the current request project; no saved selection or prior process state can change the result.

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

`alembic_job` runs and reads Plugin-owned local bootstrap/rescan jobs scoped to the current request project.

## Release Verification

Before publishing, run:

```bash
npm run release:codex-plugin
```

The release check builds the runtime, verifies the `alembic-runtime@0.3.0` package boundary, validates the lightweight marketplace shell, checks the `alembic-codex-mcp` binary, declared assets, shipped skills, default prompts, package tarball contents, local install simulation, shell dry-run startup, and real request-scoped MCP stdio calls. `prepublishOnly` runs `release:codex-plugin`.

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

Uninstalling the plugin never removes Alembic data automatically. Use `alembic_runtime` for an explicit cleanup flow. The default call is a dry run; `confirm=true` only removes Plugin job files. Knowledge, Recipes, candidates, and project data are left intact.
