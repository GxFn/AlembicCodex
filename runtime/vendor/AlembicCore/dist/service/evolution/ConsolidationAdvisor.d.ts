/**
 * ConsolidationAdvisor — 提交前融合顾问
 *
 * 解决问题：Agent 逐条提交 Recipe 导致碎片化、低价值条目激增。
 *
 * 设计思路：在新知识提交前分析已有知识库，给出 4 种建议之一：
 *   create       — 独立有价值，正常新建（走正常可信度判断）
 *   merge        — 与 1 条 Recipe 相似，将候选内容合并到已有 Recipe，合并后 Recipe → staging
 *   reorganize   — 与多条 Recipe 交叉重叠，将候选功能拆分到已有 Recipe 上，被修改的 Recipe → staging
 *   insufficient — 独立价值不足且已有足够 Recipe 覆盖，交给 Agent 与开发者决定
 *
 * 分析维度：
 *   1. 结构相似度 — 复用 RedundancyAnalyzer 的 4 维算法
 *   2. 语义域覆盖 — category + trigger 是否落在已有 Recipe 管辖范围
 *   3. 独立价值   — 内容长度、具体性、是否有独立 coreCode
 */
import { type FieldAnalysis } from '../../domain/evolution/RecipeSimilarity.js';
import type KnowledgeRepositoryImpl from '../../repository/knowledge/KnowledgeRepository.impl.js';
/** 提交候选的必要字段 */
export interface CandidateForConsolidation {
    title: string;
    description?: string;
    doClause?: string;
    dontClause?: string;
    coreCode?: string;
    category?: string;
    trigger?: string;
    whenClause?: string;
    kind?: string;
    content?: {
        pattern?: string;
        markdown?: string;
        [key: string]: unknown;
    };
}
/** 建议类型 */
export type ConsolidationAction = 'create' | 'merge' | 'reorganize' | 'insufficient';
/** 融合方向分析 — 描述候选能为已有 Recipe 补充什么 */
export interface MergeDirection {
    /** 候选提供的新维度（已有 Recipe 缺失的） */
    addedDimensions: string[];
    /** 融合建议摘要 */
    summary: string;
}
/** 融合分析结果 */
export interface ConsolidationAdvice {
    action: ConsolidationAction;
    confidence: number;
    reason: string;
    /** action=merge 时，将候选内容合并到的目标 Recipe */
    targetRecipe?: {
        id: string;
        title: string;
        similarity: number;
    };
    /** action=merge 时，候选能为目标 Recipe 补充的新维度 */
    mergeDirection?: MergeDirection;
    /** action=reorganize 时，需要重新组织的 Recipe 列表 */
    reorganizeTargets?: {
        id: string;
        title: string;
        similarity: number;
    }[];
    /** action=insufficient 时，已覆盖该领域的 Recipe */
    coveredBy?: {
        id: string;
        title: string;
        similarity: number;
    }[];
    /** 需要 Agent 关注的上下文 */
    relatedRecipes?: {
        id: string;
        title: string;
        similarity: number;
    }[];
    /** Layer 1.5: 字段级分析结果（当相似度在 0.4-0.65 模糊区间时提供） */
    fieldAnalysis?: FieldAnalysis;
    /** Layer 1.5: 标记为需要语义复核（similarity 0.4-0.65 且字段分析不明确） */
    pendingSemanticReview?: boolean;
}
/** 批量分析结果 — 每个候选一条分析 + 批次内重叠检测 */
export interface BatchConsolidationResult {
    items: {
        index: number;
        advice: ConsolidationAdvice;
    }[];
    /** 批次内部候选之间的重叠 */
    internalOverlaps: {
        indexA: number;
        indexB: number;
        similarity: number;
    }[];
}
/** 从 DB 读取的 Recipe 简要信息（也可用于会话级缓存注入） */
export interface RecipeSummary {
    id: string;
    title: string;
    doClause: string | null;
    dontClause: string | null;
    coreCode: string | null;
    category: string | null;
    trigger: string | null;
    whenClause: string | null;
    guardPattern: string | null;
    content?: {
        markdown?: string;
        pattern?: string;
        steps?: Array<{
            code?: string;
        }>;
    } | null;
}
export declare class ConsolidationAdvisor {
    #private;
    constructor(knowledgeRepo: KnowledgeRepositoryImpl);
    /**
     * 分析候选知识与现有知识库的关系，返回融合建议。
     *
     * @param candidate - 待提交的候选数据
     * @param options - 可选参数
     *   - sessionRecipes: 会话级缓存的候选（解决 DB 写入延迟导致的盲区）
     * @returns ConsolidationAdvice — 建议 + 理由 + 上下文
     */
    analyze(candidate: CandidateForConsolidation, options?: {
        sessionRecipes?: RecipeSummary[];
    }): Promise<ConsolidationAdvice>;
    /**
     * 批量分析候选知识与现有知识库的关系。
     *
     * 除了对每个候选独立运行 analyze() 外，
     * 还检测批次内部候选之间的重叠（防止批量提交碎片化）。
     *
     * @param candidates - 待提交的候选数组
     * @returns BatchConsolidationResult — 每条分析 + 批次内重叠
     */
    analyzeBatch(candidates: CandidateForConsolidation[]): Promise<BatchConsolidationResult>;
}
