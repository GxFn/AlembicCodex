/**
 * RedundancyAnalyzer — 多维冗余检测
 *
 * 从 CandidateAggregator 的标题 Jaccard 扩展到四维内容级相似度：
 *   维度 1: title Jaccard ≥ 0.7
 *   维度 2: doClause + dontClause 文本相似度 ≥ 0.6
 *   维度 3: coreCode 去空白后字符级相似度 ≥ 0.8
 *   维度 4: guard regex 完全相同
 *
 * 综合: weighted_sum(0.2*d1 + 0.3*d2 + 0.3*d3 + 0.2*d4) ≥ 0.65
 */
import type { ReportStore } from '../../infrastructure/report/ReportStore.js';
import type { SignalBus } from '../../infrastructure/signal/SignalBus.js';
import type KnowledgeRepositoryImpl from '../../repository/knowledge/KnowledgeRepository.impl.js';
export interface RedundancyResult {
    recipeA: string;
    recipeB: string;
    similarity: number;
    dimensions: {
        title: number;
        clause: number;
        code: number;
        content: number;
        guard: number;
    };
}
interface RecipeForRedundancy {
    id: string;
    title: string;
    doClause: string | null;
    dontClause: string | null;
    coreCode: string | null;
    guardPattern: string | null;
    content: {
        markdown?: string;
        pattern?: string;
        steps?: Array<{
            code?: string;
        }>;
    } | null;
}
export declare class RedundancyAnalyzer {
    #private;
    constructor(knowledgeRepo: KnowledgeRepositoryImpl, options?: {
        signalBus?: SignalBus;
        reportStore?: ReportStore;
    });
    /**
     * 分析所有 active/staging 条目之间的冗余
     */
    analyzeAll(): Promise<RedundancyResult[]>;
    /**
     * 分析两条 Recipe 的冗余度（委托 RecipeSimilarity 统一算法）
     */
    analyzePair(a: RecipeForRedundancy, b: RecipeForRedundancy): RedundancyResult | null;
}
export {};
