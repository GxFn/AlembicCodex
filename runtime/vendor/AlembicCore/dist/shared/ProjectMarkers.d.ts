/**
 * ProjectMarkers — 统一项目探测标准（核心库 & 宿主集成共用）
 *
 * 所有模块判断「当前目录是否是 Alembic 项目」时，都应该使用此模块提供的常量和函数，
 * 避免各处硬编码不同的标记目录名导致探测标准不一致。
 *
 * 探测优先级：
 *   1. 存在 Alembic.boxspec.json 的一级子目录 → 知识库根目录
 *   2. 存在 Alembic/ 目录 → 默认知识库根目录
 *   3. 存在 .asd/ 目录 → 运行时目录（至少说明曾初始化过）
 *
 * 子仓库（Sub-Repo）：
 *   子仓库指通过独立 git 管理的知识数据目录，默认为 `Alembic/recipes/`。
 *   可通过 `.asd/config.json` 中的 `core.subRepoDir` 自定义。
 *   支持形式：git submodule、git subtree、独立 git init、或无 git（跳过权限探测）。
 */
/** 默认知识库顶级目录名 */
export declare const DEFAULT_KNOWLEDGE_BASE_DIR: string;
/** 默认子仓库相对路径（相对于 projectRoot） */
export declare const DEFAULT_SUB_REPO_DIR: string;
/** 运行时配置目录名 */
export declare const RUNTIME_DIR: string;
/** Boxspec 文件名 — 知识库目录标记 */
export declare const SPEC_FILENAME = "Alembic.boxspec.json";
/**
 * 项目标记目录列表（任一存在即视为 Alembic 项目）
 * 顺序即优先级：Alembic/ > .asd/
 */
export declare const PROJECT_MARKER_DIRS: readonly [string, string];
/**
 * 判断一个目录是否是 Alembic 项目
 * 条件：存在 `Alembic/` 或 `.asd/` 子目录，或在 Ghost 注册表中
 */
export declare function isAlembicProject(folderPath: string): boolean;
/**
 * 探测知识库目录名
 * 优先查找含 boxspec.json 的一级子目录，fallback 到默认值 'Alembic'
 */
export declare function detectKnowledgeBaseDir(projectRoot: string, fallbackDir?: string): string;
/**
 * 从 `.asd/config.json` 读取子仓库路径配置
 * @returns 子仓库相对路径（相对于 projectRoot），如 'Alembic/recipes'
 */
export declare function readSubRepoDirFromConfig(projectRoot: string): string | null;
/**
 * 从 `.asd/config.json` 读取子仓库远程 URL 配置
 * @returns 远程仓库 URL，如 'https://github.com/team/recipes.git'；未配置则返回 null
 */
export declare function readSubRepoUrlFromConfig(projectRoot: string): string | null;
/**
 * 解析子仓库的绝对路径
 *
 * 优先级：
 *   1. 传入的 explicitPath 参数
 *   2. `.asd/config.json` 中 `core.subRepoDir`
 *   3. 默认 `Alembic/recipes`
 *
 * @param projectRoot 项目根目录
 * @param explicitPath 显式指定的子仓库路径（绝对或相对于 projectRoot）
 * @returns 子仓库绝对路径
 */
export declare function resolveSubRepoPath(projectRoot: string, explicitPath?: string): string;
/** 检测路径是否为 git 仓库（含 submodule） */
export declare function isGitRepo(dirPath: string): boolean;
