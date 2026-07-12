---
name: alembic
description: Use Alembic setup/status/diagnostics/bootstrap/rescan when the user explicitly asks for Alembic. When the current project has a project-level Alembic knowledge skill or local Alembic knowledge base, use the agent-facing prime, work, and Guard tools proactively. For empty projects, do not proactively prime unless the user explicitly asks for Alembic.
---

# Alembic Host Agent Workflow

Use this skill when the user explicitly asks the host agent to work with Alembic setup, status, diagnostics, bootstrap/rescan workflows, local knowledge, Guard checks, or Alembic itself.

Knowledge-dependent Alembic behavior is project-scoped. Use Recipes, Guard, project knowledge, structure, priming, or knowledge search proactively only when the current project has a project-level Alembic knowledge skill in `.agents/skills` or a local Alembic knowledge base. Empty or uninitialized projects should not trigger proactive knowledge work unless the user explicitly asks for Alembic setup, status, diagnostics, bootstrap, rescan, Guard, or knowledge operations.

## First Move

Call `alembic_status` before assuming Alembic is initialized. This check only reports the current request project's location and knowledge availability.

If status reports runtime or environment problems, call `alembic_status` and surface the request-scoped facts.

If status or diagnostics says the project root is unresolved or points inside the plugin cache, pass the current workspace directory as the `projectRoot` argument on subsequent Alembic tool calls. `projectRoot` must be an absolute path; without it, Alembic project workflows cannot run.

If the workspace is not initialized and the user wants Alembic knowledge for this project, call `alembic_init`. The default profile is Ghost mode, so Alembic data is stored in the external workspace data root and the host agent does not write IDE configuration into the project.

## Knowledge-Backed Turn Flow

When the current project has a project-level Alembic knowledge skill in `.agents/skills` or a local Alembic knowledge base, every semantic coding or knowledge request is a knowledge-backed turn:

1. Before code reading, shell search, edit, Guard check, or conclusion for a coding task, call `alembic_prime` with an optional concise `query` and/or `context`. Prime has no intent-admission frame; do not pass raw automation envelopes as knowledge queries.
2. Treat an empty Prime result as a truthful no-match result, not as a readiness or trust failure.
3. Immediately after a prime result, make a developer-visible receipt shout in your own words from `primeKnowledgeMaterial`: briefly and actively shout as the host agent or "I" which Recipe constraints, Guard rules, patterns, or judgment basis you accepted, or say you received no usable project knowledge because the result was empty or degraded. This must be the next visible response before any search, code reading, edit, Guard check, or final summary. Keep evidence refs in the payload for later verification or user-requested citations; do not dump paths or line numbers by default. Do not make "Alembic prime", prime, or any tool/process the speaker or subject of the visible receipt.
4. Use `alembic_work` when the user has asked for concrete implementation, fix, refactor, review, or other evidence-producing work.
5. Use `alembic_recipe_map`, `alembic_search`, or `alembic_graph` when more project context is needed.
6. Make code changes according to approved Recipes and project evidence.
7. After meaningful code edits, call `alembic_work` with changed files, evidence refs, and summary. If it recommends Guard, call `alembic_code_guard` with the explicit returned files; if it skips Guard, report the lifecycle reason instead of forcing a no-args Guard.
8. If a reusable convention appears, submit a candidate with `alembic_submit_knowledge`; do not write Recipe files directly.

For empty or uninitialized projects, do not proactively prime on ordinary user input. Use Alembic setup/status/diagnostics/bootstrap/rescan, Guard, or knowledge tools only when the user explicitly asks for Alembic or wants knowledge created for the project.

Prime and search return clean `structuredContent`; visible tool text is summary-only. Use `alembic_status` for request-scoped runtime and knowledge-location facts instead of relying on ordinary knowledge-tool payloads.

## ProjectContext Tool Choice

Treat MCP initialize instructions as the live playbook for ProjectContext tool choice; this skill only names the boundary. Use `alembic_recipe_map` and `alembic_graph` for compact project orientation and bounded structure relations, Recipe/knowledge tools for project standards and prior decisions, and Guard for scoped compliance after edits.

Start with `alembic_recipe_map` when project scope, entrypoint orientation, or Recipe-mounted structure matters. Use `alembic_graph` for bounded project, package, module, file, symbol, dependency, and impact-radius hints before broad raw Read/Grep exploration. ProjectContext output is orientation evidence only; validate current code behavior with raw reads/search, Guard, and matching repository tests.

## Long-Running Work

Use `alembic_bootstrap` for default host-agent cold start and `alembic_rescan` for host-agent refresh. The host agent reads the Mission Briefing, analyzes the project, submits knowledge, and completes dimensions; this path does not require an Alembic AI Provider.

Use `alembic_job` only for explicit Plugin-owned local jobs. Job lookup and tool execution depend only on the current request project.

## Project Skill Delivery

Use `alembic_project_skill` for Project Skill source storage, refresh, receipt, export, and host runtime visibility. The old host-facing `alembic_skill` alias has been removed from the Plugin tool surface.

- `list` shows built-in skills, dataRoot source skills, Plugin delivery receipts, host runtime exports, and the effective winner.
- `load` prefers `.agents/skills/<name>/SKILL.md`, then dataRoot source storage, then built-in plugin skills.
- `upsert`, `create`, and `update` write source to `dataRoot/Alembic/skills/<name>/`, return a Plugin route `ProjectSkillDeliveryReceipt`, and optionally export.
- `refresh` generates or updates knowledge-dependent same-name Project Skills only when the current dataRoot has `knowledge_entries`, `candidates`, or `recipes`.
- `export` uses symlink-first delivery into `.agents/skills` only after project-scoped authorization.
- `delete` removes Alembic-managed source/runtime projection only; built-in plugin skills remain read-only.

Set `authorizeProjectSkillExport: true` only when the user has approved making that Project Skill visible in this project. A blocked response with `authorizationStatus: "pending"` means the receipt is valid but the host agent has not been authorized to write `.agents/skills`.

If `conflictStatus` is `different-existing`, do not overwrite it by guessing. The target already exists and is not managed by the matching Alembic receipt, so ask for user direction or report the conflict. Managed exports write `.alembic-managed.json`; compatible managed or same-source symlink exports can be refreshed.

Use `alembic_project_skill` whenever the user needs runtime-visible Project Skills, refresh, receipt evidence, authorization state, conflict state, or export status.

## Permission Boundary

All Plugin MCP tools share one ordinary public surface. Capability-specific input validation and explicit destructive-write confirmation still apply; there is no role or tier visibility gate.

Do not edit host configuration files, `AGENTS.md`, or project Alembic data unless the user explicitly asks for a standard, project-written setup.

## Cleanup

Plugin uninstall never removes user data. Use `alembic_runtime` for explicit cleanup. The default call is a dry run; `confirm=true` only removes Plugin runtime state, logs, locks, and job files.

## Related Skills

- `alembic-recipes`: Recipe lookup and application.
- `alembic-create`: Candidate submission rules.
- `alembic-guard`: Compliance checks.
- `alembic-structure`: Recipe-mounted ProjectContext navigation, project graph, and source-backed structure context.
