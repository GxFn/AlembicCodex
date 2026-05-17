/**
 * KnowledgeSyncService — 将 .md 文件增量同步到 SQLite DB（knowledge_entries 表）
 *
 * 统一替代 SyncService (Recipe) + CandidateSyncService。
 *
 * 设计原则：
 *  - .md 文件 = 完整唯一数据源（Source of Truth），DB = 索引缓存
 *  - 通过 contentHash 检测手写/手改 .md → 进入违规统计（audit_logs）
 *  - 孤儿 Entry（DB 有但 .md 不存在）→ 自动标记 deprecated
 *  - 同时扫描 Alembic/candidates/ 和 Alembic/recipes/ 两个目录
 *
 * 使用方式：
 *  - CLI: `alembic sync` 委托调用
 *  - 内部: SetupService.stepDatabase() 委托调用（skipViolations = true）
 */
import Logger from '../../infrastructure/logging/Logger.js';
import { type SyncRepo } from '../../repository/sync/SyncRepoAdapter.js';
export interface ReconcileReport {
    inserted: number;
    active: number;
    stale: number;
    skipped: number;
    recipesProcessed: number;
    cleaned?: number;
}
export interface RepairReport {
    renamed: number;
    stillStale: number;
}
export interface ApplyReport {
    applied: number;
    failed: number;
}
export interface SourceRefReconciler {
    reconcile?(opts?: {
        force?: boolean;
    }): Promise<ReconcileReport>;
}
export interface SyncAllReport {
    synced: number;
    created: number;
    updated: number;
    violations: string[];
    orphaned: string[];
    skipped: number;
    reconcileReport?: ReconcileReport;
    repairReport?: RepairReport;
    applyReport?: ApplyReport;
}
export declare class KnowledgeSyncService {
    #private;
    candidatesDir: string;
    logger: ReturnType<typeof Logger.getInstance>;
    projectRoot: string;
    recipesDir: string;
    constructor(projectRoot: string, options?: {
        sourceRefReconciler?: SourceRefReconciler;
    });
    /**
     * 完整同步入口 — sync + reconcile + repair
     *
     * alembic sync CLI 和 alembic ui 启动都调用此方法。
     *
     * @param db better-sqlite3 原始句柄
     * @param opts 同步选项
     * @returns 包含 sync + reconcile + repair 报告的综合结果
     */
    syncAll(db: Parameters<KnowledgeSyncService['sync']>[0], opts?: {
        dryRun?: boolean;
        force?: boolean;
        skipViolations?: boolean;
    }): Promise<SyncAllReport>;
    /**
     * 执行增量同步：.md → DB（knowledge_entries 表）
     *
     * 同时扫描 candidates/ 和 recipes/ 两个目录。
     *
     * @param db better-sqlite3 原始句柄或 DatabaseConnection
     * @param [opts.dryRun=false] 只报告不写入
     * @param [opts.force=false] 忽略 hash，强制覆盖
     * @param [opts.skipViolations=false] 跳过违规记录（setup 场景）
     * @returns }
     */
    sync(db: unknown, opts?: {
        dryRun?: boolean;
        force?: boolean;
        skipViolations?: boolean;
    }): {
        synced: number;
        created: number;
        updated: number;
        violations: string[];
        orphaned: string[];
        skipped: number;
    };
    /**
     * 递归收集指定目录下所有 .md 文件（跳过 _ 前缀模板）
     * @param dir 绝对目录路径
     * @param prefix 相对路径前缀 (e.g. 'Alembic/candidates')
     * @returns []}
     */
    _collectMdFiles(dir: string, prefix: string): {
        absPath: string;
        relPath: string;
    }[];
    /**
     * 从 parseKnowledgeMarkdown 的结果构建 DB row
     * wire format → DB 列映射（与 KnowledgeRepository.impl 对齐）
     */
    _buildDbRow(parsed: Record<string, unknown>, relPath: string, rawContent: string): {
        id: unknown;
        title: {};
        trigger: {};
        description: {};
        lifecycle: {};
        lifecycleHistory: string;
        autoApprovable: number;
        language: {};
        dimensionId: {};
        category: {};
        kind: {};
        knowledgeType: {};
        complexity: {};
        scope: {};
        difficulty: {} | null;
        tags: string;
        content: string;
        relations: string;
        constraints: string;
        reasoning: string;
        quality: string;
        stats: string;
        headers: string;
        headerPaths: string;
        moduleName: {};
        includeHeaders: number;
        topicHint: {} | null;
        whenClause: {} | null;
        doClause: {} | null;
        dontClause: {} | null;
        coreCode: {} | null;
        agentNotes: string | null;
        aiInsight: {} | null;
        reviewedBy: {} | null;
        reviewedAt: {} | null;
        rejectionReason: {} | null;
        source: {};
        sourceFile: string;
        sourceCandidateId: {} | null;
        createdBy: {};
        createdAt: {};
        updatedAt: {};
        publishedAt: {} | null;
        publishedBy: {} | null;
        contentHash: string;
    };
    /** UPSERT 使用的列名列表 */
    _upsertCols(): string[];
    _logViolation(stmt: {
        run: (...args: unknown[]) => void;
    }, entryId: string, filePath: string, expectedHash: string, actualHash: string): void;
    /**
     * 检测 DB 中存在但 .md 已删除的 Entry → 标记 deprecated
     * @returns 孤儿 entry id 列表
     */
    _detectOrphans(repo: SyncRepo, syncedIds: Set<string>, dryRun: boolean): string[];
}
export default KnowledgeSyncService;
