# Alembic Codex Plugin Release Playbook

The released Plugin is a standalone, request-scoped MCP runtime. Every call uses
the explicit `projectRoot`, or the current host workspace root when omitted. A
saved project selection or prior process state is never an identity source.

## Version And Tag Flow

1. Build and verify the exact `alembic-runtime@0.3.0` package referenced by the
   Plugin manifest and lockfile.
2. Confirm the Plugin version, runtime package version, release tag, and
   marketplace revision describe the same source commit.
3. Create or promote a tag only after every automated and manual gate below
   passes against that exact package.

## Test Matrix

Run from the AlembicPlugin repository:

```bash
npm run test:unit
npm run check
npm run build
npm run verify:codex-runtime-package
npm run verify:plugin-distribution
npm run verify:codex-plugin
```

Then run `npm run release:codex-plugin` for the packaged shell and stdio smoke.

The automated matrix covers unit behavior, repository and layer boundaries,
the packaged runtime, the Plugin distribution, and the installed Plugin shell.

## Manual Codex App Pass

1. Install the exact built Plugin package and restart Codex.
2. Call `alembic_status` with two different explicit project roots and verify
   distinct project id, data root, and database paths.
3. Call Search, Graph, Recipe Map, Prime, and Guard for each root.
4. Confirm a project without a database returns each tool's native empty or
   unavailable result and does not initialize anything automatically.
5. Confirm all tools remain listed before and after initialization.
6. Confirm Prime accepts an empty request or optional `query` / `context`.
7. Confirm status and the five knowledge tools expose no revision/checkpoint
   posture and do not change when Git HEAD or the working tree changes.

## Promotion Plan

Promote the already-verified package from the release candidate to the Plugin
marketplace without rebuilding it. If any automated gate, manual request-scope
case, version check, or representative JSON check fails, do not tag or promote;
fix the same source revision and restart the full matrix.

## Release evidence

Record the commit, gate summaries, packaged version, tool-list snapshot, and
representative JSON from both a knowledge-present and no-database project. Do
not include credentials, private paths, or host thread identifiers.
