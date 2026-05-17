/**
 * VectorMigration — JSON → HNSW 二进制索引自动迁移
 *
 * 场景:
 * 1. 首次启动, 无任何索引 → 返回 'new'
 * 2. 存在 vector_index.json → 读取 JSON, 批量插入 HNSW, 重命名旧文件
 * 3. 存在 .asvec 二进制索引 → 返回 'binary' (已迁移)
 *
 * @module infrastructure/vector/VectorMigration
 */
export declare class VectorMigration {
    /**
     * 检测并执行自动迁移
     *
     * @param indexDir 索引目录路径
     * @param adapter HNSW 适配器实例
     */
    static migrate(indexDir: string, adapter: {
        batchUpsert: (items: Array<{
            id: string;
            content: string;
            vector: number[];
            metadata: Record<string, unknown>;
        }>) => Promise<void>;
    }): Promise<"binary" | "new" | "migrated">;
    /** 检查是否需要迁移 */
    static needsMigration(indexDir: string): boolean;
}
