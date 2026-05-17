/**
 * HnswVectorAdapter — 基于 HNSW 的向量存储实现
 *
 * 实现 VectorStore 接口, 内部使用:
 * - HnswIndex: 纯 JS HNSW 近似最近邻索引
 * - ScalarQuantizer: SQ8 量化 (文档数 > threshold 时自动启用)
 * - BinaryPersistence: .asvec 二进制持久化
 *
 * 特点:
 * - O(log N) 搜索, 替代暴力 O(N)
 * - 75% 内存节省 (SQ8 量化)
 * - 异步 debounced 持久化
 * - 自动从 JSON 旧格式迁移
 *
 * @module infrastructure/vector/HnswVectorAdapter
 */
import type { WriteZone } from '../io/WriteZone.js';
import { VectorStore } from './VectorStore.js';
export declare class HnswVectorAdapter extends VectorStore {
    #private;
    /**
     * @param [options.quantize='auto'] 'auto' | 'sq8' | 'none'
     * @param [options.walEnabled=true] 启用 WAL 持久化
     */
    constructor(projectRoot: string, options?: {
        M?: number;
        efConstruct?: number;
        efSearch?: number;
        quantize?: string;
        quantizeThreshold?: number;
        indexDir?: string;
        flushIntervalMs?: number;
        flushBatchSize?: number;
        walEnabled?: boolean;
        writeZone?: WriteZone;
    });
    /**
     * 初始化: 加载已有索引或创建新索引
     * 自动检测 JSON 旧索引并迁移
     */
    init(): Promise<void>;
    /**
     * 同步初始化 (兼容 JsonVectorAdapter)
     * 注意: 同步路径无法执行 async 迁移, 但会尝试同步加载 JSON
     */
    initSync(): void;
    upsert(item: {
        id: string;
        content?: string;
        vector?: number[] | Float32Array;
        metadata?: Record<string, unknown>;
    }): Promise<void>;
    batchUpsert(items: Array<{
        id: string;
        content?: string;
        vector?: number[] | Float32Array;
        metadata?: Record<string, unknown>;
    }>): Promise<void>;
    remove(id: string): Promise<void>;
    getById(id: string): Promise<{
        id: string;
        content: any;
        vector: number[];
        metadata: any;
    } | null>;
    /**
     * 向量相似度搜索 — HNSW O(log N)
     *
     * 当量化器已训练时启用 2-pass 搜索:
     * - Pass 1 (粗排): SQ8 量化距离在 HNSW 图中遍历, 获取 efSearch 个候选
     * - Pass 2 (精排): Float32 精确余弦距离对候选重排, 返回 top-K
     */
    searchVector(queryVector: number[] | Float32Array, options?: {
        topK?: number;
        filter?: Record<string, unknown> | null;
        minScore?: number;
    }): Promise<{
        item: {
            id: string | undefined;
            content: any;
            vector: number[];
            metadata: any;
        };
        score: number;
    }[]>;
    /**
     * 混合搜索: HNSW 向量 + 关键词, 使用 RRF (Reciprocal Rank Fusion) 融合
     *
     * score = α × 1/(k+rank_dense) + (1-α) × 1/(k+rank_sparse)
     *
     * @deprecated 优先使用 VectorService.hybridSearch() → HybridRetriever.fuse()
     * 此方法保留作为 VectorStore 层的本地混合搜索能力
     */
    hybridSearch(queryVector: number[] | Float32Array | null, queryText: string, options?: {
        topK?: number;
        filter?: Record<string, unknown> | null;
        rrfK?: number;
        alpha?: number;
    }): Promise<{
        item: any;
        score: number;
        vectorScore: number;
        keywordScore: number;
    }[]>;
    /** query() — SearchEngine 使用的向量搜索别名 */
    query(queryVector: number[] | Float32Array, topK?: number): Promise<{
        id: string | undefined;
        similarity: number;
        score: number;
        content: any;
        metadata: any;
    }[]>;
    searchByFilter(filter: Record<string, unknown>): Promise<{
        id: string;
        content: string;
        metadata: Record<string, unknown>;
    }[]>;
    listIds(): Promise<any[]>;
    clear(): Promise<void>;
    getStats(): Promise<{
        count: number;
        indexSize: number;
        indexPath: string;
        hasVectors: number;
        hnswLevels: number;
        hnswEdges: number;
        quantized: boolean;
        dimension: number;
    }>;
    /** 手动触发持久化 (测试/关闭时使用) */
    flush(): Promise<void>;
    /** 销毁: 清理定时器 */
    destroy(): void;
}
