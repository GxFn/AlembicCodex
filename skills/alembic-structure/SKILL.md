---
name: alembic-structure
description: Discover Alembic project structure, ProjectContext graph orientation, and bounded project-internal relations when the current project has Alembic knowledge. For empty projects, use on explicit Alembic structure requests.
---

# Alembic Structure

Use this skill when the user asks about Alembic module structure, targets, dependencies, call relationships, or project-internal relations. Use it proactively for project structure work only when this project has a local Alembic knowledge base or project-level Alembic knowledge skill.

For current project orientation, use `alembic_recipe_map` for Recipe-mounted navigation and `alembic_graph` for bounded ProjectContext-backed structure, source, and dependency relations. Treat graph output as orientation evidence; use raw reads/search, Guard, and repository tests for current code behavior claims.

## Project Navigation Tools

| Tool | Use |
| --- | --- |
| `alembic_recipe_map(focus: { kind: "space" })` | Compact Recipe-mounted region overview with rollups and next actions |
| `alembic_recipe_map(focus: { kind: "file", filePath })` | Map direct Recipe mounts and rollups for one file region |
| `alembic_recipe_map(focus: { kind: "module" })` | Map module-level Recipe mounts without dumping unrelated file Recipes |
| `alembic_graph(queryKind: "map")` | Read a bounded ProjectContext map |
| `alembic_graph(queryKind: "file-symbols", filePath)` | Inspect one file and its defined symbols |
| `alembic_graph(queryKind: "source-slice", filePath, line)` | Read bounded source text around an anchor line |
| `alembic_graph(queryKind: "neighborhood", refId)` | Inspect one bounded node neighborhood |

Recommended flow:

1. Call `alembic_recipe_map` with the smallest useful focus.
2. Select one visible node, file, or detail ref.
3. Use `alembic_recipe_map` file/module focus or project graph `neighborhood` to drill down.
4. Use raw reads/search, Guard, or repository tests for current source proof before citing code behavior.

## Project Graph Tools

| Tool | Use |
| --- | --- |
| `alembic_graph(queryKind: "impact", refId)` | Analyze impact radius from a ProjectContext ref/node |
| `alembic_graph(queryKind: "path", fromRefId, toRefId)` | Find a directed relation path between two refs |
| `alembic_graph(queryKind: "anchor-range", filePath, line)` | Combine an anchor source slice with nearby relations |
| `alembic_graph(queryKind: "stats")` | Summarize project graph node/relation counts |

Use graph context for project-internal structure/source/dependency relations only.

## Path Notes

Some generated dependency maps may live under the Alembic knowledge root. In standard mode that root is usually `Alembic/` in the project; in Ghost mode it is external to the project. Prefer MCP tools over hardcoded paths.

## Related Skills

- `alembic-recipes`: Recipe content as project standards.
- `alembic-create`: Submit candidates after structure analysis.
- `alembic-guard`: Check affected files against standards.
