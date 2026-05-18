/**
 * RecipeProductionGateway — 统一 Recipe 生产入口
 *
 * 所有 Recipe 创建（Agent Tool / MCP / Host Agent / Batch Import）
 * 通过此 Gateway 的统一管道，保证前置校验一致：
 *
 *   1. Schema Validation (UnifiedValidator)
 *   2. Similarity Check — 去重检测（可选跳过）
 *   3. Consolidation Scan — 融合/重组建议（可选）
 *   4. KnowledgeService.create() — 包含 ConfidenceRouter → staging / pending
 *   5. Quality Scoring — 质量评分
 *   6. Supersede Proposal — 创建替代提案
 *   7. Audit — 统一审计
 */
import { type GatewaySource } from '../../shared/source-contracts.js';
import type { BootstrapDedup } from '../bootstrap/BootstrapDedup.js';
/** Lightweight log interface — avoids importing static-only Logger class. */
interface GatewayLogger {
    info(msg: string): void;
    warn(msg: string): void;
}
export type { GatewaySource } from '../../shared/source-contracts.js';
export { getGatewaySourceLabel, getGatewaySourceUserId, normalizeGatewaySource, } from '../../shared/source-contracts.js';
export interface CreateRecipeItem {
    title?: string;
    description?: string;
    content?: {
        markdown?: string;
        pattern?: string;
        rationale?: string;
        [key: string]: unknown;
    };
    trigger?: string;
    kind?: string;
    topicHint?: string;
    whenClause?: string;
    doClause?: string;
    dontClause?: string;
    coreCode?: string;
    sourceRefs?: string[];
    tags?: string[];
    reasoning?: {
        whyStandard?: string;
        sources?: string[];
        confidence?: number;
    };
    headers?: string[];
    usageGuide?: string;
    scope?: string;
    complexity?: string;
    sourceFile?: string;
    dimensionId?: string;
    knowledgeType?: string;
    language?: string;
    category?: string;
    source?: string;
    [key: string]: unknown;
}
export interface CreateRecipeRequest {
    source: GatewaySource;
    items: CreateRecipeItem[];
    options?: {
        /** 跳过相似度检测（仅 batch-import 可用） */
        skipSimilarityCheck?: boolean;
        /** 跳过 ConsolidationAdvisor 分析 */
        skipConsolidation?: boolean;
        /** 被替代的旧 Recipe ID */
        supersedes?: string;
        /** 相似度阈值，默认 0.7 */
        similarityThreshold?: number;
        /** 已提交标题集（批量去重用） */
        existingTitles?: Set<string>;
        /** 已提交 trigger 集（批量/会话去重用） */
        existingTriggers?: Set<string>;
        /** 已提交指纹集（批量去重用） */
        existingFingerprints?: Set<string>;
        /** UnifiedValidator 跳过系统注入字段列表 */
        systemInjectedFields?: string[];
        /** 跳过唯一性校验 */
        skipUniqueness?: boolean;
        /** 操作用户 ID */
        userId?: string;
        /** Bootstrap 会话级去重缓存（冷启动跨维度去重） */
        bootstrapDedup?: BootstrapDedup;
    };
}
export interface CreatedRecipeInfo {
    id: string;
    title: string;
    lifecycle: string;
    /** Raw saved entry from KnowledgeService.create() */
    raw: Record<string, unknown>;
}
export interface RejectedRecipeInfo {
    index: number;
    title: string;
    reason: string;
    errors: string[];
    warnings: string[];
}
export interface MergedRecipeInfo {
    index: number;
    proposalId: string;
    type: string;
    targetRecipeId: string;
    targetTitle: string;
    status: string;
    expiresAt: number;
    message: string;
}
export interface BlockedRecipeInfo {
    index: number;
    title: string;
    consolidation: unknown;
}
export interface SimilarRecipeInfo {
    index: number;
    title: string;
    similarTo: {
        file: string;
        title: string;
        similarity: number;
    }[];
}
export interface CreateRecipeResult {
    created: CreatedRecipeInfo[];
    rejected: RejectedRecipeInfo[];
    merged: MergedRecipeInfo[];
    blocked: BlockedRecipeInfo[];
    duplicates: SimilarRecipeInfo[];
    supersedeProposal: {
        proposalId: string;
    } | null;
    /** Layer 1.5: 需要语义复核的条目（similarity 0.4-0.65 且字段分析不明确） */
    pendingSemanticReview?: Array<{
        index: number;
        title: string;
        relatedRecipe?: {
            id: string;
            title: string;
            similarity: number;
        };
        reason: string;
    }>;
}
interface GatewayKnowledgeService {
    create(data: Record<string, unknown>, context: {
        userId: string;
    }): Promise<{
        id: string;
        title: string;
        lifecycle: string;
        kind?: string;
        [key: string]: unknown;
    }>;
    updateQuality(id: string, context: {
        userId: string;
    }): Promise<unknown>;
}
interface GatewayConsolidationAdvisor {
    analyzeBatch(candidates: Array<{
        title: string;
        category?: string;
        [key: string]: unknown;
    }>): Promise<{
        items: Array<{
            index: number;
            advice: {
                action: string;
                confidence: number;
                reason: string;
                targetRecipe?: {
                    id: string;
                    title: string;
                    similarity: number;
                };
                reorganizeTargets?: {
                    id: string;
                    title: string;
                    similarity: number;
                }[];
                coveredBy?: {
                    id: string;
                    title: string;
                    similarity: number;
                }[];
                mergeDirection?: {
                    addedDimensions: string[];
                    summary: string;
                };
                pendingSemanticReview?: boolean;
            };
        }>;
        internalOverlaps: Array<{
            indexA: number;
            indexB: number;
            similarity: number;
        }>;
    }>;
}
interface GatewayProposalRepository {
    create(data: Record<string, unknown>): {
        id: string;
        status: string;
        expiresAt: number;
        [key: string]: unknown;
    } | null;
}
/** EvolutionGateway — 统一进化决策提交接口 */
interface GatewayEvolutionGateway {
    submit(decision: {
        recipeId: string;
        action: 'update' | 'deprecate' | 'valid';
        source: string;
        confidence: number;
        description?: string;
        evidence?: Record<string, unknown>[];
        replacedByRecipeId?: string;
    }): Promise<{
        recipeId: string;
        action: string;
        outcome: string;
        proposalId?: string;
        error?: string;
    }>;
}
type GatewaySimilarityFn = (projectRoot: string, candidate: {
    title: string;
    summary: string;
    code: string;
}, opts: {
    threshold: number;
    topK: number;
}) => {
    file: string;
    title: string;
    similarity: number;
}[];
export interface GatewayDeps {
    knowledgeService: GatewayKnowledgeService;
    projectRoot: string;
    logger?: GatewayLogger;
    /** ConsolidationAdvisor（可选 — MCP 路径使用） */
    consolidationAdvisor?: GatewayConsolidationAdvisor | null;
    /** ProposalRepository（可选 — 仅用于检查已有提案等直接操作） */
    proposalRepository?: GatewayProposalRepository | null;
    /** EvolutionGateway（可选 — 优先通过 Gateway 创建进化提案） */
    evolutionGateway?: GatewayEvolutionGateway | null;
    /** 相似度检测函数（可选 — 默认导入 SimilarityService） */
    findSimilarRecipes?: GatewaySimilarityFn | null;
}
export declare class RecipeProductionGateway {
    #private;
    constructor(deps: GatewayDeps);
    /**
     * 统一创建入口
     *
     * Pipeline:
     *   1. Schema Validation (UnifiedValidator)
     *   2. Similarity Check (除非 skipSimilarityCheck)
     *   3. Consolidation Scan (除非 skipConsolidation)
     *   4. KnowledgeService.create() — ConfidenceRouter → staging / pending
     *   5. Quality Scoring
     *   6. Supersede Proposal 创建 (if supersedes)
     */
    create(request: CreateRecipeRequest): Promise<CreateRecipeResult>;
}
