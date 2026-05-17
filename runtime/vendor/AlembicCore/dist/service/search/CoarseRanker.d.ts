/**
 * CoarseRanker — 粗排器
 * 多维加权排序（Recall + Semantic + Freshness + Popularity）
 * Quality 维度保留但默认权重 0 — 待场景化区分后按需启用
 */
interface RankerCandidate {
    recallScore?: number;
    score?: number;
    semanticScore?: number;
    title?: string;
    code?: string;
    content?: string;
    description?: string;
    summary?: string;
    category?: string;
    language?: string;
    tags?: string[];
    updatedAt?: number | string;
    lastModified?: number | string;
    createdAt?: number | string;
    usageCount?: number;
    [key: string]: unknown;
}
export declare class CoarseRanker {
    #private;
    constructor(options?: {
        recallWeight?: number;
        semanticWeight?: number;
        qualityWeight?: number;
        freshnessWeight?: number;
        popularityWeight?: number;
    });
    /**
     * 粗排
     * @param candidates 需有 recallScore、semanticScore 等字段
     * @returns sorted with coarseScore
     */
    rank(candidates: RankerCandidate[]): {
        coarseScore: number;
        coarseSignals: {
            recall: number;
            semantic: number;
            quality: number;
            freshness: number;
            popularity: number;
        };
        recallScore?: number;
        score?: number;
        semanticScore?: number;
        title?: string;
        code?: string;
        content?: string;
        description?: string;
        summary?: string;
        category?: string;
        language?: string;
        tags?: string[];
        updatedAt?: number | string;
        lastModified?: number | string;
        createdAt?: number | string;
        usageCount?: number;
    }[];
}
export {};
