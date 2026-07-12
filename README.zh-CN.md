# Alembic Codex 插件

Alembic for Codex 让 Codex 获得本地项目记忆，而不是把每一次对话都变成初始化流程。每个 MCP 请求都由插件独立解析自己的项目根、数据根和数据库；初始化前所有工具仍可见且可调用，知识缺失时返回真实的空结果或不可用结果。

English version: [README.md](README.md)

适合这些 Codex 工作：

- 编码前先用项目 Recipes prime Codex。
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

- 需要 Node.js 22 或更新版本。本地开发推荐 Node 22 LTS。
- 插件发布的是轻量 marketplace shell，不再内置运行时目录。shell 入口是 `./bin/alembic-start.mjs`。
- Marketplace shell 会在需要时把精确固定的 `alembic-runtime@0.3.0` runtime package 安装到确定的启动缓存，后续启动复用缓存，并用 Node 启动缓存中的 MCP entrypoint。
- Marketplace MCP 配置会设置 `ALEMBIC_RUNTIME_MODE=plugin` 作为通用插件运行时信号，并设置 `ALEMBIC_PLUGIN_HOST=codex` 表示当前宿主是 Codex。
- Marketplace MCP 配置会显式设置 `ALEMBIC_MCP_MODE=1` 和 `ALEMBIC_CODEX_MCP_MODE=1`；binary 入口仍会做同样兜底。
- 公共插件 shell 不包含 `runtime.tgz`、`runtime/` 或 `node_modules/`。
- shell 会把运行时安装放在已安装插件目录之外。首次运行 cache、升级和失败分类的细节属于 shell bootstrap 后续链路。
- 所有 MCP 工具都位于同一个普通工具面；工具自身的输入校验和破坏性写入确认仍然生效。

## 首次检查

先使用 `alembic_status`。它会报告当前请求项目的根目录、项目 id、Ghost/data-root/database 位置、数据库存在性和精简运行时事实。

使用 `alembic_status` 只检查当前请求项目；保存的选择或之前的进程状态不会改变结果。

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

`alembic_job` 运行和读取插件自有的本地 bootstrap/rescan 作业，并且只使用当前请求项目。

## 发布验证

发布前运行：

```bash
npm run release:codex-plugin
```

这会构建 runtime，验证 `alembic-runtime@0.3.0` package 边界、轻量 marketplace shell、`alembic-codex-mcp` binary、声明的 assets、随包 skills、default prompts、npm tarball 内容、本地安装模拟、shell dry-run 启动，以及真实的请求级 MCP stdio 调用。`prepublishOnly` 会运行 `release:codex-plugin`。

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

默认插件配置通过 marketplace shell 启动 `alembic-runtime@0.3.0`。如果首次运行无法解析生产依赖，请恢复 npm registry 访问，必要时清理 Alembic runtime cache，然后重新运行 `alembic_status`。

## 清理策略

卸载插件不会自动删除 Alembic 数据。需要显式清理时使用 `alembic_runtime`。默认调用是 dry run；`confirm=true` 只移除插件作业文件。Knowledge、Recipes、candidates 和项目数据会保留。
