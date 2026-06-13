---
name: alembic-recipes
description: Use Alembic Recipes proactively only when the current project has a project-level Alembic knowledge skill or local Alembic knowledge base. For empty projects, use only when the user explicitly asks for Alembic Recipes or setup/status.
---

# Alembic Recipes

Recipes are Alembic's curated project knowledge: code patterns, usage guides, rules, and structural facts. Prefer Recipe content over raw code search only when this project has a local Alembic knowledge base or project-level Alembic knowledge skill. Empty projects should not trigger proactive Recipe lookup unless the user explicitly asks for Alembic Recipes, setup, status, bootstrap, rescan, or knowledge work.

## Knowledge Base Shape

| Part | Purpose |
| --- | --- |
| Recipes | Standard code patterns, rules, and facts used for context, Guard, and search |
| Candidates | Agent-submitted knowledge awaiting user review |
| Context index | Search and semantic context used by `alembic_search` |
| Wiki | Generated project documentation based on approved knowledge |

In standard mode these files usually live under `Alembic/` in the project. In Ghost mode they live under Alembic's external data root for the project. Use MCP tools instead of assuming a physical path.

## Permission Boundary

Allowed:

- Search, get, or expand compact project knowledge with `alembic_search`.
- Submit candidates with `alembic_submit_knowledge`.
- Cite returned Recipe/detail refs in work summaries when a Recipe guides the change.

Do not:

- Directly edit Recipe files.
- Publish, deprecate, or delete Recipes from the default Codex plugin tier.
- Treat unreviewed candidates as established project standards.

## Lookup Order

1. In projects with a project-level Alembic knowledge skill or local Alembic knowledge base, call `alembic_intent` and then `alembic_prime` before semantic coding or knowledge turns. Use a concise semantic query or `hostDeclaredIntent`; do not raw-prime automation/direct-thread envelopes.
2. Use `alembic_search(operation: "search", mode: "auto")` for general lookup.
3. Use `alembic_search(operation: "search", mode: "context")` for coding assistance.
4. Use clean `structuredContent` from `alembic_prime` / `alembic_search` as the Recipe context contract; visible text is summary-only.
5. For runtime route or vector-readiness diagnostics, call `alembic_codex_diagnostics` / `alembic_mcp_status` instead of relying on ordinary knowledge-tool payloads.
6. Use `alembic_search(operation: "get", refId: "...")` for one bounded result returned by search.
7. Use `alembic_search(operation: "expand", refId: "...")` for one detail ref that needs more context.

## How To Apply Recipes

- For project standards, cite the Recipe title or trigger when explaining a decision.
- For code suggestions, adapt the Recipe's core code and usage guide to the current file.
- For Guard failures, fix according to the Recipe's do/dont clauses and core code.
- For ambiguous conflicts between code and Recipe, treat the Recipe as the current standard and submit a candidate if the code suggests the standard should evolve.

## Related Skills

- `alembic-create`: Submit candidate knowledge.
- `alembic-guard`: Check code against Recipe standards.
- `alembic-structure`: Inspect project structure and graph context.
