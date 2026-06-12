# Alembic Codex Plugin Release Playbook

This playbook describes how to release, test, and promote the Alembic Codex plugin. AlembicPlugin keeps the root package private. The public installable plugin is a lightweight marketplace shell in `GxFn/AlembicCodex`; runtime code is consumed through the exact pinned npm package `@gxfn/alembic-runtime@0.2.0`.

## Release Model

Alembic for Codex is built from the AlembicPlugin repository with explicit sibling source checkouts for shared packages:

- Local development uses `@alembic/core: file:../AlembicCore`.
- Dashboard frontend source, build, packaging, and serving belong to Alembic/AlembicDashboard.
- The AlembicPlugin root package is private and is not a registry distribution package.
- The Codex plugin submodule is `plugins/alembic-codex` -> `GxFn/AlembicCodex`.
- The installable plugin shell is `plugins/alembic-codex`.
- The shell entry is `plugins/alembic-codex/bin/alembic-codex-start.mjs`.
- The runtime package boundary is `packages/alembic-codex-runtime`, published or consumed as `@gxfn/alembic-runtime@0.2.0`.
- The repo-local Codex marketplace entry is `.agents/plugins/marketplace.json`.

The plugin MCP config starts the shell:

```json
{
  "command": "node",
  "args": ["./bin/alembic-codex-start.mjs"],
  "cwd": "."
}
```

The shell installs `@gxfn/alembic-runtime@0.2.0` into the Alembic startup cache when needed, reuses that cache on later launches, and starts the cached MCP entrypoint with Node. The public plugin shell must not contain `runtime.tgz`, `runtime/`, or `node_modules/`. First-run cache, upgrade, registry, and detailed failure semantics are owned by the shell bootstrap path.

Every package version bump must keep these surfaces aligned:

- `package.json`
- `package-lock.json`
- `packages/alembic-codex-runtime/package.json`
- `channels/codex/channel.json`
- `plugins/alembic-codex/.mcp.json`
- `plugins/alembic-codex/bin/alembic-codex-start.mjs`
- `plugins/alembic-codex/README.md`
- `plugins/alembic-codex/README.zh-CN.md`
- the `GxFn/AlembicCodex` submodule commit
- root `README.md` / `README_CN.md` when public instructions change

## Version And Tag Flow

Use the tag-driven GitHub Release workflow as the source of truth for plugin artifacts. Avoid local manual artifact assembly except for emergency recovery.

1. Choose the version, for example `0.2.0`.
2. Update package metadata to the same version.
3. Run local release checks:

```bash
npm run build
npm run prepare:codex-plugin-runtime
npm run verify:codex-runtime-package
npm run verify:release-package-boundary
npm run release:codex-plugin
npm run release:codex-plugin:daemon
```

4. Commit and push any plugin shell changes from inside `plugins/alembic-codex`.
5. Commit the updated `plugins/alembic-codex` pointer and release-readiness changes in the AlembicPlugin repository.
6. Push `main` and wait for CI to pass.
7. Create an annotated tag on the exact green commit:

```bash
git tag -a v0.2.0 -m "Release v0.2.0"
git push origin v0.2.0
```

8. Watch the `Release` workflow. It verifies the tag matches `package.json`, checks out sibling `AlembicCore`, builds runtime assets, runs lint, unit and integration tests, verifies the runtime package boundary, smokes the Codex plugin package, and uploads the Codex plugin shell artifacts.
9. Confirm the uploaded artifact includes plugin manifests, the shell startup script, plugin READMEs, `channels/codex/channel.json`, `packages/alembic-codex-runtime/package.json`, and `.agents/plugins/marketplace.json`.
10. Confirm no uploaded plugin shell artifact contains `runtime.tgz`, `runtime/`, or `node_modules/`.

## Release Workflow Contract

The GitHub `Release` workflow is expected to prove the release candidate and upload the plugin shell artifacts. The root package is private and the workflow must not contain a root registry publication step.

It must pass:

- Tag/package version equality check.
- `npm ci`.
- `npm run build`.
- `npm run prepare:codex-plugin-runtime`.
- `npm run verify:codex-runtime-package`.
- `npm run verify:codex-channel`.
- `npm run verify:codex-plugin`.
- `npm run verify:release-package-boundary`.
- Marketplace shell artifact check for `bin/alembic-codex-start.mjs` and absence of old embedded artifacts.
- `npm run lint -- --diagnostic-level=error`.
- `npm run test:unit`.
- `npm run test:integration`.
- `npm run smoke:codex-plugin`.
- `actions/upload-artifact` with the Codex plugin manifest, shell startup, marketplace/channel metadata, runtime package metadata, and READMEs.

`prepublishOnly` intentionally points to `npm run release:root-npm-publish:disabled` so an accidental root package registry attempt fails with an explicit artifact-only message. Run `npm run release:codex-plugin` directly for local plugin release readiness.

## Test Matrix

