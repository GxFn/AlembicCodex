---
name: alembic
description: Use Alembic setup/status/diagnostics/bootstrap/rescan when the user explicitly asks for Alembic. When the current project has a project-level Alembic knowledge skill or local Alembic knowledge base, use the agent-facing intent, prime, work, Guard, and decision tools proactively. For empty projects, do not proactively prime unless the user explicitly asks for Alembic.
---

# Alembic Codex Workflow

Use this skill when the user explicitly asks Codex to work with Alembic setup, status, diagnostics, bootstrap/rescan workflows, local knowledge, Guard checks, or Alembic itself.

Knowledge-dependent Alembic behavior is project-scoped. Use Recipes, Guard, project knowledge, structure, priming, or knowledge search proactively only when the current project has a project-level Alembic knowledge skill in `.agents/skills` or a local Alembic knowledge base. Empty or uninitialized projects should not trigger proactive knowledge work unless the user explicitly asks for Alembic setup, status, diagnostics, bootstrap, rescan, Guard, or knowledge operations.

## First Move

Call `alembic_mcp_status` before assuming Alembic is initialized. This status check is local and must not start the daemon.

If status reports runtime or environment problems, call `alembic_codex_diagnostics` and surface the suggested fix. Diagnostics also runs without starting the daemon.

If status or diagnostics says the project root is unresolved or points inside the Codex plugin cache, pass the current workspace directory as the `projectRoot` argument on subsequent Alembic tool calls. `projectRoot` must be an absolute path; without it, Alembic project workflows cannot run.

If the workspace is not initialized and the user wants Alembic knowledge for this project, call `alembic_mcp_init`. The default profile is Ghost mode, so Alembic data is stored in the external workspace data root and Codex does not write IDE configuration into the project.

## Knowledge-Backed Turn Flow

When the current project has a project-level Alembic knowledge skill in `.agents/skills` or a local Alembic knowledge base, every semantic coding or knowledge request is a knowledge-backed turn:

1. Before code reading, shell search, edit, Guard check, or conclusion for a semantic task, call `alembic_intent` with `hostDeclaredIntent` or another concise semantic query. If the visible input is an automation/direct-thread envelope, pass a curated `hostDeclaredIntent`; do not raw-prime the envelope text.
2. Call `alembic_prime` with the returned `intentRef` or the same structured `hostDeclaredIntent` to load compact project knowledge. Immediately after the result, make a developer-visible receipt shout in your own words from `primeKnowledgeMaterial`: briefly and actively shout as Codex or "I" which Recipe constraints, Guard rules, patterns, or judgment basis you accepted, or say you received no usable project knowledge because the result was empty or degraded. This must be the next visible response before any search, code reading, edit, Guard check, or final summary. Keep evidence refs in the payload for later verification or user-requested citations; do not dump paths or line numbers by default. Do not make "Alembic prime", prime, or any tool/process the speaker or subject of the visible receipt.
3. Use `alembic_work_start` when the user has asked for concrete implementation, fix, refactor, review, or other evidence-producing work.
4. Use `alembic_project_matrix`, `alembic_search`, or `alembic_graph` when more project context is needed.
5. Make code changes according to approved Recipes and project evidence.
6. After meaningful code edits, call `alembic_work_finish` with changed files, evidence refs, and summary. If it recommends Guard, call `alembic_code_guard` with the explicit returned files; if it skips Guard, report the lifecycle reason instead of forcing a no-args Guard.
7. Use `alembic_decision_record` for confirmed durable decisions. If a reusable convention appears, submit a candidate with `alembic_submit_knowledge`; do not write Recipe files directly.

`alembic_task` is retired. Direct calls fail closed with `CODEX_TOOL_RETIRED`; use the six agent-facing public tools for Codex lifecycle work.

For empty or uninitialized projects, do not proactively prime on ordinary user input. Use Alembic setup/status/diagnostics/bootstrap/rescan, Guard, or knowledge tools only when the user explicitly asks for Alembic or wants knowledge created for the project.

Prime and search return clean `structuredContent`; visible tool text is summary-only. Use `alembic_codex_diagnostics` / `alembic_mcp_status` for runtime route and resident-service diagnostics instead of relying on ordinary knowledge-tool payloads.

## ProjectContext Tool Choice

