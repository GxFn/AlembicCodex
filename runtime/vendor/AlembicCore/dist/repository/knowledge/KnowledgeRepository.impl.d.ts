import type { Database } from 'better-sqlite3';
import type { Logger as WinstonLogger } from 'winston';
import { KnowledgeEntry } from '../../domain/knowledge/index.js';
import type { DrizzleDB } from '../../infrastructure/database/drizzle/index.js';
/** Database connection wrapper interface */
interface KnowledgeDatabaseWrapper {
    getDb(): Database;
}
/** Filters accepted by findWithPagination */
interface KnowledgeFilters {
    _tagLike?: string;
    _search?: string;
    lifecycle?: string | string[];
    kind?: string;
    language?: string;
    category?: string;
    [key: string]: unknown;
}
/** Pagination options for knowledge queries */
interface KnowledgePaginationOptions {
    page?: number;
    pageSize?: number;
    orderBy?: string;
    order?: 'ASC' | 'DESC';
}
/**
 * KnowledgeRepositoryImpl — 统一知识实体仓储实现 (Drizzle ORM)
 *
 * 面向 knowledge_entries 表的 SQLite 持久化。
 * 全链路 camelCase — DB 列名 = 实体属性名。
 *
 * Drizzle 迁移策略：
 * - CRUD (create/findById/update/delete/findActiveRules) → drizzle 类型安全 API
 * - 复杂动态查询 (findWithPagination/getStats) → 保留 raw SQL→渐进迁移
 */
