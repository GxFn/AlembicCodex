/**
 * SearchEngine - 统一搜索引擎
 *
 * 三级搜索策略: keyword → FieldWeighted ranking → semantic(可选)
 * 从 V1 SearchServiceV2 迁移，适配 V2 架构
 */
import Logger from '../../infrastructure/logging/Logger.js';
import { CoarseRanker } from './CoarseRanker.js';
import { MultiSignalRanker } from './MultiSignalRanker.js';
import type { DbRow, RankingContext, Scorer, SearchAiProvider, SearchCrossEncoder, SearchDb, SearchEngineOptions, SearchHybridRetriever, SearchOptions, SearchResponse, SearchResultItem, SearchVectorService, SearchVectorStore } from './SearchTypes.js';
export { BM25Scorer } from './BM25Scorer.js';
export { FieldWeightedScorer } from './FieldWeightedScorer.js';
export type { BM25DocMeta, DbRow, DocMeta, RankingContext, RrfHit, Scorer, ScorerResult, SearchAiProvider, SearchCrossEncoder, SearchDb, SearchEngineOptions, SearchHybridRetriever, SearchOptions, SearchResponse, SearchResultItem, SearchVectorService, SearchVectorStore, SlimSearchResult, VectorHit, } from './SearchTypes.js';
export { groupByKind, slimSearchResult } from './SearchTypes.js';
export { tokenize } from './tokenizer.js';
/**
 * SearchEngine - 完整搜索服务
 * 整合召回评分 + 关键词 + 可选 AI 增强
 */
export declare class SearchEngine {
    #private;
    _cache: Map<string, {
        data: SearchResponse;
        time: number;
    }>;
    _cacheMaxAge: number;
    _coarseRanker: CoarseRanker;
    _crossEncoder: SearchCrossEncoder | null;
    _fusionRecallWeight: number;
    _fusionSemanticWeight: number;
    _indexed: boolean;
    _lastIndexTime: string | null;
    _multiSignalRanker: MultiSignalRanker;
    _signalBus: import('../../infrastructure/signal/SignalBus.js').SignalBus | null;
    aiProvider: SearchAiProvider | null;
    db: SearchDb;
    hybridRetriever: SearchHybridRetriever | null;
    logger: ReturnType<typeof Logger.getInstance>;
    scorer: Scorer;
    vectorService: SearchVectorService | null;
    vectorStore: SearchVectorStore | null;
    constructor(db: SearchDb & {
        getDb?: () => SearchDb;
    }, options?: SearchEngineOptions);
    /** 构建搜索索引 - 从数据库加载所有可搜索实体 */
    buildIndex(): void;
    /** 确保索引已构建（幂等），supply 给需要准确 stats 的调用方 */
    ensureIndex(): void;
    /**
     * 统一搜索入口
     * @param query 搜索关键词
     * @param options {type, limit, mode, useAI}
     */
    search(query: string, options?: SearchOptions): Promise<SearchResponse>;
    /**
     * 统一排序管线:
     *   规范化 → [CrossEncoder 语义重排] → CoarseRanker (E-E-A-T 5维)
     *   → MultiSignalRanker (6信号) → 上下文加成
     *
     * CrossEncoder 仅在构造时传入 crossEncoderReranker 且 AI 可用时生效，
     * 否则自动跳过（零额外开销）。
     */
    _applyRanking(items: SearchResultItem[], query: string, context?: RankingContext): Promise<{
        recallScore: number;
        score: number;
        id: string;
        title?: string;
        description?: string;
        trigger?: string;
        type?: string;
        kind?: string;
        status?: string;
        language?: string;
        dimensionId?: string;
        category?: string;
        content?: string;
        code?: string;
        headers?: string;
        moduleName?: string;
        knowledgeType?: string;
        qualityScore?: number;
        usageCount?: number;
        authorityScore?: number;
        tags?: string[] | string;
        difficulty?: string;
        updatedAt?: string | null;
        createdAt?: string | null;
        whenClause?: string;
        doClause?: string;
        rankerScore?: number;
        coarseScore?: number;
        contextScore?: number;
    }[]>;
    /**
     * 将召回结果转换为 Ranker 所需格式（解析 content JSON、映射信号字段）
     * 保留原始 content 供下游消费者使用
     */
    _normalizeForRanking(items: SearchResultItem[]): SearchResultItem[];
    /**
     * 关键词搜索 - 直接 SQL LIKE
     * 返回包含 kind 字段的完整结果，使用 ESCAPE 防止通配符注入
     * 当 SQL LIKE 无结果时，降级到 FieldWeighted 搜索以提升自然语言查询的召回率
     */
    _keywordSearch(query: string, type: string, limit: number): SearchResultItem[];
    /**
     * 加权字段搜索（FieldWeightedScorer）
     * 增加 Title/Trigger 精确匹配 bonus — 当 query 出现在标题/触发词中时
     * 给予额外分数加成，确保精确匹配的条目排名靠前
     */
    _scorerSearch(query: string, type: string, limit: number): SearchResultItem[];
    /**
     * 语义搜索 - 需要 AI Provider 的 embed 功能
     * 不可用时降级到 FieldWeighted 搜索
     * @returns >}
     */
    _semanticSearch(query: string, type: string, limit: number): Promise<{
        items: SearchResultItem[];
        actualMode: string;
    }>;
    /**
     * 补充详细字段（content / description / trigger / delivery 字段）— 批量 IN 查询
     * 用于向量搜索结果与 FieldWeighted 结果的一致性
     */
    _supplementDetails(items: SearchResultItem[]): void;
    /**
     * 刷新索引（增量模式）
     *
     * 策略:
     *  1. 如果尚未构建索引 → 全量 buildIndex()
     *  2. 否则只加载 updatedAt > lastIndexTime 的条目 + 已删除(deprecated)条目
     *     - 新增/更新 → scorer.updateDocument()
     *     - 已删除    → scorer.removeDocument()
     *  3. 清空缓存以确保搜索结果刷新
     *
     * @param [opts] - force=true 强制全量重建
     */
    refreshIndex(opts?: {
        force?: boolean;
    }): void;
    /**
     * 从 DB 行构建索引文本
     *
     * 高价值字段（title, trigger）通过重复出现提升 TF 权重
     * — title ×3, trigger ×2, description ×1.5（通过重复 token 实现）
     * 这确保标题匹配的文档获得显著更高的分数
     * 注：此逻辑主要服务于 BM25Scorer，FieldWeightedScorer 内部已有字段权重机制
     */
    _buildDocText(r: DbRow): string;
    /**
     * 从 DB 行构建文档 meta
     */
    _buildDocMeta(r: DbRow): {
        type: string;
        title: string | undefined;
        trigger: string;
        description: string;
        contentText: string;
        status: string | undefined;
        knowledgeType: string | undefined;
        kind: string;
        language: string;
        dimensionId: string;
        category: string;
        updatedAt: string | null;
        createdAt: string | null;
        difficulty: string;
        tags: string[];
        usageCount: number;
        authorityScore: number;
        qualityScore: number;
    };
    /** 获取索引统计（如果尚未构建索引，自动触发构建） */
    getStats(): {
        indexed: boolean;
        totalDocuments: number;
        avgDocLength: number;
        cacheSize: number;
        uniqueTokens: number;
        hasVectorStore: boolean;
        hasVectorService: boolean;
        hasAiProvider: boolean;
    };
    _getCache(key: string): SearchResponse | null;
    _setCache(key: string, data: SearchResponse): void;
}
export default SearchEngine;
