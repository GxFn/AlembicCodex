---
name: alembic
description: Use Alembic from Codex. Start here for status, initialization, project priming, Guard checks, Codex host-agent bootstrap/rescan workflows, explicit internal AI jobs, Dashboard handoff, and permission boundaries.
---

# Alembic Codex Workflow

Use this skill when the user asks Codex to work with project conventions, local knowledge, Guard checks, Codex host-agent bootstrap/rescan workflows, explicit internal AI jobs, or Alembic itself.

## First Move

Call `alembic_codex_status` before assuming Alembic is initialized. This status check is local and must not start the daemon.

If status reports runtime or environment problems, call `alembic_codex_diagnostics` and surface the suggested fix. Diagnostics also runs without starting the daemon.

If status or diagnostics says the project root is unresolved or points inside the Codex plugin cache, pass the current workspace directory as the `projectRoot` argument on subsequent Alembic tool calls. `projectRoot` must be an absolute path; without it, Alembic project workflows cannot run.

If the workspace is not initialized and the user wants Alembic knowledge for this project, call `alembic_codex_init`. The default profile is Ghost mode, so Alembic data is stored in the external workspace data root and Codex does not write IDE configuration into the project.

## Daily Coding Flow

For non-trivial coding tasks:

1. Call `alembic_task` with `operation: "prime"` and include the user's task.
2. Use `alembic_search`, `alembic_knowledge`, or `alembic_structure` when more project context is needed.
3. Make code changes according to approved Recipes and project evidence.
4. Call `alembic_guard` after meaningful edits, especially before summarizing completion.
5. If a reusable convention appears, submit a candidate with `alembic_submit_knowledge`; do not write Recipe files directly.

## Long-Running Work

Use `alembic_bootstrap` for default Codex host-agent cold start and `alembic_rescan` for host-agent refresh. Codex reads the Mission Briefing, analyzes the project, submits knowledge, and completes dimensions; this path does not require an Alembic AI Provider.

Use `alembic_codex_bootstrap` and `alembic_codex_rescan` only when the user explicitly wants Alembic internal AI daemon jobs and the AI Provider is configured. These tools start or connect to the daemon, enqueue work, and return a recoverable job id.

Use `alembic_codex_job` to check explicit internal AI job status later. Job lookup is local and should not start the daemon.

Use `alembic_codex_dashboard` when the user needs review, candidates, or progress visualization and a local Alembic Dashboard daemon is already available for the selected project. Return its URL instead of opening a browser yourself; if the tool reports missing Dashboard handoff capability, surface that next step instead of inventing an embedded Dashboard URL.

## Permission Boundary

Default Codex mode is agent tier. It may search knowledge, prime tasks, run Guard, use host-agent bootstrap/rescan, and submit candidates. Explicit internal AI daemon jobs require a configured AI Provider.

Do not publish, deprecate, delete, or directly edit Recipes from the default tier. Admin tools only appear when both `ALEMBIC_MCP_TIER=admin` and `ALEMBIC_CODEX_ENABLE_ADMIN=1` are set.

Do not edit host configuration files, `AGENTS.md`, or project Alembic data unless the user explicitly asks for a standard, project-written setup.

## Cleanup

Plugin uninstall never removes user data. Use `alembic_codex_cleanup` for explicit cleanup. The default call is a dry run; `confirm=true` only removes daemon runtime state, logs, locks, and job files.

## Related Skills

- `alembic-recipes`: Recipe lookup and application.
- `alembic-create`: Candidate submission rules.
- `alembic-guard`: Compliance checks.
- `alembic-structure`: Project targets, files, metadata, graph, and call context.
- `alembic-devdocs`: Wiki planning, article writing, and finalize.
