/**
 * RecipeSimilarity — 统一 5 维相似度算法
 *
 * 从 ConsolidationAdvisor 与 RedundancyAnalyzer 中提取共享的相似度计算，
 * 消除两套独立实现的偏差（文档 §7.3.1）。
 *
 * 5 个维度及权重:
 *   title   (0.15) — 标题关键词 Jaccard
 *   clause  (0.25) — doClause + dontClause 关键词 Jaccard
 *   code    (0.15) — coreCode 去空白后 3-gram Jaccard（结构相似度）
 *   content (0.30) — 全字段代码标识符 token Jaccard（语义相似度）
 *   guard   (0.15) — guardPattern 精确匹配 (0 | 1)
 *
 * content 维度复用 shared/recipe-tokens 的 extractRecipeTokens()，
 * 从 coreCode + content.markdown 代码块 + content.pattern + content.steps
 * 提取 API 标识符，做 Jaccard 集合比对。
 *
 * 额外提供 Layer 1.5 字段级分析（文档 §7.4.3）：
 *   triggerConflict  — trigger 是否语义冲突
 *   doClauseSubset   — 候选 doClause 是否为已有 Recipe 的子集
 *   coreCodeOverlap  — 共享代码模式比率 (0-1)
 *   categoryMatch    — 同 category
 *
 * @module domain/evolution/RecipeSimilarity
 */
/** 参与相似度计算的最小字段集 */
export interface RecipeLike {
    title: string;
    doClause?: string | null;
    dontClause?: string | null;
    coreCode?: string | null;
    category?: string | null;
    trigger?: string | null;
    guardPattern?: string | null;
    content?: {
        markdown?: string | null;
        pattern?: string | null;
        steps?: Array<{
            code?: string;
        }>;
    } | null;
}
/** 5 维分解得分 */
export interface SimilarityDimensions {
    title: number;
    clause: number;
    code: number;
    content: number;
    guard: number;
}
/** Layer 1.5 字段级分析结果（文档 §7.4.3） */
export interface FieldAnalysis {
    triggerConflict: boolean;
    doClauseSubset: boolean;
    coreCodeOverlap: number;
    categoryMatch: boolean;
}
export declare const WEIGHTS: {
    readonly title: 0.15;
    readonly clause: 0.25;
    readonly code: 0.15;
    readonly content: 0.3;
    readonly guard: 0.15;
};
export declare class RecipeSimilarity {
    #private;
    /**
     * 计算两条 Recipe（或候选）之间的 5 维加权相似度 (0-1)
     */
    static compute(a: RecipeLike, b: RecipeLike): number;
    /**
     * 计算各维度分解得分（不加权），供 RedundancyResult 等展示用
     */
    static computeDimensions(a: RecipeLike, b: RecipeLike): SimilarityDimensions;
    /**
     * Layer 1.5 字段级语义分析（文档 §7.4.3）
     *
     * 用于 ConsolidationAdvisor 在 0.4-0.65 模糊区间做更精确判断：
     *   - triggerConflict: 同命名空间下 trigger 冲突
     *   - doClauseSubset: 候选 doClause 是否为已有 Recipe 的子集
     *   - coreCodeOverlap: coreCode 共享模式比率
     *   - categoryMatch: 同 category
     */
    static analyzeFields(candidate: RecipeLike, existing: RecipeLike): FieldAnalysis;
    /** 提取主题词（过滤停用词和短词） */
    static extractTopicWords(text: string): Set<string>;
    /** 维度 1: 标题关键词 Jaccard */
    static titleJaccard(titleA: string, titleB: string): number;
    /** 维度 2: doClause + dontClause 关键词 Jaccard */
    static clauseJaccard(clausesA: (string | null | undefined)[], clausesB: (string | null | undefined)[]): number;
    /** 维度 3: coreCode 去空白后 3-gram Jaccard */
    static codeSimilarity(codeA: string | null, codeB: string | null): number;
    /** 维度 4: guardPattern 精确匹配 */
    static guardMatch(patternA: string | null, patternB: string | null): number;
    /**
     * 维度 5: 全字段代码标识符 token Jaccard（语义相似度）
     *
     * 使用 shared/recipe-tokens.extractRecipeTokens() 从两条 Recipe 的
     * coreCode + content.markdown 代码块 + content.pattern + content.steps
     * 提取 API 标识符集合，计算 Jaccard 相似度。
     *
     * 与 codeSimilarity（3-gram 结构比对）互补：
     *   - codeSimilarity 捕获字符级排列顺序
     *   - contentTokenSimilarity 捕获语义级 API 标识符重叠
     */
    static contentTokenSimilarity(a: RecipeLike, b: RecipeLike): number;
}