export declare class KnowledgeRepositoryImpl {
    #private;
    /** Raw DB for complex dynamic queries (ORM limitation — used within repository layer) */
    db: Database;
    logger: WinstonLogger;
    constructor(database: KnowledgeDatabaseWrapper, drizzle?: DrizzleDB);
    /**
     * Validate column name is safe for SQL interpolation (copied from retired BaseRepository).
     * Rejects anything that doesn't match /^[a-zA-Z_]\w*$/ or is not a real column.
     */
    _assertSafeColumn(key: string): void;
    /**
     * 按 ID 查找
     * ★ Drizzle 类型安全 SELECT
     */
    findById(id: string): Promise<KnowledgeEntry | null>;
    /**
     * 创建 KnowledgeEntry
     * ★ Drizzle 类型安全 INSERT — 列名拼写编译期检查
     */
    create(entry: KnowledgeEntry): Promise<KnowledgeEntry | null>;
    /**
     * 按标题精确查找（大小写不敏感）
     */
    findByTitle(title: string): Promise<KnowledgeEntry | null>;
    /**
     * 更新 KnowledgeEntry（接受完整实体或部分数据）
     * ★ Drizzle 类型安全 UPDATE
     */
    update(id: string, updates: KnowledgeEntry | Record<string, unknown>): Promise<KnowledgeEntry | null>;
    /**
     * 删除
     * ★ Drizzle 类型安全 DELETE
     */
    delete(id: string): Promise<boolean>;
    /**
     * 更新生命周期状态
     * ★ Drizzle 类型安全 UPDATE — 供 RecipeLifecycleSupervisor / ProposalExecutor 使用
     */
    updateLifecycle(id: string, lifecycle: string): Promise<boolean>;
    /**
     * 更新 stats JSON 字段
     * ★ Drizzle 类型安全 UPDATE — 供 HitRecorder / RecipeLifecycleSupervisor 使用
     */
    updateStats(id: string, stats: Record<string, unknown>): Promise<boolean>;
    /**
     * 分页查询
     * @override
     */
    findWithPagination(filters?: KnowledgeFilters, options?: KnowledgePaginationOptions): Promise<{
        data: (KnowledgeEntry | null)[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            pages: number;
        };
    }>;
    /** 根据生命周期状态查询 */
    findByLifecycle(lifecycle: string, pagination?: KnowledgePaginationOptions): Promise<{
        data: (KnowledgeEntry | null)[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            pages: number;
        };
    }>;
    /** 根据 kind 查询 */
    findByKind(kind: string, options?: KnowledgePaginationOptions & {
        lifecycle?: string;
    }): Promise<{
        data: (KnowledgeEntry | null)[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            pages: number;
        };
    }>;
    /**
     * 查询所有 active 的 rule 类型（Guard 消费热路径）
     * ★ Drizzle 类型安全查询
     */
    findActiveRules(): Promise<(KnowledgeEntry | null)[]>;
    /**
     * Guard 专用：active 的 rule + boundary-constraint
     * ★ Phase 5b: supply guard.ts _loadRuleRecipes
     */
    findActiveGuardRecipes(): Promise<KnowledgeEntry[]>;
    /**
     * 按 source 字段查询 ID 列表
     * ★ Phase 5b: supply ai.ts mock cleanup
     */
    findIdsBySource(source: string): Promise<string[]>;
    /**
     * 统计指定 lifecycle 集合中的条目数量
     * ★ Phase 5b: supply recipes.ts pre-check
     */
    countByLifecycles(lifecycles: readonly string[]): Promise<number>;
    /**
     * 查询指定 lifecycle 集合中的所有条目（不分页）
     * ★ Phase 5c: supply Evolution domain services (ContradictionDetector, RedundancyAnalyzer, etc.)
     */
    findAllByLifecycles(lifecycles: readonly string[]): Promise<KnowledgeEntry[]>;
    /**
     * 查询指定 lifecycle + category 的条目（带 limit）
     * ★ Phase 5c: supply ConsolidationAdvisor category-filtered query
     */
    findAllByLifecyclesAndCategory(lifecycles: readonly string[], category: string, limit: number): Promise<KnowledgeEntry[]>;
    /**
     * 查询指定 lifecycle 中 trigger 匹配前缀且排除指定 category 的条目
     * ★ Phase 5c: supply ConsolidationAdvisor trigger-prefix fallback
     */
    findByLifecyclesAndTriggerPrefix(lifecycles: readonly string[], excludeCategory: string, triggerPrefix: string, limit: number): Promise<KnowledgeEntry[]>;
    /**
     * 按 lifecycle 分组统计全部条目数量
     * ★ Phase 5c: supply RecipeLifecycleSupervisor health summary
     */
    countGroupByLifecycle(): Promise<Record<string, number>>;
    /**
     * 反向查找 relations JSON 中包含指定 nodeId 的条目
     * ★ Phase 5b: supply structure.ts relation graph
     */
    findByRelationLike(nodeId: string, excludeId: string): Promise<Array<{
        id: string;
        title: string;
        relations: string;
    }>>;
    /** 根据语言查询 */
    findByLanguage(language: string, pagination?: KnowledgePaginationOptions): Promise<{
        data: (KnowledgeEntry | null)[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            pages: number;
        };
    }>;
    /** 根据分类查询 */
    findByCategory(category: string, pagination?: KnowledgePaginationOptions): Promise<{
        data: (KnowledgeEntry | null)[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            pages: number;
        };
    }>;
    /** 搜索 */
    search(keyword: string, pagination?: KnowledgePaginationOptions): Promise<{
        data: (KnowledgeEntry | null)[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            pages: number;
        };
    }>;
    /** 获取统计信息 */
    getStats(): Promise<unknown>;
    /**
     * Find all entries with non-empty reasoning (for SourceRefReconciler)
     * ★ Drizzle 类型安全 SELECT — 仅返回 id + reasoning
     */
    findAllIdAndReasoning(): Promise<Array<{
        id: string;
        reasoning: string;
    }>>;
    /**
     * Find sourceFile and reasoning for a single entry (for SourceRefReconciler.applyRepairs)
     * ★ Drizzle 类型安全 SELECT — 仅返回 sourceFile + reasoning
     */
    findSourceFileAndReasoning(id: string): Promise<{
        sourceFile: string | null;
        reasoning: string | null;
    } | null>;
    /**
     * Update reasoning JSON field directly (for SourceRefReconciler.applyRepairs)
     * ★ Drizzle 类型安全 UPDATE — 精确更新 reasoning + updatedAt
     */
    updateReasoning(id: string, reasoning: string, updatedAt: number): Promise<boolean>;
    /**
     * 获取活跃 Recipe 的元数据 (title, category, topicHint, kind)
     * 用于 DimensionAnalyzer 维度分类分析
     */
    findRecipeMetadata(lifecycles: readonly string[]): Promise<Array<{
        title: string;
        dimensionId: string;
        category: string;
        knowledgeType: string;
        topicHint: string;
        kind: string;
    }>>;
    /**
     * 按模块相关关键词搜索 Recipe (PanoramaService.#findModuleRecipes)
     * @param lifecycles - 活跃生命周期
     * @param moduleName - 模块名
     * @param categories - 角色关联的分类列表
     * @param limit - 结果上限
     */
    findModuleRecipes(lifecycles: readonly string[], moduleName: string, categories: string[], limit?: number): Promise<Array<{
        id: string;
        title: string;
        trigger: string;
        kind: string;
    }>>;
    /**
     * 统计 COUNTABLE_LIFECYCLES 范围内的知识条目数 (PanoramaAggregator.#getProjectRecipeCount)
     */
    countByCountableLifecycles(): Promise<number>;
    /**
     * Guard 规则查询 — kind='rule' OR knowledgeType='boundary-constraint' + lifecycle 过滤
     * (GuardCheckEngine._loadCustomRules)
     */
    findGuardRulesSync(lifecycles: readonly string[]): Array<{
        id: string;
        title: string;
        description: string | null;
        language: string;
        scope: string | null;
        constraints: string | null;
        lifecycle: string;
    }>;
    /**
     * Guard 命中次数递增 — stats.guardHits += count
     * (GuardCheckEngine._recordHits)
     */
    incrementGuardHitsSync(id: string, hits: number): void;
    /**
     * 活跃规则 + content 中的 coreCode / pattern 字段 + stats
     * 用于规则治理和迁移期审计查询。
     */
    findActiveRulesWithContentSync(): Array<{
        id: string;
        title: string;
        coreCode: string;
        guardPattern: string;
        stats: string | null;
    }>;
    /**
     * 获取单条记录的 guardHits 数
     * 用于 Guard 覆盖、衰退和治理统计。
     */
    getGuardHitsSync(id: string): number;
    /**
     * 活跃规则的 id + language (CoverageAnalyzer.#loadActiveRules) — sync
     */
    findActiveRuleIdsSync(): Array<{
        id: string;
        language: string;
    }>;
    /**
     * 活跃条目按 category 分布
     * 用于知识库分布统计。
     */
    countGroupByCategory(): Promise<Array<{
        category: string;
        cnt: number;
    }>>;
    /**
     * 活跃条目按 language 分布
     * 用于知识库分布统计。
     */
    countGroupByLanguage(): Promise<Array<{
        language: string;
        cnt: number;
    }>>;
    /**
     * 高使用率活跃 Recipe (adoptions + applications >= minUsage)
     * 用于知识库热度和治理统计。
     */
    findHotRecipesByUsage(minUsage: number, limit: number): Promise<Array<{
        title: string;
        category: string;
        totalUsage: number;
    }>>;
    /**
     * 全库生命周期统计 (total / pending / deprecated)
     * 用于知识库生命周期统计。
     */
    getLifecycleCounts(): Promise<{
        total: number;
        pending: number;
        deprecated: number;
    }>;
    /**
     * 活跃 Recipe 摘要信号。
     */
    findActiveRecipeSignals(limit: number): Promise<Array<{
        id: string;
        title: string;
        knowledgeType: string;
        category: string;
        language: string;
        adoptionCount: number;
        applicationCount: number;
        qualityOverall: number;
        updatedAt: number;
    }>>;
    /**
     * 待审核 Candidate 摘要。
     */
    findPendingCandidates(limit: number): Promise<Array<{
        id: string;
        source: string;
        status: string;
        language: string;
        category: string;
        title: string;
        createdAt: number;
    }>>;
    /** DB Row → KnowledgeEntry (camelCase 列名 = 属性名，直传) */
    _rowToEntity(row: Record<string, unknown>): KnowledgeEntry | null;
    /** KnowledgeEntry → DB Row (camelCase 列名 = 属性名，直传) */
    _entityToRow(e: KnowledgeEntry): {
        id: string;
        title: string;
        description: string;
        lifecycle: string;
        lifecycleHistory: string;
        autoApprovable: number;
        language: string;
        dimensionId: string;
        category: string;
        kind: string;
        knowledgeType: string;
        complexity: string;
        scope: string | null;
        difficulty: string | null;
        tags: string;
        trigger: string;
        topicHint: string;
        whenClause: string;
        doClause: string;
        dontClause: string;
        coreCode: string;
        content: string;
        relations: string;
        constraints: string;
        reasoning: string;
        quality: string;
        stats: string;
        headers: string;
        headerPaths: string;
        moduleName: string | null;
        includeHeaders: number;
        agentNotes: string | null;
        aiInsight: string | null;
        reviewedBy: string | null;
        reviewedAt: number | null;
        rejectionReason: string | null;
        source: string;
        sourceFile: string | null;
        sourceCandidateId: string | null;
        createdBy: string;
        createdAt: number;
        updatedAt: number;
        publishedAt: number | null;
        publishedBy: string | null;
        staging_deadline: number | null;
    };
    /** 查询所有非 deprecated 条目（buildIndex 用） */
    findNonDeprecatedSync(): {
        id: string;
        title: string;
        description: string | null;
        language: string;
        category: string;
        knowledgeType: string | null;
        kind: string | null;
        content: string | null;
        lifecycle: string;
        tags: string | null;
        trigger: string | null;
        difficulty: string | null;
        quality: string | null;
        stats: string | null;
        updatedAt: number;
        createdAt: number;
    }[];
    /** LIKE 关键词搜索（_keywordSearch 用） */
    keywordSearchSync(pattern: string, limit: number): {
        id: string;
        title: string;
        description: string | null;
        language: string;
        category: string;
        knowledgeType: string | null;
        kind: string | null;
        lifecycle: string;
        content: string | null;
        trigger: string | null;
        headers: string | null;
        moduleName: string | null;
    }[];
    /** 按 ID 列表查询详情（_supplementDetails 用） */
    findByIdsDetailSync(ids: string[]): {
        id: string;
        content: string | null;
        description: string | null;
        trigger: string | null;
        headers: string | null;
        moduleName: string | null;
        tags: string | null;
        language: string;
        category: string;
        updatedAt: number;
        createdAt: number;
        quality: string | null;
        stats: string | null;
        difficulty: string | null;
        whenClause: string | null;
        doClause: string | null;
    }[];
    /** 查询指定时间之后更新的条目（refreshIndex 用） */
    findUpdatedSinceSync(sinceIso: string): {
        id: string;
        title: string;
        description: string | null;
        language: string;
        category: string;
        knowledgeType: string | null;
        kind: string | null;
        content: string | null;
        lifecycle: string;
        tags: string | null;
        trigger: string | null;
        difficulty: string | null;
        quality: string | null;
        stats: string | null;
        updatedAt: number;
        createdAt: number;
    }[];
}
export default KnowledgeRepositoryImpl;
