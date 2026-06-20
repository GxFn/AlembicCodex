---
name: alembic-guard
description: Check code against Alembic Recipe standards with `alembic_code_guard` and explicit files, inline code, or a current workRef with scoped files when the current project has Alembic knowledge.
---

# Alembic Guard

Guard checks code against project Recipes. Use it after edits only when this project has a local Alembic knowledge base or project-level Alembic knowledge skill. For empty projects, call Guard only when the user explicitly asks for Alembic Guard or compliance checking.

Guard is a scoped Recipe-adherence check. It is not repo lint, security audit, general code review, or a whole-diff fallback.

## Tool

Use `alembic_code_guard` for agent-facing checks. Supported public scopes are explicit `files`, inline `code`, or an active `workRef` whose current Plugin session recorded scoped files. `diffRef`, `primeRef`, `acceptedGuards`, and `applicableRecipe` are not public Guard scope fields yet.

`alembic_code_guard` is a compatibility/report surface, not the agent-facing default. It no longer accepts no-args whole-diff checks and must already receive an explicit scope.

Common calls:

```json
{
  "files": [
    "src/network/apiClient.ts",
    "src/network/requestManager.ts"
  ]
}
```

Checks specific files. Prefer this when `alembic_work` returns a Guard recommendation with explicit files.

```json
{
  "code": "URLSession.shared.dataTask(with: url) { ... }",
  "language": "swift",
  "filePath": "Sources/Network/LegacyClient.swift"
}
```

Checks an inline snippet.

```json
{
  "workRef": "work-public-1"
}
```

Checks files recorded by the current session workRef. If the workRef has no scoped files, Guard returns `no-code-scope` rather than scanning unrelated repository state.

## Workflow

For quick checks:

1. Call `alembic_code_guard` with explicit files when work finish provides them, or with a current workRef when the work record has scoped files. If there is no explicit file, inline-code, or scoped workRef input, report that Guard is blocked/skipped instead of forcing a no-args check.
2. Summarize violations by severity.
3. Fix issues using the returned do/dont clauses, core code, and Recipe references.
4. Re-run Guard when the fix is meaningful.

For module audits:

1. Use `alembic_recipe_map` to find relevant modules, files, or source refs.
2. Use `alembic_recipe_map`, `alembic_graph`, or raw reads to choose an explicit file list.
3. Call `alembic_code_guard` with the selected files.
4. Report the highest-severity issues first.

## Knowledge Source

Guard uses approved Recipes:

- `kind: "rule"` entries become enforceable rules.
- `kind: "pattern"` entries provide best-practice guidance.
- Guard constraints can include patterns for automated detection.

If code appears correct but Guard reports an outdated standard, do not silently ignore it. Explain the conflict and consider submitting an evolution candidate.
