import { KnowledgeEntry, type KnowledgeEntryProps } from '../../domain/knowledge/KnowledgeEntry.js';
import type { KnowledgeRepository } from '../../domain/knowledge/KnowledgeRepository.js';
import Logger from '../../infrastructure/logging/Logger.js';
import type { KnowledgeFileWriter } from '../../service/knowledge/KnowledgeFileWriter.js';
import type { ConfidenceRouter } from './ConfidenceRouter.js';
import type { KnowledgeGraphService } from './KnowledgeGraphService.js';
interface AuditLoggerLike {
    log(entry: Record<string, unknown>): Promise<void>;
}
interface SkillHooksLike {
    run(hookName: string, ...args: unknown[]): Promise<{
        block?: boolean;
        reason?: string;
    } | undefined>;
}
interface QualityScorerLike {
    score(input: Record<string, unknown>): {
        score: number;
        dimensions: Record<string, number>;
        grade: string;
    };
}
interface EventBusLike {
    emit(event: string | symbol, ...args: unknown[]): boolean;
}
type AfterPublishHook = () => void | Promise<void>;
interface EdgeRepoLike {
    deleteOutgoing(fromId: string, fromType: string): Promise<number>;
    deleteByEntryId(entryId: string): Promise<number>;
}
interface ProposalRepoLike {
    deleteByTargetRecipeId(targetRecipeId: string): number;
}
interface KnowledgeServiceOptions {
    fileWriter?: KnowledgeFileWriter | null;
    skillHooks?: SkillHooksLike | null;
    confidenceRouter?: ConfidenceRouter | null;
    qualityScorer?: QualityScorerLike | null;
    eventBus?: EventBusLike | null;
    edgeRepo?: EdgeRepoLike | null;
    proposalRepo?: ProposalRepoLike | null;
    /** Core 不内置交付渠道，外层可注入发布后的交付/刷新 hook。 */
    afterPublish?: AfterPublishHook | null;
}
interface ServiceContext {
    userId: string;
}
interface ListFilters {
    lifecycle?: string;
    kind?: string;
    language?: string;
    dimensionId?: string;
    category?: string;
    knowledgeType?: string;
    source?: string;
    tag?: string;
    scope?: string;
}
interface PaginationOptions {
    page?: number;
    pageSize?: number;
}
/**
 * KnowledgeService — 统一知识服务
 *
 * 替代 CandidateService + RecipeService。
 * 全链路使用 KnowledgeEntry 实体 + wire format，
 * 无需 promote、无需 metadata 袋子、无需打平映射。
 *
 * 生命周期操作委托给 KnowledgeEntry 实体方法，
 * Service 负责编排 Repository / FileWriter / AuditLog / Graph / SkillHooks。
 */
