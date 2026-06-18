# Alembic Codex 插件

Alembic for Codex 让 Codex 获得本地项目记忆，而不是把每一次对话都变成初始化流程。它先启动轻量 MCP shim，在不初始化数据库的情况下报告诊断和工作区状态，默认以 Ghost mode 初始化；只有在请求项目知识、Guard、Dashboard、Codex 宿主 Agent bootstrap/rescan 或显式 provider-backed daemon job 时，才启动或连接当前工作区的 daemon。

English version: [README.md](README.md)

适合这些 Codex 工作：

- 编码前先识别 intent，再用项目 Recipes prime Codex。
- 对具体 work 开始/结束做记录，并对当前改动运行 scoped Guard 检查。
- 通过 Codex 宿主 Agent workflow 构建或刷新项目知识。
- 只在需要视觉交接时打开本地 Dashboard。

## 安装

把这个仓库作为 Codex 插件市场安装：

```bash
codex plugin marketplace add GxFn/AlembicCodex --ref main
```

如果要固定到对应 Git tag，先创建并推送该 tag，然后使用：

```bash
codex plugin marketplace add GxFn/AlembicCodex --ref main
```

如果 Codex 要求填写 GitHub Target 或直接 artifact path，请填写：

```text
GxFn/AlembicCodex
```

如果 Codex 弹窗把来源、Git 引用、稀疏路径拆开填写，请这样填：

```text
来源：
GxFn/AlembicCodex

Git 引用：
main

稀疏路径：
留空
```

安装后在插件列表里启用 `alembic-codex`。

## Runtime

- 需要 Node.js 22 或更新版本。本地开发推荐 Node 22 LTS；MCP shim 和 daemon 应使用同一个 Node 可执行文件。
- 插件发布的是轻量 marketplace shell，不再内置运行时目录。shell 入口是 `./bin/alembic-start.mjs`。
- Marketplace shell 会在需要时把精确固定的 `@gxfn/alembic-runtime@0.2.0` runtime package 安装到确定的启动缓存，后续启动复用缓存，并用 Node 启动缓存中的 MCP entrypoint。
- Marketplace MCP 配置会设置 `ALEMBIC_RUNTIME_MODE=plugin` 作为通用插件运行时信号，并设置 `ALEMBIC_PLUGIN_HOST=codex` 表示当前宿主是 Codex。
- Marketplace MCP 配置会显式设置 `ALEMBIC_MCP_MODE=1` 和 `ALEMBIC_CODEX_MCP_MODE=1`；binary 入口仍会做同样兜底。
- 公共插件 shell 不包含 `runtime.tgz`、`runtime/` 或 `node_modules/`。
- shell 会把运行时安装放在已安装插件目录之外。首次运行 cache、升级和失败分类的细节属于 shell bootstrap 后续链路。
- 默认 MCP tier 是 `agent`；只有同时设置 `ALEMBIC_MCP_TIER=admin` 和 `ALEMBIC_CODEX_ENABLE_ADMIN=1` 时，才会显示 admin tools。

## 首次检查

先使用 `alembic_status`。它会报告 Node、npm、runtime package/cache wiring、daemon version、插件元数据检查、portable runtime artifact 指引、清理策略，以及结构化的 `issues` / `nextActions`。

使用 `alembic_status` 检查工作区初始化和 daemon 状态，不会启动 daemon。返回结果包含 `onboarding` 块：当前状态、推荐的下一步 tool call、该调用是否会启动 daemon，以及后续动作。

在 Codex 外也可以用 CLI 做同样检查：

```bash
alembic codex diagnostics --json
alembic codex status --json
```

正常的第一分钟流程是：

1. `alembic_status`
2. `alembic_status`
3. 状态为 `needs_init` 时调用 `alembic_init`
4. 用 `alembic_bootstrap` 构建第一轮项目知识，用 `alembic_rescan` 刷新已有知识，或在编码前直接调用 standalone `alembic_prime`