Treat MCP initialize instructions as the live playbook for ProjectContext tool choice; this skill only names the boundary. Use `alembic_project_matrix` and `alembic_graph` for compact project orientation and bounded structure relations, Recipe/knowledge tools for project standards and prior decisions, and Guard for scoped compliance after edits.

Start with `alembic_project_matrix` when project scope or entrypoint orientation matters. Use `alembic_graph` for bounded project, package, module, file, symbol, dependency, and impact-radius hints before broad raw Read/Grep exploration. ProjectContext output is orientation evidence only; validate current code behavior with raw reads/search, Guard, and matching repository tests.

## Long-Running Work

Use `alembic_bootstrap` for default Codex host-agent cold start and `alembic_rescan` for host-agent refresh. Codex reads the Mission Briefing, analyzes the project, submits knowledge, and completes dimensions; this path does not require an Alembic AI Provider.

Use `alembic_mcp_bootstrap_job` and `alembic_mcp_rescan_job` only when the user explicitly wants Alembic daemon jobs. Any provider credentials or model choices belong to the Alembic resident service, not this Codex plugin; these tools only start/connect to the daemon, enqueue work, and return a recoverable job id.

Use `alembic_codex_job` to check explicit provider-backed daemon job status later. Job lookup is local and should not start the daemon.

Use `alembic_codex_dashboard` when the user needs review, candidates, or progress visualization and a local Alembic Dashboard daemon is already available for the selected project. Return its URL instead of opening a browser yourself; if the tool reports missing Dashboard handoff capability, surface that next step instead of inventing an embedded Dashboard URL.

## Project Skill Delivery

Use `alembic_project_skill` for Project Skill source storage, refresh, receipt, export, and Codex runtime visibility. The old Codex-facing `alembic_skill` alias has been removed from the Plugin tool surface.

- `list` shows built-in skills, dataRoot source skills, Plugin delivery receipts, Codex runtime exports, and the effective winner.
- `load` prefers `.agents/skills/<name>/SKILL.md`, then dataRoot source storage, then built-in plugin skills.
- `upsert`, `create`, and `update` write source to `dataRoot/Alembic/skills/<name>/`, return a Plugin route `ProjectSkillDeliveryReceipt`, and optionally export.
- `refresh` generates or updates knowledge-dependent same-name Project Skills only when the current dataRoot has `knowledge_entries`, `candidates`, or `recipes`.
- `export` uses symlink-first delivery into `.agents/skills` only after project-scoped authorization.
- `delete` removes Alembic-managed source/runtime projection only; built-in plugin skills remain read-only.

Set `authorizeProjectSkillExport: true` only when the user has approved making that Project Skill visible in this project. A blocked response with `authorizationStatus: "pending"` means the receipt is valid but Codex has not been authorized to write `.agents/skills`.

If `conflictStatus` is `different-existing`, do not overwrite it by guessing. The target already exists and is not managed by the matching Alembic receipt, so ask for user direction or report the conflict. Managed exports write `.alembic-managed.json`; compatible managed or same-source symlink exports can be refreshed.

Use `alembic_project_skill` whenever the user needs runtime-visible Project Skills, refresh, receipt evidence, authorization state, conflict state, or export status.

## Permission Boundary

Default Codex mode is agent tier. It may search knowledge, prime tasks, run Guard, use host-agent bootstrap/rescan, and submit candidates. Explicit daemon jobs may require Alembic resident-service configuration, but the Codex plugin does not configure third-party AI providers or store API keys.

Do not publish, deprecate, delete, or directly edit Recipes from the default tier. Admin tools only appear when both `ALEMBIC_MCP_TIER=admin` and `ALEMBIC_CODEX_ENABLE_ADMIN=1` are set.

Do not edit host configuration files, `AGENTS.md`, or project Alembic data unless the user explicitly asks for a standard, project-written setup.

## Cleanup

Plugin uninstall never removes user data. Use `alembic_codex_cleanup` for explicit cleanup. The default call is a dry run; `confirm=true` only removes daemon runtime state, logs, locks, and job files.

## Related Skills

- `alembic-recipes`: Recipe lookup and application.
- `alembic-create`: Candidate submission rules.
- `alembic-guard`: Compliance checks.
- `alembic-structure`: Project matrix navigation, project graph, and source-backed structure context.
