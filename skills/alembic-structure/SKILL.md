---
name: alembic-structure
description: Discover Alembic project structure and Recipe graph context proactively only when the current project has a project-level Alembic knowledge skill or local Alembic knowledge base. For empty projects, use on explicit Alembic structure requests.
---

# Alembic Structure

Use this skill when the user asks about Alembic module structure, targets, dependencies, call relationships, or how Recipes relate to each other. Use it proactively for project knowledge graph work only when this project has a local Alembic knowledge base or project-level Alembic knowledge skill.

For current source-code facts, prefer the live MCP source graph guidance and visible source graph tools first: `alembic_source_graph_status`, then `alembic_code_explore` / `alembic_symbol_search` / node or relation tools only when they appear in the tool list. Keep Recipe graph tools for knowledge relationships; do not use them as proof that current source code is fresh.

## Project Structure Tools

| Tool | Use |
| --- | --- |
| `alembic_structure(operation: "targets")` | List modules, targets, language stats, and inferred roles |
| `alembic_structure(operation: "files")` | List files for a target |
| `alembic_structure(operation: "metadata")` | Read target metadata, dependencies, package info, and graph edges |
| `alembic_call_context` | Query callers, callees, or impact radius for a function or method |

Recommended flow:

1. Call `alembic_structure(operation: "targets")`.
2. Select a target based on the user request.
3. Call `alembic_structure(operation: "files", targetName: "...")`.
4. Call `alembic_structure(operation: "metadata", targetName: "...")` when dependency context matters.

## Knowledge Graph Tools

| Tool | Use |
| --- | --- |
| `alembic_graph(operation: "query")` | Get relations for one Recipe node |
| `alembic_graph(operation: "impact")` | Analyze downstream impact of changing a Recipe |
| `alembic_graph(operation: "path")` | Find a relationship path between two Recipes |
| `alembic_graph(operation: "stats")` | Summarize graph health |

Use graph context when Recipe changes might affect other standards.

## Path Notes

Some generated dependency maps may live under the Alembic knowledge root. In standard mode that root is usually `Alembic/` in the project; in Ghost mode it is external to the project. Prefer MCP tools over hardcoded paths.

## Related Skills

- `alembic-recipes`: Recipe content as project standards.
- `alembic-create`: Submit candidates after structure analysis.
- `alembic-guard`: Check affected files against standards.