Codex MCP 工具调用返回干净的 `structuredContent`：`ok`、`status`、`summary`、可选 `error`、可选 `meta` 和工具专属字段。可见 tool text 只承载 summary，宿主集成不要再从文本里解析旧 JSON envelope。

## 长任务

`alembic_bootstrap` 和 `alembic_rescan` 是默认 Codex 宿主 Agent workflow。Codex 读取 Mission Briefing、分析项目、提交知识并完成维度；这条路径不要求配置 Alembic AI Provider。

`alembic_job` 和 `alembic_job` 是显式 provider-backed Alembic daemon job。它们需要已配置 AI Provider 凭据，并会立即返回持久 job id。Codex 重连或本地 Alembic UI 刷新后，用 `alembic_job` 携带该 id 继续检查状态。

如果 Alembic daemon 在活跃 provider-backed daemon job 完成前关闭或重启，下一次 daemon 生命周期会把该 job 标记为 `failed`，并记录中断原因，避免 job 永远停在 `queued` 或 `running`。需要重试时，重新启动 provider-backed daemon job，或改走宿主 Agent workflow。

## 发布验证

发布前运行：

```bash
npm run release:codex-plugin
```

这会构建 runtime，验证 `@gxfn/alembic-runtime@0.2.0` package 边界、轻量 marketplace shell、`alembic-codex-mcp` binary、默认 agent tier、关闭的 admin gate、声明的 assets、随包 skills、default prompts、npm tarball 内容、本地安装模拟、shell dry-run 启动，以及真实 MCP stdio 调用。Dashboard 前端构建和服务归 Alembic/AlembicDashboard；本插件只在本地 daemon 已提供 Dashboard 能力时交接 URL。

完整本地 daemon 链路运行：

```bash
npm run release:codex-plugin:daemon
```

这个可选流程还会在临时 localhost 端口启动 daemon，并验证被中断 job 的恢复行为。`prepublishOnly` 会运行 `release:codex-plugin`。

release 检查通过后，如果插件文件有变化，先在这个 submodule 内提交并推送，然后回到 Alembic 主仓库提交更新后的 `plugins/alembic-codex` 指针。

完整发布、测试和推广计划见 [RELEASE-PLAYBOOK.md](./RELEASE-PLAYBOOK.md)。

## 本地 Marketplace

这个分发仓库包含 `.agents/plugins/marketplace.json`，让 Codex 可以把该仓库本身添加为插件市场。marketplace 名称是 `alembic-codex`，唯一 entry 指向 `.`，安装策略为 `AVAILABLE`，认证策略为 `ON_INSTALL`。

开发时把这个仓库注册为 local marketplace：

```toml
[marketplaces.gxfn]
source_type = "local"
source = "/absolute/path/to/Alembic/plugins/alembic-codex"

[plugins."alembic@gxfn"]
enabled = true
```

Alembic 主仓库也保留本地开发 marketplace：`.agents/plugins/marketplace.json`，名称是 `alembic-codex`，指向 `./plugins/alembic-codex`。

`npm run smoke:codex-plugin` 会打包发布内容，从 tarball 里解析 marketplace entry，把插件复制到临时安装目录，并验证已安装 manifest、shell entry、禁用 artifact 缺失、MCP 配置、assets、skills、shell dry-run 启动和 stdio MCP 调用。

## 离线 Fallback

默认插件配置通过 marketplace shell 启动 `@gxfn/alembic-runtime@0.2.0`。如果首次运行无法解析生产依赖，请恢复 npm registry 访问，必要时清理 Alembic runtime cache，然后重新运行 `alembic_status`。

## 清理策略

卸载插件不会自动删除 Alembic 数据。需要显式清理时使用 `alembic_runtime`。默认调用是 dry run；`confirm=true` 只移除 daemon runtime state、logs、locks 和 job files。Knowledge、Recipes、candidates 和项目数据会保留。
