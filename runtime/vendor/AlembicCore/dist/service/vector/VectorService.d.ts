/**
 * VectorService — 统一向量服务层
 *
 * 整合 IndexingPipeline、VectorStore、BatchEmbedder 等分散组件，
 * 提供统一的索引构建、查询、CRUD 同步、维护接口。
 *
 * 设计原则:
 *   1. 单一职责 — 统一管理向量生命周期（构建、更新、查询、维护）
 *   2. 事件驱动 — 知识 CRUD → EventBus → 增量同步
 *   3. 渐进增强 — 无 EmbedProvider 时 graceful degrade
 *   4. CLI-first  — `alembic embed` 与 API 同等一等公民
 *
 * @module service/vector/VectorService
 */
import type { DrizzleDB } from '../../infrastructure/database/drizzle/index.js';
import type { EventBus } from '../../infrastructure/event/EventBus.js';
import type { IndexingPipeline } from '../../infrastructure/vector/IndexingPipeline.js';
import type { VectorStore } from '../../infrastructure/vector/VectorStore.js';
import type { HybridRetriever } from '../search/HybridRetriever.js';
import type { VectorChunkEnricher } from './EnrichmentTypes.js';
export interface EmbedProvider {
    embed(texts: string | string[]): Promise<number[] | number[][]>;
}
export interface VectorServiceConfig {
    vectorStore: VectorStore;
    indexingPipeline: IndexingPipeline;
    hybridRetriever: HybridRetriever | null;
    eventBus: EventBus | null;
    embedProvider: EmbedProvider | null;
    contextualEnricher: VectorChunkEnricher | null;
    autoSyncOnCrud: boolean;
    syncDebounceMs: number;
    drizzle?: DrizzleDB;
}
export interface BuildResult {
    scanned: number;
    chunked: number;
    enriched: number;
    embedded: number;
    upserted: number;
    skipped: number;
    errors: number;
    duration: number;
}
export interface SyncResult {
    added: number;
    updated: number;
    removed: number;
    errors: string[];
}
export interface VectorStats {
    count: number;
    dimension: number;
    indexSize: number;
    quantized: boolean;
    embedProviderAvailable: boolean;
    autoSyncEnabled: boolean;
}
export interface ProgressInfo {
    phase: string;
    detail?: string;
    [key: string]: unknown;
}
export type ProgressFn = (info: ProgressInfo) => void;
export declare class VectorService {
    #private;
    constructor(config: VectorServiceConfig);
    /** 初始化: 绑定 EventBus 事件监听 */
    initialize(): Promise<void>;
    /**
     * 全量构建向量索引
     * 委托给 IndexingPipeline.run()，增加 enrichment 步骤和计时
     */
    fullBuild(opts?: {
        force?: boolean;
        clear?: boolean;
        dryRun?: boolean;
        onProgress?: ProgressFn;
    }): Promise<BuildResult>;
    /**
     * 增量更新: 只处理指定的变更文件
     * 适用于文件系统级变更（watch 或 git diff）
     */
    incrementalUpdate(changedFiles: string[], opts?: {
        onProgress?: ProgressFn;
    }): Promise<BuildResult>;
    /** 清空向量索引 */
    clear(): Promise<void>;
    /**
     * 校验向量索引健康状态
     * - 维度一致性
     * - 孤儿向量检查 (向量有但 DB 无对应 entry)
     * - Embed Provider 可用性
     */
    validate(): Promise<{
        healthy: boolean;
        issues: string[];
    }>;
    /**
     * 语义搜索
     * Embed query → vectorStore.searchVector → 返回结果
     */
    search(query: string, opts?: {
        topK?: number;
        filter?: Record<string, unknown>;
        minScore?: number;
    }): Promise<Array<{
        item: Record<string, unknown>;
        score: number;
    }>>;
    /**
     * 混合搜索 (Dense + Sparse RRF 融合)
     * 通过 HybridRetriever 执行向量 + BM25 关键词并行检索
     *
     * Embed 失败时优雅降级: 跳过 Dense 路, 仅用 Sparse 结果进行 RRF 融合,
     * 避免因网络问题导致整个搜索返回空结果。
     */
    hybridSearch(query: string, opts?: {
        topK?: number;
        alpha?: number;
        sparseSearchFn?: ((q: string, limit: number) => Array<{
            id: string;
            score?: number;
            [key: string]: unknown;
        }>) | null;
    }): Promise<Array<{
        id: string;
        score: number;
        [key: string]: unknown;
    }>>;
    /** 通过 ID 查找相似向量 */
    similarById(id: string, topK?: number): Promise<Array<{
        item: Record<string, unknown>;
        score: number;
    }>>;
    /**
     * 手动同步单个知识条目到向量索引
     * 用于 KnowledgeService CRUD 后的即时同步
     */
    syncEntry(entry: {
        id: string;
        title: string;
        content: unknown;
        kind?: string;
    }): Promise<void>;
    /** 从向量索引移除一个条目 */
    removeEntry(entryId: string): Promise<void>;
    /** 批量同步知识条目 */
    batchSync(entries: Array<{
        id: string;
        title: string;
        content: unknown;
        kind?: string;
    }>): Promise<SyncResult>;
    /** 获取向量索引统计信息 */
    getStats(): Promise<VectorStats>;
    /**
     * 迁移维度: 清空索引并使用新的 EmbedProvider 重建
     * 用于 embedding 模型切换场景
     */
    migrateDimension(newProvider: EmbedProvider, opts?: {
        onProgress?: ProgressFn;
    }): Promise<BuildResult>;
    /** 销毁: 清理 SyncCoordinator 的定时器和事件监听 */
    destroy(): void;
}
