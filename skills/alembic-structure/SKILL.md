---
name: alembic-structure
description: Discover Alembic project structure, ProjectContext graph orientation, and bounded project-internal relations when the current project has Alembic knowledge. For empty projects, use on explicit Alembic structure requests.
---

# Alembic Structure

Use this skill when the user asks about Alembic module structure, targets, dependencies, call relationships, or project-internal relations. Use it proactively for project structure work only when this project has a local Alembic knowledge base or project-level Alembic knowledge skill.

For current project orientation, use `alembic_project_matrix` for compact navigation and `alembic_graph` for bounded ProjectContext-backed structure, source, and dependency relations. Treat graph output as orientation evidence; use raw reads/search, Guard, and repository tests for current code behavior claims.

## Project Navigation Tools

| Tool | Use |
| --- | --- |
| `alembic_project_matrix(operation: "overview")` | Compact hierarchy, key nodes, hotspots, project status, category summary, detail refs, and next actions |
| `alembic_project_matrix(operation: "node")` | Expand one matrix node by `nodeId` or `refId` |
| `alembic_project_matrix(operation: "relations")` | Read bounded relations around a visible matrix node |
| `alembic_graph(operation: "query")` | List bounded project graph nodes and relations |
| `alembic_graph(operation: "neighborhood")` | Inspect one bounded node neighborhood |

Recommended flow:

1. Call matrix `overview` for the smallest useful map.
2. Select one visible node or detail ref.
3. Use matrix `node` / `relations` or project graph `neighborhood` to drill down.
4. Use raw reads/search, Guard, or repository tests for current source proof before citing code behavior.

## Project Graph Tools

| Tool | Use |
| --- | --- |
| `alembic_graph(operation: "impact")` | Analyze project impact radius from a project, file, or symbol node |
| `alembic_graph(operation: "path")` | Find a directed project relation path between two nodes |
| `alembic_graph(operation: "stats")` | Summarize project graph node/relation counts |

Use graph context for project-internal structure/source/dependency relations only.

## Path Notes

Some generated dependency maps may live under the Alembic knowledge root. In standard mode that root is usually `Alembic/` in the project; in Ghost mode it is external to the project. Prefer MCP tools over hardcoded paths.

## Related Skills

- `alembic-recipes`: Recipe content as project standards.
- `alembic-create`: Submit candidates after structure analysis.
- `alembic-guard`: Check affected files against standards.