export declare class KnowledgeService {
    _confidenceRouter: ConfidenceRouter | null;
    _edgeRepo: EdgeRepoLike | null;
    _eventBus: EventBusLike | null;
    _fileWriter: KnowledgeFileWriter | null;
    _knowledgeGraphService: KnowledgeGraphService | null;
    _proposalRepo: ProposalRepoLike | null;
    _qualityScorer: QualityScorerLike | null;
    _skillHooks: SkillHooksLike | null;
    _afterPublish: AfterPublishHook | null;
    auditLogger: AuditLoggerLike;
    gateway: unknown;
    logger: ReturnType<typeof Logger.getInstance>;
    repository: KnowledgeRepository;
    constructor(repository: KnowledgeRepository, auditLogger: AuditLoggerLike, gateway: unknown, knowledgeGraphService: KnowledgeGraphService | null, options?: KnowledgeServiceOptions);
    /**
     * 创建知识条目
     *
     * MCP 参数 = wire format → KnowledgeEntry.fromJSON() 直接构造。
     * 所有新条目初始状态为 pending（待审核）。
     * ConfidenceRouter 仅标记 auto_approvable 标志，不改变 lifecycle。
     *
     * @param data wire format 数据
     * @param context { userId }
     */
    create(data: KnowledgeEntryProps, context: ServiceContext): Promise<KnowledgeEntry>;
    /** 获取单个知识条目 */
    get(id: string): Promise<KnowledgeEntry>;
    /**
     * 更新知识条目（仅允许白名单字段）
     * @param data 部分字段（camelCase）
     * @param context { userId }
     */
    update(id: string, data: Partial<KnowledgeEntryProps>, context: ServiceContext): Promise<KnowledgeEntry>;
    /**
     * 删除知识条目
     * @param context { userId }
     * @returns >}
     */
    delete(id: string, context: ServiceContext): Promise<{
        success: boolean;
        id: string;
    }>;
    /** 发布 (pending → active) — 仅开发者可执行 */
    publish(id: string, context: ServiceContext): Promise<KnowledgeEntry>;
    /**
     * 触发外层发布后 hook（非阻塞、容错）。
     * Core 不依赖 Cursor Delivery / ServiceContainer，避免把交付渠道带入内核。
     */
    _triggerAfterPublishAsync(): void;
    /** 弃用 (pending|active → deprecated) */
    deprecate(id: string, reason: string, context: ServiceContext): Promise<KnowledgeEntry>;
    /** 重新激活 (deprecated|staging → pending) */
    reactivate(id: string, context: ServiceContext): Promise<KnowledgeEntry>;
    /** 进入暂存期 (pending → staging) */
    stage(id: string, context: ServiceContext): Promise<KnowledgeEntry>;
    /** 进入进化态 (active → evolving) */
    evolve(id: string, context: ServiceContext): Promise<KnowledgeEntry>;
    /** 进入衰退观察 (active|evolving → decaying) */
    decay(id: string, context: ServiceContext): Promise<KnowledgeEntry>;
    /** 恢复为已发布 (decaying|evolving → active) */
    restore(id: string, context: ServiceContext): Promise<KnowledgeEntry>;
    /** @deprecated 简化后所有条目直接进 pending */
    submit(id: string, _context: ServiceContext): Promise<KnowledgeEntry>;
    /** @deprecated 简化后 approve = publish */
    approve(id: string, context: ServiceContext): Promise<KnowledgeEntry>;
    /** @deprecated 简化后无需 autoApprove */
    autoApprove(id: string, _context: ServiceContext): Promise<KnowledgeEntry>;
    /** @deprecated 简化后 reject = deprecate */
    reject(id: string, reason: string, context: ServiceContext): Promise<KnowledgeEntry>;
    /** @deprecated 简化后 toDraft = reactivate */
    toDraft(id: string, context: ServiceContext): Promise<KnowledgeEntry>;
    /** @deprecated 简化后 fastTrack = publish */
    fastTrack(id: string, context: ServiceContext): Promise<KnowledgeEntry>;
    /**
     * 查询列表
     * @param filters { lifecycle, kind, language, dimensionId, category, knowledgeType, source, tag }
     * @param pagination { page, pageSize }
     */
    list(filters?: ListFilters, pagination?: PaginationOptions): Promise<import("../../domain/knowledge/KnowledgeRepository.js").PaginatedResult>;
    /** 按 Kind 查询 */
    listByKind(kind: string, pagination?: PaginationOptions): Promise<import("../../domain/knowledge/KnowledgeRepository.js").PaginatedResult>;
    /** 搜索 */
    search(keyword: string, pagination?: PaginationOptions): Promise<import("../../domain/knowledge/KnowledgeRepository.js").PaginatedResult>;
    /** 获取统计信息 */
    getStats(): Promise<Record<string, unknown>>;
    /**
     * 增加使用计数
     * @param [options] { actor, feedback }
     */
    incrementUsage(id: string, type?: string, options?: {
        actor?: string;
        feedback?: string;
    }): Promise<KnowledgeEntry>;
    /**
     * 更新质量评分
     * @param [context] { userId }
     */
    updateQuality(id: string, context?: Partial<ServiceContext>): Promise<{
        score: number;
        dimensions: Record<string, number>;
        grade: string;
    }>;
    /** 统一生命周期转换编排 */
    _lifecycleTransition(id: string, method: string, context: ServiceContext, options?: {
        entityArgs?: unknown[];
    }): Promise<KnowledgeEntry>;
    /** 查找或抛出 NotFoundError */
    _findOrThrow(id: string): Promise<KnowledgeEntry>;
    /** 验证创建输入 */
    _validateCreateInput(data: KnowledgeEntryProps): void;
    /**
     * 为 QualityScorer 适配输入
     * QualityScorer v2 needs: title, trigger, description, language, category,
     * doClause, dontClause, whenClause, coreCode, usageGuide,
     * contentMarkdown, contentRationale, reasoningWhyStandard, reasoningSources,
     * reasoningConfidence, source, headers, tags, views, clicks, rating
     */
    _adaptForScorer(entry: KnowledgeEntry): Record<string, unknown>;
    /**
     * 自动发现同 category/moduleName/tags 的已有条目并建立 'related' 边
     * @param id 新创建的条目 ID
     * @param entry 条目实体
     */
    _autoDiscoverRelations(id: string, entry: KnowledgeEntry): Promise<void>;
    /** 将 relations 同步到 knowledge_edges 表 */
    _syncRelationsToGraph(id: string, relations: unknown): void;
    /** 删除所有关联边 */
    _removeAllEdges(id: string): void;
    /** 删除关联的 evolution_proposals（target_recipe_id 无 CASCADE） */
    _removeRelatedProposals(id: string): void;
    /** 清除其他 entry 的 relations JSON 中对该 ID 的反向引用 */
    _removeReverseRelations(id: string): void;
    /** 落盘到 .md 文件 + 回写 sourceFile */
    _persistToFile(entry: KnowledgeEntry): void;
    /** 删除 .md 文件 */
    _removeFile(entry: KnowledgeEntry): void;
    _audit(action: string, id: string, actor: string, details?: Record<string, unknown> | string): Promise<void>;
}
export default KnowledgeService;
