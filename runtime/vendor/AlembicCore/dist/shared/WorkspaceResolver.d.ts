/**
 * WorkspaceResolver — Ghost Mode 感知的工作区路径解析器
 *
 * 核心思想：提供 `dataRoot` — 所有运行时数据和知识库的根目录。
 *   - 标准模式: dataRoot = projectRoot（与原有行为完全一致）
 *   - Ghost 模式: dataRoot = ~/.asd/workspaces/<id>/（零项目侵入）
 *
 * 消费者只需将 `path.join(projectRoot, '.asd', ...)` 改为
 * `path.join(resolver.dataRoot, '.asd', ...)` 即可自动适配 Ghost 模式。
 *
 * projectRoot 始终指向真实项目目录（用于代码分析、AST 解析等）。
 */
import type { AlembicFolderNames, PartialAlembicFolderNames } from './folder-names.js';
import { type ProjectRegistryInspection, type WorkspaceMode } from './ProjectRegistry.js';
export interface WorkspaceFacts {
    targetProjectRoot: string;
    projectRealpath: string;
    registryPath: string;
    registered: boolean;
    mode: WorkspaceMode;
    ghost: boolean;
    projectId: string | null;
    expectedProjectId: string;
    dataRoot: string;
    dataRootSource: 'project-root' | 'ghost-registry';
    workspaceExists: boolean;
    ghostMarker: ProjectRegistryInspection['ghostMarker'];
    runtimeDir: string;
    databasePath: string;
    knowledgeBaseDir: string;
    knowledgeDir: string;
    recipesDir: string;
    skillsDir: string;
    candidatesDir: string;
    wikiDir: string;
}
export declare class WorkspaceResolver {
    /** 真实项目根目录（用于代码分析） */
    readonly projectRoot: string;
    /** 数据根目录（所有 .asd/ 和知识库写入的基准路径） */
    readonly dataRoot: string;
    /** 是否处于 Ghost 模式 */
    readonly ghost: boolean;
    /** 项目 ID（来自 ProjectRegistry） */
    readonly projectId: string | null;
    /** 知识库目录名（如 'Alembic'） */
    readonly knowledgeBaseDir: string;
    /** 目录名约定 */
    readonly folderNames: AlembicFolderNames;
    constructor(opts: {
        projectRoot: string;
        ghost?: boolean;
        projectId?: string;
        knowledgeBaseDir?: string;
        folderNames?: PartialAlembicFolderNames;
    });
    /**
     * 从 ProjectRegistry 自动创建 resolver
     * 自动检测项目是否为 Ghost 模式
     */
    static fromProject(projectRoot: string, opts?: {
        folderNames?: PartialAlembicFolderNames;
    }): WorkspaceResolver;
    /**
     * 生成 N0-data-location 可直接记录的路径事实。
     * projectRoot 始终是源码位置；dataRoot 是运行时和知识库写入边界。
     */
    toFacts(): WorkspaceFacts;
    /** 运行时目录: .asd/ */
    get runtimeDir(): string;
    /** 数据库路径: .asd/alembic.db */
    get databasePath(): string;
    /** 日志目录: .asd/logs */
    get logsDir(): string;
    /** 报告目录: .asd/logs/reports */
    get reportsDir(): string;
    /** 信号日志目录: .asd/logs/signals */
    get signalsDir(): string;
    /** 错误追踪目录: .asd/logs/errors */
    get errorsDir(): string;
    /** 对话存储目录: .asd/conversations */
    get conversationsDir(): string;
    /** 缓存目录: .asd/cache */
    get cacheDir(): string;
    /** 记忆文件: .asd/memory.jsonl (legacy) */
    get memoryPath(): string;
    /** 项目配置: .asd/config.json */
    get configPath(): string;
    /** Bootstrap 检查点: .asd/bootstrap-checkpoint */
    get checkpointPath(): string;
    /** 上下文存储: .asd/context */
    get contextDir(): string;
    /** 记忆嵌入: .asd/context/memory_embeddings.json */
    get memoryEmbeddingsPath(): string;
    /** Skills 迁移目录: .asd/skills */
    get runtimeSkillsDir(): string;
    /** 知识库根目录: Alembic/ */
    get knowledgeDir(): string;
    /** Recipes 目录: Alembic/recipes */
    get recipesDir(): string;
    /** Candidates 目录: Alembic/candidates */
    get candidatesDir(): string;
    /** Skills 目录: Alembic/skills */
    get skillsDir(): string;
    /** Wiki 目录: Alembic/wiki */
    get wikiDir(): string;
    /** Boxspec 文件: Alembic/Alembic.boxspec.json */
    get specPath(): string;
    /** Recipes 索引: Alembic/recipes/index.json */
    get recipesIndexPath(): string;
}
export default WorkspaceResolver;
