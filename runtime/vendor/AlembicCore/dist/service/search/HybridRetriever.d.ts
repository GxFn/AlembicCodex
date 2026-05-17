/**
 * HybridRetriever — 统一混合检索 (RRF 融合)
 *
 * 使用 Reciprocal Rank Fusion (RRF) 融合 Dense + Sparse 搜索:
 *   score = Σ 1/(k + rank_i)
 *
 * RRF 优势:
 * - 不需要分数归一化 (不同检索器分数尺度无关)
 * - 对异常高分 (outlier) 不敏感
 * - 数学性质稳定 (有界, 单调)
 * - 已被 Elasticsearch, Weaviate, Qdrant 采用为默认融合策略
 *
 * @module service/search/HybridRetriever
 */
interface RetrievalResult {
    id?: string;
    item?: {
        id?: string;
    };
    score?: number;
    [key: string]: unknown;
}
export declare class HybridRetriever {
    #private;
    /**
     * @param [options.rrfK=60] RRF 常数 (k), 值越大越平滑
     * @param [options.alpha=0.5] Dense 权重 (1-alpha = Sparse 权重)
     */
    constructor(options?: {
        vectorStore?: {
            searchVector: (vector: number[], opts: {
                topK: number;
                filter?: unknown;
            }) => Promise<RetrievalResult[]>;
        } | null;
        rrfK?: number;
        alpha?: number;
    });
    /**
     * RRF 融合搜索
     *
     * Dense: vectorStore 向量搜索 (HNSW or brute-force)
     * Sparse: BM25 关键词搜索 (由外部传入结果)
     *
     * @param params.denseResults - 向量搜索结果
     * @param params.sparseResults - 关键词搜索结果
     * @param [params.alpha=0.5] Dense 权重
     * @returns >}
     */
    fuse({ denseResults, sparseResults, topK, alpha, }: {
        denseResults?: RetrievalResult[] | undefined;
        sparseResults?: RetrievalResult[] | undefined;
        topK?: number | undefined;
        alpha?: number | undefined;
    }): any[];
    /**
     * 完整搜索: 同时执行 Dense + Sparse 并融合
     *
     * @param query 查询文本
     * @param queryVector 查询向量
     * @param [options.sparseSearchFn] 外部 sparse 搜索函数 (query, limit) => results[]
     */
    search(query: string, queryVector: number[] | null, options?: {
        topK?: number;
        alpha?: number;
        filter?: unknown;
        sparseSearchFn?: ((query: string, limit: number) => RetrievalResult[]) | null;
    }): Promise<any[]>;
}
export {};
