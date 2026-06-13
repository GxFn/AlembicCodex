---
name: alembic-structure
description: Discover Alembic project structure, project graph context, and source graph navigation when the current project has Alembic knowledge. For empty projects, use on explicit Alembic structure requests.
---

# Alembic Structure

Use this skill when the user asks about Alembic module structure, targets, dependencies, call relationships, or project-internal relations. Use it proactively for project structure work only when this project has a local Alembic knowledge base or project-level Alembic knowledge skill.

For current source-code facts, prefer the live MCP source graph guidance and visible source graph tools first: `alembic_source_graph_status`, then `alembic_code_explore` / `alembic_symbol_search` / node or relation tools only when they appear in the tool list. Use `alembic_project_matrix` for compact navigation and `alembic_graph` only for bounded project-internal structure/source/dependency relations.

## Project Navigation Tools

| Tool | Use |
| --- | --- |
| `alembic_project_matrix(operation: "overview")` | Compact hierarchy, key nodes, hotspots, source status, category summary, detail refs, and next actions |
| `alembic_project_matrix(operation: "node")` | Expand one matrix node by `nodeId` or `refId` |
| `alembic_project_matrix(operation: "relations")` | Read bounded relations around a visible matrix node |
| `alembic_graph(operation: "query")` | List bounded project graph nodes and relations |
| `alembic_graph(operation: "neighborhood")` | Inspect one bounded node neighborhood |

Recommended flow:

1. Call matrix `overview` for the smallest useful map.
2. Select one visible node or detail ref.
3. Use matrix `node` / `relations` or project graph `neighborhood` to drill down.
4. Use source graph tools for current source proof before citing code behavior.

## Project Graph Tools

| Tool | Use |
| --- | --- |
| `alembic_graph(operation: "impact")` | Analyze project impact radius from a project/source node |
| `alembic_graph(operation: "path")` | Find a directed project relation path between two nodes |
| `alembic_graph(operation: "stats")` | Summarize project graph node/relation counts |

Use graph context for project-internal structure/source/dependency relations only.

## Path Notes

Some generated dependency maps may live under the Alembic knowledge root. In standard mode that root is usually `Alembic/` in the project; in Ghost mode it is external to the project. Prefer MCP tools over hardcoded paths.

## Related Skills

- `alembic-recipes`: Recipe content as project standards.
- `alembic-create`: Submit candidates after structure analysis.
- `alembic-guard`: Check affected files against standards.
