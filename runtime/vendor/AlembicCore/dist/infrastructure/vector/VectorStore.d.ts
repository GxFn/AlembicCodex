/**
 * VectorStore — 向量存储抽象层
 * 定义向量存储的标准接口，支持 JSON/Milvus 等后端
 */
export declare class VectorStore {
    /** 初始化存储 */
    init(): Promise<void>;
    /**
     * 插入或更新文档
     * @param item
     */
    upsert(item: {
        id: string;
        content: string;
        vector: number[];
        metadata: Record<string, unknown>;
    }): Promise<void>;
    /** 批量 upsert */
    batchUpsert(items: Array<{
        id: string;
        content: string;
        vector: number[];
        metadata: Record<string, unknown>;
    }>): Promise<void>;
    /** 删除文档 */
    remove(id: string): Promise<void>;
    /** 按 ID 获取 */
    getById(id: string): Promise<Record<string, unknown> | null>;
    /**
     * 向量相似度搜索
     * @param options { topK, filter, minScore }
     * @returns >>}
     */
    searchVector(queryVector: number[], options?: Record<string, unknown>): Promise<Array<{
        item: Record<string, unknown>;
        score: number;
    }>>;
    /**
     * 按过滤条件搜索
     * @param filter { type, category, language, tags, ... }
     */
    searchByFilter(filter: Record<string, unknown>): Promise<Record<string, unknown>[]>;
    /** 列出所有 ID */
    listIds(): Promise<string[]>;
    /** 清空存储 */
    clear(): Promise<void>;
    /**
     * 获取统计信息
     * @returns >}
     */
    getStats(): Promise<{
        count: number;
        indexSize: number;
    }>;
    /**
     * 销毁: 释放资源, 清理定时器等
     * 子类可选实现; 默认无操作
     */
    destroy(): void;
}
