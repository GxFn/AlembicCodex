/**
 * JsonVectorAdapter — 基于 JSON 文件的向量存储实现
 * 适用于中小规模（<10K 文档），无外部依赖
 * 支持余弦相似度搜索、混合搜索（向量 70% + 关键词 30%）
 */
import type { WriteZone } from '../io/WriteZone.js';
import { VectorStore } from './VectorStore.js';
export declare class JsonVectorAdapter extends VectorStore {
    #private;
    constructor(projectRoot: string, options?: {
        contextDir?: string;
        indexPath?: string;
        writeZone?: WriteZone;
    });
    init(): Promise<void>;
    /**
     * 同步初始化 — 供 ServiceContainer 懒加载工厂使用
     * （#load 本身就是同步的 readFileSync，无需 await）
     */
    initSync(): void;
    upsert(item: {
        id: string;
        content?: string;
        vector?: number[];
        metadata?: Record<string, unknown>;
    }): Promise<void>;
    batchUpsert(items: Array<{
        id: string;
        content?: string;
        vector?: number[];
        metadata?: Record<string, unknown>;
    }>): Promise<void>;
    remove(id: string): Promise<void>;
    getById(id: string): Promise<any>;
    /** 向量相似度搜索（余弦相似度） */
    searchVector(queryVector: number[], options?: {
        topK?: number;
        filter?: Record<string, unknown> | null;
        minScore?: number;
    }): Promise<{
        item: any;
        score: number;
    }[]>;
    /** 混合搜索：向量 70% + 关键词 30% */
    hybridSearch(queryVector: number[], queryText: string, options?: {
        topK?: number;
        filter?: Record<string, unknown> | null;
    }): Promise<{
        item: any;
        score: number;
        vectorScore: number;
        keywordScore: number;
    }[]>;
    /**
     * query() — SearchEngine 使用的向量搜索别名
     * 接口: query(vector, topK) → Array<{ id, similarity, metadata }>
     */
    query(queryVector: number[], topK?: number): Promise<{
        id: any;
        similarity: number;
        score: number;
        content: any;
        metadata: any;
    }[]>;
    searchByFilter(filter: Record<string, unknown>): Promise<{
        [key: string]: unknown;
        metadata?: Record<string, unknown>;
    }[]>;
    listIds(): Promise<any[]>;
    clear(): Promise<void>;
    getStats(): Promise<{
        count: number;
        indexSize: number;
        indexPath: string;
        hasVectors: number;
    }>;
}
