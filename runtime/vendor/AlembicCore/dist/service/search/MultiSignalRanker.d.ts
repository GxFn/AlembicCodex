/**
 * MultiSignalRanker — 6 信号加权排序
 * Signals: relevance, authority, recency, popularity, difficulty, contextMatch
 * 不同场景使用不同权重配置（向后兼容旧配置中的 'seasonality' 键）
 */
interface SignalCandidate {
    recallScore?: number;
    score?: number;
    title?: string;
    trigger?: string;
    content?: string;
    code?: string;
    qualityScore?: number;
    authorityScore?: number;
    usageCount?: number;
    updatedAt?: number | string;
    lastModified?: number | string;
    createdAt?: number | string;
    difficulty?: string;
    language?: string;
    category?: string;
    tags?: string[];
    [key: string]: unknown;
}
interface SignalContext {
    query?: string;
    scenario?: string;
    intent?: string;
    language?: string;
    category?: string;
    userLevel?: string;
    tags?: string[];
    [key: string]: unknown;
}
/** 相关性信号 — BM25 + 标题匹配 + 内容匹配 */
export declare class RelevanceSignal {
    compute(candidate: SignalCandidate, context: SignalContext): number;
}
/** 权威性信号 — 基于质量评分、使用次数、作者 */
export declare class AuthoritySignal {
    compute(candidate: SignalCandidate): number;
}
/** 时间衰减信号 */
export declare class RecencySignal {
    compute(candidate: SignalCandidate): number;
}
/**
 * 流行度信号 — 基于使用频次的对数缩放
 * usageCount 1 → 0.10, 10 → 0.37, 100 → 0.67, 1000+ → 1.0
 */
export declare class PopularitySignal {
    compute(candidate: SignalCandidate): number;
}
/** 难度信号 — 用于学习场景的难度匹配 */
export declare class DifficultySignal {
    compute(candidate: SignalCandidate, context: SignalContext): number;
}
/**
 * 上下文匹配信号 — 语言/类别/标签与搜索上下文的匹配度
 * (原 SeasonalitySignal，重命名以准确反映实际语义)
 */
export declare class ContextMatchSignal {
    compute(candidate: SignalCandidate, context: SignalContext): number;
}
/**
 * 向量相似度信号 — 利用 VectorService 附加的 vectorScore
 * 当向量服务不可用时, vectorScore 为 0, 信号返回 0（权重自然归零）
 */
export declare class VectorSignal {
    compute(candidate: SignalCandidate, _context: SignalContext): number;
}
/** MultiSignalRanker — 多信号排序引擎 */
export declare class MultiSignalRanker {
    #private;
    constructor(options?: {
        scenarioWeights?: Record<string, Record<string, number>>;
        signalBus?: import('../../infrastructure/signal/SignalBus.js').SignalBus;
    });
    /**
     * 对候选列表进行多信号加权排序
     * @param context { query, scenario, language, userLevel, ... }
     * @returns sorted candidates with rankerScore
     */
    rank(candidates: SignalCandidate[], context?: SignalContext): {
        rankerScore: number;
        signals: Record<string, number>;
        recallScore?: number;
        score?: number;
        title?: string;
        trigger?: string;
        content?: string;
        code?: string;
        qualityScore?: number;
        authorityScore?: number;
        usageCount?: number;
        updatedAt?: number | string;
        lastModified?: number | string;
        createdAt?: number | string;
        difficulty?: string;
        language?: string;
        category?: string;
        tags?: string[];
    }[];
}
export {};