| Layer | Command / Action | What It Proves | Required When |
| --- | --- | --- | --- |
| Static plugin metadata | `npm run verify:codex-plugin` | Manifest, assets, skills, marketplace entry, shell entry, README release copy, and forbidden artifact absence | Every plugin metadata or docs change |
| Runtime build | `npm run build` | TypeScript builds and CLI/MCP bins are generated | Every code change |
| Runtime package boundary | `npm run verify:codex-runtime-package` | `@gxfn/alembic-runtime@0.2.0` packs without old public shell artifacts and pins Core correctly | Runtime package or release changes |
| Shell preparation | `npm run prepare:codex-plugin-runtime` | Public plugin shell is ready and points at the exact pinned runtime package | Every release candidate |
| Package/install smoke | `npm run smoke:codex-plugin -- --no-stdio` | Plugin artifact contents, local marketplace install simulation, shell dry-run startup | Docs/metadata/package files changes |
| MCP stdio smoke | `npm run smoke:codex-plugin` | Real MCP client can list/call Codex tools through stdio using the built runtime | MCP shim changes |
| Plugin submodule commit | `git -C plugins/alembic-codex status` | Dedicated `GxFn/AlembicCodex` repo contains the complete installable plugin shell | Every release candidate |
| Daemon smoke | `npm run release:codex-plugin:daemon` | Daemon API startup, daemon state, failed-closed Dashboard handoff, job recovery | Daemon/job/Dashboard bridge changes |
| Unit tests | `npm run test:unit` | Core behavior and Codex MCP unit contracts | Shared code changes |
| Integration tests | `npm run test:integration` | End-to-end service behavior without relying on the Codex app | HTTP/workflow/storage changes |
| CI | GitHub `CI` on `main` | Linux/Node 22 compatibility and clean checkout behavior | Before tagging |
| Release workflow | GitHub `Release` on `v*` tag | Plugin shell artifact release path | Every public plugin artifact release |
| Manual Codex app pass | Install/enable plugin, run first-minute prompts | Actual marketplace-style UX | Before public announcement |

## Manual Codex App Pass

Run this against a fresh test repository and one real project before public promotion.

1. Confirm the Alembic plugin appears in Codex plugins.
2. Enable/install the plugin.
3. Run `alembic_codex_diagnostics`.
4. Run `alembic_codex_status`.
5. If uninitialized, run `alembic_codex_init`.
6. Confirm Ghost mode did not create project-local `.asd/`, `Alembic/`, `.cursor/`, `.vscode/mcp.json`, or `.env`.
7. Run `alembic_codex_status` again and confirm the primary action is the agent-facing public prime path (`alembic_prime`, with `alembic_intent` available for intent normalization).
8. Run `alembic_codex_dashboard`; if no local Alembic Dashboard daemon is active, confirm it fails closed with `CODEX_DASHBOARD_HANDOFF_UNAVAILABLE` and no embedded URL.
9. Run `alembic_bootstrap` and confirm Codex receives a Mission Briefing for the host-agent workflow without requiring an AI Provider.
10. Optional daemon-job line: when the Alembic resident service is already configured for jobs, run `alembic_codex_bootstrap` and capture the job id.
11. Run `alembic_codex_job` with the job id from the optional provider-backed daemon job line.
12. Restart Codex or stop the daemon, then confirm `alembic_codex_job` returns a recoverable status instead of leaving the provider-backed daemon job stuck.
13. Run `alembic_codex_cleanup` without `confirm` and verify it is a dry run.

## Failure Triage

| Symptom | First Check | Likely Cause | Fix |
| --- | --- | --- | --- |
| Plugin visible but MCP does not start | `alembic codex diagnostics --json` | Node < 22, missing npm, runtime cache not writable, install failure, version mismatch, missing entrypoint, or startup lock timeout | Install Node 22, restore npm registry access, inspect shell bootstrap diagnostics and the Alembic runtime cache |
| Diagnostics runtime mismatch | `plugins/alembic-codex/.mcp.json` and `plugins/alembic-codex/bin/alembic-codex-start.mjs` | Plugin config no longer points at the shell entry or the shell no longer targets the exact runtime package | Run `npm run prepare:codex-plugin-runtime` and rerun `npm run verify:codex-plugin` |
| Artifact upload missing | Release workflow logs | Tag mismatch, tests failed, artifact upload path changed, or shell verification failed | Fix workflow failure, create a new patch version/tag |
| Daemon starts but tools fail | `alembic daemon status --json` and daemon log path | stale daemon state, missing bridge token, health identity mismatch | Stop daemon, rerun dashboard/bootstrap, inspect `daemon.log` |
| Job remains running forever | `alembic_codex_job` and Dashboard jobs page | daemon restart before interruption marking, old JobStore record | Restart daemon; lifecycle should mark active jobs failed with interruption reason |
| Codex creates project artifacts in Ghost mode | `alembic codex status --json` | setup profile regression or manual standard init | Fix setup profile; rerun on clean test project |

## Promotion Plan

### Positioning

Lead with one sentence:

> Alembic gives Codex local-first project memory, Recipes, Guard checks, and recoverable bootstrap jobs without forcing users to start a terminal service first.

Avoid positioning it as a generic agent framework. The strongest wedge is practical:

- Codex can prime itself with real project conventions before coding.
- Guard can check whether a diff matches those conventions.
- Bootstrap/rescan can build project memory in recoverable daemon jobs.
- Ghost mode keeps installation low-risk and outside the repository by default.

### Phase 1: Trusted Alpha

Goal: prove first-minute UX and reduce support surprises.

Ask testers to report whether the plugin installs, diagnostics pass, Ghost init avoids project pollution, `prime` improves coding answers, Guard catches actionable issues, and daemon/job wording is clear.

### Phase 2: Public Beta

Ship release notes, a short first-minute demo, README quickstart, issue template asking for redacted diagnostics, and known limitations: Node 22 required, first run may need registry access for the pinned runtime package, daemon is local-only.

### Phase 3: Use-Case Content

Publish examples for project priming, Guard checks, bootstrap/rescan recovery, and Dashboard handoff once the manual Codex app pass is green on the exact shell and runtime package version.
